angular.module('firstlife.controllers')
    .controller('TimelineCtrl', ['$scope', '$rootScope', '$window', '$location', '$filter', 'myConfig', 'MapService', function($scope, $rootScope, $window, $location, $filter, myConfig, MapService) {

        $scope.config = myConfig;

        
        var levels = {check:false};
        if (myConfig.map.area.levels){
            levels = {check:true};
            levels.list = $scope.config.map.area.levels;
            levels.mapName = $scope.config.map.area.levels.map(function(e){return e.name});
            levels.mapKey = $scope.config.map.area.levels.map(function(e){return e.key});
            levels.current = 0;
        }
        $scope.timelineGroups = levels;

        var consoleCheck = false;

        if(!$scope.time)
            $scope.time={from: new Date(), to: new Date() };

        $scope.time.from.setHours(0,0,0,0);
        $scope.time.to.setHours(23,59,59,999);

        $scope.helloWorld = function(){if(consoleCheck) console.log("Hello Pinch!");}

        if(consoleCheck) console.log("TimelineCtrl, time from e to ",$scope.time);

        //setup del box delle timelines

        $scope.timeline ={start: $scope.time.from, end: $scope.time.to};
        $scope.options = {
            locale : $rootScope.currentLang,
            showNavigation :false, 
            // un anno nella scrollbar
            zoomMax:315360000000,
            // un'ora nella timeline
            zoomMin:3600000,
            zoomable: true,
            editable: false,
            showCustomTime: false,
            width:'100%',
            height:'50px',
            cluster: true,
            //stackEvents: true,
            start:$scope.time.from,
            end:$scope.time.to,
            autoScale:true,
            groupsOnRight: true,
            groupsOrder: function (a,b){
                var indexA = levels.mapName.indexOf(a);
                var indexB = levels.mapName.indexOf(b);
                console.log("develop ",indexA,indexB,levels.list,a,b);
                if(indexA < indexB) return 1;
                if(indexA == indexB) return 0;
                return -1;
            }
        };

        // todo autocomplete con i risultati della ricerca?
        // gestione della ricerca
        var timelineSetTimeout;
        var SEARCH_DELAY = $scope.config.behaviour.searchend_delay;

        $scope.focus = false;


        /*
         * Listners
         * 1) al cambio dell'intervallo di tempo indicato dalla timeline
         * 2) focus sulla mappa: chiudo la timeline
         * 3) resize della finestra: redraw della timeline
         */
        $scope.$watch(
            function(){ return $scope.timeline.end; }, 
            function(e, old){
                if(consoleCheck) console.log("SearchCtrl, old: ",old, " new: ",e);

                if( e && old != e){
                    if (SEARCH_DELAY > 0) {
                        if (timelineSetTimeout) {
                            //if(consoleCheck) console.log("clearTimeout");
                            clearTimeout(timelineSetTimeout);
                        }
                        timelineSetTimeout = setTimeout(
                            function(){
                                if(consoleCheck) console.log("TimelineCtrl, cambio parametri from e to",e);
                                $scope.time.from = $scope.timeline.start;
                                $scope.time.to = $scope.timeline.end;
                                if(consoleCheck) console.log("TimelineCtrl, cambio paramentri tempo e reset bbox ",$scope.time);
                                applyTimeFilters($scope.time);
                            }, SEARCH_DELAY);
                    } 
                    else {
                        checkQuery(e);
                    } 
                }

            });
        // listner dell'evento selezionato
        $scope.selected = {};
        $scope.$on('timeline.select', function(event, args) {
            $scope.$emit("clickMarker",{id:args.event.id});
        });
        // listner click su group nella timeline
        $scope.$on('timeline.groups.click', function(event, args) {
            var level = levels.mapName.indexOf(args.group);
            if(level > -1)
                $scope.$emit("switchMapLevel",{level:level});
        });
        $scope.$on('timeline.groups.setgroup', function(event,args){
            if(args.group != levels.current)
                $scope.timelineGroups.current = args.group;
        });
        
//        // listner focus sulla mappa
//        $scope.$on('leafletDirectiveMap.mymap.drag', function(event, args) {
//            //if(consoleCheck) console.log("TimelineCtrl, leafletDirectiveMap.mymap.focus");
//            // nascondo la timeline
//            $scope.timelineVisible = false;
//        });
//        // listner focus sulla mappa
//        $scope.$on('leafletDirectiveMap.mymap.moveend', function(event, args) {
//            //if(consoleCheck) console.log("TimelineCtrl, leafletDirectiveMap.mymap.focus");
//            // nascondo la timeline
//            $scope.timelineVisible = true;
//            $scope.timeline.redraw();
//        });
//        $scope.$on('leafletDirectiveMap.mymap.click', function(event, args) {
//            //if(consoleCheck) console.log("TimelineCtrl, leafletDirectiveMap.mymap.click");
//            // nascondo la timeline
//            $scope.timelineVisible = false;
//        });

        // controlla il cambio di dimensione della finestra
        $scope.$watch(function(){
            return $window.innerWidth;
        }, function(value) {
            if(consoleCheck) console.log("TimelineCtrl, $window resize ",value,$scope.timeline);
            // se timeline e' stato inizializzato fai il redraw
            if($scope.timeline && $scope.timeline.redraw)$scope.timeline.redraw();
        });

        //listner cambio dei markers
        $scope.$on('timeline.refresh', function(event, args) {
            if(consoleCheck) console.log("TimelineCtrl, timeline.refresh", args);
            // nascondo la timeline
            updateTimeline(args.list);
            event.preventDefault();
        });

        // fine listners

        /*
         * Funzioni pubbliche
         * 1) toggleTimeline: mostro o nascondo la timeline
         */
        if(!$scope.timelineVisible) //init flag di visibilita' se non settato
            $scope.timelineVisible = true;
        $scope.toggleTimeline = function(){
            if(consoleCheck) console.log("TimelineCtrl, toggleTimeline ",!($scope.timelineVisible));
            $scope.timelineVisible = !($scope.timelineVisible);
            //if($scope.timeline && $scope.timeline.redraw)$scope.timeline.redraw();
        }

        $scope.$watch('timelineVisible',function(e,o){
            if(e && e != o){
                console.log("redraw!");
                $scope.timeline.redraw();
            }
        });


        /*
         * Filtri
         */

        // filtro "diverso da" di per la modal del place
        $scope.notEmpty = function(prop){
            return function(item){
                if(item[prop] && item[prop] != '')
                    return true;
                return false;
            }
        };



        /*
         * Funzioni private
         * 1) applyTimeFilters: applica il nuovo intervallo temporale alla bbox
         */


        function applyTimeFilters(time){
            MapService.setTimeFilters(time);
            $scope.$emit("timeUpdate");
            //MapService.resetMarkersDistributed();
        }

        $scope.timelineData = [];
        function updateTimeline(list){
            if(consoleCheck) console.log("updateTimeline init ",list);
            var bounds = {};
            MapService.getMapBounds().then(
                function(response){
                    bounds = response;
                    // filtro per bbox
                    $scope.timelineData = filterObjects(list,boundsFiltering,'eTimeline');
                    //                    var dataBuffer = $filter('filter')(list,boundsFiltering);
                    //                    for(var k in dataBuffer){
                    //                        var event = dataBuffer[k].eTimeline;
                    //                        if(event){
                    //                            $scope.timelineData.push(event);
                    //                            if(consoleCheck) console.log("updateTimeline add ",event);
                    //                        }
                    //                    }
                    //                    // rimuovo le cose fuori bbox e filtri
                    //                    for(var k in $scope.timelineData){
                    //                        var event = $scope.timelineData[k];
                    //                        if(consoleCheck) console.log("updateTimeline remove check",event);
                    //                        if(!dataBuffer[event.id]){
                    //                            if(consoleCheck) console.log("updateTimeline remove ",event);
                    //                            delete timelineData[k];
                    //                        }
                    //                    }
                    if(consoleCheck) console.log("updateTimeline risultato",$scope.timelineData);
                },
                function(err){console.log("TimelineCtrl, updateTimeline, MapService.getMapBounds, error", err);}
            );
            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                if(consoleCheck) console.log("MapCtrl, boundsFiltering, val ",val," contains ",bounds.contains([val.lat,val.lng]));
                return bounds.contains([val.lat,val.lng]);
            }
            function filterObjects(list,func,prop){
                var results = [];
                for(var k in list){
                    if(list[k] && list[k][prop] && func(list[k]))
                        results.push(list[k][prop]);
                    
                }
                return results;
            }
        }


    }]);
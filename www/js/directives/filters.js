angular.module('firstlife.directives')
    .directive('categoryFilters',['$log','$filter','myConfig', function ($log,$filter,myConfig) {
        return {
            restrict: 'E',
            templateUrl: '/templates/map-ui-template/treeMap.html',
            scope: {
                markers:"=array",
                toggleCat:"=toggle",
                filters:"=",
                changeFavCat:"=",
                favCat:"="
            },
            link: function (scope, element) {

                var backHeight = 47; //pixels
                scope.$on('$destroy',function(){delete scope;});

                scope.colors = myConfig.design.colors;

                scope.cats = [];
                var firstLevel = [];
                for (var i in scope.filters) {
                    if(i != 'entity_type'){
                        firstLevel.push(scope.filters[i].list.length);
                        scope.cats.push(scope.filters[i]);  
                    }
                }

                scope.$watch(function() {
                    return element[0].clientWidth;
                }, function(value,old){
                    initTree(element[0].getBoundingClientRect());
                });

                function initTree(rect){
                    scope.size = rect;
                    var boxes = Treemap.generate(firstLevel,rect.width,rect.height);
                    //$log.debug(scope.cats,boxes);
                    for(var i = 0; i < boxes.length; i++){
                        scope.cats[i].rect = toPer(boxes[i]);
                        //$log.debug(scope.cats[i],boxes[i]);
                        scope.cats[i].toggle = false;
                    }
                    for (var i = 0 ; i < scope.cats.length; i++) {
                        var cats = scope.cats[i].list;
                        var buff = [];
                        for(var j = 0; j < cats.length; j++){
                            buff[j] = 1;
                        }
                        var boxes2 = Treemap.generate(buff,rect.width,rect.height-backHeight);
                        for(var k = 0; k < boxes2.length; k++){
                            scope.cats[i].list[k].rect = toPer(boxes2[k]);
                        }
                    }
                    $log.log('treemap ',scope.cats,scope.filters)
                }

                scope.back = false;
                scope.toggle = function(space){
                    if(scope.back == space.category_space){
                        scope.back = false;
                    }else{
                        scope.back = space.category_space;
                        scope.label = space.name;
                    }
                }
                scope.close = function(){
                    scope.back = false;
                    return false;
                }
                scope.catToggle = function(cat){
                    $log.debug('cat toggle!',cat);
                }
                function toPer(rect){
                    //$log.debug(rect,scope.size);
                    // x,y,width,height

                    var x = (rect[0]/scope.size.width)*100;
                    var y = (rect[1]/scope.size.height)*100;
                    var width = ((rect[2]-rect[0])/scope.size.width)*100;
                    var height = (((rect[3]-rect[1])/scope.size.height)*100);
                    var r = [x.toString().concat('%'),
                             y.toString().concat('%'),
                             width.toString().concat('%'),
                             height.toString().concat('%')];
                    return r;
                }

            }
        };
    }]).directive('entityFilter',['$log','myConfig', function ($log,myConfig) {
    return {
        restrict: 'EG',
        templateUrl: '/templates/map-ui-template/entityTypeFilter.html',
        scope: {
            toggle:"=",
            filter:"="
        },
        link: function (scope, element) {
            scope.$on('$destroy',function(){delete scope;});
            //$log.debug("check entityFilter ",scope.filter.list,scope.toggle);
        }
    }
}]).directive('searchBar',['$log','$location','myConfig', 'SearchService', 'CBuffer', function ($log, $location, myConfig, SearchService, CBuffer){
    return {
        restrinct:'EG',
        templateUrl:'/templates/map-ui-template/searchBar.html',
        scope:{},
        link: function (scope, element) {
            scope.$on('$destroy',function(){delete scope;});
            var dev = myConfig.dev;
            // visualizzazione web o mobile?
            if(!scope.isMobile) scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());

            var searchendSetTimeout;
            var SEARCH_DELAY = myConfig.behaviour.searchend_delay;
            var text_limit = 3;

            // gestione buffer cache di ricerca
            var buffer_size = 20;
            bufferSearch = new CBuffer(buffer_size);
            bufferSearch.overflow = function(data) {
                //console.log("Buffer overflow: ",data);
            };
            scope.visible = false;
            scope.locations = [];
            scope.query = '';
            scope.card = false;

            // toggle search bar and delete query
            scope.toggleSearchBar = function (){
                // if closing
                $log.debug('visible?',scope.visible)
                if(scope.visible){
                    setTagCard();
                    scope.visible = false;
                }else if(!scope.visible && scope.card) {
                    scope.card = false;
                    setTimeout(function () {scope.$apply(function () {
                        scope.visible = true;
                    })}, 750);
                }else{
                    scope.visible = true;
                }
            }

            // delete query
            scope.deleteSearch = function (){
                // clear query
                scope.query = '';
                scope.card = false;
            }

            // close the search bar
            function setTagCard (){
                // hide results
                emptyResults();
                setTimeout(function () {scope.$apply(function () {
                    scope.card = true;
                })}, 750);
            }

            function emptyResults(){
                scope.results = false;
                setTimeout(function(){scope.locations = [];},500);
            }

            // listner sul campo input
            scope.search = function(){
                checkQuery(scope.query);
            }


            function checkQuery(e){
                // controlla lo stradario
                SearchService.geocoding(e).then(
                    function(response){
                        console.log("SearchCtrl, watch query, SearchService.geocoding, response: ",response);
                        scope.locations = response;
                        scope.results = true;
                        if(scope.query != '')
                            pushCache(scope.query);
                    },
                    function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
                );

            }

            // aggiunge una ricerca nei buffer di ricerca
            function pushCache(query){
                if(!query){
                    return
                }

                $log.debug('pushCache', query)
                var entry = angular.copy(query);
                if(bufferSearch.toArray().indexOf(query) < 0)
                    bufferSearch.push(entry);
            }
        }
    }
}]);
angular.module('firstlife.directives')
    .directive('categoryFilters',['$log','$filter','myConfig', 'ThingsService', function ($log,$filter,myConfig, ThingsService) {
        return {
            restrict: 'E',
            templateUrl: '/templates/map-ui-template/treeMap.html',
            scope: {
                toggleCat:"&toggle",
                changeFavCat:"&"
            },
            link: function (scope, element) {

                var backHeight = 47; //pixels
                scope.$on('$destroy',function(){delete scope;});

                scope.colors = myConfig.design.colors;
                scope.toggled = {};
                var firstLevel = [];
                initFilter();

                initTree(element[0].getBoundingClientRect());

                // scope.$watch(function() {
                //     return element[0].clientWidth;
                // }, function(value,old){
                //     initTree(element[0].getBoundingClientRect());
                // });

                function initTree(rect){
                    scope.size = rect;
                    var boxes = Treemap.generate(firstLevel,rect.width,rect.height);
                    for(var i = 0; i < boxes.length; i++){
                        scope.cats[i].rect = toPer(boxes[i]);
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
                }

                scope.back = false;
                scope.toggle = function(space){
                    if(scope.back == space.category_space){
                        scope.back = false;
                    }else{
                        scope.back = space.category_space;
                        scope.label = space.name;
                    }
                };
                // chiudo la sezione
                scope.close = function(){
                    scope.back = false;
                    return false;
                };
                // toggle categoria
                scope.catToggle = function(cat,key){
                    // toggle della categoria
                    scope.toggled[cat][key] = !scope.toggled[cat][key];
                    // toggle del filtro
                    scope.toggleCat({cat:cat,key:key});
                };
                //
                scope.iconToggle = function(id){
                    // toggle dell'icona e assegno il nuovo valor
                    scope.favCat = scope.changeFavCat({id:id});
                }

                function toPer(rect){
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

                //
                function initFilter() {
                    // recupero i filtri definiti
                    scope.filters = angular.extend({},ThingsService.getFilter());
                    // recupero l'icona corrente
                    scope.favCat = ThingsService.setIcon();
                    // init della struttura dati
                    scope.cats = [];
                    firstLevel = [];
                    for (var i in scope.filters) {
                        var filter = angular.copy(scope.filters[i]);
                        if(filter.category_space){
                            var mask = filter.list.reduce(function(mask, cat){
                                mask[cat.id] = cat.visible;
                                return mask;
                            },{});
                            // aggiungo maschera toggle (visibilita')
                            scope.toggled[filter.label] = mask;
                            firstLevel.push(filter.list.length);
                            scope.cats.push(filter);
                        }
                    }
                }

            }
        };
    }]).directive('entityFilter',['$log','myConfig','ThingsService', 'PlatformService', function ($log,myConfig,ThingsService, PlatformService) {
    return {
        restrict: 'EG',
        templateUrl: '/templates/wall/entityTypeFilter.html',
        scope: {},
        link: function (scope, element, attr) {
            scope.$on('$destroy',function(event){
                if(event.defaultPrevented)
                    return;
                event.preventDefault();

                delete scope;
            });
            //$log.debug("check entityFilter ",scope.filter.list,scope.toggle);
            scope.filter = ThingsService.getFilter('entity_type');
            scope.colors = myConfig.design.colors;
            scope.types = myConfig.types.list;

            scope.isMobile = PlatformService.isMobile();
            scope.toggle = function (key) {
                // $log.debug('toggle filter entity_type',key);
                ThingsService.toggleFilter('entity_type',key);
                scope.$emit('toggleFilter');
            }
        }
    }
}]).directive('searchBar',['$log','$location', '$stateParams', '$window', '$timeout', '$ionicSideMenuDelegate','myConfig', 'SearchService', 'CBuffer', 'ThingsService',function ($log, $location, $stateParams, $window, $timeout, $ionicSideMenuDelegate, myConfig, SearchService, CBuffer, ThingsService){
    return {
        restrinct:'EG',
        templateUrl:'/templates/map-ui-template/searchBar.html',
        link: function (scope, element, attr) {
            scope.$on('$destroy',function(event){
                if(event.defaultPrevented)
                    return;
                event.preventDefault();
                delete scope;
            });

            scope.$on('newSearchParam',function(e,params){
                if(e.defaultPrevented)
                    return;
                e.preventDefault();

                var q = params.q;
                // $log.debug('searchBar, nuovo parametro q ',q);
                // imposto il campo di ricerca
                scope.query = params.q;
                scope.card = true;
            })

            var dev = myConfig.dev;
            // visualizzazione web o mobile?
            if(!scope.isMobile) scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());

            // gestione buffer cache di ricerca
            var buffer_size = 20;
            bufferSearch = new CBuffer(buffer_size);
            bufferSearch.overflow = function(data) {
            };
            scope.visible = false;
            scope.query = '';
            scope.card = false;


            // controllo l'esistenza del campo q all'init
            var params = $location.search();
            if(params.q){
                // imposto il campo di ricerca
                scope.query = params.q;
                // imposto la card
                scope.card = true;
                // imposto il parametro di ricerca
                ThingsService.setQuery(params.q);
            }

            // apro il wall per la modifica del testo
            scope.toggleWall =function(){
                $ionicSideMenuDelegate.toggleLeft();
            };

            scope.deleteCard = function(){
                scope.card = false;
                // richiedo update mappa
                scope.$emit('handleUpdateQ',{q:null});
                // avviso chiusura card
                scope.$emit('closeSearchCard');
            };
        }
    }
}])
    .directive('geocodingBar',['$log','$location', '$window','myConfig', 'SearchService', 'CBuffer', function ($log, $location, $window, myConfig, SearchService, CBuffer){
        return {
            restrinct:'EG',
            templateUrl:'/templates/map-ui-template/geocodingbar.html',
            scope:{
                locate:'&'
            },
            link: function (scope, element, attr) {
                // pulisco all'uscita
                scope.$on('$destroy',function(){delete scope;});


                var dev = myConfig.dev;
                // visualizzazione web o mobile?
                if(!scope.isMobile) scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());

                // gestione buffer cache di ricerca, disabilitata
                // var buffer_size = 20;
                // bufferSearch = new CBuffer(buffer_size);
                // bufferSearch.overflow = function(data) {
                //console.log("Buffer overflow: ",data);
                // };

                // listner di ricerca per modalità desktop
                var limit = myConfig.behaviour.query_limit;
                var searchendSetTimeout;
                var SEARCH_DELAY = myConfig.behaviour.searchend_delay;
                var text_limit = 3;
                // al cambio della query
                if(!scope.isMobile){ // se non mobile
                    scope.$watch('query', function(e, old){
                        if(e && old != e && e.length > limit){
                            if (SEARCH_DELAY > 0) {
                                if (searchendSetTimeout) {
                                    clearTimeout(searchendSetTimeout);
                                }
                                searchendSetTimeout = setTimeout(
                                    function(){
                                        $log.debug("cerco ",scope.query);
                                        checkQuery(e);
                                    }, SEARCH_DELAY);
                            }
                            else {
                                checkQuery(e);
                            }
                        }
                    });
                }

                scope.visible = false;
                scope.locations = [];
                scope.query = '';
                scope.card = false;

                // reset della barra
                function resetBar(){
                    scope.deleteSearch();
                }

                // delete query
                scope.deleteSearch = function(){
                    // clear query
                    scope.query = '';
                    scope.locations = [];
                }

                function emptyResults(){
                    scope.results = false;
                    setTimeout(function(){scope.locations = [];},500);
                }

                // listner sul campo input
                scope.search = function(){
                    checkQuery(scope.query);
                };


                // lancio la funzione definita di localizzazione
                scope.clickOnResult = function (entry){
                    scope.locate({'location': entry.position});
                };

                // lancio la ricerca
                function checkQuery(e){
                    // controlla lo stradario
                    SearchService.geocoding(e).then(
                        function(response){
                            scope.locations = response.slice();
                            scope.results = true;
                            // buffer di ricerca disabilitato
                            // if(scope.query != '')
                            // pushCache(scope.query);
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

                // funzione locale di ricerca, alternativa a quella fornita
                //                scope.locate = function(r){
                //                    $location.search('q',null);
                //                    $location.search('lat',r.lat);
                //                    $location.search('lng',r.lng);
                //                    $location.search('zoom',myConfig.map.zoom_create);
                //                }

            }
        }
    }]);
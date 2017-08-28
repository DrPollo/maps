angular.module('firstlife.directives')
    .directive('categoryFilters',['$log','$filter','myConfig', 'ThingsService', function ($log,$filter,myConfig, ThingsService) {
        return {
            restrict: 'E',
            templateUrl: '/templates/map-ui-template/treeMap.html',
            scope: {},
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
                scope.toggleCat = function(cat,key){
                    // toggle della categoria
                    scope.toggled[cat][key] = !scope.toggled[cat][key];
                    // toggle del filtro
                    ThingsService.toggleFilter(cat, key);
                    scope.$emit('toggleFilter');
                };
                //
                scope.iconToggle = function(id){
                    // toggle dell'icona e assegno il nuovo valore
                    scope.favCat = ThingsService.setIcon(id);
                    // aggiorno i marker
                    scope.$emit('toggleFilter');
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
    }]).directive('entityFilter',['$log','$location','myConfig','ThingsService', 'PlatformService', function ($log,$location,myConfig,ThingsService, PlatformService) {
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

            //init filtri in url
            var types = $location.search().excluded;
            // $log.debug('types ',types);
            if(types){
                var disabled = types.split(',');
                // $log.debug('selected ',disabled);
                disabled.map(function (type) {
                    //set filter
                    // $log.debug('init types, excluding',type);
                    try{
                        ThingsService.toggleFilter('entity_type',type);
                    }catch(e){
                        $location.search('excluded',null);
                    }
                });
            }else {
                $location.search('excluded',null);
            }

            scope.toggle = function (key) {
                // $log.debug('toggle filter entity_type',key);
                ThingsService.toggleFilter('entity_type',key);
                scope.$emit('toggleFilter');
                // genero hash dei tipi disabilitati
                $log.debug(scope.filter.list);
                var hash = scope.filter.list.reduce(function (result,e) {
                    // $log.debug(result,e);
                    if(!e.visible) {
                        result.push(e.key);
                    }
                    return result;
                },[]).join(',');
                // $log.debug('hash',hash);
                $location.search('excluded',hash||null);
            }
        }
    }
}]).directive('searchBar',['$log','$location', '$stateParams', '$window', '$timeout', 'myConfig', 'SearchService', 'CBuffer', 'ThingsService',function ($log, $location, $stateParams, $window, $timeout, myConfig, SearchService, CBuffer, ThingsService){
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
                // if(e.defaultPrevented)
                //     return;
                // e.preventDefault();

                var q = params.q;
                $log.debug('searchBar, nuovo parametro q ',q);
                // imposto il campo di ricerca
                scope.query = params.q;
                scope.card = true;
            });

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
                scope.$emit('toggleSideLeft');
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
}]).directive('geocodingBar',['$log','$location', '$window','myConfig', 'SearchService', 'CBuffer', function ($log, $location, $window, myConfig, SearchService, CBuffer){
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
                scope.results = false;
                scope.visible = false;
                scope.locations = [];
                scope.entries = [];
                scope.initiatives = [];
                scope.tags = [];
                scope.query = '';
                scope.card = false;
                scope.editMode = false;
                scope.$on('enterEditMode',function () {
                    scope.editMode = true;
                });
                scope.$on('exitEditMode',function () {
                    scope.editMode = false;
                });

                // reset della barra
                function resetBar(){
                    scope.deleteSearch();
                }

                // delete query
                scope.deleteSearch = function(){
                    // clear query
                    scope.query = '';
                    scope.locations = [];
                    scope.entries = [];
                    scope.tags = [];
                    scope.initiatives = [];
                }

                function emptyResults(){
                    setTimeout(function(){
                        scope.results = false;
                        scope.locations = [];
                        scope.entries = [];
                        scope.initiatives = [];
                        scope.tags = [];
                        },250);
                }

                // listner sul campo input
                scope.search = function(){
                    checkQuery(scope.query);
                };


                scope.loadCache = function () {
                  scope.results = true;
                };

                // lancio la funzione definita di localizzazione
                scope.clickOnResult = function (entry){
                    if(entry.type === 'location'){
                        scope.results = false;
                        scope.locate({'location': entry.position});
                        // emptyResults();
                    } else if(entry.type === 'thing'){
                        scope.results = false;
                        scope.$emit('wallClick', entry);
                        // emptyResults();
                    } else if(entry.type === 'initiative'){
                        scope.results = false;
                        // emptyResults();
                        $location.search('initiative',initiative.id);
                        scope.$emit('showInitiative',{initiative:{id : entry.id, name:entry.name}});
                    } else {
                        scope.results = false;
                        // emptyResults();
                        scope.$emit('handleUpdateQ',{q:entry.name});
                    }

                };

                // lancio la ricerca
                function checkQuery(e){
                    scope.results = false;
                    scope.entries = [];
                    scope.tags = [];
                    scope.initiatives = [];
                    scope.locations = [];
                    if (searchendSetTimeout) {
                        clearTimeout(searchendSetTimeout);
                    }
                    SearchService.tagQuery(e).then(
                        function(response){
                            // $log.debug(response);
                            scope.tags = response;
                            scope.results = true;
                            // buffer di ricerca disabilitato
                            // if(scope.query != '')
                            // pushCache(scope.query);
                        },
                        function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
                    );
                    SearchService.thingQuery(e).then(
                        function(response){
                            // $log.debug(response);
                            scope.entries = response;
                            scope.results = true;
                            // buffer di ricerca disabilitato
                            // if(scope.query != '')
                            // pushCache(scope.query);
                        },
                        function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
                    );
                    SearchService.initiativeQuery(e).then(
                        function(response){
                            // $log.debug(response);
                            scope.initiatives = response;
                            scope.results = true;
                            // buffer di ricerca disabilitato
                            // if(scope.query != '')
                            // pushCache(scope.query);
                        },
                        function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
                    );
                    // controlla lo stradario
                    SearchService.geocoding(e).then(
                        function(response){
                            // $log.debug(response);
                            scope.locations = response;
                            scope.results = true;
                            // buffer di ricerca disabilitato
                            // if(scope.query != '')
                            // pushCache(scope.query);
                        },
                        function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
                    );
                    // $log.log(scope.entries);
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
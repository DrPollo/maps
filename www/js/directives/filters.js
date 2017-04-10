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
    }]).directive('entityFilter',['$log','myConfig','ThingsService', function ($log,myConfig,ThingsService) {
    return {
        restrict: 'EG',
        templateUrl: '/templates/map-ui-template/entityTypeFilter.html',
        scope: {
            toggle:"="
        },
        link: function (scope, element, attr) {
            scope.$on('$destroy',function(){delete scope;});
            //$log.debug("check entityFilter ",scope.filter.list,scope.toggle);
            scope.filter = ThingsService.getFilter('entity_type');
            scope.colors = myConfig.design.colors;
            scope.types = myConfig.types.list;
        }
    }
}]).directive('searchBar',['$log','$location', '$stateParams', '$window','myConfig', 'SearchService', 'CBuffer', 'AuthService', 'entityFactory', function ($log, $location, $stateParams, $window, myConfig, SearchService, CBuffer, AuthService, entityFactory){
    return {
        restrinct:'EG',
        templateUrl:'/templates/map-ui-template/searchBar.html',
        link: function (scope, element, attr) {
            scope.$on('$destroy',function(){delete scope;});

            scope.$on('newSearchParam',function(e,params){
                $log.debug('newSearchParam',e)

                var q = params.q;
                $log.debug('searchBar, nuovo parametro q ',q)
                // imposto il campo di ricerca
                scope.query = params.q;
                // // barra chiusa
                // scope.visible = false;
                // // imposto la card
                // scope.card = true;
            })

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
            scope.query = '';
            scope.card = false;


            // controllo l'esistenza del campo q all'init
            var params = $location.search();
            if(params.q){
                // imposto il campo di ricerca
                scope.query = params.q;
                // imposto la card
                scope.card = true;
            }
            // toggle search bar and delete query
            scope.toggleSearchBar = function (){
                // if closing
                if(scope.visible){
                    // chiudo la barra
                    scope.visible = false;
                }else if(!scope.visible && scope.card) { // se la card e' aperta
                    // search bar nascosta
                    scope.card = false;
                    // nascondo la card e apro la search bar
                    setTimeout(function () {scope.$apply(function () {
                        // searchbar visibile
                        scope.visible = true;
                        // segnalo l'apertura della barra nello scope locale
                        // usata per l'autofocus del campo input di ricerca
                        scope.$broadcast('isOpen');
                    })}, 750);
                }else{
                    // searchbar visibile
                    scope.visible = true;
                    // segnalo l'apertura della barra nello scope locale
                    // usata per l'autofocus del campo input di ricerca
                    scope.$broadcast('isOpen');
                }
                $log.debug('visible?',scope.visible)
            }

            scope.deleteCard = function(){
                setTimeout(function () {scope.$apply(function () {
                    scope.card = false;
                    $location.search('q', null);
                })}, 0);
            }

            // check to close
            scope.checkToClose = function(){
                if (scope.query.length == 0)
                    scope.visible = false;
            }

            // reset della barra
            function resetBar(){
                scope.visible = false;
                scope.deleteSearch();
            }

            // delete query
            scope.deleteSearch = function(){
                // clear query
                scope.query = '';
            }

            // close the search bar
            scope.setTagCard = function() {
                // chiudo la barra
                scope.visible = false;
                // filtro
                setTimeout(function() {scope.$apply(function () {
                    scope.card = true;
                    $location.search('q', scope.query);
                })}, 300);
            }
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
                }

                // lancio la funzione definita di localizzazione
                scope.clickOnResult = function (entry){
                    scope.locate({'location': entry.position})
                }

                // lancio la ricerca
                function checkQuery(e){
                    // controlla lo stradario
                    SearchService.geocoding(e).then(
                        function(response){
                            console.log("SearchCtrl, watch query, SearchService.geocoding, response: ",response);
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
angular.module('firstlife.searchbox',[])
    .directive('searchBox', function() {
    return {
        restrict: 'E',
        scope: {
            close: '=',
            click: '=',
            query: '='
        },
        templateUrl: '/templates/map-ui-template/searchbox.html',
        controller: ['$scope', '$rootScope', '$location', '$log', '$filter', '$timeout','$location','myConfig', 'MemoryFactory', 'MapService','SearchService','CBuffer', function($scope,$rootScope,$location,$log,$filter,$timeout,$location, myConfig,MemoryFactory,MapService,SearchService,CBuffer){
            var config = myConfig;
            var bounds = {};
            var bunch = 1500;
            var memKey = 'search-cache';
            var RELOAD_TIME = config.behaviour.moveend_delay;
            $scope.markerChildren = {};
            //$scope.query = '';
            $scope.limit = bunch;
            
            // init buffer
            // lunghezza del buffer
            var buffer_size = 5;
            $scope.bufferSearch = new CBuffer(buffer_size);
            $scope.bufferSearch.overflow = function(data) {
                //$log.debug("Buffer overflow: ",data);
            };  
            
            
            
            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyWall){
                    e.preventDestroyWall = true;
                    delete $scope;
                }
            });

            $rootScope.$on('timeline.refresh',function(e,args){
                init();
            });
            
            var timer = false;
            $scope.$watch('query',function(e,old){
                if(e != old){
                    checkSearch(e);
                }
            })
            
            
            var checkSearch = function (q){
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    $location.search('q',q)
                    pushCache(q);
                },RELOAD_TIME);
            };
            
            init();
            
            function init(){
                if(!$scope.crono) $scope.crono = initBuffer();
                MapService.getMapBounds().then(
                    function(response){
                        bounds = response;
                    },
                    function(response){
                        $log.error("searchBox, getMapBounds, errore ",response);}
                );
            }
            
            // click cambio di parametro search e chiudo modal
            $scope.clickSearchItem = function(entityId){
                // cambio paramentro search
                $location.search('entity',entityId);
                //chiudo la modal
                $scope.close();
            };

            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                return bounds.contains([val.lat,val.lng]);
            }

            /*
             * Gestione buffer cache
             * (private) initBuffer() return array : inizializza il buffer controllando nella memoria
             * (private) pushCache(text) return void : aggiunge alla cache una stringa, aggiorna la memoria
             * (public) restore(index): recupera il valore e lo ripristina nella ricerca (parametro q)
             *
             */
            
            
            function initBuffer(){
                
                var cache = JSON.parse(MemoryFactory.get(memKey) ? MemoryFactory.get(memKey) : '[]');
                for(var i = 0 ; i < cache.length; i++)
                    if(cache[i]){ 
                        pushCache(cache[i]);
                    }
//                $log.debug('init cache searchbox',$scope.bufferSearch.toArray());
                return $scope.bufferSearch.toArray();
            }
            function pushCache(entry){
                if(!$scope.bufferSearch) $scope.bufferSearch = new CBuffer(buffer_size);
                var index = $scope.bufferSearch.indexOf(entry);
//                $log.debug('push to cache',entry, index, $scope.bufferSearch)
                // se non e' gia' in cache
                if(entry && index < 0){
                    $scope.bufferSearch.push(entry);
                    MemoryFactory.save(memKey,JSON.stringify($scope.bufferSearch.toArray() ) );
                    $scope.crono = $scope.bufferSearch.toArray();
//                    $log.debug('check cache in memoria',MemoryFactory.get(memKey) )
//                    $log.debug('check cache visualizzata',$scope.crono)
                }
                    
            }
            // recupuera e ripristina un risultato nel buffer della cache
            $scope.restore = function (index){
//                $log.debug("cacheRestore");
                var query = $scope.bufferSearch.get(index);
//                $log.debug("cacheRestore: ",$scope.bufferSearch,index);
//                initForm();
                $location.search('q',query)
//                $scope.form.query = query;
            }
        
            
            

            $scope.loadChildren = function(marker){
                // caricamento dei child
                var childrenRelations = config.types.child_relations[marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor(marker.id, childRel.field);
                    if(!$filter('isEmpty')(c)){
                        children[key] = angular.copy(childRel);
                        for(var j = 0; j<c.length;j++){
                            var thing = c[j];
                            if(!children[thing.entity_type])
                                children[thing.entity_type] = angular.copy(childrenRelations[thing.entity_type]);
                            if(!children[thing.entity_type].list)
                                children[thing.entity_type].list = [];
                            var index = children[thing.entity_type].list.map(function(e){return e.id}).indexOf(thing.id);
                            if(index < 0)
                                children[thing.entity_type].list.push(thing);
                        }
                    }
                }
                $scope.markerChildren[marker.id] = children;
            };


        }]
    }
}).directive('searchResults', function(){
    return {
        restrict: 'EG',
        scope: {
            query:'=',
            click:'=',
            close:'='
        },
        templateUrl: '/templates/map-ui-template/searchresults.html',
        controller: ['$scope','$log','$location','myConfig','SearchService', function($scope,$log,$location,myConfig,SearchService){
            var limit = myConfig.behaviour.query_limit;
            var SEARCH_DELAY = myConfig.behaviour.searchend_delay;
            var result_limit = myConfig.behaviour.search_results_limit;

            var searchendSetTimeout;
            initForm();

            //cleanup
            $scope.$on('$destroy',function(){delete scope;});

            // al cambio della query
            $scope.$watch('query', function(e, old){
                if(e && old != e && e.length > limit){
                    if (SEARCH_DELAY > 0) {
                        if (searchendSetTimeout) {
                            clearTimeout(searchendSetTimeout);
                        }
                        searchendSetTimeout = setTimeout(
                            function(){
                                $log.log("cerco ",$scope.query);
                                checkQuery(e);
                            }, SEARCH_DELAY);
                    } 
                    else {
                        checkQuery(e);
                    } 
                }
            });

            $scope.locate = function(r){
                $location.search('q',null);
                $location.search('lat',r.lat);
                $location.search('lng',r.lng);
                $location.search('zoom',myConfig.map.zoom_create);
                $scope.close();
            }
            
            
            
            
            /*
             * Funzioni private
             * 1) checkQuery: fa partire le richieste ai service di ricerca
             * 2) pushCache: aggiunge nel buffer circolare il contenuto del form di ricerca
             * 3) initForm: inizializza la struttura dati del form di ricerca
             */

            // richieste per i service di ricerca
            function checkQuery(e){
                // togliamo la ricerca interna per ora
                SearchService.query(e).then(
                    function(response){
//                        $log.debug("SearchCtrl, watch query, SearchService.query, response: ",response);
                        $scope.results = response.length >= result_limit ? response.slice(0,result_limit) : response;
//                        $log.debug("SearchCtrl, watch query, SearchService.query, response: ",response,$scope.results,result_limit);
//                        if($scope.query != '' && $scope.results.length > 0)
//                            pushCache(e);
                    },
                    function(response){ $log.error("SearchCtrl, watch query, SearchService.query, error: ",response);}
                );
                SearchService.geocoding(e).then(
                    function(response){
                        $log.debug('risultato geocoding ',response);
                        $scope.locations = response.length >= result_limit ? response.splice(0,result_limit) : response;
//                        $log.debug('risultato geocoding ',$scope.locations);
                    },
                    function(response){ 
                        $log.error("SearchCtrl, watch query, SearchService.geocoding, error: ",response);
                    }
                );
            }

           
            // inizializzazione del form di ricerca
            function initForm(){
                $scope.locations = [];
                $scope.results = [];
            }


        }]
    }
});
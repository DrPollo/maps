angular.module('firstlife.controllers')
    .controller('SearchCtrl', ['$scope', '$location', 'myConfig', 'SearchService', 'CBuffer', function($scope, $location, myConfig, SearchService, CBuffer) {

        $scope.config = myConfig;
        
        var text_limit = 2;
        var result_limit = 5;
        
        initForm();
        
        // todo autocomplete con i risultati della ricerca?
        // gestione della ricerca
        var searchendSetTimeout;
        var SEARCH_DELAY = $scope.config.behaviour.searchend_delay;
        var buffer_size = 3;
        $scope.bufferSearch = new CBuffer(buffer_size);
        $scope.bufferSearch.overflow = function(data) {
            //console.log("Buffer overflow: ",data);
        };
        
        $scope.focus = false;
        
        var dev = false;
        /*
         * Listners
         * 1) al cambio del form di ricerca
         * 2) focus sulla mappa: chiudo la ricerca e salvo nel buffer i risultati
         */
        $scope.$watch(
            function(){ return $scope.form.query; }, 
            function(e, old){
                if(dev) $log.log("SearchCtrl, old: ",old, " new: ",e);
                if(e && old != e && e.length > text_limit){
                    if (SEARCH_DELAY > 0) {
                        if (searchendSetTimeout) {
                            $log.debug("clearTimeout");
                            clearTimeout(searchendSetTimeout);
                        }
                        searchendSetTimeout = setTimeout(
                            function(){
                                $log.debug("cerco ",$scope.form.query);
                                checkQuery(e);
                            }, SEARCH_DELAY);
                    } 
                    else {
                        checkQuery(e);
                    } 
                }

            });

        // listner click sulla mappa
        $scope.$on('leafletDirectiveMap.mymap.focus', function(event, args) {
            if(dev) console.log("SearchCtrl, leafletDirectiveMap.mymap.focus");
            $scope.focus = false;
            initForm();
        });
        
        // fine listners
        
        
        
        /*
         * Funzioni pubbliche
         * 1) cacheRestore: ripristina una ricerca nel form
         * 2) entryClick: click sul risultato della ricerca, cambia il parametro nella search
         * 3) clearSearch: inizializza form
         */
        
        // recupuera e ripristina un risultato nel buffer della cache
        $scope.cacheRestore = function (index){
            var query = $scope.bufferSearch.get(index).query;
            //console.log("Buffer: ",$scope.bufferSearch);
            initForm();
            $scope.form.query = query;
        }
        // click su risultato della ricerca
        $scope.entryClick = function(id){
            $location.search('entity',id);
            //todo salva in cache la scelta
        }
        // cancellazione dei risultati della ricerca e del campo di ricerca
        $scope.clearSearch = function (){
            // pulisco la ricerca e i risultati
            initForm();
        }
        


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
         * 1) checkQuery: fa partire le richieste ai service di ricerca
         * 2) pushCache: aggiunge nel buffer circolare il contenuto del form di ricerca
         * 3) initForm: inizializza la struttura dati del form di ricerca
         */
        
        // richieste per i service di ricerca
        function checkQuery(e){
            //recupero il centro della mappa
            $scope.center = MapService.getCenterFromMap();
            $log.error('ok checkQuery')
            SearchService.query(e).then(
                function(response){
                    //console.log("SearchCtrl, watch query, SearchService.query, response: ",response);
                    $scope.form.results = response.length >= result_limit ? response.slice(0,result_limit) : response;
                    console.log("SearchCtrl, watch query, SearchService.query, response: ",response,$scope.form.results,result_limit);
                    if($scope.form.query != '' && $scope.form.results.length > 0)
                        pushCache();
                },
                function(response){ console.log("SearchCtrl, watch query, SearchService.query, error: ",response);}
            );
            SearchService.geocoding(e).then(
                function(response){
                    //console.log("SearchCtrl, watch query, SearchService.geocoding, response: ",response);
                    $scope.form.locations = response.length >= result_limit ? response.slice(result_limit) : response;
                    if($scope.form.query != '' && $scope.form.locations.length > 0)
                        pushCache();
                },
                function(response){ console.log("SearchCtrl, watch query, SearchService.geocoding, error: ",response);}
            );
        }
        
        // aggiunge una ricerca nei buffer di ricerca
        function pushCache(){
            $log.error('ok pushCache')
            var entry = angular.copy($scope.form);
            if($scope.bufferSearch.toArray().map(function(e) { return e.query; }).indexOf(entry.query) < 0)
                $scope.bufferSearch.push(entry);
        }
        
        // inizializzazione del form di ricerca
        function initForm(){
            $scope.form = {locations:[],results:[],query:''};
        }
        
        
        
        
    }]);
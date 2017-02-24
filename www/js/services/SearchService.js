angular.module('firstlife.services')
    .service('SearchService', ['$q', '$http', '$log', 'myConfig', 'MemoryFactory', 'MapService', function($q, $http, $log, myConfig, MemoryFactory, MapService) {
    
        self.config = myConfig;
        var format = myConfig.format;
        var searchUrl = self.config.backend_search,
            geoUrl = self.config.navigator.search.url,
            search_key = self.config.navigator.search.search_key;
        //var bound = String(self.config.navigator.default_area.bound).replace("[","").replace("]","");
        var bound = String(self.config.map.shouthWest_bounds).replace("[","").replace("]","");
        bound = bound.concat(",").concat(String(self.config.map.northEast_bounds)).replace("[","").replace("]","");
        // display_name dei risultati di geocoding
        var name = myConfig.navigator.search.name;
        //var center = MapService.getCenterFromMap();
        
        self.categories = self.config.types.categories;
        
        
        
        return {
            query: function(val){
                var deferred = $q.defer();
                var timeParams = MapService.getTimeFilters();
                var params = "&detail=full&limit=7&types=ALL";
                if(timeParams){
                    if(timeParams.from)
                        params = params.concat("&from=").concat(timeParams.from.toISOString());
                    if(timeParams.to)
                        params = params.concat("&to=").concat(timeParams.to.toISOString());
                }
                var query = escape(val);
                //$log.debug("SearchService, query, url: ", searchUrl);
                var url = searchUrl.concat(format).concat("?q=").concat(query).concat(params);
                var req = {
                        url: url,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:'',
                        cache: true
                    };
                $http(req)
                .then(function(response) {
                    //$log.debug("SearchService, query, response: ", response);
                    // bug data in data
                    var entries = [];
                    if(response.data){
                        entries = searchDecoder(response.data)
                    }
                    deferred.resolve(entries);
                },function(response) {
                    $log.error("SearchService, query, errore: ", response);
                    deferred.reject(response);
                });

                return deferred.promise;
            }, 
            geocoding: function(val){
                var deferred = $q.defer();
                //$log.debug("SerarchService, bounds: ",bound);
                var query = escape(val);
                //$log.debug("SearchService, query, url: ", searchUrl);
                var url = geoUrl.concat(search_key,"=",query);
                var req = {
                        url: url,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:'',
                        cache: true
                    };
                $http(req)
                .then(function(response) {
//                    $log.debug("SearchService, query, response: ", response);
                    deferred.resolve(geocodingDecoder(response.data));
                    
                },function(response) {
                    $log.error("SearchService, query, errore: ", response);
                    deferred.reject(response);
                });

                return deferred.promise;
            } 
        }

        
        
        /*
         * Funzioni private
         * 1) geocodingDecoder: decoder dei risultati dal servizio di geoconding
         * 2) geocodingEntryParser: parsificatore dei risultati del geocoding
         */
        
        function geocodingDecoder(data){
            // recupero il centro della mappa
            var center = MapService.getCenterFromMap();
            var results = data.features;
            
            //$log.debug("SearchService, geocodingDecoder, results: ",results);
            var entries = [];
            //aggiungo i risultati utili
            for(var i = 0; i < results.length; i++){
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = geocodingEntryParser(results[i],center);
//                $log.debug("SearchService, geocodingDecoder, check risultato: ",entry[name]);
                if(entries.map(function(e){ return e[name]; }).indexOf(entry[name]) < 0){
                    $log.debug('push',entry)
                    entries.push(entry);
                } 
                $log.debug(entries)
            }
            
            // todo sort per distanza crescente
            //entries.sort(function(a,b){if(a.distance <= b.distance) return a; return b;});
//            $log.debug("SearchService, geocodingDecoder, risultati decodificati: ", entries);
            return entries;
        }
        
        // costruisco il risultato del geocoding
        // applico regole di costruzione del nome e selezione dei risultati
        function geocodingEntryParser(feature,center){
            var entry = feature.properties;
            var point = feature.geometry.coordinates;
//            $log.debug("SearchCtrl, geocodingEntryDecoder, entry: ",entry,center);
            var r = {};
            // basta questo
            r.name = entry[name];
            r.icon = 'ion-location';
            // set coordinate
            r.position = {lat:point[1],lng:point[0]};
            // calcolo distanza
            r.distance = distance(center,r.position);
            
            
            //$log.debug("SearchService, geocodingEntryParser, r: ",r);
            return r;
        }
        
        function searchDecoder(results){
            // recupero il centro della mappa
            var center = MapService.getCenterFromMap();
            var features = results.features;
//            $log.debug("SearchService, searchDecoder, results: ",features);
            var entries = [];
            //aggiungo i risultati utili
            for(i = 0; i < features.length; i++){
//                $log.debug("SearchService, searchDecoder, check risultato: ",i,features[i]);
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = searchEntryParser(features[i],center);
                if(entries.map(function(e){ return e.name; }).indexOf(entry.name) < 0){
                    entries.push(entry);
                } 
            }
            
            // todo sort per distanza crescente
            //entries.sort(function(a,b){if(a.distance <= b.distance) return a; return b;});
//            $log.debug("SearchService, searchDecoder, risultati decodificati: ", entries);
            return entries;
        }
        
        function searchEntryParser(feature,center){
//            $log.debug("SearchCtrl, searchEntryParser, entry: ",feature, self.categories);
            var r = {};
            var spaceIndex = self.categories.map(function(e) { return e.category_space; }).indexOf(feature.properties.categories[0].category_space.id);
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",spaceIndex);
            var cat = feature.properties.categories[0].category_space.categories[0];
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",cat);
            var catIndex = self.categories[spaceIndex].categories.map(function(e){return e.id;}).indexOf(cat.id);
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",catIndex);
//            $log.debug("SearchCtrl, searchEntryParser, indici: ",self.categories[spaceIndex],self.categories[spaceIndex].categories,self.categories[spaceIndex].categories[catIndex]);
            r.name = feature.properties.name;
            // icona e colore da categoria
            r.icon = self.categories[spaceIndex].categories[catIndex].icon;
            
            r.color = self.categories[spaceIndex].categories[catIndex].color;
            
            r.id = parseInt(feature.id);
            
            // set coordinate
            r.position = {lat:parseFloat(feature.geometry.coordinates[1]),lng:parseFloat(feature.geometry.coordinates[0])};
            // calcolo distanza
            r.distance = distance(center,r.position);
//            $log.debug("SearchService, searchEntryParser, r: ",r);
            return r;
        }
        
        // calcola distanza
        function distance(center, point){
            //console.log("SearchCtrl, distance: ",(center.lat - point.position.lat), Math.pow((center.lat - point.position.lat), 2.0));
            var distance = Math.sqrt(Math.pow((center.lat - point.lat), 2.0) + Math.pow((center.lng - point.lng), 2.0));
            //console.log("SearchCtrl, distance, cancolo distanza per: ",point, " distanza: ",distance);
            return distance;
        }
        
    }]);
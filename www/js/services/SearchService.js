angular.module('firstlife.services')
    .service('SearchService', ['$q', '$http', 'myConfig', 'MemoryFactory', 'MapService', function($q, $http, myConfig, MemoryFactory, MapService) {
    
        self.config = myConfig;
        var format = myConfig.format;
        var searchUrl = self.config.backend_search,
            geoUrl = self.config.navigator.search.geocoding;
        var bound = String(self.config.navigator.default_area.bound).replace("[","").replace("]","");
        
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
                console.log("SearchService, query, url: ", searchUrl);
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
                    console.log("SearchService, query, response: ", response);
                    // bug data in data
                    var entries = [];
                    if(response.data && response.data.data){
                        entries = searchDecoder(response.data.data)
                    }
                    deferred.resolve(entries);
                },function(response) {
                    console.log("SearchService, query, errore: ", response);
                    deferred.reject(response);
                });

                return deferred.promise;
            }, 
            geocoding: function(val){
                var deferred = $q.defer();
                console.log("SerarchService, bounds: ",bound);
                var params = "&bounded=1&polygon=0&format=json&limit=10&addressdetails=1&viewbox="+bound;
                var query = escape(val);
                console.log("SearchService, query, url: ", searchUrl);
                var url = geoUrl.concat("?q=").concat(query).concat(params);
                var req = {
                        url: url,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:'',
                        cache: true
                    };
                $http(req)
                .then(function(response) {
                    console.log("SearchService, query, response: ", response);
                    deferred.resolve(geocodingDecoder(response.data));
                    
                },function(response) {
                    console.log("SearchService, query, errore: ", response);
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
        
        function geocodingDecoder(results){
            // recupero il centro della mappa
            var center = MapService.getCenterFromMap();
            
            console.log("SearchService, geocodingDecoder, results: ",results);
            var entries = [];
            //aggiungo i risultati utili
            for(i = 0; i < results.length; i++){
                console.log("SearchService, geocodingDecoder, check risultato: ",i,results[i]);
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = geocodingEntryParser(results[i],center);
                if(entries.map(function(e){ return e.name; }).indexOf(entry.name) < 0){
                    entries.push(entry);
                } 
            }
            
            // todo sort per distanza crescente
            //entries.sort(function(a,b){if(a.distance <= b.distance) return a; return b;});
            console.log("SearchService, geocodingDecoder, risultati decodificati: ", entries);
            return entries;
        }
        
        // costruisco il risultato del geocoding
        // applico regole di costruzione del nome e selezione dei risultati
        function geocodingEntryParser(entry,center){
            console.log("SearchCtrl, geocodingEntryDecoder, entry: ",entry);
            var r = {};
            r.name = '';
            r.icon = 'ion-location';
            //bus stop
            if(entry.address.bus_stop){
                r.name = r.name.concat(entry.address.bus_stop).concat(', ');
                r.icon = 'ion-android-bus';
            }else if(entry.address.school){
                r.name = r.name.concat(entry.address.school).concat(', ');
                r.icon = 'ion-university';
            }else if(entry.address.attraction){
                r.name = r.name.concat(entry.address.attraction).concat(', ');
                r.icon = 'ion-pin';
            }
            // strada o piazza
            if(entry.address.road)
                r.name = r.name.concat(entry.address.road).concat(', ');
            else if(entry.address.pedestrian)
                r.name = r.name.concat(entry.address.pedestrian).concat(', ');
            else if(entry.address.footway)
                r.name = r.name.concat(entry.address.footway).concat(', ');
            // borgo o circoscrizione
            if(entry.address.neighbourhood)
                r.name = r.name.concat(entry.address.neighbourhood ).concat(', ');
            else if(entry.address.suburb)
                r.name = r.name.concat(entry.address.suburb).concat(', ');
            // citta' o villaggio
            if(entry.address.city)
                r.name = r.name.concat(entry.address.city);
            else if(entry.address.town)
                r.name = r.name.concat(entry.address.town);
            else if(entry.address.village)
                r.name = r.name.concat(entry.address.village);
            // set coordinate
            r.position = {lat:entry.lat,lng:entry.lon};
            // calcolo distanza
            r.distance = distance(center,r.position);
            
            console.log("SearchService, geocodingEntryParser, r: ",r);
            return r;
        }
        
        function searchDecoder(results){
            // recupero il centro della mappa
            var center = MapService.getCenterFromMap();
            var features = results.features;
            console.log("SearchService, searchDecoder, results: ",features);
            var entries = [];
            //aggiungo i risultati utili
            for(i = 0; i < features.length; i++){
                console.log("SearchService, searchDecoder, check risultato: ",i,features[i]);
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = searchEntryParser(features[i],center);
                if(entries.map(function(e){ return e.name; }).indexOf(entry.name) < 0){
                    entries.push(entry);
                } 
            }
            
            // todo sort per distanza crescente
            //entries.sort(function(a,b){if(a.distance <= b.distance) return a; return b;});
            console.log("SearchService, searchDecoder, risultati decodificati: ", entries);
            return entries;
        }
        
        function searchEntryParser(feature,center){
            console.log("SearchCtrl, searchEntryParser, entry: ",feature, self.categories);
            var r = {};
            var spaceIndex = self.categories.map(function(e) { return e.category_space; }).indexOf(feature.properties.categories[0].category_space),
                cat = feature.properties.categories[0].categories[0],
                catIndex = self.categories[spaceIndex].categories.map(function(e){return e.id;}).indexOf(cat);
            console.log("SearchCtrl, searchEntryParser, indici: ",spaceIndex,cat,catIndex);
            r.name = feature.properties.name;
            // icona e colore da categoria
            r.icon = self.categories[spaceIndex].categories[catIndex].icon;
            r.color = self.categories[spaceIndex].categories[catIndex].color;
            
            r.id = parseInt(feature.id);
            
            // set coordinate
            r.position = {lat:parseFloat(feature.geometry.coordinates[1]),lng:parseFloat(feature.geometry.coordinates[0])};
            // calcolo distanza
            r.distance = distance(center,r.position);
            console.log("SearchService, searchEntryParser, r: ",r);
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
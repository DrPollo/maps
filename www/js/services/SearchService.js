angular.module('firstlife.services')
    .service('SearchService', ['$q', '$http', '$log', 'myConfig', 'MemoryFactory', 'ThingsService', function ($q, $http, $log, myConfig, MemoryFactory, ThingsService) {

        self.config = myConfig;
        var format = myConfig.format;
        var searchUrl = self.config.backend_search,
            geoUrl = self.config.navigator.search.url,
            revGeoUrl = self.config.navigator.reverse_geocoding.url,
            search_key = self.config.navigator.search.search_key;
        //var bound = String(self.config.navigator.default_area.bound).replace("[","").replace("]","");
        var bound = String(self.config.map.shouthWest_bounds).replace("[", "").replace("]", "");
        bound = bound.concat(",").concat(String(self.config.map.northEast_bounds)).replace("[", "").replace("]", "");
        // display_name dei risultati di geocoding
        var name = myConfig.navigator.search.name;

        self.categories = self.config.types.categories;


        return {
            query: function (val) {
                var deferred = $q.defer();
                var timeParams = ThingsService.getTimeFilters();
                var params = "&detail=full&limit=7&types=ALL";
                if (timeParams) {
                    if (timeParams.from)
                        params = params.concat("&from=").concat(timeParams.from.toISOString());
                    if (timeParams.to)
                        params = params.concat("&to=").concat(timeParams.to.toISOString());
                }
                var query = escape(val);
                //$log.debug("SearchService, query, url: ", searchUrl);
                var url = searchUrl.concat(format).concat("?q=").concat(query).concat(params);
                var req = {
                    url: url,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: '',
                    cache: true
                };
                $http(req)
                    .then(function (response) {
                        //$log.debug("SearchService, query, response: ", response);
                        // bug data in data
                        var entries = [];
                        if (response.data) {
                            entries = searchDecoder(response.data)
                        }
                        deferred.resolve(entries);
                    }, function (response) {
                        $log.error("SearchService, query, errore: ", response);
                        deferred.reject(response);
                    });

                return deferred.promise;
            },
            tagQuery: function (val) {
                var deferred = $q.defer();
                var query = escape(val);
                var url = self.config.backend_things.concat('/tagsearch', format).concat("?domain_id=", self.config.domain_id, "&query=", query);
                //$log.debug("tagQuery, query, url: ", url);
                var req = {
                    url: url,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: '',
                    cache: true
                };
                $http(req)
                    .then(function (response) {
                        $log.debug("tagQuery, query, response: ", response.data);
                        // bug data in data
                        if(response.data && response.data.tags){
                            entries = decoder(response.data.tags,'tags')
                        }
                        deferred.resolve(entries);
                    }, function (response) {
                        $log.error("tagQuery, query, errore: ", response);
                        deferred.reject(response);
                    });

                return deferred.promise;
            },
            thingQuery: function (val) {
                var deferred = $q.defer();
                var params = "&limit=7&types=ALL";
                var query = escape(val);
                //$log.debug("thingQuery, query, url: ", searchUrl);
                var url = self.config.backend_search.concat(format).concat("?domain_id=", self.config.domain_id, "&query=").concat(query).concat(params);
                var req = {
                    url: url,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: '',
                    cache: true
                };
                $http(req)
                    .then(function (response) {
                        // $log.debug("thingQuery, query, response: ", response);
                        // bug data in data
                        var entries = [];
                        if(response.data && response.data.things && response.data.things.features){
                            entries = decoder(response.data.things.features,'things')
                        }
                        deferred.resolve(entries);
                    }, function (response) {
                        $log.error("tagQuery, query, errore: ", response);
                        deferred.reject(response);
                    });

                return deferred.promise;
            },
            initiativeQuery: function (val) {
                var deferred = $q.defer();
                var query = escape(val);
                //$log.debug("initiativeQuery, query, url: ", searchUrl);
                var url = self.config.backend_initiatives.concat("/search", format).concat("?domain_id=", self.config.domain_id, "&query=").concat(query);
                var req = {
                    url: url,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: '',
                    cache: true
                };
                $http(req)
                    .then(function (response) {
                        // $log.debug("initiativeQuery, query, response: ", response);
                        // bug data in data
                        var entries = [];
                        if(response.data && response.data.initiatives){
                            entries = decoder(response.data.initiatives,'initiatives')
                        }
                        deferred.resolve(entries);
                    }, function (response) {
                        $log.error("initiativeQuery, query, errore: ", response);
                        deferred.reject(response);
                    });

                return deferred.promise;
            },
            geocoding: function (val) {
                var deferred = $q.defer();
                //$log.debug("SerarchService, bounds: ",bound);
                var query = escape(val);
                //$log.debug("SearchService, query, url: ", searchUrl);
                var url = geoUrl.concat(search_key, "=", query);

                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState === 4) {
                        // $log.debug("SearchService, status",xmlHttp.status);
                        if (xmlHttp.status == 200) {
                            var data = JSON.parse(xmlHttp.response);
                            // $log.debug("SearchService, query, response: ", data);
                            deferred.resolve(decoder(data.features,'locations'));
                        } else {
                            $log.error("SearchService, query, errore: ", xmlHttp.responseText);
                            deferred.reject(xmlHttp.status);
                        }
                    }

                };
                xmlHttp.open("GET", url, true); // true for asynchronous
                xmlHttp.send(null);

                return deferred.promise;
            },
            reverseGeocoding: function (params) {
                var deferred = $q.defer();
                var url = revGeoUrl.concat("?format=json", "&lat=", params.lat, "&lon=", params.lng, "&zoom=", params.zoom);
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState === 4) {
                        // $log.debug("SearchService, status",xmlHttp.status);
                        if (xmlHttp.status == 200) {
                            var data = JSON.parse(xmlHttp.response);
                            $log.debug("Reverse Geocoding, response: ", data);
                            deferred.resolve({display_name: data.display_name, address: data.address});
                        } else {
                            $log.error("SearchService, query, errore: ", xmlHttp.responseText);
                            deferred.reject(xmlHttp.status);
                        }
                    }

                };
                xmlHttp.open("GET", url, true); // true for asynchronous
                xmlHttp.send(null);

                return deferred.promise;
            }
        };


        /*
         * Funzioni private
         * 1) geocodingDecoder: decoder dei risultati dal servizio di geoconding
         * 2) geocodingEntryParser: parsificatore dei risultati del geocoding
         */

        function decoder(results, type) {
            //$log.debug("SearchService, geocodingDecoder, results: ",results);
            var entries = [];
            //aggiungo i risultati utili
            for (var i = 0; i < results.length; i++) {
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = entryParser(results[i], type);
//                $log.debug("SearchService, geocodingDecoder, check risultato: ",entry[name]);
                if (entries.map(function (e) {
                        return e[name];
                    }).indexOf(entry[name]) < 0) {
                    $log.debug('push', entry)
                    entries.push(entry);
                }
                $log.debug(entries)
            }

            return entries;
        }

        // costruisco il risultato del geocoding
        // applico regole di costruzione del nome e selezione dei risultati
        function entryParser(feature, type) {
            switch (type) {
                case 'tags':
                    return {name:feature, icon:'ion-pricetag', type:'tag'};
                    break;
                case 'initiatives':
                    return {name:feature.name, icon:'ion-cube', id:feature.id, type:'initiative'};
                    break;
                case 'things':
                    var t = {
                        id: feature.properties.id,
                        name:feature.properties.name,
                        icon:'ion-location',
                        position:{lng:feature.geometry.coordinates[0],lat:feature.geometry.coordinates[1]},
                        type:'thing'};
                    return t;
                    break;
                default:
                    var entry = feature.properties;
                    var point = feature.geometry.coordinates;
                    var r = {};
                    // basta questo
                    r.name = entry[name];
                    r.icon = 'ion-pinpoint';
                    // set coordinate
                    r.position = {lat: point[1], lng: point[0]};
                    r.type = 'location';

                    //$log.debug("SearchService, geocodingEntryParser, r: ",r);
                    return r;
            }
        }

        function searchDecoder(results) {
            // recupero il centro della mappa
            var features = results.features;
//            $log.debug("SearchService, searchDecoder, results: ",features);
            var entries = [];
            //aggiungo i risultati utili
            for (i = 0; i < features.length; i++) {
//                $log.debug("SearchService, searchDecoder, check risultato: ",i,features[i]);
                // aggiungo se manca e se non ho superato la soglia dei risultati
                var entry = searchEntryParser(features[i]);
                if (entries.map(function (e) {
                        return e.name;
                    }).indexOf(entry.name) < 0) {
                    entries.push(entry);
                }
            }

            return entries;
        }

        function searchEntryParser(feature) {
//            $log.debug("SearchCtrl, searchEntryParser, entry: ",feature, self.categories);
            var r = {};
            var spaceIndex = self.categories.map(function (e) {
                return e.category_space;
            }).indexOf(feature.properties.categories[0].category_space.id);
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",spaceIndex);
            var cat = feature.properties.categories[0].category_space.categories[0];
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",cat);
            var catIndex = self.categories[spaceIndex].categories.map(function (e) {
                return e.id;
            }).indexOf(cat.id);
//            $log.debug("SearchCtrl, searchEntryParser, spaceIndex: ",catIndex);
//            $log.debug("SearchCtrl, searchEntryParser, indici: ",self.categories[spaceIndex],self.categories[spaceIndex].categories,self.categories[spaceIndex].categories[catIndex]);
            r.name = feature.properties.name;
            // icona e colore da categoria
            r.icon = self.categories[spaceIndex].categories[catIndex].icon;

            r.color = self.categories[spaceIndex].categories[catIndex].color;

            r.id = parseInt(feature.id);

            // set coordinate
            r.position = {
                lat: parseFloat(feature.geometry.coordinates[1]),
                lng: parseFloat(feature.geometry.coordinates[0])
            };

//            $log.debug("SearchService, searchEntryParser, r: ",r);
            return r;
        }


    }]);
angular.module('firstlife.factories')
    .factory('entityFactory', ['$http', '$q',  '$rootScope', 'myConfig', 'categoriesFactory','MemoryFactory', function($http, $q,  $rootScope, myConfig, categoriesFactory,MemoryFactory) {
        // Service logic
        //var url = 'http://firstlife-dev.di.unito.it/api/index.php/api/v2/places';
        var self = this;
        self.config = myConfig;

        var urlPlace= myConfig.backend_places;
        var urlEvent= myConfig.backend_events;
        var urlThings= myConfig.backend_things;
        // aggiungo il parametro per ottenere solo i nodi radice (senza padre)
        var bboxBaseParams = '?types=';
        for(var i = 0; i< self.config.types.list.length; i++){
            if(i > 0)   
                bboxBaseParams = bboxBaseParams.concat(',');
            bboxBaseParams = bboxBaseParams.concat(self.config.types.list[i].key);
        }
        // aggiungio parametro full se necessario, altrimenti lite e' di default
        if(self.config.map.bbox_details){
            bboxBaseParams = bboxBaseParams.concat('&detail=full');
        }
        
        //var format = '.json';
        var format = '';
        var response = null;

        //self.placeList = [];
        self.markerList = {};
        self.markerDetailsList = {};
        self.geoJSON = {};

        self.timestamp = null;

        self.BBOX_TIMEOUT = myConfig.behaviour.bbox_timeout; // timeout di ricarica per SINCE [millisecondi]
        self.categories = null; //$rootScope.categories;
        self.mainCategories = null;

        // prepara gli url e la bboxHistory con i tipi
        var types = [];
        self.bboxHistory = {};
        for(i in self.config.types.list){
            types[self.config.types.list[i].key] = self.config.types.list[i].url;
            self.bboxHistory[self.config.types.list[i].key] = [];
        }
        console.log("entityFactory, preparo gli url: ",types);


        // Public API here
        return {
            markerCreate: function(feature){
                return markerCreate(feature);
            },
            getAll: function() {
                var deferred = $q.defer();
                var urlId = urlPlace.concat(format);

                deferred.resolve(self.markerList);
                //console.log("GetAll Markers cached service!");

                //Now return the promise.
                return deferred.promise;
            },
            get: function(id, details) {
                console.log("Get Marker: ",id," details? ",details);
                var deferred = $q.defer();
                // se faccio una richiesta con per i dettagli
                if(self.markerDetailsList[id]) {
                    console.log("Get Marker from cache!", self.markerDetailsList[id]);
                    deferred.resolve(self.markerDetailsList[id]);
                } else if(!details && self.markerList[id]){
                    console.log("Get Marker from cache!", self.markerList[id]);
                    deferred.resolve(self.markerList[id]);
                }else {
                    // altrimenti chiamo il server per i dettagli
                    var urlId = urlThings.concat('/').concat(id).concat(format).concat("?detail=full").concat(" ");

                    var req = {
                        url: urlId,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:''
                    };
                    $http(req)
                        .success(function(response) {
                        console.log("PlaceFactory, get, rensponse: ", response);
                        entityToMarker(response.data).then(
                            function(marker){
                                //aggiorno anche la lista dei dettagli
                                console.log("PlaceFactory, get, rensponse > marker: ", marker);
                                updateMarkerList(marker,true);
                                deferred.resolve(marker);
                            },
                            function(err){
                                deferred.reject(err);
                                console.log("placeFactory, get, entityToMarker, error: ",err);
                            }
                        );

                    })
                        .error(function(response) {
                        deferred.reject(response);
                        console.log("Get Marker from server: error! ", response);
                    });
                }
                return deferred.promise;
            },
            getList: function(ids, details) {
                //console.log("Get Marker: ",id," details? ",details);
                var deferred = $q.defer();
                // se faccio una richiesta con per i dettagli
                if(self.markerDetailsList[id]) {
                    //console.log("Get Marker from cache!", self.markerDetailsList[id]);
                    deferred.resolve(self.markerDetailsList[id]);
                } else if(!details && self.markerList[id]){
                    //console.log("Get Marker from cache!", self.markerList[id]);
                    deferred.resolve(self.markerList[id]);
                }else {
                    // altrimenti chiamo il server per i dettagli
                    var urlId = urlThings.concat('/').concat("details").concat(format).concat("?detail=full").concat("&things=").concat(ids.join(","));
                    var data = {things:ids};
                    var req = {
                        url: urlId,
                        method: 'get',
                        headers:{"Content-Type":"application/json"},
                        data: ''
                    };
                    $http(req)
                        .success(function(response) {
                        entitiesToMarker(response.data, true).then(
                            function(markerList){
                                //aggiorno anche la lista dei dettagli
                                updateMarkerList(markerList,true);
                                deferred.resolve(markerList);
                            },
                            function(err){
                                deferred.reject(err);
                                console.log("placeFactory, get, entityToMarker, error: ",err);
                            }
                        );

                    })
                        .error(function(response) {
                        deferred.reject(response);
                        console.log("Get Marker from server: error! ", response);
                    });
                }
                return deferred.promise;
            },
            update: function(entity, id) {
                var urlId = types[entity.entity_type].concat("/").concat(id).concat("/update").concat(format);
                var deferred =$q.defer();
                //console.log("UPDATE TO: ", urlId, place);
                var feature = markerConverter(entity);
                //console.log("PlaceFactory, token: ", token);
                console.log("PlaceFactory, update place query: ",entity,feature);
                var token = MemoryFactory.getToken();
                var req = {
                    url: urlId,
                    method: 'PUT',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:feature
                };
                console.log("entityFactory, update: ",angular.toJson(feature));
                $http(req)
                    .success(function(response) {
                    console.log("entityFactory, update, response: ",response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    //console.log("PlaceFactory, getBBox, rensponse, merge with geoJSON: ", self.geoJSON);
                    var marker = entityToMarker(response.data);
                    entityToMarker(response.data).then(
                        function(marker){
                            //aggiorno anche la lista dei dettagli
                            updateMarkerList(marker,true);
                            deferred.resolve(marker);
                        },
                        function(err){
                            deferred.reject(err);
                            console.log("placeFactory, get, entityToMarker, error: ",err);
                        }
                    );

                })
                    .error(function(response) {
                    deferred.reject(response);
                    console.log("Update Place on the server: error! ", response);
                });
                return deferred.promise;

            },
            create: function(entity) {
                var urlId = types[entity.entity_type].concat('/add').concat(format);
                var deferred = $q.defer();
                var feature = markerConverter(entity);
                var token = MemoryFactory.getToken();
                //console.log("PlaceFactory, token: ", token);
                console.log("entityFactory, create entity query: ",angular.toJson(feature));
                var req = {
                    url: urlId,
                    method: 'POST',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:feature
                };
                console.log("entityFactory, create: ",angular.toJson(feature));
                $http(req)
                    .success(function(response) {
                    console.log("entityFactory, create, response: ",response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    //console.log("PlaceFactory, getBBox, rensponse, merge with geoJSON: ", self.geoJSON);
                    var marker = entityToMarker(response.data);
                    updateMarkerList(marker,true);
                    deferred.resolve(marker);
                }).error(function(response) {
                    deferred.reject(response);
                    console.log("Created entity on the server: error! ", response);
                });
                return deferred.promise;
            },
            remove: function(entity){
                //to do da capire il tipo var url = self.config.types.list[parseInt(place.type)].url;
                console.log("placeFactory, remove: ",entity);
                //trova id da id_wp
                var urlId = types[entity.entity_type].concat("/").concat(entity.id).concat(format);
                // cancello i marker dalla cache
                delete self.markerDetailsList[entity.id];
                delete self.markerList[entity.id];
                var token = MemoryFactory.getToken();
                console.log("PlaceFactory, token: ", token);
                var req = {
                    url: urlId,
                    method: 'DELETE',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:''
                };
                return $http(req);
            },

            getBBox: function(bbox,reset) {
                var deferred = $q.defer();
                var urlId = myConfig.backend_things.concat('/boundingbox').concat(format);
                var eType = ['FL_PLACES','FL_EVENTS'];
                var checkRst=checkBboxHistory(bbox);
                var bboxParamsString = bboxBaseParams;
                // se ho devo saltare la query
                var skip = false;
                // se devo fare reset 
                if(!reset)
                    reset = false;
                else // cancello la History
                    self.bboxHistory = [];

                //query senza since
                bboxParamsString += "&ne_lat=" + bbox.ne_lat + "&ne_lng=" + bbox.ne_lng + "&sw_lat=" + bbox.sw_lat + "&sw_lng=" + bbox.sw_lng + "&limit=600";
                if(bbox.from)
                    bboxParamsString += "&from="+bbox.from;
                if(bbox.to)
                    bboxParamsString += "&to="+bbox.to;
                console.log("EntityFactory, getBBoxPlace, check history: ",self.bboxHistory[checkRst], self.BBOX_TIMEOUT);
                //console.log("EntityFactory, getBBoxPlace, check if 1: ",(self.config.behaviour.marker_cache && checkRst > -1 ));
                // aggiungo la since se la cache e' attiva
                if (self.config.behaviour.marker_cache && checkRst > -1 && !reset) {
                    // già in cache, aggiorno solo con since, al netto del timeout
                    var bboxTmp=self.bboxHistory[checkRst];
                    //console.log("EntityFactory, getBBoxPlace, check if 2: ",(bboxTmp.timestamp.getTime()+self.BBOX_TIMEOUT<(new Date()).getTime()));
                    if (bboxTmp.timestamp.getTime()+self.BBOX_TIMEOUT<(new Date()).getTime()) {
                        bboxParamsString += "&since="+bboxTmp.timestamp.toISOString();
                        // effettuo la chiamata
                        console.log("check bboxParamsString: ", bboxParamsString);
                    } else{
                        deferred.reject("nothing to check");
                        skip = true;
                    }
                }

                if(!skip){
                    bboxQuery(urlId.concat(bboxParamsString)).then(
                        function(response){
                            deferred.resolve(response);
                        },
                        function(response){
                            deferred.reject("getBbox, error: ",response);
                        }
                    );
                }
                return deferred.promise;
            },

        };


        //update lista di marker
        function updateMarkersList(newMarkers,details){
            for(el in newMarkers){
                //console.log("updateMarkersList, place caricato ",el, newMarkers[el], " anche nella lista dettagli? ",details); 
                var marker = newMarkers[el];
                self.markerList[marker.id] = marker; 

                if(details){
                    self.markerDetailsList[marker.id] = marker; 
                }
            }
        }

        function updateMarkerList(newMarker,details){
            //console.log("updateMarkersList, place caricato ",newMarker, " anche nella lista dettagli? ",details); 
            if(details){
                self.markerDetailsList[newMarker.id] = newMarker;
            }else{
                self.markerList[newMarker.id] = newMarker;
            }
            //console.log("aggiorno marker nella lista", self.markerList[newMarker.id], newMarker);
        }

        //upsert PLace per update e create!!!

        //private function
        function entitiesToMarker(data) {
            var deferred = $q.defer();
            if(data){
                var featureCollection = data;
                //console.log("placeFactory, entitiesToMarker, featureCollection: ", featureCollection);
                var entityList = featureCollection.features;
                //console.log("entitiesToMarker entityFact", data, featureCollection, entityList);
                if(self.mainCategories){
                    var markers = [];
                    for (i = 0; i < entityList.length; i++) {
                        //console.log("place da trasformare in marker", entityList[i], " numero: ",i);
                        if(entityList[i] && entityList[i] != null && entityList[i] != 'undefined'){
                            var marker = markerCreate(entityList[i]);
                            if(marker)
                                markers.push(marker); //markers[entityList[i].id] = marker;
                        }
                    }
                    deferred.resolve(markers);
                }else{
                    categoriesFactory.getAll().then(
                        function(categories){
                            self.categories = categories;
                            self.mainCategories = categories[0].categories;
                            var markers = [];
                            for (i = 0; i < entityList.length; i++) {
                                //console.log("place da trasformare in marker", entityList[i], " numero: ",i);
                                if(entityList[i] && entityList[i] != null && entityList[i] != 'undefined'){
                                    var marker = markerCreate(entityList[i]);
                                    if(marker)
                                        markers.push(marker);//markers[entityList[i].id] = marker;
                                }
                            }

                            deferred.resolve(markers);

                        },
                        function(err){deferred.reject(err);});
                }
                //console.log("Creazione del marker dall'entity: ", data, markers);
            }else{
                var markers = [];
                deferred.resolve(markers);
            }
            return deferred.promise;

        }

        //private function
        function entityToMarker(data) {
            var deferred = $q.defer();
            //console.log("entityFactory, entityToMarker, data: ", data);
            // bug, formati diversi da add/get
            var entity,features;
            //bug
            if(data === "22P02"){
                deferred.reject("Bug, risposta: 22P02");
            }else {
                if(data && data[0] && data[0].features && data[0].features)
                    features = data[0].features;
                else if(data && data.features && data.features)
                    features = data.features;
                //fine bug

                if(features && Array.isArray(features) && features.length > 0){
                    entity = features[0];
                    if(self.mainCategories){
                        var marker = markerCreate(entity);
                        if(marker)
                            deferred.resolve(marker);
                        else
                            deferred.reject("Impossibile creare il marker!");
                    }else if(entity){
                        categoriesFactory.getAll().then(
                            function(categories){
                                self.categories = categories;
                                self.mainCategories = categories[0].categories;
                                //console.log("entityToMarker", entity);
                                var marker = markerCreate(entity);
                                if(marker)
                                    deferred.resolve(marker);
                                else
                                    deferred.reject("Impossibile creare il marker!");
                            },
                            function(err){deferred.reject(err);}
                        );
                    }

                
                }else if(data.id){
                    console.log("risposta vuota ma ok ",data);
                    deferred.resolve({id:-2});
                }else {
                    console.log("no data",data);
                    deferred.reject("no data");
                }
            }
            //console.log("Creazione del marker dal place: ", place);
            return deferred.promise;
        }        



        // creazione del marker dal geoJSON
        // da cancellare una volta cambiato il formato di visualizzazione
        function markerCreate(entity) {
            //bugfix 
            if(Array.isArray(entity.properties))
                entity.properties = entity.properties[0];

            // gestione categorie multiple
            var mainCat = entity.properties.categories[0];
            var categories = self.categories[self.categories.map(function(e){return e.category_space;}).indexOf(mainCat.category_space)].categories;
            var colors = myConfig.design.colors;
            var iSize = self.config.map.marker_size,
                iAncor = self.config.map.marker_ancor;

            // costruisco lista delle icone possibili 
            var icons = {};
            var types = self.config.types.list,
                type = types[types.map(function(e){return e.key}).indexOf(entity.properties.entity_type)];
            
            console.log("EntityFactory, markerCreate, type ",types, type, entity);
            // se non e' definito il tipo nel file di configurazione
            if(!type) {
                return null;
            }
            
            // icona di default sul tipo di entita'
            icons[0] = {
                type: 'div',    
                className: 'css-pin-marker',
                iconSize:  iSize,
                iconAnchor:   iAncor,
                color:colors[type.index],
                index: type.index,
                icon: type.icon,
                html : '<div class="pin-marker" style="background-color:'+ colors[type.index]+'"></div>'+
                '<div class="icon-box"><i class="icon ' + type.icon + '"></i></div>'
            };
            for(i in entity.properties.categories){
                var c       = entity.properties.categories[i],
                    cats    = self.categories[self.categories.map(function(e){return e.category_space;}).indexOf(c.category_space)].categories,
                    index   = parseInt(cats.map(function(e) { return e.id; }).indexOf(entity.properties.categories[i].categories[0])),
                    cat     = cats[index];
                icons[c.category_space] = {
                    type: 'div',    
                    className: 'css-pin-marker',
                    iconSize:  iSize,
                    iconAnchor:   iAncor,
                    color: cat.color,
                    index: cat.colorIndex,
                    icon: cat.icon,
                    html : '<div class="pin-marker" style="background-color:'+ cat.color+'"></div>'+
                    '<div class="icon-box"><i class="icon ' + cat.icon + '"></i></div>'
                };
            }



            var catIndex = parseInt(categories.map(function(e) { return e.id; }).indexOf(entity.properties.categories[0].categories[0])),
                category = categories[catIndex],
                entity_type = entity.properties.entity_type;
            var type_info = self.config.types.list[self.config.types.list.map(function(e){return e.key;}).indexOf(entity_type)];
            type_info.color = colors[type_info.index];
            var category_list = [];
            // costruisco lista delle categorie dell'entita'
            for(var i = 0; i < entity.properties.categories.length; i++){
                var cats = entity.properties.categories[i].categories;
                category_list = category_list.concat(cats);
            }

            // se non e' categorizzabile lo salto
            if(!category)
                return null;


            //console.log("markerCreate, entity: ", entity,category, categories, icons,type);

            var marker = {
                id: parseInt(entity.properties.id),
                type: parseInt(entity.properties.type),
                coordinates : entity.geometry.coordinates,
                lat: parseFloat(entity.geometry.coordinates[1]),
                lng: parseFloat(entity.geometry.coordinates[0]),
                focus: false,
                draggable: false,
                categoryColor : category.color,
                colorIndex: category.colorIndex,
                categories: entity.properties.categories,
                category_list: category_list,
                category: category,
                entity_type: entity_type,
                type_info: type_info,
                catIndex: category,
                layer:'pie',
                images: Array(),
                icons: icons,
                icon: icons[mainCat.category_space],
                name: entity.properties.name,
                description: entity.properties.description,
                tags: entity.properties.tags,
                user: entity.properties.user,
                parent_id: entity.properties.parent_id ? entity.properties.parent_id : null,
                parent: {},
                location: entity.properties.location ? entity.properties.location : null,
                children_id: entity.properties.children,
                children: {},
                valid_from: entity.properties.valid_from,
                valid_to: entity.properties.valid_to,
                id_wp: entity.properties.id_wp,
                self: urlPlace.concat('/').concat(entity.id).concat('.html'),
                link_url : entity.properties.link_url,
                display_name: entity.properties.display_name,
                last_update: entity.properties.last_update 
            };

            //console.log("Creazione del marker dal'entita': ", entity, marker);
            return marker;
        }
        // fine markerCreate



        function bboxQuery(url) {
            var deferred = $q.defer();
            //console.log("check header $http: ", $http.defaults.headers.common);
            // effettuo la chiamata
            var req = {
                url: url,
                method: 'GET',
                //headers:{"Content-Type":"application/json"},
                data:''
            };
            var details = false;
            if(self.config.map.bbox_details){
                details = true;
            }
            
            $http(req).then(
                function(response) {
                    //console.log("EntityFactory, bboxQuery no since, get, response: ", response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    console.log("EntityFactory, bboxQuery, rensponse: ", response);
                    entitiesToMarker(response.data.data).then(
                        function(markers){
                            //salvo i marker senza dettagli
                            updateMarkersList(markers,details);
                            deferred.resolve(markers);
                        },
                        function(err){deferred.reject(err);});

                },function(response) {
                    console.log("EntityFactory, errore: ", response);
                    deferred.reject(response);
                });

            return deferred.promise;
        }



        function checkBboxHistory(bbox) {
            //console.log("EntityFactory, checkBboxHistory, bbox: ",bbox, " esiste la history? ",self.bboxHistory);

            if (!bbox.parent_bbox) {
                var toDelete = [];
                for (i = 0; i < self.bboxHistory.length; i++) {
                    var bbtmp = self.bboxHistory[i];
                    if (bbtmp.valid) {
                        if (bbox.ne_lat <= bbtmp.ne_lat && bbox.ne_lng <= bbtmp.ne_lng && bbox.sw_lat >= bbtmp.sw_lat && bbox.sw_lng >= bbtmp.sw_lng)
                            return i;
                        else if (bbox.ne_lat >= bbtmp.ne_lat && bbox.ne_lng >= bbtmp.ne_lng && bbox.sw_lat <= bbtmp.sw_lat && bbox.sw_lng <= bbtmp.sw_lng)
                            self.bboxHistory[i].valid = false;
                    }
                    //console.log(self.bboxHistory);
                }
                self.bboxHistory.filter(function(e) {
                    if (e.timestamp == 0) return false;
                    else return true;
                });

                bbox.timestamp = new Date();
                bbox.valid = true;
                self.bboxHistory.push(bbox);
                //console.log("History: "+self.bboxHistory[type].length);
                //console.log(self.bboxHistory[type]);
                return -1;
            } else {
                //DISTRIBUTED!
                //console.log("Distributed mode ON");
                //console.log("History: " + self.bboxHistory[type].length);
                //console.log(self.bboxHistory[type]);
                //console.log(bbox.parent_bbox);
                var hash = bbox.parent_bbox.hash;

                var toDelete = [];
                for (i = 0; i < self.bboxHistory.length; i++) {
                    var bbtmp = self.bboxHistory[i];
                    if (bbtmp.valid && bbtmp.hash != hash) {
                        //bbox valida e diversa dalla bbox padre (che non va considerata, perchè magari inesrita dalle altre richieste)
                        //console.log("confronto "+bbtmp+" con "+bbox);
                        if (bb1ContainsBb2(bbtmp, bbox))
                            return i; //bbox già considerate --> caching!
                        //return bbtmp; //bbox già considerate --> caching!
                        //else if (bb1ContainsBb2(bbox.parent_bbox, bbtmp))
                        //  self.bboxHistory[type][i].valid = false; //parent bbox contiene la bbox nella history --> invalidiamo la bbox nella history
                    }
                    //console.log(self.bboxHistory[type]);
                }

                /*self.bboxHistory[type].filter(function(e) {
                if (e.timestamp == 0) return false;
                else return true;
            });*/
                // aggiunge alla history la bbox padre, non la porzione
                if ((self.bboxHistory.length == 0)||(self.bboxHistory.length > 0 && self.bboxHistory[0].hash != bbox.parent_bbox.hash)) {
                    bbox.parent_bbox.timestamp = new Date();
                    bbox.parent_bbox.valid = true;
                    self.bboxHistory.unshift(bbox.parent_bbox);
                }
                //console.log("NEW history: " + self.bboxHistory.length);
                //console.log(self.bboxHistory);

                return -1;

            }
        }

        function bb1ContainsBb2(bb1, bb2) {
            return (bb2.ne_lat <= bb1.ne_lat && bb2.ne_lng <= bb1.ne_lng && bb2.sw_lat >= bb1.sw_lat && bb2.sw_lng >= bb1.sw_lng);
        }




        function markerConverter(place){
            var templatePlace = '{"type":"Feature", "properties":{}, "geometry": {}}';
            var feature = angular.fromJson(templatePlace);
            for(i in place){
                feature.properties[i] = place[i];

            }
            if(place.coordinates){
                feature.geometry = {"type": "Point", "coordinates":place.coordinates};
            }else if(place.geometries[0].coordinates){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(place.geometries[0].coordinates[0]),parseFloat(place.geometries[0].coordinates[1])]};
            }else if(place.lat){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(place.lng),parseFloat(place.lat)]};
            }
            /*var templateCollection = '{"type":"FeatureCollection","features":[]}';
            var featureCollection = angular.fromJson(templateCollection);
            featureCollection.features.push(feature);
            console.log("PlaceFactory, markerConverter, from: ",place," to: ", angular.toJson(featureCollection));
            return featureCollection;*/
            console.log("PlaceFactory, markerConverter, from: ",place," to: ", angular.toJson(feature));
            return feature;
        }

    }]).run(function initCats(entityFactory,categoriesFactory){

    categoriesFactory.getAll().then(
        function(response){
            //console.log("EntityFactory, run, categoriesFactory.getAll(), response:",response);
            //self = entityFactory;
            entityFactory.mainCategories = response[0].categories;
            entityFactory.categories = response;
            console.log("EntityFactory, run, init categories and mainCategories:",entityFactory.mainCategories,entityFactory.categories);
        },
        function(response){
            console.log("EntityFactory, run, categoriesFactory.getAll(), error:",response);
        }
    );
});
angular.module('firstlife.factories')
    .factory('entityFactory', ['$http', '$q',  '$rootScope', 'myConfig', 'MemoryFactory', function($http, $q,  $rootScope, myConfig, MemoryFactory) {
        // Service logic
        //var url = 'http://firstlife-dev.di.unito.it/api/index.php/api/v2/places';
        var self = this;
        self.config = myConfig;
        
        var consoleCheck = false;
        

        var urlThings= myConfig.backend_things;
        var urlBbox= myConfig.backend_bbox;
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
        
        var format = config.format;
        var response = null;

        //self.placeList = [];
        self.markerList = {};
        self.markerDetailsList = {};
        self.geoJSON = {};

        self.timestamp = null;

        self.BBOX_TIMEOUT = myConfig.behaviour.bbox_timeout; // timeout di ricarica per SINCE [millisecondi]
        self.categories = self.config.types.categories; 
        self.mainCategories = self.categories[0].categories;

        // prepara gli url e la bboxHistory con i tipi
        var types = [];
        self.bboxHistory = {};
        for(i in self.config.types.list){
            types[self.config.types.list[i].key] = self.config.types.list[i].url;
            self.bboxHistory[self.config.types.list[i].key] = [];
        }
        if(consoleCheck)console.log("entityFactory, preparo gli url: ",types);


        // Public API here
        return {
            markerCreate: function(feature){
                return markerCreate(feature);
            },
            getAll: function() {
                var deferred = $q.defer();
                var urlId = urlPlace.concat(format);

                deferred.resolve(self.markerList);
                if(consoleCheck)console.log("GetAll Markers cached service!");

                //Now return the promise.
                return deferred.promise;
            },
            getAllFromCache: function() {
                return self.markerList;
            },
            get: function(id, details) {
                if(consoleCheck)console.log("Get Marker: ",id," details? ",details);
                var deferred = $q.defer();
                // se faccio una richiesta con per i dettagli
                if(self.markerDetailsList[id]) {
                    if(consoleCheck)console.log("Get Marker from cache!", self.markerDetailsList[id]);
                    deferred.resolve(self.markerDetailsList[id]);
                } else if(!details && self.markerList[id]){
                    if(consoleCheck)console.log("Get Marker from cache!", self.markerList[id]);
                    deferred.resolve(self.markerList[id]);
                }else {
                    // altrimenti chiamo il server per i dettagli
                    var urlId = urlThings.concat('/').concat(id).concat(format).concat("?detail=full").concat(" ");

                    var req = {
                        url: urlId,
                        method: 'GET',
                        //headers:{"Content-Type":"application/json"},
                        data:''
                    };
                    $http(req)
                        .success(function(response) {
                        if(consoleCheck)console.log("PlaceFactory, get, rensponse: ", response);
                        entityToMarker(response.data).then(
                            function(marker){
                                //aggiorno anche la lista dei dettagli
                                if(consoleCheck)console.log("PlaceFactory, get, rensponse > marker: ", marker);
                                updateMarkerList(marker,true);
                                deferred.resolve(marker);
                            },
                            function(err){
                                deferred.reject(err);
                                if(consoleCheck)console.log("placeFactory, get, entityToMarker, error: ",err);
                            }
                        );

                    })
                        .error(function(response) {
                        deferred.reject(response);
                        if(consoleCheck)console.log("Get Marker from server: error! ", response);
                    });
                }
                return deferred.promise;
            },
            getList: function(ids, details) {
                if(consoleCheck)console.log("Get Marker: ",id," details? ",details);
                var deferred = $q.defer();
                // se faccio una richiesta con per i dettagli
                if(self.markerDetailsList[id]) {
                    if(consoleCheck)console.log("Get Marker from cache!", self.markerDetailsList[id]);
                    deferred.resolve(self.markerDetailsList[id]);
                } else if(!details && self.markerList[id]){
                    if(consoleCheck)console.log("Get Marker from cache!", self.markerList[id]);
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
                    $http(req).then(function(response) {
                        var markerList = entitiesToMarker(response.data, true);
                        //aggiorno anche la lista dei dettagli
                        updateMarkerList(markerList,true);
                        deferred.resolve(markerList);
                        },
                        function(err){
                            deferred.reject(err);
                            if(consoleCheck)console.log("entityFactory, get, entityToMarker, error: ",err);
                        });
                }
                return deferred.promise;
            },
            update: function(entity, id) {
                var urlId = types[entity.entity_type].concat("/").concat(id).concat(format);
                var deferred =$q.defer();
                if(consoleCheck)console.log("UPDATE TO: ", urlId, entity);
                var feature = markerConverter(entity);
                if(consoleCheck)console.log("PlaceFactory, token: ", token);
                if(consoleCheck)console.log("PlaceFactory, update place query: ",entity,feature);
                var token = MemoryFactory.getToken();
                var req = {
                    url: urlId,
                    method: 'PUT',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:feature
                };
                if(consoleCheck)console.log("entityFactory, update: ",angular.toJson(feature));
                $http(req)
                    .success(function(response) {
                    if(consoleCheck)console.log("entityFactory, update, response: ",response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    if(consoleCheck)console.log("PlaceFactory, getBBox, rensponse, merge with geoJSON: ", self.geoJSON);
                    var marker = entityToMarker(response.data);
                    entityToMarker(response.data).then(
                        function(marker){
                            //aggiorno anche la lista dei dettagli
                            updateMarkerList(marker,true);
                            deferred.resolve(marker);
                        },
                        function(err){
                            deferred.reject(err);
                            if(consoleCheck)console.log("placeFactory, get, entityToMarker, error: ",err);
                        }
                    );

                })
                    .error(function(response) {
                    deferred.reject(response);
                    if(consoleCheck)console.log("Update Place on the server: error! ", response);
                });
                return deferred.promise;

            },
            create: function(entity) {
                var urlId = types[entity.entity_type].concat(format);
                var deferred = $q.defer();
                var feature = markerConverter(entity);
                var token = MemoryFactory.getToken();
                if(consoleCheck)console.log("PlaceFactory, token: ", token);
                if(consoleCheck)console.log("entityFactory, create entity query: ",angular.toJson(feature));
                var req = {
                    url: urlId,
                    method: 'POST',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:feature
                };
                if(consoleCheck)console.log("entityFactory, create: ",angular.toJson(feature));
                $http(req)
                    .success(function(response) {
                    if(consoleCheck)console.log("entityFactory, create, response: ",response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    if(consoleCheck)console.log("PlaceFactory, getBBox, rensponse, merge with geoJSON: ", self.geoJSON);
                    var marker = entityToMarker(response.data);
                    updateMarkerList(marker,true);
                    deferred.resolve(marker);
                }).error(function(response) {
                    deferred.reject(response);
                    if(consoleCheck)console.log("Created entity on the server: error! ", response);
                });
                return deferred.promise;
            },
            remove: function(entityId){
                if(consoleCheck)console.log("placeFactory, remove id: ",entityId);
                //trova id da id_wp
                var urlId = urlThings.concat("/").concat(entityId).concat(format);
                //var urlId = types[entity.entity_type].concat("/").concat(entity.id).concat(format);
                // cancello i marker dalla cache
                delete self.markerDetailsList[entityId];
                delete self.markerList[entityId];
                var token = MemoryFactory.getToken();
                if(consoleCheck)console.log("PlaceFactory, token: ", token);
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
                var urlId = urlBbox.concat(format);
                //var eType = ['FL_PLACES','FL_EVENTS'];
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
                if(consoleCheck)console.log("EntityFactory, getBBoxPlace, check history: ",self.bboxHistory[checkRst], self.BBOX_TIMEOUT);
                if(consoleCheck)console.log("EntityFactory, getBBoxPlace, check if 1: ",(self.config.behaviour.marker_cache && checkRst > -1 ));
                // aggiungo la since se la cache e' attiva
                if (self.config.behaviour.marker_cache && checkRst > -1 && !reset) {
                    // già in cache, aggiorno solo con since, al netto del timeout
                    var bboxTmp = self.bboxHistory[checkRst];
                    
                    if(consoleCheck)console.log("EntityFactory, getBBoxPlace, check if 2: ",(bboxTmp.timestamp.getTime()+self.BBOX_TIMEOUT<(new Date()).getTime()));
                    
                    if (bboxTmp.timestamp.getTime()+self.BBOX_TIMEOUT<(new Date()).getTime()) {
                        bboxParamsString += "&since="+bboxTmp.timestamp.toISOString();
                        if(consoleCheck)console.log("check bboxParamsString: ", bboxParamsString);
                        
                        
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
                if(consoleCheck)console.log("updateMarkersList, place caricato ",el, newMarkers[el], " anche nella lista dettagli? ",details); 
                var marker = newMarkers[el];
                self.markerList[marker.id] = marker; 

                if(details){
                    self.markerDetailsList[marker.id] = marker; 
                }
            }
        }

        function updateMarkerList(newMarker,details){
            if(consoleCheck)console.log("updateMarkersList, place caricato ",newMarker, " anche nella lista dettagli? ",details); 
            if(details){
                self.markerDetailsList[newMarker.id] = newMarker;
            }else{
                self.markerList[newMarker.id] = newMarker;
            }
            if(consoleCheck)console.log("aggiorno marker nella lista", self.markerList[newMarker.id], newMarker);
        }

        //upsert PLace per update e create!!!

        //private function
        function entitiesToMarker(data) {
            if(!data)
                return [];
            
            var featureCollection = data;
            if(consoleCheck)console.log("placeFactory, entitiesToMarker, featureCollection: ", featureCollection);
            var entityList = featureCollection.features;
            if(consoleCheck)console.log("entitiesToMarker entityFact", data, featureCollection, entityList);
            
            var markers = [];
            for (i = 0; i < entityList.length; i++) {
                if(consoleCheck)console.log("place da trasformare in marker", entityList[i], " numero: ",i);
                if(entityList[i] && entityList[i] != null && entityList[i] != 'undefined'){
                    var marker = markerCreate(entityList[i]);
                    if(marker){
                        if(consoleCheck)console.log("creato marker", marker, " aggiungo a : ",markers);
                        markers.push(marker);//markers[entityList[i].id] = marker;
                    }
                }
            }
            if(consoleCheck)console.log("Creazione del marker dall'entity: ", data, markers);
            return markers;
        }

        //private function
        function entityToMarker(data) {
            var deferred = $q.defer();
            if(consoleCheck)console.log("entityFactory, entityToMarker, data: ", data);
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
                        if(consoleCheck)console.log("entityToMarker", entity);
                        var marker = markerCreate(entity);
                        if(marker)
                            deferred.resolve(marker);
                        else
                            deferred.reject("Impossibile creare il marker!");
                    }
                }else if(data.id){
                    if(consoleCheck)console.log("risposta vuota ma ok ",data);
                    deferred.resolve({id:-2});
                }else {
                    if(consoleCheck)console.log("no data",data);
                    deferred.reject("no data");
                }
            }
            return deferred.promise;
        }        



        // creazione del marker dal geoJSON
        // da cancellare una volta cambiato il formato di visualizzazione
        function markerCreate(entity) {
            if(consoleCheck) console.log("EntityFactory, markerCreate, entity ",entity);
            //bugfix 
            if(Array.isArray(entity.properties))
                entity.properties = entity.properties[0];

            // gestione categorie multiple
            var mainCat = entity.properties.categories[0];

            
            var catIndex = self.categories.map(function(e){return e.category_space;}).indexOf(mainCat.category_space.id);
            var categories = self.categories[catIndex].categories;
            var colors = myConfig.design.colors;
            var iSize = self.config.map.marker_size,
                iAncor = self.config.map.marker_ancor;

            // costruisco lista delle icone possibili 
            var icons = {};
            var types = self.config.types.list,
                type = types[types.map(function(e){return e.key}).indexOf(entity.properties.entity_type)];
            
            if(consoleCheck)console.log("EntityFactory, markerCreate, type ",types, type, entity,self.categories);
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
                name:type.name,
                index: type.index,
                icon: type.icon,
                html : '<div class="pin-marker" style="background-color:'+ colors[type.index]+'"></div>'+
                '<div class="icon-box"><i class="icon ' + type.icon + '"></i></div>'
            };
            for(i in entity.properties.categories){
                var c       = entity.properties.categories[i];
                var cSpace = self.categories[self.categories.map(function(e){return e.category_space;}).indexOf(c.category_space.id)];
                var cats    = cSpace.categories;
                var index   = parseInt(cats.map(function(e) { return e.id; }).indexOf(entity.properties.categories[i].category_space.categories[0].id));
                var cat     = cats[index];
                if(consoleCheck) console.log("EntityFactory, markerCreate, cat ",c,cSpace,cats,index,cat);
                if(cSpace.is_visible){
                    icons[c.category_space.id] = {
                        type: 'div',    
                        className: 'css-pin-marker',
                        //name: cat.name,
                        iconSize:  iSize,
                        iconAnchor:   iAncor,
                        color: cat.color,
                        index: cat.colorIndex,
                        icon: cat.icon,
                        html : '<div class="pin-marker" style="background-color:'+ cat.color+'"></div>'+
                        '<div class="icon-box"><i class="icon ' + cat.icon + '"></i></div>'
                    };
                }
            }
            
            var catIndex = parseInt(categories.map(function(e) { return e.id; }).indexOf(entity.properties.categories[0].category_space.categories[0].id)),
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


            if(consoleCheck) console.log("markerCreate, entity: ", entity,category, categories, icons,type,mainCat.category_space, icons[mainCat.category_space]);
            
            var htmlIcon = '';
            htmlIcon = htmlIcon.concat('<i class="dotEventIcon icon ').concat(icons[0].icon).concat(' color').concat(icons[0].index).concat('"></i>');
            var checkRange = (!angular.equals(entity.properties.valid_to, entity.properties.valid_from) || !entity.properties.valid_from || !entity.properties.valid_to);

            var marker = {
                popupOptions : {closeOnClick:true},
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
                icon: icons[mainCat.category_space] ? icons[mainCat.category_space] : icons[0],
                name: entity.properties.name,
                description: entity.properties.description,
                text: entity.properties.text ? entity.properties.text : null,
                "message_text": entity.properties.message ? entity.properties.message : null,
                tags: entity.properties.tags,
                user: entity.properties.user,
                parent_id: entity.properties.parent_id ? entity.properties.parent_id : null,
                parent: {},
                location: entity.properties.location ? entity.properties.location : null,
                "article_of": entity.properties['article_of'] ? entity.properties['article_of'] : null,
                "comment_of": entity.properties['comment_of'] ? entity.properties['comment_of'] : null,
                level: entity.level ? entity.level : 0,
                children_id: entity.properties.children,
                children: {},
                valid_from: entity.properties.valid_from,
                valid_to: entity.properties.valid_to,
                id_wp: entity.properties.id_wp,
                self: urlThings.concat('/').concat(entity.id).concat('.html'),
                link_url : entity.properties.link_url,
                display_name: entity.properties.display_name,
                last_update: entity.properties.last_update,
                eTimeline : (entity.properties.valid_to || entity.properties.valid_to) ? {
                    id:parseInt(entity.properties.id),
                    icon: icons[mainCat.category_space] ? icons[mainCat.category_space] : icons[0],
                    lat: parseFloat(entity.geometry.coordinates[1]),
                    lng: parseFloat(entity.geometry.coordinates[0]),
                    'start': new Date(entity.properties.valid_from),
                    'end': new Date(entity.properties.valid_to),  // end is optional
                    'content':  htmlIcon,
                    "group": entity.level ? entity.level : 0,
                    "editable":false,
                    "type": "box"
                } : null
            };

            if(consoleCheck)console.log("Creazione del marker dal'entita': ", entity, marker);
            return marker;
        }
        // fine markerCreate



        function bboxQuery(url) {
            var deferred = $q.defer();
            if(consoleCheck)console.log("check header $http: ", $http.defaults.headers.common);
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
                    if(consoleCheck)console.log("EntityFactory, bboxQuery no since, get, response: ", response);
                    //angular.merge(self.geoJSON,response.data.data[0]);
                    if(consoleCheck)console.log("EntityFactory, bboxQuery, rensponse: ", response);
                    var markers = entitiesToMarker(response.data.data);
                    // aggiorno lista marker
                    updateMarkersList(markers,details);
                    deferred.resolve(markers);

                },function(response) {
                    if(consoleCheck)console.log("EntityFactory, errore: ", response);
                    deferred.reject(response);
                });

            return deferred.promise;
        }



        function checkBboxHistory(bbox) {
            if(consoleCheck)console.log("EntityFactory, checkBboxHistory, bbox: ",bbox, " esiste la history? ",self.bboxHistory);

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
                    if(consoleCheck)console.log(self.bboxHistory);
                }
                self.bboxHistory.filter(function(e) {
                    if (e.timestamp == 0) return false;
                    else return true;
                });

                bbox.timestamp = new Date();
                bbox.valid = true;
                self.bboxHistory.push(bbox);
                
                return -1;
            } else {
                //DISTRIBUTED!
                if(consoleCheck)console.log("Distributed mode ON");
                if(consoleCheck)console.log(bbox.parent_bbox);
                var hash = bbox.parent_bbox.hash;

                var toDelete = [];
                for (i = 0; i < self.bboxHistory.length; i++) {
                    var bbtmp = self.bboxHistory[i];
                    if (bbtmp.valid && bbtmp.hash != hash) {
                        //bbox valida e diversa dalla bbox padre (che non va considerata, perchè magari inesrita dalle altre richieste)
                        if(consoleCheck)console.log("confronto "+bbtmp+" con "+bbox);
                        if (bb1ContainsBb2(bbtmp, bbox))
                            return i; //bbox già considerate --> caching!
                        //return bbtmp; //bbox già considerate --> caching!
                        //else if (bb1ContainsBb2(bbox.parent_bbox, bbtmp))
                        //  self.bboxHistory[type][i].valid = false; //parent bbox contiene la bbox nella history --> invalidiamo la bbox nella history
                    }
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
                if(consoleCheck)console.log("NEW history: " + self.bboxHistory.length);
                if(consoleCheck)console.log(self.bboxHistory);

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
            }else if(place.coordinates){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(place.coordinates[0]),parseFloat(place.coordinates[1])]};
            }else if(place.lat){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(place.lng),parseFloat(place.lat)]};
            }
            var templateCollection = '{"type":"FeatureCollection","features":[]}';
            var featureCollection = angular.fromJson(templateCollection);
            featureCollection.features.push(feature);
            if(consoleCheck)console.log("PlaceFactory, markerConverter, from: ",place," to: ", angular.toJson(featureCollection));
            return featureCollection;
        }

    }]);
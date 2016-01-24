angular.module('firstlife.services')

    .service('MapService', ['myConfig', 'leafletData', 'categoriesFactory', 'entityFactory', '$ionicLoading', '$rootScope', '$q', '$cordovaGeolocation', function(myConfig, leafletData, categoriesFactory, entityFactory, $ionicLoading, $rootScope ,$q, $cordovaGeolocation) {

        self.config = myConfig;

        var baseLayer = {
            edit: {
                name: 'edit',
                type: 'xyz',
                url: config.map.tile_edit
            },
            view: {
                name: 'view',
                type: 'xyz',
                url: config.map.tile_view
            }
        };

        self.map = {};

        self.filters = {};
        self.filters.time = {from:self.config.map.time_from,to:self.config.map.time_to};

        
        // se mobile disattivo i controlli di zoom
        var controlZoom = true;
        if ( ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
            //console.log("mobile");
            controlZoom = false;
        } 

        

        return {
            getMapBounds: function(){
                var deferred = $q.defer();
                leafletData.getMap("mymap").then(function(map) {
                    console.log("MapService, getMapBounds, response: ",map);
                    deferred.resolve(map.getBounds());
                },function(response){
                    console.log("MapService, getMapBounds, errore: ",response);
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            searchFor: function(value,key){
                //console.log("MapService, searchFor, value e key: ",value,key);
                var results = [];
                var map = self.map.markers.map(
                    function(e){
                        //console.log("MapService, searchFor, value == e[key]?  ",value,e[key],(e[key] == value));
                        if(e[key] == value){
                            results.push(e);
                            return e
                        }
                        return null;
                    });
                //console.log("MapService, searchFor",value,key," risultati: ",results,map);
                return results;
            },
            setTimeFilters: function(time){
                console.log("MapService, setTimeFilters, time: ", time);
                self.filters.time = time;
            },
            initMap: function(){
                return initMap();
            },
            getMap: function(){
                var deferred = $q.defer();
                // controllo se ho la mappa in cache
                if(self.map){
                    deferred.resolve(self.map);
                }else{
                    initMap().then(function(map){deferred.resolve(map);},function(err){deferred.reject(false);})
                }
                return deferred.promise;
            },
            getBaseLayer: function(key){
                return baseLayer[key];
            },
            locate: function(coord){
                return locate(coord);
            },
            getCenter: function(){
                var deferred = $q.defer();
                leafletData.getMap("mymap").then(
                    function(map) {
                        // recupero centro della mappa
                        var center = map.getCenter();
                        // recupero zoom della mappa
                        var zoom = map.getZoom();
                        // restituisco centro + zoom
                        deferred.resolve({lat:center.lat, lng:center.lng, zoom:zoom});
                    },
                    function(err){deferred.reject();}           
                );
                return deferred.promise;
            },
            getCenterFromMap: function(){
                return self.map.center;
            },
            changeMode: function(mode){
                return changeMode(mode);
            },
            changeVisibility: function(item){
                console.log("MapServices, changeVisibility, item: ",item);
                return changeVisibility(item);
            },
            updateMarkersDistributed: function(){
                return updateMarkersDistributed();
            },
            resetMarkersDistributed: function(){
                return updateMarkersDistributed(true);
            },
            get: function(id){
                var deferred = $q.defer();
                // guardo nella cache

                //                if(id instanceof Array){
                //                    //richiesta multipla
                //                    entityFactory.getList(id).then(
                //                        function (markers){
                //                            //aggiorno i marker della mappa
                //                            updateMarkers(markers);
                //                            deferred.resolve(markers);
                //                        },
                //                        function (err){
                //                            deferred.reject(err);
                //                        }
                //                    );
                //
                //                }else{
                entityFactory.get(id, false).then(
                    function (marker){
                        //aggiorno i marker della mappa
                        updateMarker(marker);
                        deferred.resolve(marker);
                    },
                    function (err){
                        deferred.reject(err);
                    }
                );
                //}
                return  deferred.promise;
            },
            getDetails: function(id){
                var deferred = $q.defer();
                //disabilito la cache
                entityFactory.get(id, true).then(
                    function (marker){
                        //aggiorno i marker della mappa
                        console.log("MapService, getDetails, response: ",marker);
                        // non serve aggiornare updateMarker(marker);
                        deferred.resolve(marker);
                    },
                    function (err){
                        console.log("MapService, getDetails, error: ",err);
                        deferred.reject(err);
                    }
                );
                return  deferred.promise;
            },
            getAllPlace: function(){
                var deferred = $q.defer();
                entityFactory.getAll().then(
                    function (markers){
                        //aggiorno i marker della mappa
                        updateMarkers(markers);
                        deferred.resolve(markers);
                    },
                    function (err){
                        deferred.reject(err);
                    }
                );
                return  deferred.promise;
            },
            removeMarker: function(entity){
                var deferred = $q.defer();
                console.log("remove marker: ", entity.id);
                entityFactory.remove(entity).then(
                    function(response){
                        var index = self.map.markers.map(function(e){return e.id}).indexOf(entity.id);
                        if(index >= 0 ){
                            self.map.markers.splice(index,1);
                        }
                        console.log("MapService, deleteMarker, success: ", response);
                        deferred.resolve(response);
                    },
                    function(response){
                        console.log("MapService, deleteMarker, error: ", response);
                        deferred.reject(response);
                    }
                );
                return  deferred.promise;
            }
        };


        /*
         *  private function
         */

        function initMap(){
            var deferred = $q.defer();
            // init map
            setInitOptions();
            setDefaultLayers();
            setCategories().then(
                function(response){
                    //console.log("set categorie: ", response);
                    deferred.resolve(map);
                }, 
                function(err){
                    deferred.reject(false);
                });
            //return map;
            return deferred.promise;
        };


        // da cancellare
        // centra la mappa
        // accetta paramentri per la locate: center, bounds, user, marker
        function locate (coord){     
            console.log("centro su luogo, id: "+typeof(coord)+" ",coord);

            if(typeof(coord) === 'object' && 'bound' in coord){
                // fit della mappa al bound del fav. place
                leafletData.getMap("mymap").then(function(map) {
                    map.fitBounds(coord['bound']);
                });


            } else if(typeof(coord) === 'object' && 'lat' in coord && 'lng' in coord){
                // centro su coordinate
                /*self.map.center.lat = parseFloat(coord.lat);
                self.map.center.lng = parseFloat(coord.lng);
                if(coord.zoom != null){
                    self.map.center.zoom = parseInt(coord.zoom);
                } else if(self.map.center.zoom == null){
                    self.map.center.zoom = parseInt(config.map.zoom_create);
                }*/
                setMapCenter({lat:parseFloat(coord.lat),lng:parseFloat(coord.lng),zoom:parseInt(config.map.zoom_create)});
            } else if(typeof(coord) === 'number'){
                var marker = self.map.markers[coord];
                // se il marker esiste
                if(marker){
                    console.log("Location: ", marker);
                    self.map.center  = {
                        lat : marker.lat,
                        lng : marker.lng,
                        zoom : $rootScope.info_position.zoom
                    };
                    //console.log("nuova posizione", self.map.center);
                }else{
                    //altrimenti invoco una get
                    console.log("chiamo per :", coord);
                    entityFactory.get(coord).then(
                        function(marker){
                            // localizzo su marker
                            //console.log("Location: ", marker);
                            self.map.center  = {
                                lat : marker.lat,
                                lng : marker.lng,
                                zoom : $rootScope.info_position.zoom
                            };
                            //console.log("nuova posizione", self.map.center);
                        },
                        function(err){console.log("Location error: ",err);}
                    );
                }

            }else if(coord === 'user'){
                // localizzo su posizione utente
                // Setup the loader
                $ionicLoading.show({
                    content: '<div>Localizzazione in corso...<br> Assicurati di aver abilitato il gps o il browser!<i class="icon ion-loading-c"></i></div>',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 50,
                    showDelay: 0
                });


                //using ngCordova
                $cordovaGeolocation
                    .getCurrentPosition()
                    .then(function (position) {
                    console.log("posizione utente");
                    
                    self.map.center.lat  = position.coords.latitude;
                    self.map.center.lng = position.coords.longitude;
                    self.map.center.zoom = $rootScope.info_position.zoom;
                    
                    self.map.markers[0] = {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude,
                        focus: true,
                        draggable: false
                    };
                    $ionicLoading.hide();


                }, function(err) {
                    // error
                    console.log("Location error: ", err);
                    $ionicLoading.hide();

                });  

            }else{
                // posizione default della mappa
                self.map.center.lat = config.map.map_default_lat;
                self.map.center.lng = config.map.map_default_lng;
                self.map.center.zoom = config.map.zoom_level;
            }

        };// fine locate
        
        
        // centra mappa
        
        function setMapCenter(params){
            
            leafletData.getMap("mymap").then(function(map) {
                console.log("MapService, setMapCenter, response: ",map, " params ",params);
                var center = new L.LatLng(params.lat, params.lng);
                if(params.zoom){
                    map.panTo(center);
                }else{
                    map.setView(center, 8);
                }
            },function(response){
                console.log("MapService, setMapCenter, errore: ",response);
            });
        
        }
        

        // gestore cambio modalita' della mappa. es. esplora, aggiungi, etc...
        function changeMode(mode){
            //se sono gia' nella modalita'
            if(self.map.mode == mode)
                return false;

            // salvo la modalita' attuale
            self.map.mode = mode;
            // considero i casi
            switch(mode){
                case 'edit':
                    // cambio layer
                    changeBaseLayer('edit');
                    // disattivo i livelli
                    changeVisibility(false);
                    //console.log("edit mode");
                    break;  
                    //view
                default:
                    // cambio layer
                    changeBaseLayer('view');
                    changeVisibility(true);
                    // per il routing tengo traccia del cambio di stato della mappa
                    // to do routing 
                    break;
            }
            return true;
        };


        // cambio tile server (indice fornito dal myConfig caricato nella mappa)
        function changeBaseLayer (key) {
            // se il layer attuale e' gia' quello richiesto
            if(self.map.layer == key)
                return false;

            // salvo il layer attuale
            self.map.layer = key;
            leafletData.getMap("mymap").then(function (map) {

                leafletData.getLayers().then(function (layers) {
                    _.each(layers.baselayers, function (layer) {
                        map.removeLayer(layer);
                    });
                    map.addLayer(layers.baselayers[key]);
                });
            });
            return true;
        };

        // gestore livelli mappa
        // si comanda dal fitro categorie
        function changeVisibility(clickedItem){ 
            //changeMod to Edit: tutti off per la edit
            if(clickedItem===false){
                for(var el in self.map.layers.overlays){
                    self.map.layers.overlays[el].visible = false;
                }
            }
            //changeMod to View: tutti on per la view
            else if(clickedItem===true){
                for(var el1 in self.map.layers.overlays){
                    self.map.layers.overlays[el1].visible = true;
                }
            }
            //filtro all: attiva tutti i layer categorie (ed anche all!)
            else if(clickedItem===0 && !self.map.layers.overlays[0].visible){
                for(var el2 in self.map.layers.overlays){
                    self.map.layers.overlays[el2].visible = true;
                }
            }
            //filtro all: disattiva tutti i layer categorie
            else if(clickedItem===0 && self.map.layers.overlays[0].visible){
                for(var el3 in self.map.layers.overlays){
                    self.map.layers.overlays[el3].visible = false;
                }
            }
            else if(self.map.layers.overlays[clickedItem].visible){
                self.map.layers.overlays[clickedItem].visible = false;
            }
            else {
                self.map.layers.overlays[clickedItem].visible = true;
            }
        };


        // init della mappa
        function setInitOptions(info_position){
            //console.log("setInitOptions: ", myConfig);
            self.map = {
                defaults : {
                    maxZoom: config.map.max_zoom,
                    minZoom: config.map.min_zoom,
                    zoomControl: config.map.zoom && controlZoom ? true : false,
                    zoomControlPosition: config.map.zoom_position,
                    attributionControl: config.map.attribution
                },
                markers : [],
                center : {},
                bounds: {},
                controls: {},
                events : {},
                layers : {},
                //maxBounds: config.map.bounds,
                editMode: false,
                // controlli degli action button della mappa
                locate : config.actions.geolocation,
                search : config.actions.search,
                edit_action : config.actions.edit_mode,
                favourite_place : config.actions.favourite_place,
                category_filter : config.actions.category_filter,
                name: config.app_name
            };
        }

        // imposta i layer della mappa
        function setDefaultLayers() {
            self.map.layers = {
                baselayers: { 
                    view: baseLayer['view'],
                    edit: baseLayer['edit']
                },
                overlays: {
                    pie: {id: 1,
                          name: 'Categoria',
                          type: "markercluster",
                          visible: true, 
                          layerOptions: {
                              //chunkedLoading: true,
                              showCoverageOnHover: false,
                              zoomToBoundsOnClick: true,
                              spiderfyDistanceMultiplier: 2,
                              iconCreateFunction :bakeThePie
                          }
                         }
                }
            };
        }


        function setCategories() {
            var deferred = $q.defer();

            categoriesFactory.getAll()
                .then(
                function(cats) {
                    console.log("MapServices, categorie: ", cats);
                    self.map.categories = cats;
                    self.map.mainCategories = cats[0];
                    self.map.css = self.config.design.css;
                    deferred.resolve(cats);
                },
                function(error) {
                    //console.log("Failed to get all categories, result is " + error); 
                    deferred.reject(false);
                });
            return deferred.promise;
        };

        // update markers
        function updateMarkersDistributed(reset) {
            var deferred = $q.defer();

            if(!reset)
                reset = false;

            console.log("MapService, updateMarkersDistributed, filtro temporale? ",self.filters.time);

            leafletData.getMap("mymap").then(function(map) {

                var bounds = map.getBounds();

                // tempo impostato sul tempo correntes
                var hash=new Date().getTime();

                var bbox = {
                    ne_lat: bounds.getNorthEast().lat,
                    ne_lng: bounds.getNorthEast().lng,
                    sw_lng: bounds.getSouthWest().lng,
                    sw_lat: bounds.getSouthWest().lat,
                    limit: 600,
                    // la bounding box viene chiamata sul tempo corrente
                    hash: hash,
                    from: self.filters.time.from ? self.filters.time.from.toISOString() : null,
                    to: self.filters.time.to ? self.filters.time.to.toISOString() : null
                }

                var SPLIT_FACTOR = self.config.behaviour.split_factor;
                var deltaLat = (bbox.ne_lat - bbox.sw_lat) / SPLIT_FACTOR;
                var deltaLng = (bbox.ne_lng - bbox.sw_lng) / SPLIT_FACTOR;
                for (var i = 0; i < SPLIT_FACTOR; i++) {
                    for (var j = 0; j < SPLIT_FACTOR; j++) {

                        var bboxTmp = {
                            ne_lat: bbox.sw_lat + deltaLat * (i + 1),
                            ne_lng: bbox.sw_lng + deltaLng * (j + 1),
                            sw_lng: bbox.sw_lng + deltaLng * (j),
                            sw_lat: bbox.sw_lat + deltaLat * (i),
                            //limit: 300,
                            parent_bbox: bbox,
                            i: i,
                            j: j,
                            from: bbox.from,
                            to: bbox.to
                        }
                        // se la cache è disabilitata o reset = true
                        if(!self.config.behaviour.marker_cache || reset){
                            //azzero i marker della mappa
                            //console.log("azzero i marker della mappa");
                            self.map.markers = [];
                        }
                        //console.log("parametri query BBox: ", bboxTmp);
                        entityFactory.getBBoxPlace(bboxTmp,reset)
                            .then(
                            function(markers) {
                                if (markers) {
                                    updateMarkers(markers);
                                }
                                deferred.resolve(true);
                            },
                            function(error) {
                                //console.log("Failed to get all markers, result is " + error);
                                deferred.reject(false);
                            });
                        entityFactory.getBBoxEvent(bboxTmp,reset)
                            .then(
                            function(markers) {
                                if (markers) {
                                    updateMarkers(markers);
                                }
                                deferred.resolve(true);
                            },
                            function(error) {
                                //console.log("Failed to get all markers, result is " + error);
                                deferred.reject(false);
                            });

                    }
                }
            });
            return deferred.promise;
        };

        function updateMarkers(markers){
            //console.log("MapService, updateMarkers, markers: ",markers);
            if (markers) {
                for (var key in markers) {
                    updateMarker(markers[key]);
                }
            }

        }
        function updateMarker(marker){
            var index = self.map.markers.map(function(e){return e.id;}).indexOf(marker.id);
            //console.log("MapService, updateMarker, marker: ",marker," indice: ",index, " array: ",self.map.markers);
            if(marker &&  index < 0){
                self.map.markers.push(marker);
            }else{
                self.map.markers[index] = marker;
            }
        }
        function bakeThePie(cluster) {
            var markers = cluster.getAllChildMarkers();
            //console.log("cluster: ",markers);
            var granularity = 5;
            var total = cluster.getChildCount();
            //console.log("totale: ",total);
            var sum = 0,
                html = '';

            var item = {};
            for(i in markers){
                var id = markers[i].options.category.index;
                if(item[id]){
                    item[id].count++;
                }else{
                    item[id] = markers[i].options.category;
                    item[id].count = 1;
                }
            }
            //console.log("fette di torta: ", item);
            for(i in item){
                var value = Math.round(item[i].count*360/(granularity*total))*granularity;  	
                item[i].degree = value;
                //console.log("calcolo: ",i,item[i],item[i].value, item[i].degree);
                if(value > 180){
                    html = html.concat('<div class="pie big pie'+item[i].colorIndex+'" data-start="'+sum+'" data-value="'+value+'"></div>');
                }else{
                    html = html.concat('<div class="pie pie'+item[i].colorIndex+'" data-start="'+sum+'" data-value="'+value+'"></div>');

                }
                sum += value;

            }
            html = html.concat('<div class="inner"><span>'+total+'</span></div>');
            //tieni per i test semplici return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
            return new L.DivIcon({ html: html,className: 'pie-cluster',iconSize: new L.Point(40, 40) });
        }


    }])
    .run(function(categoriesFactory, MapService){
    //console.log("run config MapService");
    MapService.initMap().then(function(map){console.log("init map: ", map);});
});
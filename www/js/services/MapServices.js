angular.module('firstlife.services')

    .service('MapService', ['myConfig', 'leafletData', 'entityFactory', '$ionicLoading', '$rootScope', '$q', '$cordovaGeolocation', function(myConfig, leafletData, entityFactory, $ionicLoading, $rootScope ,$q, $cordovaGeolocation) {

        self.config = myConfig;

        var consoleCheck = false;

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

        self.map = {
            center: {
                lat: self.config.map.map_default_lat,
                lng: self.config.map.map_default_lng,
                zoom: self.config.map.zoom_level
            }
        };

        self.filters = {};
        self.filters.time = {
            from: self.config.map.time_from,
            to: self.config.map.time_to
        };


        // se mobile disattivo i controlli di zoom
        var controlZoom = true;
        if ( ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
            //if(consoleCheck) console.log("mobile");
            controlZoom = false;
        } 



        return {
            getMapBounds: function(){
                var deferred = $q.defer();
                leafletData.getMap("mymap").then(function(map) {
                    if(consoleCheck) console.log("MapService, getMapBounds, response: ",map);
                    deferred.resolve(map.getBounds());
                },function(response){
                    if(consoleCheck) console.log("MapService, getMapBounds, errore: ",response);
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            searchFor: function(value,key){
                //if(consoleCheck) console.log("MapService, searchFor, value e key: ",value,key);
                var results = [];
                updateMarkers(entityFactory.getAllFromCache());
                var map = self.map.markers.map(
                    function(e){
                        //if(consoleCheck) console.log("MapService, searchFor, value == e[key]?  ",value,e[key],(e[key] == value));
                        if(e[key] == value){
                            results.push(e);
                            return e
                        }
                        return null;
                    });
                //if(consoleCheck) console.log("MapService, searchFor",value,key," risultati: ",results,map);
                return results;
            },
            setTimeFilters: function(time){
                if(!self.filters)
                    self.filters = {};
                if(consoleCheck) console.log("MapService, setTimeFilters, time: ",self.filters.time, time);
                self.filters.time = time;
            },
            getTimeFilters: function(){
                if(angular.equals({}, self.filters) || angular.equals({}, self.filters.time)){
                    return false;
                }
                return self.filters.time;
            },
            initMap: function(){
                return initMap();
            },
            getMap: function(){
                // controllo se ho la mappa in cache
                if(consoleCheck) console.log("MapService, getMap", self.map);
                if(self.map){
                    return self.map;
                }else{
                    return initMap();
                }
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
                        if(consoleCheck) console.log("MapServices, getCenter, map ",map," center ",center);
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
            updateMarkersDistributed: function(){
                return updateMarkersDistributed();
            },
            resetMarkersDistributed: function(){
                return updateMarkersDistributed(true);
            },
            resetMarkers: function(){
                self.map.markers = [];
                return [];
            },
            get: function(id){
                console.log("mapservice get!");
                var deferred = $q.defer();
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
                return  deferred.promise;
            },
            getDetails: function(id){
                console.log("mapservice getDetails!");
                var deferred = $q.defer();
                //disabilito la cache
                entityFactory.get(id, true).then(
                    function (marker){
                        //aggiorno i marker della mappa
                        if(consoleCheck) console.log("MapService, getDetails, response: ",marker);
                        // non serve aggiornare updateMarker(marker);
                        deferred.resolve(marker);
                    },
                    function (err){
                        if(consoleCheck) console.log("MapService, getDetails, error: ",err);
                        deferred.reject(err);
                    }
                );
                return  deferred.promise;
            },
            getAll: function(){
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
            removeMarker: function(entityId){
                var deferred = $q.defer();
                if(consoleCheck) console.log("remove marker id: ", entityId);
                entityFactory.remove(entityId).then(
                    function(response){
                        var index = self.map.markers.map(function(e){return e.id}).indexOf(entityId);
                        if(index >= 0 ){
                            self.map.markers.splice(index,1);
                        }
                        if(consoleCheck) console.log("MapService, deleteMarker, success: ", response);
                        deferred.resolve(response);
                    },
                    function(response){
                        if(consoleCheck) console.log("MapService, deleteMarker, error: ", response);
                        deferred.reject(response);
                    }
                );
                return  deferred.promise;
            },
            createMarker :function(entity){
                var deferred = $q.defer();
                if(consoleCheck) console.log("create marker: ", entity.id);
                entityFactory.create(entity).then(
                    function(marker){
                        var index = self.map.markers.map(function(e){return e.id}).indexOf(entity.id);
                        if(index >= 0 ){
                            self.map.markers[index] = marker;
                            deferred.resolve(marker);
                        }else{
                            self.map.markers.push(marker);
                        }
                        if(consoleCheck) console.log("MapService, createMarker, success: ", marker);
                        deferred.resolve(marker);
                    },
                    function(err){
                        if(consoleCheck) console.log("MapService, createMarker, error: ", err);
                        deferred.reject(err);
                    }
                );
                return  deferred.promise;
            },

            updateMarker :function(entity){
                var deferred = $q.defer();
                if(consoleCheck) console.log("update marker: ", entity.id);
                entityFactory.update(entity).then(
                    function(marker){
                        var index = self.map.markers.map(function(e){return e.id}).indexOf(entity.id);
                        if(index >= 0 ){
                            self.map.markers[index] = marker;
                            deferred.resolve(marker);
                        }else{
                            self.map.markers.push(marker);
                        }
                        if(consoleCheck) console.log("MapService, updateMarker, success: ", marker);
                        deferred.resolve(marker);
                    },
                    function(err){
                        if(consoleCheck) console.log("MapService, updateMarker, error: ", err);
                        deferred.reject(err);
                    }
                );
                return  deferred.promise;
            }
        };


        /*
         *  private function
         */

        function initMap(){
            // init map
            setInitOptions();
            setDefaultLayers();
            setCategories();
            return map;
        };


        // centra mappa

        function setMapCenter(params){
            if(consoleCheck) console.log("MapService, setMapCenter, params ",params);
            leafletData.getMap("mymap").then(function(map) {
                if(consoleCheck) console.log("MapService, setMapCenter, response: ",map, " params ",params);
                var center = new L.LatLng(params.lat, params.lng);
                if(params.zoom){
                    map.setView(center, parseInt(params.zoom));
                }else{
                    map.setView(center, parseInt(config.map.zoom_level));
                }
            },function(response){
                if(consoleCheck) console.log("MapService, setMapCenter, errore: ",response);
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
                    //if(consoleCheck) console.log("edit mode");
                    break;  
                    //view
                default:
                    // cambio layer
                    changeBaseLayer('view');
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




        // init della mappa
        function setInitOptions(){

            self.map = {
                defaults : {
                    maxZoom: config.map.max_zoom,
                    minZoom: config.map.min_zoom,
                    zoomControl: config.map.zoom && controlZoom ? true : false,
                    zoomControlPosition: config.map.zoom_position,
                    attributionControl: config.map.attribution
                },
                markers : [],
                center : {
                    lat:config.map.map_default_lat,
                    lng:config.map.map_default_lng,
                    zoom:config.map.zoom_level
                },
                bounds: {},
                controls: {
                    zoomControl: config.map.zoom && controlZoom ? true : false,
                    zoomControlPosition: config.map.zoom_position,
                    attributionControl: config.map.attribution
                },
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
            if(consoleCheck) console.log("setInitOptions: ", self.map);
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
                          //type: "group",
                          visible: true, 
                          layerOptions: {
                              //chunkedLoading: true,
                              showCoverageOnHover: false,
                              //zoomToBoundsOnClick: false,
                              spiderfyDistanceMultiplier: 2,
                              //maxClusterRadius: 80,
                              //disableClusteringAtZoom: self.config.map.cluster_limit,
                              chunkedLoading: true,
                              //chunkDelay:500,
                              //chunkInterval:200,
                              iconCreateFunction :bakeThePie,
                              zoomToBoundsOnClick:true

                          }
                         }
                }
            };
        }


        function setCategories() {
            var cats = self.config.types.categories;
            if(consoleCheck) console.log("MapServices, categorie: ", cats);
            self.map.categories = cats;
            self.map.mainCategories = cats[0];
            self.map.css = self.config.design.css;

            return cats;
        };

        // update markers
        function updateMarkersDistributed(reset) {
            var deferred = $q.defer();

            if(!reset)
                reset = false;

            if(consoleCheck) console.log("MapService, updateMarkersDistributed, filtro temporale? ", self.filters.time);

            leafletData.getMap("mymap").then(function(map) {

                var bounds = map.getBounds();

                // tempo impostato sul tempo correntes
                var hash=new Date().getTime();

                var from = self.filters.time.from,
                    to = self.filters.time.to;

                var bbox = {
                    ne_lat: bounds.getNorthEast().lat,
                    ne_lng: bounds.getNorthEast().lng,
                    sw_lng: bounds.getSouthWest().lng,
                    sw_lat: bounds.getSouthWest().lat,
                    limit: 600,
                    // la bounding box viene chiamata sul tempo corrente
                    hash: hash,
                    from: from ? from.toISOString() : null,
                    to: to ? to.toISOString() : null
                }

                var SPLIT_FACTOR = self.config.behaviour.split_factor;
                var deltaLat = (bbox.ne_lat - bbox.sw_lat) / SPLIT_FACTOR;
                var deltaLng = (bbox.ne_lng - bbox.sw_lng) / SPLIT_FACTOR;
                var q = 0;
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
                            if(consoleCheck) console.log("azzero i marker della mappa");
                            self.map.markers = [];
                        }
                        //if(consoleCheck) console.log("parametri query BBox: ", bboxTmp);
                        entityFactory.getBBox(bboxTmp,reset)
                            .then(
                            function(markers) {
                                if (markers) {
                                    updateMarkers(markers);
                                    if(consoleCheck) console.log("MapServices, updateMarkersDistributed, markers ",markers);
                                }
                                deferred.resolve(markers);
                            },
                            function(error) {
                                if(consoleCheck) console.log("Failed to get all markers, result is " , error);
                                deferred.reject(error);
                            });
                        q++;
                    }
                    q++;
                }
            });
            return deferred.promise;
        };

        function updateMarkers(markers){
            if(consoleCheck) console.log("MapService, updateMarkers, markers: ",markers);
            if (markers) {
                for (var key in markers) {
                    updateMarker(markers[key]);
                }
            }
            if(consoleCheck) console.log("MapService, updateMarkers, markers fine: ",self.map.markers);
        }
        function updateMarker(marker){
            var index = self.map.markers.map(function(e){return e.id;}).indexOf(marker.id);
            if(consoleCheck) console.log("MapService, updateMarker, marker: ",marker," indice: ",index, " array: ",self.map.markers);
            if(marker &&  index < 0){
                self.map.markers.push(marker);
            }else{
                self.map.markers[index] = marker;
            }
            if(consoleCheck) console.log("MapService, updateMarker, markers: ",self.map.markers);
        }
        function bakeThePie(cluster) {
            var markers = cluster.getAllChildMarkers();
            //if(consoleCheck) console.log("bakeThePie, cluster: ",markers);
            var granularity = 5;
            var total = cluster.getChildCount();
            //if(consoleCheck) console.log("totale: ",total);
            var sum = 0,
                html = '';

            var item = {};
            for(i in markers){
                //if(consoleCheck) console.log("bakeThePie, check ",markers[i].options.icon.options);
                var id = markers[i].options.icon.options.index;
                if(item[id]){
                    item[id].count++;
                }else{
                    item[id] = {index:markers[i].options.icon.options.index, color:markers[i].options.icon.options.color,
                                count:1};
                }
                //if(consoleCheck) console.log("bakeThePie, check2 ",item[id]);
            }
            //if(consoleCheck) console.log("fette di torta: ", item);
            for(i in item){
                var value = Math.round(item[i].count*360/(granularity*total))*granularity;  	
                item[i].degree = value;
                //if(consoleCheck) console.log("bakeThePie, calcolo: ",i,item[i],value, item[i].degree);
                if(value > 180){
                    html = html.concat('<div class="pie big pie'+(item[i].index)+'" data-start="'+sum+'" data-value="'+value+'"></div>');
                }else{
                    html = html.concat('<div class="pie pie'+(item[i].index)+'" data-start="'+sum+'" data-value="'+value+'"></div>');

                }
                sum += value;

            }
            html = html.concat('<div class="inner"><span>'+total+'</span></div>');
            //tieni per i test semplici return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
            return new L.DivIcon({ html: html,className: 'pie-cluster',iconSize: new L.Point(40, 40) });
        }


    }])
    .run(function(MapService){
    //if(consoleCheck) console.log("run config MapService");
    //MapService.initMap();
});
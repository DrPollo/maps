/**
 * Created by drpollo on 14/04/2017.
 */
angular.module('firstlife.directives').directive('flmap',function () {
    return {
        restrict: 'EG',
        scope:{
            map:'<'
        },
        templateUrl:'/templates/map/flmap.html',
        controller: ['$scope','$log', '$location', '$timeout','myConfig','ThingsService', 'leafletData', 'PlatformService', function ($scope, $log, $location,$timeout, myConfig, ThingsService, leafletData, PlatformService) {

            // markers
            $scope.markers = {};
            $scope.currentMarkers = {};
            // referenza diretta alla mappa
            var mapRef = null;
            // referenza diretta all'overlay clustermarker
            var pieRef = null;
            // gestione inputmap
            var currentFeature = null;
            var triesLimit = 5;
            var tries = 0;

            var timer = null;

            var isMobile = PlatformService.isMobile();

            // disabilito i comandi zoom in caso di mobile
            if(!isMobile)
                var zoomControl = L.control.zoom({position:'bottomleft'});

            // todo sposta configurazione in un provider
            var scales = myConfig.map.scales;

            var orange = '#FC4A00';
            var red = '#ef473a';
            var green = '#33cd5f';
            var blue = '#6C93B3';
            var yellow = '#ffc900';
            var white = '#fff';
            // defaults vectorGrid
            var vectormapUrl = "https://tiles.firstlife.org/tile/{z}/{x}/{y}";
            // reset styles
            var resetStyle = {
                color: 'transparent',
                weight:0,
                fillColor: 'transparent'
            };
            L.Path.mergeOptions(resetStyle);
            L.Polyline.mergeOptions(resetStyle);
            L.Polygon.mergeOptions(resetStyle);
            L.Rectangle.mergeOptions(resetStyle);
            L.Circle.mergeOptions(resetStyle);
            L.CircleMarker.mergeOptions(resetStyle);
            // config del layer

            var vectorMapStyling = {
                interactive:function(properties,z) {
                    var style = {
                        weight: 1,
                        color: orange,
                        opacity: 1,
                        fill: true
                    };
                    if (properties.type === 'indoor') {
                        style.fillColor = orange;
                        style.fillOpacity = 0.5;
                    }
                    return style;
                }
            };
            function interactiveStyle(type){
                var style = {
                    fill: true,
                    weight: 1,
                    fillColor: '#fafafa',
                    color: orange,
                    fillOpacity: 0.85,
                    opacity: 1
                };
                switch(type){
                    case 'administrative':
                        style.weight = 2;
                        style.fillColor = red;
                        style.fillOpacity = 0.65;
                        break;
                    case 'highway':
                        style = {};
                        break;
                    case 'landuse':
                        style.fillColor = green;
                        break;
                    case 'leisure':
                        style.fillColor = yellow;
                        break;
                    case 'site':
                        style.fillColor = green;
                        break;
                    case 'indoor':
                        style.fillColor = white;
                        style.fillOpacity = 0.95;
                        break;
                    case 'city_block':
                        style.fillColor = yellow;
                        break;
                    case 'building':
                        style.fillColor = blue;
                        style.fillOpacity = 0.95;
                        break;
                    default:
                }
                return  style;
            }
            var vectormapConfig = {
                getFeatureId:function (e) {
                    return e.properties.id;
                },
                rendererFactory: L.svg.tile,
                attribution: false,
                vectorTileLayerStyles: vectorMapStyling,
                interactive: true
            };
            // vector grid
            var vGrid = L.vectorGrid.protobuf(vectormapUrl, vectormapConfig);

            /*
             * Listner esterni
             */

            $scope.$on('filterMarkers',function (e) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('filterMarkers!');
                filterMarkers();
            });
            $scope.$on('updateMarkers',function (e) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('updateMarkers');
                updateMarkers();
            });
            $scope.$on('deleteMarker',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                removeMarker(args.id);
            });
            $scope.$on('goToLocation',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('goToLocation!',args);

                changeLocation(args);
            });

            /*
             * Listner interni
             */

            // inizializzazione mappa
            // mappa si muove, aggiorno la posizione nella search e partono le chiamate per l'update dei marker
            $scope.$on('leafletDirectiveMap.mymap.load', function(event, args) {
                if(event.defaultPrevented)
                    return ;

                event.preventDefault();

                // $log.debug('map loaded');

                leafletData.getMap().then(
                    function (map) {
                        // $log.debug('save map reference');
                        mapRef = map;

                        // init dei marker
                        $timeout(flushMarkers,500);

                        initCentre();
                        initListners();
                        // se definito
                        if(zoomControl)
                            mapRef.addControl(zoomControl);
                    },
                    function (err) {
                        $log.error(err);
                    }
                );

                // listners al livello tile
                leafletData.getLayers().then(
                    function (layers) {
                        // $log.debug('flmap layers',layers.overlays.pie);
                        // salvo il riferimento all'overlay
                        pieRef = layers.overlays.pie;

                        pieRef.on('click',function (e) {
                            // $log.debug('click on marker',e.layer.options.id);
                            $location.search('entity',e.layer.options.id);
                            $scope.$emit('wallClick',{id: e.layer.options.id});
                        })
                        // $log.debug('init layer ref',!$scope.tileLayer);
                        if(!$scope.tileLayer) {
                            $scope.tileLayer = layers.baselayers.view;
                            // $log.debug('tile layer',$scope.tileLayer);
                            $scope.tileLayer.on('tileload', function (e) {
                                // $log.debug('tileload',e);
                                // al caricamento delle tile carico i marker relativi alle tile
                                addTile(e.coords);
                            });
                            $scope.tileLayer.on('tileunload', function (e) {
                                // $log.debug('tileunload',e.coords);
                                removeTile(e.coords);
                            });
                        }
                    }
                );
            });


            function initListners() {
                $scope.$on('leafletDirectiveMap.mymap.moveend', function(event, args) {
                    if(event.defaultPrevented)
                        return ;

                    event.preventDefault();

                    if(timer)
                        $timeout.cancel(timer);

                    var center = mapRef.getCenter();
                    var z = mapRef.getZoom();
                    $location.search("c",center.lat+':'+center.lng+':'+z);
                    // $log.debug('moveend');

                    if($scope.editMode){
                        timer = $timeout(updateGridStyle,500);
                        tries = 0;
                    }else{
                        timer = $timeout(flushMarkers,500);
                    }
                    // if($scope.editMode){
                    //     var center = mapRef.getCenter();
                    //     var z = mapRef.getZoom();
                    //     var hash =
                    //         $location.search("c",center.lat+':'+center.lng+':'+z);
                    // }
                });
                $scope.$on('leafletDirectiveMap.mymap.movestart', function(event, args) {
                    if(event.defaultPrevented)
                        return ;

                    event.preventDefault();

                    // $log.debug('movestart');
                    if(timer)
                        $timeout.cancel(timer);
                });

                /*
                 * gestione stato parametri search
                 */


                // al cambio del centro della mappa aggiorno il parametro search c
                $scope.$on("centerUrlHash", function(event, centerHash) {
                    if(event.defaultPrevented)
                        return;
                    event.preventDefault();
                    // $log.debug("url", centerHash);
                    $location.search('c', centerHash);
                });


                $scope.$on('wallMarkerClick',function (event,args) {
                    if(event.defaultPrevented)
                        return;
                    event.preventDefault();

                    if(args.id){
                        locateEntity(args.id);
                        $location.search('entity',args.id);
                        $scope.$emit('wallClick',{id: args.id});
                    }
                });
            }



            /*
             * Funzioni private
             */

            // se non e' presente c in $location.search() c lo imposto al centro della mappa
            function initCentre() {
                if($location.search().c){
                    var c = $location.search().c.split(':');
                    // $log.debug($location.search(),c);
                    mapRef.setView(L.latLng(c[0], c[1]),c[2]);
                }else{
                    $location.search('c', $scope.map.center.lat+':'+$scope.map.center.lng+':'+$scope.map.center.zoom);
                }
            }


            function changeLocation(params) {
                var hash = params.lat+':'+params.lng;
                hash = hash.concat(':',params.zoom || mapRef.getZoom());

                // $log.debug('change location',hash);
                if(mapRef){
                    var z = params.zoom || mapRef.getZoom();
                    mapRef.setView(L.latLng(params.lat, params.lng),z);
                }
                if($location.search().c !== hash){
                    $location.search({ c: hash });
                }
            }

            function locateEntity(entityId){
                // $log.debug('locate entity',entityId);
                var marker = $scope.markers[entityId];
                // se il marker esiste
                if(marker){
                    var center = {lat:marker.lat,lng:marker.lng};
                    if(marker.zoom_level)
                        center.zoom = marker.zoom_level;
                    // $log.debug('locate entity cached',center);
                    changeLocation(center);
                }else{
                    //altrimenti invoco una get
                    ThingsService.get(entityId).then(
                        function(marker){
                            var center = {lat:marker.lat,lng:marker.lng};
                            if(marker.zoom_level)
                                center.zoom = marker.zoom_level;
                            // $log.debug('remote entity',center);
                            changeLocation(center);
                        },
                        function(err){$log.error("Location error: ",err);}
                    );
                }
            }

            // filtro i marker in cache
            function flushMarkers() {
                if(!pieRef)
                    return
                // chiamate alle tile attive
                ThingsService.flushTiles().then(
                    function (markers) {
                        // $log.debug('updated markers',Object.keys(markers).length);
                        // angular.extend($scope.markers,markers);
                        addMarkers(markers);
                        $scope.$emit('markerUpdated');
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }
            // filtro i marker in cache
            function updateMarkers() {
                if(!pieRef)
                    return;

                // reset markers

                // chiamate alle tile attive
                ThingsService.flushTiles().then(
                    function (markers) {
                        // $log.debug('updated markers',Object.keys(markers).length);
                        // $scope.markers = angular.extend({},markers);
                        removeMarkers();
                        addMarkers(markers);
                        $scope.$emit('markerUpdated');
                    },
                    function(err){
                        $log.error(err);
                    }
                );
            }

            // query for a tile
            function addTile(tile){
                ThingsService.addTile(tile);
                // todo grid based query
                // ThingsService.getTile(tile).then(
                //     function (markers) {
                //         addMarkers(markers);
                //     },
                //     function (err) {
                //         $log.error(err);
                //     }
                // );
            }
            // remove a tile
            function removeTile(tile){
                ThingsService.removeTile(tile);
                // todo rimuovi i contenuti localmente
            }



            // filtro i marker in cache
            function filterMarkers() {
                // chiedo cosa devo eliminare
                ThingsService.filter().then(
                    function (markers) {
                        removeMarkers();
                        addMarkers(markers);
                        $scope.$emit('markerUpdated');
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }
            // add the markers keeping the reference
            function addMarkers(markers) {
                // $log.debug('to be added',Object.keys(markers).length);
                console.time('add markers');
                angular.extend($scope.currentMarkers, Object.keys(markers).reduce(function(currentMarkers,markerId){
                    if(!$scope.currentMarkers[markerId]){
                        currentMarkers[markerId] = addMarker(markers[markerId]);
                    } else {
                        $scope.currentMarkers[markerId].setIcon(L.divIcon(markers[markerId].icon));
                    }
                    return currentMarkers;
                },{}));
                console.timeEnd('add markers');
            }
            // add marker creates a maker and adds it to the map returning the reference
            function addMarker(marker) {

                var marker = L.marker(marker, {
                    id: marker.id,
                    icon: L.divIcon(marker.icon),
                    clickable:false,
                    draggable:false,
                    keyboard: true,
                    title: marker.name,
                    alt: marker.name
                });
                marker.addTo(pieRef);
                return marker;
            }
            // remove each marker from a list of id
            function removeMarkers(){
                // reset indice marker
                $scope.currentMarkers = {};
                // reset layer marker clusters
                return pieRef.clearLayers();
            }


            function resetMarkers() {

                pieRef.clearLayers();
            }

            function cleanMarkers(ids){
                ids.map()
            }

            function removeMarker(markerId) {
                if(markerId && $scope.currentMarkers[markerId]){
                    pieRef.removeLayer($scope.currentMarkers[markerId]);
                    delete $scope.currentMarkers[markerId];
                }
            }








            /*
             * Gestione edit mode
             *
             * Listners:
             * <enterEditMode> attiva la modalita' edit, setup flags e modifica layers
             * <exitEditMode> reset mappa e disiscrizione listners
             *
             * Funzioni pubbliche:
             * [getLocation] al click utente invia le informazioni per l'edit/creazione di un entita'
             */
            $scope.$on('enterEditMode',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                $scope.editMode = true;
                addEditLayers();
                tries = 0;
                $timeout(updateGridStyle,500);
            });
            $scope.$on('exitEditMode',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                removeEditLayers();
                // hide pointer
                $scope.editMode = false;
            });

            $scope.getLocation = function(){
                // get geo feature
                var size = mapRef.getSize();
                var point = L.point(Math.floor(size.x/2),Math.floor(size.y/2));
                var center = mapRef.getCenter();
                var z = mapRef.getZoom();
                var tile = pointToTile(center.lat,center.lng,z);
                var tileid = tile[0]+':'+tile[1]+':'+tile[2];
                $scope.editMode = false;
                $timeout(function () {
                    var el = document.elementFromPoint(point.x,point.y);
                    var id = L.stamp(el);
                    try{
                        var properties = mapRef._targets[id].properties;
                    } catch (e){
                        $log.debug('no properties');
                    };
                    var args = {id:null, tile: tile, zoom_level:z, tile_id:tileid, lat:center.lat, lng:center.lng};
                    if(properties){
                        args.area_id = properties.id;
                        args.type = properties.type;
                    }
                    //{lat:e.target.options.latlng.lat,lng:e.target.options.latlng.lng,zoom_level:e.target.options.zoom_level,area_id:e.target.options.id,id:null}
                    $log.debug('createEntity',args);
                    $scope.$emit('createEntity',args);
                    // removeEditLayers();
                },300);
            };

            $scope.maxZoom = myConfig.map.max_zoom;
            $scope.minZoom = myConfig.map.min_zoom;

            $scope.zoomIn = function(){
                // zoom in
                $scope.z = scales[mapRef.getZoom()].zoomin;
                $log.debug('go to zoom ',$scope.z);
                mapRef.setZoom($scope.z);
            };
            $scope.zoomOut = function(){
                // zoom
                $scope.z = scales[mapRef.getZoom()].zoomout;
                $log.debug('go to zoom ',$scope.z);
                mapRef.setZoom($scope.z);
            };



            var editLayer = null;
            function addEditLayers(){
                editLayer = L.tileLayer($scope.map.layers.baselayers.edit.url,$scope.map.layers.baselayers.edit.layerOptions);
                // $log.debug(editLayer);
                // add tile layer
                editLayer.addTo(mapRef);

                // add the vectory grid layer
                vGrid.addTo(mapRef);
                // add mouse events
                // vGrid.on('mouseover',function (e) {
                //     $log.debug('mouseover',e);
                // });
                // vGrid.on('mouseout',function (e) {
                //     $log.debug('mouseout',e);
                // });
                vGrid.on('click',function (e) {
                    $log.debug('click',e);
                    // vGrid.setFeatureStyle(currentFeature,style);
                    mapRef.setView(e.latlng);
                });

                // se definito
                if(zoomControl)
                    mapRef.removeControl(zoomControl);

                // snap to scale
                var scale = scales[mapRef.getZoom()];
                // $log.debug('scale?',scales, scale, mapRef.getZoom());
                mapRef.setZoom(scale.z);
            }
            function removeEditLayers(){
                if(currentFeature)
                    vGrid.resetFeatureStyle(currentFeature);
                // mapRef.off('moveend');
                vGrid.off('mouseover');
                // vGrid.off('mouseout');
                vGrid.off('click');
                // remove vectory grid layer
                mapRef.removeLayer(vGrid);
                // remove tile layer
                mapRef.removeLayer(editLayer);
                if(currentFeature)
                    vGrid.resetFeatureStyle(currentFeature);

                // se definito
                if(zoomControl)
                    mapRef.addControl(zoomControl);
            }


            function updateGridStyle() {
                var size = mapRef.getSize();
                var point = L.point(Math.floor(size.x/2),Math.floor(size.y/2));
                var el = document.elementFromPoint(point.x,point.y);
                // $log.debug('el',el);
                var id = L.stamp(el);
                var target = mapRef._targets[id];
                // $log.debug('target',target);
                // todo controlla che il target sia alla scala attuale
                if(target && target.properties && target.properties.id){
                    if(currentFeature !== target.properties.id){
                        try{
                            if(currentFeature)
                                vGrid.resetFeatureStyle(currentFeature);
                            currentFeature = target.properties.id;
                            var style = interactiveStyle(target.properties.type);
                            // $log.debug('type',target.properties);
                            vGrid.setFeatureStyle(currentFeature,style);
                            // vGrid.setFeatureStyle(currentFeature,highlightStyle);
                            $scope.$broadcast('setInfo',{info:target.properties});
                        }catch(e){
                            $scope.$broadcast('setInfo');
                        }
                        tries = 0;
                    }else if(tries < triesLimit){
                        tries++;
                        // $log.debug('tries2',tries);
                        $timeout(updateGridStyle,200);
                    }
                }else if(tries >= triesLimit){
                    $scope.$broadcast('setInfo');
                    tries = 0;
                }else if(tries < triesLimit){
                    tries++;
                    // $log.debug('tries1',tries);
                    $timeout(updateGridStyle,200);
                }
                // $log.debug('setting scale',scales[mapRef.getZoom()]);
                $scope.$broadcast('setScale',{scale:scales[mapRef.getZoom()]});
            }

            // code from @mapbox/tilebelt
            function pointToTile(lon, lat, z) {
                var tile = pointToTileFraction(lon, lat, z);
                tile[0] = Math.floor(tile[0]);
                tile[1] = Math.floor(tile[1]);
                return tile;
            }

            function pointToTileFraction(lon, lat, z) {
                var sin = Math.sin(lat * Math.PI / 180),
                    z2 = Math.pow(2, z),
                    x = z2 * (lon / 360 + 0.5),
                    y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
                return [x, y, z];
            }
        }]
    }
}).directive('wall',['$log','$ionicModal',function ($log,$ionicModal) {
    return {
        restrict:'EG',
        scope:{},
        link:function (scope,element,attr) {
            scope.$on('$destroy',function (event) {
                if(event.defaultPrevented)
                    return;
                event.preventDefault();
                delete scope;
            });


            scope.$on('showWall',function (event) {
                if(event.defaultPrevented)
                    return;
                event.preventDefault();

                show();
            });

            // mostra il wall con il contenuto della mappa
            function show(){
                //$log.debug("MapCtrl, showWall!");
                //$log.debug("check area: ",$scope.area);

                $ionicModal.fromTemplateUrl('templates/modals/wall.html', {
                    scope: scope,
                    animation: 'fade-in'
                }).then(function(modal) {
                    scope.wall = modal;
                    scope.wall.show();
                });

                scope.closeWall = function() {
                    if(scope.wall)
                        scope.wall.remove();
                };
                scope.$on('modal.hidden', function() {
                    //$log.debug('closing wall');
                    // setup della search card se la ricerca e' (q) non nulla
                    delete scope.wall;
                });
                scope.$on('$destroy', function() {
                    if(scope.wall) scope.wall.remove();
                });

                scope.clickWallItem = function(id){
                    scope.closeWall();
                    scope.$emit('wallMarkerClick',{id:id});
                }
            }
        }
    }
}]).directive('infoBar',['$log',function ($log) {
    return{
        restrict:'EG',
        scope:{},
        template:'<div id="infobar" ng-if="info || scale" class="fade-in fast-ease-animation"><span class="scaleinfo" ng-if="scale.label">{{"SCALE"|translate}}{{" "}}{{scale.label |translate}}</span><span ng-if="scale.label && info">{{": "}}</span><span class="areainfo" ng-if="info.name">{{info.name|translate}}</span></div>',
        link:function (scope,element,attr) {
            scope.$on('$destroy',function (e) {
                if(e.defaultPrevented)
                    return;
                e.preventDefault();
                delete scope;
            });

            scope.$on('setInfo',function (e,args) {
                if(e.defaultPrevented)
                    return;
                e.preventDefault();

                if(args && args.info){
                    scope.info = angular.extend({name:'site'},args.info);
                    $log.debug('info',args.info);
                }else{
                    // reset
                    delete scope.info;
                }
            });
            scope.$on('setScale',function (e,args) {
                if(e.defaultPrevented)
                    return;
                e.preventDefault();

                if(args && args.scale){
                    scope.scale = angular.extend({},args.scale);
                    // $log.debug('scale',args.scale);
                }else{
                    // reset
                    delete scope.scale;
                }
            });
        }
    }
}]);
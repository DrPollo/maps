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
        controller: ['$scope','$log', '$location', '$timeout','myConfig','ThingsService', 'leafletData',function ($scope, $log, $location,$timeout, myConfig, ThingsService, leafletData) {

            // markers
            $scope.markers = {};
            $scope.currentMarkers = {};
            // referenza diretta alla mappa
            var mapRef = null;
            // referenza diretta all'overlay clustermarker
            var pieRef = null;
            // se non e' presente c in $location.search() c lo imposto al centro della mappa
            if(!$location.search().c)
                $location.search('c', $scope.map.center.lat+':'+$scope.map.center.lng+':'+$scope.map.center.zoom);

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
            var highlightStyle = {
                fillColor:'#fafafa',
                fill:true,
                fillOpacity:0.85,
                weight:1,
                color:orange
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
                // vectorTileLayerStyles: vectorMapStyling,
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

                // $log.debug('updateMarkers!');
                updateMarkers();
            });
            $scope.$on('deleteMarker',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                removeMarker(args.id);
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
                            $scope.$broadcast('markerClick',{id: e.layer.options.id});
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

            var timer = null;
            $scope.$on('leafletDirectiveMap.mymap.moveend', function(event, args) {
                if(event.defaultPrevented)
                    return ;

                event.preventDefault();

                // $log.debug('moveend');
                timer = $timeout(flushMarkers,500);
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
                   $scope.$broadcast('markerClick',{id: args.id});
               }
            });


            /*
             * Funzioni private
             */

            function changeLocation(params) {
                var hash = params.lat+':'+params.lng;
                if(params.zoom){
                    hash = hash.concat(':',params.zoom);
                }else{
                    hash = hash.concat(':',$scope.flmap.center.zoom);
                }
                // $log.debug('change location',hash);
                $location.search({ c: hash });
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
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }
            // filtro i marker in cache
            function updateMarkers() {
                if(!pieRef)
                    return
                // chiamate alle tile attive
                ThingsService.flushTiles().then(
                    function (markers) {
                        // $log.debug('updated markers',Object.keys(markers).length);
                        // $scope.markers = angular.extend({},markers);
                        addMarkers(markers);
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
                var markers = ThingsService.filter();
                removeMarkers(markers.remove);
                addMarkers(markers.add);
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
            function removeMarkers(ids){
                // $log.debug('to be removed',ids.length);
                console.time('remove markers');
                ids.map(function (id) {
                    // $log.debug('remove', id, $scope.currentMarkers[id]);
                    removeMarker(id);
                });
                console.timeEnd('remove markers');
            }


            function removeMarker(markerId) {
                if(markerId && $scope.currentMarkers[markerId]){
                    pieRef.removeLayer($scope.currentMarkers[markerId]);
                    delete $scope.currentMarkers[markerId];
                }
            }




            /*
             * gestione edit mode
             */
            $scope.$on('enterEditMode',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                $scope.editMode = true;
                addEditLayers();
                $timeout(updateGridStyle,450);
                mapRef.on('moveend',function (e) {
                    // $log.debug(e);
                    updateGridStyle();
                })
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
                    var properties = mapRef._targets[id].properties;
                    // $log.debug('got',mapRef._targets[id].properties);
                    var info = angular.extend({id:null, tile: tile, zoom_level:z, tile_id:tileid, areaid:properties.id,type:properties.type},center);
                    //{lat:e.target.options.latlng.lat,lng:e.target.options.latlng.lng,zoom_level:e.target.options.zoom_level,area_id:e.target.options.id,id:null}
                    // $log.debug('createEntity',properties,info);
                    $scope.$emit('createEntity',info);
                    removeEditLayers();
                },200);
            };

            var editLayer = null;
            function addEditLayers(){
                editLayer = L.tileLayer($scope.map.layers.baselayers.edit.url,$scope.map.layers.baselayers.edit.layerOptions);
                // $log.debug(editLayer);
                // add tile layer
                editLayer.addTo(mapRef);

                // add the vectory grid layer
                vGrid.addTo(mapRef);
            }
            function removeEditLayers(){
                if(currentFeature)
                    vGrid.resetFeatureStyle(currentFeature);
                mapRef.off('moveend');
                // remove vectory grid layer
                mapRef.removeLayer(vGrid);
                // remove tile layer
                mapRef.removeLayer(editLayer);
                if(currentFeature)
                    vGrid.resetFeatureStyle(currentFeature);
            }

            var currentFeature = null;
            function updateGridStyle() {
                var size = mapRef.getSize();
                var point = L.point(Math.floor(size.x/2),Math.floor(size.y/2));
                var el = document.elementFromPoint(point.x,point.y);
                // $log.debug('el',el);
                var id = L.stamp(el);
                var target = mapRef._targets[id];
                // $log.debug('target',target);
                if(target && target.properties && target.properties.id){
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
                }else{
                    $scope.$broadcast('setInfo');
                }
            }

            // code from @mapbox/tilebelt
            var d2r = Math.PI / 180,
                r2d = 180 / Math.PI;
            function pointToTile(lon, lat, z) {
                var tile = pointToTileFraction(lon, lat, z);
                tile[0] = Math.floor(tile[0]);
                tile[1] = Math.floor(tile[1]);
                return tile;
            }

            function pointToTileFraction(lon, lat, z) {
                var sin = Math.sin(lat * d2r),
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
        template:'<div id="infobar" ng-if="info" class="fade-in fast-ease-animation">{{"CURRENTLY_SEEYING"|translate}}{{": "}}{{info.name|translate}}</div>',
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
            })
        }
    }
}]);
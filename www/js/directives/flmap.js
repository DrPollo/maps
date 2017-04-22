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
                interactive:{
                    fill: true,
                    weight: 2,
                    // fillColor: '#06cccc',
                    color: 'orange',
                    opacity: 1
                }

            };
            function interactiveStyle(properties, z){
                $log.debug(properties);
                var style = {
                    fill: true,
                    weight: 2,
                    // fillColor: '#06cccc',
                    color: '#06cccc',
                    fillOpacity: 0.2,
                    opacity: 1
                };
                switch(properties.type){
                    case 'administrative':
                        style.weight = 4;
                        style.color = 'white';
                        style.fillColor = 'orange';
                        style.fillOpacity = 0.5;
                        break;
                    case 'highway':
                        style = {};
                        break;
                    case 'landuse':
                        style.fillColor = 'green';
                        style.opacity = 1;
                        style.weight = 0;
                        break;
                    case 'leisure':
                        style.fillColor = 'green';
                        style.opacity = 1;
                        style.weight = 0;
                        style.fillOpacity = 0.5;
                        break;
                    case 'site':
                        style.weight = 0;
                        style.color = 'white';
                        style.fillColor = 'green';
                        break;
                    case 'indoor':
                        style.weight = 1;
                        style.fillOpacity = 0.75;
                        style.color = 'white';
                        style.fillColor = 'orange';
                        break;
                    case 'city_block':
                        style.color = 'white';
                        style.fillColor = 'green';
                        style.weight = z == 16 ? 4 : 2;
                        style.fillOpacity = 0.5;
                        style.opacity = 1;
                        break;
                    case 'building':
                        style.weight = 2;
                        style.fillOpacity = 0.5;
                        style.color = 'white';
                        style.fillColor = 'orange';
                        break;
                    default:
                }
                return  style;
            }
            var vectormapConfig = {
                rendererFactory: L.svg.tile,
                attribution: false,
                vectorTileLayerStyles: vectorMapStyling,
                // token: 'pk.eyJ1IjoiaXZhbnNhbmNoZXoiLCJhIjoiY2l6ZTJmd3FnMDA0dzMzbzFtaW10cXh2MSJ9.VsWCS9-EAX4_4W1K-nXnsA',
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
                $log.debug('to be added',Object.keys(markers).length);
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
                $log.debug('to be removed',ids.length);
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
            // todo gestire l'update dei marker
            $scope.$on('enterEditMode',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                // enterEditMode();
            });
            $scope.$on('exitEditMode',function (e,args) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                // $log.debug('deleteMarkers!',args);
                // exitEditMode();
            });

            var iconHtml = '<div id="pointer" class="padding"><div class="pin"></div><div class="pulse"></div></div>';
            var pointer = null;
            function enterEditMode(){
                // add the vectory grid layer
                vGrid.addTo(mapRef);
                vGrid.on('click',function(e){
                    $log.debug('vGrid click handler',e);
                    if(e.originalEvent.defaultPrevented)
                        return;

                    e.originalEvent.preventDefault();
                    L.DomEvent.stopPropagation(e);
                    var params = e.layer.properties;
                    params['zoom_level'] = mapRef.getZoom();
                    params['latlng'] = e.latlng;
                    params['tile'] = pointToTile(params['latlng'].lng, params['latlng'].lat, params['zoom_level']);
                    params['tile_id'] = params['tile'][0]+':'+params['tile'][1]+':'+params['tile'][2];
                    // $log.debug('clicke area id',params);
                    addPointer(params);
                });
                mapRef.on('click',function (e) {
                    $log.debug('map click handler',e);
                    if(e.originalEvent.defaultPrevented)
                        return;
                    e.originalEvent.preventDefault();

                    var params = {};
                    params['zoom_level'] = mapRef.getZoom();
                    params['latlng'] = e.latlng;
                    params['tile'] = pointToTile(params['latlng'].lng, params['latlng'].lat, params['zoom_level']);
                    params['tile_id'] = params['tile'][0]+':'+params['tile'][1]+':'+params['tile'][2];
                    params['id'] = params['tile_id'];
                    addPointer(params);
                });
            }
            function addPointer(params) {
                var options = angular.extend(params,{
                    clickable:true,
                    draggable:false,
                    keyboard: true
                });
                if(pointer){
                    mapRef.removeLayer(pointer);
                }
                pointer = L.marker(params.latlng, options).addTo(mapRef);
                pointer.on('click',function (e) {
                    if(e.originalEvent.defaultPrevented)
                        return;
                    e.originalEvent.preventDefault();
                    $log.debug('marker click handler',e);
                    // notify about the creation request
                    $scope.$emit('createEntity',{lat:e.target.options.latlng.lat,lng:e.target.options.latlng.lng,zoom_level:e.target.options.zoom_level,area_id:e.target.options.id,id:null});
                })
            }
            function exitEditMode(){
                // remove listners
                vGrid.off('click');
                mapRef.off('move');
                // gestione pointer
                if(pointer){
                    pointer.off('click');
                    mapRef.removeLayer(pointer);
                }
                // remove the vectory grid layer
                mapRef.removeLayer(vGrid);

            };



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
}]);
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
        controller: ['$scope','$log', '$location','myConfig','ThingsService', 'leafletData',function ($scope, $log, $location, myConfig, ThingsService, leafletData) {

            // markers
            $scope.markers = {};
            // referenza diretta alla mappa
            var mapRef = null;
            // se non e' presente c in $location.search() c lo imposto al centro della mappa
            if(!$location.search().c)
                $location.search('c', $scope.map.center.lat+':'+$scope.map.center.lng+':'+$scope.map.center.zoom);

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
                // ThingsService.updateCache();
                updateMarkers();
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
                        // $log.debug(layers.baselayers.view);
                        // $log.debug('init layer ref',!$scope.tileLayer);
                        if(!$scope.tileLayer){
                            $scope.tileLayer = layers.baselayers.view;
                            // $log.debug('tile layer',$scope.tileLayer);
                            $scope.tileLayer.on('tileload',function (e) {
                                // $log.debug('tileload',e);
                                // al caricamento delle tile carico i marker relativi alle tile
                                addTile(e.coords);
                            });
                            $scope.tileLayer.on('tileunload',function (e) {
                                // $log.debug('tileunload',e.coords);
                                ThingsService.removeTile(e.coords);
                            });
                        }
                    }
                );
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

            // al click del marker aggiorno il parametro entity
            // click su marker > propago evento
            $scope.$on('leafletDirectiveMarker.mymap.click', function(event, args) {
                if(event.defaultPrevented)
                    return;
                event.preventDefault();

                args.model.focus = false;
                //event.target.focus = false;
                $location.search('entity',args.model.id);
                $scope.$broadcast('markerClick',{id: args.model.id});

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

            // add tile alla lista delle tile attive e get dei marker
            function addTile(tile) {
                ThingsService.tile(tile).then(
                    function (markers) {
                        // aggiorno lista tile
                        angular.extend($scope.markers,markers);
                        // $log.log('markers',Object.keys($scope.markers).length);
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }

            // filtro i marker in cache
            function updateMarkers(reset) {
                // clear cache
                if(reset){
                    ThingsService.resetCache();
                    $scope.markers = {};
                }
                // chiamate alle tile attive
                ThingsService.updateCache().then(
                    function (markers) {
                        // $log.debug('updated markers',Object.keys(markers).length);
                        $scope.markers = angular.extend({},markers);
                    }
                );
            }
            // filtro i marker in cache
            function filterMarkers() {
                // chiamate alle tile
                var filtred = ThingsService.filter();
                // $log.debug('filtred',Object.keys(filtred).length);
                $scope.markers = angular.extend({},filtred);
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
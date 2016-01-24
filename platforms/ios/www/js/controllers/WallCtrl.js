angular.module('firstlife.controllers')

    .controller('WallCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$location', '$stateParams', '$ionicSideMenuDelegate',  'myConfig', 'MapService', 'categoriesFactory', function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $location, $stateParams, $ionicSideMenuDelegate, myConfig, MapService, categoriesFactory ) {

        $scope.config = myConfig;

        $scope.changeVisibility = MapService.changeVisibility;

        // gestione del cambio di stato

        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {

            console.log("sono in WallCtrl, questi i parametri ", $stateParams);

            MapService.getMap().then(
                function(response){ 
                    console.log("WallCtrl, gestione stato, MapService.getMap, response: ",response);
                    $scope.map =  response;
                    // recupero marker per la bouding box corrente
                    MapService.updateMarkersDistributed().then(
                        function(response){
                            console.log("WallCtrl, gestione stato, updateMarkerDistributed(), response: ",response);
                            MapService.getAllPlace().then(
                                function(response){
                                    console.log("WallCtrl, gestione stato, MapService.getAllPlace, response: ",response);
                                    $scope.map.markers = response;
                                },
                                function(response){
                                    console.log("WallCtrl, gestione stato, MapService.getAllPlace, error: ",response);
                                }
                            );
                        },
                        function(response){
                            console.log("WallCtrl, gestione stato, updateMarkerDistributed(), errore: ",response);
                        }
                    );

                },
                function(response){
                    console.log("WallCtrl, gestione stato, MapService.getMap, errore: ",response);
                }
            );

            console.log("Check parametri: ", $stateParams, $location.search());
        });





        /*
         * Funzioni interne di routing
         */

        $scope.close = function (){
            // recupero l'ultima posizione della mappa
            var param = {};
            if($rootScope.info_position && $rootScope.info_position.lat && $rootScope.info_position.lng && $rootScope.info_position.zoom){
                param = {lat:$rootScope.info_position.lat,lng:$rootScope.info_position.lng,zoom:$rootScope.info_position.zoom};
            }
            // torno alla mappa
            $state.go("app.maps", param);
        }





        /*
         * funzioni private
         * 1) differentThan
         * 2) contains
         * 3) notEmpty
         * 4) hasCategory
         * 5) inBounds
         */

        // filtro "diverso da" di per l'editor del place
        $scope.differentThan = function(prop, val){
            return function(item){
                return item[prop] != val;
            }
        };
        $scope.contains = function(prop, val){
            return function(item){
                console.log("filtro contains: ",item[prop], val, item[prop].indexOf(val), (item[prop].indexOf(val) > -1));
                return (item && item[prop] && item[prop].indexOf(val) > -1 );
            }
        };

        $scope.notEmpty = function(){
            return function(item){
                //console.log("filtro notEmpty", item );
                if(item && item != 'undefined' && item  != null)
                    return true;
                return false;
            }
        }
        $scope.hasCategory = function(cat){
            return function(item){
                console.log("filtro contains: ");
                if(item && item.category && item.category.id && item.category.id == cat)
                    return true;
                return false;
            }
        }

        $scope.inBounds = function(){
            return function(item){
                //item
            }
        }

    }]);
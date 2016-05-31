angular.module('firstlife.entitylist',[])
    .directive('entityList', function() {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            close: '=',
            click: '=',
            query: '='
        },
        templateUrl: '/templates/map-ui-template/entitylist.html',
        controller: ['$scope', '$rootScope', '$location', '$log', '$filter', '$timeout','myConfig', 'MemoryFactory', 'MapService','CBuffer', function($scope,$rootScope,$location,$log,$filter,$timeout, myConfig,MemoryFactory,MapService,CBuffer){
            var config = myConfig;
            var bounds = {};
            var bunch = 1500;
            var RELOAD_TIME = config.behaviour.moveend_delay;
            $scope.markerChildren = {};
            //$scope.query = '';
            $scope.limit = bunch;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyWall){
                    e.preventDestroyWall = true;
                    delete $scope;
                }
            });

            $rootScope.$on('timeline.refresh',function(e,args){
                $log.error('cambio dati ',args.list);
                init();
            });
            
            var timer = false;
            $scope.$watch('query',function(e,old){
                if(e != old){
                    checkSearch(e);
                }
            })
            
            
            var checkSearch = function (q){
                $timeout.cancel(timer);
                timer = $timeout(function() {
                    $location.search('q',q)
                },RELOAD_TIME);
            };
            
            init();
            
            function init(){
                if(!$scope.data)
                    return false;
                
                MapService.getMapBounds().then(
                    function(response){
                        var tmpArray = [];
                        var keys = Object.keys($scope.data);
                        for(var k = 0; k < keys.length; k++){
                            tmpArray.push($scope.data[keys[k]]);
                            //$scope.loadChildren($scope.data[keys[k]])
                        }
                        bounds = response;
                        //orderBy:['-last_update','name']
                        tmpArray = $filter('filter')(tmpArray, boundsFiltering);
                        $scope.dataArray = $filter('orderBy')(tmpArray, '-last_update','name');
                    },
                    function(response){
                        $log.error("MapCtrl, setMapMarkers, MapService.getMapBounds, errore ",response);}
                );
            }
            
            // click cambio di parametro search e chiudo modal
            $scope.clickWallItem = function(entityId){
                // cambio paramentro search
                $location.search('entity',entityId);
                //chiudo la modal
                $scope.close();
            };

            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                return bounds.contains([val.lat,val.lng]);
            }


            $scope.loadChildren = function(marker){
                // caricamento dei child
                var childrenRelations = config.types.child_relations[marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor(marker.id, childRel.field);
                    if(!$filter('isEmpty')(c)){
                        children[key] = angular.copy(childRel);
                        for(var j = 0; j<c.length;j++){
                            var thing = c[j];
                            if(!children[thing.entity_type])
                                children[thing.entity_type] = angular.copy(childrenRelations[thing.entity_type]);
                            if(!children[thing.entity_type].list)
                                children[thing.entity_type].list = [];
                            var index = children[thing.entity_type].list.map(function(e){return e.id}).indexOf(thing.id);
                            if(index < 0)
                                children[thing.entity_type].list.push(thing);
                        }
                    }
                }
                $scope.markerChildren[marker.id] = children;
            };


            $scope.increaseLimit = function () {
                if ($scope.limit < $scope.items.length) {
                    $scope.limit += 15;
                }
            };


        }]
    }
});
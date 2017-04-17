angular.module('firstlife.directives')
    .directive('entityList', [ '$rootScope', '$location', '$log', '$filter', '$timeout','myConfig', 'MemoryFactory', 'ThingsService', function($rootScope,$location,$log,$filter,$timeout, myConfig,MemoryFactory,ThingsService) {
        return {
            restrict: 'E',
            scope: {
                close: '&',
                click: '&'
            },
            templateUrl: '/templates/map-ui-template/entitylist.html',
            link: function(scope, element, attr){

                scope.loading = true;

                scope.$on('$destroy', function(e) {
                    if(!e.preventDestroyWall){
                        e.preventDestroyWall = true;

                        // aggiorno il parametro prima di uscire
                        $location.search('q',scope.query);

                        delete scope;
                    }
                });

                init();

                function init(){
                    $log.log('init wall');
                    var current = ThingsService.filter();
                    scope.markers = Object.keys(ThingsService.filter()).map(function(e){return current[e];});
                    var params = $location.search();
                    if(params.q)
                        scope.query = params.q;

                    scope.loading = false;
                }

                // click cambio di parametro search e chiudo modal
                scope.show = function(entityId){
                    // cambio paramentro search
                    // $location.search('entity',entityId);
                    scope.click({id: entityId});
                    //chiudo la modal
                    scope.close();
                };
            }
        }
    }]);
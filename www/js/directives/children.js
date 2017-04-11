/**
 * Created by drpollo on 27/03/2017.
 */
angular.module('firstlife.directives').directive('entityChildren',['$log','$filter','myConfig','ThingsService', function($log,$filter,myConfig,ThingsService){
    return {
        restrict: 'EG',
        scope: {
            marker: '=marker',
            show: '&click',
            add: '&'
        },
        templateUrl: '/templates/children/children.html',
        link: function(scope,element,attr){

            scope.config = myConfig;

            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyEntityRelations){
                    e.preventDestroyEntityRelations = true;
                    delete scope;
                }
            });

            var tries = 0;
            var maxTries = 2;
            var delay = 1500;

            // check dei contenuti
            scope.ok = false;
            // caricamento
            scope.loading = true;

            loadSibillings();

            function loadSibillings (){
                if(!scope.marker || !scope.marker.entity_type)
                    return

                scope.relations = {
                    children: [],
                    parents: []
                };

                // caricamento dei child
                var childrenRelations = scope.config.types.child_relations[scope.marker.entity_type];
                // $log.log(childrenRelations);
                for(var key in childrenRelations) {
                    ThingsService.getChildren(scope.marker.id,childrenRelations[key].relation).then(
                        function (markers) {
                            var list = Object.keys(markers).map(function (k) {
                                return markers[k];
                            });
                            if(list.length > 0){
                                var type = list[0].entity_type;
                                var entry = angular.extend({},childrenRelations[type]);
                                angular.extend(entry,{markers:list});
                                scope.relations.children.push(entry);
                                // qualcosa da leggere
                                scope.ok = true;
                                scope.loading = false;
                            }
                        },
                        function (err) {
                            $log.error(err);
                            scope.loading = false;
                        }
                    );
                }

                // caricamento dei padri
                var parentsRelations = scope.config.types.parent_relations[scope.marker.entity_type];
                var ban = {};
                for(key in parentsRelations) {
                    var parentRel = parentsRelations[key];
                    // evito i duplicati
                    if(!ban[parentRel.field]){
                        ban[parentRel.field] = true;

                        var id = scope.marker[parentRel.field];
                        if(id){
                            ThingsService.get(id).then(
                                function (marker) {
                                    if(marker){
                                        var type = marker.entity_type;
                                        var entry = angular.extend({},parentsRelations[type]);
                                        angular.extend(entry,{marker:marker});
                                        scope.relations.parents.push(entry);
                                        // qualcosa da leggere
                                        scope.ok = true;
                                        scope.loading = false;
                                    }
                                },
                                function (err) {
                                    $log.error(err);
                                    scope.loading = false;
                                }
                            );
                        }
                    }
                }


                // se non ho trovato nulla riprovo dopo x secondi una volta sola (per il caricamento diretto di entita')
                if(!scope.ok && tries < maxTries){
                    tries++;
                    setTimeout(function(){ scope.$apply(function(){loadSibillings()})}, delay);
                }

                // se ho trovato qualcosa o se ho provato abbastanza
                if(tries == maxTries || scope.ok){
                    scope.loading = false;
                }

                scope.click = function (id) {
                    // $log.debug('show',id,scope.show);
                    scope.show({id:id});
                }

            }
        }
    }

}]);
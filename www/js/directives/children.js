/**
 * Created by drpollo on 27/03/2017.
 */
angular.module('firstlife.directives').directive('entityChildren',['$log','$filter','$location','myConfig','ThingsService','AuthService', function($log,$filter,$location,myConfig,ThingsService,AuthService){
    return {
        restrict: 'EG',
        scope: {
            marker: '<marker',
            show: '&click',
            add: '&'
        },
        templateUrl: '/templates/children/children.html',
        link: function(scope,element,attr){

            scope.config = myConfig;
            var searchParams = $location.search();
            scope.embed = searchParams.embed || false;


            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyEntityRelations){
                    e.preventDestroyEntityRelations = true;
                    delete scope;
                }
            });


            // $log.debug('init children');

            var tries = 0;
            var maxTries = 2;
            var delay = 1500;

            // check dei contenuti
            scope.ok = false;
            // caricamento
            scope.loading = true;

            loadSiblings();

            function loadSiblings (){
                if(!scope.marker || !scope.marker.entity_type){
                    scope.loading = false;
                    return;
                }

                // $log.debug('load siblings');

                scope.relations = {
                    children: [],
                    parents: []
                };

                // caricamento dei child
                var childrenRelations = scope.config.types.child_relations[scope.marker.entity_type];
                // $log.debug('childrenRelations',childrenRelations);
                var banChildRel = {};
                for(var key in childrenRelations) {
                    // $log.debug('ask for childred',childrenRelations[key]);
                    if(!banChildRel[scope.marker.id,childrenRelations[key].relation]){
                        banChildRel[scope.marker.id,childrenRelations[key].relation] = true;
                        ThingsService.getChildren(scope.marker.id,childrenRelations[key].relation).then(
                            function (markers) {
                                var list = Object.keys(markers).map(function (k) {
                                    return markers[k];
                                });
                                // $log.debug('markers children',list);
                                if(list.length > 0){
                                    var type = list[0].entity_type;
                                    var entry = angular.extend({},childrenRelations[type]);
                                    angular.extend(entry,{markers:list});
                                    scope.relations.children.push(entry);
                                    // qualcosa da leggere
                                    scope.ok = true;
                                }
                                scope.loading = false;
                            },
                            function (err) {
                                $log.error(err);
                                scope.loading = false;
                            }
                        );
                    }
                }

                // caricamento dei padri
                var parentsRelations = scope.config.types.parent_relations[scope.marker.entity_type];
                var ban = {};
                // $log.debug('parentsRElations', parentsRelations);
                for(key in parentsRelations) {
                    var parentRel = parentsRelations[key];
                    // $log.debug('parent rel',parentRel, ban);
                    // evito i duplicati
                    if(!ban[parentRel.field]){
                        ban[parentRel.field] = true;

                        var id = scope.marker[parentRel.field];
                        // $log.debug('id', parentRel.field, scope.marker, scope.marker[parentRel.field], id);
                        if(id){
                            ThingsService.get(id).then(
                                function (parent) {
                                    // $log.debug('got parent',parent);
                                    if(parent){
                                        var type = parent.entity_type;
                                        var entry = angular.extend({},parentsRelations[type]);
                                        angular.extend(entry,{marker:parent});
                                        scope.relations.parents.push(entry);
                                        // qualcosa da leggere
                                        scope.ok = true;
                                    }
                                    scope.loading = false;
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
                // if(!scope.ok && tries < maxTries){
                //     tries++;
                //     setTimeout(function(){ scope.$apply(function(){loadSibillings()})}, delay);
                // }
                //
                // // se ho trovato qualcosa o se ho provato abbastanza
                // if(tries == maxTries || scope.ok){
                //     scope.loading = false;
                // }

                scope.addEntity = AuthService.doAction(function(){
                    scope.add();
                });

                scope.click = function (id) {
                    // $log.debug('show',id,scope.show);
                    scope.show({id:id});
                }

            }
        }
    }

}]);
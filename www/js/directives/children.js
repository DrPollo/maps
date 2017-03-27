/**
 * Created by drpollo on 27/03/2017.
 */
angular.module('firstlife.directives').directive('entityChildren',function(){
    return {
        restrict: 'EG',
        scope: {
            marker: '=marker',
            click: '=click',
            add: '='
        },
        templateUrl: '/templates/children/children.html',
        controller: ['$scope','$log','$filter','myConfig','MapService', function($scope,$log,$filter,myConfig,MapService){

            $scope.config = myConfig;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyEntityRelations){
                    e.preventDestroyEntityRelations = true;
                    delete $scope;
                }
            });

            var tries = 0;
            var maxTries = 2;
            var delay = 1500;

            // check dei contenuti
            $scope.ok = false;
            // caricamento
            $scope.loading = true;

            loadSibillings();

            function loadSibillings (){
                if(!$scope.marker || !$scope.marker.entity_type)
                    return

                $scope.relations = {};

                // caricamento dei child
                var childrenRelations = $scope.config.types.child_relations[$scope.marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor($scope.marker.id, childRel.field);
                    if(!$filter('isEmpty')(c)){
                        children[key] = angular.copy(childRel);
                        for(var j = 0; j<c.length;j++){
                            var thing = c[j];
                            if(!children[thing.entity_type])
                                children[thing.entity_type] = angular.copy(childrenRelations[thing.entity_type]);
                            if(!children[thing.entity_type].list)
                                children[thing.entity_type].list = [];

                            var index = children[thing.entity_type].list.map(function(e){return e.id}).indexOf(thing.id);
                            if(index < 0) {
                                // evito il check se ho trovato qualcosa
                                $scope.ok = true;
                                children[thing.entity_type].list.push(thing);
                            }
                        }

                    }
                }
                $scope.relations.children = children;

                // caricamento dei parent
                var parentsRelations = $scope.config.types.parent_relations[$scope.marker.entity_type];
                var parents = {};
                // serve ad impedire la duplicazione della ricerca per entita' con lo stesso field
                var keysBanList = {};
                for(key in parentsRelations){
                    var parentRel = parentsRelations[key];
                    if(!$filter('isEmpty')($scope.marker[parentRel.field]) && !keysBanList[parentRel.field]){
                        // aggiungo il campo alla banList
                        keysBanList[parentRel.field] = true;
                        var p = MapService.searchFor($scope.marker[parentRel.field], 'id');
                        parents[key] = angular.copy(parentRel);
                        parents[key].list = p;
                        // evito il check se ho trovato qualcosa
                        $scope.ok = true;
                    }
                }
                $scope.relations.parents = parents;

                // se non ho trovato nulla riprovo dopo x secondi una volta sola (per il caricamento diretto di entita')
                if(!$scope.ok && tries < maxTries){
                    tries++;
                    setTimeout(function(){ $scope.$apply(function(){loadSibillings()})}, delay);
                }

                // se ho trovato qualcosa o se ho provato abbastanza
                if(tries == maxTries || $scope.ok){
                    $scope.loading = false;
                }
            }
        }]
    }

});
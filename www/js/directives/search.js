angular.module('firstlife.directives', []).directive('searchCards', function() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/templates/map-ui-template/SearchCards.html',
        controller: ['$scope','$location', '$log', '$stateParams', 'myConfig', 'MemoryFactory', 'MapService', function($scope,$location,$log,$stateParams,myConfig,MemoryFactory,MapService){
            var config = myConfig;
            var filters = config.map.filters;
            var filterList = filters.map(function(e){return e.search_param});

            var listners = {};
            
            // inizializzazione
            if(!$scope.cards){
                $scope.cards = {};
                checkParams($location.search());
            }

            $scope.$on('$destroy', function(e) {
                if(!e.preventSearchCards){
                    e.preventSearchCards = true;
                    delete $scope;
                }
            });
            
            // todo listner su rootscope
            $scope.$watch(
                function(){return $location.search()},
                function(e, old){
                // se cambiati controllo
                checkParams($location.search());
            },true);

            $scope.closeCard = function(k,value){
                // rimuovo il parametro
                removeFilter(k,value);
                // dovrebbe rimuovere anche la card al prossimo controllo
                var key = k.toString().concat(value);
                if($scope.cards[key])
                    delete $scope.cards[key];
                if($scope.cards[k])
                    delete $scope.cards[k];
            };

            function checkParams(params){
                // aggiungo le schede dei parametri che mi mancano
                for(var k in params){
                    var i = filterList.indexOf(k);
                    // se e' nella lista dei filtri search
                    if(i > -1){
                        var values = params[k].toString().split(',');
                        for(var j = 0; j < values.length; j++){

                            var key = k.toString().concat(values[j]);
                            // se la card non esiste
                            if(!$scope.cards[key]){
                                createCard(k,values[j],filters[i],key);
                            }
                        } 
                    }
                }
                // rimuovo le schede se i parametri sono stati rimossi
                for(var k in $scope.cards){
                    var key = $scope.cards[k].search_param;
                    if(!params[key]){
                        delete $scope.cards[k];
                    }
                }
            }

            function createCard(search,value,filter,key){
                var card = angular.copy(filter);
                card.value = value;
                switch(search){
                    case 'q':
                        card.label2 = value;
                        $scope.cards['q'] = card;
                        break;
                    case 'users':
                        // cerco il nome utente
                        var user = MemoryFactory.getUser();
                        if(value == user.id && user.displayName){
                            card.label2 = user.displayName;
                            $scope.cards[key] = card;
                        }else{ $log.error("utente sconosciuto o mancanza di displayName",value,user); }
                        break;
                    case 'groups':
                        // cerco il nome del gruppo
                        MapService.get(value).then(
                            function(response){
                                if(response.entity_type == filter.entity_type){
                                    card.label2 = response.name;
                                    $scope.cards[key] = card;
                                }else{
                                    //rimuovo filtro
                                    removeFilter(search,value);
                                }
                            },
                            function(response){
                                $log.error("non trovo il gruppo ",value,", errore ",response);
                                //rimuovo filtro
                                removeFilter(search,value);
                            }
                        );
                        break;
                    default:
                        $log.error("Non so gestire il parametro search: ",key,value,filter);
                }
            }

            function removeFilter(key,value){
                if(!value){
                    $location.search(key,null);
                }
                var params = $location.search();

                if(params[key]){
                    var values = params[key];
                    var a = values.toString().split(',');
                    for(var i = 0 ; i < a.length; i ++){
                        if(a[i] == value){
                            a.splice(i,1);
                        } 
                    }
                    var newValues = a.join(',');
                    if(newValues != '')
                        $location.search(key,newValues);
                    else
                        $location.search(key,null);
                }
            }

        }]
    };
});
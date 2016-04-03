angular.module('firstlife.directives', [])
.directive('validPin', ['$http', function($http) {
	return {
		require: 'ngModel',
		link: function(scope, ele, attrs, c) {
			scope.$watch(attrs.ngModel, function(pinValue) {
				// $http({
				// 	method: 'POST',
				// 	url: '/api/check/' + attrs.validPin,
				// 	data: {'pin': attrs.validPin}
				// }).success(function(data, status, headers, cfg) {
				// 	c.$setValidity('valid-pin', data.isValid);
				// }).error(function(data, status, headers, cfg) {
				// 	c.$setValidity('valid-pin', false);
				// });
				if(pinValue=="12345")
				{
					c.$setValidity('valid-pin', true);
				}
				else
				{
					c.$setValidity('valid-pin', false);
				}
			});
		}
	};
}])
.directive('showHide', ['$ionicGesture', function($ionicGesture) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var anchor = angular.element('<a/>');
			anchor.addClass("toggle-view-anchor");
			anchor.text("SHOW");
			element.parent().append(anchor);

			$ionicGesture.on('touch', function(event){
				event.stopPropagation();
				event.preventDefault();

				var toggle_view_anchor = this,
						password_input = toggle_view_anchor.parentElement.querySelector('input[show-hide]'),
						input_type = password_input.getAttribute('type');

				if(input_type=="text")
				{
					password_input.setAttribute('type', 'password');
					toggle_view_anchor.text = "SHOW";
				}
				if(input_type=="password")
				{
					password_input.setAttribute('type', 'text');
					toggle_view_anchor.text = "HIDE";
				}
			}, anchor);
		}
	};
}])


.directive('biggerText', ['$ionicGesture', function($ionicGesture) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$ionicGesture.on('touch', function(event){
				event.stopPropagation();
				event.preventDefault();

				var text_element = document.querySelector(attrs.biggerText),
						root_element = document.querySelector(".menu-content"),
						current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
						current_size = parseFloat(current_size_str),
						new_size = Math.min((current_size+2), 24),
						new_size_str = new_size + 'px';

				root_element.classList.remove("post-size-"+current_size_str);
				root_element.classList.add("post-size-"+new_size_str);
			}, element);
		}
	};
}])

.directive('smallerText', ['$ionicGesture', function($ionicGesture) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$ionicGesture.on('touch', function(event){
				event.stopPropagation();
				event.preventDefault();

				var text_element = document.querySelector(attrs.smallerText),
				root_element = document.querySelector(".menu-content"),
				current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
				current_size = parseFloat(current_size_str),
				new_size = Math.max((current_size-2), 12),
				new_size_str = new_size + 'px';

				root_element.classList.remove("post-size-"+current_size_str);
				root_element.classList.add("post-size-"+new_size_str);
			}, element);
		}
	};
}])
.directive('nxEqual', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqual) {
                console.error('nxEqual expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqual, function (value) {
                model.$setValidity('nxEqual', value === model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value === scope.$eval(attrs.nxEqual);
                model.$setValidity('nxEqual', isValid);
                return isValid ? value : undefined;
            });
        }
    };
})
.directive('nxEqualEx', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqualEx) {
                console.error('nxEqualEx expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqualEx, function (value) {
                // Only compare values if the second ctrl has a value.
                if (model.$viewValue !== undefined && model.$viewValue !== '') {
                    model.$setValidity('nxEqualEx', value === model.$viewValue);
                }
            });
            model.$parsers.push(function (value) {
                // Mute the nxEqual error if the second ctrl is empty.
                if (value === undefined || value === '') {
                    model.$setValidity('nxEqualEx', true);
                    return value;
                }
                var isValid = value === scope.$eval(attrs.nxEqualEx);
                model.$setValidity('nxEqualEx', isValid);
                return isValid ? value : undefined;
            });
        }
    };
})
.directive('standardTimeNoMeridian', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      etime: '=etime'
    },
    template: "<span>{{stime}}</span>",
    link: function(scope, elem, attrs) {
        scope.placeholder = attrs.placeholder;
      scope.stime = epochParser(scope.etime, 'time');

      function prependZero(param) {
        if (String(param).length < 2) {
          return "0" + String(param);
        }
        return param;
      }

      function epochParser(val, opType) {
        if (val === null) {
            if(scope.placeholder){
                //console.log("placeholder? ",scope.placeholder);
                return scope.placeholder;
            }else
                return "<span>00:00</span>";
        } else {
          if (opType === 'time') {
            var hours = parseInt(val / 3600);
            var minutes = (val / 60) % 60;

            return (prependZero(hours) + ":" + prependZero(minutes));
          }
        }
      }

      scope.$watch('etime', function(newValue, oldValue) {
        scope.stime = epochParser(scope.etime, 'time');
      });

    }
  };
})
.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
.directive('searchCards', function() {

    return {
        restrict: 'E',
        scope: {
            params: '=params'
        },
        templateUrl: '/templates/map-ui-template/SearchCards.html',
        controller: ['$scope','$location', '$log', '$stateParams', '$rootScope', 'myConfig', 'MemoryFactory', 'MapService', function($scope,$location,$log,$stateParams,$rootScope,myConfig,MemoryFactory,MapService){
            var config = myConfig;
            var filters = config.map.filters;
            var filterList = filters.map(function(e){return e.search_param});

            // inizializzazione
            if(!$scope.cards){
                $scope.cards = {};
                checkParams($location.search());
            }

            // controllo al cambio dei parametri di search
            $scope.$watch(
                function(){ return $scope.params.length; }, 
                function(e, old){
                    //if(!angular.equals(e,old)){
                    // se cambiati controllo
                    checkParams($location.search());
                    //}else{$log.debug("direttiva, cambio search! non controllo");}
                });



            $scope.closeCard = function(k,value){
                // rimuovo il parametro
                removeFilter(k,value);
                // dovrebbe rimuovere anche la card al prossimo controllo
                var key = k.toString().concat(value);
                delete $scope.cards[key];
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
                    case 'users':
                        // cerco il nome utente
                        var user = MemoryFactory.getUser();
                        if(value == user.id && user.displayName){
                            card.label2 = user.displayName;
                            $log.debug('users, card ',card);
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
}).directive('wall', function() {

    return {
        restrict: 'EG',
        scope: {
            content: '=content',
            close: '=close',
            click: '=click'
        },
        templateUrl: '/templates/map-ui-template/wallTemplate.html',
        controller: ['$scope','$location', '$log', '$stateParams', '$rootScope','$filter', 'myConfig', 'MemoryFactory', 'MapService', function($scope,$location,$log,$stateParams,$rootScope,$filter,myConfig,MemoryFactory,MapService){
            var config = myConfig;
            var bounds = {};
            $scope.markerChildren = {};


            MapService.getMapBounds().then(
                function(response){
                    $scope.wallArray = [];
                    bounds = response;
                    $scope.wallArray = $filter('filter')($scope.content, boundsFiltering);
                    $log.debug('check wall ',bounds,$scope.content.map(function(e){return e.id}),$scope.wallArray.map(function(e){return e.id}));
                },
                function(response){
                    $log.debug("MapCtrl, setMapMarkers, MapService.getMapBounds, errore ",response);}
            );

            // click cambio di parametro search e chiudo modal
            $scope.clickWallItem = function(entityId){
                // cambio paramentro search
                $location.search('entity',entityId);
                //chiudo la modal
                $scope.close();
            };

            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                $log.debug("MapCtrl, boundsFiltering, val ",val," contains ",bounds.contains([val.lat,val.lng]));
                return bounds.contains([val.lat,val.lng]);
            }

            $scope.loadChildren = function(marker){

                // caricamento dei child
                var childrenRelations = config.types.child_relations[marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor(marker.id, childRel.field);
                    $log.debug("Cerco per il campo ",childRel.field," il marker con valore ", marker.id, " risultato ",c);
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
                $log.debug("ModalEntityCtrl, loadSibillings, costruzione dei figli ", children);
                $scope.markerChildren[marker.id] = children;

            };


        }]
    }
}).directive('actions', function() {

    return {
        restrict: 'EG',
        scope: {
            actions: '=actions',
            id: '=id',
            close:'=close',
            label:'=label',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/ActionsModal.html',
        controller: ['$scope','$location','$log','$filter','$ionicLoading','AuthService','groupsFactory','MemoryFactory', function($scope,$location,$log,$filter,$ionicLoading,AuthService,groupsFactory,MemoryFactory){

            // controllo azioni
            $scope.member = false;
            $scope.owner = false;
//            AuthService.checkMembership($scope.id).then(
//                function(response){
//                    $log.debug("the user is a group member!",response);
//                    // se esiste allora membro
//                    $scope.member = true;
//                    
//                    if(response.role == 'owner'){
//                        // se ha impostato il ruolo proprietario
//                        $scope.owner = true;
//                    }
//                    // init delle azioni
//                    initActions();
//                },
//                function(response){
//                    $log.log('the user is not a group member!');
//                    // giusto per essere sicuro...
//                    $scope.member = false;
//                    $scope.owner = false;
//                    // init delle azioni
//                    initActions();
//                }
//            );
            
            groupsFactory.getMembers($scope.id).then(
                function(response){
                    $log.debug("the user is a group member!",response);
                    
                    if(!$scope.user)
                        $scope.user = MemoryFactory.getUser();
                    var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                    if(index > -1){
                        // se esiste allora membro
                        $scope.member = true;
                        if(response[index].role == 'owner'){
                            // se ha impostato il ruolo proprietario
                            $scope.owner = true;
                        }
                    }
                    // init delle azioni
                    initActions();
                },
                function(response){
                    $log.log('the user is not a group member!');
                    // giusto per essere sicuro...
                    $scope.member = false;
                    $scope.owner = false;
                    // init delle azioni
                    initActions();
                }
            );
            
            
            $scope.actionEntity = function(action, param){
                
                $log.debug('actionEntity ',action,param);
                
                switch(action){
                    case 'view':
                        //chiudo la modal
                        $scope.close();
                        //aggiorno i parametri search con il filtro
                        $location.search(param,$scope.id);
                        break;
                    case 'join':
                        //parte richiesta di join
                        $ionicLoading.show();
                        groupsFactory.joinGroup($scope.id).then(
                            function(response){
                                $log.debug(response);
                                $scope.member = true;
                                if(response.role == 'owner'){
                                    // se ha impostato il ruolo proprietario
                                    $scope.owner = true;
                                }
                                initActions();
                                $ionicLoading.hide();
                            },
                            function(response){
                                $log.error("actionEntity, join, errore",response);
                                $ionicLoading.hide();
                            }
                        );
                        
                        break;
                    case 'leave':
                        // conferma se uscire
                        $ionicLoading.show();
                        $log.debug('check InitActions pre leave');
                        groupsFactory.leaveGroup($scope.id).then(
                            function(response){
                                // reset dei permessi
                                $scope.member = false;
                                $scope.owner = false;
                                // reinizializzo i permessi
                                initActions();
                                $ionicLoading.hide();
                            },
                            function(response){
                                $log.error("actionEntity, leave, errore",response);
                                $log.error(response);
                                // notifica errore
                                $ionicLoading.hide();
                            }
                        );
                    case 'users':
                        // apri lista utenti in loco (modal?)
                        groupsFactory.getMembers($scope.id).then(
                            function(response){
                                $log.debug('manage users, utenti',response);
                                $scope.users = response;
                            },
                            function(response){
                                $log.error('manage users, error',response);
                                // avverti dell'errore
                            }
                        );
                        break;
                    default:

                }

            }

            // calcolo i permessi per le azioni
            function initActions(){
                // lancio il reset
                $scope.reset = true;
                // copio le azioni per manipolarle
                $scope.actionList = angular.copy($scope.actions);
                for(var i in $scope.actionList){
                    switch($scope.actionList[i].check){
                        case 'membership':
                            angular.extend($scope.actionList[i], {check:$scope.member});
                            break;
                        case 'ownership':
                            angular.extend($scope.actionList[i], {check:$scope.owner});
                            break;
                        case 'noOwnership':
                            angular.extend($scope.actionList[i], {check:!$scope.owner});
                            break;
                        case 'noMembership':
                            angular.extend($scope.actionList[i], {check:!$scope.member});
                            break;
                        default: //se nessun check e' richiesto > true
                            angular.extend($scope.actionList[i], {check:true});
                    }
                }
            }
            
            function loading(){
                $ionicLoading.show({
                    template: 'REQUESTING...',
                    animation: 'fade-in',
                    noBackdrop : true,
                    maxWidth: 50,
                    showDelay: 0
                });
            }
            function done(){
                $ionicLoading.hide();
            }

        }]
    };
}).directive('relations', function() {

    return {
        restrict: 'EG',
        scope: {
            relations: '=relations',
            callback: '=callback',
            label: '=label',
            id: '=id',
            reset: '=reset'
        },
        templateUrl: '/templates/map-ui-template/AddChildren.html',
        controller: ['$scope','$log','$filter','AuthService','groupsFactory', function($scope,$log,$filter,AuthService,groupsFactory){
            
            // controllo il flag di reset che viene passato nel setup della direttiva nella vista
            $scope.$watch('reset',function(e,old){
                if(e && !old){
                    //init relations, qualcosa e' cambiato
                    initRelations();
                    // reset del flag
                    $scope.reset = false;
                }
            
            });
            
            // init relazioni
            initRelations();
            
            
            /*
             * funzioni private
             * initRelations: crea la lista di relazioni per la vista
             * lazyCheck: controlla le relazioni che hanno il campo check impostato
             */
            
            // fix dei check se necessario
            function initRelations(){
                $scope.relationsList = angular.copy($scope.relations);
                $scope.count = 0;
                for(var i in $scope.relationsList){
                    if(!$scope.relationsList[i].rel.check){
                        $scope.relationsList[i].check = true;
                        $scope.count++;
                    } else {
                        // controllo e metto a false fino a risposta
                        lazyCheck($scope.relationsList[i],$scope.relationsList[i].rel.check);
                        $scope.relationsList[i].check = false;
                    }
                }
            }
            
            function lazyCheck(relation,check){
                switch(check){
                    case 'membership':
                        AuthService.checkMembership($scope.id).then(
                            function(response){
                                relation.check = true;
                                $scope.count++;
                                $log.debug('relation set true ',relation);
                            },
                            function(response){$log.log('no member!');}
                        );
                        break;
                    default:
                }
            }
        }]
    }
}).directive('membersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details'
        },
        templateUrl: '/templates/map-ui-template/membersCounter.html',
        controller: ['$scope','$log','$filter','groupsFactory', function($scope,$log,$filter,groupsFactory){
        
            $scope.counter = 1;
            groupsFactory.getMembers($scope.id).then(
                function(response){
                    if(Array.isArray(response)){
                        $scope.counter = response.length;
                    }
                },
                function(response){$log.error('groupsFactory, getMembers, error ',response);}
            );
        }]
    }

})
.directive('membersList',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details'
        },
        templateUrl: '/templates/map-ui-template/membersList.html',
        controller: ['$scope','$log','$filter','groupsFactory','MemoryFactory', function($scope,$log,$filter,groupsFactory,MemoryFactory){
        
            $scope.counter = [];
            $scope.user = MemoryFactory.getUser();
            $scope.role = false;
            
            initList();
            
            
            function initList(){
                groupsFactory.getMembers($scope.id).then(
                    function(response){
                        if(Array.isArray(response)){
                            $log.debug('check members list',response);
                            $scope.membersList = response;
                            if($scope.user){
                                var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                                if(index > -1){
                                    $scope.role = response[index].role?response[index].role:'member';
                                }
                            }
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
                );
            
            }
            
            $scope.deleteMember = function(groupId,memberId){
                groupsFactory.removeUser(groupId,memberId).then(
                    function(response){
                        // reinizializzo la lista
                        initList();
                    },
                    function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                );
            }
        }]
    }

});

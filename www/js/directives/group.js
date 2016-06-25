angular.module('firstlife.directives', []).directive('membersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/membersCounter.html',
        controller: ['$scope','$log','$filter','groupsFactory', function($scope,$log,$filter,groupsFactory){

            initCounter();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersCounter){
                    e.preventDestroyMembersCounter = true;
                    delete $scope;
                }
            });

            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    initCounter();
                }
            });
            $scope.$watch('reset',function(e,old){
                // cambia il marker
                if(e && e != old){
                    // init delle simple entities
                    initCounter();
                }
            });


            function initCounter(){
                $scope.counter = 1;
                groupsFactory.getMembers($scope.id).then(
                    function(response){
                        if(Array.isArray(response)){
                            $scope.counter = response.length;
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
                );
            }
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

            //$scope.counter = [];
            $scope.user = MemoryFactory.getUser();
            //$scope.role = false;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersList){
                    e.preventDestroyMembersList = true;
                    delete $scope;
                }
            });


            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    initList();
                }
            });

            initList();


            function initList(){
                $scope.role = false;
                $scope.counter = [];
                $scope.membersList = [];
                groupsFactory.getMembers($scope.id).then(
                    function(response){
                        if(Array.isArray(response)){
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

}).directive('entityActions', function() {

    return {
        restrict: 'EG',
        scope: {
            actions: '=actions',
            marker: '=marker',
            close:'=close',
            label:'=label',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/actionsModal.html',
        controller: ['$scope','$location','$log','$filter','$ionicLoading','$ionicPopup','$ionicActionSheet','$q','AuthService','groupsFactory','MemoryFactory','notificationFactory', function($scope,$location,$log,$filter,$ionicLoading,$ionicPopup,$ionicActionSheet,$q,AuthService,groupsFactory,MemoryFactory,notificationFactory){

            // controllo azioni
            $scope.member = false;
            $scope.owner = false;
            $scope.subscriber = false;
            if(!$scope.user)
                $scope.user = MemoryFactory.getUser();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    delete $scope;
                }
            });

            $scope.$watch('marker',function(e,old){
                // cambia il marker
                if(e.id != old.id){
                    // init delle simple entities
                    init();
                }
            });

            init();


            function init(){
                var promises = [];
                if($scope.marker.entity_type == "FL_GROUPS"){
                    promises.push(initGroup());
                }
                promises.push(initSubscriptions());
                //quando sono tutti i valori inizializzati
                $q.all(promises).then(
                    function(response){
                        // init delle azioni
                        initActions();
                    });

            }

            // recupero i subscribers
            function initSubscriptions(){
                return notificationFactory.subscribers($scope.marker.id).then(
                    function(response){
                        $log.debug('check subscribers ',response);
                        var subscribers = response;
                        if($scope.user)
                            var index = subscribers.indexOf($scope.user.id);
                        $scope.subscriber = index < 0 ? false : true;
                    },
                    function(response){
                        $log.error('check subscribers ',response);
                    }
                );

            }

            // recupero i membri se e' un gruppo
            function initGroup(){
                return groupsFactory.getMembers($scope.marker.id).then(
                    function(response){
                        var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                        if(index > -1){
                            // se esiste allora membro
                            $scope.member = true;
                            if(response[index].role == 'owner'){
                                // se ha impostato il ruolo proprietario
                                $scope.owner = true;
                            }
                        }else{
                            $scope.member = false;
                            $scope.owner = false;
                        }
                    },
                    function(response){
                        $log.log('the user is not a group member!');
                        // giusto per essere sicuro...
                        $scope.member = false;
                        $scope.owner = false;
                    }
                );
            }

            $scope.actionEntity = function(action, param){
                $log.debug('check action ',action,param);
                switch(action){
                    case 'unsubscribe':
                        //parte richiesta di unsubscribe
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_UNSUBSCRIBE'),
                                template: $filter('translate')('ENTITY_UNSUBSCRIBE_ASK')
                            });
                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        notificationFactory.unsubscribe($scope.marker.id).then(
                                            function(response){
                                                $scope.subscriber = false;
                                                initActions();
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("notificationFactory, unsubscribe, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('unsubscribe annullata');
                                    }
                                });
                        };
                        $scope.showConfirm();
                        break;
                    case 'subscribe':
                        //parte richiesta di subscribe
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_SUBSCRIBE'),
                                template: $filter('translate')('ENTITY_SUBSCRIBE_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        notificationFactory.subscribe($scope.marker.id).then(
                                            function(response){
                                                $scope.subscriber = true;
                                                initActions();
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("notificationFactory, subscribe, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('subscribe annullata');
                                    }
                                });
                        };
                        $scope.showConfirm();
                        break;
                    case 'view':
                        //aggiorno i parametri search con il filtro
                        $location.search(param,$scope.marker.id);
                        //chiudo la modal
                        $scope.close();
                        break;
                    case 'join':
                        //parte richiesta di join
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_JOIN'),
                                template: $filter('translate')('GROUP_JOIN_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        groupsFactory.joinGroup($scope.marker.id).then(
                                            function(response){
                                                $scope.member = true;
                                                if(response.role == 'owner'){
                                                    // se ha impostato il ruolo proprietario
                                                    $scope.owner = true;
                                                }
                                                initActions();
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("actionEntity, join, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('join annullata');
                                    }
                                });
                        };

                        $scope.showConfirm();

                        break;
                    case 'leave':
                        // conferma se uscire
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_LEAVE'),
                                template: $filter('translate')('GROUP_LEAVE_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        groupsFactory.leaveGroup($scope.marker.id).then(
                                            function(response){
                                                // reset dei permessi
                                                $scope.member = false;
                                                $scope.owner = false;
                                                // reinizializzo i permessi
                                                initActions();
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("actionEntity, leave, errore",response);
                                                $log.error(response);
                                                // notifica errore
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('cancellazione annullata');
                                    }
                                });
                        };

                        $scope.showConfirm();
                        break;
                    case 'users':
                        // apri lista utenti in loco (modal?)
                        groupsFactory.getMembers($scope.marker.id).then(
                            function(response){
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
                            angular.extend($scope.actionList[i], {check:(!$scope.owner && $scope.member)});
                            break;
                        case 'noMembership':
                            angular.extend($scope.actionList[i], {check:(!$scope.member && !$scope.owner)});
                            break;
                        case 'subscriber':
                            angular.extend($scope.actionList[i], {check:$scope.subscriber});
                            break;
                        case 'noSubscriber':
                            angular.extend($scope.actionList[i], {check:!$scope.subscriber});
                            break;
                        default: //se nessun check e' richiesto > true
                            angular.extend($scope.actionList[i], {check:true});
                    }
                }
                $log.debug('check actionList ',$scope.actionList);
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
            function actionReport(success){
                var text = 'SUCCESS';
                if(!success){
                    text = 'ERROR';
                }
                var hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(text),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        $log.log('CANCELLED');
                    }
                });
            }

        }]
    };
});
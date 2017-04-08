angular.module('firstlife.directives').directive('membersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details'
        },
        templateUrl: '/templates/modals/membersCounter.html',
        controller: ['$rootScope','$scope','$log','$filter','groupsFactory', function($rootScope, $scope,$log,$filter,groupsFactory){

            $scope.members = groupsFactory.getMembersRx($scope.id);
            initCounter();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersCounter){
                    e.preventDestroyMembersCounter = true;
                    if($scope.members)
                        try{$scope.members.unsubscribe();}catch(e){}
                    delete $scope;
                }
            });

            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    $scope.members = groupsFactory.getMembersRx($scope.id);
                    initCounter();
                }
            });

            $rootScope.$on('groupReset',function(e,args){
                if(!e.preventGroupResetCounter){
                    e.preventGroupResetCounter = true;
                    $scope.members = args.observable;
                    initCounter();
                }
            });

//            function initCounter(){
//                $scope.counter = 1;
//                groupsFactory.getMembers($scope.id).then(
//                    function(response){
//                        if(Array.isArray(response)){
//                            $scope.counter = response.length;
//                        }
//                    },
//                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
//                );
//            }
//            
            function initCounter(){
                $scope.counter = 1;
                $scope.members.subscribe(
                    function(result){
                        $scope.counter = result.length;
                    },
                    function (error){
                        $log.error('groupsFactory, getMembers, error ',error);
                    },
                    function (){
                        $log.debug('groupsFactory, getMembers, complete ');
                    }
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
            details: '=details',
            owner: '=owner'
        },
        templateUrl: '/templates/modals/membersList.html',
        controller: ['$rootScope','$scope','$log','$filter','groupsFactory','MemoryFactory', 'AuthService', function($rootScope,$scope,$log,$filter,groupsFactory,MemoryFactory, AuthService){

            //$scope.counter = [];
            $scope.user = AuthService.getUser();
            //$scope.role = false;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersList){
                    e.preventDestroyMembersList = true;
                    if($scope.members)
                        try{$scope.members.unsubscribe();}catch(e){}
                    
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

            $rootScope.$on('groupReset',function(e,args){
                if(!e.preventMembersResetCounter){
                    e.preventMembersResetCounter = true;
                    $scope.members = args.observable;
                    initList();
                }
            });
            
            $scope.members = groupsFactory.getMembersRx($scope.id);
            initList();

            function initList(){
                $scope.role = false;
                $scope.counter = [];
                $scope.membersList = [];
                
                $scope.members.subscribe(
                    function(results){
                        $log.debug('check members',results)
                        $scope.membersList = results;
                        $log.debug('member list',results)
                        if($scope.user){
                            var index = results.map(function(e){return e.id}).indexOf($scope.user.id);
                            if(index > -1){
                                $scope.role = true;
                            }
                        }
                    },
                    function(error){$log.error('groupsFactory, getMembers, error ',error);},
                    function(){}
                );
            }

            $scope.deleteMember = function(memberId){
                groupsFactory.removeUser($scope.id,memberId).then(
                    function(response){
                        // reinizializzo la lista
                        initList();
                    },
                    function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                );
            }
        }]
    }

}).directive('membersButton',['$log','$ionicModal',function($log,$ionicModal){

    return {
        restrict: 'EG',
        scope:{
            close:'=',
            marker:'='
        },
        template:' <ion-item class="item-icon-left" on-tap="membersButtonPopover()"> <i class="icon ion-person-stalker"></i>{{"MEMBERS"|translate}}</ion-item>',
        link: function(scope, element, attrs){
            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    delete scope;
                }
            });
            // apro la lista dei membri
            scope.membersButtonPopover = function (){
                scope.close();
                // apro la modal
                scope.modalMembers = {};
                $ionicModal.fromTemplateUrl('templates/modals/members.html', {
                    scope: scope,
                    animation: 'fade-in',//'slide-in-up',
                    backdropClickToClose : true,
                    hardwareBackButtonClose : true
                }).then(function(membersmodal) {
                    scope.modalMembers = membersmodal;
                    scope.modalMembers.show();
                    $log.debug("infoPlace, apro modal members ",membersmodal);
                });

            };
        }
    }

    }]);
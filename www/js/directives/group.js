angular.module('firstlife.directives').directive('membersCounter',['$log','$filter','groupsFactory',function($log,$filter,groupsFactory){
    return {
        restrict: 'EG',
        scope: {
            id: '< id'
        },
        template: '<span class="modal-subheader-item">{{"MEMBERS"|translate}} {{counter}} <i class="icon ion-android-people"></i></span>',
        link: function(scope, element, attr){


            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersCounter){
                    e.preventDestroyMembersCounter = true;

                    delete scope;
                }
            });

            initCounter();

            scope.$on('resetGroupCounter',function(e,args){
                if(e.defaultPrevented)
                    return;
                e.preventDefault();


                initCounter();
            });


            function initCounter(){
                scope.counter = 1;
                groupsFactory.getMembers(scope.id).then(
                    function(result){
                        scope.counter = result.length;
                    },
                    function (error){
                        $log.error('groupsFactory, getMembers, error ',error);
                    }
                );
            }
        }
    }

}])
    .directive('membersList',['$log','$filter','groupsFactory','MemoryFactory', 'AuthService', function($log,$filter,groupsFactory,MemoryFactory, AuthService){
    return {
        restrict: 'EG',
        scope: {
            id: '< id',
            details: 'details',
            owner: '< owner'
        },
        templateUrl: '/templates/modals/membersList.html',
        link: function(scope, element, attr){

            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersList){
                    e.preventDestroyMembersList = true;
                    
                    delete scope;
                }
            });

            scope.user = AuthService.getUser();
            initList();




            scope.$on('groupReset',function(e,args){
                if(e.defaultPrevented)
                    return;

                e.preventDefault();

                scope.members = null;
                initList();
            });



            function initList(){
                scope.role = false;
                scope.counter = [];
                scope.membersList = [];
                
                groupsFactory.getMembers(scope.id).then(
                    function(results){
                        $log.debug('check members',results)
                        scope.membersList = results;
                        $log.debug('member list',results)
                        if(scope.user){
                            var index = results.map(function(e){return e.id}).indexOf(scope.user.id);
                            if(index > -1){
                                scope.role = true;
                            }
                        }
                    },
                    function(error){$log.error('groupsFactory, getMembers, error ',error);}
                );
            }

            scope.deleteMember = function(memberId){
                groupsFactory.removeUser(scope.id,memberId).then(
                    function(response){
                        // reinizializzo la lista
                        initList();
                    },
                    function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                );
            }
        }
    }

}]).directive('membersButton',['$log','$ionicModal',function($log,$ionicModal){

    return {
        restrict: 'EG',
        scope:{
            close:'=',
            marker:'='
        },
        template:' <ion-item class="item item-button-right">{{"MEMBERS"|translate}}<button class="button button-positive" on-tap="membersButtonPopover()"><i class="icon ion-person-stalker"></i></button></ion-item>',
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
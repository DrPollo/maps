angular.module('firstlife.directives')
    .directive('membersList',['$log','$filter','groupsFactory','MemoryFactory', 'AuthService', function($log,$filter,groupsFactory,MemoryFactory, AuthService){
    return {
        restrict: 'EG',
        scope: {
            id: '< id',
            owner: '< owner'
        },
        templateUrl: '/templates/modals/membersList.html',
        link: function(scope, element, attr){

            scope.$on('$destroy', function(e) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();
                delete scope;
            });

            scope.user = AuthService.getUser();
            initList();



            function initList(){
                // $log.debug('init member list',scope.id);

                scope.role = false;
                scope.counter = [];
                scope.membersList = [];
                
                groupsFactory.getMembers(scope.id).then(
                    function(results){
                        // $log.debug('check members',results);
                        scope.membersList = results;
                        // $log.debug('member list',results);
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
            close:'&',
            marker:'<'
        },
        template:' <ion-item class="item item-button-right">{{"MEMBERS"|translate}}<button class="button button-positive" on-tap="membersButtonPopover()"><i class="icon ion-person-stalker"></i></button></ion-item>',
        link: function(scope, element, attrs){

            scope.$on('$destroy', function(e) {
                if(e.defaultPrevented)
                    return;

                e.preventDefault();
                delete scope;
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
                // todo gestione distruzione popover?
            };
        }
    }

    }]);
angular.module('firstlife.directives')
    .directive('members',['$log', '$filter', '$ionicPopup','groupsFactory','AuthService',function ($log, $filter, $ionicPopup, groupsFactory,AuthService) {
        return {
            restrict: 'EG',
            scope:{
                marker:"<"
            },
            templateUrl:"/templates/thing/people.html",
            link:function (scope,element,attr) {
                scope.$on('$destroy', function(e) {
                    if(e.defaultPrevented)
                        return;

                    e.preventDefault();
                    delete scope;
                });

                scope.user = AuthService.getUser();

                init();



                function init(){
                    // $log.debug('init member list',scope.id);

                    scope.role = false;
                    scope.counter = [];
                    scope.membersList = [];
                    scope.canDelete = (scope.user.id === scope.marker.owner.id);

                    groupsFactory.getMembers(scope.marker.id).then(
                        function(results){
                            $log.debug('check members',results);
                            scope.membersList = results;
                            requestUpdate(results.length);
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

                scope.join = function(){
                    //parte richiesta di join
                    scope.showConfirm = function() {
                        var confirmPopup = $ionicPopup.confirm({
                            title: $filter('translate')('GROUP_JOIN'),
                            template: $filter('translate')('GROUP_JOIN_ASK')
                        });

                        confirmPopup.then(
                            function(res) {
                                if(res) {
                                    groupsFactory.joinGroup(scope.marker.id).then(
                                        function(response){
                                            //reinizializzo i membri
                                            init();
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

                    scope.showConfirm();
                };

                scope.leave = function(){
                    // conferma se uscire
                    scope.showConfirm = function() {
                        var confirmPopup = $ionicPopup.confirm({
                            title: $filter('translate')('GROUP_LEAVE'),
                            template: $filter('translate')('GROUP_LEAVE_ASK')
                        });

                        confirmPopup.then(
                            function(res) {
                                if(res) {
                                    groupsFactory.leaveGroup(scope.marker.id).then(
                                        function(response){
                                            //reinizializzo i membri
                                            init();
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

                    scope.showConfirm();
                };

                scope.deleteMember = function(memberId){
                    groupsFactory.removeUser(scope.id,memberId).then(
                        function(response){
                            // reinizializzo la lista
                            initList();
                        },
                        function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                    );
                }


                function requestUpdate(counter) {
                    scope.$emit('counterUpdate',{members:counter});
                }
            }
        };
    }])
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
        template:' <ion-item class="item item-button-right">{{"MEMBERS"|translate}}<button class="button button-positive" on-tap="membersButtonPopover()"><i class="icon ion-android-people"></i></button></ion-item>',
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
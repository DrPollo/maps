/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('commentsList',function(){
    return {
        restrict:'EG',
        scope:{
            id:'='
        },
        templateUrl:'/templates/post/commentsList.html',
        controller:[ '$scope', '$log', '$q','$ionicPopover','postFactory', 'AuthService', 'entityFactory', 'myConfig',function($scope, $log,$q, $ionicPopover, postFactory, AuthService, entityFactory, myConfig) {

            $scope.$on('$destroy', function (e) {
                if (!e.preventEventCommentsLists) {
                    e.preventEventCommentsLists = true;
                    // rimuovo il menu
                    scope.popover.remove();
                    // cancello lo scope
                    delete $scope;
                }
            });


            $scope.dev = myConfig.dev;
            // $scope.comment = {message : 'asdone'};

            initCommentsList();

            $scope.publishComment = function(){
                $scope.loading = true;
                $log.debug('publishComment',$scope.comment.message);
                postFactory.createComment($scope.id,angular.copy($scope.comment.message)).then(
                    function (response) {
                        $log.debug('ok comment',response);
                        initCommentsList().then(
                            function(){
                                $scope.loading = false;
                            },
                            function () {
                                $scope.loading = false;
                            }
                        );

                    },
                    function (err) {
                        $log.error(err);
                        $scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }



            $scope.config = myConfig;
            $scope.user = AuthService.getUser();

            // inizializzo aggiorno il commento con id
            $scope.updateComment = function(id){
                // chiudo il popup
                $scope.popover.hide();
                // assegno l'id
                $scope.edit = id;
            }
            // chiudo l'editor
            $scope.abortEdit = function () {
                // tolgo l'id
                $scope.edit = null;
            }
            // aggiorno il commento
            $scope.update = function(id, message){
                $scope.loading = true;
                $scope.edit = null;
                postFactory.updateComment(id, message).then(
                    function (response) {
                        $log.debug('ok update comment',response);
                        initCommentsList().then(
                            function(){
                                $scope.loading = false;
                            },
                            function () {
                                $scope.loading = false;
                            }
                        );

                    },
                    function (err) {
                        $log.error(err);
                        $scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }


            // cancello il commento
            $scope.deleteComment = function(id){
                $scope.loading = true;
                $scope.popover.hide();
                postFactory.deleteComment(id).then(
                    function (response) {
                        // $log.debug('ok delete comment',response);
                        initCommentsList().then(
                            function(){
                                $scope.loading = false;
                            },
                            function () {
                                $scope.loading = false;
                            }
                        );

                    },
                    function (err) {
                        $log.error(err);
                        $scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }
            // segnalo il commento
            $scope.reportComment = function(id){
                $scope.loading = true;
                $scope.popover.hide();
                var report = {
                    comment_id: id,
                    message: 'default message'
                };
                entityFactory.report(report).then(
                    function (response) {
                        $log.debug('ok delete comment',response);
                        initCommentsList().then(
                            function(){
                                $scope.loading = false;
                            },
                            function () {
                                $scope.loading = false;
                            }
                        );
                    },
                    function (err) {
                        $log.error(err);
                        $scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }


            // open popover menu
            var template = '';
            $ionicPopover.fromTemplateUrl('/templates/popovers/comment-menu.html',{
                scope: $scope
            }).then(
                function (popover){
                    $scope.popover = popover;
                }
            );
            // apro il menu
            $scope.openMenu = function($event, id, owner) {
                $scope.current = id;
                initPerms(owner);
                if($scope.popover)
                    $scope.popover.show($event);
            };

            // init della lista dei commenti
            function initCommentsList(){
                initCommentEditor();
                var deferred = $q.defer();
                postFactory.getComments($scope.id).then(
                    function (results) {
                        // $log.debug(results);
                        $scope.comments = results;
                        deferred.resolve(results);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            }



            // init perms
            function initPerms (author){
                if(!$scope.user)
                    $scope.user = AuthService.getUser();
                // se l'utente non e' definito
                if(!$scope.user)
                    return false;

                var source = 'others';
                if(author == $scope.user.id)
                    source = 'self';

                $scope.checkPerms = AuthService.checkPerms(source);
                return $scope.perms;
            }



            // init dell'editor del commento
            function initCommentEditor() {
                $scope.comment = {message:""};
            }

        }]
    }
});
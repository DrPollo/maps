/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('commentsList',['$log', '$q','$ionicPopover','postFactory', 'AuthService', 'entityFactory', 'myConfig',function($log,$q, $ionicPopover, postFactory, AuthService, entityFactory, myConfig){
    return {
        restrict:'EG',
        scope:{
            id:'='
        },
        templateUrl:'/templates/post/commentsList.html',
        link: function(scope, element, attrs) {

            scope.$on('$destroy', function (e) {
                if (!e.preventEventCommentsLists) {
                    e.preventEventCommentsLists = true;
                    // rimuovo il menu
                    scope.popover.remove();
                    // cancello lo scope
                    delete scope;
                }
            });
            scope.dev = myConfig.dev;

            initCommentsList();
            initCommentEditor();

            scope.publishComment = function(){
                var comment = scope.text;
                initCommentEditor()
                scope.loading = true;
                postFactory.createComment(scope.id,angular.copy(comment)).then(
                    function (response) {
                        $log.log('ok comment',response);
                        initCommentsList().then(
                            function(){
                                scope.loading = false;
                            },
                            function () {
                                scope.loading = false;
                            }
                        );

                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }


            scope.config = myConfig;
            scope.user = AuthService.getUser();

            // cancello il commento
            scope.deleteComment = function(id){
                scope.loading = true;
                scope.popover.hide();
                postFactory.deleteComment(id).then(
                    function (response) {
                        $log.log('ok delete comment',response);
                        initCommentsList().then(
                            function(){
                                scope.loading = false;
                            },
                            function () {
                                scope.loading = false;
                            }
                        );

                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }
            // segnalo il commento
            scope.reportComment = function(id){
                scope.loading = true;
                scope.popover.hide();
                var report = {
                    comment_id: id,
                    message: 'default message'
                };
                entityFactory.report(report).then(
                    function (response) {
                        $log.log('ok delete comment',response);
                        scope.loading = false;
                        // todo messaggio ok all'utente
                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            }


            // open popover menu
            var template = '';
            $ionicPopover.fromTemplateUrl('/templates/popovers/comment-menu.html',{
                scope: scope
            }).then(
                function (popover){
                    scope.popover = popover;
                }
            );
            // apro il menu
            scope.openMenu = function($event, id, owner) {
                scope.current = id;
                initPerms(owner);
                if(scope.popover)
                    scope.popover.show($event);
            };

            // init della lista dei commenti
            function initCommentsList(){
                var deferred = $q.defer();
                postFactory.getComments(scope.id).then(
                    function (results) {
                        $log.log(results);
                        scope.comments = results;
                        deferred.resolve(results);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            }

            // init dell'editor del commento
            function initCommentEditor() {
                scope.text = "";
            }


            // init perms
            function initPerms (author){
                if(!scope.user)
                    scope.user = AuthService.getUser();
                // se l'utente non e' definito
                if(!scope.user)
                    return false;

                var source = 'others';
                if(author == scope.user.id)
                    source = 'self';

                scope.checkPerms = AuthService.checkPerms(source);
                return scope.perms;
            }

        }
    }
}]);
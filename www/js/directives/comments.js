/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('commentsList',['$log', 'postFactory',function($log,postFactory){
    return {
        restrict:'EG',
        scope:{
            id:'='
        },
        templateUrl:'/templates/map-ui-template/commentsList.html',
        link: function(scope, element, attrs) {

            scope.$on('$destroy', function (e) {
                if (!e.preventEventCommentsLists) {
                    e.preventEventCommentsLists = true;
                    delete scope;
                }
            });

            initCommentsList();
            initCommentEditor();


            scope.publishComment = function(){
                postFactory.createComment(scope.id,angular.copy(scope.text)).then(
                    function (response) {
                        $log.log('ok comment',response)
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }


            function initCommentsList(){
                postFactory.getComments(scope.id).then(
                    function (results) {
                        $log.log(results);
                        scope.comments = results;
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }

            function initCommentEditor() {
                scope.text = "";
            }

        }
    }
}]);
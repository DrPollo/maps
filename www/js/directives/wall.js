angular.module('firstlife.directives')
    .directive('entityList', [ '$rootScope', '$location', '$log', '$filter', '$timeout','myConfig', 'MemoryFactory', 'ThingsService',  function($rootScope,$location,$log,$filter,$timeout, myConfig,MemoryFactory,ThingsService) {
        return {
            restrict: 'E',
            scope: {
                close: '&',
                click: '&'
            },
            templateUrl: '/templates/wall/entitylist.html',
            link: function(scope, element, attr){

                scope.loading = true;

                scope.$on('$destroy', function(e) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    // aggiorno il parametro prima di uscire
                    $location.search('q',scope.query);

                    delete scope;

                });

                scope.$on('wallQuery',function (e,args) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    if(args.query){
                        scope.query = args.query;
                    }else{
                        scope.quer = '';
                    }
                });


                init();
                var buffer = [];
                var index = 0;
                function init(){
                    var current = ThingsService.filterBuffer();
                    scope.markers = Object.keys(current).map(function(e){return current[e];});
                    // buffer = Object.keys(current).map(function(e){return current[e];});
                    // scope.markers = buffer.slice(0, Math.min(10,buffer.length));
                    var params = $location.search();
                    if(params.q)
                        scope.query = params.q;

                    scope.loading = false;
                }

                // click cambio di parametro search e chiudo modal
                scope.show = function(entityId){
                    // cambio paramentro search
                    // $location.search('entity',entityId);
                    scope.click({id: entityId});
                    //chiudo la modal
                    scope.close();
                };

                scope.visible = {};

            }
        }
    }]).directive('wallCard',['$log',function ($log) {
    return{
        strict:'EG',
        scope:{
            marker:'<',
            show:'&',
            query:'='
        },
        templateUrl:'/templates/wall/card.html',
        link:function (scope,element,attr) {
            scope.$on('$destroy',function (e) {
                if(e.defaultPrevented)
                    return;
                e.preventDefault;
                delete scope;
            });


            scope.filter = function(tag){
                // aggiorno il parametro q
                scope.$emit('wallQuery',{query: tag});
            };

            scope.focus = function(){
                scope.highlight = scope.marker.id;
                scope.$emit('focusOnWallItem',{id:scope.marker.id});
            };
            scope.close = function () {
                delete scope.highlight;
                scope.$emit('focusOnWallItem');
            };
        }
    }
}]).directive('wallActions',['$log', 'myConfig', 'groupsFactory', 'notificationFactory', 'postFactory',function ($log, myConfig, groupsFactory, notificationFactory, postFactory) {
        return{
            strict: 'EG',
            scope:{
                marker:'<'
            },
            templateUrl:'/templates/wall/actions.html',
            link:function (scope,element,attr) {
                scope.$on('$destroy',function (e) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault;
                    delete scope;
                });

                init();

                function init() {
                    scope.subscribers = null;
                    scope.posts = 0;
                    scope.initiatives = 0;
                    scope.contents = 0;
                    scope.members = null;
                    switch (scope.marker.entity_type){
                        case 'FL_GROUPS':
                            // init counter members
                            scope.members = 0;
                            groupsFactory.getMembers(scope.marker.id).then(
                                function (results) {
                                    scope.members = results.length;
                                }
                            );
                        default:
                            // init counter subscribers
                            scope.subscribers = 0;
                            notificationFactory.subscribers(scope.marker.id).then(
                                function (results) {
                                    scope.subscribers = results.length;
                                }
                            );
                            // init counter posts
                            postFactory.getPosts(scope.marker.id).then(
                                function (results) {
                                    scope.posts = results.length;
                                }
                            );
                            // init counter initiatives
                            scope.initiatives = scope.marker.initiative_list ? scope.marker.initiative_list.length : 0;
                            // todo init counter contents
                    }
                }


            }
        }
}]);
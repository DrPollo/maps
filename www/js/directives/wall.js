angular.module('firstlife.directives')
    .directive('wallToggler',['$log', function ($log) {
        return{
            restrict:'E',
            scope:{},
            templateUrl:'/templates/wall/toggler.html',
            link:function (scope,element,attr) {
                scope.$on('$destroy', function(e) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    delete scope;
                });

                scope.toggle = function () {
                    // $log.debug('toggle wall');
                    scope.$emit('toggleSideLeft');
                }

            }
        }
    }])
    .directive('sideWall',['$log', function ($log) {
        return {
            restrict: 'E',
            scope: {
                filter:'&'
            },
            templateUrl: '/templates/wall/side-wall.html',
            link: function (scope, element, attr) {
                scope.$on('$destroy', function(e) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    delete scope;
                });


                scope.closeWall = function () {
                    scope.$emit('closeSideLeft');
                };

                scope.clickWallItem = function(id){
                    scope.closeWall();
                    scope.$emit('wallClick',{id:id});
                }
            }
        }
    }])
    .directive('entityList', [ '$rootScope', '$location', '$log', '$filter', '$timeout','$ionicSideMenuDelegate','myConfig', 'MemoryFactory', 'ThingsService',  function($rootScope,$location,$log,$filter,$timeout,$ionicSideMenuDelegate, myConfig,MemoryFactory,ThingsService) {
        return {
            restrict: 'E',
            scope: {
                close: '&',
                click: '&'
            },
            templateUrl: '/templates/wall/entitylist.html',
            link: function(scope, element, attr){

                scope.loading = true;

                var searchendSetTimeout;
                var SEARCH_DELAY = myConfig.behaviour.searchend_delay;
                var text_limit = 3;


                scope.$on('$destroy', function(e) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();


                    scope.exit();

                    delete scope;
                });

                scope.$on('wallQuery',function (e,args) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    if(args && (args.query || args.q)){
                        scope.query = args.query || args.q;
                    } else {
                        scope.query = '';
                    }
                });

                scope.$on('wallInit',function (e,args) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    // $log.debug('wall init');
                    init();
                });

                init();
                var buffer = [];
                var index = 0;
                scope.markers = [];
                function init(){
                    delete scope.markers;

                    var params = $location.search();
                    if(params.q)
                        scope.query = params.q;

                    // $log.debug('init entity list');
                    ThingsService.filter().then(
                        function (current) {
                            delete scope.markers;
                            scope.markers = Object.keys(current).map(function(e){return current[e];});
                            // $log.debug('markers',scope.markers.length);
                            scope.loading = false;
                        },
                        function (err) {
                            scope.loading = false;
                            $log.error(err);
                        }
                    );
                }

                // click cambio di parametro search e chiudo modal
                scope.show = function(entityId){
                    // cambio paramentro search
                    $location.search('entity',entityId);
                    scope.click({id: entityId});
                    //chiudo la modal
                    scope.close();
                };

                scope.clearQuery = function () {
                    scope.query = '';
                    // avviso la mappa
                    scope.$emit('handleUpdateQ');
                };

                // aggiorno il parametro prima di uscire
                scope.exit =function(){
                    var q = scope.query ? scope.query : null;
                    // $log.debug('exit from entity-list with',q);
                    scope.$emit('handleUpdateQ',{q:q});
                    scope.close();
                };


                // gestione filtri categoria
                scope.openTreeMap = function () {
                  scope.$emit('openTreeMap');
                };


                /*
                 * todo gestione del focus su singla card
                 */
                scope.visible = {};
                scope.$on('focusOnWallItem',function (e,args) {
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    if(args.id){
                        scope.focus = args.id;
                    }else{
                        scope.focus = null;
                    }
                })
            }
        }
    }]).directive('wallCard',['$log',function ($log) {
    return{
        strict:'EG',
        scope:{
            marker:'<',
            show:'&',
            query:'<'
        },
        templateUrl:'/templates/wall/card.html',
        link:function (scope,element,attr) {
            scope.$on('$destroy',function (e) {
                if(e.defaultPrevented)
                    return;
                e.preventDefault;
                delete scope;
            });


            // scope.$broadcast('initActions',{id:scope.marker.id});
            // $log.debug(scope.marker.name);

            scope.filter = function(tag){
                // aggiorno il parametro q
                scope.$emit('wallQuery',{query: tag});
                // avviso la mappa
                scope.$emit('handleUpdateQ',{q:tag});
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
                    e.preventDefault();
                    delete scope;
                });


                init();

                function init() {
                    if(scope.subscribers)
                        delete scope.subscribers;
                    if(scope.posts)
                        delete scope.posts;
                    if(scope.members)
                        delete scope.members;


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
                            scope.posts = 0;
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
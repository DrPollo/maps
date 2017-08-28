angular.module('firstlife.directives')
    .directive('wallToggler',['$log','myConfig', 'PlatformService','ThingsService',function ($log,myConfig, PlatformService,ThingsService) {
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
                };

                scope.filter = ThingsService.getFilter('entity_type');
                scope.colors = myConfig.design.colors;
                scope.types = myConfig.types.list;

                scope.isMobile = PlatformService.isMobile();

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
                    // scope.closeWall();
                    // scope.markerId = id;
                    // $log.debug('wallClick',id);
                    scope.$emit('wallClick',{id:id});
                };
            }
        }
    }])
    .directive('entityList', [ '$rootScope', '$location', '$log', '$filter', '$timeout','$ionicSideMenuDelegate', '$window', '$ionicPopup', 'myConfig', 'MemoryFactory', 'ThingsService', 'shareFactory', 'clipboard', function($rootScope,$location,$log,$filter,$timeout,$ionicSideMenuDelegate, $window, $ionicPopup, myConfig,MemoryFactory,ThingsService, shareFactory, clipboard) {
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

                scope.$on('changeLanguage',function (event,args) {
                    // $log.debug('changeLanguage',args);
                    if(args.id){
                        moment.localeData(args.id);
                        init();
                    }
                });

                var buffer = [];
                var index = 0;
                scope.markers = [];
                scope.adapterContainer = {
                    topVisible : 0
                };
                scope.datasource = {
                    get: function (index, count, success) {
                        // ordinamento
                        // orderBy: ['-last_update','name'] |filter:query
                        // console.log('request from total of',scope.markers.length,' by index = ' + index + ', count = ' + count);
                        var i = Math.max(index,0);
                        var c = count;
                        if(index < 0)
                            c = count + index;
                        // $log.log('count',c,'index',i);

                        if(c < 0) {
                            success([]);
                            return;
                        }

                        var results = $filter('limitTo')(scope.markers,c,i);

                        $timeout(function(){success(results);},100);
                    }
                };


                scope.sorting = {
                    current: 'time',
                    time: 'newer',
                    text: 'alphabetical',
                    newer : ['-last_activity','-last_update'],
                    older : ['last_activity','last_update'],
                    alphabetical: ['name'],
                    nalphabetical: ['-name'],
                    params: ['-last_activity','-last_update','name'],
                    toggleTime: function () {
                        if(scope.sorting.time === 'newer') {
                            scope.sorting.time = 'older';
                        }else{
                            scope.sorting.time = 'newer';
                        }
                        scope.sorting.current = 'time';
                        scope.sorting.resetList();
                    },
                    toggleText: function () {
                        if(scope.sorting.text === 'alphabetical') {
                            scope.sorting.text = 'nalphabetical';
                        }else{
                            scope.sorting.text = 'alphabetical';
                        }
                        scope.sorting.current = 'text';
                        scope.sorting.resetList();
                    },
                    resetList: function () {
                        // combine filter params
                        if(scope.sorting.current === 'text'){
                            scope.sorting.params = scope.sorting[scope.sorting.text].concat(scope.sorting[scope.sorting.time]);
                        } else {
                            scope.sorting.params = scope.sorting[scope.sorting.time].concat(scope.sorting[scope.sorting.text]);
                        }
                        // reset list
                        init();
                    }
                };

                /*
                 * Share FirstLife
                 */
                scope.share = function(){
                    scope.inviteForm = {
                        url: $window.location.href,
                        inClipboard: false,
                        embed: {
                            iframe : '<iframe border="0" src="'+$window.location.href+'&embed=viewer'+'"></iframe>',
                            inClipboard:false
                        },
                        emails:null,
                        message: null,
                        tab: 0,
                        sendError: false,
                        sendOk: false,
                        toggle: function(i){ scope.inviteForm.tab = i; },
                        close: function () { alertPopup.close(); },
                        action: function () {
                            switch (scope.inviteForm.tab){
                                case 1:
                                    scope.copyToClipboard('url');
                                    break;
                                case 2:
                                    scope.copyToClipboard('embed');
                                    break;
                                default:
                                    if(!scope.inviteForm.emails) {
                                        return;
                                    }else{
                                        shareFactory.map(scope.inviteForm).then(
                                            function (res) {
                                                scope.inviteForm.sendError = false;
                                                scope.inviteForm.emails = null;
                                                scope.inviteForm.message = null;
                                                scope.inviteForm.sendOk = true;
                                                $timeout(function () {
                                                    alertPopup.close();
                                                },2000);
                                            },
                                            function (err) {
                                                scope.inviteForm.sendError = true;
                                            }
                                        );
                                    }
                            }

                        }
                    };
                    if($location.search().entity){
                        angular.extend(scope.inviteForm,{id: $location.search().entity});
                    }
                    scope.copyToClipboard = function(type){
                        if(!clipboard.supported)
                            return;
                        switch(type) {
                            case 'embed':
                                clipboard.copyText(scope.inviteForm.embed.iframe);
                                scope.inviteForm.embed.inClipboard = true;
                                scope.inviteForm.inClipboard = false;
                                break;
                            default:
                                clipboard.copyText(scope.inviteForm.url);
                                scope.inviteForm.inClipboard = true;
                                scope.inviteForm.embed.inClipboard = false;
                        }
                    };
                    var buttons = [];
                    var options = {
                        title: $filter('translate')('INVITE_ALERT_TITLE'),
                        subTitle: $filter('translate')('INVITE_ALERT_SUBTITLE'),
                        templateUrl: 'templates/popup/share.html',
                        buttons: buttons,
                        scope: scope
                    };

                    var alertPopup = $ionicPopup.show(options,scope);

                    alertPopup.then(function(res) {
                        // $log.debug('onTap',res);
                    });
                };

                init();


                function init(){
                    scope.markers = [];

                    var params = $location.search();
                    if(params.q)
                        scope.query = params.q;

                    // $log.debug('init entity list');
                    ThingsService.filter().then(
                        function (current) {
                            scope.markers = [];
                            scope.bufferMarkers = {
                                index : 0,
                                markers : [],
                                buffer: 30
                            };
                            scope.markers = $filter('orderBy')(Object.keys(current).map(function(e){return current[e];}), scope.sorting.params);
                            // scope.adapterContainer.adapter.reload(0);
                            scope.adapterContainer.adapter.reload(0);
                            // $log.debug('markers',scope.markers.length);
                            // scope.$emit('list:filtered');
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
                // applica filtro testuale
                scope.qFiltering = function () {
                    var q = scope.query ? scope.query : null;
                    // $log.debug('qFiltering from entity-list with',q);
                    scope.$emit('handleUpdateQ',{q:q});
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
    }]).directive('wallCard',['$log', '$window', '$location', '$filter', '$ionicPopup', '$timeout', 'shareFactory', 'AuthService',function ($log, $window, $location, $filter, $ionicPopup, $timeout, shareFactory, AuthService) {
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

            scope.locateOnMap = function (thingId) {
                // $log.debug('locateOnMap',thingId);

                scope.$emit('locateThing',{id:thingId});
            };

            scope.filter = function(tag){
                // aggiorno il parametro q
                scope.$emit('wallQuery',{query: tag});
                // avviso la mappa
                scope.$emit('handleUpdateQ',{q:tag});
            };


            scope.share = AuthService.doAction(function(thingId){
                // $log.debug(thingId);
                var url = $window.location.href.concat('&entity=',thingId);
                scope.inviteForm = {
                    url: url,
                    id: thingId,
                    inClipboard: false,
                    embed: {
                        iframe : '<iframe border="0" src="'+url+'&embed=viewer'+'"></iframe>',
                        inClipboard:false
                    },
                    emails:null,
                    message: null,
                    tab: 0,
                    sendError: false,
                    sendOk: false,
                    toggle: function(i){ scope.inviteForm.tab = i; },
                    close: function () { alertPopup.close(); },
                    action: function () {
                        switch (scope.inviteForm.tab){
                            case 1:
                                scope.copyToClipboard('url');
                                break;
                            case 2:
                                scope.copyToClipboard('embed');
                                break;
                            default:
                                if(!scope.inviteForm.emails) {
                                    return;
                                }else{
                                    shareFactory.thing(scope.inviteForm).then(
                                        function (res) {
                                            scope.inviteForm.sendError = false;
                                            scope.inviteForm.emails = null;
                                            scope.inviteForm.message = null;
                                            scope.inviteForm.sendOk = true;
                                            $timeout(function () {
                                                alertPopup.close();
                                            },2000);
                                        },
                                        function (err) {
                                            $log.error(err);
                                            scope.inviteForm.sendError = true;
                                        }
                                    );
                                }
                        }

                    }
                };
                if($location.search().entity){
                    angular.extend(scope.inviteForm,{id: $location.search().entity});
                }
                scope.copyToClipboard = function(type){
                    if(!clipboard.supported)
                        return;
                    switch(type) {
                        case 'embed':
                            clipboard.copyText(scope.inviteForm.embed.iframe);
                            scope.inviteForm.embed.inClipboard = true;
                            scope.inviteForm.inClipboard = false;
                            break;
                        default:
                            clipboard.copyText(scope.inviteForm.url);
                            scope.inviteForm.inClipboard = true;
                            scope.inviteForm.embed.inClipboard = false;
                    }
                };
                var buttons = [];
                var options = {
                    title: $filter('translate')('INVITE_ALERT_TITLE'),
                    subTitle: $filter('translate')('INVITE_ALERT_SUBTITLE'),
                    templateUrl: 'templates/popup/share.html',
                    buttons: buttons,
                    scope: scope
                };

                var alertPopup = $ionicPopup.show(options,scope);

                alertPopup.then(function(res) {
                    // $log.debug('onTap',res);
                });
            });
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
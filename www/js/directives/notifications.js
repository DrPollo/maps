angular.module('firstlife.directives').directive('userHandler',['$log', 'myConfig', function($log, myConfig){
    return {
        restrict: 'EG',
        scope: {},
        templateUrl: '/templates/map-ui-template/userHandlerOmnibar.html',
        link: function(scope, element, attr){
            
            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyUserHandler){
                    e.preventDestroyUserHandler = true;

                    delete scope;
                }
            });

            scope.$on('flagNotification',function(e,args){
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    scope.check = true;
                    if(args.counter){
                        // $log.debug('notifications',args);
                        scope.notifications = args.counter;
                    }
                });
            scope.$on('noFlagNotification',function(e,args){
                    if(e.defaultPrevented)
                        return;
                    e.preventDefault();

                    scope.check = false;
                    scope.notifications = false;
                });
            scope.config = myConfig;
            // funzione togle per il menu laterale
            scope.toggleMenu = function() {
                scope.$emit('toggleSideRight');
            };

        }
    }

}]).directive('notificationLink',function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/templates/map-ui-template/notificationLink.html',
        controller: ['$scope','$log','$filter','$timeout','$state', '$ionicModal', '$location', '$window', 'notificationFactory', 'MemoryFactory','myConfig', 'AuthService', function($scope,$log,$filter,$timeout,$state,$ionicModal,$location, $window, notificationFactory,MemoryFactory,myConfig,AuthService){


            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyUserHandler){
                    e.preventDestroyUserHandler = true;

                    $timeout.cancel(timer);
                    if($scope.notifications)
                        $scope.notifications.unsubscribe();

                    delete $scope;
                }
            });
            $scope.config = myConfig;
            //
            // $scope.$watch('check',function(e,old){
            //     if(e!=old){
            //         init();
            //     }
            // })
            //$log.debug('check?',$scope.check)
            // cambio del check notifiche
            function toCheck(counter){
                if($scope.check)
                    $scope.$emit('checkNotification',{counter:counter});
                else
                    $scope.$emit('noNotification');
            }

            // tempo di polling
            var MODAL_RELOAD_TIME = myConfig.behaviour.bbox_reload_time;
            // variabile dove inserisco il timer per il polling
            var timer = false;
            // ultimo check
            var since = null;
            // check novita'
            var now = new Date();
            // last check
            $scope.last = new Date();
            // funzione di polling
            var polling = function(){
                // $log.debug('check notifications!');
                $timeout.cancel(timer);

                // check notifiche
                checkNotifications();

                timer = $timeout(function(){
                    // aggiorno i dettagli
                    polling();
                },MODAL_RELOAD_TIME);
            };


            init();

            function init(){
                $scope.user = AuthService.getUser();
                $scope.check = false;
                toCheck();
                if($scope.user){
                    initNotifications();
                }else{
                    $timeout.cancel(timer);
                }
            }


            function initNotifications(){
                $scope.check = false;
                toCheck();
                $scope.news =[];
                polling();
            }

            function checkNotifications(){
                notificationFactory.get(since).then(
                    function(response){
                        $scope.last = new Date();
                        //$log.debug('check get notfications ',response);
                        // se c'e' qualcosa da leggere segnalo
                        $scope.counter = response.length;
                        if(response.length > 0){
                            //$log.debug('check = true');
                            $scope.check = true;
                            toCheck(response.length);
                        }
                        //segno da leggere!
                        for(var i = 0; i < response.length; i++){
                            // se la notifica e' stata generata dopo il caricamento della pagina
                            if(now <= new Date(response[i].timestamp)){
                                // highlight della notizia
                                response[i].new = true;
                            }
                            // indice della notizia per controllo duplicati
                            var j = $scope.news.map(function(e){return e.id;}).indexOf(response[i].id);
                            // se non gia' presente aggiungo
                            if(j < 0){
                                $scope.news.push(response[i]);
                            }
                        }
                    },
                    function(response){$log.error('check get notfications ',response);}
                );
                // aggiorno la since
                since = new Date();
            }


            $scope.login = function(){
                $window.location.href = AuthService.auth_url();
            };


            $scope.show = function(){
                //$log.debug('show notifications ',$scope.news);
                //apro modal
                openModal();
                $scope.check = false;
                toCheck();
            }

            $scope.go = function(notification){
                //$log.debug('check notification ',notification);
                // notifica letta
                notification.new = false;
                // chiudo la modal
                $scope.close();
                // cambio paramentro search
                $location.search('entity',notification.object);
            }

            $scope.clear = function(){
                // consume delle notifiche
                $scope.news = [];
                notificationFactory.consume($scope.last).then(
                    function(response){
                    },
                    function(response){
                        $log.error('impossibile cancellare le notifiche',response);
                    }
                );

            }

            $scope.consume = function(notification){
                var i = $scope.news.map(function(e){return e.id}).indexOf(notification.id);
                if(i > -1)
                    $scope.news.splice(i,1);

                // consume della notifica
                notificationFactory.read(notification.id).then(
                    function(response){
                    },
                    function(response){
                        $log.error('impossibile cancellare la notifica',response);
                    }
                );
            }

            function openModal(){
                $ionicModal.fromTemplateUrl('templates/modals/notifications.html', {
                    scope: $scope,
                    animation: 'fade-in'
                }).then(function(modal){
                    $scope.notifications = modal;
                    $scope.notifications.show();
                }, function(err){
                    $log.error("notification modal error",err);
                });

                $scope.close = function() {
                    //$log.debug('hide close');
                    $scope.notifications.hide();
                };
                // Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                    $scope.notifications.remove();
                });
                // Execute action on hide modal
                $scope.$on('notifications.hidden', function() {
                    // Execute action
                    //$log.debug('chiuse le notifiche');
                });
                // Execute action on remove modal
                $scope.$on('notifications.removed', function() {
                    // Execute action
                });
                $scope.$on('notifications.shown', function() {
                    //$log.debug('Notification modal is shown!');
                });

            };


        }]
    }

});
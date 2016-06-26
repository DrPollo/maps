angular.module('firstlife.directives').directive('userHandler',function(){
    return {
        restrict: 'E',
        scope: {
            check:'='
        },
        templateUrl: '/templates/map-ui-template/userHandlerOmnibar.html',
        controller: ['$scope','$log','$filter','$timeout','$state', '$ionicModal', '$location', 'notificationFactory', 'MemoryFactory','myConfig', function($scope,$log,$filter,$timeout,$state,$ionicModal,$location, notificationFactory,MemoryFactory,myConfig){

            
            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyUserHandler){
                    e.preventDestroyUserHandler = true;
                    $timeout.cancel(timer);
                    if($scope.notifications)
                        $scope.notifications.unsubscribe();
                    delete $scope;
                }
            });

            $scope.$watch('check',function(e,old){
                if(e!=old){
                    init();
                }
            })

            // recupero l'utente

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
                $log.log('check notifications!');
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
                $scope.user = MemoryFactory.getUser();
                $scope.highlight = false;
                $log.debug('check user notification',$scope.user);
                if($scope.user){
                    initNotifications();
                }else{
                    $timeout.cancel(timer);
                }
            }
            

            function initNotifications(){
                $scope.highlights = 0;
                $scope.news =[];
                polling();
            }

            function checkNotifications(){
                notificationFactory.get(since).then(
                    function(response){
                        $scope.last = new Date();
                        $log.debug('check get notfications ',response);
                        // se c'e' qualcosa da leggere segnalo
                        if(response.length > 0)
                            $scope.highlight = true;
                        // segno da leggere!
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
                $state.go('login', {action:'login'});
            };


            $scope.show = function(){
                $log.debug('show notifications ',$scope.news);
                //apro modal
                openModal();
                $scope.highlight = false;
            }

            $scope.go = function(notification){
                $log.debug('check notification ',notification);
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
                    $log.debug('hide close');
                    $scope.notifications.hide();
                };
                // Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                    $scope.notifications.remove();
                });
                // Execute action on hide modal
                $scope.$on('notifications.hidden', function() {
                    // Execute action
                    $log.debug('chiuse le notifiche');
                });
                // Execute action on remove modal
                $scope.$on('notifications.removed', function() {
                    // Execute action
                });
                $scope.$on('notifications.shown', function() {
                    //$log.log('Notification modal is shown!');
                });

            };


        }]
    }

});
angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate', '$ionicSlideBoxDelegate', '$translate', '$filter', '$location', '$log', '$window', '$timeout','myConfig', 'MemoryFactory', 'AuthService', 'ThingsService', 'clipboard',function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $translate, $filter, $location, $log, $window, $timeout, myConfig, MemoryFactory, AuthService, ThingsService, clipboard ) {


        $scope.config = myConfig;

        $rootScope.currentLang = $translate.use();

        $scope.apiVersion = 'API: ' + myConfig.api_version;
        $scope.clientVersion = 'Client: v' + myConfig.version;
        $scope.sideWidth = Math.min($window.innerWidth,500);

        $scope.wallOpen = false;


        // flag per le notifiche
        $scope.checkNotifications = false;
        $scope.$on('checkNotification',function(e,args){
            $scope.checkNotifications = true;
        });
        $scope.$on('noNotification',function(){
            $scope.checkNotifications = false;
        });


        var consoleCheck = false;

        // gestore del cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            if(event.preventAppSideEvent && toState.name != 'app')
                return

            event.preventAppSideEvent = true;

            if(consoleCheck) console.log("sono in AppCtrl e vengo da ", $rootScope.previousState);

            $scope.isLoggedIn = AuthService.isAuth();

            $scope.user = AuthService.getUser();
            // setup utente se presente
            if($scope.user){
                $scope.displayName = $scope.user.fullname;
                $log.debug("Benvenuto", $scope.user);
            } else {
                $scope.username = "Guest";
                $log.info("Non loggato");
            }
        });


        var initWatchWall = null;
        var currentEntity = null;
        $scope.$watch(function () {
            return $ionicSideMenuDelegate.isOpenLeft();
        },function (isOpen, prev) {
            if(prev && isOpen === prev)
                return;

            var entity = $location.search().entity;

            // $log.debug('is left open?',isOpen);
            $scope.wallOpen = isOpen;
            if(!isOpen && initWatchWall){
                if($ionicSlideBoxDelegate.currentIndex() === 2 && entity){
                    currentEntity = entity;
                }
                $location.search('entity',null);
                $location.hash();
                // $ionicSlideBoxDelegate.slide(0);
                // $scope.wallIndex = 0;
            }else if(entity){
                currentEntity = entity;
                $ionicSlideBoxDelegate.slide(2);
                // $scope.wallIndex = 0;
            }else if($ionicSlideBoxDelegate.currentIndex() === 2 && currentEntity){
                    $ionicSlideBoxDelegate.slide(2);
                    $location.search('entity',currentEntity);

            }
            $scope.wallIndex = $ionicSlideBoxDelegate.currentIndex();
            initWatchWall = true;
        });

        $scope.$on('checkNotification',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            $scope.$broadcast('flagNotification',args);
        });

        $scope.$on('noNotification',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            $scope.$broadcast('noFlagNotification');
        });

        $scope.$on('markerUpdated',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            // $log.debug('markerUpdated');
            // se wall aperto aggiorno
            // if(isOpenLeft()){
            $log.debug('request wallInit');
            $scope.$broadcast('wallInit');
            // }
        });


        $scope.$on('wallClick',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            // $log.debug('wallClick',args);
            $scope.$broadcast('markerClick',args);
            // apro la card
            $scope.openSideLeft();
            $ionicSlideBoxDelegate.slide(2,0);
            $scope.wallIndex = 2;
        });

        $scope.$on('toggleFilter',function(event,args){
            if(event.defaultPrevented)
                return;
            event.preventDefault();
            // $log.debug('toggleFilter');
            // chiedo di aggiornare i marker
            $scope.$broadcast('filterMarkers');
        });

        $scope.$on("handleUpdateQ",function(event,args){
            // $log.debug('handleUpdateQ',event,args);
            if(event.defaultPrevented)
                return;

            event.preventDefault();
            var q = null;
            if(args)
                q = args.q || args.query;

            ThingsService.setQuery(q);
            $location.search('q',q);
            $scope.$broadcast('wallQuery',{q:q});
            // al cambio filtro testuale
            $scope.$broadcast('filterMarkers');
            // avverto le searchcard
            $scope.$broadcast('newSearchParam',{q:q});
        });

        $scope.$on('closeSearchCard',function (event,args) {
            if(event.defaultPrevented)
                return;

            event.preventDefault();

            $log.debug('closeSearchCard calling wallQuery');
            $scope.$broadcast('wallQuery');
        });

        $scope.$on('updateThing',function (event,args) {
            if(event.defaultPrevented)
                return;

            event.preventDefault();

            $scope.$broadcast('startUpdating',args);
        });

        /*
         * Funzioni pubbliche
         * 1) login: va nello stato login con azione = login
         * 2) profile: va nello stato login con azione = login
         * 3) toggleSideLeft: apre/chiude il menu laterale
         * 4) showConfirmLogout: chiede conferma prima del logout
         * 5) langSelector: switch lingua
         */
        $scope.login = function(){
            $window.location.href = AuthService.auth_url();
        };
        $scope.profile = function(){
            $window.location.href = AuthService.profile_url();
        };
        $scope.signature = function(){
            $window.location.href = AuthService.signature_url();
        };
        // funzione togle per il menu laterale utente
        $scope.toggleSideRight = function() {
            $ionicSideMenuDelegate.toggleRight();
        };




        // A confirm dialog
        $scope.showConfirmLogout = function() {
            // se l'utente non e' loggato
            if(!AuthService.isAuth()){
                AuthService.logout();
                $state.go('home');
                return;
            }
            var message = '';
            var title ='';
            message = message.concat('<center>').concat($filter('translate')('EXIT_MESSAGE')).concat('</center>');
            title = title.concat($filter('translate')('EXIT_FROM')).concat(" ").concat(config.app_name);
            $scope.confirmPopup = $ionicPopup.confirm({
                title: title,
                template: message
            });
            $scope.confirmPopup.then(function(res) {
                if(res) {
                    //if(consoleCheck) console.log('Yes');
                    $window.location.href = AuthService.logout_url();
                } else {
                    //if(consoleCheck) console.log('No');
                }
            });
        };

        $scope.langSelector = function(key){
            $translate.use(key);
            $rootScope.currentLang = $translate.use();
            $scope.$broadcast('changeLanguage',{id:$translate.use()});
        };

        $scope.myMap = function(){
            if($scope.user && $scope.user.id)
                $location.search('users',$scope.user.id);
            $scope.$broadcast('setUserCard',{user:$scope.user});
        }

        $scope.makeEmbed = function(){
            // creo link per lo share
            var url = $window.location.href+'&embed=viewer';
            // $log.debug('embed url ',url);
            var buttons = [{text:$filter('translate')('OK')}];
            if(clipboard.supported){
                var copy = {
                    text:$filter('translate')('COPY'),
                    type: 'button-positive',
                    onTap: function(e) {
                        clipboard.copyText(url);
                        e.preventDefault();
                        alertPopup.close();
                    }
                };
                buttons.push(copy);
            }
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('SHARE_ALERT_TITLE')+myConfig.app_name,
                subTitle: $filter('translate')('SHARE_ALERT_SUBTITLE'),
                template: '<input type="text" value="'+url+'" readonly>',
                buttons: buttons
            });

            alertPopup.then(function(res) {
                // $log.debug('embed url ',url);
            });
        };

        /*
         * Gestione controllata side menu
         * serve ad ottimizzare l'aggiornamento del wall
         */


        // left side (wall)
        $scope.openSideLeft = function () {
            if(!isOpenLeft()){
                $scope.toggleSideLeft();
                wallInit();
                $scope.wallOpen = true;
            }
        };
        $scope.$on('openSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('openSideLeft');
            $scope.openSideLeft();
        });
        $scope.closeSideLeft = function () {
            if(isOpenLeft()){
                $scope.toggleSideLeft();
                $scope.wallOpen = false;
                $location.hash();
                $location.search('entity',null);
            }
        };
        $scope.$on('closeSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('closeSideLeft');
            $scope.closeSideLeft();
        });
        $scope.toggleSideLeft = function () {
            $ionicSlideBoxDelegate.enableSlide(false);

            $log.debug('toggleSideLeft');
            // $log.debug('chiudo?',isOpenLeft());
            if(!isOpenLeft()){
                wallInit();
            }else{
                $log.debug('chiudo');
                $location.hash();
                $location.search('entity',null);
            }

            $ionicSideMenuDelegate.toggleLeft();

            // aggiorno dopo le animazioni
            $timeout(function () {
                $scope.wallOpen = $ionicSideMenuDelegate.isOpenLeft();
            },500);
        };
        $scope.$on('toggleSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('toggleSideLeft');
            $scope.toggleSideLeft();

        });
        // right side (user menu
        $scope.openSideRight = function () {
            if(!isOpenRight()){
                $ionicSideMenuDelegate.toggleRight();
            }
        };
        $scope.$on('openSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('openSideRight');
            $scope.openSideRight();
        });
        $scope.closeSideRight = function () {
            if(isOpenRight()){
                $ionicSideMenuDelegate.toggleRight();
            }
        };
        $scope.$on('closeSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('closeSideRight');
            $scope.closeSideRight();
        });
        $scope.toggleSideRight = function () {
            $ionicSideMenuDelegate.toggleRight();
        };
        $scope.$on('toggleSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $log.debug('toggleSideRight');
            $scope.toggleSideRight();
        });



        /*gestione slidebox wall*/
        // $scope.wallIndex = 0;
        $scope.backToStart = function () {
            $ionicSlideBoxDelegate.slide(0);
            $scope.wallIndex = 0;
            $location.search('entity',null);
            $location.hash();
            currentEntity = null;
        };
        $scope.$on('exitThingCard',function () {
            $scope.backToStart();
            $scope.closeSideLeft();
        });
        $scope.$on('openTreeMap',function () {
            $ionicSlideBoxDelegate.slide(1);
            $scope.wallIndex = 1;
        });




        function wallInit() {
            $log.debug('request init wall');
            $scope.$broadcast('wallInit');
        }
        function isOpenLeft(){
            $log.debug('is open',$scope.wallOpen && $ionicSideMenuDelegate.isOpenLeft());
            // patch per gestire il delay delle animazioni di ionic
            return ($scope.wallOpen && $ionicSideMenuDelegate.isOpenLeft());
        }
        function isOpenRight(){
            return $ionicSideMenuDelegate.isOpenRight();
        }


    }]);
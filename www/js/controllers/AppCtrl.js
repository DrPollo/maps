angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate', '$translate', '$filter', '$location', '$log', '$window', 'myConfig', 'MemoryFactory', 'AuthService', 'ThingsService', 'clipboard',function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, $translate, $filter, $location, $log, $window,myConfig, MemoryFactory, AuthService, ThingsService, clipboard ) {


        $scope.config = myConfig;

        $rootScope.currentLang = $translate.use();

        $scope.apiVersion = 'API: ' + myConfig.api_version;
        $scope.clientVersion = 'Client: v' + myConfig.version;
        $scope.sideWidth = Math.min($window.innerWidth,500);


        // flag per le notifiche
        $scope.checkNotifications = false;
        $scope.$on('checkNotification',function(e,args){
            $scope.checkNotifications = true;
        });
        $scope.$on('noNotification',function(){
            $scope.checkNotifications = false;
        })


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
            $scope.$broadcast('wallInit');
        });
        $scope.$on('wallToggle',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            $scope.$broadcast('checkWallToggle');
        });
        $scope.$on('wallClick',function (event,args) {
            if(event.defaultPrevented)
                return;
            event.preventDefault();

            $scope.$broadcast('markerClick',args);
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
            var q = (args && args.q) ? args.q : null;
            ThingsService.setQuery( q);
            $location.search('q',q);
            $scope.$broadcast('newSearchParam',{q:q});
            // al cambio filtro testuale
            $scope.$broadcast('filterMarkers');
        });

        $scope.$on('closeSearchCard',function (event,args) {
            if(event.defaultPrevented)
                return;

            event.preventDefault();

            $log.debug('closeSearchCard calling wallQuery');
            $scope.$broadcast('wallQuery');
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
        // funzione togle per il menu laterale
        $scope.toggleSideLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
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
                template: url,
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
                $ionicSideMenuDelegate.toggleSideLeft();
                wallInit();
            }
        };
        $scope.$on('openSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.openSideLeft();

        });
        $scope.closeSideLeft = function () {
            if(isOpenLeft()){
                $ionicSideMenuDelegate.toggleSideLeft();
            }
        };
        $scope.$on('closeSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.closeSideLeft();

        });
        $scope.toggleSideLeft = function () {
            $ionicSideMenuDelegate.toggleSideLeft();
            if(isOpenLeft()){
                wallInit();
            }
        };
        $scope.$on('toggleSideLeft',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.toggleSideLeft();

        });
        // right side (user menu
        $scope.openSideRight = function () {
            if(!isOpenRight()){
                $ionicSideMenuDelegate.toggleSideRight();
            }
        };
        $scope.$on('openSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.openSideRight();

        });
        $scope.closeSideRight = function () {
            if(isOpenRight()){
                $ionicSideMenuDelegate.toggleSideRight();
            }
        };
        $scope.$on('closeSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.closeSideRight();

        });
        $scope.toggleSideRight = function () {
            $ionicSideMenuDelegate.toggleSideRight();
        };
        $scope.$on('toggleSideRight',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();
            $scope.toggleSideRight();

        });


        function wallInit() {
            $scope.$broadcast('wallInit');
        }
        function isOpenLeft(){
            return $ionicSideMenuDelegate.isOpenLeft();
        }
        function isOpenRight(){
            return $ionicSideMenuDelegate.isOpenRight();
        }


    }]);
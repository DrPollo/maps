angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate', '$translate', '$filter', '$location', '$log', '$window', 'myConfig', 'MemoryFactory', 'AuthService', function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, $translate, $filter, $location, $log, $window,myConfig, MemoryFactory, AuthService ) {
        
        
        $scope.config = myConfig;
        
        $rootScope.currentLang = $translate.use();
        
        $scope.apiVersion = 'API: ' + myConfig.api_version;
        $scope.clientVersion = 'Client: v' + myConfig.version;
        
        var consoleCheck = false;
        
        // gestore del cambio di stato
        $scope.$on("$stateChangeSuccess", function() {
            if(consoleCheck) console.log("sono in AppCtrl e vengo da ", $rootScope.previousState, $rootScope.isLoggedIn, $rootScope.currentUser);
            
            $scope.isLoggedIn = AuthService.isAuth();
            
            $scope.user = AuthService.getUser();
            // setup utente se presente
            if($scope.user){
                $scope.displayName = $scope.user.display_name;
                $scope.isLoggedIn = true;
                $log.debug("Benvenuto", $scope.user.display_name);
            } else {
                $scope.username = "Guest";
                $log.info("Non loggato");
            }
            
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
            $window.location.href = AuthService.login_url();
        };
        $scope.profile = function(){
            $window.location.href = AuthService.profile_url();
        };
        // funzione togle per il menu laterale
        $scope.toggleSideLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
        
        
        // A confirm dialog
        $scope.showConfirmLogout = function() {
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
        }
        
        $scope.makeEmbed = function(){
            $location.search('embed','viewer');
        }
        
       
    }]);
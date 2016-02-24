angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate', '$translate', 'myConfig', 'MemoryFactory', function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, $translate, myConfig, MemoryFactory ) {
        
        
        $scope.config = myConfig;
        $scope.isLoggedIn = false;
        $rootScope.currentLang = $translate.use();
        
        
        var consoleCheck = false;
        
        // gestore del cambio di stato
        $scope.$on("$stateChangeSuccess", function() {
            if(consoleCheck) console.log("sono in AppCtrl e vengo da ", $rootScope.previousState, $rootScope.isLoggedIn, $rootScope.currentUser);
            $scope.user = MemoryFactory.readUser();
            // valuto lo stato da dove arrivo e decido cosa fare
            if($scope.user){
                if($scope.user.displayName && $scope.user.displayName != ''){
                    $scope.displayName = $scope.user.displayName;
                }else if($scope.user.email && $scope.user.email != ''){
                    $scope.displayName = user.email;
                }
                
                $scope.isLoggedIn = true;
                if(consoleCheck) console.log("Benvenuto", $rootScope.currentUser);
            } else {
                $scope.username = "Guest";
                $scope.isLoggedIn = false;
                if(consoleCheck) console.log("Non loggato");
            }
            
        });

        /*
         * Funzioni pubbliche
         * 1) login: va nello stato login con azione = login
         * 2) toggleSideLeft: apre/chiude il menu laterale
         * 3) showConfirmLogout: chiede conferma prima del logout
         * 4) langSelector: switch lingua
         */
        $scope.login = function(){
            $state.go('login', {action:'login'});
        };

        // funzione togle per il menu laterale
        $scope.toggleSideLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
        
        
        // A confirm dialog
        $scope.showConfirmLogout = function() {
            $scope.confirmPopup = $ionicPopup.confirm({
                title: "Esci da "+config.app_name,
                template: '<center>Vuoi veramente uscire?</center>'
            });
            $scope.confirmPopup.then(function(res) {
                if(res) {
                    //if(consoleCheck) console.log('Yes');
                    logout();
                } else {
                    //if(consoleCheck) console.log('No');
                }
            });
        };
        
        $scope.langSelector = function(key){
            if(consoleCheck) console.log("Seleziono linguaggio ",key);
            $translate.use(key);
            $rootScope.currentLang = $translate.use();
            if(consoleCheck) console.log("Linguaggio corrente ",$rootScope.currentLang);
          };
        
        /*
         * Funzioni private
         * 1) logout: va nel walktrough con azione = logout
         */
        
        function logout (){
            $state.go('login', {action:'logout'});
        };
    }]);
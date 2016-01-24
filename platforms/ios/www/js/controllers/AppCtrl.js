angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate',  'myConfig', 'MemoryFactory', function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, myConfig, MemoryFactory ) {
        
        
        $scope.config = myConfig;
        $scope.isLoggedIn = false;
        
        
        // gestore del cambio di stato
        $scope.$on("$stateChangeSuccess", function() {
            console.log("sono in AppCtrl e vengo da ", $rootScope.previousState, $rootScope.isLoggedIn, $rootScope.currentUser);
            $scope.user = MemoryFactory.readUser();
            // valuto lo stato da dove arrivo e decido cosa fare
            if($scope.user){
                if($scope.user.displayName && $scope.user.displayName != ''){
                    $scope.displayName = $scope.user.displayName;
                }else if($scope.user.email && $scope.user.email != ''){
                    $scope.displayName = user.email;
                }
                
                $scope.isLoggedIn = true;
                console.log("Benvenuto", $rootScope.currentUser);
            } else {
                $scope.username = "Guest";
                $scope.isLoggedIn = false;
                console.log("Non loggato");
            }
            
        });

        /*
         * Funzioni pubbliche
         * 1) login: va nello stato login con azione = login
         * 2) toggleSideLeft: apre/chiude il menu laterale
         * 3) showConfirmLogout: chiede conferma prima del logout
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
                    //console.log('Yes');
                    logout();
                } else {
                    //console.log('No');
                }
            });
        };
        
        /*
         * Funzioni private
         * 1) logout: va nel walktrough con azione = logout
         */
        
        function logout (){
            $state.go('login', {action:'logout'});
        };
    }]);
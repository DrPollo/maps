angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicPopup', '$ionicSideMenuDelegate', '$translate', '$filter', '$location', 'myConfig', 'MemoryFactory', function($scope, $state, $rootScope, $ionicHistory, $ionicPopup, $ionicSideMenuDelegate, $translate, $filter, $location, myConfig, MemoryFactory ) {
        
        
        $scope.config = myConfig;
        $scope.isLoggedIn = false;
        $rootScope.currentLang = $translate.use();
        
        $scope.apiVersion = 'API version: ' + myConfig.api_version;
        $scope.clientVersion = 'Client version: ' + myConfig.version;
        
        var consoleCheck = false;
        
        // gestore del cambio di stato
        $scope.$on("$stateChangeSuccess", function() {
            if(consoleCheck) console.log("sono in AppCtrl e vengo da ", $rootScope.previousState, $rootScope.isLoggedIn, $rootScope.currentUser);
            $scope.user = MemoryFactory.get('user');
            // valuto lo stato da dove arrivo e decido cosa fare
            if($scope.user){
                if($scope.user.displayName && $scope.user.displayName != ''){
                    $scope.displayName = $scope.user.displayName;
                }else if($scope.user.type == 1){
                    $scope.displayName = $scope.user.first_name.concat(" ").concat($scope.user.last_name);
                }else if($scope.user.type == 2){
                    $scope.displayName = $scope.user.name;
                }else{
                    
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
                    logout();
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
        
        /*
         * Funzioni private
         * 1) logout: va nel walktrough con azione = logout
         */
        
        function logout (){
            $state.go('login', {action:'logout'});
        };
    }]);
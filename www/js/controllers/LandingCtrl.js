angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$state', '$translate','$location', '$window', 'myConfig','AuthService', function($log,$scope,$state, $translate,$location, $window, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            if(event.preventLandingEvent && toState != 'home')
                return
            event.preventLandingEvent = true;

            if(dev) $log.debug("sono in login, questi i parametri ",toState);
            
            //se autenticato
            if(AuthService.isAuth()){
                // se autenticato vado alla mappa
                $state.go('app.maps')
            }
                
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };

    }]);
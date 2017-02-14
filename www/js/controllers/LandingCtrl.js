angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$state', '$translate','$location', 'myConfig','AuthService', function($log,$scope,$state, $translate,$location, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            var action = $stateParams.action;
            if(dev) $log.debug("sono in login, questi i parametri ",toState, action);
            
            // se l'utente e' loggato faccio redirect a app.maps
            if(AuthService.isAuth()){
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
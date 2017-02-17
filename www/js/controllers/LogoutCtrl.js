angular.module('firstlife.controllers')

    .controller('LogoutCtrl',  ['$log','$scope','$state', '$translate', '$location', 'myConfig','AuthService', function($log,$scope, $state, $translate, $location, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            
            if(dev) $log.debug("sono in login, questi i parametri ",toState);

            AuthService.logout();
            $state.go('home');
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };


    }]);
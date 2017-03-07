angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$state', '$translate','$location', '$window', 'myConfig','AuthService', function($log,$scope,$state, $translate,$location, $window, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            if(dev) $log.debug("sono in login, questi i parametri ",toState);
            
            // se l'utente e' loggato faccio redirect a app.maps
            if(AuthService.isAuth()){
                $state.go('app.maps')
            }else{
                // se l'utente non e' loggato
                // controllo se posso fare l'autologin con l'auth server
                AuthService.checkSession().then(
                    function (result) {
                        // l'utente e' attualmente loggato nell'auth server
                        // $log.debug('checkSession',result)
                        // redirect all'auth server
                        $window.location.href = AuthService.auth_url();
                    },
                    function (err) {
                        // l'utente non e' loggato
                        // resta nella landing page
                    }
                )
            }

                
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };

    }]);
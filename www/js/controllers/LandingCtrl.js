angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$state', '$translate','$location', '$window', 'myConfig','AuthService', function($log,$scope,$state, $translate,$location, $window, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            $log.debug('qui',event.preventLandingEvent);

            if(event.preventLandingEvent)
                return;
            event.preventLandingEvent = true;

            $log.debug('qui',toState.name);
            // se non devo gestire l'evento
            if(toState.name !== 'home')
                return;

            var params = $location.search();

            $log.log("sono in login, questi i parametri ",params);
            if(params.error){
                $log.log('errore ',params.error);
                switch (params.error){
                    case 'login':
                        $scope.error = 'working';
                        break;
                    default:
                        $scope.error = 'any';
                }
                return
            }



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
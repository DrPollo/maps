angular.module('firstlife.controllers')

    .controller('LogoutCtrl',  ['$log','$scope','$state', '$translate', '$location', 'myConfig','AuthService', function($log,$scope, $state, $translate, $location, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();

        
        $scope.error = null;

        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            if(event.preventLogoutEvent)
                return
            event.preventLogoutEvent = true;
            // se non devo gestire l'evento
            if(toState.name != 'logout')
                return
            // parametri search
            // var params = $location.search();
            
            // if(dev) $log.debug("sono in LogoutCtrl, questi i parametri ",params);
            
            
            
            
            // altrimenti gestisco i casi
            // 1) missing_client
            // 2) dberror
            // 3) missing_token
            // 4) unknown_client
            // 5) not_found
            // switch(params.message) {
            //     case 'missing_client':
            //         $scope.error = "UNKNOWN_LOGOUT_ERROR";
            //         break;
            //     case 'dberror':
            //         $scope.error = "UNKNOWN_LOGOUT_ERROR";
            //         break;
            //     case 'missing_token':
            //         $scope.error = "UNKNOWN_LOGOUT_ERROR";
            //         break;
            //     case 'unknown_client':
            //         $scope.error = "UNKNOWN_LOGOUT_ERROR";
            //         break;
            //     case 'not_found':
            //         $scope.error = "ALREADY_LOGOUT_ERROR";
            //         break;
            //     default:
            //         $scope.message = "SUCCESS";
            // }
            
            // cancello il token
            AuthService.logout();
            // redirect alla landingpage
            $state.go('home');
            
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };


    }]);
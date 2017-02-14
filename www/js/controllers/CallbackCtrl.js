angular.module('firstlife.controllers')

    .controller('CallbackCtrl',  ['$log','$scope','$state', '$translate', '$location', 'myConfig','AuthService', function($log,$scope, $state, $translate, $location, myConfig,AuthService) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            var action = $stateParams.action;
            if(dev) $log.debug("sono in login, questi i parametri ",toState, action);

            // controllo parametro code
            var params = $location.search();
            $log.debug("check $location",params)
            if(params.code){
                $log.debug('trovato code',params.code)
                // controllo dello stato
                if(params.state){
                    var currentState = MemoryFactory.get(stateKey);
                    $log.debug('ho trovato state',state, currentState)
                    if(state === currentState){
                        generateToken(params.code)
                    }
                    // errore stato non coincide
                }else{
                    $log.debug('non ho trovato state')
                    generateToken(params.code)
                }   
            }
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };


        function generateToken(code){
            var p = AuthService.generateToken(code);
            p.then(
                function(result){
                    $log.debug('tutto ok con il token',result)
                    $state.go('app.maps');
                    // se ho il token
                },
                function(err){
                    $log.error('getToken, error',err)
                    // se non riesco a generare il token
                    // gestione errori
                    
                }
            );
        }

    }]);
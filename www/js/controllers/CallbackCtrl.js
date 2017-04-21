angular.module('firstlife.controllers')
    .controller('CallbackCtrl',  ['$log','$scope','$state', '$translate', '$location', 'myConfig','AuthService', 'MemoryFactory', function($log,$scope, $state, $translate, $location, myConfig,AuthService, MemoryFactory) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            $log.log('sono in callback, continuo?',!event.preventCallbackEvent)
            if(event.preventCallbackEvent)
                return;
            event.preventCallbackEvent = true;
            // se non devo gestire l'evento
            if(toState.name !== 'callback')
                return;
            $log.debug("sono in login, questi i parametri ",toState);

            // controllo parametro code
            var params = $location.search();
            $log.debug("check $location",params);
            if(params.error){
                // gestisco l'errore
                loginError();
            }else if(params.code){
                $log.debug('trovato code',params.code);
                // controllo dello stato
                if(params.state){
                    var currentState = MemoryFactory.get(stateKey);
                    $log.debug('ho trovato state',params.state, currentState);
                    if(params.state === currentState){
                        generateToken(params.code)
                    }else{// errore stato non coincide
                        // todo verifica corretta gestione state
                        loginError();
                    }
                }else{
                    // $log.debug('non ho trovato state');
                    generateToken(params.code);
                }   
            }else if(params.profile && params.profile === 'true'){
                // profilo modificato
                $scope.message = 'UPDATE_PROFILE_SUCCESS';
                // redirect alla landingpage
                $state.go('app.maps');
            }else{
                // altrimenti torno alla landing
                $state.go('home');
            }
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };

        function generateToken(code){
            // elimino il code dai parametri search
            $location.search('code',null);
            // genero token
            $log.debug('richiedo token per code',code);
            AuthService.generateToken(code).then(
                function(result){
                    $log.debug('tutto ok con il token',result);
                    // se ho il token
                    $state.go('app.maps');
                },
                function(err){
                    $log.debug('getToken, error',err);
                    // se non riesco a generare il token
                    // gestione errori
                    loginError();
                }
            );
        }

        function loginError(){
            $location.search('error','login')
            $state.go('home', {error: 'login'});
        }


    }]);
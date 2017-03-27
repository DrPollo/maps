angular.module('firstlife.controllers')
    .controller('CallbackCtrl',  ['$log','$scope','$state', '$translate', '$location', 'myConfig','AuthService', 'MemoryFactory', function($log,$scope, $state, $translate, $location, myConfig,AuthService, MemoryFactory) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            if(event.preventCallbackEvent)
                return
            event.preventCallbackEvent = true;
            // se non devo gestire l'evento
            if(toState.name != 'callback')
                return
            $log.debug("sono in login, questi i parametri ",toState);

            // controllo parametro code
            var params = $location.search();
            $log.debug("check $location",params)
            if(params.error){
                // gestisco l'errore
                $location.search('error','login')
                $state.go('home', {error: 'login'});
            }else if(params.code){
                $log.debug('trovato code',params.code)
                // controllo dello stato
                if(params.state){
                    var currentState = MemoryFactory.get(stateKey);
                    $log.debug('ho trovato state',params.state, currentState)
                    if(params.state === currentState){
                        generateToken(params.code)
                    }
                    // errore stato non coincide
                }else{
                    // $log.debug('non ho trovato state')
                    generateToken(params.code)
                }   
            }else if(params.profile && params.profile == 'true'){
                // profilo modificato
                $scope.message = 'UPDATE_PROFILE_SUCCESS';
                // redirect alla landingpage
                setTimeout(function(){$state.go('home');},2000);
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
            AuthService.generateToken(code).then(
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
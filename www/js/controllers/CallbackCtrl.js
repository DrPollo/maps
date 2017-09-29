angular.module('firstlife.controllers')
    .controller('CallbackCtrl', ['$log', '$scope', '$state', '$translate', '$location', 'myConfig', 'AuthService', 'MemoryFactory', function ($log, $scope, $state, $translate, $location, myConfig, AuthService, MemoryFactory) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        $scope.currentLang = $translate.use();


        $scope.itCode = 'it';
        $scope.enCode = 'en';
        $scope.selected = 'button-positive';
        $scope.noSelected = 'button-stable';


        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState) {

            if (event.defaultPrevented)
                return;
            event.preventDefault();

            // se non devo gestire l'evento
            if (toState.name !== 'callback')
                return;
            $log.log("sono in login, questi i parametri ", toState);

            // controllo parametro code
            var params = $location.search();
            $log.log("check $location", params);
            if (params.error) {
                $log.log('errore login');
                // gestisco l'errore
                loginError();
                return;
            }


           if (params.code) {
                $log.log('trovato code', params.code);
                // controllo dello stato
                if (params.state) {
                    var currentState = MemoryFactory.get(stateKey);
                    $log.log('ho trovato state', params.state, currentState);
                    generateToken(params.code);
                    // todo fix state check
                    // if (params.state === currentState) {
                    //     generateToken(params.code)
                    // } else {// errore stato non coincide
                    //     // todo verifica corretta gestione state
                    //     loginError();
                    // }
                } else {
                    $log.debug('non ho trovato state');
                    generateToken(params.code);
                }
            }else if(params.token) {
               // gestione del token in arrivo dal oauth server
               // connettori social
                $log.log('trovato token',params.token);
                return getUser(params.token);
            } else if (params.profile && params.profile === 'true') {
                $log.debug('update profilo');
                // profilo modificato
                $scope.message = 'UPDATE_PROFILE_SUCCESS';
                // redirect alla landingpage
                $state.go('app.maps');
            } else {
                $log.debug('default');
                // altrimenti torno alla landing
                $state.go('home');
            }
        });

        // cambio lingua
        $scope.langSelector = function (key) {
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };

        function generateToken(code) {
            // elimino il code dai parametri search
            $location.search('code', null);
            // genero token
            $log.debug('richiedo token per code', code);
            AuthService.generateToken(code).then(
                function (result) {
                    $log.debug('tutto ok con il token', result);
                    // se ho il token
                    $state.go('app.maps');
                },
                function (err) {
                    $log.debug('getToken, error', err);
                    // se non riesco a generare il token
                    // gestione errori
                    loginError();
                }
            );
        }


        function getUser(token) {
            $log.debug('getting the user',token);
            AuthService.retrieveUser(token).then(
                function (result) {
                    $log.debug('tutto ok con il token', result);
                    // se ho il token
                    $state.go('app.maps');
                },
                function (err) {
                    $log.debug('getToken, error', err);
                    // se non riesco a generare il token
                    // gestione errori
                    loginError();
                }
            );
        }

        function loginError() {
            $log.debug('go to home');
            // $location.search('error', 'login');
            $state.go('home', {error:'login'} );
        }

    }]);
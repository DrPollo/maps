angular.module('firstlife.controllers')

    .controller('WalktroughCtrl',  ['$scope', '$state', '$rootScope', '$ionicPopup', '$stateParams', '$location', '$ionicLoading', '$filter', 'UserService', 'myConfig', 'MemoryFactory', function($scope, $state, $rootScope, $ionicPopup, $stateParams, $location, $ionicLoading, $filter, UserService, myConfig, MemoryFactory) {

        $scope.user = {};
        $scope.defaults = myConfig;

        var consoleCheck = false;
        
        // azione di default
        $scope.action = 'login';

        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            var action = $stateParams.action;
            if(consoleCheck) console.log("sono in login, questi i parametri ",toState, action);
            if(toState.name === 'login'){
                //if(!$scope.defaults.actions.alow_login && !$scope.defaults.is_login_required){
                //    goToMap();
                //}else{
                    // entro in login con azione "logout"
                    switch(action){
                        case "logout":
                            if(consoleCheck) console.log("Richiesta di logout...");
                            // effettuo logout
                            UserService.logout();
                            // elimino ?action=logout
                            $location.search('action','login');
                            $scope.action = "login";
                            break;
                        case "signup":
                            if(consoleCheck) console.log("Richiesta di registrazione...");
                            //todo registrazione chiusa
                            $scope.action = "signup";
                            break;
                        case "password-retrieve":
                            if(consoleCheck) console.log("Richiesta di recupero password...");
                            $scope.action = "password-retrieve";
                            break;
                        case "redirect":
                            if(consoleCheck) console.log("redirect a login, parametri: ", $stateParams);
                            break;
                        default:
                            if(consoleCheck) console.log("Richiesta di login...");
                            $scope.action = "login";
                    }
                    // controllo se l'utente e' in memoria
                    if(!$rootScope.isLoggedIn){
                        //if(consoleCheck) console.log("check se l'utente e' loggato");
                        MemoryFactory.getUser();
                    }
                    //se l'utente e' gia' loggato lo reindirizzo alla mappa
                    if($rootScope.isLoggedIn || (!config.behaviour.is_login_required && action == null)){
                        if(consoleCheck) console.log("parametri di login: ", $stateParams);

                        goToMap();
                    }
                    else{ //login
                        if(consoleCheck) console.log("User undefined!");
                    }
                //}
            }
        });


        if($scope.defaults.dev){
            $scope.user.email = "test@firstlife.it";
            $scope.user.password = "firstlife";
        }
        else {
            $scope.user.email = "";
            $scope.user.password = "";
        }


        // da cancellare
        //$scope.goToSignUp = function(){
        //    $state.go('signup');
        //};




        /*
         * Azioni form
         * 1) login
         * 2) registrazione
         * 3) recupero password
         * 4) apri link esterno
         */

        // invio richiesta di login
        $scope.doLogIn = function(){
            var alertPopup = null;
            showLoadingScreen();
            UserService.login($scope.user.email, $scope.user.password)
                .then(
                function(data) {
                    if(consoleCheck) console.log("Login data...", data);
                    hideLoadingScreen();
                    if(data === 0){
                        alertPopup = $ionicPopup.alert({
                            title: 'Mail non trovata!',
                            template: 'Assicurati di inserirla correttamente! '
                        });
                    }
                    else if (data === -1){
                        alertPopup = $ionicPopup.alert({
                            title: 'Password errata!',
                            template: 'Assicurati di inserirla correttamente! '
                        });
                    }
                    else { 
                        if(consoleCheck) console.log("utente loggato: ", data);
                        $rootScope.currentUser = data;
                        $rootScope.isLoggedIn = true;
                        $scope.isLoggedIn = true;
                        goToMap();
                    }

                },
                function(data) {
                    hideLoadingScreen();
                    if(consoleCheck) console.log("Login fallito, codice: ",data);
                    var message = 'Per favore, controlla le tue credenziali!';
                    if(data.status){
                        switch(data.status){
                            case 401:
                                    if(data.error == 'account not active')
                                        message = "Account non attivo, controlla l'email con le istruzioni per l'attivazione!";
                                    else if(data.error == 'wrong password')
                                        message = "Password errata, ritentare o effettuare la procedura di recupero password (password dimenticata?)";
                                    else
                                        message = 'Per favore, controlla le tue credenziali!';
                                break;
                            default:
                                message = 'Per favore, controlla le tue credenziali!';

                        }
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login fallito!',
                        template: message
                    });
                });

        };

        // invio richiesta di registrazione utente
        $scope.doSignUp = function(){  

            if($scope.user.password===$scope.user.password2){
                var user = $scope.user;
                delete user.password2;
                showLoadingScreen($filter('translate')('SAVING_MESSAGE'));
                UserService.register(user).then(
                    function(data) {
                        hideLoadingScreen();
                        var title = $filter('translate')('SUCCESS');
                        var template = $filter('translate')('REGISTRATION_SUCCESS');
                        var alertPopup = $ionicPopup.alert({
                            title: title,
                            template: template
                        });
                        if(consoleCheck) console.log("Register data...", data);
                        $scope.backToLogin();
                        
                    },
                    function(data) {
                        hideLoadingScreen();
                        if(consoleCheck) console.log("SignupCtrl, doSignUp, error: ", data);
                        if(data.status === 401){
                            var title = $filter('translate')('ERROR');
                            var template = $filter('translate')('USED_EMAIL');
                            var alertPopup = $ionicPopup.alert({
                                title: title,
                                template: template
                            });
                        }else{
                            var title = $filter('translate')('ERROR');
                            var template = $filter('translate')('UNKNOWN_ERROR');
                            var alertPopup = $ionicPopup.alert({
                                title: title,
                                template: template
                            });
                        }
                    });
            }
            else {
                var title = $filter('translate')('ERROR');
                var template = $filter('translate')('UNKNOWN_ERROR');
                var alertPopup = $ionicPopup.alert({
                    title: title,
                    template: template
                });
            }


        };

        // invio richiesta recupero password
        $scope.retrievePassword = function (){
            
            showLoadingScreen($filter('translate')('SENDING_REQUEST'));
            UserService.retrievePassword($scope.user.email).then(
                function(response){
                    if(consoleCheck) console.log("LoginCtrl, retrievePassword, response: ",response);
                    hideLoadingScreen();
                    var title = $filter('translate')('SUCCESS');
                    var template = $filter('translate')('CHECK_EMAIL');
                    var alertPopup = $ionicPopup.alert({
                        title: title,
                        template: template
                    });
                    $scope.backToLogin();
                },
                function(response){
                    hideLoadingScreen();
                    if(consoleCheck) console.log("LoginCtrl, retrievePassword, error: ",response);
                    var title = $filter('translate')('ERROR');
                    var template = $filter('translate')('UNKNOWN_ERROR');
                    var alertPopup = $ionicPopup.alert({
                        title: title,
                        template: template
                    });
                }
            );

        }
        
        
        $scope.externalLinks = {
            'terms':$filter('translate')('TERMS_LINK'),
            'license':$filter('translate')('LICENSE_LINK')
        };
        $scope.openExternalLink = function (url){
            console.log('openExternalLink',url);
            $window.open(url);
        }
        
        
        /*
         * Fine azioni form
         */



        /*
         * Routing tra i form delle azioni
         */
        $scope.goToRetrieve = function (){
            $location.search('action','password-retrieve');

        };
        $scope.goToSignUp = function (){
            $location.search('action','signup');

        };
        $scope.backToLogin = function (){
            $location.search('action','login');
        };





        // We need this for the form validation
        $scope.selected_tab = "";

        $scope.$on('my-tabs-changed', function (event, data) {
            $scope.selected_tab = data.title;
        });



        /*
         * funzioni private
         * 1) gestione messaggio loading
         * 2) redirect dopo il login
         */
        function showLoadingScreen(text){
            if(!text || text === 'undefined'){
                text = $filter('translate')('LOGGIN_IN');
            }

            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }


        // funzione di redirect, gestisce i parametri di redirect o reindirizza a app.maps
        function goToMap (){
            if($stateParams.action === "redirect"){
                var params = {};
                if($stateParams.params && !angular.equals({}, $stateParams.params)){
                    if(consoleCheck) console.log("LoginCtrl, pre redirect a: ", $stateParams.from, " con parametri: ",$stateParams.params, angular.equals({}, $stateParams.params));
                    params = angular.fromJson($stateParams.params);
                }
                var goTo = $stateParams.from;
                delete $stateParams.from;
                delete $stateParams.params;
                if(consoleCheck) console.log("LoginCtrl, redirect a: ", goTo, " con parametri: ",params);
                $state.go(goTo, params);
            }else{
                $state.go("app.maps");
            }
        };

    }]);
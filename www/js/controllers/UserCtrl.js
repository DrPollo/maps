angular.module('firstlife.controllers')

    .controller('UserCtrl', ['$scope', '$state', '$ionicPopup', 'UserService', 'myConfig', '$rootScope', '$stateParams', '$ionicLoading', '$ionicPopup', '$location', '$filter', function($scope, $state, $ionicPopup, UserService, myConfig, $rootScope, $stateParams, $ionicLoading, $ionicPopup, $location, $filter) {

        $scope.config = myConfig;
        // recupero l'utente corrente
        $scope.editable = false;

        var dev = false;
        
        function user (name, surname, email, username, displayname){
            this.firstName = name ? name : null;
            this.lastName = surname ? name : null;
            this.email = email;
            this.username = username;
            this.displayName = displayname;
        }

        $scope.user = {};


        // gestione del cambio di stato

        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            var action = $stateParams.action;
            console.log("sono in UserCtrl, questi i parametri ", action,$scope.user);
            // recupero le informazioni dell'utente se non le ho
            //if(angular.equals({},$scope.user))
                checkUser();
            // entro in login con azione "logout"
            switch(action){
                case "edit":
                    console.log("Modifica del profilo...");
                    $scope.editable = true;
                    break;
                default:
                    console.log("Visualizzo profilo...");
                    $scope.editable = false;
            }
            console.log("Check parametri: ", $stateParams, $location.search());
        });

        // salvo le modifiche
        $scope.save = function(){
            console.log("UserCtrl, save form: ",$scope.user);
            showLoadingScreen(0);
            var data = angular.copy($scope.user);
            //pulisco la struttura dati prima di salvare
            if(data.new_password2)
                delete data.new_password2;
            if(data.new_password){
                data.password = data.new_password;
                delete data.new_password;
            }else{
                delete data.password;
            }
            if(data.username)
                delete data.username;
            if(data.displayName)
                delete data.displayName;
            if(data.iat)
                delete data.iat;
            
            UserService.update(data).then(
                function(response){
                    hideLoadingScreen();
                    $location.search('action',null);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Successo!',
                        template: 'Modifiche salvate correttamente.'
                    });
                    console.log("UserCtrl, save, response: ",response);  
                },
                function(error){
                    hideLoadingScreen();
                    $location.search('action',null);
                    var alertPopup = $ionicPopup.alert({
                        title: $filter('translate')('ERROR'),
                        template: $filter('translate')('UNKNOWN_ERROR')
                    });
                    console.log("UserCtrl, save, error: ",error);
                }

            );
        }

        // cambio password, attualmente non utilizzato
        $scope.resetPassword = function(){
            console.log("UserCtrl, reset password form: ",$scope.user);
            showLoadingScreen(0);
            UserService.resetPassword($scope.user.new_password).then(
                function(response){
                    hideLoadingScreen();
                    delete $scope.user.new_password;
                    delete $scope.user.new_password2;
                    console.log("UserCtrl, save, response: ",response);  
                },
                function(error){
                    hideLoadingScreen();
                    console.log("UserCtrl, save, error: ",error);
                }

            );
        }

        
        
        // reset del form
        $scope.reset = function(){
            $scope.user = angular.copy(self.userCache);
        };
        
        /*
         * Routing interno
         */

        $scope.makeEditable = function(){
            $scope.user = angular.copy(self.userCache);
            $location.search('action','edit');
        }
        $scope.exitEdit = function(){
            $location.search('action', null);
        }

        $scope.close = function (){
            // recupero l'ultima posizione della mappa
            var param = {};
            // torno alla mappa
            $state.go("app.maps", param);
        }

        

        /*
         * funzioni private
         * 1) schermo di caricamento
         * 2) controllo dei dati del profilo utente, e setup della cache
         */

        function showLoadingScreen(text){
            switch(text){
                case 1:
                    text = $filter('translate')('LOADING_MESSAGE');
                    break;
                default:
                    text = $filter('translate')('SAVING_MESSAGE');
            }
            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }


        function checkUser(){
            showLoadingScreen(1);
            UserService.getInfo().then(
                function(response){
                    //console.log("Develop UserCtrl, checkUser UserService.getInfo(), response: ",response);
                    self.userCache = response;
                    $scope.user = response;
                    hideLoadingScreen();
                },
                function(err){
                    hideLoadingScreen();
                    console.log("UserCtrl, checkUser UserService.getInfo(), errore: ",err);
                }
            );
            if(dev) console.log("Develop UserCtrl, checkUser UserService.getInfo(), response: ",response);
        }
    }]);
// todo run e config
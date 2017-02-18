angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$ionicHistory', '$ionicPopup', '$filter', '$location', 'myConfig', 'MemoryFactory', 'AuthService', function($scope, $state, $ionicHistory, $ionicPopup, $filter, $location, myConfig, MemoryFactory, AuthService ) {
        
        $scope.config = myConfig;
        
        
        // recupero i dati dell'utente
        $scope.user = AuthService.getUser();
        
        // costruisco la lista dei suoi contenuti
        
    }]);
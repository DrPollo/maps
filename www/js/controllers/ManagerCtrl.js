angular.module('firstlife.controllers')

    .controller('AppCtrl', ['$scope', '$state', '$ionicHistory', '$ionicPopup', '$filter', '$location', 'myConfig', 'MemoryFactory', function($scope, $state, $ionicHistory, $ionicPopup, $filter, $location, myConfig, MemoryFactory ) {
        
        $scope.config = myConfig;
        
        
        // recupero i dati dell'utente
        $scope.user = MemoryFactory.get('user');
        
        // costruisco la lista dei suoi contenuti
        
    }]);
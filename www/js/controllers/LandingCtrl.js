angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$state', '$rootScope', '$ionicPopup', '$stateParams', '$location', '$ionicLoading', '$filter','$window', 'UserService', 'myConfig', 'MemoryFactory', function($log,$scope, $state, $rootScope, $ionicPopup, $stateParams, $location, $ionicLoading, $filter,$window, UserService, myConfig, MemoryFactory) {
        $scope.defaults = myConfig;
        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            var action = $stateParams.action;
            if(consoleCheck) console.log("sono in login, questi i parametri ",toState, action);
        });
        
    }]);
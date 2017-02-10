angular.module('firstlife.controllers')

    .controller('LandingCtrl',  ['$log','$scope', '$rootScope', '$state', '$translate', '$ionicPopup', '$stateParams', '$location', '$ionicLoading', '$filter','$window', 'UserService', 'myConfig', 'MemoryFactory', function($log,$scope, $rootScope,$state, $translate, $ionicPopup, $stateParams, $location, $ionicLoading, $filter,$window, UserService, myConfig, MemoryFactory) {
        $scope.defaults = myConfig;
        var dev = myConfig.dev;
        $scope.currentLang = $translate.use();
        // check cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState) {
            event.preventDefault();
            var action = $stateParams.action;
            if(dev) $log.debug("sono in login, questi i parametri ",toState, action);
        });

        // cambio lingua
        $scope.langSelector = function(key){
            $translate.use(key);
            $scope.currentLang = $translate.use();
            $rootScope.currentLang = $translate.use();
        };

    }]);
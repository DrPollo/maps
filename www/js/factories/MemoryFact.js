angular.module('firstlife.factories')
    .factory('MemoryFactory', ['$rootScope', '$window', '$q', '$http', '$localStorage', 'myConfig', function($rootScope, $window, $q, $http, $localStorage, myConfig) {

        self.config = myConfig;    

        self.keys = {user: 'user', token:'token', config:'config', language:'language' };

        return {
            save: function(key,data){
                $localStorage[key] = data;
            },
            get: function(key){
                return $localStorage[key];
            },
            delete: function(key){
                delete $localStorage[key];
            }
            
        };

    }]);
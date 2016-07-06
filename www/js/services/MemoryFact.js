angular.module('firstlife.factories')
    .factory('MemoryFactory', ['$rootScope', '$window', '$q', '$http', '$localStorage', 'myConfig', function($rootScope, $window, $q, $http, $localStorage, myConfig) {

        self.config = myConfig;    

        self.keys = {user: 'user', token:'token', config:'config' };

        return {
            save(key,data){
                $localStorage[key] = data;
            },
            get(key){
                return $localStorage[key];
            },
            delete(key){
                delete $localStorage[key];
            }
            
        };

    }]);
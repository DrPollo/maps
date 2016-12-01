angular.module('firstlife.factories')
    .factory('MemoryFactory', ['$rootScope', '$window', '$q', '$http', '$localStorage', 'myConfig', function($rootScope, $window, $q, $http, $localStorage, myConfig) {

        self.config = myConfig;    

        self.keys = {user: 'user', token:'token', config:'config' };

        return {
            save(key,data){
                $localStorage[key] = data;
            },
            get(key){
                if(key == 'token')
                    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImNsYUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IkNsYXVkaW8iLCJ0eXBlIjoxLCJpZCI6IjU3YzEzYjE4NzRiNGMyNTc5ODk5OTVjZSIsImRpc3BsYXlfbmFtZSI6IkNsYXVkaW8gU2NoaWZhbmVsbGEiLCJpYXQiOjE0ODA1ODM1ODR9.cq7Xx0qlDwf3aTlaj29WyEqBfOESbL7S9iOcr2tUPLg';
                return $localStorage[key];
            },
            delete(key){
                delete $localStorage[key];
            }
            
        };

    }]);
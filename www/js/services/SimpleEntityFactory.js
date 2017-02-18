angular.module('firstlife.factories')
    .factory('SimpleEntityFactory', ['$q', '$http', '$log', 'myConfig', 'MemoryFactory', 'AuthService', function($q, $http, $log, myConfig, MemoryFactory, AuthService) {

        return {
            get: function(entityId,type) {
                // recupera i commenti di un entita'
                var deferred = $q.defer();
                var req = {
                    url: url.concat('/').concat(entityId).concat("/").concat(types[type].url).concat(format),
                    method: 'GET',
                    headers:{"Content-Type":"application/json"}
                };
                $http(req).then(
                    function(response) {
                        comments[entityId] = response;
                        deferred.resolve(response.data);
                    },
                    function(err){
                        $log.error("SimpleEntityFactory, get, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;  
            },
            add: function(entityId,data,type){
                var deferred = $q.defer();
                var user = AuthService.getUser();
                // aggiungo l'utente
                data.user_id = user.id;
                var req = {
                    url: url.concat('/').concat(entityId).concat("/").concat(types[type].url).concat(format),
                    method: 'POST',
                    headers:{"Content-Type":"application/json"},
                    data:data
                };
                $http(req).then(
                    function(response) {
                        deferred.resolve(response);
                    },
                    function(err){
                        $log.error("SimpleEntityFactory, add, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            update: function(entityId,id,data,type){
                var deferred = $q.defer();
                var user = AuthService.getUser();
                // aggiungo l'utente
                data.user_id = user.id;
                var req = {
                    url: url.concat('/').concat(entityId).concat("/").concat(types[type].url).concat("/").concat(id).concat(format),
                    method: 'PUT',
                    headers:{"Content-Type":"application/json"},
                    data:data
                };
                $http(req).then(
                    function(response) {
                        deferred.resolve(response);
                    },
                    function(err){
                        $log.error("SimpleEntityFactory, add, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            delete: function(entityId,id,type){
                var deferred = $q.defer();
                var req = {
                    url: url.concat('/').concat(entityId).concat("/").concat(types[type].url).concat("/").concat(id).concat(format),
                    method: 'DELETE',
                    headers:{"Content-Type":"application/json"},
                    data:{}
                };
                $http(req).then(
                    function(response) {
                        deferred.resolve(response);
                    },
                    function(err){
                        $log.error("SimpleEntityFactory, delete, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }

        };

    }]).run(function(myConfig){
    // recupero la definizione delle entita' semplici
    self.types = myConfig.types.simpleEntities;
    
    self.format = myConfig.format;
    self.config = myConfig;
    self.url = myConfig.backend_things;
    self.base_url = myConfig.domain_signature;
    self.comments = {};
});
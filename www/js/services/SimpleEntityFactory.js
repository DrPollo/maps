angular.module('firstlife.factories')
    .factory('SimpleEntityFactory', ['$q', '$http', '$log', 'myConfig', 'MemoryFactory', function($q, $http, $log, myConfig, MemoryFactory) {

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
                        console.log("SimpleEntityFactory, get, response: ", response);
                        comments[entityId] = response;
                        deferred.resolve(response.data);
                    },
                    function(err){
                        console.log("SimpleEntityFactory, get, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;  
            },
            add: function(entityId,data,type){
                var deferred = $q.defer();
                var token = MemoryFactory.getToken(),
                    user = MemoryFactory.readUser();
                // aggiungo l'utente
                data.user_id = user.id;
                var req = {
                    url: url.concat('/').concat(entityId).concat("/").concat(types[type].url).concat("/").concat("add").concat(format),
                    method: 'PUT',
                    headers:{"Content-Type":"application/json", Authorization:token},
                    data:data
                };
                $http(req).then(
                    function(response) {
                        console.log("SimpleEntityFactory, add, response: ", response);
                        deferred.resolve(response);
                    },
                    function(err){
                        console.log("SimpleEntityFactory, add, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            update: function(commentId,data,type){
                var deferred = $q.defer();
                var token = MemoryFactory.getToken(),
                    user = MemoryFactory.readUser();
                // aggiungo l'utente
                data.user_id = user.id;
                var req = {
                    url: base_url.concat('/').concat(types[type].url).concat("/").concat(entityId).concat("/update").concat(format),
                    method: 'PUT',
                    headers:{"Content-Type":"application/json", Authorization:token},
                    data:data
                };
                $http(req).then(
                    function(response) {
                        console.log("SimpleEntityFactory, add, response: ", response);
                        deferred.resolve(response);
                    },
                    function(err){
                        console.log("SimpleEntityFactory, add, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            delete: function(commentId,type){
                var deferred = $q.defer();
                var token = MemoryFactory.getToken();
                var req = {
                    url: base_url.concat(types[type].url).concat("/").concat(commentId).concat("/delete").concat(format),
                    method: 'DELETE',
                    headers:{"Content-Type":"application/json", Authorization:token},
                    data:{}
                };
                $http(req).then(
                    function(response) {
                        console.log("SimpleEntityFactory, delete, response: ", response);
                        deferred.resolve(response);
                    },
                    function(err){
                        console.log("SimpleEntityFactory, delete, error: ", err);
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
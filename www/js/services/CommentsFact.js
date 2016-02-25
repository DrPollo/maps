angular.module('firstlife.factories')
    .factory('CommentsFactory', ['$q', '$http', 'myConfig', 'MemoryFactory', function($q, $http, myConfig, MemoryFactory) {

        return {
            get: function(entityId) {
                // recupera i commenti di un entita'
                var deferred = $q.defer();
//                if(self.comments[entityId]){
//                    deferred.resolve(self.comments[entityId]);
//                }else{
                    var req = {
                        url: url.concat('/').concat(entityId).concat("/comments").concat(format),
                        method: 'GET',
                        headers:{"Content-Type":"application/json"}
                    };
                    $http(req).then(
                        function(response) {
                            console.log("CommentsFactory, get, response: ", response);
                            comments[entityId] = response;
                            deferred.resolve(response.data.data);
                        },
                        function(err){
                            console.log("CommentsFactory, get, error: ", err);
                            deferred.reject(err);
                        });
 //               }
                return deferred.promise;  
            },
            add: function(entityId,message){
                var deferred = $q.defer();
                var token = MemoryFactory.getToken(),
                    user = MemoryFactory.readUser();
                var comment = {user_id:user.id,message:message};
                var req = {
                    url: url.concat('/').concat(entityId).concat("/comments").concat(format),
                    method: 'PUT',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:comment
                };
                $http(req).then(
                    function(response) {
                        console.log("CommentsFactory, add, response: ", response);
                        deferred.resolve(response);
                    },
                    function(err){
                        console.log("CommentsFactory, add, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            delete: function(commentId){
                var deferred = $q.defer();
                var token = MemoryFactory.getToken();
                var req = {
                    url: url.concat('/').concat(commentId).concat(format),
                    method: 'DELETE',
                    headers:{"Content-Type":"application/json", Authentication:token},
                    data:{}
                };
                $http(req).then(
                    function(response) {
                        console.log("CommentsFactory, delete, response: ", response);
                        deferred.resolve(response);
                    },
                    function(err){
                        console.log("CommentsFactory, delete, error: ", err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }

        };

    }]).run(function(myConfig){
    self.format = myConfig.format;
    self.config = myConfig;
    self.url = myConfig.backend_things;
    self.comments = {};
});
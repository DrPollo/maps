angular.module('firstlife.factories')
    .factory('notificationFactory', ['$http', '$q',  '$rootScope', '$log', 'myConfig', 'MemoryFactory', function($http, $q,  $rootScope, $log, myConfig, MemoryFactory) {
        
        var self = this;
        self.config = myConfig;


        var urlThings= myConfig.backend_things;
        var format = config.format;
        
        return {
            subscriber:function(marker){
                var deferred = $q.defer();
                var urlId = urlThings.concat('/').concat(marker.id).concat("/subscribers").concat(format);
                var req = {
                    url: urlId,
                    method: 'GET',
                    headers:{"Content-Type":"application/json"},
                    data:true
                };
                $http(req).then(
                    function(response){
                        $log.debug('EntityFactory, subscribes, response ',response);
                        //
                        deferred.resolve(response.data);
                    },
                    function(response){
                        $log.error('EntityFactory, subscribes, response ',response);
                        deferred.reject(response);
                    }
                );
                return deferred.promise;
            },
            // PUT /v4/fl/domains/[id_dominio]/things/[id_thing]/subscribe
            subscribe:function(marker){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlThings.concat('/').concat(marker.id).concat("/subscribe").concat(format);
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, subscribe, response ',response);
                            //
                            deferred.resolve(response.data);
                        },
                        function(response){
                            $log.error('EntityFactory, subscribe, response ',response);
                            deferred.reject(response);
                        }
                    );
                }
                return deferred.promise;
            },
            // PUT /v4/fl/domains/[id_dominio]/things/[id_thing]/unsubscribe
            unsubscribe:function(marker){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlThings.concat('/').concat(marker.id).concat("/unsubscribe").concat(format);
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, unsubscribe, response ',response);
                            //
                            deferred.resolve(response.data);
                        },
                        function(response){
                            $log.error('EntityFactory, unsubscribe, response ',response);
                            deferred.reject(response);
                        }
                    );
                }
                return deferred.promise;
            },
        }
    }]);
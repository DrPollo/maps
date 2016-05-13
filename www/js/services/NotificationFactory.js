angular.module('firstlife.factories')
    .factory('notificationFactory', ['$http', '$q',  '$rootScope', '$log', 'myConfig', 'MemoryFactory', function($http, $q,  $rootScope, $log, myConfig, MemoryFactory) {
        
        var self = this;
        self.config = myConfig;


        var urlThings= myConfig.backend_things;
        var urlNotifications= myConfig.backend_notifications;
        var format = config.format;
        
        var subscriptions = {};
        
        return {
            //http://localhost:3095/api/Notifications/unread?user=34&since=2013-01-01 00:00:00&domain=1
            get:function(){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                // cache
                if(!user){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlNotifications.concat('/').concat("/unread").concat(format).concat('?user=').concat(user.id);
                    var req = {
                        url: urlId,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:true
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('notificationFactory, get, response ',response);
                            deferred.resolve(response.data);
                        },
                        function(response){
                            $log.error('notificationFactory, get, response ',response);
                            deferred.reject(response);
                        }
                    );
                    }
                return deferred.promise;
            },
            //http://localhost:3095/api/Notifications/consume
            read:function(notificationId){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlNotifications.concat('/consume').concat(format);
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id,id:notificationId}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, read, response ',response);
                            deferred.resolve(response.data);
                        },
                        function(response){
                            $log.error('EntityFactory, read, response ',response);
                            deferred.reject(response);
                        }
                    );
                }
                return deferred.promise;
            },
            //http://localhost:3095/api/Notifications/consume_until
            consume:function(){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlNotifications.concat('/consume_until').concat(format);
                    var now = new Date();
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id,until:now.toISOString()}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, consume, response ',response);
                            deferred.resolve(response.data);
                        },
                        function(response){
                            $log.error('EntityFactory, consume, response ',response);
                            deferred.reject(response);
                        }
                    );
                }
                return deferred.promise;
            },
            subscribers:function(markerId){
                var deferred = $q.defer();
                // cache
                if(subscriptions[markerId]){
                    deferred.resolve(subscriptions[markerId]);
                }else{
                    var urlId = urlThings.concat('/').concat(markerId).concat("/subscribers").concat(format);
                    var req = {
                        url: urlId,
                        method: 'GET',
                        headers:{"Content-Type":"application/json"},
                        data:true
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('notificationFactory, subscribes, response ',response);
                            //aggiungo alla cache
                            subscriptions[markerId] = response.data.users;
                            deferred.resolve(response.data.users);
                        },
                        function(response){
                            $log.error('notificationFactory, subscribes, response ',response);
                            deferred.reject(response);
                        }
                    );
                    }
                return deferred.promise;
            },
            // PUT /v4/fl/domains/[id_dominio]/things/[id_thing]/subscribe
            subscribe:function(markerId){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlThings.concat('/').concat(markerId).concat("/subscribe").concat(format);
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, subscribe, response ',response);
                            deferred.resolve(response.data);
                            //aggiungo utente
                            addUser(markerId,user.id);
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
            unsubscribe:function(markerId){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                
                // se non sono loggato rispondo errore
                if(!user || !token){
                    deferred.reject('not logged in');
                }else{
                    var urlId = urlThings.concat('/').concat(markerId).concat("/unsubscribe").concat(format);
                    var req = {
                        url: urlId,
                        method: 'PUT',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data:{user_id:user.id}
                    };
                    $http(req).then(
                        function(response){
                            $log.debug('EntityFactory, unsubscribe, response ',response);
                            deferred.resolve(response.data);
                            //rimuovo utente
                            removeUser(markerId,user.id);
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
        
        
        function addUser(markerId,userId){
            if(!subscriptions[markerId])
                subscriptions[markerId] = new Array();
            
            $log.debug('subscribers',subscriptions[markerId]);
            var i = subscriptions[markerId].indexOf(userId);
            if(i < 0)
                subscriptions[markerId].push(userId);
            $log.debug('subscribers',subscriptions[markerId]);
        }
        
        function removeUser(markerId,userId){
            if(!subscriptions[markerId])
                return false;
                
            var i = subscriptions[markerId].indexOf(userId);
            if(i > -1)
                subscriptions[markerId].splice(i,1);
            $log.debug('subscribers',subscriptions[markerId]);
        }
        
        
    }]);
angular.module('firstlife.factories')
    .factory('groupsFactory', ['$http', '$q', '$log', 'myConfig', 'MemoryFactory','rx', function($http, $q,  $log, myConfig, MemoryFactory,rx) {

        var config = myConfig;
        var format = config.format;
        var url = config.domain_signature;

        var groupsUsers = {};

        return {
            check: function(){return true;},
            // add user to group
            joinGroup: function (entityId){
                $log.debug('joining 4 ',entityId);
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                $log.debug('joining 5 ',user,token);
                if(user && token){
                    var urlId = url.concat('member').concat(format);
                    var data = {
                        "groupId":entityId,
                        "memberId":user.id
                    }
                    var req = {
                        url: urlId,
                        method: 'post',
                        headers:{"Content-Type":"application/json", Authorization:token},
                        data: data
                    };
                    $http(req).then(
                        function(response) {
                            $log.debug(response);
                            deferred.resolve(response);
                        },
                        function(response){
                            $log.error("groupsFactory, join member, error ",response);
                            deferred.reject(response);
                        });
                }else{
                    deferred.reject({message:'no user or token'});
                }
                return deferred.promise;
            },
            // add user to group
            leaveGroup: function (entityId){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                var token = MemoryFactory.getToken();
                if(user && token){
                    // manda il proprio id come parametro
                    return removeUser(entityId,user.id);
                }else{
                    deferred.reject({message:'no user or token'});
                }
                return deferred.promise;
            },
            // add user to group
            removeUser: function (entityId,userId){
                return removeUser(entityId,userId);
            },
            // get members
            checkMembership: function(entityId){
                var deferred = $q.defer();
                var user = MemoryFactory.getUser();
                //se in cache
                if(!groupsUsers[entityId])
                    groupsUsers[entityId] = {};
                if(user && groupsUsers[entityId][user.id]){
                    deferred.resolve(groupsUsers[entityId][user.id]);
                    // e' poco elegante ma compatto
                    return deferred.promise;
                } 
                if(user){
                    var urlId = url.concat('group/').concat(entityId).concat('/member/').concat(user.id).concat(format);
                    var req = {
                        url: urlId,
                        method: 'get',
                        headers:{"Content-Type":"application/json"},
                        data: {}
                    };
                    $http(req).then(
                        function(response) {
                            deferred.resolve(response.data[0]);
                            // salvo nella cache se la risposta e' positiva
                            groupsUsers[entityId][user.id] = response.data[0];
                        },
                        function(response){
                            $log.error("groupsFactory, check membership, error ",response);
                            deferred.reject(response);
                        });
                }else{deferred.reject({message:'no user'});}
                return deferred.promise;
            },
            // get members
            getMembers: function(entityId){
                var deferred = $q.defer();
                var urlId = url.concat('group/').concat(entityId).concat('/member').concat(format);
                var req = {
                    url: urlId,
                    method: 'get',
                    headers:{"Content-Type":"application/json"},
                    data: {}
                };
                $http(req).then(
                    function(response) {
                        deferred.resolve(response.data);
                        if(!groupsUsers[entityId])
                            groupsUsers[entityId] = {};
                        for(var i in response.data){
                            
                            groupsUsers[entityId][response.data[i].memberId] = response.data[i];
                        }
                    },
                    function(response){
                        //$log.error("groupsFactory, get member, error ",response);
                        deferred.reject(response);
                    });
                return deferred.promise;
            },// get members
            getMembersRx: function(entityId){
                var urlId = url.concat('group/').concat(entityId).concat('/member').concat(format);
                var req = {
                    url: urlId,
                    method: 'get',
                    headers:{"Content-Type":"application/json"},
                    data: {}
                };
                
                return members = rx.Observable.fromPromise($http(req))
                .map(function(val){
                    //console.debug('response ',val)
                    return val.data;
                })
                .do(
                    function(data){
                        //console.debug('do ',data)
                        if(!groupsUsers[entityId])
                                groupsUsers[entityId] = {};
                            for(var i in data){
                                groupsUsers[entityId][data[i].memberId] = data[i];
                            }
                    }
                ).retry()
                .share();       
                    
            }
        }


        function removeUser (entityId,userId){
            var deferred = $q.defer();
            var user = MemoryFactory.getUser();
            var token = MemoryFactory.getToken();
            $log.debug('joining 5 ',user,token);
            if(user && token){
                var urlId = url.concat('group/').concat(entityId).concat('/member/').concat(userId).concat(format);
                var data = {}
                var req = {
                    url: urlId,
                    method: 'delete',
                    headers:{"Content-Type":"application/json", Authorization:token},
                    data: data
                };
                $http(req).then(
                    function(response) {
                        $log.debug(response);
                        deferred.resolve(response.data);
                        // cancello utente dalla cache
                        delete groupsUsers[entityId][userId];
                    },
                    function(response){
                        $log.error("groupsFactory, leave member, error ",response);
                        deferred.reject(response);
                    });
            }else{
                deferred.reject({message:'no user or token'});
            }
            return deferred.promise;
        }

    }]);
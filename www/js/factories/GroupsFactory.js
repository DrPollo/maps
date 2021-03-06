angular.module('firstlife.factories')
    .factory('groupsFactory', ['$http', '$q', '$log', 'myConfig', 'AuthService', function($http, $q,  $log, myConfig, AuthService) {

        var config = myConfig;
        var format = config.format;
        var url = config.domain_signature;
        var default_role = "member";
        var groupsUsers = {};

        return {
            check: function(){return true;},
            // add user to group
            joinGroup: function (entityId){
//                $log.debug('joining 4 ',entityId);
                var deferred = $q.defer();
                var user = AuthService.getUser();
//                $log.debug('joining 5 ',user);
                if(user){
                    var urlId = url.concat('fl_users/',user.id,'/groups/rel/',entityId).concat(format);
                    var data = {
                        "role":default_role
                    }
                    var req = {
                        url: urlId,
                        method: 'put',
                        headers:{"Content-Type":"application/json"},
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
                    deferred.reject({message:'no user'});
                }
                return deferred.promise;
            },
            // add user to group
            leaveGroup: function (entityId){
                var deferred = $q.defer();
                var user = AuthService.getUser();
                if(user){
                    // manda il proprio id come parametro
                    return removeUser(entityId,user.id);
                }else{
                    deferred.reject({message:'no user'});
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
                var user = AuthService.getUser();
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
                var urlId = url.concat('Things/').concat(entityId).concat('/members').concat(format);
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
            }
        };


        function removeUser (entityId,userId){
            var deferred = $q.defer();
            $log.debug('joining 5 ',userId);
            if(userId){
                var urlId = url.concat('fl_users/',userId,'/groups/rel/',entityId,format);
                var req = {
                    url: urlId,
                    method: 'delete',
                    headers:{"Content-Type":"application/json"},
                    data: {}
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
                deferred.reject({message:'no user'});
            }
            return deferred.promise;
        }

    }]);
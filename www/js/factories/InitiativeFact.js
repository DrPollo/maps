angular.module('firstlife.factories')
    .factory('InitiativeFactory',['$q','$http',"$log",'AuthService', 'myConfig', function($q, $http, $log, AuthService, myConfig){
    return {
        list: function () {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives;

            var req = {
                url: urlId.concat('?domainId=',myConfig.domain_id),
                method: 'GET',
                headers:{"Content-Type":"application/json"},
                data: false
            };
            $http(req).then(
                function(res){
                    // $log.debug('Get all initiatives',res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        getAllInitiatives : function (thingId) {
            var deferred = $q.defer();
            var urlId = myConfig.backend_things.concat("/",thingId,'/initiatives');
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"},
                data: false
            };
            $http(req).then(
                function(res){
                    // $log.debug('Get all initiatives of',thingId,res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        getAllThings : function (initiativeId) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiative.concat("/",initiativeId,'/things');
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"},
                data: {}
            };
            $http(req).then(
                function(res){
                    // $log.debug('Get all things related to',initiativeId,res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        create : function (initiative) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }
            initiative.domain_id = myConfig.domain_id;
            var urlId = myConfig.initiatives;
            var req = {
                url: urlId,
                method: 'POST',
                headers:{"Content-Type":"application/json"},
                data: initiative
            };
            $http(req).then(
                function(res){
                    // $log.debug('Create initiative',res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        get : function (initiativeId,initiative) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives.concat('/',initiativeId);
            var req = {
                url: urlId,
                method: 'GET',
                data: {}
            };
            $http(req).then(
                function(res){
                    // $log.debug('Get initiative',res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        update : function (initiativeId,initiative) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives.concat('/',initiativeId);
            var req = {
                url: urlId,
                method: 'PUT',
                headers:{"Content-Type":"application/json"},
                data: initiative
            };
            $http(req).then(
                function(res){
                    // $log.debug('Update initiative',res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        deleteInitiative : function (initiativeId) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives.concat('/',initiativeId);
            var req = {
                url: urlId,
                method: 'DELETE',
                headers:{"Content-Type":"application/json"},
                data: {}
            };
            $http(req).then(
                function(res){
                    // $log.debug('Delete initiative',res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        link : function (thingId,initiativeId) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives.concat("/",initiativeId,'/things/rel/',thingId);
            var req = {
                url: urlId,
                method: 'PUT',
                headers:{"Content-Type":"application/json"},
                data: {}
            };
            $http(req).then(
                function(res){
                    $log.debug('Link initiative',initiativeId,thingId,res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        },
        unlink : function (thingId,initiativeId) {
            var deferred = $q.defer();
            if(!AuthService.isAuth()){
                deferred.reject('no authenticated');
                return deferred.promise;
            }

            var urlId = myConfig.initiatives.concat("/",initiativeId,'/things/re/',thingId);
            var req = {
                url: urlId,
                method: 'DELETE',
                headers:{"Content-Type":"application/json"},
                data: {}
            };
            $http(req).then(
                function(res){
                    $log.debug('Unlink initiative',initiativeId,thingId,res);
                    deferred.resolve(res.data);
                },
                function(err){
                    $log.error(err);
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        }
    }
}]);
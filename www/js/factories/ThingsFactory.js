angular.module('firstlife.factories')
    .factory('ThingsFact',['$q','$http','$log','AuthService', 'myConfig', function ($q, $http, $log, AuthService, myConfig) {

        var config = myConfig;
        var format = myConfig.format;
        var urlThings= myConfig.backend_things;
        var urlBbox= myConfig.backend_bbox;
        var fields = 'fields=valid_from,valid_to,parent_id,location,comment_of,article_of,group_of,group_id,categories,geometry,name,user,tags';
        var domains = [self.config.domain_id].concat(self.config.read_domains).join(',');
        var limit= 99999;

        return {
            get: function (id) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        $log.debug("get Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            create: function (thing) {
                var deferred = $q.defer();

                var urlId = urlThings.concat(format);

                var req = {
                    url: urlId,
                    method: 'POST',
                    headers: {"Content-Type": "application/json"},
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        $log.debug("post Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            update: function (id,thing) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'PUT',
                    headers: {"Content-Type": "application/json"},
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        $log.debug("update Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            remove: function (id) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'DELETE',
                    headers: {"Content-Type": "application/json"},
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        $log.debug("delete Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            bbox: function (params) {
                var deferred = $q.defer();
                // costruisco i parametri
                var p = Object.keys(params).reduce(function (list, key) {
                    list.push(key+'='+params[key]);
                    return list;
                },[]);
                var urlId = urlBbox.concat('?domainId=',domains,'&limit=',limit,'&',fields,'&',p.join('&')).concat(format);

                var req = {
                    url: urlId,
                    method: 'GET',
                    headers: {"Content-Type": "application/json"},
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        $log.debug("bbox response", response);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            }
        }
    }]);
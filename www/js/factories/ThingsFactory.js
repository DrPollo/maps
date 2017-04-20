angular.module('firstlife.factories')
    .factory('ThingsFact',['$q','$http','$log','AuthService', 'myConfig', function ($q, $http, $log, AuthService, myConfig) {

        var config = myConfig;
        var format = myConfig.format;
        var urlThings= myConfig.backend_things;
        var urlBbox= myConfig.backend_bbox;
        var urlTile= myConfig.backend_tilesearch;
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
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("get Thing ", response);
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
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("post Thing ", response);
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
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("update Thing ", response);
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
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("delete Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            report: function (report) {
                var urlId = myConfig.report_thing;
                var req = {
                    url: urlId,
                    method: 'POST',
                    data:report
                };
                return $http(req);
            },
            bbox: function (params) {
                var deferred = $q.defer();
                // costruisco i parametri
                var p = Object.keys(params).reduce(function (list, key) {
                    list.push(key+'='+params[key]);
                    return list;
                },[]);
                var urlId = urlBbox.concat(format,'?domainId=',domains,'&limit=',limit,'&',fields,'&',p.join('&'));

                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("bbox response", response);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            tile: function (params) {
                var deferred = $q.defer();
                // controllo i parametri
                if(!params.z || !params.y, !params.x){
                    deferred.reject('no tile param');
                    return deferred.promise;
                }

                var urlId = urlTile.concat('/',params.z,'/',params.x,'/',params.y,format,'?domainId=',domains,'&limit=',limit,'&',fields);
                if(params.from)
                    urlId = urlId.concat('&from=',params.from);
                if(params.to)
                    urlId = urlId.concat('&to=',params.to);
                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        // $log.log("tile response",params.z,'/',params.x,'/',params.y, response.data.things.features.length);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        // $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            tiles: function (params) {
                var deferred = $q.defer();
                // controllo i parametri
                if(!params || !params.tiles || params.tiles.length < 1){
                    deferred.reject('no tiles to check');
                    return deferred.promise;
                }
                // $log.debug('tiles',params);
                var urlId = urlTile.concat(format,'?domainId=',domains,'&limit=',limit,'&',fields,'&tiles=',params.tiles.join(','));
                if(params.time.from)
                    urlId = urlId.concat('&from=',params.time.from);
                if(params.time.to)
                    urlId = urlId.concat('&to=',params.time.to);

                // $log.debug('tiles url',urlId);
                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        // $log.debug("tiles response",params,response.data.things.features);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        // $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            children: function (id,relation) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/',id,'/',relation).concat(format);

                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("get Thing children ", response);
                        // todo togli il bugfix
                        deferred.resolve(response.data.data ? response.data.data.features: response.data.features );
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
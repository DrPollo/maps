angular.module('firstlife.factories')
    .factory('shareFactory', ['$http', '$q', '$log', 'myConfig', 'AuthService', function($http, $q,  $log, myConfig, AuthService) {

        return {
            thing: function (data) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth() && data.id) {
                    // $log.debug('sono un test ',data);
                    var emails = data.emails.match(/[a-zA-Z0-9.-]*@[a-zA-Z0-9.-]*/g);
                    // $log.debug('sono un test ',thingId,emails,message,url);
                    var options = {
                        id:4,
                        url:myConfig.backend_things.concat('/',data.id,'/share'),
                        method:'put',
                        data: {
                            "to": emails,
                            "attr": {
                                "PROJECT":myConfig.app_name,
                                "SELF": data.url,
                                "MESSAGE": data.message
                            }
                        }
                    };
                    $log.debug('share thing',options);
                    $http(options).then(
                        function (response) {
                            deferred.resolve(response);
                        },
                        function (err) {
                            deferred.reject(err);
                        }
                    );
                }else{
                    deferred.reject('auth required');
                }
                return deferred.promise;
            },
            map: function (data) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth() && data.id) {
                    var emails = data.emails.match(/[a-zA-Z0-9.-]*@[a-zA-Z0-9.-]*/g);
                    var options = {
                        id:7,
                        url:myConfig.backend_things.concat('/share'),
                        method:'put',
                        data: {
                            "to": emails,
                            "attr": {
                                "PROJECT":myConfig.app_name,
                                "SELF": data.url,
                                "MESSAGE": data.message
                            }
                        }
                    };
                    // $log.debug('share map',options);
                    $http(options).then(
                        function (response) {
                            deferred.resolve(response);
                        },
                        function (err) {
                            deferred.reject(err);
                        }
                    );
                }else{
                    deferred.reject('auth required');
                }
                return deferred.promise;
            }
        };

}]);
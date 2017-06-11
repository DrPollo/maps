angular.module('firstlife.factories')
    .factory('shareFactory', ['$http', '$q', '$log', 'myConfig', 'AuthService', function($http, $q,  $log, myConfig, AuthService) {

        return {
            thing: function (thingId,emails,message,url) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth() && thingId) {
                    $log.debug('sono un test ',thingId,emails,message,url);
                    if(!Array.isArray(emails)){
                        emails = emails.match(/[a-zA-Z0-9.-]*@[a-zA-Z0-9.-]*/g);
                    }
                    $log.debug('sono un test ',thingId,emails,message,url);
                    var options = {
                        url:myConfig.backend_things.concat('/',thingId,'/share'),
                        method:'put',
                        data: {
                            "to": emails.join('||'),
                            "attr": {
                                "SELF": url,
                                "MESSAGE": message
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
            map: function (emails,message,url) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth() && thingId) {
                    if(!Array.isArray(emails)){
                        emails = emails.match(/[a-zA-Z0-9.-]*@[a-zA-Z0-9.-]*/g);
                    }
                    var options = {
                        url:myConfig.backend_things.concat('/share'),
                        method:'put',
                        data: {
                            "to": emails.join('||'),
                            "attr": {
                                "SELF": url,
                                "MESSAGE": message
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
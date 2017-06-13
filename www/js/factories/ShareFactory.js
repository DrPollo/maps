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
                        url:myConfig.backend_things.concat('/',data.id,'/share'),
                        method:'put',
                        data: {}
                    };
                    $log.debug('share thing',options);
                    var promises = [];
                    for (var i = 0; i < emails.length; i++){
                        var payload =  {
                            "id":4,
                            "to": emails[i],
                            "attr": {
                                "PROJECT":myConfig.app_name,
                                "SELF": data.url,
                                "MESSAGE": data.message
                            }
                        };
                        promises.push($http(angular.extend({},options,{data:payload})));
                    }
                    // $log.debug('share map',options);
                    $q.all(promises).then(
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
                if(AuthService.isAuth() && data) {
                    var emails = data.emails.match(/[a-zA-Z0-9.-]*@[a-zA-Z0-9.-]*/g);
                    var options = {
                        url:myConfig.domain_signature.concat('/share'),
                        method:'put',
                        data:{}
                    };
                    var promises = [];
                    for (var i = 0; i < emails.length; i++){
                        var payload =  {
                            "id": 7,
                            "to": emails[i],
                            "attr": {
                                "PROJECT":myConfig.app_name,
                                "SELF": data.url,
                                "MESSAGE": data.message
                            }
                        };
                        promises.push($http(angular.extend({},options,{data:payload})));
                    }
                    $log.debug('share map',promises,emails);
                    $q.all(promises).then(
                        function (response) {
                            $log.debug('share map tutto ok');
                            deferred.resolve(response);
                        },
                        function (err) {
                            $log.error('share map failed');
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
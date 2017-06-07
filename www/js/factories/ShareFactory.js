angular.module('firstlife.factories')
    .factory('shareFactory', ['$http', '$q', '$log', 'myConfig', 'AuthService', function($http, $q,  $log, myConfig, AuthService) {

        return {
            thing: function (thingId,emails,message,url) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth() && thingId) {
                    var user = AuthService.getUser();
                    var options = {
                        url:myConfig.backend_things.concat('/',thingId,'/share'),
                        method:'put',
                        data: {
                            "to": emails.join('||'),
                            "attr": {
                                "SELF": thing.self,
                                "MESSAGE": url
                            }
                        }
                    };
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
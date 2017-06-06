angular.module('firstlife.factories')
    .factory('shareFactory', ['$http', '$q', '$log', 'myConfig', 'AuthService', function($http, $q,  $log, myConfig, AuthService) {
        var config = myConfig.email;
        return {
            thing: function (thing,emails,message) {
                var deferred = $q.defer();
                // se l'utente e' loggato
                if(AuthService.isAuth()) {
                    var user = AuthService.getUser();
                    var options = {
                        url:config.share_thing,
                        method:'put',
                        headers:config.headers,
                        data: {
                            "to": emails.join('||'),
                            "attr": {
                                "TITLE": thing.title,
                                "SIGNATURE": user.signature || user.fullname,
                                "SELF": thing.self,
                                "MESSAGE": message
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
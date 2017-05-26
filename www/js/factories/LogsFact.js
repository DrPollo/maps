angular.module('firstlife.factories')
    .factory('LogsFactory', ['$q', '$http', '$log','myConfig', function( $q, $http,$log, myConfig) {

        return {
            error:function(message){
                var deferred = $q.defer();
                $log.debug('sending error',message);
                var req = {
                    url:myConfig.behaviour.logs.url,
                    method:'POST',
                    headers:{
                        "Content-type": "application/json"
                    },
                    data:{
                        text:message
                    }
                };
                $http(req).then(
                    function (result) {
                        $log.debug('error sent',result);
                        deferred.resolve(result);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            }
        };

    }]);
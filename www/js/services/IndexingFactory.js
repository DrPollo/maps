angular.module('firstlife.factories')
    .factory('indexingFactory', ['$http', '$q',  '$rootScope', '$log', 'myConfig', 'MemoryFactory', function($http, $q,  $rootScope, $log, myConfig, MemoryFactory) {
    
        return {
            get: function(z,sw,ne){
              var deferred = $q.defer();

              var url = 'http://firstlife-dev.di.unito.it:3095/v4/fl/domains/1/things/boundingboxidx?detail=full&fields=name,categories';
              url = url.concat('&ne_lat=').concat(ne.lat);
              url = url.concat('&ne_lng=').concat(ne.lng);
              url = url.concat('&sw_lat=').concat(sw.lat);
              url = url.concat('&sw_lng=').concat(sw.lng);
              url = url.concat('&zoom=').concat(z);
               var req = {
                        method: 'GET',
                        url: url,
                        headers: { "Content-Type":"application/json"},
                        data: {}
                    }
              $http(req).then(
                  function(response){
                    $log.debug("get, results ",response);
                    deferred.resolve(response.data);
                  },
                  function(response){
                    $log.error("get, error ",response);
                    deferred.reject(response);
                  }
                );
              return deferred.promise;
            }
        }
    
    }]);
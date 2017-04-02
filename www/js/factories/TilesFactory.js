angular.module('firstlife.factories')
    .factory('tilesFactory', ['$http', '$q',  '$rootScope', '$log', '$filter', 'myConfig', 'MemoryFactory', 'rx', function($http, $q,  $rootScope, $log, $filter, myConfig, MemoryFactory, rx) {
        
        config = myConfig;
        
        bbox = config.backend_things.concat('/bb/{z}/{x}/{y}');
        
        
        this.index ={}
        data = [];
        
        function subscribe(x,y,z){
            var deferred = $q.defer();
            var url = bbox.replace('{x}',x).replace('{y}',y).replace('{z}',z);
            //$log.debug('x',x,'y',y,'z',z);
            //$log.debug('url ',url)
            var req = {
                url: url,
                method: 'get',
                headers:{"Content-Type":"application/json"},
                data: ''
            };
            $http(req).then(function(response) {
                var key = x+':'+y+':'+z;
                //$log.debug('bbox xyz, key',key,' response',response);
                response.data.key = key;
                data = data.concat([response.data]);
                //$log.debug('data',data.length);
                //aggiorno anche la lista dei dettagli
                deferred.resolve(this.data);
            },function(err){
                deferred.reject(err);
            });
            
            return deferred.promise;
        }
        
        function unsubscribe(x,y,z){
            // calcolo la chiave
            var key = x+':'+y+':'+z;
            // sostituisco il risultato con il nuovo array
            this.data = $filter('filter')(this.data, keyExclude, key);
            //$log.debug('data',data.length);
            
            
            function keyExclude(val,key){
                //$log.debug('unsubscribe? ',val.key,key,' =',val.key === key);
                if(val.key === key){ 
                    //$log.debug('eliminato ',key);
                    return false;
                }
                return true;
            }
        }
        
        return {
            subscribe : function(x,y,z){return subscribe(x,y,z);},
            unsubscribe : function(x,y,z){return unsubscribe(x,y,z);},
            data: function(){return data;}
        }
        
    }]);
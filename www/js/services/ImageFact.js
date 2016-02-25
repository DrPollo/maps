angular.module('firstlife.factories')
// initialize navigator camera
    .factory('CamerasFactory', ['$q', function($q) {
        return {
            getPicture: function(options) {
                var q = $q.defer();

                navigator.camera.getPicture(function(result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function(err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        };
    }])
    .factory('SenderFactory', ['$http', '$rootScope', 'myConfig', 'MemoryFactory', function($http , $rootScope, myConfig, MemoryFactory) {
        var sendUrl = {};// myConfig.backend_images;
        var urlThings = myConfig.backend_things;
        var format = myConfig.format;
        var response = null;
        var token = MemoryFactory.getToken();
        
        for(i in self.config.types.list){
            sendUrl[self.config.types.list[i].key] = self.config.types.list[i].url;
        }
        console.log("SenderFactory, preparo gli url: ",sendUrl);
        
        
        // utente di default -1 (guest)
        var user_id  = -1;
        // se l'utente è autenticato
        if(MemoryFactory.readUser()){
            // set user id
            var user = MemoryFactory.readUser();
            console.log("ImageFactory, MemoryFactory.readUser() : ", user);
            var user_id  = user.id;
        }
        
        function toObject(arr) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i)
                if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
        }

        return {
            images:function(images, id, entity_type){
                var data = {};
                data.images = toObject(images);
                data.user = user_id;
                data.description  = id;
                var json =  JSON.stringify(data);
                var req = {
                    method: 'POST',
                    url: sendUrl[entity_type].concat('/').concat(id).concat('/images').concat(format),
                    //url: urlThings.concat('/').concat(id).concat('/images').concat(format),
                    headers: { 'Content-Type': 'application/json', Authentication:token},
                    data: json
                }

                return $http(req).success(function(data){ 
                    return data +'saved'; 
                })
                    .error(function(){ 
                    return 'error';
                });

            }
        }

    }]);
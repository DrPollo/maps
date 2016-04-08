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
    .factory('SenderFactory', ['$http', '$rootScope','$log', 'myConfig', 'MemoryFactory', function($http , $rootScope,$log, myConfig, MemoryFactory) {
        var sendUrl = {};// myConfig.backend_images;
        var urlThings = myConfig.backend_things;
        var format = myConfig.format;
        var response = null;
        var token = MemoryFactory.getToken();
        
        for(i in self.config.types.list){
            sendUrl[self.config.types.list[i].key] = self.config.types.list[i].url;
        }
        
        
        // utente di default -1 (guest)
        var user_id  = -1;
        // se l'utente è autenticato
        if(MemoryFactory.readUser()){
            // set user id
            var user = MemoryFactory.readUser();
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
                data.user_id = user_id;
                for (var i = 0; i < images.length; i++){
                    var img = 'data:';
                    img = img.concat(images[i].filetype).concat(';base64,').concat(images[i].base64);
                    data.filedata = img;
                    var json =  JSON.stringify(data);
                    var req = {
                        method: 'PUT',
                        url: urlThings.concat('/').concat(id).concat('/images').concat('/add').concat(format),
                        //url: urlThings.concat('/').concat(id).concat('/images').concat(format),
                        headers: { 'Content-Type': 'application/json', Authorization:token},
                        data: json
                    }

                    return $http(req).then(function(data){ 
                        return data +'saved'; 
                    },function(){ 
                        return 'error';
                    });
                    
                }

            }
        }

    }]);
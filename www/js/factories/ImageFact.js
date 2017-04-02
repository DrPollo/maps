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
    .factory('SenderFactory', ['$http', '$rootScope','$log', 'myConfig', 'MemoryFactory', 'AuthService', function($http , $rootScope,$log, myConfig, MemoryFactory, AuthService) {
        var sendUrl = {};// myConfig.backend_images;
        var urlThings = myConfig.backend_things;
        var format = myConfig.format;
        var response = null;
        
        for(i in self.config.types.list){
            sendUrl[self.config.types.list[i].key] = self.config.types.list[i].url;
        }

        // se l'utente è autenticato
        if(AuthService.isAuth()){
            // set user id
            var user = AuthService.getUser();
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
                for (var i = 0; i < images.length; i++){
                    var img = 'data:';
                    img = img.concat(images[i].filetype).concat(';base64,').concat(images[i].base64);
                    data.filedata = img;
                    //test
                    data.image_name = "test test";
                    var json =  JSON.stringify(data);
                    var req = {
                        method: 'PUT',
                        url: urlThings.concat('/').concat(id).concat('/images').concat('/add').concat(format),
                        headers: { 'Content-Type': 'application/json'},
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
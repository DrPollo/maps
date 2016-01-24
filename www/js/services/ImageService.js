angular.module('firstlife.services')
    .service('ImageService',['$http', '$q', 'myConfig', 'PlatformService', function($http, $q, myConfig, PlatformService) {
        var config  = myConfig;
        var url     = myConfig.backend_things;//myConfig.backend_images;
        var format = '.json';
        var response = null;
        var req = 'images'
        var small = "?size=small";
        var medium = "?size=medium";
        var large = "?size=large";
        var size = medium;
        var self = this;
        var isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        
        self.imageList = [];

        
        //for(i in config.types.list){
        //    url[config.types.list[i].key] = config.types.list[i].url;
        //}
        //console.log("ImageService, preparo gli url: ",url);
        

        // se ho un device mobile carico i thumb
        if(isMobile){
            size = small;
        }

        return{
            getImages : function(idEntity, params, entity_type){ 
                // devo fare un refresh delle immagini prendendole dal server?
                // disabilita la cache interna
                var cache = true;
                if(params["cache"] != null){
                    cache = params["cache"];
                }
                // gestisco la taglia della richiesta
                var taglia="", 
                    size;
                if(params["size"] != null){
                    taglia = params["size"];
                }
                switch(taglia){
                    case "small" : 
                        size = small; 
                        break;
                    case "large" : 
                        size = large; 
                        break;
                    case "full" :
                        size = "";
                        break;
                    default: 
                        size = medium;
                }

                // chiamata al server o alla cache
                var deferred = $q.defer();
                console.log("Get Images of entity, preparo url: "+idEntity, url,entity_type);
                var urlId = url.concat('/').concat(idEntity).concat('/').concat(req).concat(format).concat(size).concat(" ");
                //var urlId = url[entity_type].concat('/').concat(idEntity).concat('/').concat(req).concat(format).concat(size).concat(" ");
                console.log("Get Images of entity: "+idEntity," url: ", urlId);
                // se posso controllare la cache > da parametro di funzione
                if (cache && self.imageList[idEntity]) {
                    //console.log("Get Images from cache!", self.imageList[idPlace]);
                    deferred.resolve( {images: self.imageList[idEntity], id:idEntity} );
                }else{
                    $http.get(urlId)
                        .success(function(response) {
                        //console.log("Get images of "+idPlace+" from server: ", response.data);
                        
                        // salvo le immagini nella cache
                        self.imageList[idEntity] = response.data;

                        deferred.resolve({images: response.data, id:idEntity});
                    })
                        .error(function(response) {
                        deferred.reject(response);
                        console.log("Get images of "+idEntity+" from server: error!");
                    });
                }

                return deferred.promise;

            }


        }

    }]);
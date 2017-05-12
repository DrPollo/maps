angular.module('firstlife.services')
    .service('ImageService',['$http', '$q', '$log', 'myConfig', 'PlatformService', function($http, $q, $log, myConfig, PlatformService) {
        var config  = myConfig;
        var urlThings     = myConfig.backend_things;//myConfig.backend_images;
        var format = config.format;
        var response = null;
        var req = 'images'
        var small = "thumb";
        var medium = "medium";
        var large = "full";
        var size = medium;
        var self = this;
        var isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        
        var consoleCheck = false;

        // resize
        var defaultMaxWidth = myConfig.behaviour.uploads.max_width,
            defaultMaxHeight = myConfig.behaviour.uploads.max_height,
            defaultQuality = myConfig.behaviour.uploads.quality,
            defaultMimeFormat = myConfig.behaviour.uploads.mime_format;

        
        self.imageList = [];

        var url = [];
        for(i in config.types.list){
            url[config.types.list[i].key] = config.types.list[i].url;
        }
        if(consoleCheck) console.log("ImageService, preparo gli url: ",url);
        

        // se ho un device mobile carico i thumb
        if(isMobile){
            size = small;
        }

        return{
            process: function(img, imgData) {
                return jicResizeCompress(img, imgData);
            },
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
                        size = medium; 
                        break;
                    case "full" :
                        size = large;
                        break;
                    default: 
                        size = medium;
                }

                // chiamata al server o alla cache
                var deferred = $q.defer();
                if(consoleCheck) console.log("Get Images of entity, preparo url: "+idEntity, url,entity_type);
                var urlId = urlThings.concat('/').concat(idEntity).concat('/').concat(req).concat(format);
                if(consoleCheck) console.log("Get Images of entity: "+idEntity," url: ", urlId);
                // se posso controllare la cache > da parametro di funzione
                if (cache && self.imageList[idEntity] && self.imageList[idEntity][size]) {
                    //if(consoleCheck) console.log("Get Images from cache!", self.imageList[idPlace]);
                    deferred.resolve( {images: self.imageList[idEntity][size], id:idEntity} );
                }else{
                    $http.get(urlId)
                        .then(function(response) {
                        if(consoleCheck) console.log("Get images of ",idEntity," size ",size," from server: ", response);
                        // salvo le immagini nella cache
                        self.imageList[idEntity] = response;
                        if(consoleCheck) console.log("Get images of.. results ",idEntity," ",response);
                        deferred.resolve({images: response.data, id:idEntity});
                    },function(response) {
                        deferred.reject(response);
                        if(consoleCheck) console.log("Get images of "+idEntity+" from server: error!");
                    });
                }

                return deferred.promise;

            }


        }

        /*
         * Resize and compress image
         * Options:
         *  resizeType: mime format
         *  resizeQuality: e.g. 0.7
         *  resizeMaxHeight: px
         *  resizeMaxWidth: px
         */

        function jicResizeCompress(img, data, options) {
            var deferred = $q.defer();


            var quality = defaultQuality;
            var mimeType = defaultMimeFormat;
            var maxHeight = defaultMaxHeight;
            var maxWidth = defaultMaxWidth;

            if(options){
                var outputFormat = options.resizeType;
                quality = options.resizeQuality * 100 || 70;
                maxHeight = options.resizeMaxHeight || 800;
                maxWidth = options.resizeMaxWidth || 800;
            }
            if (outputFormat !== undefined && outputFormat === 'png') {
                mimeType = 'image/png';
            }


            var sized = resize(img, data,{mimeType:mimeType,maxHeight:maxHeight,maxWidth:maxWidth,quality:quality});
            deferred.resolve(sized);


            return deferred.promise;
        }

        function getSize(img,data) {
            var deferred = $q.defer();

            var i = new Image();

            i.onload = function(){
                var width = i.width;
                var height = i.height;

                $log.debug('check for img meta exif',img);

                deferred.resolve({width:width,height:height});
            };

            i.src = data;


            return deferred.promise;
        }


        function resize (img,data,options) {
            var deferred = $q.defer();
            getSize(img,data).then(
                function (size) {
                    var height = size.height;
                    var width = size.width;
                    // calculate the width and height, constraining the proportions
                    if (width > height) {
                        if (width > options.maxWidth) {
                            height = Math.round(height *= options.maxWidth / width);
                            width = options.maxWidth;
                        }
                    } else {
                        if (height > options.maxHeight) {
                            width = Math.round(width *= options.maxHeight / height);
                            height = options.maxHeight;
                        }
                    }

                    var cvs = document.createElement('canvas');
                    cvs.width = width;
                    cvs.height = height;

                    // $log.debug('check', options,size);

                    var i = new Image();
                    i.onload = function () {
                        try{
                            var ctx = cvs.getContext('2d').drawImage(this, 0, 0, width, height);
                            var newImageData = cvs.toDataURL(options.mimeType, options.quality / 100);
                            // $log.debug('check new image',newImageData);
                            deferred.resolve(newImageData);
                        }catch (e){
                            // se non riesco mando indietro l'immagine originale
                            $log.error(e);
                            deferred.resolve(data);
                        }
                    };
                    i.src = data;

                }
            );
            return deferred.promise;
        }
    }]);
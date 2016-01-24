angular.module('firstlife.controllers')

    .controller('ImagesCtrl', ['$scope', '$state', '$q', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicLoading', '$rootScope', 'myConfig', 'ImageService', 'CamerasFactory', 'SenderFactory', 'PlatformService', 'MemoryFactory', function( $scope, $state, $q, $ionicModal, $rootScope, $ionicSlideBoxDelegate, $ionicLoading, myConfig, ImageService, Cameras, Sender, PlatformService, MemoryFactory) { 

        var _this = this;

        _this.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        _this.isLoggedIn = $rootScope.isLoggedIn;
        _this.config = myConfig;
        _this.images = [];
        _this.imageCache = [];
        
        _this.isPendingImages = false;
        _this.gallery = {};
        
        _this.slider = {};
        _this.slider.images = [];
        _this.slider.pointer = 0;
        
        _this.isLoggedIn = false;
        // check autenticazione
        var user = MemoryFactory.readUser();
        if(user){
            console.log("isLoggedIn? ", true);
            _this.isLoggedIn = true;
        }


        // listner per l'apertura della modal *click sul marker*
        // se le foto nelle modal sono abilitate
        console.log("ImagesCtrl, immagini abilitate? ", _this.config.design.show_thumbs, _this);
        if(_this.config.design.show_thumbs){
            $scope.$on('checkImagePlaceModal', function(event, args) {
                console.log("Caricamento dettagli modal Carichiamo le immagini!", event, args);
                if (!event.defaultPrevented) {
                    event.defaultPrevented = true;
                    //console.log("Caricamento dettagli modal Carichiamo le immagini!", event, args);
                    _this.loadImages(args.marker.id,args.marker.entity_type);
                }
            });   
        }




        /*
         * Gestione galleria foto
         */
        /*
         * modal galleria ------> carico la galleria immagini per il click
         */
        _this.loadGallery = function(entityId, index, entity_type) {
            console.log("ImagesCtrl, loadGallery, entityId: ", entityId, ", index: ", index);
            var param = {size : "full", cache : false};
            ImageService.getImages(entityId, param,entity_type)
                .then(function (data){
                console.log("getImages, risultato: ",data);
                var images = data["images"],
                    placeId = data["id"];
                angular.extend(_this.slider.images,images);
                openGallery(index);
            }, function(err){
                console.log("getImages, errore: ",err);
            });

        }
        function openGallery (index){
            var deferred = $q.defer();
            console.log("ImagesCtrl, openGallery, params: ", index);
            if(!isNaN(index)){
                _this.slider.pointer = index;
            }
            $ionicModal.fromTemplateUrl('templates/gallery.html', {
                scope: _this,
                animation: 'fade-in'
            }).then(function(modal) {
                _this.gallery = modal; 
                if(index > 0){
                    //_this.galery.goToSlide(index);
                }
                _this.gallery.show();
                
                //$ionicSlideBoxDelegate.slide(index);
                deferred.resolve(true);
            }, function(err){
                console.log(err);
                deferred.reject(false);
            });

            _this.gallery.close = function() {
                console.log("ImageCtrl, gallery.close, close!");
                _this.gallery.hide();
                $rootScope.galleryStatus = false;
            };
            // Cleanup the modal when we're done with it!
            _this.$on('$destroy', function() {
                _this.gallery.remove();
            });
            // Execute action on hide modal
            _this.$on('gallery.hide', function() {
                // Execute action
            });
            // Execute action on remove modal
            _this.$on('gallery.removed', function() {
                // Execute action
            });
            _this.$on('gallery.shown', function() {
                console.log('Gallery is shown!');
            });



            // Called each time the slide changes
            _this.gallery.slideChanged = function(index) {
                _this.gallery.slideIndex = index;
            };
            console.log("ImagesCtrl, openGallery, gallery: ",_this.gallery);
            return deferred.promise;
        };


        _this.slider.next = function(){
            if(_this.slider.pointer < _this.slider.images.length -1){
                _this.slider.pointer++;
            }else{
                _this.slider.pointer = 0;
            }
            console.log("ImageCtrl, slider.pointer: ", _this.slider.pointer);
        }
        _this.slider.prev = function(){
            if(_this.slider.pointer > 0){
                _this.slider.pointer--;
            }else{
                _this.slider.pointer =  _this.slider.images.length -1;
            }
            console.log("ImageCtrl, slider.pointer: ", _this.slider.pointer);
        }
        _this.slider.slideTo = function(index){
            if(index > -1 && index < _this.slider.images.length-1){
                _this.slider.pointer = index;
            }
            console.log("ImageCtrl, slider.pointer: ", _this.slider.pointer);
        }



        _this.removeImage = function(index) {
            if(_this.imageCache.length > 0){
                _this.imageCache.splice(index, 1);
            }


            if(_this.imageCache.length < 1){
                _this.isPendingImages = false;
            }

        };

        //action to upload photos
        _this.loadCamera = function(){
            console.log('Getting camera');
            Cameras.getPicture({
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.CAMERA,
                quality: 70,
                targetWidth: 800,
                targetHeight: 800,
                saveToPhotoAlbum: false
            }).then(function(imageURI) {
                //  alert(imageURI);
                _this.addToImageCache(imageURI);
            }, function(err) {
                console.log(err);
            });    
        };

        //action to choose images
        _this.imagePicker = function(){

            var options = {
                quality: 70,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                targetWidth: 800,
                targetHeight: 800
            };

            $cordovaCamera.getPicture(options).then(function(imageUri) {
                //  alert('img' + imageUri);
                _this.addToImageCache(imageUri);

            }, function(err) {
                console.log('error'+ err);
            });

        };



        _this.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
            console.log("ImagesCtrl, onLoad, fileObj: ", fileObj);
            _this.addToImageCache(fileObj.base64);
        }


        // send photo to api
        _this.sendPhoto = function(entity_id,entity_type) {
            
            console.log("immagini da salvare", _this.imageCache, entity_id);
            if(Array(_this.imageCache).length > 0){
                Sender.images(_this.imageCache, entity_id,entity_type).then(
                    function(data){
                    // reset immagini
                    _this.resetImageCache();
                    //console.log('Immagini caricate!',data);
                    // ho salvato le immagini, le ricarico dal server
                    _this.refreshImages(entity_id,entity_type);
                },
                    function(err){
                    console.log('errore' + err);
                });
            }

        };

        // send photo to api
        _this.resetImageCache = function(markerId) {
            //console.log("reset immagini");
            _this.imageCache = [];
            _this.isPendingImages = false;

        };


        // carico le immagini 
        _this.loadImages = function(entityId, entity_type){
            //console.log("carico le immagini di: ",placeId);
            var param = {cache : true};
            // se mobile chiedo i thumbs
            if(_this.isMobile){
                param["size"] = "small";
            }

            _this.getImages(entityId, param, entity_type);
        };

        // refresh immagini del place
        _this.refreshImages = function(entityId, entity_type){
            //console.log("reset immagini");
            var param = {cache : false};
            // se mobile chiedo i thumbs
            if(_this.isMobile){
                param["size"] = "small";
            }
            _this.getImages(entityId, param, entity_type);
        };



        // chiamata al service delle immagini
        _this.getImages = function(entityId, param, entity_type){
            ImageService.getImages(entityId, param, entity_type)
                .then(function (data){
                console.log("getImages, risultato: ",data);
                var images = data["images"],
                    placeId = data["id"];
                addImages(entityId,images,entity_type)
            }, function(err){
                console.log("getImages, errore: ",err);
            });
        };



        // salvo le immagini nei marker
        function addImages (entityId,images){

            //aggiungo le immagini al marker
            //console.log("aggiorno le immagini", images, placeId, _this.infoPlace.marker.images );
            // pulisco l'array di immagini della modal
            _this.images = [];
            for(i = 0 ; i < images.length; i++){
                images[i].position = i;
                _this.images[i] = images[i];
            }
            console.log("salvo le immagini: ", _this.images);

        }

        _this.addToImageCache = function(image){
            // aggiungo le immagini alla cache, senza duplicati
            // console.log("immagini da aggiungere", image);
            if(_this.imageCache.indexOf(image) < 0){
                _this.imageCache.push(image);
                _this.isPendingImages = true;
            }

            console.log("cache", _this.imageCache, _this.isPendingImages);
        }



        function showLoadingScreen(text){
            if(!text || text === 'undefined'){
                text = 'Operazione in corso...';
            }

            $ionicLoading.show({
                template: text
            });

        }

        function hideLoadingScreen(){
            $ionicLoading.hide();
        }


    }]);
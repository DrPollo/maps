angular.module('firstlife.controllers')

    .controller('ImagesCtrl', ['$scope', '$state', '$q', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicLoading', '$rootScope', 'myConfig', 'ImageService', 'CamerasFactory', 'SenderFactory', 'PlatformService', 'MemoryFactory', function( $scope, $state, $q, $ionicModal, $rootScope, $ionicSlideBoxDelegate, $ionicLoading, myConfig, ImageService, Cameras, Sender, PlatformService, MemoryFactory) { 

        //var $scope = this;

        $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        $scope.isLoggedIn = $rootScope.isLoggedIn;
        $scope.config = myConfig;
        $scope.images = [];
        $scope.imageCache = [];
        
        $scope.isPendingImages = false;
        $scope.gallery = {};
        
        $scope.slider = {};
        $scope.slider.images = [];
        $scope.slider.pointer = 0;
        
        $scope.isLoggedIn = false;
        // check autenticazione
        var user = MemoryFactory.readUser();
        if(user){
            console.log("isLoggedIn? ", true);
            $scope.isLoggedIn = true;
        }


        // listner per l'apertura della modal *click sul marker*
        // se le foto nelle modal sono abilitate
        console.log("ImagesCtrl, immagini abilitate? ", $scope.config.design.show_thumbs, $scope);
        if($scope.config.design.show_thumbs){
            $scope.$on('checkImagePlaceModal', function(event, args) {
                console.log("Caricamento dettagli modal Carichiamo le immagini!", event, args);
                if (!event.defaultPrevented) {
                    event.defaultPrevented = true;
                    //console.log("Caricamento dettagli modal Carichiamo le immagini!", event, args);
                    $scope.loadImages(args.marker.id,args.marker.entity_type);
                }
            });   
        }




        /*
         * Gestione galleria foto
         */
        /*
         * modal galleria ------> carico la galleria immagini per il click
         */
        $scope.loadGallery = function(entityId, index, entity_type) {
            console.log("ImagesCtrl, loadGallery, entityId: ", entityId, ", index: ", index);
            var param = {size : "full", cache : false};
            ImageService.getImages(entityId, param,entity_type)
                .then(function (data){
                console.log("getImages, risultato: ",data);
                var images = data["images"],
                    placeId = data["id"];
                angular.extend($scope.slider.images,images);
                openGallery(index);
            }, function(err){
                console.log("getImages, errore: ",err);
            });

        }
        function openGallery (index){
            var deferred = $q.defer();
            console.log("ImagesCtrl, openGallery, params: ", index);
            if(!isNaN(index)){
                $scope.slider.pointer = index;
            }
            $ionicModal.fromTemplateUrl('templates/gallery.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal){
                console.log("gallery ",modal);
                $scope.gallery = modal; 
                if(index > 0){
                    //$scope.galery.goToSlide(index);
                }
                $scope.gallery.show();
                
                //$ionicSlideBoxDelegate.slide(index);
                deferred.resolve(true);
            }, function(err){
                console.log("gallery error",err);
                console.log(err);
                deferred.reject(false);
            });

            $scope.gallery.close = function() {
                console.log("ImageCtrl, gallery.close, close!");
                $scope.gallery.hide();
                $rootScope.galleryStatus = false;
            };
            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.gallery.remove();
            });
            // Execute action on hide modal
            $scope.$on('gallery.hide', function() {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('gallery.removed', function() {
                // Execute action
            });
            $scope.$on('gallery.shown', function() {
                console.log('Gallery is shown!');
            });



            // Called each time the slide changes
            $scope.gallery.slideChanged = function(index) {
                $scope.gallery.slideIndex = index;
            };
            console.log("ImagesCtrl, openGallery, gallery: ",$scope.gallery);
            return deferred.promise;
        };


        $scope.slider.next = function(){
            if($scope.slider.pointer < $scope.slider.images.length -1){
                $scope.slider.pointer++;
            }else{
                $scope.slider.pointer = 0;
            }
            console.log("ImageCtrl, slider.pointer: ", $scope.slider.pointer);
        }
        $scope.slider.prev = function(){
            if($scope.slider.pointer > 0){
                $scope.slider.pointer--;
            }else{
                $scope.slider.pointer =  $scope.slider.images.length -1;
            }
            console.log("ImageCtrl, slider.pointer: ", $scope.slider.pointer);
        }
        $scope.slider.slideTo = function(index){
            if(index > -1 && index < $scope.slider.images.length-1){
                $scope.slider.pointer = index;
            }
            console.log("ImageCtrl, slider.pointer: ", $scope.slider.pointer);
        }



        $scope.removeImage = function(index) {
            if($scope.imageCache.length > 0){
                $scope.imageCache.splice(index, 1);
            }


            if($scope.imageCache.length < 1){
                $scope.isPendingImages = false;
            }

        };

        //action to upload photos
        $scope.loadCamera = function(){
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
                $scope.addToImageCache(imageURI);
            }, function(err) {
                console.log(err);
            });    
        };

        //action to choose images
        $scope.imagePicker = function(){

            var options = {
                quality: 70,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                targetWidth: 800,
                targetHeight: 800
            };

            $cordovaCamera.getPicture(options).then(function(imageUri) {
                //  alert('img' + imageUri);
                $scope.addToImageCache(imageUri);

            }, function(err) {
                console.log('error'+ err);
            });

        };


        $scope.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
            console.log("ImagesCtrl, onLoad, fileObj: ", fileObj);
            $scope.addToImageCache(fileObj.base64);
        }


        // send photo to api
        $scope.sendPhoto = function(entity_id,entity_type) {
            
            console.log("immagini da salvare", $scope.imageCache, entity_id);
            if(Array($scope.imageCache).length > 0){
                Sender.images($scope.imageCache, entity_id,entity_type).then(
                    function(data){
                    // reset immagini
                    $scope.resetImageCache();
                    //console.log('Immagini caricate!',data);
                    // ho salvato le immagini, le ricarico dal server
                    $scope.refreshImages(entity_id,entity_type);
                },
                    function(err){
                    console.log('errore' + err);
                });
            }

        };

        // send photo to api
        $scope.resetImageCache = function(markerId) {
            //console.log("reset immagini");
            $scope.imageCache = [];
            $scope.isPendingImages = false;

        };


        // carico le immagini 
        $scope.loadImages = function(entityId, entity_type){
            //console.log("carico le immagini di: ",placeId);
            var param = {cache : true};
            // se mobile chiedo i thumbs
            if($scope.isMobile){
                param["size"] = "small";
            }

            $scope.getImages(entityId, param, entity_type);
        };

        // refresh immagini del place
        $scope.refreshImages = function(entityId, entity_type){
            //console.log("reset immagini");
            var param = {cache : false};
            // se mobile chiedo i thumbs
            if($scope.isMobile){
                param["size"] = "small";
            }
            $scope.getImages(entityId, param, entity_type);
        };



        // chiamata al service delle immagini
        $scope.getImages = function(entityId, param, entity_type){
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
            //console.log("aggiorno le immagini", images, placeId, $scope.infoPlace.marker.images );
            // pulisco l'array di immagini della modal
            $scope.images = [];
            for(i = 0 ; i < images.length; i++){
                images[i].position = i;
                $scope.images[i] = images[i];
            }
            console.log("salvo le immagini: ", $scope.images);

        }

        $scope.addToImageCache = function(image){
            // aggiungo le immagini alla cache, senza duplicati
            // console.log("immagini da aggiungere", image);
            if($scope.imageCache.indexOf(image) < 0){
                $scope.imageCache.push(image);
                $scope.isPendingImages = true;
            }

            console.log("cache", $scope.imageCache, $scope.isPendingImages);
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
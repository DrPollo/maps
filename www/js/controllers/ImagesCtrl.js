angular.module('firstlife.controllers')

    .controller('ImagesCtrl', ['$scope', '$state', '$q', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicLoading', '$ionicPopup', '$rootScope', '$filter', 'myConfig', 'ImageService', 'CamerasFactory', 'SenderFactory', 'PlatformService', 'MemoryFactory', function( $scope, $state, $q, $ionicModal, $rootScope, $ionicSlideBoxDelegate, $ionicLoading, $ionicPopup, $filter, myConfig, ImageService, Cameras, Sender, PlatformService, MemoryFactory) { 

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
            $scope.isLoggedIn = true;
        }


        // dimensioni delle immagini
        var small = "thumb";
        var medium = "medium";
        var large = "full";
        
        // listner per l'apertura della modal *click sul marker*
        // se le foto nelle modal sono abilitate
        if($scope.config.design.show_thumbs){
            $scope.$on('checkImagePlaceModal', function(event, args) {
                //console.log("Caricamento dettagli modal Carichiamo le immagini!", event, args);
                if (!event.defaultPrevented) {
                    event.defaultPrevented = true;
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
                console.log("loadGallery, getImages, risultato: ",data);
                var images = data.images;
//                for(var i in images){
//                    images[i].url = '//'+images[i][param.size];
//                }
                angular.extend($scope.slider.images,images);
                openGallery(index);
            }, function(err){
                console.log("loadGallery, getImages, errore: ",err);
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
            //var img = 'data:';
            //img = img.concat(fileObj.filetype).concat(';base64,').concat(fileObj.base64);
            //img = fileObj.base64;
            $scope.addToImageCache(fileObj);
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
                    // reset immagini
                    $scope.resetImageCache();
                    // todo errore di caricamento
                    var title = $filter('translate')('ERROR');
                    var template = $filter('translate')('UNKNOWN_ERROR');
                    switch(err.status){
                        case '413':
                            // immagine troppo grande
                            // errore di rete
                            template = $filter('translate')('SIZE_ERROR');
                        break;
                        default:
                            // errore di rete
                            
                    }
                    var alertPopup = $ionicPopup.alert({
                            title: title,
                            template: template
                        });
                    console.log('sendPhoto, errore',err);
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
            $scope.getImages(entityId, param, entity_type);
        };



        // chiamata al service delle immagini
        $scope.getImages = function(entityId, param, entity_type){
            ImageService.getImages(entityId, param, entity_type)
                .then(function (data){
                var images = data["images"],
                    placeId = data["id"];
                addImages(entityId,images,entity_type)
            }, function(err){
                $log.error("getImages, errore: ",err);
            });
        };



        // salvo le immagini nei marker
        function addImages (entityId,images){
            // se mobile chiedo i thumbs
            if($scope.isMobile){
                size = small;
            } else{
                size = medium;
            }
            // pulisco l'array di immagini della modal
            if(!$scope.entity || entityId != $scope.entity){
                $scope.entity = entityId;
                $scope.images = [];
            }
            for(var i = 0 ; i < images.length; i++){
                var index = $scope.images.map(function(e){return e.image_id}).indexOf(images[i].image_id);
                if (index < 0)
                    $scope.images.push(images[i]);
            }
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
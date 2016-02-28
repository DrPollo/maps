angular.module('firstlife.controllers')

    .controller('GalleryCtrl', ['$scope', '$state', '$ionicModal',  '$ionicLoading', '$ionicSlideBoxDelegate', '$q', 'ImageService', function($scope, $state, $ionicModal, $ionicLoading, $ionicSlideBoxDelegate, $q, ImageService)
        {

            // da cancellare debug da togliere
            $scope.aImages = [{
                'src' : 'http://ionicframework.com/img/ionic-logo-blog.png', 
                'msg' : 'Swipe me to the left. Tap/click to close'
            }, {
                'src' : 'http://ionicframework.com/img/ionic_logo.svg', 
                'msg' : ''
            }, { 
                'src' : 'http://ionicframework.com/img/homepage/phones-weather-demo@2x.png', 
                'msg' : ''
            }];
            // fine da togliere




            /*
             * modal place ------> carico la galleria immagini per il click
             */
            $scope.loadGallery = function(entityId) {
                var deferred = $q.defer();
                
                console.log("debug gallery",entityId);
                $scope.gallery = {};

                // carico le immagini
                $scope.loadGalleryImages(entityId);

                $ionicModal.fromTemplateUrl('gallery.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.gallery = modal;
                    // rendo visibile la gallery nella root per il routing dell'app
                    $rootScope.gallery = modal;
                    $rootScope.galleryStatus = true;
                    deferred.resolve(true);
                }, function(err){
                    console.log(err);
                    deferred.reject(false);
                });

                $scope.gallery.open = function() {
                    $ionicSlideBoxDelegate.slide(0);
                    $scope.gallery.show();
                };

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

                // Call this functions if you need to manually control the slides
                $scope.gallery.next = function() {
                    $ionicSlideBoxDelegate.next();
                };

                $scope.gallery.previous = function() {
                    $ionicSlideBoxDelegate.previous();
                };

                $scope.galery.goToSlide = function(index) {
                    $scope.gallery.show();
                    $ionicSlideBoxDelegate.slide(index);
                }

                // Called each time the slide changes
                $scope.gallery.slideChanged = function(index) {
                    $scope.gallery.slideIndex = index;
                };
                return deferred.promise;
            };



            // carico immagini per la gallery
            $scope.loadGalleryImages = function(entityId,entity_type){
                var deferred = $q.defer();
                var param = {size : "full", cache : false};
                console.log("debug immagini ",param);
                ImageService.getImages(entityId, param, entity_type)
                    .then(function (data){
                    var images = data["images"],
                        entityId = data["id"];
                    // salvo la gallery nella cache della modal
                    $scope.infoPlace.marker.gallery = [];
                    console.log("debug immagini ",data);
                    for(image in images){
                        var img = angular.copy(image);
                        img.url = img[param.size];
                        $scope.infoPlace.marker.gallery.push(img);
                    }
                    deferred.resolve(true);
                }, function(err){
                    console.log("GalleryCtrl, loadGalleryImages, ImageService.getImages, errore ",err);
                    deferred.resolve(false);
                });
                return deferred.promise;
            };



        }]);
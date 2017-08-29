/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('posts',['$log', '$q', '$ionicPopover', '$location', 'myConfig', 'postFactory', 'AuthService', 'ThingsService', function ($log, $q, $ionicPopover,$location, myConfig, postFactory, AuthService, ThingsService) {
    return {
        restrict:'EG',
        scope: {
            id: '=id'
        },
        templateUrl: '/templates/post/postList.html',
        link:function(scope, element, attrs){
            scope.$on('$destroy', function(e) {
                if(!e.preventPostListEvent){
                    e.preventPostListEvent = true;
                    // rimuovo il menu
                    if(scope.popover)
                        scope.popover.remove();
                    delete scope;
                }
            });

            // init della lista di post
            initList();
            scope.user = AuthService.getUser();
            scope.dev = myConfig.dev;
            scope.config = myConfig;

            var searchParams = $location.search();
            scope.embed = searchParams.embed || false;
            //reset della lista
            scope.reset = function () {
                $log.log('reset di ', scope.id)
                initList();
            };
            // open popover menu
            $ionicPopover.fromTemplateUrl('/templates/popovers/post-menu.html',{
                scope: scope
            }).then(
                function (popover){
                    scope.popover = popover;
                }
            );
            // apro il menu
            scope.openMenu = function($event, id, owner) {
                // $log.debug('openMenu',$event,id,owner);
                scope.current = id;
                initPerms(owner);
                if(scope.popover)
                    scope.popover.show($event);
            };

            // inizio l'edit del post
            scope.updatePost = function (id) {
                // id del post in edit
                scope.edit = id;
                // chiudi menu
                scope.popover.hide();
            };
            // annullo l'update
            scope.abortUpdate = function(){
                // tolgo l'id
                scope.edit = null;
            };
            // aggiorno il post
            scope.sendUpdate = function(id, post){
                $log.debug('sendUpdate init',id,post);
                scope.edit = null;
                scope.loading = true;
                postFactory.updatePost(id, post).then(
                    function (response) {
                        $log.debug('ok update post',response);
                        initList().then(
                            function(){
                                scope.loading = false;
                            },
                            function () {
                                scope.loading = false;
                            }
                        );
                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            };
            // cancello il commento
            scope.deletePost = function(id){
                scope.loading = true;
                scope.popover.hide();
                postFactory.deletePost(id,scope.id).then(
                    function (response) {
                        $log.log('ok delete post',response);
                        initList().then(
                            function(){
                                scope.loading = false;
                            },
                            function () {
                                scope.loading = false;
                            }
                        );
                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            };

            // segnalo il post
            scope.reportPost = function(id){
                scope.loading = true;
                scope.popover.hide();
                var report = {
                    post_id: id,
                    message: ''
                };
                $log.debug('reporting post',id);
                ThingsService.report(report).then(
                    function (response) {
                        $log.log('ok delete post',response);
                        initList().then(
                            function(){
                                scope.loading = false;
                            },
                            function () {
                                scope.loading = false;
                            }
                        );
                    },
                    function (err) {
                        $log.error(err);
                        scope.loading = false;
                        // todo messaggio d'errore all'utente
                    }
                );
            };

            function initList(){
                scope.posts = [];
                var deferred = $q.defer();
                postFactory.getPosts(scope.id).then(
                    function (results) {
                        // $log.debug('posts',results.length);
                        scope.posts = results;
                        deferred.resolve(results);
                        requestUpdate(results.length);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err)
                    }
                );
                requestUpdate()
                return deferred.promise;
            }


            function requestUpdate(counter) {
                scope.$emit('counterUpdate',{posts:counter});
            }

            // init perms
            function initPerms (author){
                if(!scope.user)
                    scope.user = AuthService.getUser();
                // se l'utente non e' definito
                if(!scope.user)
                    return false;

                var source = 'others';
                if(author === scope.user.id)
                    source = 'self';

                // $log.debug(author ,'==',scope.user.id);
                scope.checkPerms = AuthService.checkPerms(source);
                return scope.perms;
            }

        }
    }
}]).directive('post',['$log', 'myConfig', 'postFactory', function ($log, myConfig, postFactory) {
    return {
        restrict:'EG',
        scope: {
            post: '=post'
        },
        templateUrl: '/templates/post/post.html',
        link:function(scope, element, attrs){
            scope.$on('$destroy', function(e) {
                if(!e.preventPostEvent){
                    e.preventPostEvent = true;
                    delete scope;
                }
            });

            // todo click on a picture
            scope.highlight = false;
            scope.togglePicture = function(){
                scope.highlight = !scope.highlight;
            };

        }
    }
}]).directive('postEditor', ['$log' , 'AuthService', 'postFactory' , function ($log, AuthService, postFactory) {
    return{
        restrict: 'E',
        scope: {
            id: '=id',
            reset: '=reset'
        },
        templateUrl: '/templates/post/postEditor.html',
        link: function(scope, element, attrs){

            scope.$on('$destroy', function(e) {
                if(!e.preventEventPostEditor){
                    e.preventEventPostEditor = true;
                    delete scope;
                }
            });

            // element.on('click', function (e) {
            //     if(!e.preventEventPostEditorFocus){
            //         e.preventEventPostEditorFocus = true;
            //         scope.$apply(function(){scope.focus = true;});
            //     }
            // });

            scope.user = AuthService.getUser();
            scope.loading = false;
            scope.error = false;



            // raccolgo l'evento focus
            scope.focus = false;
            scope.setFocus = AuthService.doAction(function(){
                scope.focus = true;
                // init del form
                initPost();
            });

            // reset dei campi
            scope.clear = function(){
                initPost();
                scope.focus = false;
            }

            // pubblica un post
            scope.publish = function(){
                var post = angular.copy(scope.post);
                // $log.log('post: ',post);
                initPost();
                scope.loading = true;
                postFactory.createPost(scope.id, post).then(
                    function (results) {
                        $log.log('ok caricamento post',results);
                        reset();
                        // reset del form
                        scope.loading = false;
                        scope.focus = false;
                    },
                    function (err){
                        $log.error('errore salvataggio post',err);
                        // ripristino il contenuto
                        restorePost(post);
                        scope.loading = false;
                        scope.error = true;
                    }
                );
            }
            // reset del form
            function initPost(){
                scope.error = false;
                // init del post
                scope.post = {
                    title: '',
                    message: '',
                    ext_ref: '',
                    filedata: null,
                    tags:[]
                };
                if(scope.form && scope.form.post)
                    scope.form.post.$setPristine();
            }
            // restore del form
            function restorePost(post){
                // init del post
                scope.post = {
                    title: post.title,
                    message: post.message,
                    filedata: post.filedata,
                    ext_ref: post.ext_ref,
                    tags:post.tags
                };
                scope.focus = false;
                scope.error = false;
            }

            function reset() {
                $log.log('reset', scope.reset);
                // scope.$eval(attrs.reset,{'id':scope.id});
                scope.reset();
            }
        }
    };
}]).directive('postUpdater',['$log',function ($log) {
    return {
        restrict: 'EG',
        templateUrl: '/templates/post/postUpdater.html',
        scope:{
            post:'=post',
            update: '&update'
        },
        link: function (scope,element,attr) {

            scope.content = angular.copy(scope.post);
            $log.debug('content',scope.content)


            // delete image
            scope.deleteimage = function () {
                // cancello riferimenti all'immagine
                delete scope.content.image_thumbnail;
                delete scope.content.image_url;
                scope.content.filename = null;
                // init del campo
                scope.content.filedata = '';
            }

            scope.sendUpdate = function () {
                $log.debug('check pristine', scope.here);
                $log.debug('start update',scope.content);
                scope.update({'id': scope.content.id, 'content': scope.content});
            }
        }
    }
}]).directive('pictureLoader',function(){
    return {
        restrict: 'EG',
        scope: {
            id:'=id',
            images:'=images'
        },
        templateUrl: '/templates/form/pictureLoader.html',
        controller:['$scope','$log','$filter','$ionicLoading', '$q','$ionicPopup','$filter','$timeout','myConfig', function($scope,$log,$filter,$ionicloading,$q,$ionicPopup, $filter, $timeout,myConfig){


            $scope.$on('$destroy', function(e) {
                if(!e.preventPictureLoader){
                    e.preventPictureLoader = true;
                    delete $scope;
                }
            });

            $scope.config = myConfig;

            var defaultMaxWidth = myConfig.behaviour.uploads.max_width,
                defaultMaxHeight = myConfig.behaviour.uploads.max_height,
                defaultQuality = myConfig.behaviour.uploads.quality,
                defaultMimeFormat = myConfig.behaviour.uploads.mime_format;


            var imageOptions = {
                maxWidth: defaultMaxWidth,
                maxHeight: defaultMaxHeight,
                canvas: true,
                orientation: true
            };


            // init form
            $scope.loader = {};
            var limit = 5000000;
            if(!$scope.images){
                $scope.images = null;
            }
            function initLoader(){
                $scope.file = '';
            }
            initLoader();


            $timeout(function() {
                // listner caricamento immagine
                document.getElementById('input-fileUpload').onchange = function (e) {
                    $log.debug('carico',e.target.files[0]);
                    // 10mb
                    if(e.target.files[0].size > 10000000){
                        $log.error('oversize');
                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('ERROR'),
                            template: $filter('translate')('OVERSIZE_ERROR')
                        });
                        return;
                    }

                    var loadingImage = loadImage(
                        e.target.files[0],
                        function (img) {
                            // $log.debug('caricata',img);
                            if (img.type === "error") {
                                $log.error('errore caricamento immagine',img);
                            } else {
                                var newImageData = img.toDataURL(defaultMimeFormat, defaultQuality);
                                $scope.images = newImageData;
                                $scope.$apply();
                                // addToimages(img);
                            }
                        },
                        imageOptions
                    );
                };
            },1);

            $scope.removeImage = function(index) {
                $scope.images.splice(index, 1);
            };

            //action to upload photos
            $scope.loadCamera = function(){
                Cameras.getPicture({
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.CAMERA,
                    quality: myConfig.behaviour.uploads.quality,
                    targetWidth: myConfig.behaviour.uploads.width,
                    targetHeight: myConfig.behaviour.uploads.height,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                }).then(function(imageURI) {
                    // $log.debug(imageURI);
                    addToimages(imageURI);
                }, function(err) {
                    $log.error(err);
                });
            };

            //action to choose images
            $scope.imagePicker = function(){
                var mimeType = Camera.EncodingType.JPG;
                if(myConfig.behaviour.uploads.mime_type === 'image/png')
                    mimeType = Camera.EncodingType.PNG;

                // $log.debug(imageURI);
                var options = {
                    quality: myConfig.behaviour.uploads.quality,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: mimeType,
                    targetWidth: myConfig.behaviour.uploads.width,
                    targetHeight: myConfig.behaviour.uploads.height,
                    correctOrientation: true
                };

                $cordovaCamera.getPicture(options).then(function(imageUri) {
                    $log.debug('cordovaCamera',imageUri);
                    addToimages(imageUri);
                }, function(err) {
                    console.log('error', err);
                });
            };


            function addToimages(image,compression){
                // aggiungo l'immagine
                var data = 'data:';
                data = data.concat(image.filetype).concat(';base64,').concat(image.base64);
                // $log.debug('image',image);
                $scope.images = data;
            }

            // // send photo to api
            $scope.resetimages = function() {
                //console.log("reset immagini");
                $scope.images = null;
            };

        }]
    }
});
/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('posts',['$log', '$q', '$ionicPopover', 'myConfig', 'postFactory', 'AuthService', 'ThingsService', function ($log, $q, $ionicPopover, myConfig, postFactory, AuthService, ThingsService) {
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
                    scope.popover.remove();
                    delete scope;
                }
            });

            // init della lista di post
            initList();
            scope.user = AuthService.getUser();
            scope.dev = myConfig.dev;
            scope.config = myConfig;

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
            }
            // annullo l'update
            scope.abortUpdate = function(){
                // tolgo l'id
                scope.edit = null;
            }
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
            }
            // cancello il commento
            scope.deletePost = function(id){
                scope.loading = true;
                scope.popover.hide();
                postFactory.deletePost(id).then(
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
            }
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
            }

            function initList(){
                var deferred = $q.defer();
                postFactory.getPosts(scope.id).then(
                    function (results) {
                        // $log.debug('posts',results.length);
                        scope.posts = results;
                        deferred.resolve(results);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err)
                    }
                );
                return deferred.promise;
            }




            // init perms
            function initPerms (author){
                if(!scope.user)
                    scope.user = AuthService.getUser();
                // se l'utente non e' definito
                if(!scope.user)
                    return false;

                var source = 'others';
                if(author == scope.user.id)
                    source = 'self';

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
            }
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

            element.on('click', function (e) {
                if(!e.preventEventPostEditorFocus){
                    e.preventEventPostEditorFocus = true;
                    scope.$apply(function(){scope.focus = true;});
                }
            });

            scope.user = AuthService.getUser();
            scope.loading = false;
            scope.error = false;

            // init del form
            initPost();

            // raccolgo l'evento focus
            scope.focus = false;
            scope.setFocus = function(value){
                scope.focus = value;
            }

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
        controller:['$scope','$log','$filter','$ionicLoading', 'myConfig',function($scope,$log,$filter,$ionicloading, myConfig){


            $scope.$on('$destroy', function(e) {
                if(!e.preventPictureLoader){
                    e.preventPictureLoader = true;
                    delete $scope;
                }
            });

            $scope.config = myConfig;

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




            $scope.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
                $log.debug('check onLoad, da scartare? ',e,reader,file,fileObj);
                // se non supera la dimensione massima di 5Mb
                if(fileObj.filesize <= limit){
                    addToimages(fileObj);
                }
            }


            $scope.removeImage = function(index) {
                $scope.images.splice(index, 1);
            };

            //action to upload photos
            $scope.loadCamera = function(){
                Cameras.getPicture({
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.CAMERA,
                    quality: 70,
                    targetWidth: 800,
                    targetHeight: 800,
                    saveToPhotoAlbum: false
                }).then(function(imageURI) {
                    //  alert(imageURI);
                    addToimages(imageURI);
                }, function(err) {
                    $log.error(err);
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
                    addToimages(imageUri);
                }, function(err) {
                    console.log('error', err);
                });
            };


            function addToimages(image){
                // aggiungo l'immagine
                var data = 'data:';
                data = data.concat(image.filetype).concat(';base64,').concat(image.base64);
                $scope.images = data;
                // $log.debug('aggiunta immagine',$scope.images)
            }

            // // send photo to api
            $scope.resetimages = function() {
                //console.log("reset immagini");
                $scope.images = null;
            };

        }]
    }
});
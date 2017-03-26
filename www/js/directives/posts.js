/**
 * Created by drpollo on 25/03/2017.
 */
angular.module('firstlife.directives').directive('posts', ['$log', 'AuthService' , function ($log, AuthService) {
    return{
        restrict: 'E',
        scope: {
            marker:'='
        },
        template: '<post-editor id="marker.id" ng-if="user"></post-editor><post-list ng-if="marker.id" id="marker.id"></post-list>',
        link: function(scope, element, attrs){

            scope.$on('$destroy', function(e) {
                if(!e.preventEventPosts){
                    e.preventEventPosts = true;
                    delete scope;
                }
            });
            // controllo se loggato
            scope.user = AuthService.isAuth();

        }}
}]).directive('postEditor', ['$log' , 'AuthService', 'postFactory' , function ($log, AuthService, postFactory) {
    return{
        restrict: 'E',
        scope: {
            id: '='
        },
        templateUrl: '/templates/form/postEditor.html',
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
                $log.log('post: ',post);
                initPost();
                scope.loading = true;
                postFactory.createPost(scope.id, post).then(
                    function (results) {
                        $log.log('ok caricamento post',results);
                        // reset del form
                        scope.loading = false;
                    },
                    function (err){
                        $log.error('errore salvataggio post',err);
                        // ripristino il contenuto
                        restorePost(post);
                        scope.loading = false;
                    }
                );
            }
            // reset del form
            function initPost(){
                // init del post
                scope.post = {
                    title: '',
                    message: '',
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
                    tags:post.tags
                };
                scope.focus = false;
            }
        }
    };
}]).directive('postList',['$log', 'myConfig', 'postFactory', function ($log, myConfig, postFactory) {
    return {
        restrict:'EG',
        scope: {
            id: '=id'
        },
        templateUrl: '/templates/map-ui-template/postList.html',
        link:function(scope, element, attrs){
            scope.$on('$destroy', function(e) {
                if(!e.preventPostListEvent){
                    e.preventPostListEvent = true;
                    delete scope;
                }
            });
            $log.log('id',scope.id);
            initList();
            function initList(){
                postFactory.getPosts(scope.id).then(
                    function (results) {
                        $log.log('posts',results);
                        scope.posts = results;
                    },
                    function (err) {
                        $log.error(err);
                    }
                );
            }

        }
    }
}]).directive('post',['$log', 'myConfig', 'postFactory', function ($log, myConfig, postFactory) {
    return {
        restrict:'EG',
        scope: {
            post: '=post'
        },
        templateUrl: '/templates/map-ui-template/post.html',
        link:function(scope, element, attrs){
            scope.$on('$destroy', function(e) {
                if(!e.preventPostEvent){
                    e.preventPostEvent = true;
                    delete scope;
                }
            });

            // todo click on a picture

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
                    console.log('error'+ err);
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
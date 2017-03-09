angular.module('firstlife.directives', [])
    .directive('focusOn', function($timeout) {
          return function(scope, element, attr) {
              scope.$on(attr.focusOn, function(e) {
                  $timeout(function() {
                      scope.$apply(function () {
                        element[0].focus();
                    })
                  },250);
              });
           };
        })
    .directive('navbar',['$http','$log','$compile', 'AuthService', function($http,$log,$compile, AuthService){
        return{
            strict:'EG',
            replace: true,
            link: function(scope,ele,attrs,c){
                $log.debug('navbar',scope,ele,attrs,c);

                var errors = 0

                getNavBar();

                function getNavBar(){
                    if(errors > 3) {
                        return
                    }
                    var token = AuthService.token();
                    var url = token ? attrs.url.concat('&access_token=',token.access_token) : attrs.url;
                    $http.get(url).then(
                        function(response){
                            $log.debug('navbar, response',response);
                            ele.html(response.data);
                            $log.debug('navbar, html',ele);
                            $compile(ele.contents())(scope);
                        },
                        function(err){
                            // riprovo se il problema e' il token
                            if(err.status === 401){
                                errors++;
                                getNavBar();
                            }
                            $log.error(err);
                        }
                    );
                }

            }
        }
    }])
    .directive('validPin', ['$http', function($http) {
        return {
            require: 'ngModel',
            link: function(scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function(pinValue) {
                    // $http({
                    // 	method: 'POST',
                    // 	url: '/api/check/' + attrs.validPin,
                    // 	data: {'pin': attrs.validPin}
                    // }).success(function(data, status, headers, cfg) {
                    // 	c.$setValidity('valid-pin', data.isValid);
                    // }).error(function(data, status, headers, cfg) {
                    // 	c.$setValidity('valid-pin', false);
                    // });
                    if(pinValue=="12345")
                    {
                        c.$setValidity('valid-pin', true);
                    }
                    else
                    {
                        c.$setValidity('valid-pin', false);
                    }
                });
            }
        };
    }])
    .directive('isMobile', [ function() {
        return {
            link: function(scope, ele, attrs, c) {
                return (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
            }
        }
    }])
    .directive('showHide', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var anchor = angular.element('<a/>');
                anchor.addClass("toggle-view-anchor");
                anchor.text("SHOW");
                element.parent().append(anchor);

                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var toggle_view_anchor = this,
                        password_input = toggle_view_anchor.parentElement.querySelector('input[show-hide]'),
                        input_type = password_input.getAttribute('type');

                    if(input_type=="text")
                    {
                        password_input.setAttribute('type', 'password');
                        toggle_view_anchor.text = "SHOW";
                    }
                    if(input_type=="password")
                    {
                        password_input.setAttribute('type', 'text');
                        toggle_view_anchor.text = "HIDE";
                    }
                }, anchor);
            }
        };
    }])


    .directive('biggerText', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var text_element = document.querySelector(attrs.biggerText),
                        root_element = document.querySelector(".menu-content"),
                        current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
                        current_size = parseFloat(current_size_str),
                        new_size = Math.min((current_size+2), 24),
                        new_size_str = new_size + 'px';

                    root_element.classList.remove("post-size-"+current_size_str);
                    root_element.classList.add("post-size-"+new_size_str);
                }, element);
            }
        };
    }])
    .directive('smallerText', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var text_element = document.querySelector(attrs.smallerText),
                        root_element = document.querySelector(".menu-content"),
                        current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
                        current_size = parseFloat(current_size_str),
                        new_size = Math.max((current_size-2), 12),
                        new_size_str = new_size + 'px';

                    root_element.classList.remove("post-size-"+current_size_str);
                    root_element.classList.add("post-size-"+new_size_str);
                }, element);
            }
        };
    }])
    .directive('nxEqual', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqual) {
                console.error('nxEqual expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqual, function (value) {
                model.$setValidity('nxEqual', value === model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value === scope.$eval(attrs.nxEqual);
                model.$setValidity('nxEqual', isValid);
                return isValid ? value : undefined;
            });
        }
    };
})
    .directive('nxEqualEx', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqualEx) {
                console.error('nxEqualEx expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqualEx, function (value) {
                // Only compare values if the second ctrl has a value.
                if (model.$viewValue !== undefined && model.$viewValue !== '') {
                    model.$setValidity('nxEqualEx', value === model.$viewValue);
                }
            });
            model.$parsers.push(function (value) {
                // Mute the nxEqual error if the second ctrl is empty.
                if (value === undefined || value === '') {
                    model.$setValidity('nxEqualEx', true);
                    return value;
                }
                var isValid = value === scope.$eval(attrs.nxEqualEx);
                model.$setValidity('nxEqualEx', isValid);
                return isValid ? value : undefined;
            });
        }
    };
}).directive('standardTimeNoMeridian', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            etime: '=etime'
        },
        template: "<span>{{stime}}</span>",
        link: function(scope, elem, attrs) {
            scope.placeholder = attrs.placeholder;
            scope.stime = epochParser(scope.etime, 'time');

            function prependZero(param) {
                if (String(param).length < 2) {
                    return "0" + String(param);
                }
                return param;
            }

            function epochParser(val, opType) {
                if (val === null) {
                    if(scope.placeholder){
                        //console.log("placeholder? ",scope.placeholder);
                        return scope.placeholder;
                    }else
                        return "<span>00:00</span>";
                } else {
                    if (opType === 'time') {
                        var hours = parseInt(val / 3600);
                        var minutes = (val / 60) % 60;

                        return (prependZero(hours) + ":" + prependZero(minutes));
                    }
                }
            }

            scope.$watch('etime', function(newValue, oldValue) {
                scope.stime = epochParser(scope.etime, 'time');
            });

        }
    };
}).directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
}) .directive('pictureLoader',function(){
    return {
        restrict: 'EG',
        scope: {
            id:'=id',
            imageCache:'=images'
        },
        templateUrl: '/templates/form/pictureLoader.html',
        controller:['$scope','$log','$filter','$ionicLoading',function($scope,$log,$filter,$ionicloading){


            $scope.$on('$destroy', function(e) {
                if(!e.preventPictureLoader){
                    e.preventPictureLoader = true;
                    delete $scope;
                }
            });


            initLoader();

            if(!$scope.imageCache)
                $scope.imageCache = [];

            function initLoader(){

                $scope.file = '';
            }

            $scope.removeImage = function(index) {
                $scope.imageCache.splice(index, 1);
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
                    addToImageCache(imageURI);
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
                    addToImageCache(imageUri);

                }, function(err) {
                    console.log('error'+ err);
                });

            };


            // init form
            $scope.loader = {};
            var limit = 5000000;
            $scope.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
                $log.error('check onLoad, da scartare? ',e,reader,file,fileObj);
                // se non supera la dimensione massima di 5Mb
                if(fileObj.filesize <= limit){
                    addToImageCache(fileObj);
                }
            }

            function addToImageCache(image){
                // aggiungo le immagini alla cache, senza duplicati
                if($scope.imageCache.indexOf(image) < 0){
                    var data = 'data:';
                    data = data.concat(image.filetype).concat(';base64,').concat(image.base64);
                    $scope.imageCache.push(data);
                }
            }

            // send photo to api
            $scope.sendPhoto = function(entity_id,entity_type) {
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
                            $log.error('sendPhoto, errore',err);
                        });
                }

            };

            // send photo to api
            $scope.resetImageCache = function(markerId) {
                //console.log("reset immagini");
                $scope.imageCache = [];
                $scope.isPendingImages = false;

            };

        }]
    }
});
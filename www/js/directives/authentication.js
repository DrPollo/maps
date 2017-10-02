angular.module('firstlife.directives')
    .directive('registration',['$log','$window','AuthService', 'myConfig', function($log,$window,AuthService, myConfig){
        return{
            strict:'EG',
            replace: true,
            templateUrl:'./templates/buttons/signup.html',
            link:function(scope, element, attrs){
                scope.color = myConfig.design.default_colors;
                scope.goToSignUp = function(){$window.location.href = AuthService.registration_url();}
            }
        }
    }]).directive('login',['$window','$log','$location','AuthService', 'myConfig',function($window,$log,$location,AuthService, myConfig){
        return{
            strict:'EG',
            replace: true,
            templateUrl:'./templates/buttons/login.html',
            link:function(scope, element, attrs){
                scope.color = myConfig.design.default_colors;
                scope.doLogIn = function(){
                    $window.location.href = AuthService.auth_url();
                }
            }
        }
    }]).directive('logout',['$window','$log','$location','AuthService', function($window,$log,$location,AuthService){
        return{
            strict:'EG',
            replace: true,
            template:'<button class="button button-positive icon ion-log-in button-block" ng-click="doLogIn()">{{"LOGOUT"|translate}}</button>',
            link:function(scope, element, attrs){
                scope.doLogIn = function(){$window.location.href = AuthService.logout_url();}
            }
        }
    }]).directive('profile',['$window','$log','$location','AuthService', function($window,$log,$location,AuthService){
        return{
            strict:'EG',
            replace: true,
            template:'<button class="button button-positive icon ion-log-in button-block" ng-click="doLogIn()">{{"PROFILE"|translate}}</button>',
            link:function(scope, element, attrs){
                scope.doLogIn = function(){$window.location.href = AuthService.profile_url();}
            }
        }
    }])
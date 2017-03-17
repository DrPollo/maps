angular.module('firstlife.authentication', [])
    .directive('registration',['$log','$window','AuthService', function($log,$window,AuthService){
        return{
            strict:'EG',
            replace: true,
            template:'<button class="sign-up button button-block button-dark" ng-click="goToSignUp()">{{"SIGNUP"|translate}}</button>',
            link:function(scope, element, attrs){
                scope.goToSignUp = function(){$window.location.href = AuthService.registration_url();}
            }
        }
    }]).directive('login',['$window','$log','$location','AuthService', function($window,$log,$location,AuthService){
        return{
            strict:'EG',
            replace: true,
            template:'<button class="button button-positive button-block" ng-click="doLogIn()">{{"LOGIN"|translate}}</button>',
            link:function(scope, element, attrs){
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
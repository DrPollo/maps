angular.module('firstlife.directives', [])
    .directive('registration',['$http','$log','$compile','$location', function($http,$log,$compile,$location){
        return{
            strict:'EG',
            replace: true,
            template:"<ion-button>{{'SIGNUP'|translate}}</ion-button>",
            link:function(){
                
            }
        }
    }])
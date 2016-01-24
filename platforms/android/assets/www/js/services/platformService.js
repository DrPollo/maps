angular.module('firstlife.services')
    .service('PlatformService',[ function() {

        ionic.Platform.ready(function(){
            // will execute when device is ready, or immediately if the device is already ready.
        });
        
        return{
            
            isMobile: function() {return (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone()); },
            
            deviceInformation : function(){ return ionic.Platform.device();},
            
            isWebView : function(){ return ionic.Platform.isWebView();},
            
            isIPad : function(){ return ionic.Platform.isIPad();},
            
            isIOS : function(){ return ionic.Platform.isIOS();},
            
            isAndroid : function(){ return ionic.Platform.isAndroid();},
            
            isWindowsPhone : function(){ return ionic.Platform.isWindowsPhone();},
            
            currentPlatform : function(){ return ionic.Platform.currentPlatform();},
            currentPlatformVersion : function(){ return ionic.Platform.currentPlatformVersion();},

            exitApp : function() {return ionic.Platform.exitApp();}
        
        }

    }]);
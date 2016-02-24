angular.module('firstlife.factories')
    .factory('MemoryFactory', ['$rootScope', '$window', '$q', '$http', 'myConfig', function($rootScope, $window, $q, $http, myConfig) {

        self.config = myConfig;    

        self.keys = {user: 'user', token:'token', config:'config' };
         
        
        
        
        angular.element($window).on('storage', function(event) {
            //gestione utente
            if (event.key === keys.user) {
                $rootScope.$apply();
            }
            if (event.key === keys.token) {
                $rootScope.$apply();
            }
            // gestione configurazione
            if (event.key === keys.config) {
                $rootScope.$apply();
            }
        });

        return {
            // gestione utente
            saveUser: function(user) {
                // set variabile globale
                $rootScope.isLoggedIn = true;
                // salvo l'utente nello scope globale
                $rootScope.currentUser = user;
                // converto in stringa per la memoria
                var userJson = angular.toJson(user);
                if(self.config.dev)console.log("salvo l'utente ", userJson);
                $window.localStorage && $window.localStorage.setItem(keys.user, userJson);
                return this;
            },
            getUser: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.user)){
                    var user = $window.localStorage.getItem(keys.user);
                    if(self.config.dev)console.log("utente in memoria? ", user);
                    // se c'e' un utente in memoria
                    if(user && user != '' && user != 'undefined'){
                        // converto la stringa in oggetto
                        user = angular.fromJson(user);
                        // set variabile globale
                        $rootScope.isLoggedIn = true;
                        // salvo l'utente nello scope globale
                        $rootScope.currentUser = user;
                        if(self.config.dev)console.log("utente recuperato! ", user);
                        return user;
                    }
                }
                return null;  
            },
            readUser: function(){
                 // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.user)){
                    var user = $window.localStorage.getItem(keys.user);
                    if(self.config.dev)console.log("utente in memoria? ", user);
                    // se c'e' un utente in memoria
                    if(user && user != '' && user != 'undefined'){
                        // converto la stringa in oggetto
                        return angular.fromJson(user);
                    }
                }
                return null;
            },
            deleteUser: function() {
                // set variabile globale
                $rootScope.isLoggedIn = false;
                // cancello il currentUser dalla memoria globale
                delete $rootScope.currentUser;
                // azzero la memoria del browser
                return $window.localStorage && $window.localStorage.setItem(keys.user, '');
            },
            setToken: function(token) {
                if(self.config.dev)console.log("salvo il token: ", token);
                // imposto l'header delle chiamate http
                //$http.defaults.headers.common.Authentication = token;
                $window.localStorage && $window.localStorage.setItem(keys.token, token);
                return this;
            },
            getToken: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.token)){
                    var token = $window.localStorage.getItem(keys.token);
                    if(self.config.dev)console.log("MemoryFactory, getToken, token: ", token);
                    if(token == '')
                        return null;
                    //$http.defaults.headers.common.Authentication = token;
                    return token;
                }
                return null;  
            },
            deleteToken: function() {if(self.config.dev)console.log("MemoryFactory, deleteToken!");
                // $http.defaults.headers.common.Authentication = '';
                // azzero la memoria del browser
                return $window.localStorage && $window.localStorage.setItem(keys.token, '');
            },
            // fine gestione utente
            
            
            // gestione configurazione app
            saveConfig: function(val) {
                // set variabile globale
                $rootScope.isCachedConfig = true;
                // salvo l'utente nello scope globale
                $rootScope.config = val;
                // converto in stringa per la memoria
                var conf = angular.toJson(val);
                if(self.config.dev)console.log("salvo configurazione ", conf);
                $window.localStorage && $window.localStorage.setItem(keys.config, conf);
                return this;
            },
            getConfig: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.config)){
                    var conf = $window.localStorage.getItem(keys.config);
                    if(self.config.dev)console.log("confgirazione? ", conf);
                    // se la configurazione dell'app in memoria
                    if(conf && conf != '' && conf != 'undefined'){
                        // converto la stringa in oggetto
                        conf = angular.fromJson(conf);
                        // set variabile globale
                        $rootScope.isCachedConfig = true;
                        // salvo la configurazione nello scope globale
                        $rootScope.config = conf;
                        if(self.config.dev)console.log("Configurazione recuperata: ", conf);
                        return conf;
                    }
                }
                return null;  
            },
            deleteConfig: function() {
                // set variabile globale
                $rootScope.isCachedConfig = false;
                // cancello il config dalla memoria globale
                delete $rootScope.config;
                // azzero la memoria del browser
                return $window.localStorage && $window.localStorage.setItem(keys.config, '');
            }
            // fine gestione configurazione
            
        };

    }]).run(function($base64,myConfig){

        var sign = "firstlife-",
            url_base = myConfig.domain_signature;
        for (key in keys){
            keys[key] = sign.concat($base64.encode(keys[key].concat("-").concat(url_base)));
        }
        if(self.config.dev)console.log("MermoryFactory, config, applico la firma: ",keys);

});
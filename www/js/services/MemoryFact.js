angular.module('firstlife.factories')
    .factory('MemoryFactory', ['$rootScope', '$window', '$q', '$http', '$localStorage', 'myConfig', function($rootScope, $window, $q, $http, $localStorage, myConfig) {

        self.config = myConfig;    

        self.keys = {user: 'user', token:'token', config:'config' };
         
        
        var dev = true;
        
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
            save(key,data){
                $localStorage[key] = data;
            },
            get(key){
                return $localStorage[key];
            },
            delete(key){
                delete $localStorage[key];
            },
            
            
            // gestione utente
            saveUser: function(user) {
                // set variabile globale
                $rootScope.isLoggedIn = true;
                // salvo l'utente nello scope globale
                $rootScope.currentUser = user;
                // converto in stringa per la memoria
                var userJson = angular.toJson(user);
                $window.localStorage && $window.localStorage.setItem(keys.user, userJson);
                return this;
            },
            getUser: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.user)){
                    var user = $window.localStorage.getItem(keys.user);
                    // se c'e' un utente in memoria
                    if(user && user != '' && user != 'undefined'){
                        // converto la stringa in oggetto
                        user = angular.fromJson(user);
                        // set variabile globale
                        $rootScope.isLoggedIn = true;
                        // salvo l'utente nello scope globale
                        $rootScope.currentUser = user;
                        return user;
                    }
                }
                return null;  
            },
            readUser: function(){
                 // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.user)){
                    var user = $window.localStorage.getItem(keys.user);
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
                // imposto l'header delle chiamate http
                //$http.defaults.headers.common.Authorization = token;
                $window.localStorage && $window.localStorage.setItem(keys.token, token);
                return this;
            },
            getToken: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.token)){
                    var token = $window.localStorage.getItem(keys.token);
                    if(token == '')
                        return null;
                    //$http.defaults.headers.common.Authorization = token;
                    return token;
                }
                return null;  
            },
            deleteToken: function() {
                // $http.defaults.headers.common.Authorization = '';
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
                $window.localStorage && $window.localStorage.setItem(keys.config, conf);
                return this;
            },
            getConfig: function() {
                // se la memoria e' impostata
                if($window.localStorage && $window.localStorage.getItem(keys.config)){
                    var conf = $window.localStorage.getItem(keys.config);
                    // se la configurazione dell'app in memoria
                    if(conf && conf != '' && conf != 'undefined'){
                        // converto la stringa in oggetto
                        conf = angular.fromJson(conf);
                        // set variabile globale
                        $rootScope.isCachedConfig = true;
                        // salvo la configurazione nello scope globale
                        $rootScope.config = conf;
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

    }]);
angular.module('firstlife.services')

.service('UserService', ['$q', '$http', 'myConfig', 'jwtHelper', 'MemoryFactory', function($q, $http, myConfig, jwtHelper, MemoryFactory) {
    
    self.config = myConfig;
    
    var url = config.backend_users;
    var urlResetPassword = config.reset_password;
    var urlRetrievePassword = config.retrieve_password;
    var urlUpdate = config.update_user;
    var format = myConfig.format;
    
    var dev = true;
    
    
    return {
        getInfo: function() {
            var user = MemoryFactory.getUser();
            console.log("develop ",user);
            var urlId = url.concat("/").concat(user.username).concat(format);
            var deferred = $q.defer();
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"}
            };
            
            $http(req).then(
                function(response) {
                    if(dev) console.log("UserService, getInfo, response ",response);
                    deferred.resolve(response.data);
                },
                function(err){
                    deferred.reject(err);
                    console.log("UserService, getInfo, error ",err);
                });
            return deferred.promise;
        },
        
        login: function(mail, pw) {
            var urlId = url.concat("/login").concat(format);
            var deferred = $q.defer();
            var data = angular.toJson({ email: mail, password: pw }, true);
            
            //console.log("tentativo di login", urlId);
            
            var req = {
                url: urlId,
                method: 'POST',
                data: data,
                //skipAuthorization: true,
                // devo togliere gli header esplicitamente fintanto che il login e' una get (wp non supporta la chiamata preflight)
                headers:{"Content-Type":"application/json"}
            };
            
            $http(req)
                .then(
                function(response, status, headers, config) {
                    if(dev) console.log("UserService, login, response: ",response, response.headers);
                    var user = jwtHelper.decodeToken(response.headers.authorization);
                    deferred.resolve(user);
                    setUser(response.headers.authorization);
                },
                function(response) {
                    console.log("UserService, login, errore: ",response);
                    deferred.reject(response);
                });
            
            return deferred.promise;   
        },
        
        register: function(user){
            var deferred = $q.defer();
            var urlId = url.concat(format);
            var data = angular.toJson(user, true);
            var req = {
                url: urlId,
                method: 'POST',
                data: data,
                //skipAuthorization: true,
                headers:{"Content-Type":"application/json"}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                if(dev) console.log("UserService, register, response: ",response);
                deferred.resolve(response.data);
            },function(response) {
                console.log("UserService, register, errore: ",response);
                deferred.reject(response);
            });

            return deferred.promise;
        },
        logout: function(){
            MemoryFactory.deleteUser();
            MemoryFactory.deleteToken();
            MemoryFactory.deleteConfig();
            if(dev) console.log("cose rimaste in memoria: ", MemoryFactory.getConfig(), MemoryFactory.getToken(), MemoryFactory.getUser());
            return true;
        },
        
        update: function(user){
            var deferred = $q.defer();
            var urlId = url.concat(format);
            var data = angular.toJson(user, true);
            var token = MemoryFactory.getToken();
            
            var req = {
                url: urlId,
                method: 'PUT',
                data: data,
                headers:{"Content-Type":"application/json", Authorization:token}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                console.log("AuthServices, update, response: ",response);
                deferred.resolve(user);
            },function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },
        resetPassword: function(pass){
            var deferred = $q.defer();
            
            var token = MemoryFactory.getToken();
            
            var urlId = urlResetPassword.concat(format);
            var data = {};
            data.new_pass = pass;
            var user = MemoryFactory.readUser();
            data.id = user.id;
            data = angular.toJson(data, true);
            var req = {
                url: urlId,
                method: 'POST',
                data: data,
                headers:{"Content-Type":"application/json", Authorization:token}
            };
            console.log("UserService, resetPassword, request: ",req);
            $http(req)
            .then(function(response, status, headers, config) {
                console.log("UserService, resetPassword, response: ",response);
                var user = {};
                user = jwtHelper.decodeToken(response.headers.authorization);
                deferred.resolve(user);
                setUser(response.headers.authorization);
            },function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        },
        retrievePassword: function(email){
            var deferred = $q.defer();
            
            var urlId = urlRetrievePassword.concat(format).concat("?username=").concat(email);
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                //console.log("UserService, update, response: ",response);
                deferred.resolve(true);
            },function(response) {
                console.log("UserService, retrievePassword, error: ",response);
                deferred.reject(response);
            });

            return deferred.promise;
        }
    };
    
    
    /* 
     * Funzioni private 
     */
    
    function setUser(token){
        console.log("UserService, login/registration, setUser headers.Authorization: ",token);
        // salvo il token
        MemoryFactory.setToken(token);
        // decode token
        var user = jwtHelper.decodeToken(token);
        // salvo l'utente
        MemoryFactory.saveUser(user);
        console.log("UserService, login, utente: ",user);
        self.user = user;
        self.isLoggedIn = true;
    
        return user;
    };
    
    // todo 
    function deleteUser(){
    
    }
}]);
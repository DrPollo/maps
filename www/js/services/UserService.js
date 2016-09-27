angular.module('firstlife.services')

.service('UserService', ['$q', '$http', '$log', 'myConfig', 'jwtHelper', 'MemoryFactory', function($q, $http, $log, myConfig, jwtHelper, MemoryFactory) {
    
    self.config = myConfig;
    
    var url = config.backend_users;
    var urlOrganization = config.backend_organization;
    var urlResetPassword = config.reset_password;
    var urlRetrievePassword = config.retrieve_password;
    var urlUpdate = config.update_user;
    var format = myConfig.format;
    
    var dev = false;
    
    
    return {
        getInfo: function() {
            var user = MemoryFactory.get('user');
            console.log("develop ",user);
            var urlId = url.concat("/").concat(user.username).concat(format);
            if(user.type == 2){
                urlId = urlOrganization.concat("/").concat(user.id).concat(format);
            } 
            var deferred = $q.defer();
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"}
            };
            
            $http(req).then(
                function(response) {
                    deferred.resolve(response.data);
                },
                function(err){
                    deferred.reject(err);
                    $log.error("UserService, getInfo, error ",err);
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
                    var user = jwtHelper.decodeToken(response.headers.authorization);
                    $log.debug("token utente ",user);
                    deferred.resolve(user);
                    setUser(response.headers.authorization);
                },
                function(response) {
                    $log.error("UserService, login, errore: ",response);
                    deferred.reject(response);
                });
            
            return deferred.promise;   
        },
        
        register: function(user){
            var deferred = $q.defer();
            var urlId = url.concat(format);
            if(user.type == 2){
                urlId = urlOrganization.concat(format);
            } 
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
                deferred.resolve(response.data);
            },function(response) {
                console.log("UserService, register, errore: ",response);
                deferred.reject(response);
            });

            return deferred.promise;
        },
        logout: function(){
            MemoryFactory.delete('user');
            MemoryFactory.delete('token');
            MemoryFactory.delete('config');
            return true;
        },
        
        update: function(user){
            var deferred = $q.defer();
            var urlId = url.concat(format);
            if(user.type == 2){
                urlId = urlOrganization.concat(format);
            } 
            
            var data = angular.toJson(user, true);
            var token = MemoryFactory.get('token');
            
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
            
            var token = MemoryFactory.get('token');
            
            var urlId = urlResetPassword.concat(format);
            var data = {};
            data.new_pass = pass;
            var user = MemoryFactory.get('user');
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
            
            var urlId = urlRetrievePassword.concat('/').concat(email);
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                deferred.resolve(true);
            },function(response) {
                console.log("UserService, retrievePassword, error: ",response);
                deferred.reject(response);
            });

            return deferred.promise;
        },
        sendVerification: function(email){
            var deferred = $q.defer();
            
            var urlId = url.concat('/reverify/').concat(email);
            var req = {
                url: urlId,
                method: 'GET',
                headers:{"Content-Type":"application/json"}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                deferred.resolve(true);
            },function(response) {
                console.log("UserService, sendVerification, error: ",response);
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
        MemoryFactory.save('token',token);
        // decode token
        var user = jwtHelper.decodeToken(token);
        // salvo l'utente
        // calcolo il displayName
        if(user.displayName && user.displayName != ''){
            // ok
        }else if(user.type == 1 && user.first_name && user.last_name){
            user.displayName = user.first_name.concat(" ").concat(user.last_name);
        }else if(user.type == 2 && user.name){
            user.displayName = user.name;
        }else{
            user.displayName = 'User';
        }
        MemoryFactory.save('user',user);
        console.log("UserService, login, utente: ",user);
        self.user = user;
        self.isLoggedIn = true;
    
        return user;
    };
    
    // todo 
    function deleteUser(){
    
    }
}]);
angular.module('firstlife.services')

.service('UserService', ['$q', '$http', 'myConfig', 'jwtHelper', 'MemoryFactory', function($q, $http, myConfig, jwtHelper, MemoryFactory) {
    
    self.config = myConfig;
    
    var url = config.backend_users;
    var urlResetPassword = config.reset_password;
    var urlRetrievePassword = config.retrieve_password;
    var urlUpdate = config.update_user;
    var format = myConfig.format;
    
    
    return {
        
        login: function(mail, pw) {
            var urlId = url.concat("/login").concat(format);
            var deferred = $q.defer();
            var data = angular.toJson({ email: mail, password: pw }, true);
            
            //console.log("tentativo di login", urlId);
            
            var req = {
                url: urlId,
                method: 'POST',
                data: data,
                "transformResponse": function(response){console.log("transformResponse",response); return response;},
                //skipAuthorization: true,
                // devo togliere gli header esplicitamente fintanto che il login e' una get (wp non supporta la chiamata preflight)
                headers:{"Content-Type":"application/json","Access-Control-Expose-Headers":["Authorization"]}
            };
            
            $http(req)
                .then(
                function(response, status, headers, config) {
                    console.log("UserService, login, response: ",response, response.headers);
                    //var user = setUser(headers.Authentication);
                    
                    var user = setUser(headers.token);
                    deferred.resolve(user);
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
                console.log("UserService, register, response: ",response);
                if(response && response.data && response.data.token){
                    var user = setUser(response.data.token);
                    deferred.resolve(user);
                }else{
                    deferred.reject("Bug, errore ma con exit code 200");
                }
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
            console.log("cose rimaste in memoria: ", MemoryFactory.getConfig(), MemoryFactory.getToken(), MemoryFactory.getUser());
            return true;
        },
        
        update: function(user){
            var deferred = $q.defer();
            var urlId = urlUpdate.concat(format);
            var data = angular.toJson(user, true);
            var token = MemoryFactory.getToken();
            
            var req = {
                url: urlId,
                method: 'PUT',
                data: data,
                headers:{"Content-Type":"application/json", Authentication:token}
            };
            $http(req)
            .then(function(response, status, headers, config) {
                //console.log("AuthServices, update, response: ",response);
                var user = setUser(response.data.token);
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
                headers:{"Content-Type":"application/json", Authentication:token}
            };
            console.log("UserService, resetPassword, request: ",req);
            $http(req)
            .then(function(response, status, headers, config) {
                console.log("UserService, resetPassword, response: ",response);
                var user = {};
                user = setUser(response.data.token);
                deferred.resolve(user);
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
        console.log("UserService, login/registration, setUser headers.Authentication: ",token);
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
}]).factory('myInterceptor', ['$log', function($log) {  
    $log.debug('$log is here to show you that this is a regular factory with injection');

    var myInterceptor = {
        response: function(response) {
            console.log("intercept ", response, response.headers(),response.headers("content-type"), response.headers('Authorization'),response.headers('token'),response.headers('Authentication'));
            response.headers = response.headers();
            return response;
        }
    };

    return myInterceptor;
}]).config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('myInterceptor');
}]);
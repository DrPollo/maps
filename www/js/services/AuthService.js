angular.module('firstlife.services')
    .factory('AuthService', ['$log','$http','$q','myConfig','MemoryFactory','rx', function($log, $http, $q, myConfig, MemoryFactory,rx) {

        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        var tokenKey = myConfig.authentication.token_mem_key;
        //C: (P&(~Q))
        return {
            registration_url: function(){
                // chiamo per recuperare l'url di registrazione
                return myConfig.authentication["registration_url"];
            },
            auth_url: function(){
                // chiamo per recuperare l'url di registrazione
                var state = Math.random().toString(36).slice(2);
                MemoryFactory.save(stateKey,state);
                return myConfig.authentication["auth_url"].concat('&state=',state);
            },
            logout_url: function(){
                // mando lo user all'auth server per il logout
                return myConfig.authentication["logout_url"];
            },
            profile_url: function(){
                // mando lo user all'auth server per il logout
                return myConfig.authentication["profile_url"];
            },
            logout: function(){
                return MemoryFactory.delete(tokenKey);
            },
            token: function(){
                return MemoryFactory.get(tokenKey) || false;
            },
            generateToken: function (code){
                // richiedo il token al server
                var deferred = $q.defer();
                $log.debug('recupero il token con il code',code)
                var req = {
                    url: myConfig.authentication.token_url,
                    method: 'POST',
                    headers:{
                        "Content-Type":"application/json"
                    },
                    data: {code:code}
                };
                $http(req).then(function(response) {
                    MemoryFactory.save(tokenKey,response.data.token);
//                    $log.debug('getToken, response',MemoryFactory.get(tokenKey));
                    deferred.resolve(response);
                },function(err){
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            isAuth: function (){
                return (MemoryFactory.get(tokenKey)) ? true : false;
            },
            getUser: function (){
                return MemoryFactory.get(tokenKey).member;
            },
            logout: function (){
                var token = MemoryFactory.get(tokenKey);
                // chiamata a qualcuno per annullare il token corrente
                
                return MemoryFactory.delete(tokenKey);
            },
            checkPerms: function(source){

                var checkPerms = {};
                for(a in actions){
                    checkPerms[a] = checkAction(a,source,perms,actions);
                }
                if(dev) console.log("AuthService, perms ",source,perms,actions,checkPerms);
                return checkPerms;
            },
            checkPerm: function(action,source){
                if(dev) console.log("AuthService, perm ",action,source,perms,actions);

                return checkAction(action,source,perms,actions);
            }
        };


        function checkAction (action,source,perms,actions){

            var index = 2;
            switch(source){
                case 'self':
                    index = 0;
                    break;
                case 'group':
                    index = 1;
                    break;
                default:
                    index = 2;
            }
            var mask = perms[index];
            //console.log("AuthService, checkPerms, action e source ",action,source,mask);
            //console.log("Result (P&(notQ)) ",self.actions[action],(mask), (self.actions[action]&(mask)));

            return (actions[action]&(~mask));
        }

    }]).run(function(myConfig){
    // conversione da decimale a binario
    function dec2bin(dec){
        return (parseInt(dec) >>> 0).toString(2);
    }

    self.perms = [];
    self.perms[0]    = dec2bin(~(myConfig.behaviour.umask.toString()[0])).slice(-3);
    self.perms[1]    = dec2bin(~(myConfig.behaviour.umask.toString()[1])).slice(-3);
    self.perms[2]    = dec2bin(~(myConfig.behaviour.umask.toString()[2])).slice(-3);
    self.actions = {r:'100',u:'010',d:'001'};
    //console.log("AuthService, checkPerms, run ",myConfig.behaviour.umask, self.perms, self.actions);
});
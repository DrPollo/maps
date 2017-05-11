angular.module('firstlife.services')
    .factory('AuthService', ['$log','$http','$q','$ionicPopup','$filter','$window','$location','myConfig','MemoryFactory',function($log, $http, $q,$ionicPopup, $filter,$window, $location, myConfig, MemoryFactory) {

        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        var tokenKey = myConfig.authentication.token_mem_key;
        var identityKey = myConfig.authentication.identity_mem_key;


        var searchParams = $location.search();
        var embed = searchParams.embed || false;
        // $log.debug('embed?',embed);


        //C: (P&(~Q))
        return {
            checkSession: function(){
                // chiedo all'oauth server se c'e' un utente attivo nell'agent
                var deferred = $q.defer();
                // $log.debug('session url ',myConfig.authentication.api_session);
                if(!myConfig.authentication.api_session){
                    deferred.reject('undefined api_session');
                } else {
                    var req = {
                        url: myConfig.authentication.api_session,
                        method: 'POST',
                        // todo debug
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {}
                    };
                    $log.debug('check session ',req);
                    $http(req).then(function (response) {
                        $log.debug('check session', response.data);
                        // se devo controllare un parametro
                        if(myConfig.authentication.session_check){
                            if(response.data[myConfig.authentication.session_check]){
                                deferred.resolve(response.data[myConfig.authentication.session_check]);
                            }else
                                deferred.reject('no user logged in');
                        }else{
                            deferred.resolve(response.data);
                        }
                    }, function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            },
            doAction: function (action){
                if(MemoryFactory.get(tokenKey))
                    return action

                return loginToAct;
            },
            registration_url: function(){
                // chiamo per recuperare l'url di registrazione
                return myConfig.authentication["registration_url"];
            },
            auth_url: function(){
                // chiamo per recuperare l'url di registrazione
                return createAuthUrl();
            },
            logout_url: function(){
                // mando lo user all'auth server per il logout
                if(myConfig.authentication["logout_url"])
                    return myConfig.authentication["logout_url"].concat('&token=',MemoryFactory.get(tokenKey).access_token);
                return myConfig.base_callback+'?error=expiredtoken';
            },
            profile_url: function(){
                // mando lo user all'auth server per la modifica del profilo
                return myConfig.authentication["profile_url"];
            },
            signature_url: function(){
                // mando lo user all'auth server per la scelta della firma
                return myConfig.authentication["signature_url"];
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
                $log.debug('recupero il token con il code',code," con redirect uri",myConfig.authentication.redirect_uri_auth, 'a url: ',myConfig.authentication.token_url);
                var req = {
                    url: myConfig.authentication.token_url,
                    method: 'POST',
                    headers:{
                        "Content-Type":"application/json"
                    },
                    data: {
                        code:code,
                        redirect_uri:myConfig.authentication.redirect_uri_auth
                    }
                };
                $http(req).then(function(response) {
                    $log.debug('getToken, response',response);

                    var token = response.data.token;
                    token.member.member_id = token.member_id;
                    MemoryFactory.save(tokenKey,token);
                    MemoryFactory.save(identityKey,token.member);
                    // $log.debug('getToken, response',response,MemoryFactory.get(tokenKey));
                    deferred.resolve(response);
                },function(err){
                    $log.debug(err);
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            isAuth: function (){
                // $log.debug('isAuth?',(MemoryFactory.get(tokenKey) && !embed) ? true : false);

                return (MemoryFactory.get(tokenKey) && !embed) ? true : false;
            },
            getUser: function (){
//                $log.debug('getUser',MemoryFactory.get(tokenKey));
                return MemoryFactory.get(identityKey) ? MemoryFactory.get(identityKey) : null;
            },
            logout: function (){
                // cancello il token
                MemoryFactory.delete(tokenKey);
                return MemoryFactory.delete(tokenKey) && MemoryFactory.delete(identityKey);
            },
            checkPerms: function(source){

                var checkPerms = {};
                for(a in actions){
                    checkPerms[a] = checkUserPowers(a,source,perms,actions);
                }
//                if(dev) console.log("AuthService, perms ",source,perms,actions,checkPerms);
                return checkPerms;
            },
            checkPerm: function(action,source){
//                if(dev) console.log("AuthService, perm ",action,source,perms,actions);

                return checkUserPowers(action,source,perms,actions);
            }
        };


        // login to act opens a popup to redirect user to the login
        function loginToAct (){

            var confirmPopup = $ionicPopup.confirm({
                title: $filter('translate')('LOGIN_REQUIRED'),
                template: ('<center>').concat($filter('translate')('LOGIN_REQUIRED_MESSAGE')).concat('</center>'),
                buttons: [
                    { text: $filter('translate')('ABORT') },
                    {
                        text: $filter('translate')('LOGIN'),
                        type: 'button-positive',
                        onTap: function(e){
                            $window.location.href = createAuthUrl();
                        }
                    }
                ]
            });
        }

        function checkUserPowers (action,source,perms,actions){

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

        // costruisce l'url per l'authentication server
        function createAuthUrl(){
            // genera uno stato per verificare la chiamata di callback
            var state = Math.random().toString(36).slice(2);
            // salvo lo stato in memoria
            MemoryFactory.save(stateKey,state);
            // restituisco l'url al login con lo stato generato
            //$log.debug('url authentication',myConfig.authentication["auth_url"])
            return myConfig.authentication["auth_url"].concat('&state=',state);
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
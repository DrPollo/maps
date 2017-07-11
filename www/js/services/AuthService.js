angular.module('firstlife.services')
    .factory('AuthService', ['$log', '$http', '$q', '$ionicPopup', '$filter', '$window', '$location', 'myConfig', 'MemoryFactory', function ($log, $http, $q, $ionicPopup, $filter, $window, $location, myConfig, MemoryFactory) {

        var dev = myConfig.dev;
        var stateKey = myConfig.authentication.state_name;
        var tokenKey = myConfig.authentication.token_mem_key;
        var identityKey = myConfig.authentication.identity_mem_key;


        var searchParams = $location.search();
        var embed = searchParams.embed || false;
        // $log.debug('embed?',embed);

        //C: (P&(~Q))
        return {
            retrieveUser: function (token) {
                var deferred = $q.defer();

                if (!myConfig.authentication.userinfo) {
                    deferred.reject('no endpoint defined');
                    return deferred.promise;
                }

                if (!token) {
                    deferred.reject('no user to query');
                    return deferred.promise;
                }

                $log.debug('retrieveUser',myConfig.authentication.userinfo + "?access_token=" + token);

                var req = {
                    url: myConfig.authentication.userinfo + "?access_token=" + token,
                    method: 'GET',
                    data: false
                };
                $http(req).then(function (response) {
                    var member = response.data;
                    $log.debug('check token, response',member);
                    MemoryFactory.save(identityKey, member);
                    // salvo il token
                    MemoryFactory.save(tokenKey, {access_token: token, id: member.member_id+'@'+myConfig.authentication.auth_server_name });
                    deferred.resolve(member);
                }, function (err) {
                    $log.debug("check token",err);
                    // token non valido faccio logout
                    MemoryFactory.delete(identityKey);
                    MemoryFactory.delete(tokenKey);
                    deferred.reject(err);
                });

                return deferred.promise;
            },
            checkToken: function () {
                var deferred = $q.defer();
                // $log.debug('check token validity',!MemoryFactory.get(tokenKey),!myConfig.authentication.token_check);
                // se non ho token da controllare
                if (!MemoryFactory.get(tokenKey)) {
                    deferred.reject('no token to check');
                    return deferred.promise;
                }
                // se il servizio non e' definito
                if (!myConfig.authentication.token_check) {
                    deferred.reject('no check service');
                    return deferred.promise;
                }

                // $log.debug('check token validity');
                var token = MemoryFactory.get(tokenKey).access_token;
                var req = {
                    url: myConfig.authentication.token_check + "?access_token=" + token + '&auth_server=' + myConfig.authentication.auth_server_name,
                    method: 'GET',
                    data: false
                };
                $http(req).then(function (response) {
                    // $log.debug('check token, response',response);
                    deferred.resolve(response);
                }, function (err) {
                    // $log.debug("check token",err);
                    // token non valido faccio logout
                    MemoryFactory.delete(identityKey);
                    MemoryFactory.delete(tokenKey);

                    deferred.reject(err);
                });

                return deferred.promise;
            },
            checkSession: function () {
                // chiedo all'oauth server se c'e' un utente attivo nell'agent
                var deferred = $q.defer();
                // $log.debug('session url ',myConfig.authentication.api_session);
                if (!myConfig.authentication.api_session) {
                    deferred.reject('undefined api_session');
                } else {
                    var req = {
                        url: myConfig.authentication.api_session,
                        method: 'POST',
                        headers: false
                    };
                    // parametri extra di sessione
                    if (myConfig.authentication.session_params) {
                        angular.extend(req, myConfig.authentication.session_params);
                    }
                    console.log('check session ', req);
                    $http(req).then(function (response) {
                        // $log.debug('check session', response.data);
                        // se devo controllare un parametro
                        if (myConfig.authentication.session_check) {
                            if (response.data[myConfig.authentication.session_check]) {
                                deferred.resolve(response.data[myConfig.authentication.session_check]);
                            } else
                                deferred.reject('no user logged in');
                        } else {
                            deferred.resolve(response.data);
                        }
                    }, function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            },
            doAction: function (action) {
                if (MemoryFactory.get(tokenKey))
                    return action

                return loginToAct;
            },
            registration_url: function () {
                // chiamo per recuperare l'url di registrazione
                return myConfig.authentication["registration_url"];
            },
            auth_url: function () {
                // chiamo per recuperare l'url di registrazione
                return createAuthUrl();
            },
            logout_url: function () {
                // mando lo user all'auth server per il logout
                if (myConfig.authentication["logout_url"])
                    return myConfig.authentication["logout_url"].concat('&token=', MemoryFactory.get(tokenKey).access_token);
                return myConfig.base_callback + '?error=expiredtoken';
            },
            profile_url: function () {
                // mando lo user all'auth server per la modifica del profilo
                return myConfig.authentication["profile_url"];
            },
            signature_url: function () {
                // mando lo user all'auth server per la scelta della firma
                return myConfig.authentication["signature_url"];
            },
            logout: function () {
                MemoryFactory.delete(indentityKey);
                MemoryFactory.delete(tokenKey);
                return true;
            },
            token: function () {
                return MemoryFactory.get(tokenKey) || false;
            },
            saveToken: function (token) {
                if (!token || !token.member)
                    return false;
                MemoryFactory.save(tokenKey, token);
                MemoryFactory.save(identityKey, token.member);
                return true;
            },
            generateToken: function (code) {
                // richiedo il token al server
                var deferred = $q.defer();
                $log.debug('recupero il token con il code', code, " con redirect uri", myConfig.authentication.redirect_uri_auth, 'a url: ', myConfig.authentication.token_url);
                var req = {
                    url: myConfig.authentication.token_url,
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: {
                        code: code,
                        redirect_uri: myConfig.authentication.redirect_uri_auth,
                        client_id: myConfig.authentication.client_id
                    }
                };
                $http(req).then(function (response) {
                    $log.debug('getToken, response', response);

                    var token = response.data.token;
                    token.member.member_id = token.member_id;
                    MemoryFactory.save(tokenKey, token);
                    MemoryFactory.save(identityKey, token.member);
                    console.log('getToken, response', response, MemoryFactory.get(tokenKey));
                    deferred.resolve(response);
                }, function (err) {
                    $log.debug(err);
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            isAuth: function () {
                // $log.debug('isAuth?',(MemoryFactory.get(tokenKey) && !embed) ? true : false);

                return (MemoryFactory.get(tokenKey) && !embed) ? true : false;
            },
            getUser: function () {
//                $log.debug('getUser',MemoryFactory.get(tokenKey));
                return MemoryFactory.get(identityKey) ? MemoryFactory.get(identityKey) : null;
            },
            logout: function () {
                // cancello il token
                MemoryFactory.delete(tokenKey);
                MemoryFactory.delete(identityKey);
                return true;
            },
            checkPerms: function (source) {

                var checkPerms = {};
                for (a in actions) {
                    checkPerms[a] = checkUserPowers(a, source, perms, actions);
                }
//                if(dev) console.log("AuthService, perms ",source,perms,actions,checkPerms);
                return checkPerms;
            },
            checkPerm: function (action, source) {
//                if(dev) console.log("AuthService, perm ",action,source,perms,actions);

                return checkUserPowers(action, source, perms, actions);
            }
        };


        // login to act opens a popup to redirect user to the login
        function loginToAct() {

            var confirmPopup = $ionicPopup.confirm({
                title: $filter('translate')('LOGIN_REQUIRED'),
                template: ('<center>').concat($filter('translate')('LOGIN_REQUIRED_MESSAGE')).concat('</center>'),
                buttons: [
                    {text: $filter('translate')('ABORT')},
                    {
                        text: $filter('translate')('LOGIN'),
                        type: 'button-positive',
                        onTap: function (e) {
                            $window.location.href = createAuthUrl();
                        }
                    }
                ]
            });
        }

        function checkUserPowers(action, source, perms, actions) {

            var index = 2;
            switch (source) {
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

            return (actions[action] & (~mask));
        }

        // costruisce l'url per l'authentication server
        function createAuthUrl() {
            // genera uno stato per verificare la chiamata di callback
            var state = Math.random().toString(36).slice(2);
            // salvo lo stato in memoria
            MemoryFactory.save(stateKey, state);
            // restituisco l'url al login con lo stato generato
            //$log.debug('url authentication',myConfig.authentication["auth_url"])
            return myConfig.authentication["auth_url"].concat('&state=', state);
        }

    }]).run(function (myConfig) {
    // conversione da decimale a binario
    function dec2bin(dec) {
        return (parseInt(dec) >>> 0).toString(2);
    }

    self.perms = [];
    self.perms[0] = dec2bin(~(myConfig.behaviour.umask.toString()[0])).slice(-3);
    self.perms[1] = dec2bin(~(myConfig.behaviour.umask.toString()[1])).slice(-3);
    self.perms[2] = dec2bin(~(myConfig.behaviour.umask.toString()[2])).slice(-3);
    self.actions = {r: '100', u: '010', d: '001'};
    //console.log("AuthService, checkPerms, run ",myConfig.behaviour.umask, self.perms, self.actions);
});
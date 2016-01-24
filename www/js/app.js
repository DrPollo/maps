angular.module('underscore', [])
    .factory('_', function() {
    return window._; 
});


angular.module('firstlife', ['ionic', 'angularMoment', 'firstlife.config', 'firstlife.controllers', 'firstlife.directives', 'firstlife.filters', 'firstlife.services', 'firstlife.factories', 'underscore', 'leaflet-directive', 'ngResource', 'ngCordova', 'slugifier', 'ngTagsInput', 'ui.router',  'ionic.wizard', 'ionic-datepicker','ionic-timepicker', 'ngMessages', 'naif.base64', 'base64', 'angucomplete', 'angular-jwt', '720kb.tooltips', 'cbuffer','ct.ui.router.extras'])

    .run(function(myConfig, $rootScope, $ionicPlatform, $state, $stateParams, $location, $ionicPopup, $ionicConfig) {

    self.config = myConfig;
    // init utente
    $rootScope.isLoggedIn = false;

    
    
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });


    // supporto al routing tra stati
    $rootScope.previousState;
    $rootScope.currentState;
    self.logoutHandler = false;
    // da cancellare cache stati da usare per recuperare il redirect al login
    //self.cache = {};
    //self.cache.isStateCached = false;

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

        console.log("Changing state from ", fromState.name, " ...to... ", toState.name, " parametri di stato: ",$stateParams);
        // console.log($rootScope.currentUser);
        // aggiorno delle variabili sullo stato precendete e corrente
        // $state non traccia lo stato precedente quindi risolviamo con le variabili locali
        $rootScope.previousState = fromState.name;
        $rootScope.currentState = toState.name;
        var authenticate = toState.data.authenticate;
        console.log("is auth required? ",authenticate, " is auth requested?", config.behaviour.is_login_required );

        
        // se ti trovi in uno stato che richiede autenticazione e non sei loggato
        if (config.behaviour.is_login_required && authenticate && !$rootScope.isLoggedIn)  {
            // da cancellare self.cache.isStateCached = true;
            console.log("Salvo lo stato prima del login: ", $stateParams);
            event.preventDefault();
            var params = getJsonFromUrl($location.url().split("?")[1]);
            // vai a login per effettuare l'autenticazione
            $state.go('login',{action: 'redirect', from:toState.name, params: params});
        } else {
        
            console.log("Continuo a ", toState.name);
        
        }


        // se l'utente e' loggato ed esce dallo stato login
        // e non ho gia' creato il listner
        /*if(!self.logoutHandler && fromState.name == "login" && $rootScope.isLoggedIn) {
            // iscrivo un listner per prevenire il logout
            self.logoutHandler = true;
            self.onRouteChangeOff = $rootScope.$on('$locationChangeStart', function (event, next, current){
                if($rootScope.isLoggedIn && $location.path() == "/login"){
                    // console.log("cambio di location ", next, current);
                    // prevengo il logout involontario con un popup
                    // creazione del popup
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Logout',
                        template: 'Stai per effettuare il logout. Vuoi continuare?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            console.log("sono sicuro, vado a ", next);
                            onRouteChangeOff(); //disiscrivo il listner
                            self.logoutHandler = false;
                            //$location.path($location.url(next));
                            //instrado verso lo stato login specificando l'azione di logout
                            $state.go("login",{action:'logout'})
                        } else {
                            console.log("resto nello stato ", current);
                        }
                    });
                    //prevent navigation by default since we'll handle it
                    //once the user selects a dialog option
                    event.preventDefault();
                }
            }); 

        }
        */
        
    }); 
    
    // parser di url
    function getJsonFromUrl(query) {
        var result = {};
        
        if(query && query != null && query != 'undefined' && query != ''){
            query.split("&").forEach(function(part) {
                var item = part.split("=");
                result[item[0]] = decodeURIComponent(item[1]);
            });
        }
        
        return angular.toJson(result);
    }

})

    .config(function(myConfig, $stateProvider, $urlRouterProvider, $httpProvider, $provide) {
    self.config = myConfig;
    //console.log(self.config);
    $stateProvider

        .state('login', {
        url: "/login?action&from&params",
        controller: 'WalktroughCtrl as walktrough',
        templateUrl: "templates/walktrough.html",
        data: {
            authenticate: false
        }
    })

        .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/side-menu.html",
        controller: 'AppCtrl as app'
    })
        .state('app.maps', {
        url: "/maps?zoom&lat&lng&entity",
        reloadOnSearch: false, 
        views: {
            'menuContent': {
                templateUrl: "templates/maps.html",
                controller: 'MapCtrl as map'
            }
        },
        data: {
            authenticate: config.behaviour.is_login_required
        }
    })
        .state('app.editor', {
        // aggiunta dinamica di parametri presi dalle relazioni
        url: '/editor/?lat&lng&id&entity_type&group&'+config.types.relations.list.join('&'),
        views: {
            'menuContent': {
                templateUrl: 'templates/form/wizard.html',
                controller: 'EditorCtrl as editor'
            }
        },
        data: {
            authenticate: true
        }
    })
        .state('app.user', {
        url: '/user/?action',
        views: {
            'menuContent': {
                templateUrl: 'templates/form/userForm.html',
                controller: 'UserCtrl as user'
            }
        },
        data: {
            authenticate: true
        }
    });



    $urlRouterProvider.otherwise('/login');


    //error handler
    $provide.decorator("$exceptionHandler", ["$delegate", function($delegate){
        return function(exception, cause){
            $delegate(exception, cause);
            //alert(exception.message);
            console.log("EXCP: ", exception.message);
        }
    }]);




});

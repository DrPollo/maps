angular.module('firstlife', ['firstlife.config', 'firstlife.controllers', 'firstlife.directives', 'firstlife.filters', 'firstlife.services', 'firstlife.factories','firstlife.timeline', 'ionic', 'angularMoment',  'ui-leaflet', 'ngCordova', 'ngTagsInput', 'ui.router',  'ionic.wizard', 'ionic-datepicker','ionic-timepicker', 'ngMessages', 'angucomplete', 'cbuffer', 'pascalprecht.translate','ngStorage','naif.base64','angular-clipboard'])

    .run(function($rootScope, $ionicPlatform, $state, $stateParams, $location, $ionicPopup, $ionicConfig, $ionicLoading, $log, $window,$timeout, $filter, myConfig, AuthService) {

        self.config = myConfig;
        // init utente
        $rootScope.isLoggedIn = AuthService.isAuth();


        // fix callback
        myConfig.base_callback = $location.protocol().concat( "://" ,$location.host(),'/');
        var client_id = myConfig.authentication.client_id;
        var auth_server = myConfig.authentication.auth_server;

        var redirect_uri_auth = myConfig.base_callback.concat("callback");
        var redirect_uri_logout = myConfig.base_callback.concat("logout");

        $log.debug('auth server check',myConfig.authentication);

        myConfig.authentication["redirect_uri_auth"] = redirect_uri_auth;
        myConfig.authentication["redirect_uri_logout"] = redirect_uri_logout;
        myConfig.authentication["token_url"] = myConfig.domain_signature.concat("tokens/",auth_server);

        if(myConfig.authentication["auth_url"])
            myConfig.authentication["auth_url"] = myConfig.authentication.auth_url.concat("?redirect_uri=",redirect_uri_auth,"&response_type=code","&client_id=",client_id);
        if(myConfig.authentication.scopes && myConfig.authentication.scopes.length > 0){
            myConfig.authentication["scopes"] = myConfig.authentication.scopes.join('+');
            myConfig.authentication["auth_url"] = myConfig.authentication["auth_url"].concat("&scope=",myConfig.authentication["scopes"]);
        }

        if(myConfig.authentication["logout_url"])
            myConfig.authentication["logout_url"] = myConfig.authentication.logout_url.concat("?redirect_uri=",redirect_uri_logout,"&client_id=",client_id);

        if(myConfig.authentication["profile_url"])
            myConfig.authentication["profile_url"] = myConfig.authentication.profile_url.concat("?redirect_uri=",redirect_uri_auth,"&client_id=",client_id);

        if(myConfig.authentication["signature_url"])
            myConfig.authentication["signature_url"] = myConfig.authentication.signature_url.concat("?redirect_uri=",redirect_uri_auth,"&client_id=",client_id);

        if(myConfig.authentication.registration_url)
            myConfig.authentication["registration_url"] = myConfig.authentication.registration_url.concat("?redirect_uri=",redirect_uri_auth,"&client_id=",client_id);
        // fine fix callback


        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });


        // supporto al routing tra stati
        // $rootScope.previousState;
        // $rootScope.currentState;
        self.logoutHandler = false;
        // da cancellare cache stati da usare per recuperare il redirect al login
        //self.cache = {};
        //self.cache.isStateCached = false;
        // semaforo per autoLogin();
        // se non loggato provo una volta
        var tryAutoLogin = !AuthService.isAuth();

        // gestione errori http
        $rootScope.$on('expiredToken',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();

            $location.search('error',null);
            alertAuth('expired_token');
        });
        $rootScope.$on('authRequired',function (e) {
            if(e.defaultPrevented)
                return;
            e.preventDefault();

            $location.search('error',null);
            alertAuth('auth_required');
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

            if(!event.preventRedirectState){
                event.preventRedirectState = true;

                var authenticate = toState.data.authenticate;
                var search_params = $location.search();
                var embed = search_params.embed ? true : false;
                // tolgo i caricamenti
                $ionicLoading.hide();


                $log.debug("Changing state from ", fromState.name, " ...to... ", toState.name, " parametri di stato: ",search_params);

                $rootScope.previousState = fromState.name;

                // $log.debug('is auth?',AuthService.isAuth());
                if(tryAutoLogin && toState.name !== 'callback' && !search_params.code ){
                    tryAutoLogin = false;
                    autoLogin();
                }

                switch (toState.name){
                    case 'app.maps':
                        if(embed){
                            // ok vado avanti
                        } else if(authenticate && !AuthService.isAuth()){
                            $log.debug('login obbligatorio, redirect a home');
                            // vai a login per effettuare l'autenticazione
                            event.preventDefault();
                            $state.go('home',search_params);
                        }
                        break;
                    case 'home':
                        // if it is a viewer and it is not already going to the map
                        if(embed){
                            // go directly to the map
                            $log.debug('embed, redirect a app.maps');
                            event.preventDefault();
                            $state.go('app.maps',search_params);
                        }
                        break;
                    case 'app.editor':
                        if(authenticate && !AuthService.isAuth()){
                            $log.debug('login obbligatorio, redirect a home');
                            // vai a login per effettuare l'autenticazione
                            event.preventDefault();
                            $state.go('home',search_params);
                        }
                        break;
                    default:
                        //$log.debug("Continuo a ", toState.name);
                        // if it is a viewer and it is not already going to the map
                        if(embed){
                            // go directly to the map
                            $log.debug('embed, redirect a app.maps');
                            event.preventDefault();
                            $state.go('app.maps',search_params);
                        }
                }
            }
        });
        function autoLogin(){
            // se l'utente non e' loggato
            // controllo se posso fare l'autologin con l'auth server
            AuthService.checkSession().then(
                function (result) {
                    // l'utente e' attualmente loggato nell'auth server
                    $log.log('checkSession',result, 'go to ',AuthService.auth_url());
                    // redirect all'auth server
                    $timeout(function(){
                        $window.location.href = AuthService.auth_url();
                    },1);
                },
                function (err) {
                    // l'utente non e' loggato
                    // resta nella landing page
                }
            );
        }
        function alertAuth(type) {
            var title = '',
                text = '',
                buttons = [];
            switch (type){
                case 'expired_token':
                    title = 'EXPIRED_ERROR';
                    text = 'EXPIRED_ERROR_TEXT';
                    buttons = [
                        { text: $filter('translate')('GUEST') },
                        {
                            text: '<b>Login</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                confirmPopup.close();
                                $timeout(function(){
                                    $window.location.href = AuthService.auth_url();
                                },1);
                            }
                        }
                    ];
                    break;
                case 'auth_required':
                    title = 'AUTH_REQ_ERROR';
                    text = 'AUTH_REQ_ERROR_TEXT';
                    buttons = [
                        { text: $filter('translate')('ABORT') },
                        {
                            text: '<b>Login</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                confirmPopup.close();
                                $timeout(function(){
                                    $window.location.href = AuthService.auth_url();
                                },1);
                            }
                        }
                    ];
                    break;
                default:
                    title = 'ERROR';
                    text = 'SORRY_UNEXPECTED_ERROR';
                    buttons = [
                        {
                            text: $filter('translate')('Ok'),
                            type: 'button-positive'
                        }
                    ];
                    break;
            }

            $log.debug('alert errore',title,text);
            var confirmPopup = $ionicPopup.show({
                title: $filter('translate')(title),
                template: $filter('translate')(text),
                buttons: buttons
            });
            //
            confirmPopup.then(function(res) {
                if(res) {
                    // console.log('You are sure');

                } else {
                    // console.log('You are not sure');
                }
            });
        }

    }).config(function(myConfig, $stateProvider, $urlRouterProvider, $httpProvider, $provide) {
    self.config = myConfig;

    $stateProvider.state('home', {
        url: "/?embed&error",
        controller: 'LandingCtrl as landing',
        templateUrl: "/templates/landing-page.html",
        reloadOnSearch: true,
        data: {
            authenticate: false
        }
    }).state('callback', {
        url: "/callback?code&state&profile&error",
        controller: 'CallbackCtrl',
        templateUrl: "/templates/callback-page.html",
        reloadOnSearch: false,
        data: {
            authenticate: false
        }
    }).state('logout', {
        url: "/logout",
        controller: 'LogoutCtrl',
        templateUrl: "/templates/logout-page.html",
        reloadOnSearch: false,
        data: {
            authenticate: false
        }
    }).state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/side-menu.html",
        controller: 'AppCtrl as app'
    }).state('app.maps', {
        url: "/maps?c&entity&embed&date&unit&"+config.map.filters.map(function(e){return e.search_param;}).join('&'),
        reloadOnSearch: false,
        views: {
            'menuContent': {
                templateUrl: "/templates/maps.html",
                controller: 'MapCtrl as map'
            }
        },
        data: {
            authenticate: config.behaviour.is_login_required
        }
    }).state('app.editor', {
            // aggiunta dinamica di parametri presi dalle relazioni
            url: '/editor/?lat&lng&zoom_level&area_id&id&entity_type&group&rel&parent_type',
            views: {
                'menuContent': {
                    templateUrl: '/templates/form/wizard.html',
                    controller: 'EditorCtrl as editor'
                }
            },
            data: {
                authenticate: true
            }
        });



    $urlRouterProvider.otherwise('/');


    //error handler
    $provide.decorator("$exceptionHandler", ["$delegate", '$log', function($delegate,$log){
        return function(exception, cause){
            $delegate(exception, cause);
            //alert(exception.message);
            $log.error("EXCP: ", exception.message);
        }
    }]);

}).config(['$translateProvider','myConfig',function($translateProvider,myConfig){
    $translateProvider.translations('it', {
        LOGIN_REQUIRED:"Accesso necessario",
        LOGIN_REQUIRED_MESSAGE:"Per procedere è necessario effettuare l'accesso",
        SEACH_NO_RESULTS:'Nessun risultato...',
        GEOLOCATION_HINTS:'Cerca un indirizzo',
        SEARCH_HINTS:'Cerca per parola chiave',
        FILTER_HINTS:'Filtra per nome, categoria o tag...',
        ENTRIES:'risultati',
        BAD_REQUEST:"Errore! Contattare l'helpdesk",
        NOT_VALID_URL: 'URL non valido',
        EXIT_MESSAGE: "Uscire dall'applicazione?",
        EXIT_FROM:"Esci da",
        TYPES: 'Tipi',
        SEARCH: 'Cerca',
        ERROR: 'Errore',
        ERROR_LOGIN: 'Si è verificato un errore di autenticazione :( , uscire ed effettuare nuovamente il login',
        CONTENT: 'Contenuto',
        CREATED_BY:'pubblicato da',
        OF:'del',
        LOADING:'Caricamento',
        LOADING_MESSAGE:'Caricamento in corso...',
        SAVING_MESSAGE:'Salvataggio in corso...',
        UNKNOWN_ERROR: 'Errore sconosciuto. Controllare la connessione di rete e riprovare.',
        SIZE_ERROR:'La dimensione del file supera il limite consentito.',
        SUCCESS: 'Successo',
        SAVE_SUCCESS:'Salvataggio avvenuto con successo!',
        SUCCESS_MODARATION:"Invio avvenuto con successo: il contenuto verr&agrave; valutato per l'approvazione, verr&agrave; inviata una notifica con il risultato della valutazione.",
        REGISTRATION_SUCCESS: "Benvenuto! Prima di accedere controllare l'email per l'attivazione dell'account",
        USED_EMAIL:"Email già registrata. Per i nuovi account controllare l'email per il codice di attivazione, altrimenti effettuare il recupero password per accedere nuovamente.",
        SENDING_REQUEST:'Invio richiesta...',
        CHECK_EMAIL: "Controlla l'email con le istruzioni per il recupero della password.",
        LOGGIN_IN:'Accesso in corso...',
        // side-menu
        WELCOME: 'Ciao',
        WELCOME_MESSAGE: 'Benvenuto in',
        LANG: 'Lingua',
        PROFILE: 'Profilo',
        LOGIN:'Entra',
        LOGOUT:'Esci',
        EDIT_PROFILE:'Gestione profilo',
        EDIT_SIGNATURE:'Gestione Reti',
        EXPLORE: 'Esplora',
        MAP:'Mappa',
        HELP: 'Supporto',
        HELP_MESSAGE: 'Helpdesk',
        // modal filtri
        FILTERS: 'Filtri',
        // user form
        PROFILE_HEADER: 'Gestione profilo',
        TITLE:'Titolo',
        NAME:'Nome',
        LASTNAME:'Cognome',
        PASSWORD:'Password',
        CONTROLL_PASSWORD:'Conferma password',
        EDIT:'Modifica',
        ABORT:'Annulla',
        RESET:'Reset',
        SAVE:'Pubblica',
        // commentBox
        PUBLISH:'Pubblica',
        COMMENT_ALLERT:'Il tuo commento verrà pubblicato sul Web e sarà visibile a tutti.',
        ADD_ENTITY_ALLERT:'Il tuo contributo verrà pubblicato sul Web e sarà visibile a tutti.',
        COMMENT_TO:'Commento a',
        // menu edit
        CANCEL: 'Cancella',
        SUCCESS_CANCEL:"Cancellazione eseguita correttamente!",
        ERROR_CANCEL:"Cancellazione fallita: per favore, riprova in seguito!",
        // walktrhough
        SIGNUP: 'Iscriviti',
        EMAIL: 'E-mail',
        EMAIL_NOT_FOUND:'E-mail non registrata.',
        PASSWORD_RETRIEVE:'Recupera password',
        SIGNUP_MESSAGE:'Si riceverà una nuova password tramite e-mail',
        CLICKING:'Cliccando su',
        APPROVE:'dichiari di aver letto e di accettare le nostre',
        LICENSE_DISCLAIMER:'Eccetto dove diversamente specificato, i contenuti di questo sito sono rilasciati sotto',
        TERMS:"Condizioni d'uso",
        TERMS_LINK:'http://www.firstlife.org/wp-content/uploads/2016/02/Privacy-Policy_First_Life.pdf',
        LICENSE:'Licenza Creative Commons Attribuzione 3.0 Italia',
        LICENSE_LINK:'http://creativecommons.org/licenses/by/3.0/it/',
        PASSWORD_FORGOT:"Password dimenticata?",
        // wall
        WALL_HEADER:'Bacheca',
        // maps
        SEARCH_IN:'Cerca su',
        ALWAYS:'Sempre',
        EDITMODE_TOOLTIP:'Aggiungi un luogo o evento alla mappa',
        FILTERMODE_TOOLTIP:'Filtra per categoria',
        WALLMODE_TOOLTIP:'Mostra contenuto della mappa',
        ZONEMODE_TOOLTIP:"Aree d'interesse",
        TIMEFILTER_TOOLTIP:'Filtra per data',
        LOCATE_TOOLTIP: 'Trova la mia posizione',
        MENU:'Menu',
        TODAY:'Oggi',
        // wizard
        MANDATORY_FIELD:'Campo richiesto',
        BACK:'Indietro',
        NEXT:'Avanti',
        MORE_THAN_MESSAGE:'Il campo deve essere almeno di',
        LESS_THAN_MESSAGE:'Il campo non deve superare i',
        CHARACTERS:'caratteri',
        UPDATE:'Modifica',
        CREATE:'Creazione',
        // card place
        LAST_UPDATE_MESSAGE:'Ultima modifica il',
        BY_USER:'effettuata da',
        COMMENTS:'Commenti',
        COMMENT:'Commento',
        FROM:'Dal',
        TO:'Al',
        AT:'Alle',
        OF_TIME:'del',
        FROM_AT:'dalle',
        TO_AT:'alle',
        PERMALINK:'Permalink',
        CAMERA:'Camera',
        GALLERY:'Immagini',
        GALLERY_BUTTON:'Scegli dalla Galleria',
        FILE:'Carica file',
        PICTURE:'Foto',
        WHEN:'il',
        // myConfig entity properties
        DESCRIPTION:'Post',
        PLACE_NAME:'Luogo',
        FL_PLACES:'Luogo',
        EVENT_NAME:'Evento',
        FL_EVENTS:'Evento',
        POST_NAME:'Extra',
        FL_ARTICLES:'Extra',
        GROUPS_NAME:'Gruppo',
        FL_GROUPS:'Gruppo',
        COMMENT_NAME: "News",
        FL_NEWS: "News",
        CREATION_TEXT:'Cosa vuoi creare?',
        URL_LABEL:'Link esterno',
        URL_PLACEHOLDER:'URL esterno, es. http://www...',
        STARTDATE_LABEL:"Data d'inizio",
        STARTDATE_PLACEHOLDER:'Data inizio',
        ENDDATE_LABEL:'Data di fine',
        ENDDATE_PLACEHOLDER:'Data fine',
        TAGS_LABEL:'Tags',
        TAGS_PLACEHOLDER:'Tag, es. Palazzo, giardino, concerto...',
        GROUP:'Gruppo',
        GROUPS:'Gruppi',
        THUMBNAIL_LABEL:'Thumbnail',
        THUMBNAIL_PLACEHOLDER:'Immagine rappresentativa',
        USER:'Utente',
        USERS:'Utenti',
        CITIZEN:'Cittadino',
        ORGANIZATION:'Organizzazione',
        CF:'Codice fiscale o partita iva',
        PARENT_PLACE_LABEL:'Luogo contenitore',
        PARENT_PLACE_PLACEHOLDER:"All'interno di (luogo contenitore)",
        LOCATION_LABEL:'Luogo contenitore',
        LOCATION_PLACEHOLDER:"All'interno di (luogo contenitore)",
        DURATION_LABEL:"Orario di fine",
        DURATION_PLACEHOLDER:'Orario fine',
        DOORTIME_LABEL:"Orario d'inizio",
        DOORTIME_PLACEHOLDER:'Orario inizio',
        PARENT_EVENT_LABEL:'Evento contenitore',
        PARENT_EVENT_PLACEHOLDER:'Parte di (evento)',
        ATTENDEES_LABEL:'Partecipanti',
        ATTENDEES_PLACEHOLDER:'Persone che partecipano',
        PERFORMER_LABEL:'Esecutore',
        PERFORMER_PLACEHOLDER:'Artista, cantante, attore...',
        ORGANIZER_LABEL:'Organizzatore',
        ORGANIZER_PLACEHOLDER:"Organizzatore/responsabile dell'evento",
        ARTICLE_OF_LABEL:'Parla di',
        ARTICLE_OF_PLACEHOLDER:"Argomento dell'articolo",
        TEXT_LABEL:'Approfondimento',
        TEXT_PLACEHOLDER:"Contenuto dell'articolo...",
        COMMENT_OF_LABEL: "COMMENT_OF_LABEL",
        COMMENT_OF_PLACEHOLDER:"COMMENT_OF_LABEL",
        LEVEL_LABEL:"Piano/Livello",
        LEVEL_PLACEHOLDER:"es. 0 per livello della strada, 1 per primo piano, etc...",
        // myConfig entity relations
        REL_PARENT_ID_LABEL:'Parte di',
        REL_PARENT_ID_CHILD_LABEL:'Contiene',
        REL_LOCATION_LABEL:'Si tiene in',
        REL_LOCATION_CHILD_LABEL:'Ospita',
        REL_ARTICLE_OF_LABEL:'Parla di',
        REL_ARTICLE_OF_CHILD_LABEL:'Approfondimenti',
        REL_COMMENT_OF_LABEL:'Parla di',
        REL_COMMENT_OF_CHILD_LABEL:'Notizie',
        REL_BY_GROUP_LABEL:"Inserito da",
        REL_BY_GROUP_PLACE_CHILD_LABEL:"Luoghi",
        REL_BY_GROUP_EVENT_CHILD_LABEL:"Eventi",
        REL_BY_GROUP_POST_CHILD_LABEL:"Extra",
        REL_BY_GROUP_COMMENT_CHILD_LABEL:"News",
        REL_BY_GROUP_GROUP_CHILD_LABEL:"Sottogruppi",
        GROUP_FILTERING:'Gruppo ',
        USER_FILTERING:'Contenuti di ',
        SEARCH_FILTERING:'Ricerca:',
        MY_MAP:'La mia mappa',
        VIEW_GROUP:'Mappa',
        GENERAL_MAP:'Mappa generale',
        JOIN_GROUP:'Entra',
        LEAVE_GROUP:'Abbandona',
        'ACTIONS GROUPS_NAME':'Azioni Gruppo',
        'ACTIONS PLACE_NAME':'Azioni Luogo',
        'ACTIONS EVENT_NAME':'Azioni Evento',
        'ACTIONS COMMENT_NAME':'Azioni News',
        'ACTIONS POST_NAME':'Azioni Extra',
        ADD_CHILDREN:'Aggiungi a',
        MANAGE_USERS:'Gestisci membri',
        GROUP_MEMBERS:'Membri',
        GROUP_LEAVE:'Uscita dal gruppo',
        GROUP_LEAVE_ASK:'Sei sicuro di voler lasciare il gruppo?',
        ENTITY_SUBSCRIBE:'Segui',
        ENTITY_SUBSCRIBE_ASK:"D'ora in avanti riceverai notifiche sull'entità.",
        ENTITY_UNSUBSCRIBE:'Non seguire più',
        ENTITY_UNSUBSCRIBE_ASK:"Non riceverai più notifiche sull'entità.",
        GROUP_JOIN:'Entra nel gruppo',
        GROUP_JOIN_ASK:'Sei sicuro di voler entrare nel gruppo?',
        MESSAGE_PLACEHOLDER:'Messaggio',
        MESSAGE_LABEL:'Messaggio',
        DESCRIPTIONS:'Post',
        IMAGE:'Immagine',
        ADD_DESCRIPTION:'Aggiungi post',
        ADD_COMMENT:'Aggiungi commento',
        ADD_IMAGE:'Aggiungi immagine',
        TITLE:'Titolo',
        DELETE_ASK : 'Vuoi davvero cancellare questa entità?',
        DELETE:'Elimina',
        SEARCH_CRONOLOGY:'Cronologia ricerche',
        SEARCH_ENTITIES_RESULTS:'Risultato entità',
        SEARCH_LOCATIONS:'Stradario',
        CURRENTLY_ON_MAP:"Nell'area trovati ",
        NOTHING_TO_SEE:'Nulla da vedere...',
        SUBSCRIBE:'Segui',
        UNSUBSCRIBE:'Non seguire',
        NOTIFICATION_TITLE:'Notifiche',
        CHILD_ADDED:"aggiunto contenuto a",
        CHILD_REMOVED:"rimosso contenuto da",
        GROUP_ELEMENT_ADDED:"aggiunto al gruppo",
        GROUP_ELEMENT_REMOVED:"rimosso dal gruppo",
        THING_UPDATED:"ha aggiornato",
        ARTICLE_ADDED:"ha aggiunto approfondimento a",
        ARTICLE_REMOVED:"ha rimosso approfondimento da",
        DESCRIPTIONS_ADDED:"ha aggiunto descrizione a",
        DESCRIPTIONS_UPDATED:"ha modificato descrizione di",
        DESCRIPTIONS_DELETED:"ha cancellato descrizione da",
        COMMENTS_ADDED:"ha aggiunto commento a",
        COMMENT_ADDED:"ha aggiunto commento a",
        COMMENTS_UPDATED:"ha modificato commento di",
        COMMENT_UPDATED:"ha modificato commento di",
        COMMENTS_DELETED:"ha cancellato commento da",
        COMMENT_DELETED:"ha cancellato commento da",
        IMAGES_ADDED:"ha aggiunto immagine a",
        IMAGES_UPDATED:"ha modificato immagine di",
        IMAGES_DELETED:"ha cancellato immagine da",
        LAST_CHECK:"Aggiornato alle",
        GROUP_OF_LABEL:"Gruppo di",
        GROUP_OF_PLACEHOLDER:"Gruppo di",
        REL_GROUP_OF_LABEL:"Ospitato in",
        REL_GROUP_OF_CHILD_LABEL:"Ospita",
        HOUR_BUTTON:"Giorno",
        DAY_BUTTON:"Settimana",
        DATE_BUTTON:"Mese",
        YEAR_BUTTON:"Anno",
        EMAIL_NOT_VERIFIED:"Mail ancora non verificata. Inviare nuovamente il link di attivazione?",
        EMAIL_NOT_FOUND:"Email non trovata",
        WRONG_CREDENTIALS:"Credenziali errate. Effettuare il recupero password?",
        UNKOWN_ERROR:"Errore sconosciuto :( Provare più tardi.",
        LOGIN_ERROR:'Login fallito',
        GOT_IT:'Esci',
        SEND_MAIL_AGAIN:'Invia',
        VERIFICATION_SENT:'Mail di attivazione inviata!',
        RECOVER_LINK_SENT:"Inviata mail con le istruzioni per il recupero password.",
        RECOVER:"Recupera",
        PICTURE_DISCLAIMER:"La dimensione dell'immagine non deve superare 2 MB.",
        IMAGE_FORMATS:"Sono supportati i seguenti formati .jpg, .png e .gif",
        ADVANCED_TIME:"Gestione avanzata del tempo",
        EMBED_MAP: "Condividi",
        INFO_LABEL:"Info",
        INFO_PLACEHOLDER:"Informazioni utili, istruzioni, regole, etc...",
        CLOSE:"Chiudi",
        PASSWORD_CONFIRM_ERROR:"Le password non corrispondono",
        NIGHT:'Notte',
        MORNING:'Mattino',
        AFTERNOON:'Pomeriggio',
        EVENING:'Sera',
        UNKNOWN_LOGOUT_ERROR:"Un errore imprevisto previene il logout remoto",
        ALREADY_LOGOUT_ERROR:"Logout remoto già eseguito",
        LOGOUT_MESSAGE:"Logging out dal client...",
        DELETED_MARKER_TITLE:"Ops",
        DELETED_MARKER_MESSAGE:"Sembra che qualcuno abbia cancellato il contenuto che stavi guardando.",
        MEMBERS:"Membri del gruppo",
        REPORT_ERROR_FEEDBACK:"Ops! Un errore inatteso non ha reso possibile ricevere la tua segnalazione.",
        REPORT_SUCCESS_FEEDBACK:"La tua segnalazione è stata ricevuta.",
        REPORT_CONTENT:"Segnala",
        REPORT_CONTENT_MESSAGE:"Motivazione della segnalazione",
        REPORT_DISCLAIMER:"segnalando questo contenuto renderai publico che viola le <a href='http://firstlife.org/regole-comunita' target='_blank'>regole di comunità</a>, le <a href='http://firstlife.org/norme-privacy' target='_blank'>norme sulla privacy</a> o i <a href='http://firstlife.org/termini-uso' target='_blank'>termini d'uso</a>",
        REPORT:"Segnala",
        REPORT_MESSAGE:"il cotenuto contiene offese, minacce, messaggi violenti o riferimenti sessuali espliciti? Il contenuto è considerabile come spam o pubblicità? Il contenuto viola le norme di copyright?",
        DO_YOU_SIGNUP: "Non hai un account?",
        DO_YOU_LOGIN: "Hai già un account?",
        CALLBACK_TITLE: "Successo",
        UPDATE_PROFILE_SUCCESS: "Profilo aggiornato",
        POSTEDITOR_PLACEHOLDER: "vuoi aggiungere un tuo contribuito?",
        POSTEDITOR_TITLE_PLACEHOLDER: "vuoi dare un titolo?",
        POSTEDITOR_TAGS_PLACEHOLDER:"aggiungi dei tag separati da virgola o invio",
        LOAD_FOTO:"Carica Foto",
        CREATE_POST:"Crea un Post",
        POSTS: 'Post',
        CONTRIBUTE_OF: "Contributo di",
        COMMENTEDITOR_PLACEHOLDER:"Scrivi un commento...",
        DELETE_COMMENT: "Cancella il commento",
        REPORT_COMMENT: "Commento inappropriato",
        UPDATE_COMMENT: "Modifica commento",
        REPORT_POST: "Segnala post inappropriato",
        DELETE_POST: "Cancella il post",
        UPDATE_POST: "Modifica il post",
        CONTENTS: "Contenuti",
        ADDCHILD:"Aggiungi un contenuto",
        ADDPOST:"Aggiungi un post",
        NOCONTENTS_MESSAGE:"niente da leggere... :( ",
        POSTEDITOR_EX_REF_PLACEHOLDER: "Link URL esterno",
        POSTS_ADDED: "ha aggiunto un post in",
        INITIATIVES: "Iniziative",
        LINK_INITIATIVE:"Collega ad una iniziativa",
        LINK_TO:"Collega",
        CREATE_AND_LINK_TO: "Crea e Collega",
        INITIATIVE_FORM_PLACEHOLDER: "Trova o crea una nuova iniziativa...",
        CONNECTED_INITIATIVES: "Iniziative collegate",
        AVAILABLE_INITIATIVES:"Iniziative disponibili",
        SORRY_UNEXPECTED_ERROR:"Ops :( qualcosa si è rotto ...",
        AUTHOR:"Autore",
        LAST_AUTHOR:"Ultimo autore",
        LAST_UPDATE:"Ultimo aggiornamento",
        SUBSCRIBERS:"Seguono in",
        CURRENTLY_SEEYING: "In evidenza",
        city_block: "Isolato",
        site:"Area",
        ADMIN18:"Interni",
        ADMIN16:"Strada",
        ADMIN14:"Isolati",
        ADMIN13:"Quartieri",
        ADMIN10:"Distretti",
        ADMIN8:"Comuni",
        ADMIN6:"Province",
        ADMIN4:"Regioni",
        SCALE:"Scala",
        OPEN_THING:"Apri",
        CURRENT_SIGNATURE:"Firma in uso",
        SHARE_ALERT_TITLE:"Link a ",
        SHARE_ALERT_SUBTITLE: "Copia e condividi il seguente url",
        COPY:'Copia',
        USER_MENU_TOGGLE:'Apri/Chiudi menu utente',
        TOGGLE_WALL_TITLE:'Apri/Chiudi bacheca contenuti',
        POSTCOMMENTS_ADDED:'ha aggiunto un commento a',
        STEPS_OF: 'Passo',
        AUTH_REQ_ERROR:'Richiesta Autenticazione',
        AUTH_REQ_ERROR_TEXT:"Per continuare è richiesto il login",
        EXPIRED_ERROR:'Sessione scaduta',
        EXPIRED_ERROR_TEXT:'Continuare come Ospite o effettuare nuovamente il login?',
        GUEST:'Ospite'
    });
    $translateProvider.translations('en', {
        AUTH_REQ_ERROR:'Authentication Error',
        AUTH_REQ_ERROR_TEXT:"To continue please log in",
        EXPIRED_ERROR:'Session Expired',
        EXPIRED_ERROR_TEXT:'Do you wish to continue as Guest ore login?',
        GUEST:'Guest',
        STEPS_OF: 'Step',
        POSTCOMMENTS_ADDED:'added a comment to',
        TOGGLE_WALL_TITLE:'Toggle content wall',
        USER_MENU_TOGGLE:'Toggle user menu',
        LOGIN_REQUIRED:"Login reuired",
        LOGIN_REQUIRED_MESSAGE:"Logging in is required to proceed",
        SEACH_NO_RESULTS:'No results...',
        GEOLOCATION_HINTS:'Search an address',
        SEARCH_HINTS:'Search for a key word...',
        FILTER_HINTS:'Filter by name, category or tag...',
        ENTRIES:'entries',
        BAD_REQUEST:"Error! Please contact the helpdesk service",
        NOT_VALID_URL: 'Not valid url',
        EXIT_MESSAGE: "Do you really want to log out?",
        EXIT_FROM: "Leaving",
        TYPES: 'Types',
        SEARCH: 'Search',
        ERROR:'Error',
        ERROR_LOGIN: 'An authentication error occured :( please log out and login again.',
        CONTENT:'Content',
        CREATED_BY:'posted by',
        OF:'of',
        LOADING:'Loading',
        LOADING_MESSAGE:'Loading...',
        SAVING_MESSAGE:'Saving...',
        UNKNOWN_ERROR: 'An unknown error has occured, please check the connection and try again.',
        SIZE_ERROR:'File size excedes the limit.',
        SENDING_REQUEST:'Sending request...',
        CHECK_EMAIL: "Check the email box for the password recovery link.",
        SUCCESS: 'Success',
        SAVE_SUCCESS:'Stored!',
        SUCCESS_MODARATION:"The content is now pending waiting for approval.",
        REGISTRATION_SUCCESS: 'Welcome! Please check your email for the verification link before log in.',
        USED_EMAIL:'Email already used. Please check the email for the activation code for new accounts or use the recovery password link to change your password and recover your account.',
        LOGGIN_IN:'Loggin in...',
        // side-menu
        WELCOME: 'Hello',
        WELCOME_MESSAGE: 'Welcome in',
        LANG: 'Language',
        PROFILE: 'Profile',
        LOGIN:'Login',
        LOGOUT:'Logout',
        EDIT_PROFILE:'Edit profile',
        EDIT_SIGNATURE:'Edit Networks',
        EXPLORE: 'Explore',
        MAP:'Map',
        HELP: 'Helpdesk',
        HELP_MESSAGE: 'Helpdesk',
        // modal filtri
        FILTERS: 'Filters',
        // user form
        PROFILE_HEADER: 'Edit profile',
        TITLE:'Title',
        NAME:'Name',
        LASTNAME:'Lastname',
        PASSWORD:'Password',
        CONTROLL_PASSWORD:'Password confirmation',
        EDIT:'Edit',
        ABORT:'Abort',
        RESET:'Reset',
        SAVE:'Save',
        // commentBox
        PUBLISH:'Post',
        COMMENT_ALLERT:'Your comment will be published on the Web and will be visible to all.',
        ADD_ENTITY_ALLERT:'Your contribution will be published on the Web and will be visible to all.',
        COMMENT_TO:'Comment of',
        // menu edit
        CANCEL: 'Trash',
        SUCCESS_CANCEL:"Success: the content is no more!",
        ERROR_CANCEL:"Sorry, an error as occured, please try again later.",
        // walktrhough
        SIGNUP: 'Signup',
        EMAIL: 'Email',
        EMAIL_NOT_FOUND:'Email not found',
        PASSWORD_RETRIEVE:'Password retrieve',
        SIGNUP_MESSAGE:'An email with instructions will be sent.',
        CLICKING:'By clicking',
        APPROVE:'you confirm to have read and you agree to our',
        LICENSE_DISCLAIMER:'First Life concents are licensed under',
        TERMS:'Terms of Use',
        TERMS_LINK:'http://www.firstlife.org/wp-content/uploads/2016/02/Terms-of-use-of-FirstLife.pdf',
        LICENSE:'International Creative Commons 4.0 attribution',
        LICENSE_LINK:'https://creativecommons.org/licenses/by/4.0/',
        PASSWORD_FORGOT:"Forgot password?",
        // wall
        WALL_HEADER:'Wall',
        // maps
        SEARCH_IN:'Search in',
        ALWAYS:'Sempre',
        EDITMODE_TOOLTIP:'Aggiungi un luogo o evento alla mappa',
        FILTERMODE_TOOLTIP:'Filtra per categoria',
        WALLMODE_TOOLTIP:'Mostra contenuto della mappa',
        ZONEMODE_TOOLTIP:"Aree d'interesse",
        TIMEFILTER_TOOLTIP:'Filtra per data',
        LOCATE_TOOLTIP: 'Trova la mia posizione',
        MENU:'Menu',
        TODAY:'Today',
        // wizard
        MANDATORY_FIELD:'Required field',
        BACK:'Back',
        NEXT:'Next',
        MORE_THAN_MESSAGE:'The field must be longher than',
        LESS_THAN_MESSAGE:'The field must be shorter than',
        CHARACTERS:'characters',
        UPDATE:'Update',
        CREATE:'Create',
        // card place
        LAST_UPDATE_MESSAGE:'Last update',
        BY_USER:'by',
        COMMENTS:'Comments',
        COMMENT:'Comment',
        FROM:'From',
        AT:'At',
        FROM_AT:'From',
        TO_AT:'To',
        TO:'To',
        OF_TIME:'of',
        PERMALINK:'Permalink',
        CAMERA:'Camera',
        GALLERY:'Gallery',
        GALLERY_BUTTON:'Pick from Gallery',
        FILE:'Load file',
        PICTURE:'Picture',
        WHEN:'',
        // myConfig
        DESCRIPTION:'Description',
        PLACE_NAME:'Place',
        FL_PLACES:'Place',
        EVENT_NAME:'Event',
        FL_EVENTS:'Event',
        POST_NAME:'Extra',
        FL_ARTICLES:'Extra',
        GROUPS_NAME:'Group',
        FL_GROUPS:'Group',
        COMMENT_NAME: "News",
        FL_NEWS: "News",
        CREATION_TEXT:'What do you wish to create?',
        URL_LABEL:'External URL',
        URL_PLACEHOLDER:'URL link, ex. http://www...',
        STARTDATE_LABEL:"Start date",
        STARTDATE_PLACEHOLDER:'Data inizio',
        ENDDATE_LABEL:'End date',
        ENDDATE_PLACEHOLDER:'Data fine',
        TAGS_LABEL:'Tags',
        TAGS_PLACEHOLDER:'Tag, es. garden, concert, school...',
        GROUP:'Group',
        GROUPS:'Groups',
        THUMBNAIL_LABEL:'Thumbnail',
        THUMBNAIL_PLACEHOLDER:'Image',
        USER:'User',
        USERS:'Users',
        CITIZEN:'Citizen',
        ORGANIZATION:'Organization',
        CF:'VAT number',
        PARENT_PLACE_LABEL:'Belongs to',
        PARENT_PLACE_PLACEHOLDER:"Part of, inside (Belongs to)",
        LOCATION_LABEL:'Belongs to',
        LOCATION_PLACEHOLDER:"Inside (location)",
        DURATION_LABEL:"End time",
        DURATION_PLACEHOLDER:'End time',
        DOORTIME_LABEL:"Start time",
        DOORTIME_PLACEHOLDER:'Start time',
        PARENT_EVENT_LABEL:'Evento contenitore',
        PARENT_EVENT_PLACEHOLDER:'Part of (event)',
        ATTENDEES_LABEL:'Attendees',
        ATTENDEES_PLACEHOLDER:'Attendees',
        PERFORMER_LABEL:'Performer',
        PERFORMER_PLACEHOLDER:'Artist, singer, actor...',
        ORGANIZER_LABEL:'Organizer',
        ORGANIZER_PLACEHOLDER:"Organizer",
        ARTICLE_OF_LABEL:'About of',
        ARTICLE_OF_PLACEHOLDER:"Post topic",
        TEXT_LABEL:'Post',
        TEXT_PLACEHOLDER:"Post content...",
        COMMENT_OF_LABEL: "COMMENT_OF_LABEL",
        COMMENT_OF_PLACEHOLDER:"COMMENT_OF_LABEL",
        LEVEL_LABEL:"Level/Floor",
        LEVEL_PLACEHOLDER:"es. 0 for ground level, 1 for first floor, etc...",
        // myConfig entity relations
        REL_PARENT_ID_LABEL:'Part of',
        REL_PARENT_ID_CHILD_LABEL:'Contains',
        REL_LOCATION_LABEL:'Location',
        REL_LOCATION_CHILD_LABEL:'Hosts',
        REL_ARTICLE_OF_LABEL:'About of',
        REL_ARTICLE_OF_CHILD_LABEL:'Posts',
        REL_COMMENT_OF_LABEL:'About of',
        REL_COMMENT_OF_CHILD_LABEL:'News',
        REL_BY_GROUP_LABEL:"Posted by",
        REL_BY_GROUP_PLACE_CHILD_LABEL:"Places",
        REL_BY_GROUP_EVENT_CHILD_LABEL:"Events",
        REL_BY_GROUP_POST_CHILD_LABEL:"Extra",
        REL_BY_GROUP_COMMENT_CHILD_LABEL:"News",
        GROUP_FILTERING:'Group ',
        USER_FILTERING:'Contents of ',
        SEARCH_FILTERING:'Search:',
        MY_MAP:'My map',
        VIEW_GROUP:'Map',
        GENERAL_MAP:'General map',
        JOIN_GROUP:'Join',
        LEAVE_GROUP:'Leave',
        'ACTIONS GROUPS_NAME':'Group actions',
        'ACTIONS PLACE_NAME':'Place actions',
        'ACTIONS EVENT_NAME':'Event actions',
        'ACTIONS COMMENT_NAME':'News actions',
        'ACTIONS POST_NAME':'Extra actions',
        ADD_CHILDREN:'Add to',
        MANAGE_USERS:'Manage members',
        GROUP_MEMBERS:'Members',
        GROUP_LEAVE:'Leaving the group',
        GROUP_LEAVE_ASK:'Are you sure to leave the group?',
        ENTITY_SUBSCRIBE:'Follow',
        ENTITY_SUBSCRIBE_ASK:'You will receive notifications about the entity.',
        ENTITY_UNSUBSCRIBE:'Unfollow',
        ENTITY_UNSUBSCRIBE_ASK:'You will no longer receive notifications about the entity.',
        GROUP_JOIN:'Entra nel gruppo',
        GROUP_JOIN_ASK:'Sei sicuro di voler entrare nel gruppo?',
        MESSAGE_PLACEHOLDER:'Message',
        MESSAGE_LABEL:'Message',
        DESCRIPTIONS:'Descriptions',
        IMAGE:'Image',
        ADD_DESCRIPTION:'Add Description',
        ADD_COMMENT:'Add Comment',
        ADD_IMAGE:'Add Image',
        TITLE:'Title',
        DELETE_ASK: 'Do you really wish to delete the content?',
        DELETE:'Delete',
        SEARCH_CRONOLOGY:'Search history',
        SEARCH_ENTITIES_RESULTS:'Entity results',
        SEARCH_LOCATIONS:'Steet guide',
        CURRENTLY_ON_MAP:'Currently on map',
        NOTHING_TO_SEE:'Nothing to see...',
        SUBSCRIBE:'Follow',
        UNSUBSCRIBE:'Unfollow',
        NOTIFICATION_TITLE:'Notifications',
        CHILD_ADDED:'added to',
        CHILD_REMOVED:'removed from',
        GROUP_ELEMENT_ADDED:'added to group',
        GROUP_ELEMENT_REMOVED:'remouved from group',
        THING_UPDATED:'updated',
        ARTICLE_ADDED:'insight added to',
        ARTICLE_REMOVED:'insight removed from',
        DESCRIPTIONS_ADDED:"added description to",
        DESCRIPTIONS_UPDATED:'updated description to',
        DESCRIPTIONS_DELETED:'deleted description from',
        COMMENTS_ADDED:"added comment to",
        COMMENTS_UPDATED:'updated comment to',
        COMMENTS_DELETED:"deleted comment fom",
        COMMENT_ADDED:"added comment to",
        COMMENT_UPDATED:'updated comment to',
        COMMENT_DELETED:"deleted comment fom",
        IMAGES_ADDED:"added image to",
        IMAGES_UPDATED:'updatad image to',
        IMAGES_DELETED:"deleted image from",
        LAST_CHECK:"Updated at",
        GROUP_OF_LABEL:"Group of",
        GROUP_OF_PLACEHOLDER:"Group of",
        REL_GROUP_OF_LABEL:"Hosted in",
        REL_GROUP_OF_CHILD_LABEL:"Hosting",
        HOUR_BUTTON:"Day",
        DAY_BUTTON:"Week",
        DATE_BUTTON:"Month",
        YEAR_BUTTON:"Year",
        EMAIL_NOT_VERIFIED:"The email has to be verified. Send the activation email again?",
        EMAIL_NOT_FOUND:"Email not found",
        WRONG_CREDENTIALS:"Wrong email or password. Do you wish to recover your password?",
        UNKOWN_ERROR:"An unkown error occured :( Please try again later.",
        LOGIN_ERROR:'Login failed',
        GOT_IT:'Exit',
        SEND_MAIL_AGAIN:'Send',
        VERIFICATION_SENT:'Activation link sent!',
        RECOVER_LINK_SENT:"Password recover link sent!",
        RECOVER:"Recover",
        PICTURE_DISCLAIMER:"Picture size must not be greater than 2 MB.",
        IMAGE_FORMATS:"Supported formats: .jpg, .png and .gif",
        ADVANCED_TIME:"Advanced time setup",
        EMBED_MAP: "Share",
        INFO_LABEL:"Info",
        INFO_PLACEHOLDER:"Useful information, instructions, rules, etc.",
        CLOSE:"Close",
        PASSWORD_CONFIRM_ERROR:"Passwords do not match",
        NIGHT:'Night',
        MORNING:'Morning',
        AFTERNOON:'Afternoon',
        EVENING:'Evening',
        UNKNOWN_LOGOUT_ERROR:"An unknown error prevents the remote logout",
        ALREADY_LOGOUT_ERROR:"Already logged out from the remote server",
        LOGOUT_MESSAGE:"Logging out from the client...",
        DELETED_MARKER_TITLE:"Whops",
        DELETED_MARKER_MESSAGE:"Looks like someone deleted the content you where looking for.",
        MEMBERS:"Group members",
        REPORT_ERROR_FEEDBACK:"Whops! A unexpected error made impossible to receive your report.",
        REPORT_SUCCESS_FEEDBACK:"We got your report, we will check the entity soon.",
        REPORT_CONTENT:"Report",
        REPORT_CONTENT_MESSAGE:"Motivazione della segnalazione",
        REPORT_DISCLAIMER:"reporting this content you will make public that is violating the <a href='http://firstlife.org/community-standards' target='_blank'>community standards</a>, the <a href='http://firstlife.org/privacy-policy' target='_blank'>privacy policy</a> or the <a href='http://firstlife.org/terms-of-use' target='_blank'>terms of use</a>",
        REPORT:"Report",
        REPORT_MESSAGE_TITLE:"Motivation of the report",
        REPORT_MESSAGE:"the content containing offenses, threats, violent messages or explicit sexual references? Content is considerable as spam or advertising? The content violates the copyright laws?",
        DO_YOU_SIGNUP: "Don't you have an account?",
        DO_YOU_LOGIN: "Do you have an account?",
        CALLBACK_TITLE: "Success",
        UPDATE_PROFILE_SUCCESS: "Profile updated",
        POSTEDITOR_PLACEHOLDER: "do you have a contribute to share?",
        POSTEDITOR_TITLE_PLACEHOLDER: "do you wish to provide a title?",
        POSTEDITOR_TAGS_PLACEHOLDER:"add a tags separated by commas or return",
        LOAD_FOTO:"Load Picture",
        CREATE_POST:"Create a Post",
        POSTS: 'Post',
        CONTRIBUTE_OF: "Contribute of",
        COMMENTEDITOR_PLACEHOLDER:"Leave a comment...",
        DELETE_COMMENT: "Delete the comment",
        REPORT_COMMENT: "Report an abuse",
        UPDATE_COMMENT: "Update commento",
        REPORT_POST: "Report an abuse",
        DELETE_POST: "Delete the post",
        UPDATE_POST: "Update the post",
        CONTENTS: "Contents",
        ADDCHILD:"Add a child entity",
        ADDPOST:"Add a post",
        POSTEDITOR_EX_REF_PLACEHOLDER: "External URL reference",
        POSTS_ADDED: "added a post to",
        INITIATIVES: "Initiatives",
        LINK_INITIATIVE:"Link it to an initiative",
        LINK_TO: "Link",
        CREATE_AND_LINK_TO: "Create and Link",
        INITIATIVE_FORM_PLACEHOLDER: "Find or start a new initiative...",
        CONNECTED_INITIATIVES: "Connected initiatives",
        AVAILABLE_INITIATIVES:"Available initiatives",
        SORRY_UNEXPECTED_ERROR:"Sorry :( something broke up ...",
        AUTHOR:"Author",
        LAST_AUTHOR:"Last author",
        LAST_UPDATE:"Last update",
        SUBSCRIBERS:"Followers",
        CURRENTLY_SEEYING: "Lights on",
        city_block: "City Block",
        site:"Area",
        ADMIN18:"Indoor",
        ADMIN16:"Street",
        ADMIN14:"Blocks",
        ADMIN13:"Neighborhoods",
        ADMIN10:"Sectors",
        ADMIN8:"Towns",
        ADMIN6:"Districts",
        ADMIN4:"Regions",
        SCALE:"Scale",
        OPEN_THING:"Open",
        CURRENT_SIGNATURE:"Current signature",
        SHARE_ALERT_TITLE:"Link at ",
        SHARE_ALERT_SUBTITLE: "Copy and share the following url",
        COPY:'Copy'
    });
    //$translateProvider.preferredLanguage('en');
    $translateProvider.preferredLanguage(myConfig.design.default_language);
}])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(function($log,$localStorage,$q,$injector,$location,myConfig){
            // token di sviluppo
            // if(myConfig.dev){
            //     var devToken = {
            //         "access_token": "e4d55dd0998bcb0afd1767a0855ac8848c6f017e",
            //         "token_type": "Bearer",
            //         "expiration": "2017-03-03T09:53:37.619Z",
            //         "auth_server": "FIRSTLIFE",
            //         "member_id": "589dbba06685502f37156662",
            //         "member": {
            //             "first_name": "Alessio",
            //             "last_name": "Antonini",
            //             "username": "Alessio Antonini",
            //             "email": "aleyho@gmail.com",
            //             "rs_id": "58a82dc2b5db431b4531fa41",
            //             "id": "58a82dc2b5db431b4531fa41"
            //         }
            //     };
            //     $localStorage[myConfig.authentication.token_mem_key] = devToken;
            //     $localStorage[myConfig.authentication.identity_mem_key] = devToken.member;
            // }
            // fine dev
            if($localStorage[myConfig.authentication.token_mem_key]){
                $log.debug('Token: ','Bearer '+$localStorage[myConfig.authentication.token_mem_key].access_token);
            }
            var retries = 0,
                waitBetweenErrors = 1000,
                maxRetries = 3;
            // retry della chiamata
            function onResponseError(httpConfig) {
                // workaround per evitare controlli di circolarità delle dipendenze
                var $http = $injector.get('$http');
                // chiamata temporizzata
                return $http(httpConfig);
            }


            return {
                request: function(config) {
                    if(config.method !== 'GET'){
                        config.headers['Content-Type'] = 'application/json';
                        // inject del token nell'header se esiste
                        var token = $localStorage[myConfig.authentication.token_mem_key];
                        if(!token)
                           return config;
                        config.headers.Authorization = 'Bearer ' + token.access_token;
                        config.headers.Authentication_server = myConfig.authentication.auth_server_name;
                    }
                    // imposto il timeout delle chiamate
                    // console.debug('method', config.method);
                    if(config.method === 'GET'){
                        config.timeout = 2000;
                    }else{
                        config.timeout = 20000;
                    }
                    // $log.debug('request headers',config);
                    return config;
                },
                response: function(response) {
                    // hotfix bug
                    if(response.data.group_id){
                        response.data.id = response.data.group_id;
                    }
                    // passo gli headers a chi gestisce la chiamata
                    var headers = response.headers();
                    response.headers = headers;
                    return response;
                },
                responseError: function(rejection) {
                    // $log.debug('check $http error',rejection.status);

                    // gestione del token scaduto
                    if(rejection.status === 401 && rejection.data.token){
                        //                    $log.debug('nuovo token!', rejection)
                        var token = rejection.data.token;
                        // salvo il nuovo token
                        $localStorage[myConfig.authentication.token_mem_key] = token;
                    }else if(rejection.status === 401){
                        $localStorage[myConfig.authentication.token_mem_key] = null;
                        $localStorage[myConfig.authentication.identity_mem_key] = null;
                    }


                    // auth required
                    if(rejection.status === 400){
                        var $rootScope = $injector.get('$rootScope');
                        // $log.debug('reject because missing auth_token');
                        retries = 0;
                        // notifico al client l'errore
                        $location.search('error','auth_required');
                        $rootScope.$broadcast('authRequired');
                        return $q.reject(rejection);
                    }

                    // invalid token
                    if(rejection.status === 401){
                        var $rootScope = $injector.get('$rootScope');
                        // $log.debug('reject because invalid token');
                        // cancello il token
                        $localStorage[myConfig.authentication.token_mem_key] = null;
                        // notifico al client l'errore
                        $location.search('error','expired_token');
                        $rootScope.$broadcast('expiredToken');
                        // reset delle try
                        retries = 0;
                        // reject
                        return $q.reject(rejection);
                    }


                    // gestione errori: in caso di errore ritento maxRetries volte
                    if(retries < maxRetries) {
                        //                    $log.debug('retries',retries)
                        // aumento il contatore dei tentativi
                        retries ++;
                        // retry
                        return onResponseError(rejection.config);
//                        return $q.reject(rejection);
                    }
                    // reset del contatore dei tentativi
                    retries = 0;
                    // reject finale della chiamata 
                    return $q.reject(rejection);
                }

            }
        });
    }]).config(['$compileProvider','myConfig', function ($compileProvider,myConfig) {
    if(!myConfig.debug) $compileProvider.debugInfoEnabled(false);
}]);
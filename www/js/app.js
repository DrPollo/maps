angular.module('underscore', [])
    .factory('_', function() {
    return window._; 
});


angular.module('firstlife', ['ionic', 'angularMoment', 'firstlife.config', 'firstlife.controllers', 'firstlife.directives', 'firstlife.filters', 'firstlife.services', 'firstlife.factories','firstlife.timeline', 'firstlife.entitylist', 'firstlife.searchbox','firstlife.authentication', 'underscore', 'leaflet-directive', 'ngResource', 'ngCordova', 'slugifier', 'ngTagsInput', 'ui.router',  'ionic.wizard', 'ionic-datepicker','ionic-timepicker', 'ngMessages', 'naif.base64', 'base64', 'angucomplete', 'angular-jwt', '720kb.tooltips', 'cbuffer','ct.ui.router.extras', 'pascalprecht.translate','angular-toArrayFilter','ngAnimate','rx', 'ngStorage'])

    .run(function($rootScope, $ionicPlatform, $state, $stateParams, $location, $ionicPopup, $ionicConfig, $ionicLoading, $log, myConfig, AuthService) {

    self.config = myConfig;
    // init utente
    $rootScope.isLoggedIn = AuthService.isAuth();



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
        if(!event.preventRedirectState){
            event.preventRedirectState = true;
            var authenticate = toState.data.authenticate;
            var search_params = $location.search(); 
            var params = getJsonFromUrl($location.url().split("?")[1]);
            var embed = search_params.embed ? true : false;
            $ionicLoading.hide();

            $log.info("Changing state from ", fromState.name, " ...to... ", toState.name, " parametri di stato: ",search_params);
            // aggiorno delle variabili sullo stato precendete e corrente
            // $state non traccia lo stato precedente quindi risolviamo con le variabili locali
            $rootScope.previousState = fromState.name;
            $rootScope.currentState = toState.name;

            //            $log.debug("is auth required? ",authenticate, " is auth requested?", config.behaviour.is_login_required, search_params, params );
            $log.info('vado a login? ',config.behaviour.is_login_required && authenticate && !$rootScope.isLoggedIn && !embed)

            // se ti trovi in uno stato che richiede autenticazione e non sei loggato
            if (config.behaviour.is_login_required && authenticate && AuthService.isAuth() && !embed)  {
                $log.info("Salvo lo stato prima del login: ", $stateParams);
                event.preventDefault();
                // vai a login per effettuare l'autenticazione
                $state.go('home');
            } if(embed && toState.name !='app.maps'){ // se in modalita' embed faccio redirect alla mappa
                $state.go('app.maps',search_params);
            }else {

                $log.info("Continuo a ", toState.name);

            }
        }
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

}).config(function(myConfig, $stateProvider, $urlRouterProvider, $httpProvider, $provide) {
    self.config = myConfig;

    $stateProvider.state('home', {
        url: "/?embed",
        controller: 'LandingCtrl as landing',
        templateUrl: "templates/landing-page.html",
        reloadOnSearch: false, 
        data: {
            authenticate: false
        }
    }).state('callback', {
        url: "/callback?code&state",
        controller: 'CallbackCtrl as callback',
        templateUrl: "templates/callback-page.html",
        reloadOnSearch: false, 
        data: {
            authenticate: false
        }
    }).state('logout', {
        url: "/logout",
        controller: 'LogoutCtrl',
        templateUrl: "templates/logout-page.html",
        reloadOnSearch: false, 
        data: {
            authenticate: false
        }
    }).state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/side-menu.html",
        controller: 'AppCtrl as app'
    })
        .state('app.maps', {
        url: "/maps?zoom&lat&lng&entity&embed&"+config.map.filters.map(function(e){return e.search_param;}).join('&'),
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
        url: '/editor/?lat&lng&zoom_level&id&entity_type&group&rel&parent_type',
        views: {
            'menuContent': {
                templateUrl: 'templates/form/wizard.html',
                controller: 'EditorCtrl as editor'
            }
        },
        data: {
            authenticate: true
        }
    }).state('app.manager', {
        url: '/manager/?entity',
        views: {
            'menuContent': {
                templateUrl: 'templates/manager.html',
                controller: 'ManagerCtrl'
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
        GEOLOCATION_HINTS:'Cerca un indizzo',
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
        LOGIN:'Accedi',
        LOGOUT:'Esci',
        EDIT_PROFILE:'Modifica profilo',
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
        EVENT_NAME:'Evento',
        POST_NAME:'Extra',
        GROUPS_NAME:'Gruppo',
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
        COMMENT_NAME: "News",
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
        EMBED_MAP: "Esporta",
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
        MEMBERS:"Membri del gruppo"
    });
    $translateProvider.translations('en', {
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
        EVENT_NAME:'Event',
        POST_NAME:'Extra',
        GROUPS_NAME:'Group',
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
        COMMENT_NAME: "News",
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
        EMBED_MAP: "Export embed url",
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
        MEMBERS:"Group members"
    });
    //$translateProvider.preferredLanguage('en');
    $translateProvider.preferredLanguage(myConfig.design.default_language);
}])
    .config(['$httpProvider', function($httpProvider) {  
        $httpProvider.interceptors.push(function($log,$localStorage,$q,$injector,myConfig){
            // test test test
            // var devToken = {
            //     "access_token": "85de3ac93463bc0aea1e77b8c8b214b4d0442f06",
            //     "token_type": "Bearer",
            //     "expiration": "2017-03-03T09:53:37.619Z",
            //     "auth_server": "FIRSTLIFE",
            //     "member_id": "589dbba06685502f37156662",
            //     "member": {
            //         "first_name": "Alessio",
            //         "last_name": "Antonini",
            //         "username": "Alessio Antonini",
            //         "email": "aleyho@gmail.com",
            //         "rs_id": "58a82dc2b5db431b4531fa41",
            //         "id": "58a82dc2b5db431b4531fa41"
            //     }
            // };
            // if(true) $localStorage[myConfig.authentication.token_mem_key] = devToken;
            // if(true) $localStorage[myConfig.authentication.identity_mem_key] = devToken.member;
            // test test test


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
                    // inject del token nell'header se esiste
                    var token = $localStorage[myConfig.authentication.token_mem_key];
                    //                var token = {access_token:"5d92b662faa060bcbd306886e38a12322069fc99"};
//                    console.log('token',$localStorage[myConfig.authentication.token_mem_key]);
                    // se il token esiste lo setto
                    if (token && config.method != 'GET')  {
                        config.headers.Authorization = 'Bearer ' + token.access_token;
                        config.headers.Authentication_server = myConfig.authentication.auth_server_name;
                    }
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
//                    $log.debug('check $http error',rejection.status)

                    // gestione del token scaduto
                    if(rejection.status === 401 && rejection.data.token){
                        //                    $log.debug('nuovo token!', rejection)
                        var token = rejection.data.token;
                        // salvo il nuovo token
                        $localStorage[myConfig.authentication.token_mem_key] = token;
                    }

                    if(rejection.status === 400 || rejection.status === 404){
//                        $log.debug('reject because missing auth_token')
                        retries = 0;
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
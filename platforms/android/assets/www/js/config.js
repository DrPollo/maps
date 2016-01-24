angular.module('firstlife.config')

    .constant('myConfig', {
    // modalita' dev o produzione
    'dev': true,
    'project': 1,
    'api_base_domain' : 'firstlife-dev.di.unito.it/api/index.php/api/',
    //'api_base_domain' : 'vps129509.ovh.net/torinfony/api/',
    'api_version' : 'v3',
    'ssl': false,
    'version': '0.3.1',

    // nome progetto e dominio ! attenzione il dominio va aggiunto negli url domains/<domain_id>/
    'defaults':{
        'app_name' : 'FirstLife',
        'domain_name' : 'firstlife',
        'domain_id' : 1,
        'types' : {
            default: {slug:'place',id:1,icon:'ion-location',
                      properties:{
                          'name':{ key: 'name', label: 'Nome', placeholder: 'Nome', required:true },
                          'description':{ key: 'description', label: 'Descrizione', placeholder: 'Descrizione', required:true },
                          'link_url':{ key: 'link_url', label: 'Collegamento esterno', placeholder: 'http://www...'},
                          'valid_from':{ key: 'valid_from', label: "Data d'inizio",placeholder:"Data inizio"},
                          'valid_to':{ key: 'valid_to', label: "Data di fine",placeholder:"Data fine"},
                          'tags':{ key: 'tags', label:"Tags", placeholder:"Tag, es. Palazzo, giardino, concerto..."},
                          'categories':{ key: 'categories', label:"Categoria",},
                          'group_id':{ key: 'group_id', label:"Gruppo",placeholder:"Gruppo"},
                          'thumbnail':{ key: 'thumbnail', label:"Thumbnail",placeholder:"Immagine rappresentativa"},
                          'user':{ key: 'user', label:"Utente",placeholder:"Utente"},
                          'wp_id':{ key: 'wp_id', required:true },
                          'id':{ key: 'id', required:false },
              }
                     },
            list:[
                {name:'Luogo',id:1,icon:'ion-location',slug:'place',url:'places',key:'FL_PLACES',
                    properties:{
                        'parent':{ key: 'parent', label: "Luogo contenitore", placeholder:"All'interno di (luogo contenitore)"}
                    },
                    relations:{'FL_PLACES':{slug:'parent',field:'parent_id',label:'Parte di',childrenLabel:'Contiene'},'FL_EVENTS':{slug:'location',field:'location',label:'Si tiene in',childrenLabel:'Ospita'}}
                },
                {name:'Evento',id:2,icon:'ion-calendar',slug:'event',url:'events',key:'FL_EVENTS',
                        properties:{
                            'location':{ key: 'location', label: "Luogo contenitore", placeholder:"All'interno di (luogo contenitore)"},
                            'duration':{ key: 'duration', label: "Orario di fine", placeholder:"Orario fine"},
                            'door_time':{ key: 'door_time', label: "Orario d'inizio", placeholder:"Orario inizio"},
                            'parent_id':{ key: 'parent_id', label: "Evento contenitore", placeholder:"Parte di (evento)"},
                            'attendees':{ key: 'attendees', label: "Partecipanti", placeholder:"Persone che partecipano"},
                            'performer':{ key: 'performer', label: "Esecutore", placeholder:"Artista, cantante, attore...."},
                            'organizer':{ key: 'organizer', label: "Organizzatore", placeholder:"Organizzatore/responsabile dell'evento"},
                        },
                        relations:{'FL_EVENTS':{slug:'parent',field:'parent_id',label:'Parte di',childrenLabel:'Contiene'}}
                       }
            ]
        },
        'design':{
            'logo' : {url: 'img/logo-fl.png', title: 'FirstLife', alt:'FirstLife', label:{text: 'FirstLife', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
            'logo_bar' : 'img/logo-firstlife-sm.png',
            'logo_menu' : 'img/logo.png',
            'logo_width' : 160,
            'logo_height' : 160,
            'default_thumb' : 'img/thumb.jpg',
            'default_background' : 'img/torino1.jpg', 
            'logo_partners' : [],
            'colors' : ['rgba(246,213,59, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(221,91,42, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(61,131,97, 1)','rgba(136,186,92, 1)'],
            'show_thumbs' : true,
            'can_permalink': false
        },
        'actions':{
            // il login è consentito
            'alow_login': true,
            // la registrazione è consentita
            'alow_signup': true,
            // menu laterale
            'show_menu' : true,
            // side menu
            'profile_tab': true,
            'map_tab' : true,
            'reset_tab' : true,
            'logout_tab' : true,
            'wall_tab': false,
            'helpdesk_tab' : 'http://legal-informatics.di.unito.it/firstlife-helpdesk/',
            // azioni mappa
            'geolocation' : true,
            'search' : false,
            'edit_mode' : true,
            'favourite_place' : true,
            'category_filter' : true,
            'time_filter' : true,
            // azioni modal
            'can_modify' : true,
            'can_delete' :true,
            'can_foto' :true,

        },
        'navigator':{
            'default_area' : {visible: true, name: 'Torino Area Metropolitana',bound:[[7.3893504143,44.950933427],[7.9995889664,45.2495768599]]},
            'places' :[
                {id:19, visible:true, name: 'Falchera', bound: [[45.1177816,7.695794],[45.133293,7.7174663]]},
                {id:16, visible:true, name: 'Lanzo - Madonna di Campagna', bound: [[45.1117254447,7.6590584653],[45.1272368447,7.6934337072]]},
                {id:15, visible:true, name: 'Le Vallette - Lucento', bound: [[45.0968375449,7.6201225506],[45.105955431,7.6529957043]]},
                {id:17, visible:true, name: 'Borgata Vittoria', bound: [[45.0916766822,7.6668869769],[45.1118534308,7.6877810434]]},
                {id:6, visible:true, name: 'Campidoglio - San Donato', bound: [[45.0772632753,7.647922038],[45.0889751626,7.6740789635]]}, 
                {id:12, visible:true, name: 'Cit Turin', bound: [[45.0687600712,7.6442654611],[45.078539043,7.6685438327]]},
                {id:5, visible:true, name: 'Cenisia', bound: [[45.0614118,7.6384915],[45.0755057,7.6628565]]},
                {id:4, visible:true, name: 'San Paolo', bound: [[45.0533176,7.6348383],[45.0689062,7.6576853]]},
                {id:14, visible:true, name: 'Parella', bound: [[45.0751241235,7.6069291116],[45.0934472622,7.6493177584]]},
                {id:13, visible:true, name: 'Pozzo strada', bound: [[45.0567587995,7.6020367624],[45.0762334162,7.6358423404]]},
                {id:11, visible:true, name: 'Santa Rita', bound: [[45.036086802,7.6293388009],[45.0564929722,7.6639714837]]},
                {id:12, visible:true, name: 'Mirafiori Nord', bound: [[45.0295134,7.6115942],[45.0573344,7.6419352042]]},
                {id:23, visible:true, name: 'Mirafiori Sud', bound: [[45.005593,7.586918],[45.041993,7.6590157]]},
                {id:10, visible:true, name: 'Lingotto', bound: [[45.0174559,7.635262],[45.0466441,7.666889]]},
                {id:9, visible:true, name: 'Nizza - Millefonti', bound: [[45.0127850817,7.6641011113],[45.0419732817,7.6761587144]]},
                {id:3, visible:true, name: 'Crocetta - San Secondo', bound: [[45.0513163864,7.6559042672],[45.0667848171,7.6767825942]]},
                {id:2, visible:true, name: 'San Salvario - Valentino', bound: [[45.0413258,7.6671696],[45.0627304,7.6916313]]},
                {id:1, visible:true, name: 'Centro', bound: [[45.059029967,7.6719761186],[45.0752806058,7.6979827709]]},
                {id:7, visible:true, name: 'Aurora - Rossini - Valdocco', bound: [[45.0735356,7.6733921751],[45.0900355,7.6940345867]]},
                {id:18, visible:true, name: 'Barriera di Milano', bound: [[45.0796423,7.6839387789],[45.0997603,7.7128744]]},
                {id:20, visible:true, name: 'Regio Parco - Barca - Bertolla', bound: [[45.0831238222,7.6992271905],[45.1127879113,7.7415847372]]},
                {id:8, visible:true, name: 'Vanchiglia', bound: [[45.0633670906,7.6832735984],[45.0866567788,7.7287636806]]},
                {id:21, visible:true, name: 'Madonna del Pilone', bound: [[45.0607695772,7.7303777592],[45.0796821399,7.7576719181]]},
                {id:22, visible:true, name: 'Borgo Po', bound: [[45.0533635208,7.6951368179],[45.0634583422,7.7173669662]]}
            ],
            'search':{
                'geocoding':'http://nominatim.openstreetmap.org/search'
            }
        },
        'map':{
            'tile_view' : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'tile_edit': 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',   

            //posizione
            'map_default_lat' : 45.070312,
            'map_default_lng' : 7.686856,
            'map_autocenter' : false,
            // zoom init della mappa
            'zoom_level' : 16,
            // zoom creazione contenuto
            'zoom_create' : 18,
            // bound della mappa
            'set_bounds': false,
            'fit_bounds': true,
            'shouthWest_bounds' : [7.649675, 45.079098],
            'northEast_bounds' : [7.655708, 45.083202],
            // controller zoom
            'zoom' : true,
            'zoom_position' : 'bottomleft',
            // attribuzione della mappa
            'attribution' : false,
            // livelli di zoom
            'max_zoom' : 18,
            'min_zoom' : 12,
            //finestra temporale
            'time_from': null,//new Date(),
            'time_to': null,// new Date()
        },
        'behaviour':{
            // richiesto il login per la mappa
            'is_login_required' : true,
            // tempo per il ricaricamento della bb (idle)
            'bbox_timeout': 5000,
            // tempo di attesa dopo il movimento e prima della chiamata alla bbox
            'moveend_delay': 1000,
            // tempo di attesa dopo il type nella ricerca
            'searchend_delay': 1000,
            // abilita la cache dei marker
            'marker_cache': true,
            // dimensione della matrice di divisione della bbox (per le chiamate) 
            // !!! attenzione, con cache false ci vuole split_factor 1
            'split_factor' : 1,
            // time_foward viene aggiunto al now 
            'time_forward':0,
            // time_rewind viene sottratto al now
            'time_rewind':5000,
            'umask':777
        }
    },

    'domains':{
        2: {
            'app_name' : 'SeeS@w',
            'domain_name' : 'seesaw',
            'domain_id' : 2,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'SeeS@w', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'default_background' : 'http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/torino_ospedale_molinette.jpg', 
                'logo_partners' : [{url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/ue.gif", title:"", alt:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", label:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/04/stellone.jpg", title:"", alt:"", label:"", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/regpie.gif", title:"Regione Piemonte", alt:"Regione Piemonte", label:"", width:"", height:50}],
                'can_permalink': true
            },
            'actions':{
                'geolocation' : false,
                'favourite_place' : true,
                'search' : false,
            },
            'map':{
                'tile_edit' : 'https://api.tiles.mapbox.com/v4/alessiacalafiore.1a8075f6/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxlc3NpYWNhbGFmaW9yZSIsImEiOiJkNTljMmIwMzQ4MTNmNWVkYmNiMDM0NjFiOTAwNGNiOCJ9.sAiwGQm8n0AuWIX4zF8vJw',
                'tile_view' : 'https://api.tiles.mapbox.com/v4/aelissa.8deb4fc2/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWVsaXNzYSIsImEiOiJBVFRfbzE0In0.SGRt75lX71q7CqP6kGLXDA',
                'max_zoom' : 22,
                'min_zoom' : 16,
                'map_default_lat' : 45.035291,
                'map_default_lng' : 7.673349,
            },
            'behaviour':{
                'marker_cache': false,
                'split_factor' : 1,
                'bbox_timeout': 5000,
            },
            'navigator':{
                'default_area' : {
                    id: 0,
                    visible: true,
                    name: 'Luoghi di SeeS@w',
                },
                'places': [
                    {
                        id: 0,
                        visible: true,
                        name: 'Biochimica Clinica',
                        northEast: L.latLng(45.041750288867185,  7.675358355045319),
                        southWest: L.latLng(45.040616932697574, 7.674084305763245),
                        bound: [[45.041750288867185,  7.675358355045319],[45.040616932697574, 7.674084305763245]]
                    },
                    {
                        id: 1,
                        visible: true,
                        name: 'Anatomia Patologica Generale',
                        northEast: L.latLng(45.03862687172659,7.675613164901733),
                        southWest: L.latLng(45.0363600131934, 7.6730650663375854),
                        bound: [[45.03862687172659,7.675613164901733],[45.0363600131934, 7.673065066337585]]
                    },
                    {
                        id: 2,
                        visible: true,
                        name: 'Tossicologia ed Epidemiologia Industriale',
                        northEast: L.latLng(45.034191629695, 7.675277888774872),
                        southWest: L.latLng(45.033058123802356, 7.674003839492798),
                        bound: [[45.034191629695, 7.675277888774872],[45.033058123802356, 7.674003839492798]]
                    },
                    {
                        id: 3,
                        visible: true,
                        name: 'Serre - Dipartimento di Scienze Agrarie, Forestali e Alimentari',
                        northEast: L.latLng(45.0656918305, 7.5909865659),
                        southWest: L.latLng(45.0663971424, 7.591991664),
                        bound: [[45.0656918305, 7.5909865659],[45.0663971424, 7.591991664]]
                    }
                ]
            }
        },
        3:{
            'app_name' : 'Librare',
            'domain_name' : 'librare',
            'domain_id' : 3,
            'design':{
                'logo' : {url: 'http://librare.org/wp-content/uploads/2015/06/librare_logo_300.png', title: 'Librare', alt:'Librare', label:{text: 'Librare', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'default_background' : 'http://194.116.4.88/wp-content/uploads/2015/06/book-436507_1920-e1437385577506.jpg',
                'logo_partners' : [{url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/ue.gif", title:"", alt:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", label:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/04/stellone.jpg", title:"", alt:"", label:"", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/regpie.gif", title:"Regione Piemonte", alt:"Regione Piemonte", label:"", width:"", height:50}],
                'colors' : ['rgba(232,78,27, 1)', 'rgba(226,234,181, 1)', 'rgba(118,183,211, 1)','rgba(250,183,56, 1)','rgba(62, 211, 135, 1)','rgba(234, 186, 237, 1)','rgba(61,131,97, 1)','rgba(226,107,15, 1)','rgba(50,118,177, 1)','rgba(136,186,92, 1)'],
            },
            'actions':{
                'geolocation' : true,
                'favourite_place' : false,
                'search' : false,
                'alow_login': false,
                'alow_signup': false,
                'show_menu' : false,
            },
            'behaviour':{
                'is_login_required' : false,
            }
        },
        4:{
            'app_name' : 'Teen-CarTo',
            'domain_name' : 'teencarto',
            'domain_id' : 4,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'Teen-CarTo', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'logo_partners' : [],
            },
            'map':{
                'tile_edit' : 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            },
            'actions':{
                'geolocation' : true,
                'favourite_place' : true,
                'search' : true,
                'alow_login': true,
                'alow_signup': true,
                'show_menu' : true,
            },
            'behaviour':{
                'is_login_required' : true,
                'umask':744
            }
        }
    },

})
// configurazione progetto
    .config(
    function setupProject(myConfig){
        // imposto i defaults
        myConfig = angular.merge(myConfig,myConfig.defaults);

        // controllo se devo sovrascrivere delle impostazioni
        if(myConfig.project && myConfig.project > 1){

            var domainConfigs = myConfig.domains[myConfig.project];
            console.log("config, myConfig, project > 1 , configurazioni caricate: ", domainConfigs);

            // sovrascrivo le configurazioni
            angular.merge(myConfig, domainConfigs)
            if(domainConfigs.navigator){
                myConfig.navigator = domainConfigs.navigator;
            }
            console.log("sovrascrivo le configurazioni: ", myConfig);

        }

    })
// configurazione degli url alle api
    .config(
    function setupApi(myConfig){
        //console.log("setup url api!");

        // costruisco gli url delle api
        var ssl = "//";
        if(!myConfig.ssl)
            ssl = "http://";

        var url = "";
        url = url.concat(ssl).concat(myConfig.api_base_domain).concat(myConfig.api_version).concat("/domains/").concat(myConfig.domain_id).concat("/");

        myConfig.domain_signature = url;
        myConfig.backend_places = url.concat('places');
        myConfig.backend_events = url.concat('events');
        myConfig.backend_things = url.concat('things');
        myConfig.backend_categories = url.concat('categories');
        myConfig.backend_users = url.concat('users');
        myConfig.update_user = url.concat('user/update');
        myConfig.retrieve_password = myConfig.backend_users.concat('/retrieves/password');
        myConfig.reset_password = myConfig.backend_users.concat('/resets/passwords');
        myConfig.backend_tags = url.concat('tags');
        //myConfig.backend_images = url.concat('places/');
        myConfig.backend_search = url.concat('thing/search');
        myConfig.backend_autocomplete = myConfig.backend_search.concat("?q="); 
        
        for(k in myConfig.types.list){
            if(myConfig.types.list[k].url){
                myConfig.types.list[k].url = url.concat(myConfig.types.list[k].url);
            }   
        }
        
        //console.log("url api", url);

    })
// logica
    .config(
    function configAppLogic(myConfig){
        console.log("setup parametri accesso app");
        // se il login non e' ammesso (viewer)
        if(!myConfig.actions.alow_login){
            // non ci si puo' registrare
            myConfig.actions.alow_signup = false;
            // non si puo' fare login
            myConfig.behaviour.is_login_required = false;
            // il menu non puo' essere aperto
            myConfig.actions.show_menu = false;
            // edit mode disabilitato
            myConfig.actions.edit_mode = false;
            // nelle modal dei place non si possono caricare foto o modificare/cancellare i place
            myConfig.actions.can_modify = false;
            myConfig.actions.can_delete = false;
            myConfig.actions.can_foto = false;

            // disabilito la cache
            myConfig.behaviour.marker_cache = false;
            myConfig.behaviour.split_factor = 1;
            myConfig.behaviour.bbox_timeout = 5000;
        } 

        // se le foto sono abilitate
        if(myConfig.actions.can_foto){
            // abilito la visualizzazione dei thumb
            myConfig.design.show_thumbs = true;
        } else {
            myConfig.design.show_thumbs = false;
        }

        // se la cache e' disabilitata
        if(!myConfig.behaviour.marker_cache){
            //devo disabilitare lo splitfactor 
            // altrimenti ho un anomalia che mi porta a perdere i dati dei quadranti
            myConfig.behaviour.split_factor = 1;
        }

    })
    .config(
        function setTypePerms(myConfig){
        // init delle maschere dei campi per il form
        // prendo il form di default
        var types = myConfig.types;
        var perms = angular.copy(myConfig.types.default.properties);
        var checkList = {};
            
        for(k in types.list){
            // faccio il merge dei default con le proprieta' del tipo specifico
            var perm = angular.extend({},types.default.properties, types.list[k].properties);
            // ciclo per costruire una maschera con le key, da usare nel wizard con ng-if
            //console.log("myConfig, config, init delle maschere di permessi, proprieta' per il tipo: ", k, perm);
            perms[k] ={};
            for(i in perm){
                // controllo che non ci sia un campo escluso (definito exclude:true)
                //console.log("EditorCtrl, init delle maschere di permessi, parametro di esclusione: ", perms[i]);
                if(!perm[i].exclude){
                    //console.log("myConfig, config, init delle maschere di permessi, aggiungo regola: ", perms[i],perm[i].key,perm[i]);
                    perms[k][perm[i].key] = perm[i];
                }
            }

        }
        myConfig.types.perms = perms;
        //console.log("myConfig, config, init delle maschere di permessi per i tipi: ", perms);
    }).config(
    function setRelations(myConfig){
        //console.log("myConfig, config, init delle relazioni tra tipi: ", myConfig.types.list);
        var types = myConfig.types.list;
        var relations = {},
            list = [],
            map = {};
        for(i = 0; i < types.length; i++){
            //console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].relations;
            var r = [];
            for(key in rel){
                //console.log("ciclo relazioni di ",types[i].key, " valuto: ",key,rel,rel[key]);
                var t = angular.copy(types[types.map(function(e){return e.key;}).indexOf(key)]);
                t.rel = rel[key];
                //console.log("relazioni per ",types[i].key, " costruito: ",t);
                r.push(t);
                if(list.indexOf(rel[key].slug) < 0 ){
                    list.push(rel[key].slug);
                }
                map[rel[key].slug] = rel[key].field;
            }
            //console.log("aggiungo t: ",t," alle relazioni di: ",types[i].key);
            relations[types[i].key] = r;
        }
        relations.list = list;
        relations.map = map;
        console.log("myConfig, config. Relazioni tra tipi: ", relations);
        myConfig.types.relations = relations;
        
        
        // figli possibili
        var children = {};
        for(i = 0; i < types.length; i++){
            //console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].relations;
            var r = {};
            for(key in rel){
                //console.log("ciclo relazioni di ",types[i].key, " valuto: ",key,rel,rel[key]);
                var t = angular.copy(types[types.map(function(e){return e.key;}).indexOf(key)]);
                t.rel = rel[key];
                //console.log("relazioni per ",types[i].key, " costruito: ",t);
                r[key] = t.rel;
            }
            //console.log("aggiungo t: ",t," alle relazioni di: ",types[i].key);
            children[types[i].key] = r;
        }
        console.log("myConfig, config. Relazioni tra tipi: figli possibili ", children);
        myConfig.types.child_relations = children;
        
        // padri possibili
        var fathers = {};
        // per ogni tipo
        for(i = 0; i < types.length; i++){
            //console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].key;
            fathers[rel] = {};
            for(j = 0; j < types.length; j++){
                //console.log("myConfig, config. Ciclo tra padri possibili ",types[j]);
                var r = types[j].relations[rel];
                if(r){
                    fathers[rel][types[j].key] =  angular.copy(r);
                }
            }
        }
        console.log("myConfig, config. Relazioni tra tipi: padri possibili ",fathers);
        myConfig.types.parent_relations = fathers;
        
    }).config(
    function setStyles(myConfig){
        var colors = myConfig.design.colors;
        var styles = '';
        for( i = 0; i < colors.length; i++ ){
            styles = styles.concat(".color"+i).concat("{color:"+colors[i]+";}");
            styles = styles.concat(".background"+i).concat("{background-color:"+colors[i]+";}");
            styles = styles.concat(".pie"+i+":after").concat("{background-color:"+colors[i]+";}");
            styles = styles.concat(".pie"+i+":before").concat("{background-color:"+colors[i]+";}");
        }
        //console.log("myConfig, config. init styles: ", styles);
        myConfig.design.css = styles;
    })
// impostazioni di dev
    .config(
    function configDev(myConfig){
        //console.log("setup modalità dev");

        // se in modalita' dev
        if(myConfig.dev){
            // ciclo sulle chiavi in actions
            for (key in myConfig.actions){
                // imposto a true tutte le azioni che sono inabilitate
                if(myConfig.actions[key] === false){
                    myConfig.actions[key] = true;
                }

            }

        } 

    });



/* da valutare dopo properties:[
                          { key: 'name', type: 'input',
                           templateOptions: {
                               type: 'text',
                               label: 'Nome',
                               placeholder: 'Nome',
                               required:true
                           }
                          },
                          { key: 'description', type: 'textarea',
                           templateOptions: {
                               label: 'Descrizione',
                               placeholder: 'Descrizione',
                               required:true
                           }
                          },
                          { key: 'link_url', type: 'input',
                           templateOptions: {
                               type: 'text',
                               label: 'Collegamento esterno',
                               placeholder: 'Es. http://www...'
                           }
                          },
                          { key: 'valid_from', type: 'ionic-datepicker',
                           templateOptions: {
                               label: "Data d'inizio",
                               mondayfirst: "true",
                               callback:"datePickerFrom",
                               title:"Inizio"
                           }
                          },
                          { key: 'valid_to', type: 'ionic-datepicker',
                           templateOptions: {
                               label: "Data di fine",
                               mondayfirst: "true",
                               callback:"datePickerTo",
                               title:"Fine"
                           }
                          },
                          { key: 'tags', type: 'auto-complete',
                           templateOptions: {
                               label:"Tags",
                               source:"loadTags($query)",
                               'min-length':"0",
                               'load-on-focus':true,
                               'load-on-empty':false,
                               'max-results-to-show':10
                           }
                          },
                          { key: 'categories', type: 'ion-radio',
                           templateOptions: {
                               label:"Categoria",
                           }
                          },
                      ]*/
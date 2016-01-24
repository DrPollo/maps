angular.module('firstlife.config')

    .constant('myConfig', {
    // modalita' dev o produzione
    'dev': true,
    'project': 5,
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
                          'link_url':{ key: 'link_url', label: 'Collegamento esterno', placeholder: 'URL esterno, es. http://www...'},
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
                {name:'Luogo',id:1,icon:'ion-location',slug:'place',url:'places',key:'FL_PLACES',index:3,
                 properties:{
                     'parent':{ key: 'parent', label: "Luogo contenitore", placeholder:"All'interno di (luogo contenitore)"}
                 },
                 relations:{'FL_PLACES':{slug:'parent',field:'parent_id',label:'Parte di',childrenLabel:'Contiene'},'FL_EVENTS':{slug:'location',field:'location',label:'Si tiene in',childrenLabel:'Ospita'}}
                },
                {name:'Evento',id:2,icon:'ion-calendar',slug:'event',url:'events',key:'FL_EVENTS',index:5,
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
            ],
            'categories': [{"category_space":1,"name":"Categorie","slug":"categorie","description":"Tipologie di attivit\u00e0","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-1,"name":"Cultura e arte","description":"Cultura e arte","category_index":1,"icon_name":"ion-paintbrush"},{"id":-2,"name":"Istruzione e formazione","description":"Istruzione e formazione","category_index":2,"icon_name":"ion-university"},{"id":-6,"name":"Attivit\u00e0 per il sociale","description":"Attivit\u00e0 per il sociale","category_index":3,"icon_name":"ion-android-people"},{"id":-3,"name":"Sport","description":"Sport","category_index":4,"icon_name":"ion-ios-football"},{"id":-4,"name":"Alimentazione e ristorazione","description":"Alimentazione e ristorazione","category_index":5,"icon_name":"ion-android-restaurant"},{"id":-5,"name":"Tempo libero","description":"Tempo libero","category_index":6,"icon_name":"ion-chatbubbles"},{"id":-500,"name":"Uffici pubblici","description":"Uffici pubblici","category_index":7,"icon_name":"ion-social-buffer"},{"id":-7,"name":"Servizi professionali","description":"Servizi professionali","category_index":8,"icon_name":"ion-briefcase"},{"id":-501,"name":"Artigianato e industria","description":"Artigianato e industria","category_index":9,"icon_name":"ion-settings"},{"id":-9,"name":"Commercio","description":"Commercio","category_index":10,"icon_name":"ion-bag"},{"id":-10,"name":"Trasporti e mobilit\u00e0","description":"Trasporti e mobilit\u00e0","category_index":11,"icon_name":"ion-android-subway"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immegine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]},{"category_space":13,"name":"Tipologia di spazio","slug":"tipologia-di spazio","description":"Tipologia di spazio","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-90,"name":"Spazi aperti e aree verdi","description":"Spazi aperti e aree verdi","category_index":1,"icon_name":"ion-leaf"},{"id":-91,"name":"Spazi istituzionali","description":"Spazi istituzionali","category_index":2,"icon_name":"ion-ios-flag"},{"id":-92,"name":"Residenze e vicinato","description":"Residenze e vicinato","category_index":3,"icon_name":"ion-ios-home"},{"id":-93,"name":"Spazi produttivi","description":"Spazi produttivi","category_index":4,"icon_name":"ion-gear-a"},{"id":-94,"name":"Monumenti e luoghi storici","description":"Monumenti e luoghi storici","category_index":5,"icon_name":"ion-ribbon-b"}],"entities":["FL_PLACES"]},{"category_space":14,"name":"Costo","slug":"costo","description":"Costo","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-100,"name":"Gratuito","description":"Gratuito","category_index":1,"icon_name":"ion-happy-outline"},{"id":-101,"name":"A pagamento","description":"A pagamento","category_index":2,"icon_name":"ion-cash"}],"entities":["FL_EVENTS"]},{"category_space":15,"name":"Accesso","slug":"accesso","description":"Accesso","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-110,"name":"Accesso libero","description":"Accesso libero","category_index":1,"icon_name":"ion-radio-waves"},{"id":-111,"name":"Su invito o prenotazione","description":"Su invito o prenotazione","category_index":2,"icon_name":"ion-paper-airplane"},{"id":-112,"name":"Riservato al gruppo","description":"Riservato al gruppo","category_index":3,"icon_name":"ion-android-hand"}],"entities":["FL_EVENTS"]},{"category_space":16,"name":"Partecipazione","slug":"partecipazione","description":"Partecipazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-120,"name":"Per tutti","description":"Per tutti","category_index":1,"icon_name":"ion-load-b"},{"id":-121,"name":"Per bambini e ragazzi","description":"Per bambini e ragazzi","category_index":2,"icon_name":"ion-ios-color-wand"},{"id":-122,"name":"Per giovani","description":"Per giovani","category_index":3,"icon_name":"ion-android-bar"},{"id":-123,"name":"Per famiglie","description":"Per famiglie","category_index":4,"icon_name":"ion-icecream"}],"entities":["FL_EVENTS"]}]
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
            'wall_tab': true,
            'helpdesk_tab' : 'http://legal-informatics.di.unito.it/firstlife-helpdesk/',
            // azioni mappa
            'geolocation' : true,
            'search' : true,
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
            //'tile_view' : 'http://130.192.157.163/osm_tiles/{z}/{x}/{y}.png',
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
            'max_zoom' : 20,
            'min_zoom' : 12,
            'cluster_limit': 18,
            //finestra temporale
            'time_from': new Date(),
            'time_to': new Date(),
            'marker_size': [20,20],
            'marker_ancor': [10,10],
            'bbox_details':'full'
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
            'umask':777,
            'viewer':false
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
            'types':{
                'categories':[
                    {"category_space":3,"name":"Seesatw","slug":"seesatw","description":"Seesatw","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-403,"name":"Messaggi","description":"Messaggi","category_index":1,"icon_name":"ion-chatboxes"},{"id":-404,"name":"Allarme","description":"Allarme","category_index":2,"icon_name":"ion-alert-circled"},{"id":-405,"name":"Pericolo","description":"Pericolo","category_index":3,"icon_name":"ion-android-alert"},{"id":-406,"name":"Strumentazione","description":"Strumentazione","category_index":4,"icon_name":"ion-ios-gear"},{"id":-407,"name":"Reagentario","description":"Reagentario","category_index":5,"icon_name":"ion-erlenmeyer-flask"},{"id":-408,"name":"Sensore","description":"Sensore","category_index":6,"icon_name":"ion-thermometer"},{"id":-409,"name":"Processo","description":"Processo","category_index":7,"icon_name":"ion-network"}],"entities":["FL_EVENTS","FL_PLACES"]},
                    {"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immegine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}
                ]
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
                'viewer':true
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
                ],
                'search':{
                    'geocoding':'http://nominatim.openstreetmap.org/search'
                }
            }
        },
        3:{
            'app_name' : 'Librare',
            'domain_name' : 'librare',
            'domain_id' : 3,
            'design':{
                'logo' : {url: 'http://librare.org/wp-content/uploads/2015/06/librare_logo_300.png', title: 'Librare', alt:'Librare', label:{text: 'Librare', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'default_background' : 'http://www.librare.org/wp-content/uploads/2015/10/wall.jpg',
                'logo_partners' : [{url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/ue.gif", title:"", alt:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", label:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/04/stellone.jpg", title:"", alt:"", label:"", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/regpie.gif", title:"Regione Piemonte", alt:"Regione Piemonte", label:"", width:"", height:50}],
                'colors' : ['rgba(232,78,27, 1)', 'rgba(226,234,181, 1)', 'rgba(118,183,211, 1)','rgba(250,183,56, 1)','rgba(62, 211, 135, 1)','rgba(234, 186, 237, 1)','rgba(61,131,97, 1)','rgba(226,107,15, 1)','rgba(50,118,177, 1)','rgba(136,186,92, 1)'],
            },
            'types':{
                'categories':[{"category_space":4,"name":"Categorie Librare","slug":"categorie-librare","description":"Librare categorie","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-411,"name":"Book crossing","description":"Book crossing","category_index":1,"icon_name":"ion-ios-shuffle-strong"},{"id":-412,"name":"Biblioteche","description":"Biblioteche","category_index":2,"icon_name":"ion-ios-book"},{"id":-413,"name":"Book caff\u00e8","description":"Book caff\u00e8","category_index":3,"icon_name":"ion-coffee"},{"id":-414,"name":"Librerie private","description":"Librerie private","category_index":4,"icon_name":"ion-android-contact"},{"id":-415,"name":"Biblioteche scolastiche","description":"Biblioteche scolastiche","category_index":5,"icon_name":"ion-android-contacts"},{"id":-416,"name":"Scuole","description":"Scuole","category_index":6,"icon_name":"ion-university"}],"entities":["FL_PLACES"]},{"category_space":5,"name":"Azioni","slug":"azioni","description":"Librare azioni","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-11,"name":"Registrazione","description":"Registrazione","category_index":1,"icon_name":"ion-compose"},{"id":-12,"name":"Prestito","description":"Prestito","category_index":2,"icon_name":"ion-ios-book"},{"id":-13,"name":"Riconsegna","description":"Riconsegna","category_index":3,"icon_name":"ion-ios-book-outline"},{"id":-14,"name":"Commento","description":"Commento","category_index":4,"icon_name":"ion-chatbox-working"},{"id":-15,"name":"Voto","description":"Voto","category_index":5,"icon_name":"ion-android-star-half"},{"id":-16,"name":"Checkin","description":"Checkin","category_index":6,"icon_name":"ion-arrow-shrink"},{"id":-17,"name":"Checkout","description":"Checkout","category_index":7,"icon_name":"ion-arrow-expand"}],"entities":["FL_EVENTS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immegine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}]
            },
            'actions':{
                'geolocation' : true,
                'favourite_place' : false,
                'alow_login': false,
                'alow_signup': false,
                'show_menu' : false,
            },
            'behaviour':{
                'is_login_required' : false
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
                //'tile_view' : 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'tile_edit' : 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            },
            'types':{
                'categories':[{"category_space":6,"name":"Categorie Teen-CarTo","slug":"categorie-teen-carto","description":"Teen-CarTo categorie","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-20,"name":"Luoghi di ritrovo","description":"Luoghi di ritrovo","category_index":1,"icon_name":"ion-chatbubbles"},{"id":-21,"name":"Locali serali e notturni","description":"Locali serali e notturni","category_index":2,"icon_name":"ion-ios-cloudy-night"},{"id":-22,"name":"Cibo","description":"Cibo","category_index":3,"icon_name":"ion-fork"},{"id":-23,"name":"Arte, cultura, intrattenimento","description":"Arte, cultura, intrattenimento","category_index":4,"icon_name":"ion-paintbrush"},{"id":-2,"name":"Istruzione e formazione","description":"Istruzione e formazione","category_index":5,"icon_name":"ion-university"},{"id":-25,"name":"Hobby e sport","description":"Hobby e sport","category_index":6,"icon_name":"ion-ios-football"},{"id":-26,"name":"Lavoro","description":"Lavoro","category_index":7,"icon_name":"ion-briefcase"},{"id":-27,"name":"Negozi","description":"Negozi","category_index":8,"icon_name":"ion-android-cart"},{"id":-28,"name":"Servizi","description":"Servizi","category_index":9,"icon_name":"ion-medkit"},{"id":-29,"name":"Io immagino","description":"Io immagino","category_index":10,"icon_name":"ion-android-cloud-outline"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":7,"name":"Valutazione","slug":"valutazione","description":"Teen-CarTo Valutazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-30,"name":"Risorsa","description":"Luoghi di ritrovo","category_index":1,"icon_name":"ion-ios-lightbulb"},{"id":-31,"name":"Criticit\u00e0","description":"Criticit\u00e0","category_index":2,"icon_name":"ion-android-warning"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":8,"name":"Trasformazione","slug":"trasformazione","description":"Teen-CarTo Trasformazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-40,"name":"Trasformazione positiva","description":"Trasformazione positiva","category_index":1,"icon_name":"ion-arrow-graph-up-right"},{"id":-41,"name":"Trasformazione negativa","description":"Trasformazione negativa","category_index":2,"icon_name":"ion-arrow-graph-down-right"},{"id":-42,"name":"Trasformazione assente","description":"Trasformazione assente","category_index":3,"icon_name":"ion-ios-pulse-strong"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immegine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}]
            },
            'actions':{
                'geolocation' : true,
                'favourite_place' : true,
                'alow_login': true,
                'alow_signup': true,
                'show_menu' : true,
            },
            'behaviour':{
                'is_login_required' : true,
                'umask':744
            }
        },
        5:{
            'app_name' : 'CMMS',
            'domain_name': 'cmms',
            'domain_id':5,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'Crowdmapping Mirafiori Sud', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'logo_partners' : [],
                'colors' : ['rgba(221,91,42, 1)','rgba(246,213,59, 1)', 'rgba(61,131,97, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(136,186,92, 1)'],
            },
            'actions':{
                'geolocation' : true,
                'favourite_place' : true,
                'alow_login': true,
                'alow_signup': true,
                'show_menu' : true,
            },
            'behaviour':{
                'is_login_required' : false,
                'umask':744,
                'viewer':false
            },
            'types':{
                'list':{2:
                        {name:'Segnalazione',id:1,icon:'ion-clipboard',slug:'ticket',url:'tickets',key:'FL_TICKETS',index:8,
                         properties:{},
                         relations:{}
                        }},
                'exclude':['FL_PLACES','FL_EVENTS'],
                'categories':[{"category_space":9,"name":"Categoria","slug":"categoria","description":"Mirafiori Sud Categoria","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-50,"name":"Qualit\u00e0 Ambientale","description":"Qualit\u00e0 Ambientale","category_index":1,"icon_name":"ion-waterdrop"},{"id":-51,"name":"Attrezzature e arredo urbano","description":"Attrezzature e arredo urbano","category_index":2,"icon_name":"ion-cube"},{"id":-52,"name":"Viabilit\u00e0 e suolo pubblico","description":"Viabilit\u00e0 e suolo pubblico","category_index":3,"icon_name":"ion-alert-circled"},{"id":-53,"name":"Verde pubblico","description":"Verde pubblico","category_index":4,"icon_name":"ion-leaf"},{"id":-54,"name":"Animali urbani","description":"Animali urbani","category_index":5,"icon_name":"ion-ios-paw"},{"id":-55,"name":"Sicurezza","description":"Sicurezza","category_index":6,"icon_name":"ion-ios-eye"}],"entities":["FL_TICKETS"]},{"category_space":10,"name":"Tipologia","slug":"tipologia","description":"Mirafiori Sud Tipologia","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-60,"name":"Problema","description":"Problema","category_index":1,"icon_name":"ion-alert"},{"id":-61,"name":"Realt\u00e0 positiva","description":"Realt\u00e0 positiva","category_index":2,"icon_name":"ion-star"},{"id":-62,"name":"Proposta","description":"Proposta","category_index":3,"icon_name":"ion-android-bulb"}],"entities":["FL_TICKETS"]},{"category_space":11,"name":"Stato","slug":"stato","description":"Mirafiori Sud Stato","is_editable":false,"is_mandatory":false,"multiple_categories_allowed":false,"categories":[{"id":-70,"name":"Ricevuto","description":"Ricevuto","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-71,"name":"In attuazione","description":"In attuazione","category_index":2,"icon_name":"ion-android-radio-button-on"},{"id":-72,"name":"Risolto\/Completato","description":"Risolto\/Completato","category_index":3,"icon_name":"ion-android-checkmark-circle"}],"entities":["FL_TICKETS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immegine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}]
            },
            'map':{ //45.021557, 7.624039
                'map_default_lat' : 45.021557,
                'map_default_lng' : 7.624039
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
            console.log("config, myConfig, project > ",myConfig.project," , configurazioni caricate: ", domainConfigs);

            // sovrascrivo le configurazioni
            angular.merge(myConfig, domainConfigs)
            if(domainConfigs.navigator){
                myConfig.navigator = domainConfigs.navigator;
            }
            console.log("sovrascrivo le configurazioni: ", myConfig);

        }
        //fix tipi
        if(myConfig.types.exclude){
            console.log("Fix permessi dei tipi ",myConfig.types.exclude);

            var exclude = myConfig.types.exclude;
            var list = [];
            for(var i = 0; i < myConfig.types.list.length; i++){
                console.log("Fix permessi dei tipi, controllo ",exclude[i]);
                if(!exclude[i]){
                    console.log(myConfig.types);
                    var index = exclude.indexOf(myConfig.types.list[i].key);
                    if(index < 0){
                        list.push (myConfig.types.list[i]);
                    }
                }
            }
            myConfig.types.list = list;
            console.log("Check fix permessi dei tipi ",myConfig.types);
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
        }
        if(myConfig.behaviour.viewer){
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
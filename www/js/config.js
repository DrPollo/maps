angular.module('firstlife.config')
    .constant('myConfig', {
    // modalita' dev o produzione
    'dev': true,
    // 1 firstlife, 2 seesaw, 3 librare, 4 teencarto, 5 miramap, 6 cscw, 7 sportografi, 8 wegovnow, 9 sandbox
    'project': 1,
    'api_base_domain' : 'firstlife-dev.di.unito.it:3095/',
    //'api_base_domain' : 'api.dev.firstlife.di.unito.it/',
    //'api_base_domain' : 'api.test.firstlife.di.unito.it/',
    //'api_base_domain' : 'api.firstlife.di.unito.it/',
    'format':'',
    'api_version' : 'v4',
    'ssl': false,
    'version': '0.4.5',

    // nome progetto e dominio ! attenzione il dominio va aggiunto negli url domains/<domain_id>/
    'defaults':{
        'app_name' : 'FirstLife',
        'domain_name' : 'firstlife',
        'domain_id' : 1,
        'types' : {
            default: {slug:'place',id:1,icon:'ion-location',
                      properties:{
                          'name':{ key: 'name', label: 'TITLE', placeholder: 'TITLE', required:true, default:"" },
                          'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:null,is_editable:false},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:null,is_editable:false},
                          'link_url':{ key: 'link_url', label: 'URL_LABEL', placeholder: 'URL_PLACEHOLDER', default:""},
                          'tags':{ key: 'tags', label:"TAGS_LABEL", placeholder:"TAGS_PLACEHOLDER", default:[] },
                          'categories':{ key: 'categories', label:"CATEGORIES", default:[]},
                          'group_id':{ key: 'group_id', label:"GROUP",placeholder:"GROUP", default:null},
                          'thumbnail':{ key: 'thumbnail', label:"THUMBNAIL_LABEL",placeholder:"THUMBNAIL_PLACEHOLDER", default:null},
                          'user':{ key: 'user', label:"USER",placeholder:"USER" , default:-1},
                          'wp_id':{ key: 'id_wp', required:true, default:1},
                          'id':{ key: 'id', default:null},
                          "level":{key:"level", default:0, label:"LEVEL_LABEL",placeholder:"LEVEL_PLACEHOLDER"}
                      },
                      actions:[
                         {label:'SUBSCRIBE',key:'subscribe',icon:'ion-android-bookmark',icon2:'ion-android-add-circle',search:false, check:'noSubscriber'},
                         {label:'UNSUBSCRIBE',key:'unsubscribe',icon:'ion-android-bookmark',icon2:'ion-android-remove-circle',search:false, check:'subscriber'},
                        ]
                     },
            simpleEntities:{
                description:{
                    key:'description',
                    url:'descriptions',
                    label:'DESCRIPTION',
                    title:'DESCRIPTIONS',
                    fields:{
                        title:{key:'title', label:'NAME',default:'',required:true},
                        description:{key:'description', label:'TEXT',default:'',required:true}
                    },
                    contentKey:'description',
                    contentKeyType:'text',
                    idKey:'description_id',
                    icon:'ion-android-list',
                    addLabel:'ADD_DESCRIPTION',
                    exclude:['FL_COMMENTS','FL_ARTICLES'],
                    excludeAdd:['FL_COMMENTS','FL_ARTICLES']
                },
                comment:{
                    key:'comment',
                    url:'comments',
                    label:'COMMENT',
                    title:'COMMENTS',
                    fields:{
                        message:{key:'message', label:'TEXT',default:'',required:true}
                    },
                    contentKey:'message',
                    contentKeyType:'text',
                    idKey:'comment_id',
                    icon:'ion-chatbox-working',
                    addLabel:'ADD_COMMENT',
                    exclude:['FL_PLACES'],
                    excludeAdd:['FL_PLACES']
                },
                image:{
                    key:'image',
                    url:'images',
                    label:'IMAGE',
                    title:'GALLERY',
                    fields:{
                        image:{key:'image', label:'IMAGE',default:'',required:true}
                    },
                    contentKey:'filedata',
                    contentKeyType:'image',
                    idKey:'image_id',
                    icon:'ion-images',
                    addLabel:'ADD_IMAGE'
                }
            },
            list:[
                // place
                {name:'PLACE_NAME',id:1,icon:'ion-location',slug:'place',url:'places',key:'FL_PLACES',index:3,
                 properties:{
                     //'description':{ key: 'description', label: 'DESCRIPTION', placeholder: 'DESCRIPTION', required:true, default:""},
                     'parent_id':{ key: 'parent_id', label: "PARENT_PLACE_LABEL", placeholder:"PARENT_PLACE_PLACEHOLDER", default:null},
                     'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:null,advanced:true,is_editable:true},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:null,advanced:true,is_editable:true},
                 },
                 relations:{
                     'FL_PLACES':{slug:'parent_id',field:'parent_id',label:'REL_PARENT_ID_LABEL',childrenLabel:'REL_PARENT_ID_CHILD_LABEL'},
                     'FL_EVENTS':{slug:'location',field:'location',label:'REL_LOCATION_LABEL',childrenLabel:'REL_LOCATION_CHILD_LABEL',bounded:true},
                     'FL_ARTICLES':{slug:'article_of',field:'article_of',label:'REL_ARTICLE_OF_LABEL',childrenLabel:'REL_ARTICLE_OF_CHILD_LABEL',bounded:true},
                     'FL_COMMENTS':{slug:'comment_of',field:'comment_of',label:'REL_COMMENT_OF_LABEL',childrenLabel:'REL_COMMENT_OF_CHILD_LABEL',bounded:true}
                 }
                },
                // eventi
                {name:'EVENT_NAME',id:2,icon:'ion-calendar',slug:'event',url:'events',key:'FL_EVENTS',index:5,
                 properties:{
                     //'description':{ key: 'description', label: 'DESCRIPTION', placeholder: 'DESCRIPTION', required:true, default:""},
                     'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:true},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:true},
                          
                     'location':{ key: 'location', label: "LOCATION_LABEL", placeholder:"LOCATION_PLACEHOLDER", default:null},
                     'duration':{ key: 'duration', label: "DURATION_LABEL", placeholder:"DURATION_PLACEHOLDER", default:null},
                     'door_time':{ key: 'door_time', label: "DOORTIME_LABEL", placeholder:"DOORTIME_PLACEHOLDER", default:null},
                     'parent_id':{ key: 'parent_id', label: "PARENT_EVENT_LABEL", placeholder:"PARENT_EVENT_PLACEHOLDER", default:null},
                     'attendees':{ key: 'attendees', label: "ATTENDEES_LABEL", placeholder:"ATTENDEES_PLACEHOLDER", default:[],advanced:true},
                     'performer':{ key: 'performer', label: "PERFORMER_LABEL", placeholder:"PERFORMER_PLACEHOLDER", default:-1,advanced:true},
                     'organizer':{ key: 'organizer', label: "ORGANIZER_LABEL", placeholder:"ORGANIZER_PLACEHOLDER", default:-1,advanced:true},
                 },
                 relations:{
                     'FL_EVENTS':{slug:'parent_id',field:'parent_id',label:'REL_PARENT_ID_LABEL',childrenLabel:'REL_PARENT_ID_CHILD_LABEL'},
                     'FL_ARTICLES':{slug:'article_of',field:'article_of',label:'REL_ARTICLE_OF_LABEL',childrenLabel:'REL_ARTICLE_OF_CHILD_LABEL',bounded:true}
                 }
                },
                // articoli
                {name:'POST_NAME',id:4,icon:'ion-clipboard',slug:'article',url:'articles',key:'FL_ARTICLES',index:7,
                 properties:{
                     'article_of':{ key: 'article_of', label: "ARTICLE_OF_LABEL", placeholder:"ARTICLE_OF_PLACEHOLDER", default:null},
                     'text':{key:'text',label:'TEXT_LABEL',placeholder:"TEXT_PLACEHOLDER",required:true, default:""},
                     'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:new Date(),required:true,advanced:true,is_editable:true},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:null,required:true,advanced:true},
                 },
                 relations:{
                     'FL_ARTICLES':{slug:'parent_id',field:'parent_id',label:'REL_PARENT_ID_LABEL',childrenLabel:'REL_PARENT_ID_CHILD_LABEL',bounded:true}
                 }
                },
                // commenti
                {name:'COMMENT_NAME',id:3,icon:'ion-quote',slug:'news',url:'news',key:'FL_COMMENTS',index:9,
                 properties:{
                     "comment_of":{ key: 'comment_of', label: "COMMENT_OF_LABEL", placeholder:"COMMENT_OF_PLACEHOLDER", default:null},
                     "message_text":{key:'message_text', label: "MESSAGE_LABEL", placeholder: "MESSAGE_PLACEHOLDER", default:"",required:true},
                     'group_id':{ key: 'group_id', label:"GROUP",placeholder:"GROUP", default:null},
                     'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:true,advanced:true},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:false,advanced:true},
                 },relations:{}
                },
                // gruppi
                {name:'GROUPS_NAME',id:5,icon:'ion-flag',slug:'group',url:'groups',key:'FL_GROUPS',index:11,
                 properties:{
                     //'description':{ key: 'description', label: 'DESCRIPTION', placeholder: 'DESCRIPTION', required:true, default:""},
                     'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:true,advanced:true},
                     'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:false,is_editable:true,advanced:true},
                     "members":{key:'members', label: "GROUP_MEMBERS", placeholder: "", default:1,icon:'ion-android-people'}

                 },
                 relations:{
                     'FL_GROUPS':{slug:'parent_id',field:'parent_id',label:'REL_PARENT_ID_LABEL',childrenLabel:'REL_PARENT_ID_CHILD_LABEL',exclude:true,check:'membership'},
                     'FL_PLACES':{slug:'group_id',field:'group_id',label:'REL_BY_GROUP_LABEL',childrenLabel:'REL_BY_GROUP_PLACE_CHILD_LABEL',exclude:true,check:'membership'},
                     'FL_EVENTS':{slug:'group_id',field:'group_id',label:'REL_BY_GROUP_LABEL',childrenLabel:'REL_BY_GROUP_EVENT_CHILD_LABEL',exclude:true,check:'membership'},
                     'FL_ARTICLES':{slug:'group_id',field:'group_id',label:'REL_BY_GROUP_LABEL',childrenLabel:'REL_BY_GROUP_POST_CHILD_LABEL',exclude:true,check:'membership'},
                     'FL_COMMENTS':{slug:'group_id',field:'group_id',label:'REL_BY_GROUP_LABEL',childrenLabel:'REL_BY_GROUP_COMMENT_CHILD_LABEL',exclude:true,check:'membership'}
                 },
                 actions:[
                     {label:'JOIN_GROUP',key:'join',icon:'ion-android-person-add',search:false, check:'noMembership'},
                     {label:'LEAVE_GROUP',key:'leave',icon:'ion-android-exit',search:false, check:'noOwnership'},
                     {label:'VIEW_GROUP',key:'view',icon:'ion-map',icon2:'ion-android-arrow-dropright-circle',search:'groups', check:false}
                 ]
                }
            ],
            'categories': [{"category_space":1,"name":"Categorie","slug":"categorie","description":"Tipologie di attività","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-1,"name":"Cultura e arte","description":"","category_index":1,"icon_name":"ion-paintbrush"},{"id":-2,"name":"Istruzione e formazione","description":"","category_index":2,"icon_name":"ion-university"},{"id":-6,"name":"Attività per il sociale","description":"","category_index":3,"icon_name":"ion-android-people"},{"id":-3,"name":"Sport","description":"","category_index":4,"icon_name":"ion-ios-football"},{"id":-4,"name":"Alimentazione e ristorazione","description":"","category_index":5,"icon_name":"ion-android-restaurant"},{"id":-5,"name":"Tempo libero","description":"","category_index":6,"icon_name":"ion-chatbubbles"},{"id":-500,"name":"Uffici pubblici","description":"","category_index":7,"icon_name":"ion-social-buffer"},{"id":-7,"name":"Servizi professionali","description":"","category_index":8,"icon_name":"ion-briefcase"},{"id":-501,"name":"Artigianato e industria","description":"","category_index":9,"icon_name":"ion-settings"},{"id":-9,"name":"Commercio","description":"","category_index":10,"icon_name":"ion-bag"},{"id":-10,"name":"Trasporti e mobilità","description":"","category_index":11,"icon_name":"ion-android-subway"}],"entities":["FL_EVENTS","FL_PLACES","FL_GROUPS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]},{"category_space":13,"name":"Tipologia di spazio","slug":"tipologia-di spazio","description":"Tipologia di spazio","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-90,"name":"Spazi aperti e aree verdi","description":"","category_index":1,"icon_name":"ion-leaf"},{"id":-91,"name":"Spazi istituzionali","description":"","category_index":2,"icon_name":"ion-ios-flag"},{"id":-92,"name":"Residenze e vicinato","description":"","category_index":3,"icon_name":"ion-ios-home"},{"id":-93,"name":"Spazi produttivi","description":"","category_index":4,"icon_name":"ion-gear-a"},{"id":-94,"name":"Monumenti e luoghi storici","description":"","category_index":5,"icon_name":"ion-ribbon-b"}],"entities":["FL_PLACES"]},{"category_space":14,"name":"Costo","slug":"costo","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-100,"name":"Gratuito","description":"","category_index":1,"icon_name":"ion-happy-outline"},{"id":-101,"name":"A pagamento","description":"","category_index":2,"icon_name":"ion-cash"}],"entities":["FL_EVENTS"]},{"category_space":15,"name":"Accesso","slug":"accesso","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-110,"name":"Accesso libero","description":"","category_index":1,"icon_name":"ion-radio-waves"},{"id":-111,"name":"Su invito o prenotazione","description":"","category_index":2,"icon_name":"ion-paper-airplane"},{"id":-112,"name":"Riservato al gruppo","description":"","category_index":3,"icon_name":"ion-android-hand"}],"entities":["FL_EVENTS"]},{"category_space":16,"name":"Partecipazione","slug":"partecipazione","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-120,"name":"Per tutti","description":"","category_index":1,"icon_name":"ion-load-b"},{"id":-121,"name":"Per bambini e ragazzi","description":"","category_index":2,"icon_name":"ion-ios-color-wand"},{"id":-122,"name":"Per giovani","description":"","category_index":3,"icon_name":"ion-android-bar"},{"id":-123,"name":"Per famiglie","description":"","category_index":4,"icon_name":"ion-icecream"}],"entities":["FL_EVENTS"]},{"category_space":17,"name":"Approfondimenti","slug":"approfondimenti","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-130,"name":"Testimonianze","description":"","category_index":1,"icon_name":"ion-chatboxes"},{"id":-131,"name":"Racconti","description":"","category_index":2,"icon_name":"ion-edit"},{"id":-132,"name":"Report","description":"","category_index":3,"icon_name":"ion-android-clipboard"},{"id":-133,"name":"Articoli","description":"","category_index":4,"icon_name":"ion-chatbox-working"}],"entities":["FL_ARTICLES"]},{"category_space":25,"name":"Gruppi","slug":"gruppi","description":"Tipo di gruppo","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-230,"name":"Discussione","description":"","category_index":1,"icon_name":"ion-android-chat"},{"id":-231,"name":"Coordinamento","description":"","category_index":2,"icon_name":"ion-ios-people"},{"id":-62,"name":"Progetto","description":"","category_index":3,"icon_name":"ion-wand"}],"entities":["FL_GROUPS"]}]
        },
        'design':{
            'logo' : {url: 'img/firstlife-logo.svg', title: 'FirstLife', alt:'FirstLife', label:{text: 'FirstLife', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
            'logo_bar' : 'img/firstlife-testo.svg',
            'logo_menu' : 'img/firstlife-logo-palla.svg',
            'logo_width' : 160,
            'logo_height' : 160,
            'default_thumb' : 'img/thumb.jpg',
            'default_background' : 'img/fondo-walktrough.jpg', 
            'logo_partners' : [],
            'colors' : ['rgba(246,213,59, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(221,91,42, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(61,131,97, 1)','rgba(136,186,92, 1)','rgba(246,213,59, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(221,91,42, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(61,131,97, 1)','rgba(136,186,92, 1)','#ccc'],
            'show_thumbs' : true,
            'can_permalink': false,
            'default_language' : 'it',
            "disabled_color":20,
            'side_menu':[
                {name:'Sito web FirstLife',url:'http://firstlife.org',icon:'ion-social-rss',lang:'it'},
                {name:"Guida all'uso",url:'http://www.firstlife.org/category/guida-alluso_tutorial/',icon:'ion-information',lang:'it'},
                {name:'Fanpage',url:'https://www.facebook.com/firstlife.org/',icon:'ion-social-facebook',lang:'it'},
            ]
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
            'favourite_place' : false,
            'category_filter' : true,
            'time_filter' : true,
            // azioni modal
            'can_modify' : true,
            'can_delete' :true,
            'can_foto' :true,
            'switch_language':true
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
            'tile_view' : 'http://api.mapbox.com/v4/drp0ll0.0ba9e7bf/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
            //'tile_view' : 'http://api.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
            //'tile_view' : 'http://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
            //'tile_view' : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
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
            'max_zoom' : 22,
            'min_zoom' : 6,
            'cluster_limit': 18,
            //finestra temporale
            'time_from': new Date(),
            'time_to': new Date(),
            'marker_size': [20,20],
            'marker_ancor': [10,10],
            'bbox_details':'full',
            'geometry_layer': true,
            'min_zoom_geometry_layer':20,
            area:{
                levels:[
                    {"level":0,name:'Livello strada',id:1,icon:'ion-social-buffer-outline',slug:'ground-level',key:0,index:1}
                ]
            },
            filters:[
                {key:'group',property:'group_id',search_param:'groups',icon:'ion-flag',type:'strict',label:'GROUP_FILTERING',entity_type:'FL_GROUPS'},
                {key:'user',property:'user',search_param:'users',icon:'ion-android-person',type:'strict',label:'USER_FILTERING'}
            ]
        },
        'behaviour':{
            // richiesto il login per la mappa
            'is_login_required' : false,
            // tempo per il ricaricamento della bb (idle)
            'bbox_timeout': 5000,
            // tempo di attesa dopo il movimento e prima della chiamata alla bbox
            'moveend_delay': 1000,
            // tempo di attesa dopo il type nella ricerca
            'searchend_delay': 1000,
            // abilita la cache dei marker
            'marker_cache': true,
            // bbox reload time: tempo di ricarica
            'bbox_reload_time':30000,
            "modal_relaod_time": 5000,
            // dimensione della matrice di divisione della bbox (per le chiamate) 
            // !!! attenzione, con cache false ci vuole split_factor 1
            'split_factor' : 1,
            // maschera permessi utente 
            'umask':744,
            'viewer':false,
            // limite minimo di caratteri per la ricerca
            'query_limit':3,
            'search_results_limit': 5
        }
    },

    'domains':{
        8:{
            'app_name' : 'WeGovNow!',
            'domain_name' : 'wegovnow',
            'domain_id' : 8,
            'design':{
                'logo' : {url: 'http://www.firstlife.org/wp-content/uploads/2016/04/WeGovNow_logo_as_outline.svg', title: 'WeGovNow!', alt:'WeGovNow!', label:{text: 'WeGovNow!', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'default_language' : 'en',
                'side_menu':[]
            },
            'types' : {
                'categories':[{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]},{"category_space":29,"name":"Categories","slug":"categories","description":"Categories","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-510,"name":"Culture and Arts","description":"Culture and Arts","category_index":1,"icon_name":"ion-paintbrush"},{"id":-511,"name":"Education and Training","description":"Education and Training","category_index":2,"icon_name":"ion-university"},{"id":-512,"name":"Social Activities","description":"Social Activities","category_index":3,"icon_name":"ion-android-people"},{"id":-513,"name":"Sports","description":"Sports","category_index":4,"icon_name":"ion-ios-football"},{"id":-514,"name":"Food and Provisions","description":"Food and Provisions","category_index":5,"icon_name":"ion-android-restaurant"},{"id":-515,"name":"Free Time","description":"Free Time","category_index":6,"icon_name":"ion-chatbubbles"},{"id":-516,"name":"Public Offices","description":"Public Offices","category_index":7,"icon_name":"ion-social-buffer"},{"id":-517,"name":"Professional Services","description":"Professional Services","category_index":8,"icon_name":"ion-briefcase"},{"id":-518,"name":"Industry and Craft","description":"Industry and Craft","category_index":9,"icon_name":"ion-settings"},{"id":-519,"name":"Service and Trade","description":"Service and Trade","category_index":10,"icon_name":"ion-bag"},{"id":-520,"name":"Transport and Mobility","description":"Transport and Mobility","category_index":11,"icon_name":"ion-android-subway"}],"entities":["FL_EVENTS","FL_GROUPS","FL_PLACES"]},{"category_space":30,"name":"Typology of Spaces","slug":"typology-of spaces","description":"Typology of Spaces","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-530,"name":"Green and Open Spaces","description":"Green and Open Spaces","category_index":1,"icon_name":"ion-leaf"},{"id":-531,"name":"nstitutional Spaces","description":"nstitutional Spaces","category_index":2,"icon_name":"ion-ios-flag"},{"id":-532,"name":"Residences and Neighborhoods","description":"Residences and Neighborhoods","category_index":3,"icon_name":"ion-ios-home"},{"id":-533,"name":"Productive Spaces","description":"Productive Spaces","category_index":4,"icon_name":"ion-gear-a"},{"id":-534,"name":"Monuments and Historic Sites","description":"Monuments and Historic Sites","category_index":5,"icon_name":"ion-ribbon-b"}],"entities":["FL_PLACES"]},{"category_space":31,"name":"Cost","slug":"cost","description":"Cost","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-540,"name":"Free (Services)","description":"Free (Services)","category_index":1,"icon_name":"ion-happy-outline"},{"id":-541,"name":"Payment (Services)","description":"Payment (Services)","category_index":2,"icon_name":"ion-cash"}],"entities":["FL_EVENTS"]},{"category_space":32,"name":"Access","slug":"access","description":"Access","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-550,"name":"Free Access","description":"Free Access","category_index":1,"icon_name":"ion-radio-waves"},{"id":-551,"name":"By Invitation/On Reservation","description":"By Invitation/On Reservation","category_index":2,"icon_name":"ion-paper-airplane"},{"id":-552,"name":"Reserved for Groups","description":"Reserved for Groups","category_index":3,"icon_name":"ion-android-hand"}],"entities":["FL_EVENTS"]},{"category_space":33,"name":"Participation","slug":"participation","description":"Participation","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-560,"name":"For All","description":"For All","category_index":1,"icon_name":"ion-load-b"},{"id":-561,"name":"For Kids and Teens","description":"For Kids and Teens","category_index":2,"icon_name":"ion-ios-color-wand"},{"id":-562,"name":"For Young Adults","description":"For Young Adults","category_index":3,"icon_name":"ion-android-bar"},{"id":-563,"name":"For Families","description":"For Families","category_index":4,"icon_name":"ion-icecream"}],"entities":["FL_EVENTS"]},{"category_space":34,"name":"Contributions","slug":"contributions","description":"Contributions","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-570,"name":"Histories","description":"Histories","category_index":1,"icon_name":"ion-chatboxes"},{"id":-571,"name":"Stories","description":"Stories","category_index":2,"icon_name":"ion-edit"},{"id":-572,"name":"Reports","description":"Reports","category_index":3,"icon_name":"ion-android-clipboard"}],"entities":["FL_ARTICLES"]},{"category_space":35,"name":"Groups","slug":"groups","description":"Groups","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-580,"name":"Newsgroups","description":"Newsgroups","category_index":1,"icon_name":"ion-android-chat"},{"id":-581,"name":"Coordination Groups","description":"Coordination Groups","category_index":2,"icon_name":"ion-ios-people"},{"id":-582,"name":"Design Groups","description":"Design Groups","category_index":3,"icon_name":"ion-wand"}],"entities":["FL_GROUPS"]}]
            },
            'map':{
                'map_default_lat':51.49006812995448,
                'map_default_lng':-0.10123729705810547,
                'zoom_level' : 14,
            }
        },
        9: {
            'app_name' : 'Sandbox',
            'domain_name' : 'sandbox',
            'domain_id' : 9,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'Sandbox', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
            }
        },
        2: {
            'app_name' : 'SeeS@w',
            'domain_name' : 'seesaw',
            'domain_id' : 2,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'SeeS@w', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'default_background' : 'http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/torino_ospedale_molinette.jpg', 
                'logo_partners' : [{url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/ue.gif", title:"", alt:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", label:"Fondo Europeo di Sviluppo Regionale P.O.R.   2007 – 2013", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/04/stellone.jpg", title:"", alt:"", label:"", width:"", height:50}, {url:"http://legal-informatics.di.unito.it/seesaw/wp-content/uploads/2015/08/regpie.gif", title:"Regione Piemonte", alt:"Regione Piemonte", label:"", width:"", height:50}],
                'can_permalink': true,
                'side_menu':[]
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
                'side_menu':[]
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
                'side_menu':[]
            },
            'map':{
                'tile_view' : 'http://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
                'tile_edit' : 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            },
            'types':{
                'categories':[{"category_space":6,"name":"Categorie Teen-CarTo","slug":"categorie-teen-carto","description":"Teen-CarTo categorie","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-20,"name":"Luoghi di ritrovo","description":"Luoghi di ritrovo","category_index":1,"icon_name":"ion-chatbubbles"},{"id":-21,"name":"Locali serali e notturni","description":"Locali serali e notturni","category_index":2,"icon_name":"ion-ios-cloudy-night"},{"id":-22,"name":"Cibo","description":"Cibo","category_index":3,"icon_name":"ion-fork"},{"id":-23,"name":"Arte, cultura, intrattenimento","description":"Arte, cultura, intrattenimento","category_index":4,"icon_name":"ion-paintbrush"},{"id":-2,"name":"Istruzione e formazione","description":"Istruzione e formazione","category_index":5,"icon_name":"ion-university"},{"id":-25,"name":"Hobby e sport","description":"Hobby e sport","category_index":6,"icon_name":"ion-ios-football"},{"id":-26,"name":"Lavoro","description":"Lavoro","category_index":7,"icon_name":"ion-briefcase"},{"id":-27,"name":"Negozi","description":"Negozi","category_index":8,"icon_name":"ion-android-cart"},{"id":-28,"name":"Servizi","description":"Servizi","category_index":9,"icon_name":"ion-medkit"},{"id":-29,"name":"Io immagino","description":"Io immagino","category_index":10,"icon_name":"ion-android-cloud-outline"}],"entities":["FL_EVENTS","FL_PLACES","FL_GROUPS","FL_ARTICLES"]},{"category_space":7,"name":"Valutazione","slug":"valutazione","description":"Teen-CarTo Valutazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-30,"name":"Risorsa","description":"Luoghi di ritrovo","category_index":1,"icon_name":"ion-ios-lightbulb"},{"id":-31,"name":"Criticità","description":"Criticità","category_index":2,"icon_name":"ion-android-warning"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":8,"name":"Trasformazione","slug":"trasformazione","description":"Teen-CarTo Trasformazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-40,"name":"Trasformazione positiva","description":"Trasformazione positiva","category_index":1,"icon_name":"ion-arrow-graph-up-right"},{"id":-41,"name":"Trasformazione negativa","description":"Trasformazione negativa","category_index":2,"icon_name":"ion-arrow-graph-down-right"},{"id":-42,"name":"Trasformazione assente","description":"Trasformazione assente","category_index":3,"icon_name":"ion-ios-pulse-strong"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}]
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
            "app_name" : "MiraMap",
            "domain_name": "miramap",
            "domain_id":5,
            "design":{
                "logo" : {
                    url: "http://www.firstlife.org/wp-content/uploads/2016/04/logo-miramap.png", 
                    title: "Miramap", alt:"miramap", label:{text: "Miramap", style: "color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;"}},
                "logo_partners" : [],
                "colors" : ["rgba(221,91,42, 1)","rgba(246,213,59, 1)", "rgba(61,131,97, 1)", "rgba(255,179,16, 1)", "rgba(243,164,106, 1)","rgba(174,10,10, 1)","rgba(130,50,86, 1)","rgba(45,69,104, 1)","rgba(63,127,145, 1)","rgba(136,186,92, 1)"],
                'logo_bar' : 'http://www.firstlife.org/wp-content/uploads/2016/04/logo-miramap-testo.png',
                'logo_menu' : 'http://www.firstlife.org/wp-content/uploads/2016/04/MiraMapFavicon-1.svg',
                'side_menu':[
                    {name:'Torna a MiraMap',url:'http://www.miramap.it/',icon:'ion-android-home',lang:'it'},
                    {name:'Scopri il progetto',url:'http://www.miramap.it/#seconda-sezione',lang:'it'},
                    {name:'News',url:'http://www.miramap.it/category/appuntamenti/',icon:'ion-social-rss',lang:'it'},
                ]
            },
            "actions":{
                "geolocation" : true,
                "favourite_place" : true,
                "alow_login": true,
                "alow_signup": true,
                "show_menu" : true,
            },
            "behaviour":{
                "is_login_required" : false,
                "umask":744,
                "viewer":false
            },
            "types":{
                "list":[
                    {"name":"Segnalazione","id":1,icon:"ion-clipboard","slug":"ticket","url":"tickets","key":"FL_TICKETS","index":8,
                     "properties":{
                         'description':{ key: 'description', label: 'DESCRIPTION', placeholder: 'DESCRIPTION', required:true, default:""},
                         'valid_from':{ key: 'valid_from', label: "STARTDATE_LABEL",placeholder:"STARTDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:false},
                         //'valid_to':{ key: 'valid_to', label: "ENDDATE_LABEL",placeholder:"ENDDATE_PLACEHOLDER", default:new Date(),required:true,is_editable:true},
                     },
                     "relations":{}
                    }
                ],
                //"exclude":["FL_PLACES","FL_EVENTS","FL_ARTICLES"],
                "categories":[
                    {"category_space":11,"name":"Stato","slug":"stato","description":"Mirafiori Sud Stato","is_editable":false,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-70,"name":"Ricevuto","description":"Ricevuto","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-71,"name":"In attuazione","description":"In attuazione","category_index":2,"icon_name":"ion-android-radio-button-on"},{"id":-72,"name":"Risolto/Completato","description":"Risolto/Completato","category_index":3,"icon_name":"ion-android-checkmark-circle"}],"entities":["FL_TICKETS"]},
                    {"category_space":9,"name":"Categoria","slug":"categoria","description":"Mirafiori Sud Categoria","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-50,"name":"Qualità Ambientale","description":"es. degrado, inquinamento, nettezza urbana","category_index":1,"icon_name":"ion-waterdrop"},{"id":-51,"name":"Attrezzature/Arredo urbano","description":"es. giochi per l'infanzia, fontane, panchine,  illuminazione","category_index":2,"icon_name":"ion-cube"},{"id":-52,"name":"Viabilità e suolo pubblico","description":"es. passaggi pedonali, piste ciclabili, segnaletica, manutenzione","category_index":3,"icon_name":"ion-alert-circled"},{"id":-53,"name":"Verde pubblico","description":"es. sfalcio dell'erba, siepi, rami, giardini","category_index":4,"icon_name":"ion-leaf"},{"id":-54,"name":"Protezione Animali","description":"es. aree cani, colonie feline, protezione animali","category_index":5,"icon_name":"ion-ios-paw"},{"id":-55,"name":"Sicurezza","description":"es. sicurezza aree gioco, vandalismi, illuminazione, abusivismo","category_index":6,"icon_name":"ion-ios-eye"},{"id":-56,"name":"Servizi pubblici","description":"es. trasporti pubblici, impianti sportivi, scuole, sanità","category_index":7,"icon_name":"ion-android-train"}],"entities":["FL_TICKETS"]},{"category_space":10,"name":"Tipologia","slug":"tipologia","description":"Mirafiori Sud Tipologia","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-60,"name":"Problema","description":"","category_index":1,"icon_name":"ion-alert"},{"id":-61,"name":"Realtà positiva","description":"","category_index":2,"icon_name":"ion-star"},{"id":-62,"name":"Proposta","description":"","category_index":3,"icon_name":"ion-android-bulb"}],"entities":["FL_TICKETS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}
                ]
            },
            "map":{ //45.021557, 7.624039
                "map_default_lat" : 45.021557,
                "map_default_lng" : 7.624039,
                'zoom_level' : 14,
                "area": {
                    style: {
                        fillColor: "#ffdac9",
                        weight: 3,
                        opacity: 1,
                        color: "#FC4A00",
                        dashArray: "1",
                        fillOpacity: 0.2,
                        clickable: false,
                    },
                    data: {
                        "type":"Feature",
                        "id":"relation/2615145",
                        "properties":{
                            "@id":"relation/2615145",
                            "admin_level":"10",
                            "boundary":"administrative",
                            "name":"Circoscrizione 10",
                            "type":"boundary"
                        },
                        "geometry":{
                            "type":"Polygon",
                            "coordinates":[[[7.5778348,45.0418278],[7.5798488,45.0398769],[7.5801061,45.0396277],[7.5808523,45.0385759],[7.5809819,45.0383931],[7.5810578,45.0382859],[7.5811685,45.0382253],[7.5826807,45.0373977],[7.5828721,45.0372964],[7.5835216,45.0365457],[7.5841364,45.0361603],[7.5842746,45.0360937],[7.5856249,45.0355337],[7.5858182,45.035446],[7.5866215,45.0351311],[7.5873363,45.0348519],[7.5879734,45.034586],[7.5883987,45.034488],[7.5885511,45.0344698],[7.5888107,45.0344058],[7.5890307,45.0343327],[7.5896781,45.0340536],[7.5907945,45.0334918],[7.5925929,45.0327019],[7.593912,45.0321031],[7.5940114,45.0320398],[7.5946307,45.0316453],[7.5956611,45.0310903],[7.5977396,45.0299455],[7.5980818,45.029888],[7.5984558,45.0299157],[7.5988016,45.0300397],[7.60155,45.028296],[7.6033421,45.0287507],[7.6061019,45.0294551],[7.6073523,45.0297827],[7.6066187,45.0285498],[7.6057606,45.0271709],[7.6049712,45.0259197],[7.604905,45.0258146],[7.603924,45.0242274],[7.6036577,45.0237965],[7.6032015,45.0230439],[7.6023139,45.021642],[7.6005146,45.0187799],[7.5993844,45.0189637],[7.5976437,45.0192469],[7.5963076,45.019451],[7.5946815,45.0197056],[7.5944458,45.0197427],[7.5942598,45.0197539],[7.5941347,45.0197618],[7.5940116,45.0197696],[7.5933828,45.019887],[7.5926881,45.0199144],[7.5919571,45.019735],[7.5918458,45.019444],[7.5918363,45.0193636],[7.5918846,45.018901],[7.5922759,45.0176229],[7.5923843,45.0172631],[7.5915499,45.016976],[7.5908813,45.0167521],[7.5897639,45.0163778],[7.5905103,45.016158],[7.590809,45.0160736],[7.5909144,45.0160416],[7.5915372,45.0153875],[7.5919001,45.0150309],[7.5923925,45.0145476],[7.5929709,45.0141323],[7.5931153,45.0140286],[7.5941357,45.0140759],[7.5946724,45.0144506],[7.5947548,45.0146012],[7.5948742,45.0148271],[7.5949261,45.0149279],[7.5953518,45.0149737],[7.5954708,45.0149887],[7.596092,45.0147565],[7.5966328,45.0145508],[7.596686,45.0144584],[7.5968758,45.014105],[7.5963841,45.0131441],[7.5961597,45.0125567],[7.5964017,45.0122751],[7.5966591,45.0121965],[7.598242,45.0120971],[7.5988344,45.0125758],[7.5991607,45.0127767],[7.5994496,45.0129807],[7.5996153,45.0130601],[7.6010893,45.0135093],[7.6026024,45.0132764],[7.6033738,45.0128168],[7.6045373,45.0123568],[7.6046093,45.0123264],[7.6059049,45.0117875],[7.6060932,45.0116305],[7.6064277,45.0113433],[7.606563,45.011228],[7.6070843,45.0111296],[7.6071862,45.0111021],[7.6073831,45.0110621],[7.6075187,45.0110731],[7.6080252,45.0110871],[7.6083196,45.0108256],[7.6085226,45.010632],[7.6088277,45.0103424],[7.6090791,45.0101113],[7.6091993,45.0100515],[7.6100458,45.0097902],[7.6104765,45.0098173],[7.6105665,45.0098456],[7.6109049,45.0099624],[7.6113213,45.0101145],[7.611665,45.0102344],[7.6117338,45.0102499],[7.6121637,45.0103973],[7.6134134,45.0108311],[7.6139373,45.011092],[7.6143648,45.0111822],[7.6146256,45.0110813],[7.6152211,45.0108396],[7.6152979,45.0108304],[7.6154656,45.0107788],[7.6156422,45.0107353],[7.6162549,45.0106788],[7.6171914,45.0104168],[7.6174281,45.010379],[7.6181373,45.0102475],[7.6188239,45.0099695],[7.6199698,45.0094115],[7.6201756,45.0093153],[7.6204037,45.0092137],[7.6207931,45.0090468],[7.6208868,45.0090071],[7.6213461,45.0088125],[7.6225968,45.0084296],[7.6227036,45.0084036],[7.6229794,45.0083129],[7.6233732,45.0082579],[7.6234864,45.0082367],[7.6235675,45.0082229],[7.6239225,45.0081741],[7.6241516,45.0081274],[7.6251871,45.0080769],[7.6265125,45.0080979],[7.6275668,45.008333],[7.6279049,45.0088202],[7.6279916,45.0091192],[7.6284644,45.0095166],[7.6285949,45.0096286],[7.629015,45.0103643],[7.629338,45.0103663],[7.6295945,45.0103747],[7.6308214,45.0103995],[7.6315211,45.0103899],[7.6322438,45.0103267],[7.6324702,45.0102985],[7.6335273,45.0101154],[7.6344923,45.0095828],[7.6347031,45.009435],[7.6347725,45.0093771],[7.6363653,45.0081977],[7.6366239,45.0081035],[7.6366991,45.0080939],[7.637146,45.0081803],[7.6372828,45.0082945],[7.637342,45.0083445],[7.6373977,45.00839],[7.6375939,45.0085517],[7.6379923,45.0088799],[7.6382143,45.0089531],[7.6390374,45.0088439],[7.6396898,45.0086104],[7.640062,45.0084642],[7.6404273,45.0082849],[7.6406432,45.0080066],[7.6408355,45.0077562],[7.6410046,45.0075348],[7.6411646,45.0073255],[7.6417933,45.0071444],[7.6423854,45.0069831],[7.6426799,45.0069717],[7.6438449,45.0069047],[7.6443915,45.0067924],[7.6445702,45.0070423],[7.6446665,45.0070128],[7.6453646,45.0069678],[7.6454726,45.0069769],[7.6456214,45.0070243],[7.6458062,45.0070948],[7.645937,45.0071723],[7.6462117,45.0070615],[7.6464928,45.0071978],[7.6469093,45.0075545],[7.647467,45.007726],[7.647534,45.0077726],[7.6476654,45.0077978],[7.6478078,45.0078478],[7.6481545,45.0079056],[7.6490467,45.0080015],[7.6498078,45.0079185],[7.650084,45.0080432],[7.6504622,45.0082095],[7.6505738,45.0082591],[7.650663,45.0083085],[7.6507124,45.0083411],[7.6507991,45.0083982],[7.650962,45.0085098],[7.6510261,45.0085513],[7.6511525,45.0086386],[7.6512632,45.0087098],[7.6514542,45.008737],[7.651578,45.0087573],[7.6517282,45.0088096],[7.6519198,45.008891],[7.6520883,45.0089152],[7.6522189,45.0088738],[7.652299,45.0088086],[7.6523982,45.0087088],[7.6524104,45.0086443],[7.6524223,45.008559],[7.6524301,45.0085005],[7.6524394,45.0084286],[7.6524505,45.0083432],[7.6524654,45.008242],[7.6524969,45.0081627],[7.6525529,45.0080642],[7.6532966,45.0079263],[7.6534643,45.0079544],[7.6536124,45.0079389],[7.6537371,45.0079534],[7.6540346,45.007941],[7.6541177,45.007902],[7.6541804,45.0078755],[7.6542454,45.0078491],[7.6543823,45.0077923],[7.6544609,45.0077243],[7.6545645,45.0076355],[7.6547028,45.0075544],[7.6551163,45.0073118],[7.6554258,45.0080491],[7.6555112,45.0082557],[7.6557253,45.0087642],[7.655743,45.0088258],[7.6557689,45.0088835],[7.656052,45.0095493],[7.6564566,45.0105009],[7.6567243,45.011164],[7.6570741,45.0120287],[7.6574858,45.0130378],[7.6579574,45.0140915],[7.6581987,45.0146305],[7.6587386,45.0158972],[7.6588902,45.0162637],[7.6584392,45.017501],[7.6582741,45.0179867],[7.6580957,45.0185797],[7.6580136,45.0189585],[7.6579622,45.0193778],[7.6564903,45.0197428],[7.6504328,45.0218875],[7.6481181,45.0177321],[7.6480686,45.017508],[7.64791,45.0175126],[7.6448691,45.0181466],[7.6435612,45.0184636],[7.6401414,45.0210698],[7.6350708,45.0228233],[7.6359355,45.0233632],[7.6361223,45.0234887],[7.6365801,45.0239245],[7.6370005,45.0242943],[7.6374676,45.0247367],[7.6427351,45.0294338],[7.6249377,45.0355959],[7.6165194,45.0318177],[7.6149873,45.032361],[7.6137499,45.0328027],[7.6116114,45.0337465],[7.6091227,45.0347954],[7.6081208,45.0351565],[7.6076626,45.0353077],[7.6074024,45.0353693],[7.6072979,45.035416],[7.6065192,45.0356191],[7.6051565,45.0362837],[7.6048089,45.0364859],[7.6044588,45.0366615],[7.6032656,45.0372365],[7.6000269,45.0387938],[7.5994549,45.0390078],[7.5990379,45.0391828],[7.5989508,45.0392205],[7.5986529,45.0393492],[7.5981672,45.0395662],[7.5968851,45.039816],[7.5967255,45.039847],[7.5962287,45.0400304],[7.5952311,45.0404548],[7.5943776,45.0408271],[7.5930718,45.0414245],[7.5927092,45.0415845],[7.5926184,45.041687],[7.5926018,45.0419767],[7.592565,45.0421194],[7.5918388,45.0424837],[7.5904085,45.0431498],[7.5895888,45.0434957],[7.5887665,45.0438827],[7.5885461,45.0439864],[7.5867072,45.044852],[7.585685,45.0438365],[7.5839222,45.0420773],[7.5837585,45.0421508],[7.5830018,45.0425864],[7.5828024,45.042688],[7.5824885,45.0428694],[7.5822604,45.0430255],[7.5821717,45.0430613],[7.5822373,45.0435772],[7.5822186,45.0436551],[7.5821496,45.0437129],[7.5816406,45.0438735],[7.5813703,45.0439721],[7.5812282,45.0439964],[7.5811834,45.0439268],[7.5803066,45.0442955],[7.5778348,45.0418278]]]
                        }    
                    },
                }
            }
        },
        6:{  
            'app_name' : 'CSCW',
            'domain_name': 'cscw',
            'domain_id':6,
            'design':{
                'logo' : {url: 'http://www.firstlife.org/wp-content/uploads/2016/02/logocscw-new-1.png', title: '', alt:'', label:{text: 'CSCW', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'logo_partners' : [],
                'colors' : ['rgba(221,91,42, 1)','rgba(246,213,59, 1)', 'rgba(61,131,97, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(136,186,92, 1)'],
                'default_language' : 'en',
                "default_background": "http://www.firstlife.org/wp-content/uploads/2016/02/san-francisco-night.jpg"
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
                'umask':777,
                'viewer':false
            },

            types:{
                categories:[{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]},{"category_space":26,"name":"Topics","slug":"topics","description":"CSCW Topics","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-240,"name":"Health","description":"Health","category_index":1,"icon_name":"ion-heart"},{"id":-241,"name":"Gamification and Hacking","description":"Gamification and Hacking","category_index":2,"icon_name":"ion-ios-game-controller-a"},{"id":-242,"name":"Multimedia and Data Science","description":"Multimedia and Data Science","category_index":3,"icon_name":"ion-videocamera"},{"id":-243,"name":"Open Science and Infrastructure","description":"Open Science and Infrastructure","category_index":4,"icon_name":"ion-home"},{"id":-244,"name":"Digital learning environment","description":"Digital learning environment","category_index":5,"icon_name":"ion-university"},{"id":-245,"name":"Crowd, Peer production and Collaborative work","description":"Crowd, Peer production and Collaborative work","category_index":6,"icon_name":"ion-person-add"},{"id":-246,"name":"Ethics and Sharing economy","description":"Ethics and Sharing economy","category_index":7,"icon_name":"ion-earth"},{"id":-247,"name":"Personal data","description":"Personal data","category_index":8,"icon_name":"ion-eye"},{"id":-248,"name":"Humanitarian ICT","description":"Humanitarian ICT","category_index":9,"icon_name":"ion-help-buoy"},{"id":-249,"name":"Social media","description":"Social media","category_index":10,"icon_name":"ion-thumbsup"},{"id":-250,"name":"Accessibility and Public Spaces","description":"Accessibility and Public Spaces","category_index":11,"icon_name":"ion-map"},{"id":-251,"name":"Usability","description":"Usability","category_index":12,"icon_name":"ion-bug"},{"id":-252,"name":"Telepresence and Autonomous Systems","description":"Telepresence and Autonomous Systems","category_index":13,"icon_name":"ion-monitor"},{"id":-253,"name":"Family and Work","description":"Family and Work","category_index":14,"icon_name":"ion-android-people"},{"id":-254,"name":"Demonstration and Exhibition","description":"Demonstration and Exhibition","category_index":15,"icon_name":"ion-podium"},{"id":-255,"name":"Conviviality and Networking","description":"Conviviality and Networking","category_index":16,"icon_name":"ion-chatbubbles"}],"entities":["FL_ARTICLES","FL_EVENTS"]},{"category_space":27,"name":"Event type","slug":"event-type","description":"CSCW Event Type","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-260,"name":"Presentation","description":"Presentation","category_index":1,"icon_name":"ion-chatbox-working"},{"id":-261,"name":"Social event","description":"Social event","category_index":2,"icon_name":"ion-beer"},{"id":-262,"name":"Panel, Poster, Demo and Workshop","description":"Panel, Poster, Demo and Workshop","category_index":3,"icon_name":"ion-erlenmeyer-flask"},{"id":-263,"name":"Keynote","description":"Keynote","category_index":4,"icon_name":"ion-mic-b"}],"entities":["FL_EVENTS"]},{"category_space":28,"name":"Conference spots","slug":"conference-spots","description":"CSCW Conference spots","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-270,"name":"Session room","description":"Session room","category_index":1,"icon_name":"ion-easel"},{"id":-271,"name":"Relax area","description":"Relax area","category_index":2,"icon_name":"ion-coffee"},{"id":-272,"name":"Meeting point","description":"Meeting point","category_index":3,"icon_name":"ion-radio-waves"},{"id":-273,"name":"Canteen","description":"Canteen","category_index":4,"icon_name":"ion-android-restaurant"}],"entities":["FL_PLACES"]}]
            },
            "actions":{
                'favourite_place' : false,
            },
            "navigator":{//[[[-122.3963988,37.7938376],[-122.3963988,37.7947639],[-122.3950612,37.7947639],[-122.3950612,37.7938376],[-122.3963988,37.7938376]]]
                'default_area' : {visible: true, name: 'San Francisco',bound:[[-122.520905,37.700987],[-122.339973,37.834243]]},
                'places' :[
                    {id:19, visible:true, name: 'Hyatt Regency Hotel: CSCW2016 venue', bound: [[37.7938376,-122.3963988],[37.7947639,-122.3950612]]},
                    //[[[-122.3991000652,37.8005205886],[-122.3991000652,37.8013476973],[-122.3979628086,37.8013476973],[-122.3979628086,37.8005205886],[-122.3991000652,37.8005205886]]]
                    {id:19, visible:true, name: 'Exploratorium: Conference Banquet', bound: [[37.8005205886,-122.3991000652],[37.8013476973,-122.3979628086]]}
                ],
                'search':{
                    'geocoding':'http://nominatim.openstreetmap.org/search'
                }
            },
            "map":{
                "map_default_lat":37.794203,
                "map_default_lng":-122.395806,
                "zoom_level":19,
                "zoom_create":22,
                'max_zoom' : 22,
                'min_zoom' : 10, //https://api.tiles.mapbox.com/v4/alessiacalafiore.1a8075f6/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYWxlc3NpYWNhbGFmaW9yZSIsImEiOiJkNTljMmIwMzQ4MTNmNWVkYmNiMDM0NjFiOTAwNGNiOCJ9.sAiwGQm8n0AuWIX4zF8vJw
                'tile_edit' : 'http://api.mapbox.com/v4/mapbox.high-contrast/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
                'tile_view' : 'http://api.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ',
                "area":{
                    "style":{
                        fillColor:"#f9f9f9",
                        weight:2,
                        opacity:1,
                        color:"#C83127",
                        //dashArray:'10',
                        fillOpacity:1,
                        clickable:false,
                    },
                    "levels":[
                        {"level":0,name:'1 Street level',id:1,icon:'ion-social-buffer-outline',slug:'ground-level',key:0,index:1},
                        {"level":1,name:'2 Bay level',id:2,icon:'ion-social-buffer-outline',slug:'first-level',key:1,index:2},
                        {"level":2,name:'3 Atrium level',id:3,icon:'ion-social-buffer-outline',slug:'second-level',key:2,index:3}
                    ],
                    "data":{
                        "type": "FeatureCollection",
                        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                        "features": [
                            {"type":"Feature","properties":{"level": 0, name:"base"},"geometry":{"type":"Polygon","coordinates":[[[-122.39641785621644,37.794565270571546],[-122.39525109529497,37.79473059269872],[-122.39504456520079,37.79456103153778],[-122.39594846963882,37.79383615318685],[-122.39626228809357,37.79379800149768],[-122.39641785621644,37.794565270571546]]]}},
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "1", "name": "Regency A", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396252497849574, 37.794583823292371 ], [ -122.39613158768249, 37.794598547180172 ], [ -122.396107832206695, 37.794483958114533 ], [ -122.396225887402224, 37.794467859678782 ], [ -122.396252497849574, 37.794583823292371 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "2", "name": "Regency B", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396131547440646, 37.794598441798897 ], [ -122.396006343626183, 37.794614468487111 ], [ -122.395985081634109, 37.794501062702508 ], [ -122.396107608617356, 37.794484964266751 ], [ -122.396131547440646, 37.794598441798897 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "3", "name": "Plaza Room", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395914154927709, 37.794628514893688 ], [ -122.395785636997218, 37.794646487735427 ], [ -122.395768130058528, 37.794535219670927 ], [ -122.395894234471939, 37.794517161138295 ], [ -122.395914154927709, 37.794628514893688 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "4", "name": "Grand Ballroom A", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396124024851019, 37.794440270648607 ], [ -122.395675400128567, 37.794506624488506 ], [ -122.395646462889346, 37.794345640130956 ], [ -122.396093298896716, 37.794288401248274 ], [ -122.396124024851019, 37.794440270648607 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "5", "name": "Grand Ballroom C", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395645293834008, 37.794346255001784 ], [ -122.395618842181889, 37.794183817313261 ], [ -122.395850854755963, 37.794158052326338 ], [ -122.395872525340124, 37.794316182229451 ], [ -122.395645293834008, 37.794346255001784 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "6", "name": "Grand Ballroom B", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396093277935691, 37.794288233556216 ], [ -122.395872651109329, 37.79431621017806 ], [ -122.395850243928351, 37.794156812653291 ], [ -122.396090203581508, 37.794129317400284 ], [ -122.396093277935691, 37.794288233556216 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "7", "name": "Grand Ballroom Foyer", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39612652056573, 37.794440268901297 ], [ -122.396126704430372, 37.794307279183464 ], [ -122.396121201643851, 37.794269005975835 ], [ -122.396088823615756, 37.794129203859384 ], [ -122.396300385229765, 37.794094162947786 ], [ -122.39630704685537, 37.794115788496299 ], [ -122.396292537431279, 37.79411896651952 ], [ -122.396302575067679, 37.794155140228028 ], [ -122.396348051679951, 37.794152016218057 ], [ -122.396403377251744, 37.794408406270328 ], [ -122.39612652056573, 37.794440268901297 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "13", "name": "Market Street Foyer", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395764319658667, 37.794167398339418 ], [ -122.395618874364004, 37.794184513627393 ], [ -122.395604762608912, 37.794110176666727 ], [ -122.39591807667469, 37.793870948922532 ], [ -122.395918896157255, 37.793911308438645 ], [ -122.395941661122748, 37.793907757358497 ], [ -122.395977842722601, 37.794054799808336 ], [ -122.395824655662736, 37.79407459033888 ], [ -122.395758585415834, 37.794121730966268 ], [ -122.395764398085674, 37.794167385535026 ], [ -122.39576439808566, 37.794167387135559 ], [ -122.395764319658667, 37.794167398339418 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "14", "name": "Car Rental Desk", "type": "shop" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395944301524267, 37.793918651428342 ], [ -122.39597009478392, 37.7939127912381 ], [ -122.395977041415435, 37.793936964635144 ], [ -122.395950502179758, 37.79394321477033 ], [ -122.395944301524267, 37.793918651428342 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "15", "name": "Women's Lounge", "type": "lounge" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395764398085717, 37.794167387135559 ], [ -122.395758585415905, 37.794121735768151 ], [ -122.395960570872873, 37.794096228734603 ], [ -122.395965043942354, 37.794116254037753 ], [ -122.395987183675786, 37.79411281762679 ], [ -122.395993497711245, 37.794139786460818 ], [ -122.395764398085717, 37.794167387135559 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "16", "name": "Men's lounge", "type": "lounge" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395960622290389, 37.794096141704514 ], [ -122.395758942828905, 37.794122005954819 ], [ -122.395824649457808, 37.794074578534733 ], [ -122.39597721171738, 37.794054552429429 ], [ -122.395981372385862, 37.794075840711365 ], [ -122.395956881553232, 37.794079118751604 ], [ -122.395960622290389, 37.794096141704514 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "18", "name": "Elevators", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396160487283169, 37.793938259640882 ], [ -122.396030066223958, 37.79396048397652 ], [ -122.396020742909073, 37.793924274591951 ], [ -122.396151309933842, 37.793900983732868 ], [ -122.396160487283169, 37.793938259640882 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "19", "name": "Elevator", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39618345147484, 37.794082324438818 ], [ -122.396052757222378, 37.794103532798793 ], [ -122.396046509202435, 37.79408331177688 ], [ -122.396174522978882, 37.794062870942447 ], [ -122.39618345147484, 37.794082324438818 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 0, "osm_id": "19", "name": "Escalator", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396182907670735, 37.794053865357498 ], [ -122.396052757222378, 37.794075254985501 ], [ -122.396045078330417, 37.794053464276935 ], [ -122.396176216116828, 37.794031187580998 ], [ -122.396182907670735, 37.794053865357498 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396472515298754, 37.794491589496147 ], [ -122.396474988731327, 37.794494946297462 ], [ -122.396474988731327, 37.794494946297462 ], [ -122.396414212960096, 37.794502013247602 ], [ -122.396414212960096, 37.794502013247602 ], [ -122.396414212960096, 37.794502013247602 ], [ -122.396421503462378, 37.794558548848734 ], [ -122.396425520080328, 37.794558548848734 ], [ -122.396425520080328, 37.794558548848734 ], [ -122.395256722264278, 37.794724286848883 ], [ -122.395256973302907, 37.794724035810262 ], [ -122.395257475380149, 37.794724537887504 ], [ -122.395034744292403, 37.794552895288625 ], [ -122.395034744292403, 37.794552895288625 ], [ -122.395034744292403, 37.794552895288625 ], [ -122.395917406365115, 37.793873761379999 ], [ -122.395917406365115, 37.793873761379999 ], [ -122.395917406365115, 37.793873761379999 ], [ -122.395925886705285, 37.793915456385832 ], [ -122.395925886705285, 37.793915456385832 ], [ -122.395925886705285, 37.793915456385832 ], [ -122.396288421247561, 37.793863867649797 ], [ -122.396288421247561, 37.793863867649797 ], [ -122.396288421247561, 37.793863867649797 ], [ -122.396305428806244, 37.793960751594511 ], [ -122.396305436651204, 37.793960775129385 ], [ -122.396306432960742, 37.793967090319725 ], [ -122.39634248341612, 37.793957328065424 ], [ -122.39634248341612, 37.793957328065424 ], [ -122.396342483416149, 37.793957328065424 ], [ -122.396342483416149, 37.793957328065424 ], [ -122.396347395465696, 37.793967103400718 ], [ -122.396356537959846, 37.793985916970193 ], [ -122.396365350719492, 37.794004887232788 ], [ -122.396373831060188, 37.794024008409984 ], [ -122.396381976398729, 37.794043274677286 ], [ -122.396389784253955, 37.794062680166007 ], [ -122.396397252247553, 37.794082218965031 ], [ -122.396404378104663, 37.794101885122664 ], [ -122.39641115965469, 37.794121672648401 ], [ -122.396417594831917, 37.794141575514772 ], [ -122.396423681676126, 37.794161587659168 ], [ -122.396429418333199, 37.794181702985696 ], [ -122.396434803055698, 37.794201915367033 ], [ -122.396439834203392, 37.79422221864629 ], [ -122.396444510243725, 37.794242606638889 ], [ -122.396448829752345, 37.794263073134466 ], [ -122.396452791413481, 37.794283611898706 ], [ -122.396456394020376, 37.794304216675322 ], [ -122.39645963647564, 37.794324881187883 ], [ -122.396462517791591, 37.794345599141792 ], [ -122.39646503709055, 37.79436636422615 ], [ -122.396467193605119, 37.794387170115712 ], [ -122.3964689866784, 37.794408010472807 ], [ -122.396470415764199, 37.794428878949262 ], [ -122.396471480427209, 37.794449769188326 ], [ -122.396472180343139, 37.794470674826641 ], [ -122.396472515298754, 37.794491589496147 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 2, "level": 1, "Name": "Business Center", "Type": "shop" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396189606705889, 37.793975855206234 ], [ -122.396006550325154, 37.794001517315685 ], [ -122.395995430077733, 37.793942494463955 ], [ -122.396177631054812, 37.793915976950856 ], [ -122.396189606705889, 37.793975855206234 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 3, "level": 1, "Name": "Sales and Events", "Type": "shop" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395956936913564, 37.794082780662265 ], [ -122.395573716079156, 37.794134960284808 ], [ -122.395916732942098, 37.793874062172094 ], [ -122.395956936913564, 37.794082780662265 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 4, "level": 1, "Name": "Escalator", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39621419956076, 37.794036802716185 ], [ -122.396084178206223, 37.794054766192794 ], [ -122.39608075659163, 37.794036375014358 ], [ -122.396210564095256, 37.794017128432273 ], [ -122.39621419956076, 37.794036802716185 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 5, "level": 1, "Name": "Escalator1", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39621933198265, 37.794063961782022 ], [ -122.396089310628113, 37.794081925258631 ], [ -122.39608588901352, 37.794063534080195 ], [ -122.396215696517146, 37.79404428749811 ], [ -122.39621933198265, 37.794063961782022 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 6, "level": 1, "Name": "Seacliff D", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396403243767026, 37.794410721035931 ], [ -122.396181694222122, 37.794443226374561 ], [ -122.396165013850975, 37.79436281843163 ], [ -122.396385280290403, 37.79433116849664 ], [ -122.396403243767026, 37.794410721035931 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 7, "level": 1, "Name": "Seacliff A", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396350208740841, 37.794172063418074 ], [ -122.396128659195938, 37.794204568756705 ], [ -122.396111978824791, 37.794124160813773 ], [ -122.396332245264219, 37.794092510878784 ], [ -122.396350208740841, 37.794172063418074 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 8, "level": 1, "Name": "Seacliff B", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396367744515615, 37.794251615957364 ], [ -122.396146194970711, 37.794284121295995 ], [ -122.396129514599565, 37.794203713353063 ], [ -122.396349781038992, 37.794172063418074 ], [ -122.396367744515615, 37.794251615957364 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 9, "level": 1, "Name": "Seacliff C", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396385707992238, 37.794331596198468 ], [ -122.396164158447334, 37.794364101537099 ], [ -122.396147478076188, 37.794283693594167 ], [ -122.396367744515615, 37.794252043659178 ], [ -122.396385707992238, 37.794331596198468 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 10, "level": 1, "Name": "Men's lounge", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396169985884782, 37.794500324568112 ], [ -122.396159239876454, 37.794446327212817 ], [ -122.396264454525181, 37.794431357648968 ], [ -122.396274719368961, 37.794485248078807 ], [ -122.396169985884782, 37.794500324568112 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 11, "level": 1, "Name": "Women's lounge", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396181480371297, 37.794554963476145 ], [ -122.396169932422055, 37.794500217642657 ], [ -122.396275147070781, 37.794485248078807 ], [ -122.396285411914562, 37.794539138508647 ], [ -122.396181480371297, 37.794554963476145 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 12, "level": 1, "Name": "Golden Gate Room", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396181587296809, 37.794555284252517 ], [ -122.396048999731306, 37.794573675430954 ], [ -122.39602761464009, 37.794464183763957 ], [ -122.396158919100131, 37.794446647989162 ], [ -122.396181587296809, 37.794555284252517 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 13, "level": 1, "Name": "Stairs to Atrium", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396041301098478, 37.794534540714039 ], [ -122.396048999731306, 37.794574316983692 ], [ -122.395994681599632, 37.794582443318355 ], [ -122.395987624519535, 37.794542453197785 ], [ -122.396041301098478, 37.794534540714039 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 14, "level": 1, "Name": "Marina Room", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395948703653531, 37.79458821729299 ], [ -122.395737418952351, 37.794618156420682 ], [ -122.395716033861149, 37.794506526244561 ], [ -122.395926463158659, 37.794477442520517 ], [ -122.395948703653531, 37.79458821729299 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 15, "level": 1, "Name": "Bayview Room B", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395626216478078, 37.794632698282733 ], [ -122.395379860227322, 37.794667769832323 ], [ -122.395344788677733, 37.794499255313575 ], [ -122.395592855735785, 37.794465894571289 ], [ -122.395626216478078, 37.794632698282733 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 16, "level": 1, "Name": "Bayview Room A", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395593176512165, 37.794465734183099 ], [ -122.39534489560323, 37.794499308776295 ], [ -122.395328429083023, 37.794414623815086 ], [ -122.395574785333764, 37.794378696861848 ], [ -122.395593176512165, 37.794465734183099 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 17, "level": 1, "Name": "Bayview Foyer B", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395380181003759, 37.794668678698706 ], [ -122.395242461016352, 37.7946793712443 ], [ -122.395227063750681, 37.794588698457567 ], [ -122.395307043991806, 37.794532669518588 ], [ -122.395350241876059, 37.794527109394878 ], [ -122.395380181003759, 37.794668678698706 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 18, "level": 1, "Name": "Bayview Foyer A", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395574785333764, 37.79437869686187 ], [ -122.395328856784843, 37.794414623815108 ], [ -122.395312622539592, 37.794340853804478 ], [ -122.395532870555002, 37.794168695266187 ], [ -122.395574785333764, 37.79437869686187 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 1, "level": 1, "Name": "Seacliff Foyer", "Type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396472531462891, 37.79449096859075 ], [ -122.396472531462848, 37.794490861665317 ], [ -122.396472531462848, 37.794490861665317 ], [ -122.396422062647588, 37.794497704894503 ], [ -122.396422062647588, 37.794497704894503 ], [ -122.396422062647588, 37.794497704894503 ], [ -122.39630914936599, 37.793978154103499 ], [ -122.39630914936599, 37.793978154103499 ], [ -122.39630914936599, 37.793978154103499 ], [ -122.396311715576985, 37.793977726401678 ], [ -122.396349353337513, 37.793970883172491 ], [ -122.396349353337513, 37.793970883172491 ], [ -122.396355383311203, 37.793983069782641 ], [ -122.396364084617275, 37.79400132206667 ], [ -122.396372466051815, 37.794019723429514 ], [ -122.396380525061758, 37.794038268265943 ], [ -122.39638825919225, 37.794056950927022 ], [ -122.3963956660874, 37.794075765721828 ], [ -122.396402743491009, 37.794094706919196 ], [ -122.396409489247205, 37.794113768749455 ], [ -122.396415901301197, 37.794132945406176 ], [ -122.396421977699788, 37.794152231047981 ], [ -122.396427716592044, 37.79417161980026 ], [ -122.396433116229872, 37.794191105757022 ], [ -122.396438174968452, 37.794210682982651 ], [ -122.396442891266872, 37.794230345513732 ], [ -122.396447263688501, 37.794250087360879 ], [ -122.396451290901439, 37.794269902510521 ], [ -122.396454971678978, 37.794289784926775 ], [ -122.396458304899895, 37.794309728553273 ], [ -122.396461289548881, 37.794329727314981 ], [ -122.39646392471677, 37.794349775120089 ], [ -122.39646620960086, 37.794369865861846 ], [ -122.39646814350516, 37.794389993420403 ], [ -122.396469725840603, 37.794410151664721 ], [ -122.396470956125157, 37.794430334454404 ], [ -122.396471833984094, 37.794450535641573 ], [ -122.396472359149996, 37.794470749072758 ], [ -122.396472531462891, 37.79449096859075 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 19, "level": 1, "Name": "Women's lounge", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395342116121284, 37.794485462039297 ], [ -122.395342131156298, 37.794485477074332 ], [ -122.395251965931948, 37.794550894598288 ], [ -122.395246312751297, 37.794515892990432 ], [ -122.395335320276473, 37.794449979309682 ], [ -122.395342116121284, 37.794485462039297 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 20, "level": 1, "Name": "Men's lounge", "Type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395335139855803, 37.794450099590115 ], [ -122.395335154890816, 37.79445011462515 ], [ -122.395246312751297, 37.794515832850202 ], [ -122.395239336485815, 37.79448053054125 ], [ -122.395328344010991, 37.7944146168605 ], [ -122.395335139855803, 37.794450099590115 ] ] ] } },
                            { "type": "Feature", "properties": { "level": 2 }, "geometry": { "type": "LineString", "coordinates": [ [ -122.396417572176688, 37.794573008457988 ], [ -122.396269962248496, 37.793826186084161 ], [ -122.396191444950773, 37.793836892169388 ], [ -122.396201908222864, 37.793891740049716 ], [ -122.396077900216056, 37.793909060432973 ], [ -122.396076937972552, 37.793898475754318 ], [ -122.395949921828631, 37.793913871650545 ], [ -122.395951846315668, 37.793923494085696 ], [ -122.395865122992788, 37.793933156989702 ], [ -122.395856584207721, 37.793898956876092 ], [ -122.395066582282283, 37.794568678362182 ], [ -122.395261917715757, 37.794717344985173 ], [ -122.395262398837517, 37.794738514342491 ], [ -122.395303294186874, 37.794734184246671 ], [ -122.395325425787718, 37.794710128158812 ], [ -122.395349962997329, 37.794726005176798 ], [ -122.395370651232895, 37.794703873575969 ], [ -122.395396150686025, 37.794720231715715 ], [ -122.395416838921591, 37.794699062358397 ], [ -122.395441376131217, 37.794713977132886 ], [ -122.395461583245023, 37.794693770019087 ], [ -122.395486120454635, 37.794707722550044 ], [ -122.395506327568441, 37.794687034314485 ], [ -122.39553278926509, 37.794702430210712 ], [ -122.395551071891873, 37.794681260853395 ], [ -122.395577533588522, 37.794696656749629 ], [ -122.395597740702328, 37.794675006270552 ], [ -122.395623240155459, 37.794690402166779 ], [ -122.395643447269265, 37.794668751687702 ], [ -122.395669427844155, 37.794684147583936 ], [ -122.395689153836202, 37.794662978226619 ], [ -122.395713691045827, 37.794678374122846 ], [ -122.395732935916115, 37.794656723643769 ], [ -122.395759878734523, 37.794672600661762 ], [ -122.395780085848315, 37.794651431304445 ], [ -122.395805104179701, 37.79466634607892 ], [ -122.395825792415252, 37.794646138965113 ], [ -122.3958488862596, 37.7946620159831 ], [ -122.395869093373406, 37.794639884382271 ], [ -122.395885932634911, 37.794638922138752 ], [ -122.396417692457121, 37.794572707756977 ] ] } },
                            { "type": "Feature", "properties": { "id": 1, "level": 2, "Name": "Administration Office", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396326820469568, 37.794584059401053 ], [ -122.396327291474122, 37.79458405572133 ], [ -122.396257055816804, 37.794285285563781 ], [ -122.396244986325314, 37.794287758337653 ], [ -122.396257350194645, 37.794285462190487 ], [ -122.396244456445203, 37.794287699462075 ], [ -122.396238037813347, 37.794285339642009 ], [ -122.396235955522954, 37.794283119769567 ], [ -122.396233912291805, 37.794280863894244 ], [ -122.396231908742323, 37.794278572703206 ], [ -122.396229945484777, 37.794276246894363 ], [ -122.396228023117203, 37.794273887176182 ], [ -122.396226142225174, 37.794271494267463 ], [ -122.396224303381629, 37.794269068897094 ], [ -122.396222507146703, 37.794266611803884 ], [ -122.396220754067542, 37.794264123736276 ], [ -122.396219044678148, 37.794261605452164 ], [ -122.39621737949922, 37.794259057718641 ], [ -122.396215759038, 37.79425648131177 ], [ -122.396214183788075, 37.794253877016345 ], [ -122.396212654229288, 37.794251245625674 ], [ -122.396211170827556, 37.79424858794129 ], [ -122.396209734034741, 37.794245904772758 ], [ -122.39620834428851, 37.794243196937387 ], [ -122.39620700201219, 37.794240465260017 ], [ -122.396205707614641, 37.794237710572752 ], [ -122.396204461490171, 37.794234933714677 ], [ -122.396203264018339, 37.794232135531665 ], [ -122.396202115563909, 37.794229316876063 ], [ -122.396201016476724, 37.794226478606461 ], [ -122.396199967091562, 37.794223621587427 ], [ -122.396198967728097, 37.794220746689234 ], [ -122.396198018690725, 37.794217854787604 ], [ -122.396197120268539, 37.794214946763439 ], [ -122.39619627273521, 37.794212023502553 ], [ -122.396195476348893, 37.794209085895396 ], [ -122.396194731352182, 37.794206134836799 ], [ -122.396194037972023, 37.794203171225668 ], [ -122.396193396419605, 37.794200195964763 ], [ -122.396192806890369, 37.794197209960366 ], [ -122.396192269563883, 37.794194214122051 ], [ -122.396191784603815, 37.794191209362374 ], [ -122.396191352157899, 37.794188196596622 ], [ -122.396190972357871, 37.794185176742502 ], [ -122.396190645319393, 37.794182150719898 ], [ -122.396190371142112, 37.794179119450561 ], [ -122.396190149909529, 37.794176083857849 ], [ -122.396189981689034, 37.794173044866433 ], [ -122.396189866531884, 37.794170003402016 ], [ -122.396189804473138, 37.79416696039106 ], [ -122.396189795531711, 37.794163916760496 ], [ -122.396189839710317, 37.794160873437441 ], [ -122.396189936995512, 37.794157831348919 ], [ -122.396190087357667, 37.79415479142159 ], [ -122.396190290750951, 37.794151754581435 ], [ -122.396190547113434, 37.794148721753501 ], [ -122.396190856367014, 37.79414569386163 ], [ -122.396191218417485, 37.794142671828141 ], [ -122.396191633154586, 37.79413965657357 ], [ -122.396192100451955, 37.794136649016401 ], [ -122.39619262016727, 37.794133650072766 ], [ -122.396193192142206, 37.794130660656158 ], [ -122.396193816202555, 37.794127681677196 ], [ -122.396194492158202, 37.794124714043299 ], [ -122.396195219803246, 37.794121758658449 ], [ -122.396195998916042, 37.794118816422866 ], [ -122.396196829259281, 37.794115888232795 ], [ -122.396197710579997, 37.794112974980187 ], [ -122.396198642609775, 37.794110077552453 ], [ -122.396199625064668, 37.794107196832172 ], [ -122.396200657645437, 37.794104333696843 ], [ -122.39620174003754, 37.794101489018601 ], [ -122.396202871911271, 37.794098663663966 ], [ -122.396204052921846, 37.794095858493563 ], [ -122.396205282709531, 37.794093074361875 ], [ -122.396206560899699, 37.794090312116985 ], [ -122.396207887103017, 37.79408757260029 ], [ -122.396209260915512, 37.794084856646279 ], [ -122.396210681918703, 37.794082165082251 ], [ -122.396212149679727, 37.794079498728088 ], [ -122.39621366375151, 37.794076858395982 ], [ -122.39621522367284, 37.794074244890211 ], [ -122.396216828968548, 37.794071659006867 ], [ -122.396218479149638, 37.794069101533644 ], [ -122.396220173713473, 37.794066573249566 ], [ -122.396220432536722, 37.794066206827054 ], [ -122.396220432536722, 37.794066206827054 ], [ -122.396220432536722, 37.794066206827054 ], [ -122.396220432536722, 37.794066206827054 ], [ -122.396244488624589, 37.794064282340024 ], [ -122.396244488624589, 37.794064282340024 ], [ -122.396244488624589, 37.794064282340024 ], [ -122.396242083015807, 37.79403493391284 ], [ -122.396242083015807, 37.79403493391284 ], [ -122.396242083015807, 37.79403493391284 ], [ -122.396210328979834, 37.794037820643382 ], [ -122.396210328979834, 37.794037820643382 ], [ -122.396210328979834, 37.794037820643382 ], [ -122.396201720052517, 37.793891534193754 ], [ -122.396191565231305, 37.793838155114116 ], [ -122.396191565231305, 37.793838155114116 ], [ -122.396191565231305, 37.793838155114116 ], [ -122.396270072411809, 37.793826261400341 ], [ -122.396269365904999, 37.793826732404881 ], [ -122.396269836909553, 37.793826496902611 ], [ -122.396417451896312, 37.794572828037452 ], [ -122.396417451896312, 37.794572828037452 ], [ -122.396417451896312, 37.794572828037452 ], [ -122.396326699956632, 37.794584060775918 ], [ -122.396326939138618, 37.794583946704499 ], [ -122.396327055049909, 37.794584057096195 ], [ -122.396326820469568, 37.794584059401053 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 2, "level": 2, "Name": "Eclipse Cafè", "type": "shops" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396216102440945, 37.794428972632033 ], [ -122.396215982160413, 37.794428972632048 ], [ -122.396215982160413, 37.794428972632048 ], [ -122.396170395873938, 37.794434024410492 ], [ -122.396170395873938, 37.794434024410492 ], [ -122.396170395873938, 37.794434024410492 ], [ -122.396168471386915, 37.79441947047733 ], [ -122.396168456351873, 37.79441931260925 ], [ -122.396168445075574, 37.794419218640158 ], [ -122.396168421967602, 37.794418971107326 ], [ -122.396161679148378, 37.794420176033974 ], [ -122.396155540842983, 37.794421236406279 ], [ -122.396149384966449, 37.794422189488884 ], [ -122.396143213393898, 37.794423034991475 ], [ -122.396137028005256, 37.794423772656494 ], [ -122.396130830684641, 37.794424402259253 ], [ -122.396124623319835, 37.794424923607956 ], [ -122.396118407801637, 37.79442533654381 ], [ -122.396112186023387, 37.794425640941014 ], [ -122.396105959880259, 37.794425836706857 ], [ -122.396099731268833, 37.794425923781702 ], [ -122.396093502086387, 37.794425902139032 ], [ -122.396087274230382, 37.794425771785427 ], [ -122.39608104959791, 37.794425532760606 ], [ -122.396074830085027, 37.794425185137371 ], [ -122.396068617586266, 37.794424729021614 ], [ -122.396062413994017, 37.794424164552275 ], [ -122.396056221197966, 37.794423491901291 ], [ -122.396050041084479, 37.794422711273569 ], [ -122.39604387553608, 37.794421822906877 ], [ -122.396037726430862, 37.794420827071839 ], [ -122.396031595641901, 37.794419724071787 ], [ -122.396025485036688, 37.7944185142427 ], [ -122.396019396476589, 37.794417197953116 ], [ -122.396013331816235, 37.794415775603987 ], [ -122.396007292902951, 37.794414247628566 ], [ -122.396001281576289, 37.794412614492295 ], [ -122.396001281576289, 37.794412614492295 ], [ -122.396001281576289, 37.794412614492295 ], [ -122.396001281576289, 37.794412614492295 ], [ -122.395998875967507, 37.794438595067191 ], [ -122.395998875967507, 37.794438595067191 ], [ -122.395998875967507, 37.794438595067191 ], [ -122.395951966596172, 37.794435948897522 ], [ -122.395951966596172, 37.794435948897522 ], [ -122.395951966596172, 37.794435948897522 ], [ -122.395942584721922, 37.794326734258632 ], [ -122.395942584721922, 37.794326734258632 ], [ -122.395942584721922, 37.794326734258632 ], [ -122.395984442314798, 37.794322885284565 ], [ -122.395984442314798, 37.794322885284565 ], [ -122.395984442314798, 37.794322885284565 ], [ -122.395983720632159, 37.79430580546218 ], [ -122.395983720632159, 37.79430580546218 ], [ -122.395983720632159, 37.79430580546218 ], [ -122.396164622412911, 37.794284154983103 ], [ -122.396164622412911, 37.794284154983103 ], [ -122.396164622412911, 37.794284154983103 ], [ -122.39616558465643, 37.794299069757578 ], [ -122.39616558465643, 37.794299069757578 ], [ -122.39616558465643, 37.794299069757578 ], [ -122.396202149909982, 37.794296183027036 ], [ -122.396202149909982, 37.794296183027036 ], [ -122.396202149909982, 37.794296183027036 ], [ -122.396216102440945, 37.794428972632033 ], [ -122.396216102440945, 37.794428972632033 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 3, "level": 2, "Name": "Garden Room B", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396232866527612, 37.794596183116916 ], [ -122.396103144073095, 37.794611859980833 ], [ -122.396103097088528, 37.79461145779311 ], [ -122.396103082993179, 37.794611107288389 ], [ -122.396093822338983, 37.794513550454653 ], [ -122.396093777233816, 37.794513354998941 ], [ -122.396093777233844, 37.794513144508159 ], [ -122.396093766636653, 37.794512924693024 ], [ -122.39609375342927, 37.794512700192797 ], [ -122.396093737783985, 37.794512479957866 ], [ -122.396093749583457, 37.794512309137595 ], [ -122.396093743535573, 37.794512067498971 ], [ -122.396093749524638, 37.794511800197895 ], [ -122.396093722260417, 37.79451135693774 ], [ -122.396094323101295, 37.794511158757217 ], [ -122.396094920391917, 37.79451095012076 ], [ -122.396095513950385, 37.794510731091918 ], [ -122.396096103595852, 37.794510501737413 ], [ -122.396096689148735, 37.794510262127112 ], [ -122.396097270430644, 37.794510012333994 ], [ -122.396097847264542, 37.794509752434152 ], [ -122.396098419474711, 37.794509482506754 ], [ -122.396098986886841, 37.794509202634025 ], [ -122.396099549328099, 37.794508912901208 ], [ -122.396100106627159, 37.794508613396573 ], [ -122.396100658614273, 37.794508304211341 ], [ -122.396101205121283, 37.794507985439701 ], [ -122.396101745981724, 37.794507657178741 ], [ -122.396102281030835, 37.794507319528464 ], [ -122.39610281010566, 37.794506972591719 ], [ -122.396103333045019, 37.794506616474187 ], [ -122.396103849689624, 37.794506251284339 ], [ -122.396104359882102, 37.794505877133425 ], [ -122.396104863467045, 37.7945054941354 ], [ -122.396105360291045, 37.794505102406944 ], [ -122.396105850202773, 37.794504702067378 ], [ -122.396106333052998, 37.794504293238646 ], [ -122.39610680869464, 37.794503876045283 ], [ -122.396107276982804, 37.794503450614364 ], [ -122.396107737774855, 37.794503017075492 ], [ -122.396108190930434, 37.794502575560713 ], [ -122.396108636311496, 37.794502126204534 ], [ -122.396109073782384, 37.794501669143813 ], [ -122.396109503209814, 37.794501204517786 ], [ -122.396109924463019, 37.794500732467988 ], [ -122.396110337413646, 37.794500253138196 ], [ -122.396110741935928, 37.794499766674427 ], [ -122.39611113790663, 37.794499273224865 ], [ -122.396111525205157, 37.794498772939818 ], [ -122.396111903713503, 37.794498265971669 ], [ -122.39611227331639, 37.794497752474854 ], [ -122.396112633901225, 37.794497232605792 ], [ -122.396112985358187, 37.794496706522828 ], [ -122.396113327580196, 37.794496174386225 ], [ -122.39611366046303, 37.794495636358072 ], [ -122.396113983905266, 37.794495092602254 ], [ -122.396114297808396, 37.794494543284408 ], [ -122.396114602076793, 37.794493988571858 ], [ -122.396114896617789, 37.794493428633579 ], [ -122.396115181341656, 37.794492863640137 ], [ -122.396115456161652, 37.794492293763625 ], [ -122.396115720994089, 37.794491719177636 ], [ -122.396115975758278, 37.794491140057197 ], [ -122.396116220376612, 37.794490556578715 ], [ -122.396116454774599, 37.794489968919919 ], [ -122.396116678880816, 37.794489377259822 ], [ -122.396116892627006, 37.794488781778639 ], [ -122.396117095948071, 37.794488182657766 ], [ -122.396117288782065, 37.794487580079704 ], [ -122.396117471070241, 37.794486974228001 ], [ -122.396117642757105, 37.794486365287199 ], [ -122.396117803790318, 37.7944857534428 ], [ -122.396117954120854, 37.794485138881164 ], [ -122.396118093702924, 37.794484521789499 ], [ -122.396118222493996, 37.794483902355779 ], [ -122.396118340454834, 37.794483280768688 ], [ -122.396118447549526, 37.794482657217571 ], [ -122.39611854374543, 37.794482031892358 ], [ -122.396118629013259, 37.794481404983536 ], [ -122.396118703327033, 37.794480776682072 ], [ -122.396118766664117, 37.794480147179343 ], [ -122.39611881900521, 37.794479516667103 ], [ -122.396118860334383, 37.794478885337419 ], [ -122.396118890639045, 37.794478253382593 ], [ -122.396118909909944, 37.794477620995131 ], [ -122.396118918141241, 37.794476988367656 ], [ -122.396118915330391, 37.794476355692879 ], [ -122.396118901478289, 37.794475723163522 ], [ -122.396118876589128, 37.794475090972256 ], [ -122.396118840670511, 37.794474459311644 ], [ -122.396118840670511, 37.794474459311644 ], [ -122.396219395118337, 37.794461950145887 ], [ -122.396219395118337, 37.794461950145887 ], [ -122.396219395118337, 37.794461950145887 ], [ -122.396232866527612, 37.794596183116916 ], [ -122.396232866527612, 37.794596183116916 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 4, "level": 2, "Name": "Garden Room A", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396103115882624, 37.794611859041254 ], [ -122.396103145952779, 37.79461188159388 ], [ -122.396103145952779, 37.79461188159388 ], [ -122.395974791688261, 37.794627856339808 ], [ -122.395974791688261, 37.794627856339808 ], [ -122.395974791688261, 37.794627856339808 ], [ -122.395961981821401, 37.794494705892738 ], [ -122.395961981821401, 37.794494705892738 ], [ -122.395961981821401, 37.794494705892738 ], [ -122.396052853693817, 37.794484361774877 ], [ -122.396052853693817, 37.794484361774877 ], [ -122.396052853693817, 37.794484361774877 ], [ -122.396052957633913, 37.794484901848321 ], [ -122.396053072810787, 37.794485478372948 ], [ -122.396053198031865, 37.794486052799655 ], [ -122.396053333259005, 37.794486624953464 ], [ -122.396053478451009, 37.794487194660093 ], [ -122.396053633563653, 37.794487761746005 ], [ -122.396053798549687, 37.794488326038454 ], [ -122.396053973358846, 37.79448888736556 ], [ -122.396054157937897, 37.79448944555633 ], [ -122.396054352230607, 37.794490000440739 ], [ -122.396054556177788, 37.794490551849755 ], [ -122.396054769717324, 37.794491099615421 ], [ -122.396054992784158, 37.794491643570886 ], [ -122.396055225310363, 37.794492183550446 ], [ -122.396055467225096, 37.794492719389623 ], [ -122.396055718454662, 37.7944932509252 ], [ -122.396055978922533, 37.794493777995257 ], [ -122.396056248549385, 37.794494300439247 ], [ -122.396056527253066, 37.79449481809803 ], [ -122.396056814948707, 37.794495330813923 ], [ -122.396057111548643, 37.794495838430741 ], [ -122.396057416962549, 37.79449634079387 ], [ -122.396057731097372, 37.794496837750273 ], [ -122.396058053857445, 37.794497329148584 ], [ -122.396058385144443, 37.794497814839104 ], [ -122.396058724857454, 37.7944982946739 ], [ -122.396059072892996, 37.794498768506813 ], [ -122.396059429145055, 37.794499236193495 ], [ -122.396059793505103, 37.79449969759149 ], [ -122.396060165862167, 37.794500152560246 ], [ -122.396060546102831, 37.794500600961193 ], [ -122.396060934111247, 37.794501042657721 ], [ -122.396061329769239, 37.794501477515304 ], [ -122.396061732956284, 37.794501905401468 ], [ -122.396062143549557, 37.794502326185885 ], [ -122.396062561424003, 37.794502739740366 ], [ -122.396062986452321, 37.794503145938947 ], [ -122.396063418505051, 37.7945035446579 ], [ -122.396063857450571, 37.794503935775765 ], [ -122.3960643031552, 37.794504319173399 ], [ -122.396064755483152, 37.794504694734023 ], [ -122.396065214296655, 37.794505062343241 ], [ -122.39606567945593, 37.79450542188907 ], [ -122.396066150819308, 37.794505773261989 ], [ -122.396066628243204, 37.794506116354967 ], [ -122.39606711158217, 37.794506451063491 ], [ -122.396067600688994, 37.794506777285612 ], [ -122.396068095414691, 37.794507094921954 ], [ -122.396068595608554, 37.79450740387577 ], [ -122.396069101118229, 37.79450770405294 ], [ -122.396069611789727, 37.794507995362032 ], [ -122.396070127467482, 37.794508277714307 ], [ -122.396070647994435, 37.794508551023767 ], [ -122.396071173212007, 37.794508815207152 ], [ -122.396071702960228, 37.794509070183985 ], [ -122.396072237077718, 37.794509315876603 ], [ -122.396072775401791, 37.794509552210165 ], [ -122.396073317768455, 37.794509779112687 ], [ -122.396073864012521, 37.794509996515046 ], [ -122.396074413967582, 37.794510204351013 ], [ -122.39607496746612, 37.794510402557293 ], [ -122.396075524339537, 37.794510591073504 ], [ -122.396076084418198, 37.794510769842219 ], [ -122.396076647531501, 37.79451093880899 ], [ -122.396077213507922, 37.794511097922339 ], [ -122.396077782175041, 37.794511247133805 ], [ -122.396078353359655, 37.794511386397943 ], [ -122.396078926887768, 37.794511515672319 ], [ -122.396079502584683, 37.794511634917555 ], [ -122.396080080275027, 37.794511744097342 ], [ -122.396080659782839, 37.794511843178405 ], [ -122.396081240931593, 37.794511932130575 ], [ -122.39608182354425, 37.794512010926759 ], [ -122.396082407443373, 37.79451207954294 ], [ -122.396082992451085, 37.794512137958229 ], [ -122.396083578389167, 37.794512186154833 ], [ -122.396084165079174, 37.794512224118058 ], [ -122.396084752342361, 37.794512251836352 ], [ -122.396085339999857, 37.794512269301272 ], [ -122.396085927872662, 37.794512276507497 ], [ -122.39608651578169, 37.794512273452824 ], [ -122.39608710354787, 37.794512260138184 ], [ -122.396087690992161, 37.794512236567648 ], [ -122.396088277935618, 37.794512202748379 ], [ -122.396088864199442, 37.794512158690686 ], [ -122.396089449605071, 37.794512104407993 ], [ -122.396090033974176, 37.794512039916825 ], [ -122.396090617128763, 37.794511965236836 ], [ -122.39609119889117, 37.794511880390765 ], [ -122.396091779084216, 37.794511785404467 ], [ -122.396092357531145, 37.794511680306869 ], [ -122.396092934055773, 37.794511565129987 ], [ -122.39609350848248, 37.794511439908909 ], [ -122.39609350848248, 37.794511439908909 ], [ -122.396103115882624, 37.794611859041254 ], [ -122.396103115882624, 37.794611859041254 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 5, "level": 2, "Name": "Stairs to Bay Level", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395967183950518, 37.794548937336138 ], [ -122.395929897014113, 37.79455290659066 ], [ -122.395927010283543, 37.794514296569432 ], [ -122.395963515397085, 37.794510673121167 ], [ -122.395967183950532, 37.794548982441341 ], [ -122.395967183950518, 37.794548937336138 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 6, "level": 2, "Name": "Hospitality Room", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395862900809078, 37.794604792565508 ], [ -122.39586278052866, 37.794604912845948 ], [ -122.395665159765727, 37.794629209494815 ], [ -122.395656980695819, 37.794539360006155 ], [ -122.395854240617396, 37.794513379431116 ], [ -122.395862900809078, 37.794604792565508 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 7, "level": 2, "Name": "Hotel Storage", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395665159765741, 37.79462917942476 ], [ -122.395665159765727, 37.794629179424753 ], [ -122.395571461303007, 37.794641838941068 ], [ -122.395562801111339, 37.794551388050195 ], [ -122.395656980695819, 37.794539360006198 ], [ -122.395665159765741, 37.79462917942476 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 8, "level": 2, "Name": "Atrium 3 & 4", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395566905681463, 37.79464253055361 ], [ -122.395278773887497, 37.794679276228031 ], [ -122.395269632574042, 37.794587863093632 ], [ -122.395558546190884, 37.794551899242066 ], [ -122.395566905681463, 37.79464253055361 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 9, "level": 2, "Name": "Atrium 2", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395846151757951, 37.794364848122825 ], [ -122.395846181828119, 37.794364848122882 ], [ -122.395846181828119, 37.794364848122882 ], [ -122.395846392318887, 37.79436605092728 ], [ -122.395846392318887, 37.79436605092728 ], [ -122.395846392318887, 37.79436605092728 ], [ -122.395857818960664, 37.79447580682875 ], [ -122.395857818960664, 37.79447580682875 ], [ -122.395857818960664, 37.79447580682875 ], [ -122.395491685301366, 37.794522716200341 ], [ -122.395491685301366, 37.794522716200341 ], [ -122.395491685301366, 37.794522716200341 ], [ -122.395489820954481, 37.794492525809886 ], [ -122.395489820954481, 37.794492525809886 ], [ -122.395489820954481, 37.794492525809886 ], [ -122.395490971150238, 37.794491636891379 ], [ -122.395499460434564, 37.794485206001163 ], [ -122.395508060660433, 37.794478924248843 ], [ -122.395516769208143, 37.794472793547897 ], [ -122.395525583424984, 37.794466815765809 ], [ -122.395534500626056, 37.794460992723451 ], [ -122.395543518095096, 37.794455326194594 ], [ -122.395552633085302, 37.79444981790531 ], [ -122.395561842820157, 37.794444469533481 ], [ -122.395571144494269, 37.794439282708268 ], [ -122.395580535274291, 37.794434259009634 ], [ -122.395590012299664, 37.794429399967839 ], [ -122.395599572683622, 37.794424707063001 ], [ -122.395609213513978, 37.794420181724625 ], [ -122.395618931854017, 37.794415825331164 ], [ -122.39562872474346, 37.794411639209628 ], [ -122.395638589199308, 37.794407624635141 ], [ -122.395648522216717, 37.794403782830592 ], [ -122.395658520770027, 37.794400114966216 ], [ -122.395668581813567, 37.794396622159297 ], [ -122.395678702282638, 37.794393305473768 ], [ -122.395688879094465, 37.794390165919928 ], [ -122.395699109149078, 37.794387204454111 ], [ -122.395709389330307, 37.794384421978407 ], [ -122.395719716506719, 37.794381819340394 ], [ -122.395730087532556, 37.794379397332854 ], [ -122.395740499248674, 37.794377156693557 ], [ -122.395750948483609, 37.794375098105021 ], [ -122.395761432054385, 37.794373222194309 ], [ -122.39577194676761, 37.794371529532853 ], [ -122.395782489420426, 37.794370020636244 ], [ -122.395793056801409, 37.794368695964103 ], [ -122.395803645691657, 37.794367555919948 ], [ -122.395814252865677, 37.794366600851042 ], [ -122.395824875092416, 37.79436583104831 ], [ -122.395835509136248, 37.794365246746246 ], [ -122.395846151757951, 37.794364848122825 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 10, "level": 2, "Name": "Atrium 5", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395839897175264, 37.794337333972237 ], [ -122.395827551325056, 37.794338409071607 ], [ -122.395815226118259, 37.794339699472019 ], [ -122.395802925309226, 37.794341204780423 ], [ -122.395790652644934, 37.794342924538284 ], [ -122.395778411863731, 37.794344858221734 ], [ -122.395766206694304, 37.794347005241768 ], [ -122.395754040854442, 37.794349364944381 ], [ -122.395741918049978, 37.794351936610774 ], [ -122.395729841973647, 37.794354719457608 ], [ -122.395717816303943, 37.794357712637186 ], [ -122.395705844703983, 37.794360915237768 ], [ -122.395693930820443, 37.794364326283805 ], [ -122.395682078282405, 37.794367944736265 ], [ -122.395670290700281, 37.794371769492926 ], [ -122.395658571664669, 37.794375799388732 ], [ -122.395646924745293, 37.794380033196134 ], [ -122.395635353489936, 37.794384469625477 ], [ -122.395623861423289, 37.794389107325387 ], [ -122.395612452045981, 37.794393944883169 ], [ -122.395601128833391, 37.794398980825257 ], [ -122.395589895234693, 37.794404213617661 ], [ -122.395578754671746, 37.794409641666405 ], [ -122.395567710538074, 37.794415263318072 ], [ -122.395556766197828, 37.794421076860239 ], [ -122.395545924984759, 37.794427080522048 ], [ -122.395535190201201, 37.794433272474734 ], [ -122.395524565117086, 37.794439650832153 ], [ -122.395514052968892, 37.794446213651412 ], [ -122.395503656958752, 37.794452958933398 ], [ -122.39549338025337, 37.794459884623443 ], [ -122.39548525029798, 37.794465552921274 ], [ -122.39548525029798, 37.794465552921274 ], [ -122.39548525029798, 37.794465552921274 ], [ -122.395477552349831, 37.794386648952639 ], [ -122.395477552349831, 37.794386648952639 ], [ -122.395477552349831, 37.794386648952639 ], [ -122.395817224312381, 37.794101824870758 ], [ -122.395817224312381, 37.794101824870758 ], [ -122.395817224312381, 37.794101824870758 ], [ -122.395826846747582, 37.794195162492194 ], [ -122.395826846747582, 37.794195162492194 ], [ -122.395826846747582, 37.794195162492194 ], [ -122.395774885597504, 37.79423846345059 ], [ -122.395774885597504, 37.79423846345059 ], [ -122.395774885597504, 37.79423846345059 ], [ -122.395822997773507, 37.794311593958106 ], [ -122.395822997773507, 37.794311593958106 ], [ -122.395822997773507, 37.794311593958106 ], [ -122.39583839366982, 37.79431063171458 ], [ -122.39583839366982, 37.79431063171458 ], [ -122.395839897175264, 37.794337333972237 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 11, "level": 2, "Name": "Stairs to Bay Level", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395380967156584, 37.794555522690388 ], [ -122.395311685623142, 37.79456418288207 ], [ -122.39528281831754, 37.794537240063512 ], [ -122.395372306964902, 37.794466034043033 ], [ -122.395380967156584, 37.794555522690388 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 12, "level": 2, "Name": "StayFit Gym", "type": "shops" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395856495876188, 37.793899152329374 ], [ -122.395866118311389, 37.79401438099088 ], [ -122.395748484041107, 37.794113492073443 ], [ -122.395737418240628, 37.793999947338087 ], [ -122.395856495876188, 37.793899152329374 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 13, "level": 2, "Name": "Gift Shop", "type": "shops" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395748484041164, 37.794113732634365 ], [ -122.395658243641222, 37.794190892536626 ], [ -122.395645283423761, 37.794078069483895 ], [ -122.395737448310811, 37.794000007478353 ], [ -122.395748484041164, 37.794113732634365 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 14, "level": 2, "Name": "Board Room A", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395657792589404, 37.794191674359482 ], [ -122.395575250137611, 37.794259452387429 ], [ -122.395564454968081, 37.794146509054258 ], [ -122.395645223283438, 37.794078099554021 ], [ -122.395657792589404, 37.794191674359482 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 15, "level": 2, "Name": "Board Room B", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395574799085821, 37.794259512527631 ], [ -122.395493459438427, 37.794328974481736 ], [ -122.395482844689568, 37.794215790587685 ], [ -122.395564364757675, 37.794146569194474 ], [ -122.395574799085821, 37.794259512527631 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 16, "level": 2, "Name": "Men's Lounge", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395493459438271, 37.794328944411625 ], [ -122.395438130436034, 37.794375162170695 ], [ -122.395427335266504, 37.794263060800603 ], [ -122.395482784549245, 37.794215820657811 ], [ -122.395493459438271, 37.794328944411625 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 17, "level": 2, "Name": "Women's Lounge", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39543767938423, 37.794375462871784 ], [ -122.395367405537328, 37.794435182110249 ], [ -122.39535703134932, 37.794322419197734 ], [ -122.395427214985972, 37.794263090870722 ], [ -122.39543767938423, 37.794375462871784 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 18, "level": 2, "Name": "Board Room C", "type": "room" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395308077210402, 37.794485218773431 ], [ -122.395238254415148, 37.794544787661337 ], [ -122.395165003627142, 37.794485248843522 ], [ -122.395297642882269, 37.794372846772376 ], [ -122.395308077210402, 37.794485218773431 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 19, "level": 2, "Name": "Eclipse Sculture & Fountain", "type": "art" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.395838453810768, 37.794310481364207 ], [ -122.395823057914455, 37.794311684168605 ], [ -122.395774915668355, 37.79423846345076 ], [ -122.39582690688853, 37.794195192562491 ], [ -122.395899135292765, 37.794186592511039 ], [ -122.395909479410548, 37.794299896685558 ], [ -122.395838453810768, 37.794310481364207 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 20, "level": 2, "Name": "Escalators", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396113715597693, 37.794094457694058 ], [ -122.395995840766503, 37.794110334712137 ], [ -122.395993916279465, 37.794090608719983 ], [ -122.396112993915054, 37.794075212823664 ], [ -122.396113715597693, 37.794094457694058 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 21, "level": 2, "Name": "Escalators", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.396111069428017, 37.794067514875501 ], [ -122.395993194596826, 37.794083391893579 ], [ -122.395991270109789, 37.794063665901426 ], [ -122.396110347745378, 37.794048270005106 ], [ -122.396111069428017, 37.794067514875501 ] ] ] } },
                            { "type": "Feature", "properties": { "id": 22, "level": 2, "Name": "Elevators", "type": "facilities" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -122.39609158399675, 37.793982837445739 ], [ -122.395960237756285, 37.793998233342052 ], [ -122.395955426538677, 37.793952526774859 ], [ -122.396086291657383, 37.793936168635021 ], [ -122.39609158399675, 37.793982837445739 ] ] ] } }
                        ]},
                }
            }
        },
        7:{ 
            'app_name' : 'Sportografi',
            'domain_name': 'sportografi',
            'domain_id':7,
            'design':{
                'logo' : {url: '', title: '', alt:'', label:{text: 'Sportografi', style: 'color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;'}},
                'logo_partners' : [],
                'colors' : ['rgba(221,91,42, 1)','rgba(246,213,59, 1)', 'rgba(61,131,97, 1)', 'rgba(255,179,16, 1)', 'rgba(243,164,106, 1)','rgba(174,10,10, 1)','rgba(130,50,86, 1)','rgba(45,69,104, 1)','rgba(63,127,145, 1)','rgba(136,186,92, 1)'],
                'side_menu':[]
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
            types:{
                categories:[{"category_space":18,"name":"Destinazione","slug":"destinazione","description":"Destinazione","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-140,"name":"Palestra","description":"Palestra","category_index":1,"icon_name":"ion-home"},{"id":-141,"name":"Campo sportivo","description":"Campo sportivo","category_index":2,"icon_name":"ion-android-walk"},{"id":-142,"name":"Campo di regata","description":"Campo di regata","category_index":3,"icon_name":"ion-android-boat"},{"id":-143,"name":"Percorso","description":"Percorso","category_index":4,"icon_name":"ion-flag"},{"id":-144,"name":"Stadio","description":"Stadio","category_index":5,"icon_name":"ion-ios-football"},{"id":-145,"name":"Piscina","description":"Piscina","category_index":6,"icon_name":"ion-waterdrop"},{"id":-146,"name":"Palazzetto dello sport","description":"Palazzetto dello sport","category_index":7,"icon_name":"ion-star"},{"id":-147,"name":"Autodromo","description":"Autodromo","category_index":8,"icon_name":"ion-model-s"},{"id":-148,"name":"Velodromo","description":"Velodromo","category_index":9,"icon_name":"ion-android-bicycle"},{"id":-149,"name":"Poligono di Tiro","description":"Poligono di Tiro","category_index":10,"icon_name":"ion-asterisk"},{"id":-150,"name":"Stadio del Ghiaccio","description":"Stadio del Ghiaccio","category_index":11,"icon_name":"ion-ios-snowy"},{"id":-151,"name":"Stazione Sciistica","description":"Stazione Sciistica","category_index":12,"icon_name":"ion-ios-snowy"},{"id":-152,"name":"Skatepark","description":"Skatepark","category_index":13,"icon_name":"ion-android-walk"},{"id":-153,"name":"Spot","description":"Spot","category_index":14,"icon_name":"ion-arrow-shrink"},{"id":-154,"name":"Impianto sportivo scolastico","description":"Impianto sportivo scolastico","category_index":15,"icon_name":"ion-university"},{"id":-155,"name":"Bocciofila","description":"Bocciofila","category_index":16,"icon_name":"ion-ios-tennisball"},{"id":-156,"name":"Bocciodromo","description":"Bocciodromo","category_index":17,"icon_name":"ion-ios-tennisball"},{"id":-157,"name":"Parete arrampicata","description":"Parete arrampicata","category_index":18,"icon_name":"ion-android-walk"},{"id":-158,"name":"Centro sportivo","description":"Centro sportivo","category_index":19,"icon_name":"ion-star"}],"entities":["FL_PLACES"]},{"category_space":19,"name":"Servizi di supporto","slug":"servizi-di supporto","description":"Servizi di supporto","is_editable":true,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-160,"name":"Attrezzato","description":"Attrezzato","category_index":1,"icon_name":"ion-android-contract"},{"id":-161,"name":"Non attrezzato","description":"Non attrezzato","category_index":2,"icon_name":"ion-android-expand"}],"entities":["FL_PLACES"]},{"category_space":20,"name":"Ambiente","slug":"ambiente","description":"Ambiente","is_editable":true,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-170,"name":"Outdoor","description":"Outdoor","category_index":1,"icon_name":"ion-log-out"},{"id":-171,"name":"Indoor","description":"Indoor","category_index":2,"icon_name":"ion-log-in"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":21,"name":"Versatilità","slug":"versatilità","description":"Versatilità","is_editable":true,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-180,"name":"Polifunzionale","description":"Polifunzionale (ospita altri tipi di manifestazioni)","category_index":1,"icon_name":"ion-star"},{"id":-181,"name":"Polivalente","description":"Polivalente (Ospita diversi sport)","category_index":2,"icon_name":"ion-asterisk"},{"id":-182,"name":"Specialistico","description":"Specialistico","category_index":3,"icon_name":"ion-heart"}],"entities":["FL_PLACES"]},{"category_space":22,"name":"Modalità di accesso","slug":"modalità-di accesso","description":"Modalità di accesso","is_editable":true,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-190,"name":"Libero","description":"Libero","category_index":1,"icon_name":"ion-radio-waves"},{"id":-101,"name":"A pagamento","description":"A pagamento","category_index":2,"icon_name":"ion-social-euro"},{"id":-192,"name":"Con iscrizione","description":"Con iscrizione","category_index":3,"icon_name":"ion-android-drafts"},{"id":-193,"name":"Riservato","description":"Riservato","category_index":4,"icon_name":"ion-android-hand"}],"entities":["FL_EVENTS","FL_PLACES"]},{"category_space":23,"name":"Categorias","slug":"categorias","description":"Categorias","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-200,"name":"Atletica e fitness","description":"Atletica e fitness","category_index":1,"icon_name":"ion-podium"},{"id":-201,"name":"Sport invernali","description":"Sport invernali","category_index":2,"icon_name":"ion-ios-snowy"},{"id":-202,"name":"Sport dell’aria","description":"Sport dell’aria","category_index":3,"icon_name":"ion-paper-airplane"},{"id":-203,"name":"Sport Acquatico","description":"Sport Acquatico","category_index":4,"icon_name":"ion-waterdrop"},{"id":-204,"name":"Sport da combattimento","description":"Sport da combattimento","category_index":5,"icon_name":"ion-man"},{"id":-205,"name":"Sport di squadra","description":"Sport di squadra","category_index":6,"icon_name":"ion-ios-basketball"},{"id":-206,"name":"Sport della racchetta","description":"Sport della racchetta","category_index":7,"icon_name":"ion-ios-football-outline"},{"id":-207,"name":"Sport tradizionale","description":"Sport tradizionale","category_index":8,"icon_name":"ion-ios-football"},{"id":-208,"name":"Sport di strada","description":"Sport di strada","category_index":9,"icon_name":"ion-cube"},{"id":-209,"name":"Sport equestre","description":"Sport equestre","category_index":10,"icon_name":"ion-ios-nutrition"},{"id":-210,"name":"Pratica emergente","description":"Pratica emergente","category_index":11,"icon_name":"ion-ios-bell"},{"id":-211,"name":"Sport acrobatico","description":"Sport acrobatico","category_index":12,"icon_name":"ion-android-walk"},{"id":-212,"name":"Boardsport","description":"Boardsport","category_index":13,"icon_name":"ion-tshirt-outline"},{"id":-213,"name":"Sport su ruota","description":"Sport su ruota","category_index":14,"icon_name":"ion-android-bicycle"},{"id":-214,"name":"Sport cinofili","description":"Sport cinofili","category_index":15,"icon_name":"ion-ios-paw"}],"entities":["FL_EVENTS"]},{"category_space":24,"name":"Tipo di evento","slug":"tipo-di evento","description":"Tipo di evento","is_editable":true,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-220,"name":"Agonistico","description":"Agonistico","category_index":1,"icon_name":"ion-ribbon-a"},{"id":-221,"name":"Amatoriale","description":"Amatoriale","category_index":2,"icon_name":"ion-android-contacts"},{"id":-222,"name":"Manifestazione","description":"Manifestazione","category_index":3,"icon_name":"ion-speakerphone"},{"id":-223,"name":"Conferenza/ Congresso","description":"Conferenza/ Congresso","category_index":4,"icon_name":"ion-mic-b"}],"entities":["FL_EVENTS"]}]

            }
        }

    }
})// configurazione progetto
    .config(
    function setupProject(myConfig){
        // imposto i defaults
        myConfig = angular.merge(myConfig,myConfig.defaults);

        // controllo se devo sovrascrivere delle impostazioni
        if(myConfig.project && myConfig.project > 1){

            var domainConfigs = myConfig.domains[myConfig.project];
            if(myConfig.dev)console.log("config, myConfig, project > ",myConfig.domains,myConfig.project," , configurazioni caricate: ", domainConfigs);

            // sovrascrivo le configurazioni
            angular.merge(myConfig, domainConfigs)
            if(domainConfigs.navigator){
                myConfig.navigator = domainConfigs.navigator;
            }
            // fix di categorie e lista di tipi
            if(domainConfigs.types && domainConfigs.types.categories)
                myConfig.types.categories = angular.copy(domainConfigs.types.categories);
            if(domainConfigs.types && domainConfigs.types.list)
                myConfig.types.list = angular.copy(domainConfigs.types.list);
            if(myConfig.dev)console.log("sovrascrivo le configurazioni: ", myConfig);

        }
        /* da cancellare deprecato, fix tipi
        if(myConfig.types.exclude){
            if(myConfig.dev)console.log("Fix permessi dei tipi ",myConfig.types.exclude);

            var exclude = myConfig.types.exclude;
            var list = [];
            for(var i = 0; i < myConfig.types.list.length; i++){
                if(myConfig.dev)console.log("Fix permessi dei tipi, controllo ",exclude[i]);
                if(!exclude[i]){
                    if(myConfig.dev)console.log(myConfig.types);
                    var index = exclude.indexOf(myConfig.types.list[i].key);
                    if(index < 0){
                        list.push (myConfig.types.list[i]);
                    }
                }
            }
            myConfig.types.list = list;
            if(myConfig.dev)console.log("Check fix permessi dei tipi ",myConfig.types);
        } */
    })
// configurazione degli url alle api
    .config(
    function setupApi(myConfig){
        if(myConfig.dev)console.log("setup url api!");

        // costruisco gli url delle api
        var ssl = "//";
        if(!myConfig.ssl)
            ssl = "http://";

        var url = "";
        url = url.concat(ssl).concat(myConfig.api_base_domain).concat(myConfig.api_version).concat("/fl/domains/").concat(myConfig.domain_id).concat("/");

        myConfig.domain_signature = url;
        myConfig.backend_places = url.concat('places');
        myConfig.backend_events = url.concat('events');
        myConfig.backend_things = url.concat('things');
        myConfig.backend_notifications = url.concat('notifications');
        myConfig.backend_bbox = url.concat('things/boundingbox');
        myConfig.backend_categories = url.concat('categories');
        myConfig.backend_users = url.concat('user');
        myConfig.backend_organization = url.concat('organization');
        myConfig.update_user = url.concat('user/update');
        myConfig.retrieve_password = myConfig.backend_users.concat('/resetpass');
        myConfig.reset_password = myConfig.backend_users.concat('/resetpass');
        myConfig.backend_tags = url.concat('tags');
        //myConfig.backend_images = url.concat('places/');
        myConfig.backend_search = url.concat('things/search');
        myConfig.backend_autocomplete = myConfig.backend_search.concat("?q="); 

        for(k in myConfig.types.list){
            if(myConfig.types.list[k].url){
                myConfig.types.list[k].url = url.concat(myConfig.types.list[k].url);
            }   
        }

        if(myConfig.dev)console.log("url api", url);

    })
// logica
    .config(
    function configAppLogic(myConfig){
        if(myConfig.dev)console.log("setup parametri accesso app 1",myConfig);
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
        if(myConfig.dev)console.log("setup parametri accesso app 2",myConfig);
        if(myConfig.behaviour.viewer){
            // disabilito la cache
            myConfig.behaviour.is_login_required = false;
            myConfig.behaviour.marker_cache = false;
            myConfig.behaviour.split_factor = 1;
            myConfig.behaviour.bbox_timeout = 5000;
        } 
        if(myConfig.dev)console.log("setup parametri accesso app 3",myConfig);
        // se le foto sono abilitate
        if(myConfig.actions.can_foto){
            // abilito la visualizzazione dei thumb
            myConfig.design.show_thumbs = true;
        } else {
            myConfig.design.show_thumbs = false;
        }
        if(myConfig.dev)console.log("setup parametri accesso app 4",myConfig);
        // se la cache e' disabilitata
        if(!myConfig.behaviour.marker_cache){
            //devo disabilitare lo splitfactor 
            // altrimenti ho un anomalia che mi porta a perdere i dati dei quadranti
            myConfig.behaviour.split_factor = 1;
        }
        if(myConfig.dev)console.log("setup parametri accesso app fine",myConfig);
    })
    .config(
    function setTypePerms(myConfig){
        // init delle maschere dei campi per il form
        // prendo il form di default
        if(myConfig.dev)console.log("setup dei tipi 1",myConfig);
        var types = myConfig.types;
        var perms = {};
        var checkList = {};
        if(myConfig.dev)console.log("setup dei tipi 2",myConfig);
        for(k in types.list){
            // faccio il merge dei default con le proprieta' del tipo specifico
            var perm = angular.extend({},types.default.properties, types.list[k].properties);
            
            if(!Array.isArray(types.list[k].actions))
                types.list[k].actions = [];
            if(Array.isArray(types.default.actions))
                types.list[k].actions = types.list[k].actions.concat(angular.copy(types.default.actions));
            
            // ciclo per costruire una maschera con le key, da usare nel wizard con ng-if
            if(myConfig.dev)console.log("myConfig, config, init delle maschere di permessi, proprieta' per il tipo: ", k, perm);
            perms[types.list[k].key] ={};
            for(var i in perm){
                // controllo che non ci sia un campo escluso (definito exclude:true)
                if(myConfig.dev)console.log("EditorCtrl, init delle maschere di permessi, parametro di esclusione: ", perms[i]);
                if(!perm[i].exclude){
                    if(myConfig.dev)console.log("myConfig, config, init delle maschere di permessi, aggiungo regola: ", perms[i],perm[i].key,perm[i]);
                    perms[types.list[k].key][perm[i].key] = perm[i];
                }
            }
            types.list[k].perms = angular.copy(perms[types.list[k].key]);
            var acts = {};
            for(var j = 0; j < types.list[k].actions.length; j++){
                var a = angular.copy(types.list[k].actions[j]);
                acts[a.key] = a;
            }
            types.list[k].acts = acts;
        }
        myConfig.types.perms = perms;
        if(myConfig.dev)console.log("myConfig, config, init delle maschere di permessi per i tipi: ", perms);
    }).config(
    function setRelations(myConfig){
        if(myConfig.dev)console.log("myConfig, config, init delle relazioni tra tipi: ", myConfig.types.list);
        var types = myConfig.types.list;
        var relations = {},
            list = [],
            map = {};
        for(i = 0; i < types.length; i++){
            if(myConfig.dev)console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].relations;
            var r = [];
            for(key in rel){
                if(myConfig.dev)console.log("ciclo relazioni di ",types[i].key, " valuto: ",key,rel,rel[key]);
                var t = angular.copy(types[types.map(function(e){return e.key;}).indexOf(key)]);
                t.rel = rel[key];
                if(myConfig.dev)console.log("relazioni per ",types[i].key, " costruito: ",t);
                r.push(t);
                if(list.indexOf(rel[key].slug) < 0 ){
                    list.push(rel[key].slug);
                }
                map[rel[key].slug] = rel[key].field;
            }
            if(myConfig.dev)console.log("aggiungo t: ",t," alle relazioni di: ",types[i].key);
            relations[types[i].key] = r;
        }
        relations.list = list;
        relations.map = map;
        if(myConfig.dev)console.log("myConfig, config. Relazioni tra tipi: ", relations);
        myConfig.types.relations = relations;
        

        // figli possibili
        var children = {};
        for(i = 0; i < types.length; i++){
            if(myConfig.dev)console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].relations;
            var r = {};
            for(key in rel){
                if(myConfig.dev)console.log("ciclo relazioni di ",types[i].key, " valuto: ",key,rel,rel[key]);
                var t = angular.copy(types[types.map(function(e){return e.key;}).indexOf(key)]);
                t.rel = rel[key];
                if(myConfig.dev)console.log("relazioni per ",types[i].key, " costruito: ",t);
                r[key] = t.rel;
            }
            if(myConfig.dev)console.log("aggiungo t: ",t," alle relazioni di: ",types[i].key);
            children[types[i].key] = r;
        }
        if(myConfig.dev)console.log("myConfig, config. Relazioni tra tipi: figli possibili ", children);
        myConfig.types.child_relations = children;

        // padri possibili
        var fathers = {};
        // per ogni tipo
        for(i = 0; i < types.length; i++){
            if(myConfig.dev)console.log("relazioni per ",types[i].key, " sono: ",types[i].relations);
            var rel = types[i].key;
            fathers[rel] = {};
            for(j = 0; j < types.length; j++){
                if(myConfig.dev)console.log("myConfig, config. Ciclo tra padri possibili ",types[j]);
                var r = types[j].relations[rel];
                if(r){
                    fathers[rel][types[j].key] =  angular.copy(r);
                }
            }
        }
        if(myConfig.dev)console.log("myConfig, config. Relazioni tra tipi: padri possibili ",fathers);
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
        if(myConfig.dev)console.log("myConfig, config. init styles: ", styles);
        myConfig.design.css = styles;
    }).config(
    function setColors(myConfig){
        var catsList = myConfig.types.categories,
            colors = myConfig.design.colors;
        for(i = 0; i < catsList.length; i++){
            for(j = 0; j < catsList[i].categories.length; j++){
                var cats = catsList[i].categories,
                    colorIndex = cats[j].category_index - 1,
                    index = cats[j].category_index,
                    icon = cats[j].icon_name,
                    color = colors[colorIndex % colors.length]; 
                catsList[i].categories[j].colorIndex = colorIndex;
                catsList[i].categories[j].index = index;
                catsList[i].categories[j].color = color;
                catsList[i].categories[j].icon = icon;
                if(myConfig.dev)console.log("myConfig, setupColor: ", catsList[i].categories[j]);
            }
        }
        if(myConfig.dev)console.log("myConfig, setupColor: ", catsList);
        myConfig.types.categories = catsList;
        // impostazioni di dev
    }).config(
    function($logProvider){
        $logProvider.debugEnabled(false);
    }).config(
    function configDev(myConfig, $logProvider){
        if(myConfig.dev)console.log("setup modalità dev");

        // se in modalita' dev
        if(myConfig.dev){
            myConfig.behaviour.umask = 777;
            // ciclo sulle chiavi in actions
            for (key in myConfig.actions){
                // imposto a true tutte le azioni che sono inabilitate
                if(myConfig.actions[key] === false){
                    myConfig.actions[key] = true;
                }

            }

        } 
        // abilito i log di debug
        $logProvider.debugEnabled(true);

        if(myConfig.dev)console.log("Risultato myConfig ",myConfig);
    });
angular.module("firstlife.config", [])
.constant("myConfig", {"dev":true,"project":1,"api_base_domain":"firstlife-dev.di.unito.it:3095/","format":"","api_version":"v4","ssl":false,"version":"0.4.6","app_name":"FirstLife","domain_name":"firstlife","domain_id":1,"types":{"default":{"slug":"place","id":1,"icon":"ion-location","properties":{"name":{"key":"name","label":"TITLE","placeholder":"TITLE","required":true,"default":""},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":null,"is_editable":false},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":null,"is_editable":false},"link_url":{"key":"link_url","label":"URL_LABEL","placeholder":"URL_PLACEHOLDER","default":""},"tags":{"key":"tags","label":"TAGS_LABEL","placeholder":"TAGS_PLACEHOLDER","default":[]},"categories":{"key":"categories","label":"CATEGORIES","default":[]},"group_id":{"key":"group_id","label":"GROUP","placeholder":"GROUP","default":null},"thumbnail":{"key":"thumbnail","label":"THUMBNAIL_LABEL","placeholder":"THUMBNAIL_PLACEHOLDER","default":null},"user":{"key":"user","label":"USER","placeholder":"USER","default":-1},"wp_id":{"key":"id_wp","required":true,"default":1},"id":{"key":"id","default":null},"level":{"key":"level","default":0,"label":"LEVEL_LABEL","placeholder":"LEVEL_PLACEHOLDER"}},"actions":[{"label":"SUBSCRIBE","key":"subscribe","icon":"ion-android-bookmark","icon2":"ion-android-add-circle","search":false,"check":"noSubscriber"},{"label":"UNSUBSCRIBE","key":"unsubscribe","icon":"ion-android-bookmark","icon2":"ion-android-remove-circle","search":false,"check":"subscriber"}]},"simpleEntities":{"description":{"key":"description","url":"descriptions","label":"DESCRIPTION","title":"DESCRIPTIONS","fields":{"title":{"key":"title","label":"NAME","default":"","required":true},"description":{"key":"description","label":"TEXT","default":"","required":true}},"contentKey":"description","contentKeyType":"text","idKey":"description_id","icon":"ion-android-list","addLabel":"ADD_DESCRIPTION","exclude":["FL_COMMENTS","FL_ARTICLES"],"excludeAdd":["FL_COMMENTS","FL_ARTICLES"]},"comment":{"key":"comment","url":"comments","label":"COMMENT","title":"COMMENTS","fields":{"message":{"key":"message","label":"TEXT","default":"","required":true}},"contentKey":"message","contentKeyType":"text","idKey":"comment_id","icon":"ion-chatbox-working","addLabel":"ADD_COMMENT","exclude":["FL_PLACES"],"excludeAdd":["FL_PLACES"]},"image":{"key":"image","url":"images","label":"IMAGE","title":"GALLERY","fields":{"image":{"key":"image","label":"IMAGE","default":"","required":true}},"contentKey":"filedata","contentKeyType":"image","idKey":"image_id","icon":"ion-images","addLabel":"ADD_IMAGE"}},"list":[{"name":"PLACE_NAME","id":1,"icon":"ion-location","slug":"place","url":"places","key":"FL_PLACES","index":3,"show_author":false,"properties":{"parent_id":{"key":"parent_id","label":"PARENT_PLACE_LABEL","placeholder":"PARENT_PLACE_PLACEHOLDER","default":null},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":null,"advanced":true,"is_editable":true},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":null,"advanced":true,"is_editable":true}},"relations":{"FL_PLACES":{"slug":"parent_id","field":"parent_id","label":"REL_PARENT_ID_LABEL","childrenLabel":"REL_PARENT_ID_CHILD_LABEL"},"FL_EVENTS":{"slug":"location","field":"location","label":"REL_LOCATION_LABEL","childrenLabel":"REL_LOCATION_CHILD_LABEL","bounded":true},"FL_ARTICLES":{"slug":"article_of","field":"article_of","label":"REL_ARTICLE_OF_LABEL","childrenLabel":"REL_ARTICLE_OF_CHILD_LABEL","bounded":true},"FL_COMMENTS":{"slug":"comment_of","field":"comment_of","label":"REL_COMMENT_OF_LABEL","childrenLabel":"REL_COMMENT_OF_CHILD_LABEL","bounded":true},"FL_GROUPS":{"slug":"group_of","field":"group_of","label":"REL_GROUP_OF_LABEL","childrenLabel":"REL_GROUP_OF_CHILD_LABEL","bounded":true}}},{"name":"EVENT_NAME","id":2,"icon":"ion-calendar","slug":"event","url":"events","key":"FL_EVENTS","index":5,"show_author":false,"properties":{"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":"","required":true,"is_editable":true},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":"","required":true,"is_editable":true},"location":{"key":"location","label":"LOCATION_LABEL","placeholder":"LOCATION_PLACEHOLDER","default":null},"duration":{"key":"duration","label":"DURATION_LABEL","placeholder":"DURATION_PLACEHOLDER","default":null},"door_time":{"key":"door_time","label":"DOORTIME_LABEL","placeholder":"DOORTIME_PLACEHOLDER","default":null},"parent_id":{"key":"parent_id","label":"PARENT_EVENT_LABEL","placeholder":"PARENT_EVENT_PLACEHOLDER","default":null},"attendees":{"key":"attendees","label":"ATTENDEES_LABEL","placeholder":"ATTENDEES_PLACEHOLDER","default":[],"advanced":true},"performer":{"key":"performer","label":"PERFORMER_LABEL","placeholder":"PERFORMER_PLACEHOLDER","default":-1,"advanced":true},"organizer":{"key":"organizer","label":"ORGANIZER_LABEL","placeholder":"ORGANIZER_PLACEHOLDER","default":-1,"advanced":true}},"relations":{"FL_EVENTS":{"slug":"parent_id","field":"parent_id","label":"REL_PARENT_ID_LABEL","childrenLabel":"REL_PARENT_ID_CHILD_LABEL"},"FL_ARTICLES":{"slug":"article_of","field":"article_of","label":"REL_ARTICLE_OF_LABEL","childrenLabel":"REL_ARTICLE_OF_CHILD_LABEL","bounded":true},"FL_GROUPS":{"slug":"group_of","field":"group_of","label":"REL_GROUP_OF_LABEL","childrenLabel":"REL_GROUP_OF_CHILD_LABEL","bounded":true}}},{"name":"POST_NAME","id":4,"icon":"ion-clipboard","slug":"article","url":"articles","key":"FL_ARTICLES","index":7,"show_author":true,"properties":{"parent_id":{"key":"parent_id","label":"PARENT_POST_LABEL","placeholder":"PARENT_POST_PLACEHOLDER","default":null},"article_of":{"key":"article_of","label":"ARTICLE_OF_LABEL","placeholder":"ARTICLE_OF_PLACEHOLDER","default":null},"text":{"key":"text","label":"TEXT_LABEL","placeholder":"TEXT_PLACEHOLDER","required":true,"default":""},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":"","required":true,"advanced":true,"is_editable":true},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":null,"required":true,"advanced":true}},"relations":{"FL_ARTICLES":{"slug":"parent_id","field":"parent_id","label":"REL_PARENT_ID_LABEL","childrenLabel":"REL_PARENT_ID_CHILD_LABEL","bounded":true}}},{"name":"COMMENT_NAME","id":3,"icon":"ion-quote","slug":"news","url":"news","key":"FL_COMMENTS","index":9,"show_author":true,"properties":{"comment_of":{"key":"comment_of","label":"COMMENT_OF_LABEL","placeholder":"COMMENT_OF_PLACEHOLDER","default":null},"message_text":{"key":"message_text","label":"MESSAGE_LABEL","placeholder":"MESSAGE_PLACEHOLDER","default":"","required":true},"group_id":{"key":"group_id","label":"GROUP","placeholder":"GROUP","default":null},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":"","required":true,"is_editable":true,"advanced":true},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":"","required":true,"is_editable":false,"advanced":true}},"relations":{}},{"name":"GROUPS_NAME","id":5,"icon":"ion-flag","slug":"group","url":"groups","key":"FL_GROUPS","index":11,"show_author":false,"properties":{"parent_id":{"key":"parent_id","label":"PARENT_GROUP_LABEL","placeholder":"PARENT_GROUP_PLACEHOLDER","default":null},"group_of":{"key":"group_of","label":"GROUP_OF_LABEL","placeholder":"GROUP_OF_PLACEHOLDER","default":null},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":"","required":true,"is_editable":true,"advanced":true},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":"","required":true,"is_editable":true,"advanced":true},"members":{"key":"members","label":"GROUP_MEMBERS","placeholder":"","default":1,"icon":"ion-android-people"}},"relations":{"FL_GROUPS":{"slug":"parent_id","field":"parent_id","label":"REL_PARENT_ID_LABEL","childrenLabel":"REL_PARENT_ID_CHILD_LABEL","exclude":true,"check":"membership"},"FL_PLACES":{"slug":"group_id","field":"group_id","label":"REL_BY_GROUP_LABEL","childrenLabel":"REL_BY_GROUP_PLACE_CHILD_LABEL","exclude":true,"check":"membership"},"FL_EVENTS":{"slug":"group_id","field":"group_id","label":"REL_BY_GROUP_LABEL","childrenLabel":"REL_BY_GROUP_EVENT_CHILD_LABEL","exclude":true,"check":"membership"},"FL_ARTICLES":{"slug":"group_id","field":"group_id","label":"REL_BY_GROUP_LABEL","childrenLabel":"REL_BY_GROUP_POST_CHILD_LABEL","exclude":true,"check":"membership"},"FL_COMMENTS":{"slug":"group_id","field":"group_id","label":"REL_BY_GROUP_LABEL","childrenLabel":"REL_BY_GROUP_COMMENT_CHILD_LABEL","exclude":true,"check":"membership"}},"actions":[{"label":"JOIN_GROUP","key":"join","icon":"ion-android-person-add","search":false,"check":"noMembership"},{"label":"LEAVE_GROUP","key":"leave","icon":"ion-android-exit","search":false,"check":"noOwnership"},{"label":"VIEW_GROUP","key":"view","icon":"ion-map","icon2":"ion-android-arrow-dropright-circle","search":"groups","check":false}]}],"categories":[{"category_space":1,"name":"Categorie","slug":"categorie","description":"Tipologie di attività","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-1,"name":"Cultura e arte","description":"","category_index":1,"icon_name":"ion-paintbrush"},{"id":-2,"name":"Istruzione e formazione","description":"","category_index":2,"icon_name":"ion-university"},{"id":-6,"name":"Attività per il sociale","description":"","category_index":3,"icon_name":"ion-android-people"},{"id":-3,"name":"Sport","description":"","category_index":4,"icon_name":"ion-ios-football"},{"id":-4,"name":"Alimentazione e ristorazione","description":"","category_index":5,"icon_name":"ion-android-restaurant"},{"id":-5,"name":"Tempo libero","description":"","category_index":6,"icon_name":"ion-chatbubbles"},{"id":-500,"name":"Uffici pubblici","description":"","category_index":7,"icon_name":"ion-social-buffer"},{"id":-7,"name":"Servizi professionali","description":"","category_index":8,"icon_name":"ion-briefcase"},{"id":-501,"name":"Artigianato e industria","description":"","category_index":9,"icon_name":"ion-settings"},{"id":-9,"name":"Commercio","description":"","category_index":10,"icon_name":"ion-bag"},{"id":-10,"name":"Trasporti e mobilità","description":"","category_index":11,"icon_name":"ion-android-subway"}],"entities":["FL_EVENTS","FL_PLACES","FL_GROUPS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]},{"category_space":13,"name":"Tipologia di spazio","slug":"tipologia-di spazio","description":"Tipologia di spazio","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-90,"name":"Spazi aperti e aree verdi","description":"","category_index":1,"icon_name":"ion-leaf"},{"id":-91,"name":"Spazi istituzionali","description":"","category_index":2,"icon_name":"ion-ios-flag"},{"id":-92,"name":"Residenze e vicinato","description":"","category_index":3,"icon_name":"ion-ios-home"},{"id":-93,"name":"Spazi produttivi","description":"","category_index":4,"icon_name":"ion-gear-a"},{"id":-94,"name":"Monumenti e luoghi storici","description":"","category_index":5,"icon_name":"ion-ribbon-b"}],"entities":["FL_PLACES"]},{"category_space":14,"name":"Costo","slug":"costo","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-100,"name":"Gratuito","description":"","category_index":1,"icon_name":"ion-happy-outline"},{"id":-101,"name":"A pagamento","description":"","category_index":2,"icon_name":"ion-cash"}],"entities":["FL_EVENTS"]},{"category_space":15,"name":"Accesso","slug":"accesso","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-110,"name":"Accesso libero","description":"","category_index":1,"icon_name":"ion-radio-waves"},{"id":-111,"name":"Su invito o prenotazione","description":"","category_index":2,"icon_name":"ion-paper-airplane"},{"id":-112,"name":"Riservato al gruppo","description":"","category_index":3,"icon_name":"ion-android-hand"}],"entities":["FL_EVENTS"]},{"category_space":16,"name":"Partecipazione","slug":"partecipazione","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-120,"name":"Per tutti","description":"","category_index":1,"icon_name":"ion-load-b"},{"id":-121,"name":"Per bambini e ragazzi","description":"","category_index":2,"icon_name":"ion-ios-color-wand"},{"id":-122,"name":"Per giovani","description":"","category_index":3,"icon_name":"ion-android-bar"},{"id":-123,"name":"Per famiglie","description":"","category_index":4,"icon_name":"ion-icecream"}],"entities":["FL_EVENTS"]},{"category_space":17,"name":"Approfondimenti","slug":"approfondimenti","description":"","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-130,"name":"Esperienze","description":"","category_index":1,"icon_name":"ion-chatboxes"},{"id":-131,"name":"Racconti","description":"","category_index":2,"icon_name":"ion-edit"},{"id":-132,"name":"Report di progetti e iniziative","description":"","category_index":3,"icon_name":"ion-android-clipboard"},{"id":-133,"name":"Articoli","description":"","category_index":4,"icon_name":"ion-chatbox-working"}],"entities":["FL_ARTICLES"]},{"category_space":25,"name":"Gruppi","slug":"gruppi","description":"Tipo di gruppo","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-230,"name":"Discussione","description":"","category_index":1,"icon_name":"ion-android-chat"},{"id":-231,"name":"Coordinamento","description":"","category_index":2,"icon_name":"ion-ios-people"},{"id":-62,"name":"Progetto","description":"","category_index":3,"icon_name":"ion-wand"}],"entities":["FL_GROUPS"]}]},"design":{"logo":{"url":"img/firstlife-logo.svg","title":"FirstLife","alt":"FirstLife","label":{"text":"FirstLife","style":"color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;"}},"logo_bar":"img/firstlife-testo.svg","logo_menu":"img/firstlife-logo-palla.svg","logo_width":160,"logo_height":160,"default_thumb":"img/thumb.jpg","default_background":"img/fondo-walktrough.jpg","logo_partners":[],"colors":["rgba(246,213,59, 1)","rgba(255,179,16, 1)","rgba(243,164,106, 1)","rgba(221,91,42, 1)","rgba(174,10,10, 1)","rgba(130,50,86, 1)","rgba(45,69,104, 1)","rgba(63,127,145, 1)","rgba(61,131,97, 1)","rgba(136,186,92, 1)","rgba(246,213,59, 1)","rgba(255,179,16, 1)","rgba(243,164,106, 1)","rgba(221,91,42, 1)","rgba(174,10,10, 1)","rgba(130,50,86, 1)","rgba(45,69,104, 1)","rgba(63,127,145, 1)","rgba(61,131,97, 1)","rgba(136,186,92, 1)","#ccc"],"show_thumbs":true,"can_permalink":false,"default_language":"it","disabled_color":20,"side_menu":[{"name":"Sito web FirstLife","url":"http://firstlife.org","icon":"ion-social-rss","lang":"it"},{"name":"Guida all'uso","url":"http://www.firstlife.org/category/guida-alluso_tutorial/","icon":"ion-information","lang":"it"},{"name":"Fanpage","url":"https://www.facebook.com/firstlife.org/","icon":"ion-social-facebook","lang":"it"}]},"actions":{"alow_login":true,"alow_signup":true,"show_menu":true,"profile_tab":true,"map_tab":true,"reset_tab":true,"logout_tab":true,"wall_tab":true,"helpdesk_tab":"http://help.firstlife.di.unito.it/","geolocation":true,"search":true,"edit_mode":true,"favourite_place":false,"category_filter":true,"time_filter":true,"can_modify":true,"can_delete":true,"can_foto":true,"switch_language":true},"navigator":{"default_area":{"visible":true,"name":"Torino Area Metropolitana","bound":[[7.3893504143,44.950933427],[7.9995889664,45.2495768599]]},"places":[{"id":19,"visible":true,"name":"Falchera","bound":[[45.1177816,7.695794],[45.133293,7.7174663]]},{"id":16,"visible":true,"name":"Lanzo - Madonna di Campagna","bound":[[45.1117254447,7.6590584653],[45.1272368447,7.6934337072]]},{"id":15,"visible":true,"name":"Le Vallette - Lucento","bound":[[45.0968375449,7.6201225506],[45.105955431,7.6529957043]]},{"id":17,"visible":true,"name":"Borgata Vittoria","bound":[[45.0916766822,7.6668869769],[45.1118534308,7.6877810434]]},{"id":6,"visible":true,"name":"Campidoglio - San Donato","bound":[[45.0772632753,7.647922038],[45.0889751626,7.6740789635]]},{"id":12,"visible":true,"name":"Cit Turin","bound":[[45.0687600712,7.6442654611],[45.078539043,7.6685438327]]},{"id":5,"visible":true,"name":"Cenisia","bound":[[45.0614118,7.6384915],[45.0755057,7.6628565]]},{"id":4,"visible":true,"name":"San Paolo","bound":[[45.0533176,7.6348383],[45.0689062,7.6576853]]},{"id":14,"visible":true,"name":"Parella","bound":[[45.0751241235,7.6069291116],[45.0934472622,7.6493177584]]},{"id":13,"visible":true,"name":"Pozzo strada","bound":[[45.0567587995,7.6020367624],[45.0762334162,7.6358423404]]},{"id":11,"visible":true,"name":"Santa Rita","bound":[[45.036086802,7.6293388009],[45.0564929722,7.6639714837]]},{"id":12,"visible":true,"name":"Mirafiori Nord","bound":[[45.0295134,7.6115942],[45.0573344,7.6419352042]]},{"id":23,"visible":true,"name":"Mirafiori Sud","bound":[[45.005593,7.586918],[45.041993,7.6590157]]},{"id":10,"visible":true,"name":"Lingotto","bound":[[45.0174559,7.635262],[45.0466441,7.666889]]},{"id":9,"visible":true,"name":"Nizza - Millefonti","bound":[[45.0127850817,7.6641011113],[45.0419732817,7.6761587144]]},{"id":3,"visible":true,"name":"Crocetta - San Secondo","bound":[[45.0513163864,7.6559042672],[45.0667848171,7.6767825942]]},{"id":2,"visible":true,"name":"San Salvario - Valentino","bound":[[45.0413258,7.6671696],[45.0627304,7.6916313]]},{"id":1,"visible":true,"name":"Centro","bound":[[45.059029967,7.6719761186],[45.0752806058,7.6979827709]]},{"id":7,"visible":true,"name":"Aurora - Rossini - Valdocco","bound":[[45.0735356,7.6733921751],[45.0900355,7.6940345867]]},{"id":18,"visible":true,"name":"Barriera di Milano","bound":[[45.0796423,7.6839387789],[45.0997603,7.7128744]]},{"id":20,"visible":true,"name":"Regio Parco - Barca - Bertolla","bound":[[45.0831238222,7.6992271905],[45.1127879113,7.7415847372]]},{"id":8,"visible":true,"name":"Vanchiglia","bound":[[45.0633670906,7.6832735984],[45.0866567788,7.7287636806]]},{"id":21,"visible":true,"name":"Madonna del Pilone","bound":[[45.0607695772,7.7303777592],[45.0796821399,7.7576719181]]},{"id":22,"visible":true,"name":"Borgo Po","bound":[[45.0533635208,7.6951368179],[45.0634583422,7.7173669662]]}],"search":{"geocoding":"http://nominatim.openstreetmap.org/search"}},"map":{"tile_view":"http://api.mapbox.com/v4/drp0ll0.0ba9e7bf/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ","tile_edit":"https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png","map_default_lat":45.070312,"map_default_lng":7.686856,"map_autocenter":false,"zoom_level":16,"zoom_create":18,"set_bounds":false,"fit_bounds":true,"shouthWest_bounds":[7.649675,45.079098],"northEast_bounds":[7.655708,45.083202],"zoom":true,"zoom_position":"bottomleft","attribution":false,"max_zoom":22,"min_zoom":6,"cluster_limit":18,"time_from":"","time_to":"","marker_size":[20,20],"marker_ancor":[10,10],"bbox_details":"full","geometry_layer":true,"min_zoom_geometry_layer":20,"area":{"levels":[{"level":0,"name":"Livello strada","id":1,"icon":"ion-social-buffer-outline","slug":"ground-level","key":0,"index":1}]},"filters":[{"key":"group","property":"group_id","search_param":"groups","icon":"ion-flag","type":"strict","label":"GROUP_FILTERING","entity_type":"FL_GROUPS"},{"key":"user","property":"user","search_param":"users","icon":"ion-android-person","type":"strict","label":"USER_FILTERING"},{"key":"q","property":"","search_param":"q","icon":"ion-ios-search-strong","type":"","label":"SEARCH_FILTERING","skip":true}]},"behaviour":{"is_login_required":false,"bbox_timeout":5000,"moveend_delay":1000,"searchend_delay":1000,"marker_cache":true,"bbox_reload_time":30000,"modal_relaod_time":5000,"split_factor":1,"umask":744,"viewer":false,"query_limit":3,"search_results_limit":5}});

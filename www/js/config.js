angular.module("firstlife.config", [])
.constant("myConfig", {"dev":true,"project":1,"api_base_domain":"api.dev.firstlife.di.unito.it/","format":"","api_version":"v4","ssl":false,"version":"0.4.5.1","app_name":"MiraMap","domain_name":"miramap","domain_id":5,"types":{"default":{"slug":"place","id":1,"icon":"ion-location","properties":{"name":{"key":"name","label":"TITLE","placeholder":"TITLE","required":true,"default":""},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":null,"is_editable":false},"valid_to":{"key":"valid_to","label":"ENDDATE_LABEL","placeholder":"ENDDATE_PLACEHOLDER","default":null,"is_editable":false},"link_url":{"key":"link_url","label":"URL_LABEL","placeholder":"URL_PLACEHOLDER","default":""},"tags":{"key":"tags","label":"TAGS_LABEL","placeholder":"TAGS_PLACEHOLDER","default":[]},"categories":{"key":"categories","label":"CATEGORIES","default":[]},"group_id":{"key":"group_id","label":"GROUP","placeholder":"GROUP","default":null},"thumbnail":{"key":"thumbnail","label":"THUMBNAIL_LABEL","placeholder":"THUMBNAIL_PLACEHOLDER","default":null},"user":{"key":"user","label":"USER","placeholder":"USER","default":-1},"wp_id":{"key":"id_wp","required":true,"default":1},"id":{"key":"id","default":null},"level":{"key":"level","default":0,"label":"LEVEL_LABEL","placeholder":"LEVEL_PLACEHOLDER"}},"actions":[{"label":"SUBSCRIBE","key":"subscribe","icon":"ion-android-bookmark","icon2":"ion-android-add-circle","search":false,"check":"noSubscriber"},{"label":"UNSUBSCRIBE","key":"unsubscribe","icon":"ion-android-bookmark","icon2":"ion-android-remove-circle","search":false,"check":"subscriber"}]},"simpleEntities":{"description":{"key":"description","url":"descriptions","label":"DESCRIPTION","title":"DESCRIPTIONS","fileds":{"title":{"key":"title","label":"NAME","default":"","required":true},"description":{"key":"description","label":"TEXT","default":"","required":true}},"contentKey":"description","contentKeyType":"text","idKey":"description_id","icon":"ion-android-list","addLabel":"ADD_DESCRIPTION","exclude":["FL_COMMENTS","FL_ARTICLES"],"excludeAdd":["FL_COMMENTS","FL_ARTICLES"]},"comment":{"key":"comment","url":"comments","label":"COMMENT","title":"COMMENTS","fileds":{"message":{"key":"message","label":"TEXT","default":"","required":true}},"contentKey":"message","contentKeyType":"text","idKey":"comment_id","icon":"ion-chatbox-working","addLabel":"ADD_COMMENT","exclude":["FL_PLACES"],"excludeAdd":["FL_PLACES"]},"image":{"key":"image","url":"images","label":"IMAGE","title":"GALLERY","fileds":{"image":{"key":"image","label":"IMAGE","default":"","required":true}},"contentKey":"filedata","contentKeyType":"image","idKey":"image_id","icon":"ion-images","addLabel":"ADD_IMAGE"}},"list":[{"name":"Segnalazione","id":1,"icon":"ion-clipboard","slug":"ticket","url":"tickets","key":"FL_TICKETS","index":8,"properties":{"description":{"key":"description","label":"DESCRIPTION","placeholder":"DESCRIPTION","required":true,"default":""},"valid_from":{"key":"valid_from","label":"STARTDATE_LABEL","placeholder":"STARTDATE_PLACEHOLDER","default":"","required":true,"is_editable":false}},"relations":{}}],"categories":[{"category_space":11,"name":"Stato","slug":"stato","description":"Mirafiori Sud Stato","is_editable":false,"is_mandatory":false,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-70,"name":"Ricevuto","description":"Ricevuto","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-71,"name":"In attuazione","description":"In attuazione","category_index":2,"icon_name":"ion-android-radio-button-on"},{"id":-72,"name":"Risolto/Completato","description":"Risolto/Completato","category_index":3,"icon_name":"ion-android-checkmark-circle"}],"entities":["FL_TICKETS"]},{"category_space":9,"name":"Categoria","slug":"categoria","description":"Mirafiori Sud Categoria","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-50,"name":"Qualità Ambientale","description":"es. degrado, inquinamento, nettezza urbana","category_index":1,"icon_name":"ion-waterdrop"},{"id":-51,"name":"Attrezzature/Arredo urbano","description":"es. giochi per l'infanzia, fontane, panchine,  illuminazione","category_index":2,"icon_name":"ion-cube"},{"id":-52,"name":"Viabilità e suolo pubblico","description":"es. passaggi pedonali, piste ciclabili, segnaletica, manutenzione","category_index":3,"icon_name":"ion-alert-circled"},{"id":-53,"name":"Verde pubblico","description":"es. sfalcio dell'erba, siepi, rami, giardini","category_index":4,"icon_name":"ion-leaf"},{"id":-54,"name":"Protezione Animali","description":"es. aree cani, colonie feline, protezione animali","category_index":5,"icon_name":"ion-ios-paw"},{"id":-55,"name":"Sicurezza","description":"es. sicurezza aree gioco, vandalismi, illuminazione, abusivismo","category_index":6,"icon_name":"ion-ios-eye"},{"id":-56,"name":"Servizi pubblici","description":"es. trasporti pubblici, impianti sportivi, scuole, sanità","category_index":7,"icon_name":"ion-android-train"}],"entities":["FL_TICKETS"]},{"category_space":10,"name":"Tipologia","slug":"tipologia","description":"Mirafiori Sud Tipologia","is_editable":true,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":true,"categories":[{"id":-60,"name":"Problema","description":"","category_index":1,"icon_name":"ion-alert"},{"id":-61,"name":"Realtà positiva","description":"","category_index":2,"icon_name":"ion-star"},{"id":-62,"name":"Proposta","description":"","category_index":3,"icon_name":"ion-android-bulb"}],"entities":["FL_TICKETS"]},{"category_space":12,"name":"Generico","slug":"generico","description":"Generico","is_editable":false,"is_mandatory":true,"multiple_categories_allowed":false,"is_visible":false,"categories":[{"id":-80,"name":"Commento(cat)","description":"Commento(cat)","category_index":1,"icon_name":"ion-android-radio-button-off"},{"id":-81,"name":"Immagine(cat)","description":"Immagine(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"},{"id":-82,"name":"Articolo(cat)","description":"Articolo(cat)","category_index":2,"icon_name":"ion-android-radio-button-off"}],"entities":["FL_COMMENTS","FL_IMAGES"]}]},"design":{"logo":{"url":"http://www.firstlife.org/wp-content/uploads/2016/04/logo-miramap.png","title":"Miramap","alt":"miramap","label":{"text":"Miramap","style":"color:white; font-family:sans-serif, arial, verdana; font-style: normal; font-weight: normal; font-size:8em; letter-spacing:-10px; text-shadow:1px 1px 3px #333;"}},"logo_bar":"http://www.firstlife.org/wp-content/uploads/2016/04/logo-miramap-testo.png","logo_menu":"http://www.firstlife.org/wp-content/uploads/2016/04/MiraMapFavicon-1.svg","logo_width":160,"logo_height":160,"default_thumb":"img/thumb.jpg","default_background":"img/fondo-walktrough.jpg","logo_partners":[],"colors":["rgba(221,91,42, 1)","rgba(246,213,59, 1)","rgba(61,131,97, 1)","rgba(255,179,16, 1)","rgba(243,164,106, 1)","rgba(174,10,10, 1)","rgba(130,50,86, 1)","rgba(45,69,104, 1)","rgba(63,127,145, 1)","rgba(136,186,92, 1)"],"show_thumbs":true,"can_permalink":false,"default_language":"it","disabled_color":20,"side_menu":[{"name":"Torna a MiraMap","url":"http://www.miramap.it/","icon":"ion-android-home","lang":"it"},{"name":"Scopri il progetto","url":"http://www.miramap.it/#seconda-sezione","lang":"it"},{"name":"News","url":"http://www.miramap.it/category/appuntamenti/","icon":"ion-social-rss","lang":"it"}]},"actions":{"alow_login":true,"alow_signup":true,"show_menu":true,"profile_tab":true,"map_tab":true,"reset_tab":true,"logout_tab":true,"wall_tab":true,"helpdesk_tab":"http://help.firstlife.di.unito.it/","geolocation":true,"search":true,"edit_mode":true,"favourite_place":true,"category_filter":true,"time_filter":true,"can_modify":true,"can_delete":true,"can_foto":true,"switch_language":true},"navigator":{"default_area":{"visible":true,"name":"Torino Area Metropolitana","bound":[[7.3893504143,44.950933427],[7.9995889664,45.2495768599]]},"places":[{"id":19,"visible":true,"name":"Falchera","bound":[[45.1177816,7.695794],[45.133293,7.7174663]]},{"id":16,"visible":true,"name":"Lanzo - Madonna di Campagna","bound":[[45.1117254447,7.6590584653],[45.1272368447,7.6934337072]]},{"id":15,"visible":true,"name":"Le Vallette - Lucento","bound":[[45.0968375449,7.6201225506],[45.105955431,7.6529957043]]},{"id":17,"visible":true,"name":"Borgata Vittoria","bound":[[45.0916766822,7.6668869769],[45.1118534308,7.6877810434]]},{"id":6,"visible":true,"name":"Campidoglio - San Donato","bound":[[45.0772632753,7.647922038],[45.0889751626,7.6740789635]]},{"id":12,"visible":true,"name":"Cit Turin","bound":[[45.0687600712,7.6442654611],[45.078539043,7.6685438327]]},{"id":5,"visible":true,"name":"Cenisia","bound":[[45.0614118,7.6384915],[45.0755057,7.6628565]]},{"id":4,"visible":true,"name":"San Paolo","bound":[[45.0533176,7.6348383],[45.0689062,7.6576853]]},{"id":14,"visible":true,"name":"Parella","bound":[[45.0751241235,7.6069291116],[45.0934472622,7.6493177584]]},{"id":13,"visible":true,"name":"Pozzo strada","bound":[[45.0567587995,7.6020367624],[45.0762334162,7.6358423404]]},{"id":11,"visible":true,"name":"Santa Rita","bound":[[45.036086802,7.6293388009],[45.0564929722,7.6639714837]]},{"id":12,"visible":true,"name":"Mirafiori Nord","bound":[[45.0295134,7.6115942],[45.0573344,7.6419352042]]},{"id":23,"visible":true,"name":"Mirafiori Sud","bound":[[45.005593,7.586918],[45.041993,7.6590157]]},{"id":10,"visible":true,"name":"Lingotto","bound":[[45.0174559,7.635262],[45.0466441,7.666889]]},{"id":9,"visible":true,"name":"Nizza - Millefonti","bound":[[45.0127850817,7.6641011113],[45.0419732817,7.6761587144]]},{"id":3,"visible":true,"name":"Crocetta - San Secondo","bound":[[45.0513163864,7.6559042672],[45.0667848171,7.6767825942]]},{"id":2,"visible":true,"name":"San Salvario - Valentino","bound":[[45.0413258,7.6671696],[45.0627304,7.6916313]]},{"id":1,"visible":true,"name":"Centro","bound":[[45.059029967,7.6719761186],[45.0752806058,7.6979827709]]},{"id":7,"visible":true,"name":"Aurora - Rossini - Valdocco","bound":[[45.0735356,7.6733921751],[45.0900355,7.6940345867]]},{"id":18,"visible":true,"name":"Barriera di Milano","bound":[[45.0796423,7.6839387789],[45.0997603,7.7128744]]},{"id":20,"visible":true,"name":"Regio Parco - Barca - Bertolla","bound":[[45.0831238222,7.6992271905],[45.1127879113,7.7415847372]]},{"id":8,"visible":true,"name":"Vanchiglia","bound":[[45.0633670906,7.6832735984],[45.0866567788,7.7287636806]]},{"id":21,"visible":true,"name":"Madonna del Pilone","bound":[[45.0607695772,7.7303777592],[45.0796821399,7.7576719181]]},{"id":22,"visible":true,"name":"Borgo Po","bound":[[45.0533635208,7.6951368179],[45.0634583422,7.7173669662]]}],"search":{"geocoding":"http://nominatim.openstreetmap.org/search"}},"map":{"tile_view":"http://api.mapbox.com/v4/drp0ll0.0ba9e7bf/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJwMGxsMCIsImEiOiI4bUpPVm9JIn0.NCRmAUzSfQ_fT3A86d9RvQ","tile_edit":"https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png","map_default_lat":45.021557,"map_default_lng":7.624039,"map_autocenter":false,"zoom_level":14,"zoom_create":18,"set_bounds":false,"fit_bounds":true,"shouthWest_bounds":[7.649675,45.079098],"northEast_bounds":[7.655708,45.083202],"zoom":true,"zoom_position":"bottomleft","attribution":false,"max_zoom":22,"min_zoom":6,"cluster_limit":18,"time_from":"","time_to":"","marker_size":[20,20],"marker_ancor":[10,10],"bbox_details":"full","geometry_layer":true,"min_zoom_geometry_layer":20,"area":{"levels":[{"level":0,"name":"Livello strada","id":1,"icon":"ion-social-buffer-outline","slug":"ground-level","key":0,"index":1}],"style":{"fillColor":"#ffdac9","weight":3,"opacity":1,"color":"#FC4A00","dashArray":1,"fillOpacity":0.2,"clickable":false},"data":{"type":"Feature","id":"relation/2615145","properties":{"@id":"relation/2615145","admin_level":"10","boundary":"administrative","name":"Circoscrizione 10","type":"boundary"},"geometry":{"type":"Polygon","coordinates":[[[7.5778348,45.0418278],[7.5798488,45.0398769],[7.5801061,45.0396277],[7.5808523,45.0385759],[7.5809819,45.0383931],[7.5810578,45.0382859],[7.5811685,45.0382253],[7.5826807,45.0373977],[7.5828721,45.0372964],[7.5835216,45.0365457],[7.5841364,45.0361603],[7.5842746,45.0360937],[7.5856249,45.0355337],[7.5858182,45.035446],[7.5866215,45.0351311],[7.5873363,45.0348519],[7.5879734,45.034586],[7.5883987,45.034488],[7.5885511,45.0344698],[7.5888107,45.0344058],[7.5890307,45.0343327],[7.5896781,45.0340536],[7.5907945,45.0334918],[7.5925929,45.0327019],[7.593912,45.0321031],[7.5940114,45.0320398],[7.5946307,45.0316453],[7.5956611,45.0310903],[7.5977396,45.0299455],[7.5980818,45.029888],[7.5984558,45.0299157],[7.5988016,45.0300397],[7.60155,45.028296],[7.6033421,45.0287507],[7.6061019,45.0294551],[7.6073523,45.0297827],[7.6066187,45.0285498],[7.6057606,45.0271709],[7.6049712,45.0259197],[7.604905,45.0258146],[7.603924,45.0242274],[7.6036577,45.0237965],[7.6032015,45.0230439],[7.6023139,45.021642],[7.6005146,45.0187799],[7.5993844,45.0189637],[7.5976437,45.0192469],[7.5963076,45.019451],[7.5946815,45.0197056],[7.5944458,45.0197427],[7.5942598,45.0197539],[7.5941347,45.0197618],[7.5940116,45.0197696],[7.5933828,45.019887],[7.5926881,45.0199144],[7.5919571,45.019735],[7.5918458,45.019444],[7.5918363,45.0193636],[7.5918846,45.018901],[7.5922759,45.0176229],[7.5923843,45.0172631],[7.5915499,45.016976],[7.5908813,45.0167521],[7.5897639,45.0163778],[7.5905103,45.016158],[7.590809,45.0160736],[7.5909144,45.0160416],[7.5915372,45.0153875],[7.5919001,45.0150309],[7.5923925,45.0145476],[7.5929709,45.0141323],[7.5931153,45.0140286],[7.5941357,45.0140759],[7.5946724,45.0144506],[7.5947548,45.0146012],[7.5948742,45.0148271],[7.5949261,45.0149279],[7.5953518,45.0149737],[7.5954708,45.0149887],[7.596092,45.0147565],[7.5966328,45.0145508],[7.596686,45.0144584],[7.5968758,45.014105],[7.5963841,45.0131441],[7.5961597,45.0125567],[7.5964017,45.0122751],[7.5966591,45.0121965],[7.598242,45.0120971],[7.5988344,45.0125758],[7.5991607,45.0127767],[7.5994496,45.0129807],[7.5996153,45.0130601],[7.6010893,45.0135093],[7.6026024,45.0132764],[7.6033738,45.0128168],[7.6045373,45.0123568],[7.6046093,45.0123264],[7.6059049,45.0117875],[7.6060932,45.0116305],[7.6064277,45.0113433],[7.606563,45.011228],[7.6070843,45.0111296],[7.6071862,45.0111021],[7.6073831,45.0110621],[7.6075187,45.0110731],[7.6080252,45.0110871],[7.6083196,45.0108256],[7.6085226,45.010632],[7.6088277,45.0103424],[7.6090791,45.0101113],[7.6091993,45.0100515],[7.6100458,45.0097902],[7.6104765,45.0098173],[7.6105665,45.0098456],[7.6109049,45.0099624],[7.6113213,45.0101145],[7.611665,45.0102344],[7.6117338,45.0102499],[7.6121637,45.0103973],[7.6134134,45.0108311],[7.6139373,45.011092],[7.6143648,45.0111822],[7.6146256,45.0110813],[7.6152211,45.0108396],[7.6152979,45.0108304],[7.6154656,45.0107788],[7.6156422,45.0107353],[7.6162549,45.0106788],[7.6171914,45.0104168],[7.6174281,45.010379],[7.6181373,45.0102475],[7.6188239,45.0099695],[7.6199698,45.0094115],[7.6201756,45.0093153],[7.6204037,45.0092137],[7.6207931,45.0090468],[7.6208868,45.0090071],[7.6213461,45.0088125],[7.6225968,45.0084296],[7.6227036,45.0084036],[7.6229794,45.0083129],[7.6233732,45.0082579],[7.6234864,45.0082367],[7.6235675,45.0082229],[7.6239225,45.0081741],[7.6241516,45.0081274],[7.6251871,45.0080769],[7.6265125,45.0080979],[7.6275668,45.008333],[7.6279049,45.0088202],[7.6279916,45.0091192],[7.6284644,45.0095166],[7.6285949,45.0096286],[7.629015,45.0103643],[7.629338,45.0103663],[7.6295945,45.0103747],[7.6308214,45.0103995],[7.6315211,45.0103899],[7.6322438,45.0103267],[7.6324702,45.0102985],[7.6335273,45.0101154],[7.6344923,45.0095828],[7.6347031,45.009435],[7.6347725,45.0093771],[7.6363653,45.0081977],[7.6366239,45.0081035],[7.6366991,45.0080939],[7.637146,45.0081803],[7.6372828,45.0082945],[7.637342,45.0083445],[7.6373977,45.00839],[7.6375939,45.0085517],[7.6379923,45.0088799],[7.6382143,45.0089531],[7.6390374,45.0088439],[7.6396898,45.0086104],[7.640062,45.0084642],[7.6404273,45.0082849],[7.6406432,45.0080066],[7.6408355,45.0077562],[7.6410046,45.0075348],[7.6411646,45.0073255],[7.6417933,45.0071444],[7.6423854,45.0069831],[7.6426799,45.0069717],[7.6438449,45.0069047],[7.6443915,45.0067924],[7.6445702,45.0070423],[7.6446665,45.0070128],[7.6453646,45.0069678],[7.6454726,45.0069769],[7.6456214,45.0070243],[7.6458062,45.0070948],[7.645937,45.0071723],[7.6462117,45.0070615],[7.6464928,45.0071978],[7.6469093,45.0075545],[7.647467,45.007726],[7.647534,45.0077726],[7.6476654,45.0077978],[7.6478078,45.0078478],[7.6481545,45.0079056],[7.6490467,45.0080015],[7.6498078,45.0079185],[7.650084,45.0080432],[7.6504622,45.0082095],[7.6505738,45.0082591],[7.650663,45.0083085],[7.6507124,45.0083411],[7.6507991,45.0083982],[7.650962,45.0085098],[7.6510261,45.0085513],[7.6511525,45.0086386],[7.6512632,45.0087098],[7.6514542,45.008737],[7.651578,45.0087573],[7.6517282,45.0088096],[7.6519198,45.008891],[7.6520883,45.0089152],[7.6522189,45.0088738],[7.652299,45.0088086],[7.6523982,45.0087088],[7.6524104,45.0086443],[7.6524223,45.008559],[7.6524301,45.0085005],[7.6524394,45.0084286],[7.6524505,45.0083432],[7.6524654,45.008242],[7.6524969,45.0081627],[7.6525529,45.0080642],[7.6532966,45.0079263],[7.6534643,45.0079544],[7.6536124,45.0079389],[7.6537371,45.0079534],[7.6540346,45.007941],[7.6541177,45.007902],[7.6541804,45.0078755],[7.6542454,45.0078491],[7.6543823,45.0077923],[7.6544609,45.0077243],[7.6545645,45.0076355],[7.6547028,45.0075544],[7.6551163,45.0073118],[7.6554258,45.0080491],[7.6555112,45.0082557],[7.6557253,45.0087642],[7.655743,45.0088258],[7.6557689,45.0088835],[7.656052,45.0095493],[7.6564566,45.0105009],[7.6567243,45.011164],[7.6570741,45.0120287],[7.6574858,45.0130378],[7.6579574,45.0140915],[7.6581987,45.0146305],[7.6587386,45.0158972],[7.6588902,45.0162637],[7.6584392,45.017501],[7.6582741,45.0179867],[7.6580957,45.0185797],[7.6580136,45.0189585],[7.6579622,45.0193778],[7.6564903,45.0197428],[7.6504328,45.0218875],[7.6481181,45.0177321],[7.6480686,45.017508],[7.64791,45.0175126],[7.6448691,45.0181466],[7.6435612,45.0184636],[7.6401414,45.0210698],[7.6350708,45.0228233],[7.6359355,45.0233632],[7.6361223,45.0234887],[7.6365801,45.0239245],[7.6370005,45.0242943],[7.6374676,45.0247367],[7.6427351,45.0294338],[7.6249377,45.0355959],[7.6165194,45.0318177],[7.6149873,45.032361],[7.6137499,45.0328027],[7.6116114,45.0337465],[7.6091227,45.0347954],[7.6081208,45.0351565],[7.6076626,45.0353077],[7.6074024,45.0353693],[7.6072979,45.035416],[7.6065192,45.0356191],[7.6051565,45.0362837],[7.6048089,45.0364859],[7.6044588,45.0366615],[7.6032656,45.0372365],[7.6000269,45.0387938],[7.5994549,45.0390078],[7.5990379,45.0391828],[7.5989508,45.0392205],[7.5986529,45.0393492],[7.5981672,45.0395662],[7.5968851,45.039816],[7.5967255,45.039847],[7.5962287,45.0400304],[7.5952311,45.0404548],[7.5943776,45.0408271],[7.5930718,45.0414245],[7.5927092,45.0415845],[7.5926184,45.041687],[7.5926018,45.0419767],[7.592565,45.0421194],[7.5918388,45.0424837],[7.5904085,45.0431498],[7.5895888,45.0434957],[7.5887665,45.0438827],[7.5885461,45.0439864],[7.5867072,45.044852],[7.585685,45.0438365],[7.5839222,45.0420773],[7.5837585,45.0421508],[7.5830018,45.0425864],[7.5828024,45.042688],[7.5824885,45.0428694],[7.5822604,45.0430255],[7.5821717,45.0430613],[7.5822373,45.0435772],[7.5822186,45.0436551],[7.5821496,45.0437129],[7.5816406,45.0438735],[7.5813703,45.0439721],[7.5812282,45.0439964],[7.5811834,45.0439268],[7.5803066,45.0442955],[7.5778348,45.0418278]]]}}},"filters":[{"key":"group","property":"group_id","search_param":"groups","icon":"ion-flag","type":"strict","label":"GROUP_FILTERING","entity_type":"FL_GROUPS"},{"key":"user","property":"user","search_param":"users","icon":"ion-android-person","type":"strict","label":"USER_FILTERING"}]},"behaviour":{"is_login_required":false,"bbox_timeout":5000,"moveend_delay":1000,"searchend_delay":1000,"marker_cache":true,"bbox_reload_time":30000,"modal_relaod_time":5000,"split_factor":1,"umask":744,"viewer":false,"query_limit":3,"search_results_limit":5}});

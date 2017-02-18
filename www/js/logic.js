angular.module('firstlife.config')
// configurazione degli url alle api
    .config(
    function setupApi(myConfig){
        if(myConfig.dev)console.log("setup url api!");

        // costruisco gli url delle api
        var ssl = "//";
        if(!myConfig.ssl)
            ssl = "http://";

        myConfig.base_domain = ssl.concat(myConfig.base_domain);
        var url = "";
        url = url.concat(ssl).concat(myConfig.api_base_domain).concat(myConfig.api_version).concat("/fl/");
        myConfig.domain_signature = url;
        myConfig.backend_things = url.concat('things');
        myConfig.backend_notifications = url.concat('fl_users');
        myConfig.backend_bbox = url.concat('things/boundingbox');
        myConfig.backend_categories = url.concat('categories');
        myConfig.backend_users = 'http://firstlife-dev.di.unito.it:3095/v4/fl/domains/'.concat(myConfig.domain_id).concat('/').concat('user');
        //myConfig.backend_users = url.concat('user');
        myConfig.backend_organization = url.concat('organization');
        myConfig.update_user = url.concat('user/update');
        myConfig.retrieve_password = myConfig.backend_users.concat('/resetpass');
        myConfig.reset_password = myConfig.backend_users.concat('/resetpass');
        myConfig.backend_tags = url.concat('tags');
        myConfig.backend_search = url.concat('things/search');
        myConfig.backend_autocomplete = myConfig.backend_search.concat("?q="); 

        for(k in myConfig.types.list){
            if(myConfig.types.list[k].url){
                myConfig.types.list[k].url = url.concat(myConfig.types.list[k].url);
            }   
        }

        if(myConfig.dev)console.log("url api", url);

    })
// configurazione authentication
    .config(
    function setupAuth(myConfig){
        var params = myConfig.authentication;
        var url = ("https://").concat(params.auth_base_domain);
        var redirect_uri_auth = myConfig.base_domain.concat("/callback");
        var redirect_uri_logout = myConfig.base_domain.concat("/logout");
        var client_id = params.client_id;
        var auth_server = myConfig.authentication.auth_server;
        myConfig.authentication["auth_base_url"] = url;
        myConfig.authentication["auth_url"] = url.concat("oauth/authorization").concat("?redirectUri=",redirect_uri_auth,"&responseType=code","&clientId=",client_id,"&scope=all");
        myConfig.authentication["logout_url"] = url.concat("logout").concat("?redirectUri=",redirect_uri_logout,"&clientId=",client_id);
        myConfig.authentication["profile_url"] = url.concat("profile").concat("?redirectUri=",redirect_uri_auth,"&clientId=",client_id);
        myConfig.authentication["registration_url"] = url.concat("registration").concat("?redirectUri=",redirect_uri_auth);
        myConfig.authentication["scopes"] = params.scopes.reduce(function(r,val){ console.log(r,val); return r.concat(val);},"");
        myConfig.authentication["token_url"] = myConfig.domain_signature.concat("tokens/",auth_server);
        if(myConfig.dev)console.log("setup auth params:",myConfig.authentication);
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
                console.log('debug rel ',map[rel[key].slug],rel[key].field,rel[key]);
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
            catsList[i]["color"] = colors[catsList[i].color_index % colors.length];
            for(j = 0; j < catsList[i].categories.length; j++){
                //                var cats = catsList[i].categories,
                //                    colorIndex = cats[j].category_index - 1,
                //                    index = cats[j].category_index,
                //                    icon = cats[j].icon_name,
                //                    color = colors[colorIndex % colors.length]; 
                var cats = catsList[i].categories,
                    colorIndex = catsList[i].color_index ? cats[j].category_index + catsList[i].color_index : cats[j].category_index,
                    index = cats[j].category_index,
                    icon = cats[j].icon_name,
                    color = colors[colorIndex % colors.length]; 
                catsList[i].categories[j].colorIndex = colorIndex;
                catsList[i].categories[j].index = index;
                catsList[i].categories[j].color = color;
                catsList[i].categories[j].icon = icon;
                //if(myConfig.dev)console.log("myConfig, setupColor: ", catsList[i].categories[j]);
            }
        }
        if(myConfig.dev)console.log("myConfig, setupColor: ", catsList);
        myConfig.types.categories = catsList;
        // impostazioni di dev
    }).config(
    function setupSearchApi(myConfig){
        if(myConfig.dev) console.log("setup search API", myConfig.navigator.search);
        if(!myConfig.navigator.search || !myConfig.navigator.search.params)
            return
            var params = myConfig.navigator.search.params;
        var url = myConfig.navigator.search.geocoding.concat('?');
        var url = Object.keys(params).reduce(function(url,key){ return url.concat(key,"=",params[key],"&")}, url);
        myConfig.navigator.search.url = url;
        console.log('check api url',params,Object.keys(params),url)
    }).config(
    function configDev($logProvider, myConfig){
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
        // abilito/disabilito i log di debug
        $logProvider.debugEnabled(myConfig.dev);

        if(myConfig.dev)console.log("Risultato myConfig ",myConfig);
    });
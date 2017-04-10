/**
 * Created by drpollo on 10/04/2017.
 */
angular.module('firstlife.services')
    .service('ThingsService',['$q','$log', '$filter' ,'AuthService','myConfig', 'ThingsFact', function ($q, $log,$filter, AuthService, myConfig, ThingsFact){

        var config = myConfig;
        var colors = config.design.colors;
        var types = config.types.keys;
        var defIcons = config.types.icons;

        return {
            get: function(id){
                var deferred = $q.defer();
                ThingsFact.get(id).then(
                    function (feature) {
                        var marker = makeMarker(feature);
                        $log.debug('get marker ',marker);
                        deferred.resolve(marker);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            },
            bbox: function(bounds){
                var deferred = $q.defer();
                if(!bounds.northEast.lat){
                    deferred.reject('no bounds');
                    return deferred.promise;
                }

                var params = {
                    from: filters.time.from,
                    to: filters.time.to
                };
                var bbox = {
                    ne_lat: bounds.northEast.lat,
                    ne_lng: bounds.northEast.lng,
                    sw_lng: bounds.southWest.lng,
                    sw_lat: bounds.southWest.lat
                };
                angular.extend(params,bbox);
                // $log.debug('bbox params',params);
                ThingsFact.bbox(params).then(
                    function (features) {
                        var markers = makeMarkers(features);
                        // aggiungo al buffer
                        buffer = angular.extend({},markers);
                        $log.log('bbox result',features.length);
                        deferred.resolve(markers);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );


                return deferred.promise;
            },
            setTimeFilters: function(time){
                filters.time = angular.extend({},time);
            },
            getTimeFilters: function(){
                if(angular.equals({}, filters.time)){
                    return false;
                }
                return filters.time;
            },
            setFilter: function (rule) {
                var index = filterConditions.map(function(e){return e.name}).indexOf(rule.name);
                if(index > -1){
                    filterConditions[index] = rule;
                }else{
                    filterConditions.push(rule);
                }
            },
            removeFilter: function (name) {
                var index = filterConditions.map(function(e){return e.name}).indexOf(name);
                if(index > -1 ){
                    filterConditions.splice(index,1);
                }
            },
            setQuery: function (q) {
                if(!q)
                    return query = null;

                return query = q;
            }
        };



        // var results = $filter('fullsearch')(buffer,q);


        /*
         * Private functions
         * 1) makeMarkers: conversion of geojson features in markers
         * 2) makeMarker: conversion of a single feature in a marker
         * 3) checkFilters: filters check
         */


        function makeMarkers(features) {
            var markers = features.reduce(function(markers,feature){
                // if needs to be filtered
                if(!check(feature))
                    return markers;

                var marker = makeMarker(feature);
                markers[marker.id] = marker;
                return markers;
            },{});
            return markers;
        }

        function makeMarker(feature) {
            var marker = {
                focus: false,
                draggable: false,
                interactive: true,
                popupOptions : {closeOnClick:true},
                layer:'pie'
            };
            angular.extend(marker, feature.properties);
            angular.extend(marker,{id: feature.properties.id, lat: parseFloat(feature.geometry.coordinates[1]), lng : parseFloat(feature.geometry.coordinates[0])});

            // set lista categorie
            var clist = marker.categories.reduce(function(cats,cat){
                cats = cats.concat(cat.categories.map(function(c){return c.id}));
                return cats;
            },[]);
            angular.extend(marker,{category_list: clist });

            // gestione icona di tipo
            var type = types[marker.entity_type];
            // icona di tipo
            var icon = angular.copy(defIcons[type.key]);
            angular.extend(marker, {icon:icon});
            // gestione icone di categoria
            var icons = {
                type : icon
            };
            var catIcons = marker.categories.reduce(function(icons, cat){
                var icon = defIcons[cat.category_space.id][cat.categories[0].id];
                icons[cat.category_space.id] = icon;
                return icons;
            },{});
            angular.extend(icons, catIcons);

            return marker;
        }



        /*
         * Manuale d'uso dei filtri
         * Una regola per ogni proprieta' da valutare
         * 1) key:              chiave della proprieta'
         * 2) values:           array dei valori da controllare
         * 3) mandatory:        condition:  true valutare la regola in AND con le altre
         *                                  false vauta la regola in OR
         *                      values:     true valuta i valori in AND tra loro
         *                                  false valuta i valori in OR
         * 4) equal:            true valuta il confronto di valori con il parametro con "=="
         *                      false valuta il confronto di valori con il parametro con "!="
         * 5) excludeRule:      true salta la regola
         *                      false valuta la regola
         * 6) excludeProperty:  true scarta se l'entita' ha un valore per quella proprieta'
         * 7) setMapMarkers:    imposta i filtri e i fix sui marker prima di inviarli alla mappa
         */
        function check(feature){
            var val = feature.properties;



            // set lista categorie per i filtri
            var clist = val.categories.reduce(function(cats,cat){
                cats = cats.concat(cat.categories.map(function(c){return c.id}));
                return cats;
            },[]);
            angular.extend(val,{category_list: clist });

            // filtro testuale
            if(query && JSON.stringify(val).toLowerCase().indexOf(query) < 0){
                return false;
            }


            // per ogni condizione
            var testCondition = false;

            for(key in filterConditions){
                // se non devo escludere la regola

                $log.debug("il tipo e' da includere? ", filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                // se esiste la include condition e il valore includeCondition:{value:cats.category_space,property:'category_space'}
                var indexCheck = 0;
                if(filterConditions[key].includeCondition){
                    var checkField = val[filterConditions[key].includeCondition.property];
                    var k = Object.keys(filterConditions[key].includeCondition.value)[0];
                    indexCheck = checkField.map(function(e){return e[k].id}).indexOf(filterConditions[key].includeCondition.value[k]);
                    $log.debug("check per includeCondition ", (indexCheck > -1));
                }


                $log.debug("il tipo e' da includere? ", filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                if(!filterConditions[key].excludeRule  && filterConditions[key].includeTypes.indexOf(val.entity_type) > -1 && indexCheck > -1){
                    // se devo escludere ogni valore possibile
                    if(filterConditions[key].excludeProperty){
                        var valore = (val[filterConditions[key].key]);
                        $log.debug("Check esclusione regola: ",filterConditions[key].excludeProperty,val,filterConditions[key].key,valore);
                        if(!valore
                            || valore === null ||
                            valore === 'undefined' ||
                            (Array.isArray(valore) && valore.length == 0 ) ||
                            (angular.isObject(valore) && angular.equals(valore,{})) ){
                            // non e' elegante ma faccio prima un check per vedere se il valore e' tra quelli considerabili nulli
                            $log.debug("property non impostata per: ",val, "prorpieta'",filterConditions[key].key);
                        }else{return false;}
                    }
                    // se ha delle alternative
                    var checkCondition  = filterConditions[key].mandatory.condition,
                        checkValues     = filterConditions[key].mandatory.values,
                        equal           = filterConditions[key].equal;
                    // controllo sulla condizione inizializza a true se le condizioni sono in AND, a false se sono in OR
                    var check           = checkValues;
                    // per ogni condizione
                    $log.debug("Condizione: ", filterConditions[key]);
                    for ( i = 0; i < filterConditions[key].values.length; i++ ){
                        $log.debug("valore i = ",i, " valore valutato ",val, " per chiave ",filterConditions[key].key);

                        if( comparison(val[filterConditions[key].key], filterConditions[key].values[i], equal) ){

                            // se il valore e' obbligatorio e la condizione e' obbligatoria esco
                            if(checkValues && checkCondition){
                                $log.debug("checkValues && checkCondition: true, esco ");
                                return false;
                            }
                            // se la condizione e' obbligatoria il check = false
                            if(checkValues){
                                $log.debug("checkValues: true, check = false ");
                                check = false;
                            }
                        }else{
                            $log.debug("val[key] == filterConditions[key].values[i]");
                            // se il valore e' rispettato e sono in OR allora check = true
                            if(!checkValues){
                                $log.debug("!checkValues, check = true");
                                check = true;
                            }
                        }
                    }
                    // se la condizione era obbligatoria e il test e' falso esco
                    if(checkCondition && !check)
                        return false;
                    // se il test e' positivo
                    if(check)
                        testCondition = true;
                }
            }
            $log.debug("Test entry: ",val ,  testCondition);
            return testCondition;


            // comparatore
            function comparison(a,b,equal){
                $log.debug("markerFilter, comparison, a, b, equal ",a,b,equal);
                if(Array.isArray(a)){
                    if(equal){
                        $log.debug(a,"==",b,"? ",(a == b));
                        return (a.indexOf(b) >= 0);
                    }
                    return (a.indexOf(b) < 0);
                }else{
                    if(equal){
                        $log.debug(a,"==",b,"? ",(a == b));
                        return a == b;
                    }
                    $log.debug(a,"!=",b,"? ",(a != b));
                    return a != b;
                }
            }
        }




    }]).run(function(ThingsService, myConfig){
    self.buffer = {};
    self.query = null;
    self.favCat = 0;
    self.filters = {
        time:{
            from: new Date().toISOString(),
            to: new Date().toISOString()
        }
    };
    self.filterConditions = [];
    var config = myConfig;

    initFilters();

    function initFilters(){


        // filtri tipo
        var types = config.types.list,
            check = 'key',
            filter_name = 'entity_type',
            typesList = [];
        // costruisco regola per gli entity_type
        var rule = {key:filter_name,name:filter_name,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:[]};
        // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
        self.filters[filter_name] = {list:types, toggle:1, iconSwitcher:true, label:'TYPES',check:check,name:filter_name, category_space:0,visible:true};
        for(var k = 0; k < filters[filter_name].list.length; k++){
            filters[filter_name].list[k].visible = true;
            rule.values.push(filters[filter_name].list[k].key);
            rule.includeTypes.push(filters[filter_name].list[k].key);
            typesList.push(filters[filter_name].list[k].key)
        }
        self.filterConditions.push(rule);

        // init category
        // bug da sistemare, infilo la categoria in catIndex in entityFactory, da tenere allineati!!!!

        var categories = config.types.categories;
        // filtri categorie
        // costruisco regola per le categorizzazione
        for(var i = 0; i< categories.length; i++){
            var cats = categories[i];
            if(cats.is_visible){
                // imposto la prima come category_space di default
                if(favCat == 0 && cats.is_visible){
                    favCat = cats.category_space;
                }

                // todo aggiungi slug
                var filter_name = cats.name;//'catIndex',
                var check = 'id';
                var rule = {key:'category_list',name:filter_name,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:cats.entities,includeCondition:{value:{category_space:cats.category_space},property:'categories'}};
                // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
                self.filters[filter_name] = {list: cats.categories, toggle:1, iconSwitcher:true, label:filter_name,check:check,name:filter_name,category_space:cats.category_space,visible:cats.is_visible, color:cats.color};
                // bug init i = 1
                for(var j = 0; j < filters[filter_name].list.length; j++){
                    self.filters[filter_name].list[j].visible = true;
                    self.filters[filter_name].list[j].key = self.filters[filter_name].list[j].id;
                    rule.values.push(self.filters[filter_name].list[j].id);
                }
                self.filterConditions.push(rule);
            }
        }
        console.log('filters',self.filters);
        console.log('filterConditions',self.filterConditions);
    }
});
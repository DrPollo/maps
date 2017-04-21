/**
 * Created by drpollo on 10/04/2017.
 */
angular.module('firstlife.services')
    .service('ThingsService',['$q','$log', '$filter','$timeout' ,'AuthService','myConfig', 'ThingsFact', function ($q, $log,$filter,$timeout, AuthService, myConfig, ThingsFact){

        var config = myConfig;
        var types = config.types.keys;
        var defIcons = config.types.icons;

        return {
            get: function(id){
                var deferred = $q.defer();
                ThingsFact.get(id).then(
                    function (feature) {
                        var marker = makeMarker(feature);
                        //$log.debug('get marker ',marker);
                        deferred.resolve(marker);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            },
            create: function (marker) {
                return ThingsFact.create(markerConverter(marker));
            },
            update: function (marker) {
                return ThingsFact.update(marker.id,markerConverter(marker));
            },
            remove: function (id) {
                return ThingsFact.remove(id);
            },
            report: function(report){
                return ThingsFact.report(report);
            },
            filter: function () {
                // $log.debug('cache?', Object.keys(cache).length);
                return makeMarkers(Object.keys(cache).reduce(function(features, key){
                  return features.concat(cache[key]);
              },[]));
            },
            filterBuffer: function () {
                // $log.debug('cache?', Object.keys(cache).length);
                return makeMarkers(buffer);
            },
            updateCache: function() {
                var deferred = $q.defer();
                var queries = {};
                var localCache = angular.copy(Object.keys(cache));
                // $log.debug('process tile in cache:',Object.keys(cache).length);
                localCache.map(function (key) {
                    var params = key.split(':');
                    var center = {x:params[0],y:params[1],z:params[2]};
                    // $log.log('updating ',center);
                    queries[key] = getTile(center);
                });
                $q.all(queries).then(
                    function (results) {
                        var markers = Object.keys(results).reduce(function(markers, key){
                            return angular.extend(markers,results[key]);
                        },{});
                        // $log.debug('got results from updateCache',markers);
                        deferred.resolve(markers);
                    }, function (err) {
                        $log.error('q.all error',err);
                        deferred.reject(err);
                    });

                return deferred.promise;
            },
            flush: function() {
                var deferred = $q.defer();
                var queries = {};
                var localCache = angular.copy(Object.keys(cache));

                $timeout(nextTile(0, localCache, {}, deferred), 1);

                return deferred.promise;


                function nextTile(index, tiles, total, deferred){
                    if(index >= tiles.length){
                        return deferred.resolve(total);
                    }
                    var tile = tiles[index].split(':');
                    var center = {x:tile[0],y:tile[1],z:tile[2],};
                    getTile(center).then(
                        function (markers) {
                            angular.extend(total,markers);
                            nextTile(index+1,tiles,total,deferred);
                        },
                        function (err) {
                            nextTile(index+1,tiles,total,deferred);
                        }
                    );
                }
            },
            flushTiles: function() {
                var deferred = $q.defer();
                var tiles = angular.copy(Object.keys(cache));
                var params = {tiles: tiles, time: filters.time};
                // $log.debug('fushTiles',params);
                ThingsFact.tiles(params).then(
                  function (results) {
                      deferred.resolve(makeMarkers(results));
                      buffer = results;
                  },function (err) {
                      $log.error(err);
                      deferred.reject(err);
                  }
                );

                return deferred.promise;
            },
            resetCache : function () {
                buffer = [];
                cache = {};
                return true;
            },
            removeTile: function(params){
                // $log.debug('cache',Object.keys(cache).length -1);
                // rimuovo la tile
                delete cache[params.x+':'+params.y+':'+params.z];
                return true;
            },
            addTile: function(params){
                // rimuovo la tile
                if(!cache[params.x+':'+params.y+':'+params.z])
                    cache[params.x+':'+params.y+':'+params.z] = [];
                return true;
            },
            getTile: function (tile) {
                return getTile(tile);
            },
            setTimeFilters: function(time){
                // $log.debug('set time',time);
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
            toggleFilter: function (cat, key) {
                var index = filterConditions.map(function(e){return e.name}).indexOf(cat);
                //$log.debug("Indice regola filtro: ",index,cat,key);
                // se non c'e' lo creo
                if(index < 0){
                    // default tutti i valori
                    filterConditions[index] = {};
                    filterConditions[index].values = [null];
                    filterConditions[index].mandatory = {condition:true,values:false};
                    filterConditions[index].equal = false;
                    filterConditions[index].excludeRule = false;
                    filterConditions[index].excludeProperty = false;
                    //$log.debug("Init della regola: ",filterConditions[index]);
                }
                //$log.debug("Chiave? ",key);
                /* toggle a tre stati
                 * 1) excludeRule = false e excludeProperty = false  // filtro attivo
                 * 2) excludeRule = true e excludeProperty = false // tutto visibile
                 * 3) excludeRule = false e excludeProperty = true  // nulla visibile
                 */
                if(!key && key !== 0){
                    //$log.debug("Niente chiave, faccio toggle");
                    // se in stato 1) vado in 2)
                    if(!filterConditions[index].excludeRule && !filterConditions[index].excludeProperty){
                        //$log.debug("Stato 1 vado in 2");
                        filterConditions[index].excludeRule = true;
                        filterConditions[index].excludeProperty = false;
                        filters[cat].toggle = 2;
                    }
                    // se in stato 2) vado in 3)
                    else if(filterConditions[index].excludeRule && !filterConditions[index].excludeProperty){
                        //$log.debug("Stato 2 vado in 3");
                        filterConditions[index].excludeRule = false;
                        filterConditions[index].excludeProperty = true;
                        filters[cat].toggle = 3;
                    }
                    // se in stato 3) vado in 1)
                    else if(!filterConditions[index].excludeRule && filterConditions[index].excludeProperty){
                        //$log.debug("Stato 3 vado in 1");
                        filterConditions[index].excludeRule = false;
                        filterConditions[index].excludeProperty = false;
                        filters[cat].toggle = 1;
                    }
                } else {
                    // se la chiave e' impostata aggiungo/rimuovo la chiave
                    var i = filterConditions[index].values.indexOf(key);
                    //$log.debug("Aggiungo/rimuovo chiave: ",key, " a ", filterConditions[index].values, " indice: ",i);
                    //$log.debug("Intervengo qui: ",filters[cat].list);
                    var j = filters[cat].list.map(function(e){return e.key}).indexOf(key);
                    if(i < 0) {
                        filterConditions[index].values.push(key);
                        filters[cat].list[j].visible = true;
                        if(filterConditions[index].callbackPush){
                            filterConditions[index].callbackPush(key);
                        }
                    } else {
                        filterConditions[index].values.splice(i,1);
                        filters[cat].list[j].visible = false;
                        if(filterConditions[index].callbackPop){
                            filterConditions[index].callbackPop(key);
                        }
                    }
                    //vado in stato 1)
                    filterConditions[index].excludeRule = false;
                    filterConditions[index].excludeRule = false;
                    filters[cat].toggle = 1;
                    //$log.debug("Aggiunta o rimossa chiave: ",filterConditions[index].values," vado in stato 1");
                }
            },
            getChildren: function (id,relation) {
                var deferred = $q.defer();
                ThingsFact.children(id,relation).then(
                    function (features) {
                        var markers = makeMarkers(features);
                        //$log.debug('children result',features.length);
                        deferred.resolve(markers);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            },
            getFilter: function (key) {
                if(key)
                    return filters[key] ? filters[key] : null;
                return filters;
            },
            getRules : function () {
                return filterConditions;
            },
            setQuery: function (q) {
                // $log.debug('set filter',q);
                if(!q)
                    return query = null;

                return query = q;
            },
            setIcon: function(id){
                if(!id)
                    return favCat;

                favCat = (favCat === id) ?  0 : id;
                return favCat;
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
                        // aggiungo alla cache
                        cache = angular.extend([],features);
                        var markers = makeMarkers(features);
                        //$log.debug('bbox result',features.length);
                        deferred.resolve(markers);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            }
        };


        /*
         * Private functions
         * 1) makeMarkers: conversion of geojson features in markers
         * 2) makeMarker: conversion of a single feature in a marker
         * 3) checkFilters: filters check
         */

        function getTile(tile) {
            var deferred = $q.defer();
            if(!tile.z || !tile.y, !tile.x){
                deferred.reject('no tile param');
                return deferred.promise;
            }
            // se tile non in lista scarto
            if(!cache[tile.x+':'+tile.y+':'+tile.z]){
                deferred.reject('no needed');
                return deferred.promise;
            }


            var params = {
                from: filters.time.from,
                to: filters.time.to
            };
            angular.extend(params,tile);

            ThingsFact.tile(params).then(
                function (features) {
                    // $log.debug(features);
                    // aggiungo alla cache
                    // $log.log(params.z+':'+params.x+':'+params.y, features);
                    cache[params.x+':'+params.y+':'+params.z] = features;
                    var markers = makeMarkers(features);
                    //$log.debug('tile result',features.length);
                    deferred.resolve(markers);
                },
                function (error) {
                    // $log.error(error);
                    deferred.resolve({});
                }
            );

            return deferred.promise;
        }
        function makeMarkers(features) {

            var markers = features.reduce(function(markers,feature){
                // if needs to be filtered
                // $log.debug(feature);
                var ok = check(feature);
                // $log.debug('check',feature.properties.entity_type,ok);
                if(!ok)
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
                cats = cats.concat(cat.categories.map(function(c){
                    return c.id
                }));
                return cats;
            },[]);
            angular.extend(marker,{category_list: clist });

            // gestione icona di tipo
            var type = types[marker.entity_type];
            // icona di tipo
            var icon = angular.copy(defIcons[type.key]);
            // gestione icone di categoria
            var icons = {
                0 : icon
            };
            var catIcons = marker.categories.reduce(function(icons, cat){
                var icon = defIcons[cat.category_space.id][cat.categories[0].id];
                icons[cat.category_space.id] = icon;
                return icons;
            },{});
            angular.extend(icons, catIcons);
            angular.extend(marker,{icons:icons});
            // icona di default
            angular.extend(marker, {icon:icons[favCat] ? icons[favCat] : icons[0]});
            // nome tipo
            angular.extend(marker,{type_name: $filter('translate')(marker.entity_type)});
            // se id non presente
            if(!marker.id)
                marker.id = feature._id;


            return marker;
        }


        function markerConverter(marker){
            var templatePlace = '{"type":"Feature", "properties":{}, "geometry": {}}';
            var feature = angular.fromJson(templatePlace);
            for(var i in marker){
                feature.properties[i] = marker[i];
            }
            if(marker.coordinates){
                feature.geometry = {"type": "Point", "coordinates":marker.coordinates};
            }else if(marker.coordinates){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(marker.coordinates[0]),parseFloat(marker.coordinates[1])]};
            }else if(marker.lat){
                feature.geometry = {"type": "Point", "coordinates":[parseFloat(marker.lng),parseFloat(marker.lat)]};
            }

            return feature;
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
            // $log.debug('check full search ',query,JSON.stringify(val).toLowerCase().search(query));

            if(query && JSON.stringify(val).toLowerCase().search(query) < 0){
                return false;
            }


            // per ogni condizione
            var testCondition = false;

            for(key in filterConditions){
                // se non devo escludere la regola

                // $log.debug("il tipo e' da includere? ", filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                // se esiste la include condition e il valore includeCondition:{value:cats.category_space,property:'category_space'}
                var indexCheck = 0;
                if(filterConditions[key].includeCondition){
                    var checkField = val[filterConditions[key].includeCondition.property];
                    var k = Object.keys(filterConditions[key].includeCondition.value)[0];
                    indexCheck = checkField.map(function(e){return e[k].id}).indexOf(filterConditions[key].includeCondition.value[k]);
                    //$log.debug("check per includeCondition ", (indexCheck > -1));
                }


                // $log.debug("il tipo e' da includere? ", filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                if(!filterConditions[key].excludeRule  && filterConditions[key].includeTypes.indexOf(val.entity_type) > -1 && indexCheck > -1){
                    // se devo escludere ogni valore possibile
                    if(filterConditions[key].excludeProperty){
                        var valore = (val[filterConditions[key].key]);
                        //$log.debug("Check esclusione regola: ",filterConditions[key].excludeProperty,val,filterConditions[key].key,valore);
                        if(!valore
                            || valore === null ||
                            valore === 'undefined' ||
                            (Array.isArray(valore) && valore.length == 0 ) ||
                            (angular.isObject(valore) && angular.equals(valore,{})) ){
                            // non e' elegante ma faccio prima un check per vedere se il valore e' tra quelli considerabili nulli
                            //$log.debug("property non impostata per: ",val, "prorpieta'",filterConditions[key].key);
                        }else{return false;}
                    }
                    // se ha delle alternative
                    var checkCondition  = filterConditions[key].mandatory.condition,
                        checkValues     = filterConditions[key].mandatory.values,
                        equal           = filterConditions[key].equal;
                    // controllo sulla condizione inizializza a true se le condizioni sono in AND, a false se sono in OR
                    var check           = checkValues;
                    // per ogni condizione
                    // $log.debug("Condizione: ", filterConditions[key]);
                    for ( i = 0; i < filterConditions[key].values.length; i++ ){
                        //$log.debug("valore i = ",i, " valore valutato ",val, " per chiave ",filterConditions[key].key);

                        if( comparison(val[filterConditions[key].key], filterConditions[key].values[i], equal) ){

                            // se il valore e' obbligatorio e la condizione e' obbligatoria esco
                            if(checkValues && checkCondition){
                                //$log.debug("checkValues && checkCondition: true, esco ");
                                return false;
                            }
                            // se la condizione e' obbligatoria il check = false
                            if(checkValues){
                                //$log.debug("checkValues: true, check = false ");
                                check = false;
                            }
                        }else{
                            // $log.debug("val[key] == filterConditions[key].values[i]");
                            // se il valore e' rispettato e sono in OR allora check = true
                            if(!checkValues){
                                //$log.debug("!checkValues, check = true");
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
            // $log.debug("Test entry: ",val ,  testCondition);
            return testCondition;


            // comparatore
            function comparison(a,b,equal){
                //$log.debug("markerFilter, comparison, a, b, equal ",a,b,equal);
                if(Array.isArray(a)){
                    if(equal){
                        //$log.debug(a,"==",b,"? ",(a == b));
                        return (a.indexOf(b) >= 0);
                    }
                    return (a.indexOf(b) < 0);
                }else{
                    if(equal){
                        //$log.debug(a,"==",b,"? ",(a == b));
                        return a == b;
                    }
                    //$log.debug(a,"!=",b,"? ",(a != b));
                    return a != b;
                }
            }
        }




    }]).run(function(ThingsService, myConfig){
    self.cache = {};
    self.buffer = [];
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
                // if(favCat == 0 && cats.is_visible){
                //     favCat = cats.category_space;
                // }

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
        //console.log('filters',self.filters);
        //console.log('filterConditions',self.filterConditions);
    }
});
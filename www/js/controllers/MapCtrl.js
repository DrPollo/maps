angular.module('firstlife.controllers')
    .controller('MapCtrl', ['$scope', '$state', '$ionicModal', '$ionicActionSheet', '$ionicPopup', '$cordovaGeolocation', '$ionicLoading', '$rootScope', '$location', '$filter', '$timeout', '$log', 'ThingsService', 'myConfig', 'AuthService', 'leafletData', function($scope, $state, $ionicModal, $ionicActionSheet, $ionicPopup, $cordovaGeolocation, $ionicLoading, $rootScope, $location, $filter, $timeout, $log, ThingsService, myConfig, AuthService, leafletData) {



        var consoleCheck = false;
        var mapName = 'myMap';

        var levels = {check:false};
        if (myConfig.map.area.levels){
            levels = {check:true};
            levels.list = $scope.config.map.area.levels;
        }

        // configurazione dell'applicazione
        if(!$scope.config) $scope.config = myConfig;
        var config = myConfig;


        //$log.debug('init myMap?',!$scope.flmap);
        if(!$scope.flmap){
            angular.extend($scope,{flmap : map});
            angular.extend($scope.flmap,{loaded:true});
            //$log.debug('myMap',$scope.flmap);
        }

        // check geometrie
        var checkGeometries = config.map.geometry_layer;

        // visualizzazione web o mobile?
        if(!$scope.isMobile) $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        // funzione di locate usata anche nelle modal
        if(!$scope.locate) $scope.locate = locate;

        //if(!$scope.changeVisibility) $scope.changeVisibility = MapService.changeVisibility;


        // default utente per le azioni con il log
        $scope.isLoggedIn = AuthService.isAuth();

        // ascolto del cambio dei parametri search
        // se li cambio io setto false per bypassare i controlli
        if(self.watchSearchEnabled === 'undefined') self.watchSearchEnabled = true;




        // Leaflet Map: inizializzazioni
        // se mobile disattivo i controlli di zoom
        var controlZoom = true;
        if ( ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone() ) {
            //if(consoleCheck) console.log("mobile");
            controlZoom = false;
        }





        if(!$scope.categories) $scope.categories = $scope.config.types.categories;
        //definizione dei listner su mappa
        $scope.options1 = null;
        $scope.details1 = '';

        $scope.editMode = false;


        var moveendSetTimeout;
        var MOVEEND_DELAY = config.behaviour.moveend_delay;
        var RELOAD_TIME = config.behaviour.bbox_reload_time;



        // cambio di stato, ingresso in app.maps
        // controllore del comportamento della mappa
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            $log.debug("sono in app.map e vengo per lo stato",toState);

            if(event.preventMapsEvent)
                return;
            event.preventMapsEvent = true;

            // se non devo gestire questo evento
            if(toState.name != 'app.maps')
                return;


            // controllo i parametri in arrivo
            var params = $location.search();

            // controlla il parametro embed per il visualizzatore
            check4embed(params);
            // controllo il filtro per gruppo
            check4group(params);
            // controllo il filtro per utente
            check4user(params);
            // check initiative
            check4Initiative(params);


            $scope.isLoggedIn = AuthService.isAuth();


            // valuto lo stato da dove arrivo e decido cosa fare
            switch($rootScope.previousState){
                //$log.debug("MapCtrl, cambio stato da intro: ",params);
                case 'app.editor':
                    // se vengo dalla creazione/modifica di posti
                    if(params.entity){
                        backFromEditor(params.entity);
                    }

                    break;

                default:
                    // 1) diretto per il viewer
                    $log.debug("MapCtrl, gestione stato, default",params);
                    // posiziono la mappa se ci solo le coordinate,
                    // altrimenti si lascia il centro della mappa

                    // if(params)
                    //     check4customFilters(params,{});
            }

        });



        /*
         * Listners
         * 1) click su marker
         * 2) movimento della mappa
         * 3) apertura della modal: aggiunge l'entita' nel parametro search
         * 4) chiusura della modal: rimuove l'entita' nel parametro search
         * 5) cambio dei parametri search
         * 6) al cambio dei marker ricalcolo il filtro
         * 7) controlla il cambio delle regole dei filtri e li riapplica
         * 8) controlla che i marker filtrati siano cambiati e aggiunge/rimuove i marker in base alle relazioni
         * 9) controlla l'avvio del'edit di una entita'
         * 10) fine editing delle simple entities
         */


        function changeLocation(params) {
            var hash = params.lat+':'+params.lng;
            if(params.zoom){
                hash = hash.concat(':',params.zoom);
            }else{
                var c = $location.search().c;
                var z = c.split(':')[2];
                hash = hash.concat(':',z);
            }
            // $log.debug('change location',hash);
            $location.search({ c: hash });
        }
        //
        //
        // //listner apertura e chiusura della modal del place
        // $scope.$on('openPlaceModal', function(event, args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        //         // aggiorno il parametro place dalla search
        //         updatePlaceInSearch(args.marker);
        //
        // });
        // $scope.$on('closePlaceModal', function(event, args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        //         // rimuovo il parametro place dalla search
        //         deleteInSearch('entity');
        //
        // });
        //
        //
        // $scope.$on("startEditing",function(event,args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        //         $scope.updateEntity = args;
        //         // se il luogo non e' bounded ad una posizione
        //         if (!args.skip) {
        //             // centro la mappa sul luogo dei parametri
        //             locate(args);
        //             // entro in edit mode
        //             changeMode('edit');
        //         } else {
        //             // se devo saltare il riposizionamento
        //             $scope.showASEdit();
        //         }
        //
        // });
        //
        // $scope.$on("endEditing",function(event,args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        //     // chiamo la funzione che gestisce l'editing
        //     backFromEditor(args.marker.id);
        //     // click del markers
        //     //clickMarker(args.id);
        // });
        //
        // $scope.$on("deleteMarker",function(event,args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        // });
        // $scope.$on("lostMarker",function(event,args){
        //     if(event.defaultPrevented)
        //         return ;
        //
        //     event.preventDefault();
        //     // cancello un marker
        //     deleteMarker(args.id);
        // });
        //
        $scope.$on("timeUpdate",function(event,args){
            // $log.debug('timeUpdate');
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // al cambio filtro temporale ricalcolo i dati
            updateMarkers();
        });

        $scope.$on("updateQ",function(event,args){
            // $log.debug('updateQ');
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // al cambio filtro testuale
            filterMarkers();
        });





        /*
         * Funzioni pubbliche
         * 1) isString, filtro
         * 2) greaterThan, filtro
         * 3) differentThan, filtro
         * 4) switchEditMode: cambio tra modalita' visualizzazione e edit
         * 6) showModalFavPlace: mostra le aree d'interesse
         * 7) showMFilterCat: mostra i filtri categorie
         * 8) showASEdit: mostra la scelta di tipo di entita' al click del pin in edit mode
         * 9) toggleFilter: aggiunge/toglie una categoria dai filtri
         * 10) chageFavCat: cambio la categoria usata per le icone della mappa
         * 11) showWall: mostra il wall
         * 12: showSearchBox: mostra la ricerca
         * 13) changeVisibility: cambia l'edit/view mode della mappa e spegne/accende gli overlays
         */

        // da spostare nelle direttive
        $scope.isString = function(x){
            if( typeof x === "string")
                return true;
            return false;
        }
        // filtro maggiore di per la modal del place
        $scope.greaterThan = function(prop, val){
            return function(item){
                return item[prop] > val;
            }
        };
        // filtro "diverso da" di per la modal del place
        $scope.differentThan = function(prop, val){
            return function(item){
                return item[prop] != val;
            }
        };

        $scope.switchEditMode = AuthService.doAction(function(){
            if($scope.editMode){
                changeMode('view');
                $scope.updateEntity = null;
            }else{
                changeMode('edit');
            }
        });


        $scope.showWall = function(){
            $scope.$broadcast('showWall');
        }

        //Modal filtro categorie
        $scope.showMFilterCat = function() {
            $scope.filterCat = {};

            $ionicModal.fromTemplateUrl('templates/modals/filterCat.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.filterCat.modal = modal;
                $scope.openFilterCat();
                // rendo visibile la modal nella root per il routing dell'app
                $rootScope.modal = modal;
                $rootScope.modalStatus = true;
            });

            $scope.openFilterCat = function() {
                $scope.filterCat.modal.show();
            };

            $scope.closeFilterCat = function() {
                if($scope.filterCat.modal)
                    $scope.filterCat.modal.remove();
            };
            $scope.$on('modal.hidden', function() {
                delete $scope.filterCat.modal;
            });

            $scope.$on('$destroy', function() {
                $scope.filterCat.modal.remove();
            });
        };


        //creazione di una thing
        $scope.showASEdit = function(){
            // se devo aggionare una entita'
            if($scope.updateEntity && $scope.updateEntity.id){
                // back to view
                changeMode('view');

                // parametri per l'editor
                var params = {lat: $scope.flmap.center.lat, lng:$scope.flmap.center.lng,zoom_level:$scope.flmap.center.zoom,id:$scope.updateEntity.id,};
                $state.go('app.editor', params);

            }if($scope.updateEntity){
                // back to view
                changeMode('view');

                // se ho gia' dei parametri per la insert
                var params = {};
                for(var k in $scope.updateEntity){
                    params[k] = $scope.updateEntity[k];
                }
                // sovrascrivo lat e lng del parent
                params.lat = $scope.flmap.center.lat;
                params.lng = $scope.flmap.center.lng;
                params.zoom_level = $scope.flmap.center.zoom;

                $state.go('app.editor', params);
            }else{
                // back to view
                changeMode('view');
                // se non devo aggiornare nessuna entita'
                // e non ho paramentri gia' stabiliti
                clickToAdd();
            }
        }



        /*
         * Attiva/Disattiva filtri di categorie 
         */
        $scope.toggleFilter = function(cat, key){
            //$log.debug('toggleFilter',cat,key)
            // cerco l'indice della regola per le categorie
            ThingsService.toggleFilter(cat, key);
            // aggiorno i marker
            filterMarkers();
        };

        // cambio il category space utilizzato per le icone
        $scope.changeFavCat = function (id){
            var icon = ThingsService.setIcon(id);
            $scope.closeFilterCat();
            // aggiorno i marker
            filterMarkers();
            return icon;
        };




        // mostra il wall con il contenuto della mappa
        $scope.showSearchBox = function(){
            //$log.debug("MapCtrl, showSearchBox!");
            //$log.debug("check area: ",$scope.area);

            $ionicModal.fromTemplateUrl('templates/modals/search.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.searchBox = modal;
                $scope.searchBox.show();
            });

            $scope.closeSearchBox = function() {
                $scope.searchBox.hide();
                if($scope.searchBox) $scope.searchBox.remove();
            };
            $scope.$on('modal.hidden', function() {
                delete $scope.searchBox;
            });
            $scope.$on('$destroy', function() {
                $scope.searchBox.remove();
            });

            $scope.clickSearchItem = function(marker){
                $scope.closeSearchBox();
                clickMarker(marker.id);
                locate(marker.id);
            }
        }





        /* 
         * funzioni private di gestione dei parametri search
         * 1) clickMarker: propago evento e lo richiedo se ancora non caricato
         * 2) updatePositionInSearch: aggiorno i parametri search della mappa sulla posizione e zoom
         * 3) updatePlaceInSearch: aggiorno il parametro place nella search
         * 4) updateSearch: aggiungo un parametro alla search
         * 5) locate: cambia il centro della mappa o fa il bound
         * 6) showAlert: apre un popup allert dato un testo come parametro
         * 7) backFromEditor: apre l'action sheet con i messaggi per il ritorno dall'editor
         * 8) showASEdit: apre l'action sheet per la scelta dell'entita' da creare, click sul pin in edit mode
         * 9) updateMarkerDitributed: chiama l'update dei marker in mapService e aggiorna i marker sulla mappa
         * 10) initFilters: inizializzazione dei filtri per tipo e categoria
         * 11) showLoadingScreen: apre il loader di ionic
         * 12) hideLoadingScreen: chiude il loader di ionic
         */

        function clickMarker(markerId){
            //$log.debug("markerClick! ",markerId);
            $scope.$broadcast("markerClick", {markerId:markerId});
        }

        function updatePlaceInSearch(id){
            // aggiorno i parametri della mappa
            updateSearch({'entity':id});
        }
        function updateSearch(params){
            for(key in params){
                // cambiamento gia' gestito
                self.watchSearchEnabled = false;
                $location.search(key,params[key]);
                //self.watchSearchEnabled = true;
            }
            //$log.debug("nuovi parametri search: ", $location.search(), params);
        }

        function deleteInSearch(key){
            // cambiamento gia' gestito, listner 
            self.watchSearchEnabled = false;
            $location.search(key,null);
            self.watchSearchEnabled = true;
        }


        // centra la mappa
        // accetta paramentri per la locate: center, marker, coords
        function locate(params){
            // $log.debug("centro su luogo: ",params);
            if(params.entity){
                // ho una entita'
                locateEntity(params.entity);
            }else if(params.id){
                // ho una entita'
                locateEntity(params.id);
            }else if(params.lat && params.lng){
                // posiziono la mappa
                changeLocation(params);
            }
        };


        // An alert dialog
        function showAlert (content) {
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                //$log.debug('Allert con contenuto: ',content);
            });
        };

        // action sheet di ritorno dall'editor
        function backFromEditor(entityId){
            //$log.debug("MapCtrl, backFromEditor, entityId: ", entityId);
            var content={};
            if(entityId == -1){
                content.title = $filter('translate')('ERROR');
                content.text = $filter('translate')('UNKNOWN_ERROR');


                var hideSheet = $ionicActionSheet.show({
                    titleText: content.text,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        //$log.debug('CANCELLED');
                    }
                });
                // $log.debug("actionSheet", hideSheet);
                // serve per il routing, chiudo l'action sheet con il pulsante back
                $rootScope.actionSheet = hideSheet;
                $rootScope.actionStatus = true;
            }if(entityId == -2){
                content.title = $filter('translate')('ERROR');
                content.text = $filter('translate')('ERROR_LOGIN');


                var hideSheet = $ionicActionSheet.show({
                    titleText: content.text,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        //$log.debug('CANCELLED');
                    }
                });
                //$log.debug("actionSheet", hideSheet);
                // serve per il routing, chiudo l'action sheet con il pulsante back
                $rootScope.actionSheet = hideSheet;
                $rootScope.actionStatus = true;
            }else if(entityId){
                clickMarker(entityId);
            }
        };



        function filterMarkers() {
            $scope.$broadcast('filterMarkers');
        }

        function updateMarkers() {
            $scope.$broadcast('updateMarkers');
        }


        // passa il centro della mappa all'editor
        function clickToAdd(){
            $timeout(function(){
                var center = $scope.flmap.center;
                $state.go('app.editor', {lat: center.lat, lng:center.lng, zoom_level: center.zoom, id:null});
            },50);
        }



        // cambio visibilita' mappa
        // gestore livelli mappa
        // si comanda dal fitro categorie
        function changeVisibility(clickedItem){
            //changeMod to Edit: tutti off per la edit
            if(clickedItem===false){
                for(var el in $scope.flmap.layers.overlays){
                    //$log.debug("spengo livello ",el);
                    $scope.flmap.layers.overlays[el].visible = false;
                }
            }
            //changeMod to View: tutti on per la view
            else if(clickedItem===true){
                for(var el1 in $scope.flmap.layers.overlays){
                    $scope.flmap.layers.overlays[el1].visible = true;
                }
            }
            //filtro all: attiva tutti i layer categorie (ed anche all!)
            else if(clickedItem===0 && !$scope.flmap.layers.overlays[0].visible){
                for(var el2 in self.map.layers.overlays){
                    $scope.flmap.layers.overlays[el2].visible = true;
                }
            }
            //filtro all: disattiva tutti i layer categorie
            else if(clickedItem===0 && $scope.flmap.layers.overlays[0].visible){
                for(var el3 in self.map.layers.overlays){
                    $scope.flmap.layers.overlays[el3].visible = false;
                }
            }
            else if($scope.flmap.layers.overlays[clickedItem].visible){
                $scope.flmap.layers.overlays[clickedItem].visible = false;
            }
            else {
                $scope.flmap.layers.overlays[clickedItem].visible = true;
            }
        };


        // funzione di cambio di modalita' della mappa
        function changeMode(mode){
            switch(mode){
                case 'edit':
                    $scope.editMode = true;
                    changeVisibility(false);
                    $scope.flmap.layers.baselayers.edit.visible = true;
                    $scope.flmap.layers.baselayers.view.visible = false;
                    break;
                default:
                    $scope.editMode = false;
                    changeVisibility(true);
                    $scope.flmap.layers.baselayers.view.visible = true;
                    $scope.flmap.layers.baselayers.edit.visible = false;
            }
        }


        // centra su entita'
        function locateEntity(entityId){
            // $log.debug('locate entity',entityId);
            var marker = $scope.flmap.markers[entityId];
            // se il marker esiste
            if(marker){
                var center = {lat:marker.lat,lng:marker.lng};
                if(marker.zoom_level)
                    center.zoom = marker.zoom_level;
                // $log.debug('locate entity cached',center);
                changeLocation(center);
            }else{
                //altrimenti invoco una get
                ThingsService.get(entityId).then(
                    function(marker){
                        var center = {lat:marker.lat,lng:marker.lng};
                        if(marker.zoom_level)
                            center.zoom = marker.zoom_level;
                        // $log.debug('remote entity',center);
                        changeLocation(center);
                    },
                    function(err){$log.error("Location error: ",err);}
                );
            }
        }

        // toggle dei parametri search custom
        function check4customFilters(e,old){
            var filters = config.map.filters;
            for(var i = 0 ; i < filters.length; i ++){
                var param = filters[i].search_param;
                var filter = filters[i];
                if(!filter.skip){
                    if(e[param]){//trovato un parametro
                        // filtro per per la property
                        var rule = {key:filter.property,name:filter.key,values:[e[param]],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:config.types.list.map(function(e){return e.key;})};
                        // imposto il filtro nel service
                        ThingsService.setFilter(rule);
                    }else{
                        // rimuovo filtro per la property
                        ThingsService.removeFilter(filter.key);
                    }
                }
            }
        }


        // controllo parametro embed per setup del viewer
        function check4embed(e){
            // se il parametro e' settato
            if(e.embed){
                //$log.debug('modalita embed',e.embed);
                switch(e.embed){
                    // visualizzatore vuoto per mappa embed
                    case 'viewer':
                        // togli pulsantiera e timeline
                        $scope.viewer = true;
                        break;
                    default:
                        break;
                }
            }else{
                $scope.viewer = false;
            }
        }

        // controllo i parametri di posizione
        // todo implementa soluzione possibilmente filtro
        function check4Initiative(e, old){
            // se ho settati i parametri di posizione
            if(old && old.initiative && old.initiative !== e.initiative || e.initiative){
                //$log.debug('cambio parametro iniziativa',e.initiative);
                // avviso del cambio di parametro
                $scope.$broadcast('newInitiativeSearch',{id: e.initiative ? e.initiative : null});
            }
        }

        // groupCard
        function check4group(e){
            if(!e || !e.groups){
                return false;
            }
            ThingsService.get(e.groups).then(
                function(results){
                    //$log.debug('get group',results)
                    if(results.name){
                        $scope.groupCard = results.name;
                    } else {
                        $scope.groupCard = null;
                        $location.search('groups',null);
                    }
                },
                function(err){
                    $scope.groupCard = null;
                    $location.search('groups',null);
                }
            );
        }
        $scope.deleteGroupCard = function(){
            $scope.groupCard = null;
            $location.search('groups',null);
        }

        // userCard
        function check4user(e){
            if(!e || !e.users){

                return false;
            }
            $scope.userCard = AuthService.getUser().username;
        }
        $scope.deleteUserCard = function(){
            $scope.userCard = null;
            $location.search('users',null);
        };

        // initiative card
        $scope.deleteInitiativeCard = function () {
            $scope.initiativeCard = null;
            $location.search('initiative',null);
        };

    }]).run(function( myConfig, $timeout, $log){

    self.map = {
        loaded:false,
        layers: {
            baselayers: {
                view: {
                    name: 'view',
                    type: 'xyz',
                    visible: true,
                    url: config.map.tile_view,
                    layerOptions: {
                        attribution: config.map.tile_view_attribution
                    }
                },
                edit: {
                    name: 'edit',
                    type: 'xyz',
                    visible: false,
                    url: config.map.tile_edit,
                    layerOptions: {
                        attribution: config.map.tile_edit_attribution
                    }
                }
            },
            overlays: {
                pie: {
                    id: 1,
                    name: 'Categoria',
                    type: "markercluster",
                    visible: true,
                    layerOptions: {
                        chunkedLoading: true,
                        showCoverageOnHover: false,
                        spiderfyDistanceMultiplier: 2,
                        maxClusterRadius: 60,
                        disableClusteringAtZoom: self.config.map.cluster_limit ? self.config.map.cluster_limit : 22,
                        chunkDelay: 500,
                        chunkInterval: 200,
                        iconCreateFunction: bakeThePie,
                        zoomToBoundsOnClick: true,
                        removeOutsideVisibleBounds: true,
                        singleMarkerMode: false,
                        animate: false
                    }
                }
            }
        },
        center: {
            lat: config.map.map_default_lat,
            lng: config.map.map_default_lng,
            zoom: config.map.zoom_level
        },
        bounds:{
            southWest:{

            },
            northEast:{}
        },
        defaults: {
            maxZoom: config.map.max_zoom,
            minZoom: config.map.min_zoom,
            zoomControl: (config.map.zoom),
            zoomControlPosition: config.map.zoom_position,
            attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        markers: {},
        watch:{
            doWatch:false,
            isDeep: false
        },
        controls: {
            zoomControl: (config.map.zoom),
            zoomControlPosition: config.map.zoom_position,
            attributionControl: config.map.attribution,
            attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        events: {
            map: {
                enable: ['load','moveend','movestart'],
                logic: 'emit'
            },
            marker: {
                enable: [],
                // enable: ['click'],
                logic: 'emit'
            }
        },
        //maxBounds: config.map.bounds,
        editMode: false,
        // controlli degli action button della mappa
        locate: config.actions.geolocation,
        search: config.actions.search,
        edit_action: config.actions.edit_mode,
        favourite_place: config.actions.favourite_place,
        category_filter: config.actions.category_filter,
        name: config.app_name,
        css: config.design.css
    };


    // calculate marker cluster icons
    function bakeThePie(cluster) {
        var markers = cluster.getAllChildMarkers();
        var granularity = 5;
        var total = cluster.getChildCount();
        //if(consoleCheck) console.log("totale: ",total);
        var sum = 0,
            html = '';

        var sets = markers.reduce(function (sets,marker) {
            var icon = marker.options.icon.options;
            // init cluster
            if(!sets[icon.index])
                sets[icon.index] = {index:icon.index, color:icon.color,count:0};
            // aggiorno contatore
            sets[icon.index].count++;
            return sets;
        },{});

        angular.forEach(sets,function(set,key){
            var value = Math.round(set.count*360/(granularity*total))*granularity;
            set.degree = value;
            if(value > 180){
                html = html.concat('<div class="pie big pie'+(key)+'" data-start="'+sum+'" data-value="'+value+'"></div>');
            }else{
                html = html.concat('<div class="pie pie'+(key)+'" data-start="'+sum+'" data-value="'+value+'"></div>');
            }
            sum += value;
        });
        var content = total;
        html = html.concat('<div class="inner"><span>',content,'</span></div>');
        //tieni per i test semplici return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        return new L.DivIcon({ html: html,className: 'pie-cluster',iconSize: new L.Point(30, 30) });
    }

// inizializzazione poller mappa
    var RELOAD_TIME = config.behaviour.bbox_reload_time;
    var timer = false;
    // var polling = function (){
    //     $timeout.cancel(timer);
    //     $rootScope.$broadcast("leafletDirectiveMap.mymap.moveend");
    //     timer = $timeout(function() {
    //         $log.debug("polling!");
    //         polling();
    //     },RELOAD_TIME);
    // };
    // polling();
});
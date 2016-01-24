angular.module('firstlife.controllers')

    .controller('MapCtrl', ['$scope', '$state', '$stateParams', '$ionicModal', '$ionicActionSheet', '$ionicPopup', '$cordovaGeolocation', '$ionicLoading', '$q', '$ionicPopover', '$rootScope', '$window', '$location', '$filter', 'leafletData', 'leafletEvents', 'entityFactory', 'categoriesFactory', 'MapService', 'myConfig', 'PlatformService', 'MemoryFactory', 'AreaService', 'leafletMarkersHelpers', function($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, $ionicPopup, $cordovaGeolocation, $ionicLoading, $q, $ionicPopover, $rootScope,  $window, $location, $filter, leafletData, leafletEvents, entityFactory, categoriesFactory, MapService, myConfig, PlatformService, MemoryFactory, AreaService, leafletMarkersHelpers) {



        // configurazione dell'applicazione
        $scope.config = myConfig;
        // visualizzazione web o mobile?
        $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        // funzione di locate usata anche nelle modal
        $scope.locate = locate;
        // funzione di cambio di modalita' della mappa
        $scope.changeMode = MapService.changeMode;
        $scope.changeVisibility = MapService.changeVisibility;
        $scope.updateMarkersDistributed = MapService.updateMarkersDistributed;

        // aree d'interesse 
        $scope.area = AreaService.getArea();
        $scope.buildings = $scope.area.places;
        console.log("Area e favPlaces: ", $scope.area);

        // default utente per le azioni con il log
        $scope.isLoggedIn = false;

        // ascolto del cambio dei parametri search
        // se li cambio io setto false per bypassare i controlli
        self.watchSearchEnabled = true;



        // Leaflet Map: inizializzazioni
        $scope.map = null;
        $scope.categories = [];

        $scope.options1 = null;
        $scope.details1 = '';

        $scope.editMode = false;


        var moveendSetTimeout;
        var MOVEEND_DELAY = $scope.config.behaviour.moveend_delay;
        
        $scope.filters = {};
        // init filtri
        $scope.filterConditions = [
            //{key:'parent_id',name:'parent_id',values:[null],mandatory:{condition:true,values:true},equal:false,excludeRule:false,excludeProperty:true},
            //{key:'location',name:'location',values:[null],mandatory:{condition:true,values:true},equal:false,excludeRule:false,excludeProperty:true}
        ];
        
        // init category
        // bug da sistemare, infilo la categoria in catIndex in entityFactory, da tenere allineati!!!!
        categoriesFactory.getAll().then(
            function(response){
                console.log("MapCtrl, init filtri: ",response);
                // costruisco regola per le categorizzazione
                for(i = 0; i< response.length; i++){
                    var cats = response[i];
                    // todo aggiungi slug
                    var filter_name = cats.name;//'catIndex',
                    var check = 'id';
                    var rule = {key:'category_list',name:filter_name,values:[],mandatory:{condition:false,values:false},equal:false,excludeRule:false,excludeProperty:false};
                    // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
                    $scope.filters[filter_name] = {list: response[i].categories, toggle:1, label:filter_name,check:check,name:filter_name};
                    // bug init i = 1
                    for(j = 0; j < $scope.filters[filter_name].list.length; j++){
                        $scope.filters[filter_name].list[j].visible = true;
                        $scope.filters[filter_name].list[j].key = $scope.filters[filter_name].list[j].id;
                        rule.values.push($scope.filters[filter_name].list[j].id);
                    }
                    $scope.filterConditions.push(rule);
                    console.log("MapCtrl, init filtro categoria: ",$scope.filters[filter_name],rule);
                }
            },
            function(response){
                console.log("MapCtrl, init filtri, errore: ",response);
            }
        );
        //init filtri temporali
        
        
        
        // init filtro su entity_type
        initEntityTypeFilter();
        function initEntityTypeFilter(){
        var types = $scope.config.types.list,
            check = 'key',
            filter_name = 'entity_type';
        // costruisco regola per gli entity_type
        var rule = {key:filter_name,name:filter_name,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false};
        // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
        $scope.filters[filter_name] = {list:types, toggle:1, label:'Tipi',check:check,name:filter_name};
        for(i = 0; i < $scope.filters[filter_name].list.length; i++){
            $scope.filters[filter_name].list[i].visible = true;
            rule.values.push($scope.filters[filter_name].list[i].key);
        }
        $scope.filterConditions.push(rule);
        console.log("MapCtrl, init filtro entity_type: ",$scope.filters);
        }
        //fine init filtri
        
         

        // cambio di stato, ingresso in app.maps
        // controllore del comportamento della mappa
        $scope.$on("$stateChangeSuccess", function() {

            console.log("sono in app.map e vengo da ", $rootScope.previousState, $stateParams);
            if($rootScope.previousState !== 'app.maps'){
                // se non ho gia' una posizione la inizializzo con i valori di default da config
                if(!$rootScope.info_position){
                    // init con i dati di default
                    $rootScope.info_position = {
                        lat: $scope.config.map.map_default_lat,
                        lng: $scope.config.map.map_default_lng,
                        zoom: $scope.config.map.zoom_level,
                        zoom_create : $scope.config.map.zoom_create,
                        bounds : $scope.config.map.bounds
                    };
                }

                // check autenticazione
                var user = MemoryFactory.readUser();
                if(user){
                    //console.log("isLoggedIn? ", true);
                    $scope.isLoggedIn = true;
                } else {$scope.isLoggedIn = false;}

                // recupero la mappa
                MapService.getMap().then(
                    function(map){
                        //console.log("InitMap riuscita! ", map);
                        $scope.map = map;
                    }, 
                    function(err){
                        console.log("InitMap fallita!",err);
                    });


                // valuto lo stato da dove arrivo e decido cosa fare
                switch($rootScope.previousState){

                    case 'app.editor':
                        // se vengo dalla creazione/modifica di posti
                        console.log("MapCtrl, cambio stato da intro: ",$state.centerParam);
                        backFromEditor($state.centerParam);
                        break;

                    case 'login':
                        // vengo dal login
                        console.log("MapCtrl, gestore cambio di stato, case:login, $rootScope.info_position: ", $rootScope.info_position);
                        $scope.locate($rootScope.info_position);
                        break;

                    default: 
                        // 1) diretto per il viewer
                        console.log("MapCtrl, gestione stato, default");
                        // posiziono la mappa
                        $scope.locate($rootScope.info_position);
                }
                console.log("Check parametri: ", $stateParams, $location.search());
            }else{console.log("MapCtrl, gestione stato, ignorato perche' vengo da ", $rootScope.previousState);}
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
         */
        // click su marker > propago evento
        $scope.$on('leafletDirectiveMarker.click', function(event, args) {
            console.log("MARKER CLICK...controlla, args: ", args);
            if(!$scope.editMode){
                clickMarker(args.model.id);
            }
        });   
        // mappa si muove, aggiorno la posizione nella search e partono le chiamate per l'update dei marker
        $scope.$on('leafletDirectiveMap.moveend', function(event, args) {
            //console.log("Event: moveend...", $scope.map);
            // salvo la posizione corrente della mappa
            $rootScope.info_position = $scope.map.center;
            // controllo se sono in edit mode
            if(!$scope.editMode){
                // se e' stato impostato un delay
                if (MOVEEND_DELAY > 0) {
                    if (moveendSetTimeout) {
                        //console.log("clearTimeout");
                        clearTimeout(moveendSetTimeout);
                    }
                    moveendSetTimeout = setTimeout(
                        function(){
                            // chiamate bounding box al server
                            $scope.updateMarkersDistributed();
                            // aggiornamento parametro search nell'url
                            updatePositionInSearch();
                            // filtro dei marker sulla nuova posizione
                            setMapMarkers();
                        }, MOVEEND_DELAY);
                } 
                else {
                    // chiamate bounding box al server
                    $scope.updateMarkersDistributed();
                    // aggiornamento parametro search nell'url
                    updatePositionInSearch();
                    // filtro dei marker sulla nuova posizione
                    setMapMarkers();
                }
            }

        });

        //listner apertura e chiusura della modal del place
        $scope.$on('openPlaceModal', function(event, args){
            // aggiorno il parametro place dalla search
            // updateSearch({place:args.marker});
            updatePlaceInSearch(args.marker);
            event.preventDefault();
        });
        $scope.$on('closePlaceModal', function(event, args){
            // rimuovo il parametro place dalla search
            deleteInSearch('place');
            event.preventDefault();
        });
        //listner cambio dei parametri search
        $scope.$watch(
            function(){ return $location.search(); }, 
            function(e, old){
                console.log("cambio search! ",e, " vecchi parametri: ",old, " devo controllare? ", self.watchSearchEnabled);
                if(self.watchSearchEnabled){
                    // se ho il parametro place
                    console.log("check paramentro place, old: ",old.place, " nuovo: ",e.place, " scelta ", (!old.place && e.place) || (old && e.place != parseInt(old.place)));
                    if(e.place){
                        //if((!old.place && e.place) || (old && e.place != parseInt(old.place))){
                        // placeModal da aprire
                        console.log("trovato parametro place, devo aprire una modal: ",e.place);
                        clickMarker(e.place);
                        //localizzo perche' il marker potrebbe non essere nello scope
                        //$scope.locate(parseInt(e.place.));
                        //}
                    }else{
                        // chiudo la modal
                        $scope.$broadcast("markerClickClose");
                        // se ho settati i parametri di posizione
                        if(e.lat && e.lng && e.zoom){
                            if($scope.map.center.lat != e.lat || e.lng != $scope.map.center.lng || e.zoom != $scope.map.center.zoom){
                                MapService.locate(e);
                            }
                        }
                    }
                }
                // abilito il listner (serve per gestire il pulsante back del browser)
                // il listner si auto-abilita dopo ogni cambio di parametri
                self.watchSearchEnabled = true;
            },
            true);

        // filtro sui marker, se cambiano ricalcolo i marker filtrati
        $scope.filtred = [];
        $scope.$watch("map.markers", function(newVal,oldVal) {
            console.log("cambio dei Markers: ",$scope.map.markers);
            $scope.filtred = $filter('filter')($scope.map.markers, markerFilter);
            // trasformo array in oggetto usando l'array di id come chiave
            //$scope.markersFiltered = _.object(filtred.map(function(e){return e.id;}), filtred);
            console.log("cambio dei Markers, nuovi markers filtrati: ",$scope.filtred);
        },true);
        // filtro sulle condizioni, se cambiano ricalcolo i marker filtrati
        $scope.$watch("filterConditions", function(newVal,oldVal) {
            console.log("cambio dei Markers: ",$scope.map.markers);
            $scope.filtred = $filter('filter')($scope.map.markers, markerFilter);
            // trasformo array in oggetto usando l'array di id come chiave
            //$scope.markersFiltered = _.object(filtred.map(function(e){return e.id;}), filtred); 
            console.log("Cambio filtro, nuovi marker filtrati: ",$scope.filtred);
        },true);
        $scope.$watch("filtred", function(newVal,oldVal) {
            //console.log("cambio dei Markers, nuovi markers filtrati: ",$scope.filtred);
            setMapMarkers();
        },true);

        
        
        

        /*
         * Funzioni pubbliche
         * 1) isString, filtro
         * 2) greaterThan, filtro
         * 3) differentThan, filtro
         * 4) switchEditMode: cambio tra modalita' visualizzazione e edit
         * 5) goToWall: vai alla bacheca
         * 6) showModalFavPlace: mostra le aree d'interesse
         * 7) showMFilterCat: mostra i filtri categorie
         * 8) showASEdit: mostra la scelta di tipo di entita' al click del pin in edit mode
         * 9) toggleFilter: aggiunge/toglie una categoria dai filtri
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

        $scope.switchEditMode = function(){
            if($scope.map.mode == 'edit'){
                $scope.changeMode('view');
                $scope.editMode = false;
            }else{
                $scope.changeMode('edit');
                $scope.editMode = true;
            }
        };


        $scope.goToWall = function () {
            $state.go("app.wall");
        }


        $scope.showModalFavPlace = function() {
            $scope.filterFavPlace = {};
            console.log("check area: ",$scope.area);
            $ionicModal.fromTemplateUrl('templates/form/filterFavPlace.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.filterFavPlace.modal = modal;
                $scope.openFilterFavPlace();
                // rendo visibile la modal nella root per il routing dell'app
                $rootScope.modal= modal;
                $rootScope.modalStatus = true;
            });  

            $scope.openFilterFavPlace = function() {
                $scope.filterFavPlace.modal.show();
            };

            $scope.closeFilterFavPlace = function() {
                $scope.filterFavPlace.modal.hide();
                $scope.filterFavPlace.modal.remove();
            };

            $scope.$on('$destroy', function() {
                $scope.filterFavPlace.modal.remove();
            });
        };


        //Modal filtro categorie
        $scope.showMFilterCat = function() {
            $scope.filterCat = {};

            $ionicModal.fromTemplateUrl('templates/form/filterCat.html', {
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
                $scope.filterCat.modal.hide();
                $scope.filterCat.modal.remove();
            };

            $scope.$on('$destroy', function() {
                $scope.filterCat.modal.remove();
            });
        };

        //Modal filtro temporale
        $scope.time = {};
        $scope.time.from = $scope.config.map.time_from;
        console.log("Check $scope.time.from: ",$scope.time.from);
        $scope.time.callbackFrom = function(arg){
            console.log("Callback time.from, arg: ",arg);
            // se non impostato
            if(!arg)
                $scope.time.from = null;
            // se from > to
            if($scope.time.to < $scope.time.from)
                $scope.time.to = $scope.time.from;
            
            applyTimeFilters();
        };
        $scope.time.to = $scope.config.map.time_to;
        $scope.time.callbackTo = function(arg){
            console.log("Callback time.to, arg: ",arg);
            // se non impostato
            if(!arg)
                $scope.time.to = null;
            // se from > to
            if($scope.time.to < $scope.time.from)
                $scope.time.from = $scope.time.to;
            
            applyTimeFilters();
        };
        $scope.showMTimeFilter = function() {
            $scope.filterTime = {};
            $ionicModal.fromTemplateUrl('templates/form/filterTime.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.filterTime.modal = modal;
                $scope.openFilterTime();
            });  

            $scope.openFilterTime = function() {
                $scope.filterTime.modal.show();
            };

            $scope.closeFilterTime = function() {
                $scope.filterTime.modal.hide();
                $scope.filterTime.modal.remove();
            };

            $scope.$on('$destroy', function() {
                $scope.filterTime.modal.remove();
            });
        };
        function applyTimeFilters(){
            MapService.setTimeFilters($scope.time);
            MapService.resetMarkersDistributed();
        }
        
        
        //action sheet per creazione place/evento
        $scope.showASEdit = function(){
            var buttons = [];
            for(k in $scope.config.types.list){
                var text = '';
                text = text.concat('<i class="icon ').concat($scope.config.types.list[k].icon).concat('"></i>');
                text = text.concat(" ").concat($scope.config.types.list[k].name);
                //console.log("MapCtrl, creazione dell'action sheet, aggiungo bottone: ",text);
                buttons.push({text: text, type:$scope.config.types.list[k].slug});
            }

            var hideSheet = $ionicActionSheet.show({
                titleText: 'Cosa vuoi creare?',
                buttons: buttons,
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index,button) {
                    //console.log('BUTTON CLICKED', index);

                    //$scope.showMWizardPlace();
                    $state.go('app.editor', {lat: $scope.map.center.lat, lng:$scope.map.center.lng, id:null, entity_type:button.type});
                    // esco dalla modalita' edit
                    $scope.switchEditMode();

                    hideSheet();
                    //return index;
                }
            });
            //console.log("actionSheet", hideSheet);
            // serve per il routing, chiudo l'action sheet con il pulsante back
            $rootScope.actionSheet = hideSheet;
            $rootScope.actionStatus = true;
        };

        
        
        /*
         * Attiva/Disattiva filtri di categorie 
         */
        $scope.toggleFilter = function(cat, key){
            // cerco l'indice della regola per le categorie
            var index = $scope.filterConditions.map(function(e){return e.name}).indexOf(cat);
            console.log("Indice regola filtro: ",index);
            // se non c'e' lo creo
            if(index < 0){ 
                // default tutti i valori
                $scope.filterConditions[index] = {};
                $scope.filterConditions[index].values = [null];
                $scope.filterConditions[index].mandatory = {condition:true,values:false};
                $scope.filterConditions[index].equal = false;
                $scope.filterConditions[index].excludeRule = false;
                $scope.filterConditions[index].excludeProperty = false;
                console.log("Init della regola: ",$scope.filterConditions[index]);
            }
            console.log("Chiave? ",key);
            /* toggle a tre stati
             * 1) excludeRule = false e excludeProperty = false  // filtro attivo
             * 2) excludeRule = true e excludeProperty = false // tutto visibile
             * 3) excludeRule = false e excludeProperty = true  // nulla visibile
             */
            if(!key){
                console.log("Niente chiave, faccio toggle");
                // se in stato 1) vado in 2) 
                if(!$scope.filterConditions[index].excludeRule && !$scope.filterConditions[index].excludeProperty){
                    console.log("Stato 1 vado in 2");
                    $scope.filterConditions[index].excludeRule = true;
                    $scope.filterConditions[index].excludeProperty = false;
                    $scope.filters[cat].toggle = 2;
                }
                // se in stato 2) vado in 3) 
                else if($scope.filterConditions[index].excludeRule && !$scope.filterConditions[index].excludeProperty){
                    console.log("Stato 2 vado in 3");
                    $scope.filterConditions[index].excludeRule = false;
                    $scope.filterConditions[index].excludeProperty = true;
                    $scope.filters[cat].toggle = 3;
                }
                // se in stato 3) vado in 1) 
                else if(!$scope.filterConditions[index].excludeRule && $scope.filterConditions[index].excludeProperty){
                    console.log("Stato 3 vado in 1");
                    $scope.filterConditions[index].excludeRule = false;
                    $scope.filterConditions[index].excludeProperty = false;
                    $scope.filters[cat].toggle = 1;
                }
            } else {
                // se la chiave e' impostata aggiungo/rimuovo la chiave
                var i = $scope.filterConditions[index].values.indexOf(key);
                console.log("Aggiungo/rimuovo chiave: ",key, " a ", $scope.filterConditions[index].values, " indice: ",i);
                console.log("Intervengo qui: ",$scope.filters[cat].list);
                var j = $scope.filters[cat].list.map(function(e){return e.key}).indexOf(key);
                if(i < 0) {
                    $scope.filterConditions[index].values.push(key);
                    $scope.filters[cat].list[j].visible = true;
                } else {
                    $scope.filterConditions[index].values.splice(i,1);
                    $scope.filters[cat].list[j].visible = false;
                }
                //vado in stato 1) 
                $scope.filterConditions[index].excludeRule = false;
                $scope.filterConditions[index].excludeRule = false;
                $scope.filters[cat].toggle = 1;
                console.log("Aggiunta o rimossa chiave: ",$scope.filterConditions[index].values," vado in stato 1");
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
         */

        function clickMarker(markerId){
            
            var id = parseInt(markerId);
            console.log("click su marker: ", id);
            // segnalo il click al ModalPlaceCtrl
//            if($scope.map.markers[parseInt(markerId)]){
//                console.log("ho il marker: ", $scope.map.markers[id]);
//                // centro la mappa sul marker
//                //$scope.locate(parseInt(markerId));
//                $scope.$broadcast("markerClick", {marker:$scope.map.markers[id]});
//            }else{ // se non ho informazioni sul marker
                //console.log("chiedo il marker: ", id);
                MapService.get(id).then(
                    function(marker){
                        //console.log("apro la modal: ", $scope.map.markers[marker.id], parseInt(marker.id));
                        // centro la mappa sul marker
                        // fatto nel listner $scope.locate(parseInt(marker.id));
                        $scope.$broadcast("markerClick", {marker:marker});
                        //locate(marker.id);
                    },
                    function(err){console.log("markerClick, get, errore: ",err);}
                );
//            }

        }

        function updatePositionInSearch(){
            var params = $location.search();
            MapService.getCenter().then(
                function(center){
                    console.log("centro della mappa, ",center);
                    // aggiorno i parametri della mappa sono se sono diversi!
                    if(params.lat != center.lat || params.lng != center.lng || params.zoom != center.zoom ){
                        updateSearch(center);
                    }
                },
                function(err){console.log("updatePositionInSearch, MapService.getCenter, errore: ", err);}
            );
        }
        function updatePlaceInSearch(id){
            MapService.getCenter().then(
                function(center){
                    // console.log("centro della mappa, ",center);
                    // aggiungo il place
                    center.place = id;
                    // aggiorno i parametri della mappa
                    updateSearch(center);
                },
                function(err){console.log("updatePlaceInSearch, MapService.getCenter, errore: ", err);}
            );
        }
        function updateSearch(params){
            for(key in params){
                // cambiamento gia' gestito
                self.watchSearchEnabled = false;
                $location.search(key,params[key]);
            }
            //console.log("nuovi parametri search: ", $location.search(), params);
        }

        function deleteInSearch(key){
            // cambiamento gia' gestito, listner 
            self.watchSearchEnabled = false;
            $location.search(key,null);
        }


        // centra la mappa
        // accetta paramentri per la locate: center, bounds, user, marker
        function locate(coord){     
            console.log("centro su luogo, id: "+typeof(coord)+" ",coord);

            if(typeof(coord) === 'object' && 'bound' in coord){
                console.log("centro su bounds: ",coord);
                // fit della mappa al bound del fav. place
                /*leafletData.getMap("mymap").then(function(map) {
                    console.log("MapCtrl, locate, object, bounds: ",coord['bound']);
                    map.fitBounds(coord['bound']);
                    //map.fitBounds();
                });
                */
                setMapCenter(coord);
            } else if(typeof(coord) === 'object' && 'lat' in coord && 'lng' in coord){

                // centro su coordinate
                /*
                self.map.center.lat = parseFloat(coord.lat);
                self.map.center.lng = parseFloat(coord.lng);
                if(coord.zoom != null){
                    self.map.center.zoom = parseInt(coord.zoom);
                } else if(self.map.center.zoom == null){
                    self.map.center.zoom = parseInt($scope.config.map.zoom_create);
                }
                console.log("centro su coordinate: ",self.map.center);
                */
                var params = {lat:parseFloat(coord.lat),lng:parseFloat(coord.lng),zoom:parseInt(config.map.zoom_create)};
                console.log("centro su coordinate: ",params);
                setMapCenter(params);
            } else if(typeof(coord) === 'number'){
                var marker = self.map.markers[coord];
                // se il marker esiste
                if(marker){
                    console.log("Location: ", marker);
                    /*self.map.center.lat = marker.lat;
                    self.map.center.lng = marker.lng,
                        self.map.center.zoom = $rootScope.info_position.zoom;*/
                    var params = {lat:marker.lat,lng:marker.lng,zoom:parseInt(config.map.zoom_create)};
                    setMapCenter(params);
                    //console.log("nuova posizione", self.map.center);
                }else{
                    //altrimenti invoco una get
                    console.log("chiamo per :", coord);
                    entityFactory.get(coord).then(
                        function(marker){
                            // localizzo su marker
                            //console.log("Location: ", marker);
                            /*self.map.center.lat = marker.lat;
                            self.map.center.lng = marker.lng,
                                self.map.center.zoom = $rootScope.info_position.zoom*/
                            //console.log("nuova posizione", self.map.center);
                            var params = {lat:marker.lat,lng:marker.lng,zoom:parseInt(config.map.zoom_create)};
                            setMapCenter(params);
                        },
                        function(err){console.log("Location error: ",err);}
                    );
                }

            }else if(coord === 'user'){
                // localizzo su posizione utente
                // Setup the loader
                $ionicLoading.show({
                    content: '<div>Localizzazione in corso...<br> Assicurati di aver abilitato il gps o il browser!<i class="icon ion-loading-c"></i></div>',
                    animation: 'fade-in',
                    showBackdrop: false,
                    maxWidth: 50,
                    showDelay: 0
                });


                //using ngCordova
                $cordovaGeolocation
                    .getCurrentPosition()
                    .then(function (position) {
                    //console.log(coord);
                    /*self.map.center.lat  = position.coords.latitude;
                    self.map.center.lng = position.coords.longitude;
                    self.map.center.zoom = $rootScope.info_position.zoom;
                    
                    self.map.markers[0] = {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude,
                        focus: true,
                        draggable: false
                    };*/
                    
                    $scope.markersFiltered[0] = {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude,
                        focus: true,
                        draggable: false
                    };
                    var params = {lat:position.coords.latitude,lng:position.coords.longitude,zoom:parseInt(config.map.zoom_create)};
                    setMapCenter(params);
                    
                    $ionicLoading.hide();


                }, function(err) {
                    // error
                    console.log("Location error: ", err);
                    $ionicLoading.hide();

                });  

            }else{
                // posizione default della mappa
                /*self.map.center.lat = $scope.config.map.map_default_lat;
                self.map.center.lng = $scope.config.map.map_default_lng;
                self.map.center.zoom = $scope.config.map.zoom_level;*/
                var params = {
                    lat:parseFloat($scope.config.map.map_default_lat),
                    lng:parseFloat($scope.config.map.map_default_lng),
                    zoom:parseInt(c$scope.config.map.zoom_level)};
                setMapCenter(params);
            }

        };
        
        function setMapCenter(params){
            leafletData.getMap("mymap").then(function(map) {
                console.log("MapService, setMapCenter, response: ",map, " params ",params);
                if(params.bound){
                    map.fitBounds(params.bound);
                }else if(!params.zoom){
                    var center = new L.LatLng(params.lat, params.lng);
                    map.panTo(center);
                }else{
                    var center = new L.LatLng(params.lat, params.lng);
                    map.setView(center, params.zoom);
                }
                var c = map.getCenter(),
                    z = map.getZoom(),
                    newCenter = {lat:c.lat,lng:c.lng,zoom:z};
                
                console.log("Nuovo centro della mappa",newCenter);
                //updateSearch(newCenter);
            },function(response){
                console.log("MapService, setMapCenter, errore: ",response);
            });
        }

        // An alert dialog
        function showAlert (content) {
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                console.log('Allert con contenuto: ',content);
            });
        };

        // action sheet di ritorno dall'editor
        function backFromEditor(placeId){
            console.log("MapCtrl, backFromEditor, placeId: ", placeId);
            var content={};
            if(placeId!==0){
                if(placeId===-1){
                    content.title = "Errore";
                    content.text = "Salvataggio fallito: per favore, riprova in seguito!";
                }else{
                    content.title = "Successo";
                    content.text = "Ben fatto! Ora visita il luogo appena creato!";
                }

                var hideSheet = $ionicActionSheet.show({
                    titleText: content.text,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        console.log('CANCELLED');
                    }
                });
                //console.log("actionSheet", hideSheet);
                // serve per il routing, chiudo l'action sheet con il pulsante back
                $rootScope.actionSheet = hideSheet;
                $rootScope.actionStatus = true;
            }
        }; 

        

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
        
        // le condizioni in and fanno return false, quelle in or si accumulano e vengono valutate alla fine
        function markerFilter(val){
            // per ogni condizione
            var testCondition = false;
            var comparison = function(a,b,equal){
                //console.log("markerFilter, comparison, a, b, equal ",a,b,equal);
                if(Array.isArray(a)){
                    if(equal){
                        //console.log(a,"==",b,"? ",(a == b));
                        return (a.indexOf(b) >= 0);
                    }
                    return (a.indexOf(b) < 0);
                }else{
                    if(equal){
                        //console.log(a,"==",b,"? ",(a == b));
                        return a == b;
                    }
                    //console.log(a,"!=",b,"? ",(a != b));
                    return a != b;
                }
            }
            //console.log("entry: ",val, " Condizioni: ", $scope.filterConditions);
            for(key in $scope.filterConditions){
                // se non devo escludere la regola 
                if(!$scope.filterConditions[key].excludeRule){
                    // se devo escludere ogni valore possibile
                    if($scope.filterConditions[key].excludeProperty){
                        var valore = (val[$scope.filterConditions[key].key]);
                        console.log("Check esclusione regola: ",$scope.filterConditions[key].excludeProperty,val,$scope.filterConditions[key].key,valore);
                        if(!valore 
                           || valore === null || 
                            valore === 'undefined' || 
                            (Array.isArray(valore) && valore.length == 0 ) || 
                            (angular.isObject(valore) && angular.equals(valore,{})) ){
                            // non e' elegante ma faccio prima un check per vedere se il valore e' tra quelli considerabili nulli
                            //console.log("property non impostata per: ",val, "prorpieta'",$scope.filterConditions[key].key);
                        }else{return false;}
                    }
                    // se ha delle alternative
                    var checkCondition  = $scope.filterConditions[key].mandatory.condition,
                        checkValues     = $scope.filterConditions[key].mandatory.values,
                        equal           = $scope.filterConditions[key].equal;
                    // controllo sulla condizione inizializza a true se le condizioni sono in AND, a false se sono in OR
                    var check           = checkValues;
                    // per ogni condizione
                    //console.log("Condizione: ", $scope.filterConditions[key]);
                    for ( i = 0; i < $scope.filterConditions[key].values.length; i++ ){
                        //console.log("valore i = ",i, " valore valutato ",val, " per chiave ",$scope.filterConditions[key].key);
                        // se una condizione su valore non e' rispettata
                         //if(!equal){
                        //        console.log(val[$scope.filterConditions[key].key],"!=",$scope.filterConditions[key].values[i]);
                         //}else{
                          //      console.log(val[$scope.filterConditions[key].key],"==",$scope.filterConditions[key].values[i]);
                        // }
                        
                        if( comparison(val[$scope.filterConditions[key].key], $scope.filterConditions[key].values[i], equal) ){ 
                           
                            // se il valore e' obbligatorio e la condizione e' obbligatoria esco
                            if(checkValues && checkCondition){
                                //console.log("checkValues && checkCondition: true, esco ");
                                return false;
                            }
                            // se la condizione e' obbligatoria il check = false
                            if(checkValues){
                                //console.log("checkValues: true, check = false ");
                                check = false;
                            }
                        }else{ 
                            //console.log("val[key] == $scope.filterConditions[key].values[i]");
                            // se il valore e' rispettato e sono in OR allora check = true
                            if(!checkValues){
                                //console.log("!checkValues, check = true");
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
            //console.log("Test entry: ",val ,  testCondition);
            return testCondition;
        };


        /*
         * aggiunge ai marker filtrati: 
         * 1) filtro preventivo su boundig box della mappa
         * 2) fix relazioni parents e children
         */
        function setMapMarkers(){
        
            var bounds = {};
            MapService.getMapBounds().then(
                function(response){
                    bounds = response;
                    console.log("cambio dei Markers, markers da filtrare: ",$scope.filtred);
                    var filtred = $filter('filter')($scope.filtred, boundsFiltering);
                    filtred = $filter('filter')(filtred, relationsFixer);
                    console.log("cambio dei Markers, nuovi markers filtrati: ",filtred);
                    $scope.markersFiltered = _.object(filtred.map(function(e){return e.id;}), filtred);
                },
                function(response){}
            );
            // filtro per il fix delle relazioni
            // se il padre non si vede il figlio viene visualizzato
            // generalizzato sulle relazioni di tipo parent
            function relationsFixer(val){
                //console.log("MapCtrl, relationsFixer, val ",val);
                var parents = $scope.config.types.parent_relations[val.entity_type];
                for(key in parents){
                    var parentRel = parents[key];
                    //console.log("MapCtrl, relationsFixer, check ",val.id," in ", parents[key].field);
                    if($scope.filtred.map(function(e){return e.id;}).indexOf(val[parentRel.field]) >= 0)
                        return false;
                }
                return true;
            }
            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                //console.log("MapCtrl, boundsFiltering, val ",val," contains ",bounds.contains([val.lat,val.lng]));
                return bounds.contains([val.lat,val.lng]);
            }
        
        }
        
    }]);
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
            //$log.debug("sono in app.map e vengo per lo stato",toState);

            if(event.preventMapsEvent)
                return
            event.preventMapsEvent = true;

            // se non devo gestire questo evento
            if(toState.name != 'app.maps')
                return




            // gestisco i parametri al cambio di stato disattivando il listner
            self.watchSearchEnabled = false;
            var params = $location.search();
            check4embed(params);
            check4search(params);
            check4group(params);
            check4user(params);
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

                case 'home':
                    // vengo dal login
                    locate(params);

                    if(params.entity)
                        clickMarker(params.entity);

                    if(params)
                        check4customFilters(params,{});

                    break;

                default:
                    // 1) diretto per il viewer
                    //$log.debug("MapCtrl, gestione stato, default",params);
                    // posiziono la mappa se ci solo le coordinate,
                    // altrimenti si lascia il centro della mappa

                    if(params.entity)
                        clickMarker(params.entity);
                    else // centro la mappa sullo stato corrente
                        locate(params);

                    if(params)
                        check4customFilters(params,{});
            }

            // riattivo il listner
            //self.watchSearchEnabled = true;
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
        // click su marker > propago evento
        $scope.$on('leafletDirectiveMarker.mymap.click', function(event, args) {
            //$log.debug("MARKER CLICK...controlla, args: ", args,event);
            if(!event.preventMapMarkerClick){
                event.preventMapMarkerClick = true;

                if(!$scope.editMode){
                    args.model.focus = false;
                    //event.target.focus = false;
                    clickMarker(args.model.id);
                }
            }
        });


        //listner cambio dei parametri search
        $scope.$watch(
            function(){ return $location.search(); },
            function(e, old){

                if($state.current.name != 'app.maps')
                    return

                //$log.debug("check paramentri search: ",$location.search(), " stato ", $state.current.name, " devo controllare ",self.watchSearchEnabled);

                if(!self.watchSearchEnabled){
                    self.watchSearchEnabled = true;
                    return
                }



                // controllo i parametri di posizione
                check4Position(e);
                // controllo i parametri di entita'
                check4entity(e,old);
                // controllo i filtri custom
                check4customFilters(e,old);
                // controlla il parametro embed per il visualizzatore
                check4embed(e);
                // controllo il parametro di ricerca q
                check4search(e,old);
                // controllo il filtro per gruppo
                check4group(e);
                // controllo il filtro per utente
                check4user(e);
                // check timeline
                check4timeline(e,old);
                // check initiative
                check4Initiative(e,old);

                // abilito il listner (serve per gestire il pulsante back del browser)
                // il listner si auto-abilita dopo ogni cambio di parametri
                self.watchSearchEnabled = true;

            },
            true);


        // mappa si muove, aggiorno la posizione nella search e partono le chiamate per l'update dei marker
        $scope.$on('leafletDirectiveMap.mymap.moveend', function(event, args) {
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // aggiorno posizione parametro search
            updatePositionInSearch();
        });
        $scope.$on('leafletDirectiveMap.mymap.tileload', function(event, args) {
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // aggiorno posizione parametro search
            // $log.debug('tileload',args)
            addTile(args.coords);
        });
        $scope.$on('leafletDirectiveMap.mymap.tileunload', function(event, args) {
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // aggiorno posizione parametro search
            // $log.debug('tileunload',args)
            removeTile(args.coords);
        });
        // mappa si muove, aggiorno la posizione nella search e partono le chiamate per l'update dei marker
        $scope.$on('leafletDirectiveMap.mymap.load', function(event, args) {
            if(event.defaultPrevented)
                return ;

            event.preventDefault();

            // $log.debug('map loaded');

            // listners al livello tile
            leafletData.getLayers().then(
                function (layers) {
                    // $log.debug(layers.baselayers.view);
                    // $log.debug('init layer ref',!$scope.tileLayer);
                    if(!$scope.tileLayer){
                        $scope.tileLayer = layers.baselayers.view;
                        // $log.debug('tile layer',$scope.tileLayer);
                        $scope.tileLayer.on('tileload',function (e) {
                            // $log.debug('tileload',e);
                            $scope.$broadcast('leafletDirectiveMap.mymap.tileload',{coords:e.coords});
                        });
                        $scope.tileLayer.on('tileunload',function (e) {
                            // $log.debug('tileunload',e);
                            $scope.$broadcast('leafletDirectiveMap.mymap.tileunload',{coords:e.coords});
                        });
                    }
                }
            );
        });

        //listner apertura e chiusura della modal del place
        $scope.$on('openPlaceModal', function(event, args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
                // aggiorno il parametro place dalla search
                // updateSearch({place:args.marker});
                updatePlaceInSearch(args.marker);

        });
        $scope.$on('closePlaceModal', function(event, args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
                // rimuovo il parametro place dalla search
                deleteInSearch('entity');

        });


        $scope.$on("startEditing",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
                $scope.updateEntity = args;
                // se il luogo non e' bounded ad una posizione
                if (!args.skip) {
                    // centro la mappa sul luogo dei parametri
                    locate(args);
                    // entro in edit mode
                    changeMode('edit');
                } else {
                    // se devo saltare il riposizionamento
                    $scope.showASEdit();
                }

        });

        $scope.$on("endEditing",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // chiamo la funzione che gestisce l'editing
            backFromEditor(args.marker.id);
            // click del markers
            //clickMarker(args.id);
        });

        $scope.$on("deleteMarker",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
        });
        $scope.$on("lostMarker",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // cancello un marker
            deleteMarker(args.id);
        });

        $rootScope.$on("timeUpdate",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // al cambio filtro temporale ricalcolo i dati
            updateMarkers(true);
        });

        $scope.$on("clickMarker",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // click di un marker
            clickMarker(args.id);
            //$log.debug('clickMarker, locate ',args.id)
            locate(args.id);
        });

        // richiesta di cambio di livello 
        $scope.$on("switchMapLevel",function(event,args){
            if(event.defaultPrevented)
                return ;

            event.preventDefault();
            // click cambio il livello della mappa
            if(levels.check)
                selectGeoJSONLevel(args.level);

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
            updateMarkers(true);
        };

        // cambio il category space utilizzato per le icone
        $scope.changeFavCat = function (id){
            var icon = ThingsService.setIcon(id);
            $scope.closeFilterCat();
            // aggiorno i marker
            $timeout(updateMarkers,400);
            return icon;
        };


        // mostra il wall con il contenuto della mappa
        $scope.showWall = function(){
            //$log.debug("MapCtrl, showWall!");
            //$log.debug("check area: ",$scope.area);

            $ionicModal.fromTemplateUrl('templates/modals/wall.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.wall = modal;
                $scope.wall.show();
            });

            $scope.closeWall = function() {
                if($scope.wall)
                    $scope.wall.remove();
            };
            $scope.$on('modal.hidden', function() {
                //$log.debug('closing wall');
                // setup della search card se la ricerca e' (q) non nulla
                delete $scope.wall;
            });
            $scope.$on('$destroy', function() {
                if($scope.wall) $scope.wall.remove();
            });

            $scope.clickWallItem = function(id){
                $scope.closeWall();
                clickMarker(id);
                locate(id);
            }
        }

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

        function updatePositionInSearch(){
            var center = {
                lat : $scope.flmap.center.lat,
                lng : $scope.flmap.center.lng,
                zoom : $scope.flmap.center.zoom,
            };
            updateSearch(center);
        }
        function updatePlaceInSearch(id){
            var center = {
                entity : id,
                lat : $scope.flmap.center.lat,
                lng : $scope.flmap.center.lng,
                zoom : $scope.flmap.center.zoom,
            };
            // aggiorno i parametri della mappa
            updateSearch(center);
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
        // accetta paramentri per la locate: center, bounds, user, marker
        // todo refactory
        function locate(coord){
            //$log.debug("centro su luogo, id: "+typeof(coord)+" ",coord);

            if(typeof(coord) === 'object' && 'entity' in coord && coord.entity){
                // ho una entita' 
                //$log.debug('centro su entita',coord.entity);
                locateEntity(coord.entity);
            }else if( typeof(coord) === 'number'){
                // ho una entita' 
                locateEntity(coord);
            } else if(typeof(coord) === 'object' && 'bound' in coord){
                //$log.debug("centro su bounds: ",coord);
                setMapCenter(coord);
            } else if(typeof(coord) === 'object' && 'lat' in coord && 'lng' in coord && coord.lat && coord.lng){
                //$log.debug('locate coord',coord);
                var params = {
                    lat:parseFloat(coord.lat),
                    lng:parseFloat(coord.lng),
                    zoom:coord.zoom ? parseInt(coord.zoom) : parseInt(config.map.zoom_create)
                };
                setMapCenter(params);
            } else if(coord === 'user'){
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
                        //$log.debug(coord);
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
                        $log.error("Location error: ", err);
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
                    zoom:parseInt($scope.config.map.zoom_level)};
                setMapCenter(params);
            }

        };

        // aggiorno i parametri di posizione della mappa
        function setMapCenter(params){
            //$log.debug("MapService, setMapCenter, response: ",map, " params ",params);
            if(params.bound){
                $scope.flmap.bounds = params.bound;
            }
            if(params.zoom){
                $scope.flmap.center.zoom = params.zoom;
            }
            if(params.lat){
                $scope.flmap.center.lat = params.lat;
            }
            if(params.lng){
                $scope.flmap.center.lng = params.lng;
            }
            //$log.debug("Nuovo centro della mappa",newCenter);
            //updateSearch(newCenter);
        }

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


        // add tile alla lista delle tile attive e get dei marker
        var tiles = {};
        function addTile(tile) {
            // add tile to list of tiles
            tiles[tile.z+':'+tile.x+':'+tile.y] = tile;
            getTile(tile);
        }
        function removeTile(tile) {
            delete tiles[tile.z+':'+tile.x+':'+tile.y];
        }
        function getTile(tile) {
            ThingsService.tile(tile).then(
                function (markers) {
                    // aggiorno lista tile
                    $scope.flmap.markers = angular.extend($scope.flmap.markers,markers);
                },
                function (err) {
                    $log.error(err);
                }
            );
        }

        // filtro i marker in cache
        function updateMarkers(reset) {
            // clear cache
            if(reset)
                ThingsService.resetCache();
            // chiamate alle tile attive
            angular.forEach(tiles,function (tile,id) {
                getTile(tile);
            })
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
            var index = searchMarkerIndex(entityId);
            // se il marker esiste
            if(index > -1){
                var marker = $scope.flmap.markers[index];
                //$log.debug("Location: ", marker);
                /*self.map.center.lat = marker.lat;
                 self.map.center.lng = marker.lng,
                 self.map.center.zoom = $rootScope.info_position.zoom;*/
                var params = {lat:marker.lat,lng:marker.lng};//,zoom:parseInt(config.map.zoom_create)};
                locate(params);
                //$log.debug("nuova posizione", self.map.center);
            }else{
                //altrimenti invoco una get
                //$log.debug("chiamo per :", entityId);
                ThingsService.get(entityId).then(
                    function(marker){
                        // localizzo su marker
                        //$log.debug("Location: ", marker);
                        /*self.map.center.lat = marker.lat;
                         self.map.center.lng = marker.lng,
                         self.map.center.zoom = $rootScope.info_position.zoom*/
                        var params = {lat:marker.lat,lng:marker.lng};//,zoom:parseInt(config.map.zoom_create)};
                        locate(params);
                        //$log.debug("nuova posizione", $scope.flmap.center);
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
        function check4Position(e){
            // se ho settati i parametri di posizione
            if(e.lat && e.lng && e.zoom){
                if($scope.flmap.center.lat != e.lat || e.lng != $scope.flmap.center.lng || e.zoom != $scope.flmap.center.zoom){
                    locate(e);
                }
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

        // controllo il parametro entity
        function check4entity(e,old){
            if(e.entity){
                //if((!old.place && e.place) || (old && e.place != parseInt(old.place))){
                // placeModal da aprire
                //$log.debug("trovato parametro entity, devo aprire una modal: ",e.entity);
                clickMarker(e.entity);
                //localizzo perche' il marker potrebbe non essere nello scope
                locate(e.entity);
                //}
            }else if(old.entity){
                // chiudo la modal
                $scope.$broadcast("markerClickClose");

            }
        };

        $scope.query = null;
        // controllo il parametro q di ricerca di stringhe
        function check4search(e,old){
            if(!e)
                return false;
            var q = e.q;
            var o = old && old.q ? old.q : null;
            if(q && o && q == o)
                return false;

            //$log.debug('check4search, param q', e.q, old);
            // se il parametro e' settato
            // logica
            if(q && q != ''){
                $scope.query = q;
            }else if(q == ''){
                // se parametro non valido lo rimuovo
                $location.search('q',null);
                $scope.query = null;
            }else if(o && o != '' && !q){
                $scope.query = null;
            }
            // avviso del cambio di parametro
            $scope.$broadcast('newSearchParam',{q: q ? q : null});
            //$log.debug('change query ',q);
            // setMapMarkers();
            ThingsService.setQuery(q);
            updateMarkers(true);
        }

        function check4timeline(e,old){
            if(!e)
                return false;
            var q = e.date;
            var o = old && old.date ? old.date : null;
            var p = e.unit;
            var f = old && old.unit ? old.unit : null;
            if( (q && o && q == o) && (p && f && p == f) )
                return false;
            // se il parametro e' settato
            // mando il segnale di aggiornamento degli eventi sulla timeline
            $rootScope.$emit('timeline.refresh');
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
        controls: {
            zoomControl: (config.map.zoom),
            zoomControlPosition: config.map.zoom_position,
            attributionControl: config.map.attribution,
            attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        events: {
            map: {
                enable: ['click', 'moveend', 'focus','load', 'unload'],
                logic: 'broadcast'
            },
            marker: {
                enable: ['click'],
                logic: 'broadcast'
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
        //if(consoleCheck) console.log("bakeThePie, cluster: ",markers);
        var granularity = 5;
        var total = cluster.getChildCount();
        //if(consoleCheck) console.log("totale: ",total);
        var sum = 0,
            html = '';

        var item = {};
        for(i in markers){
            // console.log("bakeThePie, check ",markers[i].options.icon);
            var id = markers[i].options.icon.options.index;
            if(item[id]){
                item[id].count++;
            }else{
                item[id] = {index:markers[i].options.icon.options.index, color:markers[i].options.icon.options.color,
                    count:1};
            }
            //if(consoleCheck) console.log("bakeThePie, check2 ",item[id]);
        }
        //if(consoleCheck) console.log("fette di torta: ", item);
        for(i in item){
            var value = Math.round(item[i].count*360/(granularity*total))*granularity;
            item[i].degree = value;
            //if(consoleCheck) console.log("bakeThePie, calcolo: ",i,item[i],value, item[i].degree);
            if(value > 180){
                html = html.concat('<div class="pie big pie'+(item[i].index)+'" data-start="'+sum+'" data-value="'+value+'"></div>');
            }else{
                html = html.concat('<div class="pie pie'+(item[i].index)+'" data-start="'+sum+'" data-value="'+value+'"></div>');

            }
            sum += value;

        }
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
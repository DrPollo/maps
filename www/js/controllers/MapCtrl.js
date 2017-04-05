angular.module('firstlife.controllers')
    .controller('MapCtrl', ['$scope', '$state', '$stateParams', '$ionicModal', '$ionicActionSheet', '$ionicPopup', '$cordovaGeolocation', '$ionicLoading', '$q', '$ionicPopover', '$rootScope', '$window', '$location', '$filter', '$timeout', '$log',  'leafletData', 'leafletMapEvents', 'entityFactory', 'MapService', 'myConfig', 'PlatformService', 'MemoryFactory', 'AreaService', 'leafletMarkersHelpers','indexingFactory', 'tilesFactory', 'AuthService',  function($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, $ionicPopup, $cordovaGeolocation, $ionicLoading, $q, $ionicPopover, $rootScope,  $window, $location, $filter, $timeout, $log, leafletData, leafletMapEvents, entityFactory, MapService, myConfig, PlatformService, MemoryFactory, AreaService, leafletMarkersHelpers,indexingFactory, tilesFactory, AuthService) {



        var consoleCheck = false;


        var levels = {check:false};
        if (myConfig.map.area.levels){
            levels = {check:true};
            levels.list = $scope.config.map.area.levels;
        }

        // configurazione dell'applicazione
        if(!$scope.config) $scope.config = myConfig;
        var config = myConfig;


        // check geometrie
        var checkGeometries = config.map.geometry_layer;

        // visualizzazione web o mobile?
        if(!$scope.isMobile) $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        // funzione di locate usata anche nelle modal
        if(!$scope.locate) $scope.locate = locate;

        //if(!$scope.changeVisibility) $scope.changeVisibility = MapService.changeVisibility;


        // aree d'interesse 
        if(!$scope.area) {
            $scope.area = AreaService.getArea();
            $scope.buildings = $scope.area.places;
            $log.debug("Area e favPlaces: ", $scope.area);
        }

        // default utente per le azioni con il log
        $scope.isLoggedIn = AuthService.isAuth();

        // ascolto del cambio dei parametri search
        // se li cambio io setto false per bypassare i controlli
        if(self.watchSearchEnabled === 'undefined') self.watchSearchEnabled = true;




        // Leaflet Map: inizializzazioni
        if(!$scope.map || angular.equals($scope.map,{}) ){
            $scope.map = map;
        }
        if(!$scope.categories) $scope.categories = $scope.config.types.categories;
        //definizione dei listner su mappa
        $scope.events = {
            map: {
                enable: ['click', 'moveend','focus','drag'],
                logic: 'broadcast'
            },
            marker: {
                enable: ['click'],
                logic: 'broadcast'
            }
        };
        $scope.options1 = null;
        $scope.details1 = '';

        $scope.editMode = false;


        var moveendSetTimeout;
        var MOVEEND_DELAY = config.behaviour.moveend_delay;
        var RELOAD_TIME = config.behaviour.bbox_reload_time;

        // init dei filtri
        if(!$scope.markersFiltered)
            initFilters();


        // init layer geoJSON

        $scope.geojson = {
            data:{
                "type": "FeatureCollection",
                "features": []
            },
            style: style
        };

        function style(feature){
            var entry = feature.properties;
            var max = $scope.markersFilteredArray.length;
            var style = {
                fillColor: "#6C93B3",
                weight: 3,
                opacity: 1,
//                opacity: 0,
//                color: '#fff',
                color:'#6C93B3',
                dashArray: '1',
                fillOpacity: 0.5,
//                fillOpacity: 0
            };
            if(entry.entities.length > 0){
                style.fillColor = 'rgb(136, 186, 92)';
//                style.color = 'rgb(136, 186, 92)';
                //style.opacity = 1;
                //style.fillOpacity = 1;
                //style.fillOpacity = entry.entities.length/20;
            }
            if(entry.entities.length > 20){
                style.fillColor = 'rgb(255,179,16)';
//                style.color = 'rgb(255,179,16)';
                //style.fillOpacity = entry.entities.length/60;
            }
            if(entry.entities.length > 40){
                style.fillColor = 'rgb(221,91,42)';
//                style.color = 'rgb(221,91,42)';
                //style.fillOpacity = entry.entities.length/(3*max);
            }
            return style;
        }



        // se ci sono dei valori di default dell'area
        if($scope.config.map.area && $scope.config.map.area.data){
            // copio i dati
            $scope.geojson.data = angular.copy($scope.config.map.area.data);
            // se definito sovrascrivo lo stile
            if($scope.config.map.area.style)
                $scope.geojson.style = angular.copy($scope.config.map.area.style);

            $scope.geojson.levels = levels.check ? levels.list : null;
        }



        var funcLayer = null
        // init livello griglia
        // testing delle chiamate tile
        if(false && !funcLayer){
            leafletData.getMap("mymap").then(function(map) {
                funcLayer = new L.TileLayer.Functional(
                    function (tile) {
                        //$log.debug('subscribe tile x',tile.x,' y ',tile.y,' z ',tile.z);
                        //$rootScope.$emit('grid-subscribe',tile);
                        tilesFactory.subscribe(tile.x, tile.y, tile.z);
                    },function(tile){
                        $log.info('unsubscribe tile x',tile.x,' y ',tile.y,' z ',tile.z);
                        //$rootScope.$emit('grid-unsubscribe',tile);
                        tilesFactory.unsubscribe(tile.x, tile.y, tile.z);
                    });
                funcLayer.addTo(map);
                $log.debug('init map',map);
                return null;
            },{reuseTiles:false,updateWhenIdle:true,unloadInvisibleTiles:true})
        }



        //$log.debug('check geojson ',$scope.geojson);

        // cambio di stato, ingresso in app.maps
        // controllore del comportamento della mappa
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            $log.log("sono in app.map e vengo per lo stato",toState);

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

            $scope.isLoggedIn = AuthService.isAuth();



            // recupero la mappa se non inizializzata
            $scope.map = MapService.getMap();



            // valuto lo stato da dove arrivo e decido cosa fare
            switch($rootScope.previousState){

                case 'app.editor':
                    // se vengo dalla creazione/modifica di posti
                    $log.debug("MapCtrl, cambio stato da intro: ",$stateParams);

                    if($stateParams.entity){
                        backFromEditor($stateParams.entity);
                        // click del markers
                        //clickMarker($stateParams.entity.id);
                    }

                    break;

                case 'home':
                    // vengo dal login
                    locate($stateParams);

                    if($stateParams.entity)
                        clickMarker($stateParams.entity);

                    if($stateParams)
                        check4customFilters($stateParams,{});

                    break;

                default:
                    // 1) diretto per il viewer
                    $log.debug("MapCtrl, gestione stato, default",$stateParams);
                    // posiziono la mappa se ci solo le coordinate,
                    // altrimenti si lascia il centro della mappa

                    if($stateParams.entity)
                        clickMarker($stateParams.entity);
                    else // centro la mappa sullo stato corrente
                        locate($stateParams);

                    if($stateParams)
                        check4customFilters($stateParams,{});
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
            $log.debug("MARKER CLICK...controlla, args: ", args,event);
            if(!event.preventMapMarkerClick){
                event.preventMapMarkerClick = true;

                if(!$scope.editMode){
                    args.model.focus = false;
                    //event.target.focus = false;
                    clickMarker(args.model.id);
                }
            }
        });

        // mappa si muove, aggiorno la posizione nella search e partono le chiamate per l'update dei marker
        $scope.$on('leafletDirectiveMap.mymap.moveend', function(event, args) {
            if(!event.preventMapMoveend){
                event.preventMapMoveend = true;
                $log.debug("Event: moveend...", $scope.map);
                // recupero i dati del layer
                if(!$scope.config.map.area.data) {getData();}
                // aggiornamento parametro search nell'url
                updatePositionInSearch();
                // controllo se sono in edit mode
                if(!$scope.editMode){
                    // se e' stato impostato un delay
                    if (MOVEEND_DELAY > 0) {
                        if (moveendSetTimeout) {
                            $log.debug("clearTimeout");
                            clearTimeout(moveendSetTimeout);
                        }
                        moveendSetTimeout = setTimeout(updateMarkersDistributed, MOVEEND_DELAY);
                    }
                    else {
                        updateMarkersDistributed();
                    }
                }
            }
        });

        //listner apertura e chiusura della modal del place
        $scope.$on('openPlaceModal', function(event, args){
            if(!event.preventOpenPlaceModal){
                event.preventOpenPlaceModal = true;
                // aggiorno il parametro place dalla search
                // updateSearch({place:args.marker});
                updatePlaceInSearch(args.marker);
            }
        });
        $scope.$on('closePlaceModal', function(event, args){
            if(!event.preventClosePlaceModal){
                event.preventClosePlaceModal = true;
                // rimuovo il parametro place dalla search
                deleteInSearch('entity');
            }
        });
        //listner cambio dei parametri search
        $scope.$watch(
            function(){ return $location.search(); },
            function(e, old){
                if($state.current.name != 'app.maps')
                    return

                $log.debug("check paramentri search: ",$location.search(), " stato ", $state.current.name, " devo controllare ",self.watchSearchEnabled);

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

                // abilito il listner (serve per gestire il pulsante back del browser)
                // il listner si auto-abilita dopo ogni cambio di parametri
                self.watchSearchEnabled = true;

            },
            true);

        // filtro sui marker, se cambiano ricalcolo i marker filtrati
        $scope.filtred = [];
        $scope.$watch("map.markers", function(newVal,oldVal) {
            if($scope.map && $scope.map.markers){
                if(consoleCheck) $log.debug("cambio dei Markers: ",$scope.map.markers,$scope.map.markers.length);
                $scope.filtred = $filter('filter')($scope.map.markers, markerFilter);
                if(consoleCheck) $log.debug("cambio dei Markers, nuovi markers filtrati: ",$scope.filtred,$scope.filtred.length);
            }
        },true);
        // filtro sulle condizioni, se cambiano ricalcolo i marker filtrati
        $scope.$watch("filterConditions", function(newVal,oldVal) {
            if($scope.map && $scope.map.markers){
                $scope.filtred = $filter('filter')($scope.map.markers, markerFilter);
            }
        },true);
        $scope.$watch("filtred", function(newVal,oldVal) {
            if(!angular.equals(newVal,oldVal)){
                setMapMarkers();
            }

        },true);


        // todo cancellare se tutto ok
        // $scope.$watch("query", function(newVal,oldVal) {
        //    $log.debug('change query ',newVal);
        //     if(!angular.equals(newVal,oldVal)){
        //         check4search(newVal,oldVal);
        //     }
        // },true);
        $scope.$on("newSearchParam", function(e,params) {
            if(e.defaultPrevented)
                return
            e.preventDefault();

           $log.debug('change query ',params.q);
            setMapMarkers();
        });


        $scope.$on("startEditing",function(event,args){
            $scope.updateEntity = args;
//            $log.debug('check start editing ',args);
            // se il luogo non e' bounded ad una posizione
            if(!args.skip){
                // centro la mappa sul luogo dei parametri
                locate(args);
                // entro in edit mode
                changeMode('edit');
            }else{
                // se devo saltare il riposizionamento
                $scope.showASEdit();
            }

        });

        $scope.$on("endEditing",function(event,args){
            // chiamo la funzione che gestisce l'editing
            backFromEditor(args.marker.id);
            // click del markers
            //clickMarker(args.id);
            event.preventDefault();
        });

        $scope.$on("deleteMarker",function(event,args){
            // cancello un marker 
            deleteMarker(args.id);
            event.preventDefault();
        });
        $scope.$on("lostMarker",function(event,args){
            // cancello un marker
            deleteMarker(args.id);
            event.preventDefault();
        });

        $rootScope.$on("timeUpdate",function(event,args){
            // reset dei markers
            resetMarkersDistributed();
            event.preventDefault();
        });

        $scope.$on("clickMarker",function(event,args){
            // click di un marker
            clickMarker(args.id);
            $log.debug('clickMarker, locate ',args.id)
            locate(args.id);
            event.preventDefault();
        });

        // richiesta di cambio di livello 
        $scope.$on("switchMapLevel",function(event,args){
            // click cambio il livello della mappa
            if(levels.check)
                selectGeoJSONLevel(args.level);

            event.preventDefault();
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


        $scope.showModalFavPlace = function() {
            $scope.filterFavPlace = {};
            $log.debug("check area: ",$scope.area);
            $ionicModal.fromTemplateUrl('templates/form/filterFavPlace.html', {
                scope: $scope,
                animation: 'fade-in',
                backdropClickToClose : true,
                hardwareBackButtonClose : true,
                focusFirstInput: true
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
                $scope.filterFavPlace.modal.remove();
            };

            $scope.$on('modal.hidden', function() {
                delete $scope.filterFavPlace.modal;
            });

            $scope.$on('$destroy', function() {
                $scope.filterFavPlace.modal.remove();
            });
        };


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
                var params = {lat: $scope.map.center.lat, lng:$scope.map.center.lng,zoom_level:$scope.map.center.zoom,id:$scope.updateEntity.id,};
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
                params.lat = $scope.map.center.lat;
                params.lng = $scope.map.center.lng;
                params.zoom_level = $scope.map.center.zoom;

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
            // cerco l'indice della regola per le categorie
            var index = $scope.filterConditions.map(function(e){return e.name}).indexOf(cat);
            $log.debug("Indice regola filtro: ",index,cat,key);
            // se non c'e' lo creo
            if(index < 0){
                // default tutti i valori
                $scope.filterConditions[index] = {};
                $scope.filterConditions[index].values = [null];
                $scope.filterConditions[index].mandatory = {condition:true,values:false};
                $scope.filterConditions[index].equal = false;
                $scope.filterConditions[index].excludeRule = false;
                $scope.filterConditions[index].excludeProperty = false;
                $log.debug("Init della regola: ",$scope.filterConditions[index]);
            }
            $log.debug("Chiave? ",key);
            /* toggle a tre stati
             * 1) excludeRule = false e excludeProperty = false  // filtro attivo
             * 2) excludeRule = true e excludeProperty = false // tutto visibile
             * 3) excludeRule = false e excludeProperty = true  // nulla visibile
             */
            if(!key && key !== 0){
                $log.debug("Niente chiave, faccio toggle");
                // se in stato 1) vado in 2) 
                if(!$scope.filterConditions[index].excludeRule && !$scope.filterConditions[index].excludeProperty){
                    $log.debug("Stato 1 vado in 2");
                    $scope.filterConditions[index].excludeRule = true;
                    $scope.filterConditions[index].excludeProperty = false;
                    $scope.filters[cat].toggle = 2;
                }
                // se in stato 2) vado in 3) 
                else if($scope.filterConditions[index].excludeRule && !$scope.filterConditions[index].excludeProperty){
                    $log.debug("Stato 2 vado in 3");
                    $scope.filterConditions[index].excludeRule = false;
                    $scope.filterConditions[index].excludeProperty = true;
                    $scope.filters[cat].toggle = 3;
                }
                // se in stato 3) vado in 1) 
                else if(!$scope.filterConditions[index].excludeRule && $scope.filterConditions[index].excludeProperty){
                    $log.debug("Stato 3 vado in 1");
                    $scope.filterConditions[index].excludeRule = false;
                    $scope.filterConditions[index].excludeProperty = false;
                    $scope.filters[cat].toggle = 1;
                }
            } else {
                // se la chiave e' impostata aggiungo/rimuovo la chiave
                var i = $scope.filterConditions[index].values.indexOf(key);
                $log.debug("Aggiungo/rimuovo chiave: ",key, " a ", $scope.filterConditions[index].values, " indice: ",i);
                $log.debug("Intervengo qui: ",$scope.filters[cat].list);
                var j = $scope.filters[cat].list.map(function(e){return e.key}).indexOf(key);
                if(i < 0) {
                    $scope.filterConditions[index].values.push(key);
                    $scope.filters[cat].list[j].visible = true;
                    if($scope.filterConditions[index].callbackPush){
                        $scope.filterConditions[index].callbackPush(key);
                    }
                } else {
                    $scope.filterConditions[index].values.splice(i,1);
                    $scope.filters[cat].list[j].visible = false;
                    if($scope.filterConditions[index].callbackPop){
                        $scope.filterConditions[index].callbackPop(key);
                    }
                }
                //vado in stato 1) 
                $scope.filterConditions[index].excludeRule = false;
                $scope.filterConditions[index].excludeRule = false;
                $scope.filters[cat].toggle = 1;
                $log.debug("Aggiunta o rimossa chiave: ",$scope.filterConditions[index].values," vado in stato 1");
            }



        };

        // cambio il category space utilizzato per le icone
        $scope.changeFavCat = function (id){
            //$log.debug("check change favCat ",id);
            $ionicLoading.show({
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 50,
                showDelay: 0
            });
            $log.debug("cambio favCat da ",$scope.favCat, " a ", id);
            $scope.favCat = id;
            // lancio l'ultimo step di update dei marker
            // da migliorare
            for(i in $scope.markersFiltered){
                $log.debug("cambio icona al marker ",$scope.markersFiltered[i]);
                // se e' definita un icona per il category_space favCat allora assegno l'icona, altrimenti tengo quella di attuale
                $scope.markersFiltered[i].icon = $scope.markersFiltered[i].icons[$scope.favCat] ? $scope.markersFiltered[i].icons[$scope.favCat] : $scope.markersFiltered[i].icon;

            }
            $ionicLoading.hide();
            $scope.closeFilterCat();
        }


        // mostra il wall con il contenuto della mappa
        $scope.showWall = function(){
            $log.debug("MapCtrl, showWall!");
            $log.debug("check area: ",$scope.area);

            $ionicModal.fromTemplateUrl('templates/modals/wall.html', {
                scope: $scope,
                animation: 'fade-in'
            }).then(function(modal) {
                $scope.wall = modal;
                $scope.wall.show();
            });

            $scope.closeWall = function() {
                $scope.wall.remove();
            };
            $scope.$on('modal.hidden', function() {
                $log.debug('closing wall');
                // setup della search card se la ricerca e' (q) non nulla
                delete $scope.wall;
            });
            $scope.$on('$destroy', function() {
                if($scope.wall) $scope.wall.remove();
            });

            $scope.clickWallItem = function(marker){
                $scope.closeWall();
                clickMarker(marker.id);
                locate(marker.id);
            }
        }

        // mostra il wall con il contenuto della mappa
        $scope.showSearchBox = function(){
            $log.debug("MapCtrl, showSearchBox!");
            $log.debug("check area: ",$scope.area);

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
            $log.debug("markerClick! ",markerId);
            $scope.$broadcast("markerClick", {markerId:markerId});
        }

        function updatePositionInSearch(){
            var params = $location.search();
            MapService.getCenter().then(
                function(center){
                    $log.debug("centro della mappa, ",center);
                    // aggiorno i parametri della mappa sono se sono diversi!
                    if(params.lat != center.lat || params.lng != center.lng || params.zoom != center.zoom ){
                        updateSearch(center);
                    }
                },
                function(err){$log.debug("updatePositionInSearch, MapService.getCenter, errore: ", err);}
            );
        }
        function updatePlaceInSearch(id){
            MapService.getCenter().then(
                function(center){
                    // $log.debug("centro della mappa, ",center);
                    // aggiungo il place
                    center.entity = id;
                    // aggiorno i parametri della mappa
                    updateSearch(center);
                },
                function(err){$log.debug("updatePlaceInSearch, MapService.getCenter, errore: ", err);}
            );
        }
        function updateSearch(params){
            for(key in params){
                // cambiamento gia' gestito
                self.watchSearchEnabled = false;
                $location.search(key,params[key]);
                //self.watchSearchEnabled = true;
            }
            $log.debug("nuovi parametri search: ", $location.search(), params);
        }

        function deleteInSearch(key){
            // cambiamento gia' gestito, listner 
            self.watchSearchEnabled = false;
            $location.search(key,null);
            self.watchSearchEnabled = true;
        }


        // centra la mappa
        // accetta paramentri per la locate: center, bounds, user, marker
        function locate(coord){
            $log.debug("centro su luogo, id: "+typeof(coord)+" ",coord);

            if(typeof(coord) === 'object' && 'entity' in coord && coord.entity){
                // ho una entita' 
                $log.debug('centro su entita',coord.entity);
                locateEntity(coord.entity);
            }else if( typeof(coord) === 'number'){
                // ho una entita' 
                locateEntity(coord);
            } else if(typeof(coord) === 'object' && 'bound' in coord){
                $log.debug("centro su bounds: ",coord);
                // fit della mappa al bound del fav. place
                /*leafletData.getMap("mymap").then(function(map) {
                 $log.debug("MapCtrl, locate, object, bounds: ",coord['bound']);
                 map.fitBounds(coord['bound']);
                 //map.fitBounds();
                 });
                 */
                setMapCenter(coord);
            } else if(typeof(coord) === 'object' && 'lat' in coord && 'lng' in coord && coord.lat && coord.lng){
                $log.debug('locate coord',coord);
                // centro su coordinate
                /*
                 self.map.center.lat = parseFloat(coord.lat);
                 self.map.center.lng = parseFloat(coord.lng);
                 if(coord.zoom != null){
                 self.map.center.zoom = parseInt(coord.zoom);
                 } else if(self.map.center.zoom == null){
                 self.map.center.zoom = parseInt($scope.config.map.zoom_create);
                 }*/
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
                        $log.debug(coord);
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
                        $log.debug("Location error: ", err);
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

        function setMapCenter(params){
            leafletData.getMap("mymap").then(function(map) {
                $log.debug("MapService, setMapCenter, response: ",map, " params ",params);
                if(params.bound){
                    $log.debug("MapService, setMapCenter, map.fitBounds: ",params.bound);
                    map.fitBounds(params.bound);
                }else if(!params.zoom){
                    var center = new L.LatLng(params.lat, params.lng);
                    $log.debug("MapService, setMapCenter, map.panTo: ",center);
                    map.panTo(center);
                }else{
                    var center = new L.LatLng(params.lat, params.lng);
                    $log.debug("MapService, setMapCenter, map.setView: ",center,params.zoom);
                    map.setView(center, params.zoom);
                }
                var c = map.getCenter(),
                    z = map.getZoom(),
                    newCenter = {lat:c.lat,lng:c.lng,zoom:z};

                $log.debug("Nuovo centro della mappa",newCenter);
                //updateSearch(newCenter);
            },function(response){
                $log.debug("MapService, setMapCenter, errore: ",response);
            });
        }

        // An alert dialog
        function showAlert (content) {
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                $log.debug('Allert con contenuto: ',content);
            });
        };

        // action sheet di ritorno dall'editor
        function backFromEditor(entityId){
            $log.debug("MapCtrl, backFromEditor, entityId: ", entityId);
            var content={};
            if(entityId == -1){
                content.title = $filter('translate')('ERROR');
                content.text = $filter('translate')('UNKNOWN_ERROR');


                var hideSheet = $ionicActionSheet.show({
                    titleText: content.text,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        $log.debug('CANCELLED');
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
                        $log.debug('CANCELLED');
                    }
                });
                $log.debug("actionSheet", hideSheet);
                // serve per il routing, chiudo l'action sheet con il pulsante back
                $rootScope.actionSheet = hideSheet;
                $rootScope.actionStatus = true;
            }else if(entityId){
                clickMarker(entityId);
                updateMarker(entityId);
                // todo cancello messaggio ok creazione thing
                // content.title = $filter('translate')('SUCCESS');
                // content.text = $filter('translate')('SAVE_SUCCESS');
                // aggiungi marker alla mappa
                // messaggio di avvenuta operazione
                // var hideSheet = $ionicActionSheet.show({
                //     titleText: content.text,
                //     cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                //     cancel: function() {
                //         $log.debug('CANCELLED');
                //     }
                // });
                // $log.debug("actionSheet", hideSheet);
                // // serve per il routing, chiudo l'action sheet con il pulsante back
                // $rootScope.actionSheet = hideSheet;
                // $rootScope.actionStatus = true;
            }else{

                $log.debug("creazione/modifica ok!");}
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
            // $log.debug("entry: ",val, " Condizioni: ", $scope.filterConditions);
            for(key in $scope.filterConditions){
                // se non devo escludere la regola 

                $log.debug("il tipo e' da includere? ", $scope.filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                // se esiste la include condition e il valore includeCondition:{value:cats.category_space,property:'category_space'}
                var indexCheck = 0;
                if($scope.filterConditions[key].includeCondition){
                    var checkField = val[$scope.filterConditions[key].includeCondition.property];
                    var k = Object.keys($scope.filterConditions[key].includeCondition.value)[0];
                    indexCheck = checkField.map(function(e){return e[k].id}).indexOf($scope.filterConditions[key].includeCondition.value[k]);
                    $log.debug("check per includeCondition ", (indexCheck > -1));
                }


                $log.debug("il tipo e' da includere? ", $scope.filterConditions[key].includeTypes.indexOf(val.entity_type) > -1);
                if(!$scope.filterConditions[key].excludeRule  && $scope.filterConditions[key].includeTypes.indexOf(val.entity_type) > -1 && indexCheck > -1){
                    // se devo escludere ogni valore possibile
                    if($scope.filterConditions[key].excludeProperty){
                        var valore = (val[$scope.filterConditions[key].key]);
                        $log.debug("Check esclusione regola: ",$scope.filterConditions[key].excludeProperty,val,$scope.filterConditions[key].key,valore);
                        if(!valore
                            || valore === null ||
                            valore === 'undefined' ||
                            (Array.isArray(valore) && valore.length == 0 ) ||
                            (angular.isObject(valore) && angular.equals(valore,{})) ){
                            // non e' elegante ma faccio prima un check per vedere se il valore e' tra quelli considerabili nulli
                            $log.debug("property non impostata per: ",val, "prorpieta'",$scope.filterConditions[key].key);
                        }else{return false;}
                    }
                    // se ha delle alternative
                    var checkCondition  = $scope.filterConditions[key].mandatory.condition,
                        checkValues     = $scope.filterConditions[key].mandatory.values,
                        equal           = $scope.filterConditions[key].equal;
                    // controllo sulla condizione inizializza a true se le condizioni sono in AND, a false se sono in OR
                    var check           = checkValues;
                    // per ogni condizione
                    $log.debug("Condizione: ", $scope.filterConditions[key]);
                    for ( i = 0; i < $scope.filterConditions[key].values.length; i++ ){
                        $log.debug("valore i = ",i, " valore valutato ",val, " per chiave ",$scope.filterConditions[key].key);

                        if( comparison(val[$scope.filterConditions[key].key], $scope.filterConditions[key].values[i], equal) ){

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
                            $log.debug("val[key] == $scope.filterConditions[key].values[i]");
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
        };


        /*
         * aggiunge ai marker filtrati: 
         * 1) filtro preventivo su boundig box della mappa
         * 2) fix relazioni parents e children
         */
        function setMapMarkers(){

            //$scope.markersFiltered = _.object(filtred.map(function(e){return e.id;}), filtred);
            $scope.markersFilteredArray = angular.copy($scope.filtred);

            // se il parametro q e' impostato nella search
            if($scope.query){
                $scope.markersFilteredArray = $filter('filter')($scope.markersFilteredArray,$scope.query);
            }


            //aggiorno la lista dei marker mettendo e togliendo
            updateMarkers($scope.markersFilteredArray);
            removeMarkers($scope.markersFilteredArray);

            // correggo la lista tenendo conto delle relazioni tra entita'
            relationsFixer();
            //$scope.markersFilteredArray = $filter('filter')($scope.markersFilteredArray, relationsFixerFilter);


            //$log.debug("cambio dei Markers, nuovi markers filtrati: ",$scope.markersFilteredArray);


            // applico le modifiche a markersFiltered
            // aggiungo i marker alla lista 
            function updateMarkers(filtred){
                for(var i = 0; i < filtred.length; i++){
                    var marker = filtred[i];
                    // aggiorno l'icona con quella preferita
                    marker.icon = marker.icons[$scope.favCat] ? marker.icons[$scope.favCat] : marker.icon;
                    if(marker.eTimeline){
                        marker.eTimeline.icon = marker.icons[$scope.favCat] ? marker.icons[$scope.favCat] : marker.icon;
                    }
                    // $log.debug("Check update ",marker.id,(!$scope.markersFiltered[marker.id]));
                    if(!$scope.markersFiltered[marker.id]){
                        $scope.markersFiltered[marker.id] = marker;
                        // $log.debug("Aggiungo ",marker,$scope.markersFiltered[marker.id]);
                    }
                }
                // $log.debug('markers',$scope.markersFiltered)
            }
            // rimuovo i marker presenti localmente ma non presenti nel risultato
            function removeMarkers(filtred){
                // $log.debug('removeMarkers',filtred,$scope.markersFiltered);
                for(key in $scope.markersFiltered){
                    var marker = $scope.markersFiltered[key];
                    // $log.debug("Check delete ",marker.id,filtred.map(function(e){return e.id;}).indexOf(marker.id),(filtred.map(function(e){return e.id;}).indexOf(marker.id) < 0));
                    // il marker non e' nella lista dei marker filtrati lo rimuovo
                    if(filtred.map(function(e){return e.id;}).indexOf(marker.id) < 0){
                        // $log.debug("Rimuovo ",$scope.markersFiltered[key]);
                        delete $scope.markersFiltered[key];
                    }
                }
            }

            // filtro per il fix delle relazioni
            // se il padre non si vede il figlio viene visualizzato
            // generalizzato sulle relazioni di tipo parent
            function relationsFixer(){
                for(var key in $scope.markersFiltered){
                    var marker = $scope.markersFiltered[key];
                    // recupero le relazioni per l'entity type
                    var parentsRels = $scope.config.types.parent_relations[marker.entity_type];
                    //$log.debug("MapCtrl, relationsFixer, parentsRels ",parentsRels);
                    // per ogni relazione di tipo parent controllo che non sia settata e non ci sia un padre
                    for(var q in parentsRels){
                        var parentRel = parentsRels[q];
                        // se non devo escludere la relazione
                        // se il marker ha un valore nel campo della relazione padre
                        // se il padre e' nella lista dei marker
                        //if(!parentRel.exclude) $log.debug('check condizioni in relationsFixer ',parentRel.field, marker[parentRel.field], $scope.markersFiltered[marker[parentRel.field]] );
                        //$log.debug("MapCtrl, relationsFixer, parentsRel.field ",parentRel.field);
                        if(!parentRel.exclude && marker[parentRel.field] && $scope.markersFiltered[marker[parentRel.field]] ){
                            // rimuovo il marker dalla lista
                            delete $scope.markersFiltered[key];
                        }
                    }
                }
            }


            // filtro per il fix delle relazioni
            // se il padre non si vede il figlio viene visualizzato
            // generalizzato sulle relazioni di tipo parent
            function relationsFixerFilter(val){
                //$log.debug("MapCtrl, relationsFixerFilter, val ",val);
                var parents = $scope.config.types.parent_relations[val.entity_type];
                for(key in parents){
                    var parentRel = parents[key];
                    if(parentRel.exclude)
                        return true;
                    //$log.debug("MapCtrl, relationsFixerFilter, check ",val.id," in ", parents[key].field);
                    if($scope.filtred.map(function(e){return e.id;}).indexOf(val[parentRel.field]) >= 0)
                        return false;
                }
                return true;
            }

        }


        function isEmpty (obj) {
            if(obj && (
                    (Array.isArray(obj) && obj.length > 0) ||
                    (angular.isObject(obj) && !angular.equals({}, obj) ) ||
                    (angular.isString(obj) && obj != '') ||
                    (angular.isNumber(obj))
                ) ) {
                $log.debug("Is empty ",obj, "? false");
                return false;
            }
            $log.debug("Is empty ",obj, "? true");
            return true;

        }


        function updateMarkersDistributed(){

            MapService.updateMarkersDistributed().then(
                function(markers){
                    $log.debug("updateMarkersDistributed, markers: ",markers);
                    angular.extend($scope.map.markers ,markers);
                    //$log.debug("updateMarkersDistributed, risultato: ",$scope.map.markers.length);
                    // filtro dei marker sulla nuova posizione
                    setMapMarkers();
                },
                function(err){
                    $log.error("updateMarkersDistributed, error", err);
                }
            );
        }

        function resetMarkersDistributed(){

            MapService.resetMarkersDistributed().then(
                function(markers){
                    $log.debug("updateMarkersDistributed, markers: ",markers);
                    $scope.map.markers = angular.copy( markers);
                    //$log.debug("resetMarkersDistributed, risultato: ",$scope.map.markers.length);
                    // filtro dei marker sulla nuova posizione
                    setMapMarkers();
                },
                function(err){
                    $log.error("updateMarkersDistributed, error", err);
                }
            );
            // aggiornamento parametro search nell'url
            updatePositionInSearch();

        }


        function initFilters(){
            // lista di marker che viene visualizzata da leaflet
            $scope.markersFiltered = {};
            $scope.markersFilteredArray = [];
            // category_space preferenziale per le icone
            $scope.favCat = 0;

            $scope.filters = {};
            // init filtri
            $scope.filterConditions = [
                //{key:'parent_id',name:'parent_id',values:[null],mandatory:{condition:true,values:true},equal:false,excludeRule:false,excludeProperty:true},
                //{key:'location',name:'location',values:[null],mandatory:{condition:true,values:true},equal:false,excludeRule:false,excludeProperty:true}
            ];



            // filtri tipo
            var types = $scope.config.types.list,
                check = 'key',
                filter_name = 'entity_type',
                typesList = [];
            // costruisco regola per gli entity_type
            var rule = {key:filter_name,name:filter_name,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:[]};
            // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
            $scope.filters[filter_name] = {list:types, toggle:1, iconSwitcher:true, label:'TYPES',check:check,name:filter_name, category_space:0,visible:true};
            for(var i = 0; i < $scope.filters[filter_name].list.length; i++){
                $scope.filters[filter_name].list[i].visible = true;
                rule.values.push($scope.filters[filter_name].list[i].key);
                rule.includeTypes.push($scope.filters[filter_name].list[i].key);
                typesList.push($scope.filters[filter_name].list[i].key)
            }
            $scope.filterConditions.push(rule);
            $log.debug("MapCtrl, init filtro entity_type: ",$scope.filters);





            // init category
            // bug da sistemare, infilo la categoria in catIndex in entityFactory, da tenere allineati!!!!

            var categories = $scope.config.types.categories;
            // filtri categorie
            // costruisco regola per le categorizzazione
            for(var i = 0; i< categories.length; i++){
                var cats = categories[i];
                if(cats.is_visible){
                    // imposto la prima come category_space di default
                    if($scope.favCat == 0 && cats.is_visible){
                        $scope.favCat = cats.category_space;
                    }

                    // todo aggiungi slug
                    var filter_name = cats.name;//'catIndex',
                    var check = 'id';
                    var rule = {key:'category_list',name:filter_name,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:cats.entities,includeCondition:{value:{category_space:cats.category_space},property:'categories'}};
                    // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
                    $scope.filters[filter_name] = {list: cats.categories, toggle:1, iconSwitcher:true, label:filter_name,check:check,name:filter_name,category_space:cats.category_space,visible:cats.is_visible, color:cats.color};
                    // bug init i = 1
                    for(j = 0; j < $scope.filters[filter_name].list.length; j++){
                        $scope.filters[filter_name].list[j].visible = true;
                        $scope.filters[filter_name].list[j].key = $scope.filters[filter_name].list[j].id;
                        rule.values.push($scope.filters[filter_name].list[j].id);
                    }
                    $scope.filterConditions.push(rule);
                }
            }
            // init filtro per livelli in area
            // es. level: 0, level:1, etc....
            if( $scope.config.map.area && levels.check && levels.list.length > 1){
                // filtri livello
                var checkL = 'level',
                    filter_nameL = 'Levels';
                // costruisco regola per gli entity_type
                var rule = {key:checkL,name:filter_nameL,values:[],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:typesList,
                    callbackPush:function(value){
                        selectGeoJSONLevel(value);
                    },
                    callbackPop:function(value){
                        //nextGeoJSONLevel(value);
                    }
                };
                // toggle: tiene lo stato di visualizzazione: 1 > filtro attivo, 2 > vedo tutto, 3 > non vedo nulla
                $scope.filters[filter_nameL] = {list: levels.list, toggle:1, iconSwitcher:false, label:'Level',check:checkL,name:filter_nameL, visible:true};
                for(var i = 0; i < $scope.filters[filter_nameL].list.length; i++){
                    $scope.filters[filter_nameL].list[i].visible = true;
                    rule.values.push($scope.filters[filter_nameL].list[i].key);
                }
                $scope.filterConditions.push(rule);
                $log.debug("MapCtrl, init filtro level: ",$scope.filters[filter_nameL],rule);
            }




        }

        function showLoadingScreen(text){
            if(!text || text === 'undefined'){
                text = $filter('translate')('LOADING');
            }

            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }



        function clickToAdd(){
            MapService.getCenter().then(
                function(center){
                    var entityDetails = {lat: center.lat, lng:center.lng, zoom_level: center.zoom, id:null};
                    $state.go('app.editor', {lat: center.lat, lng:center.lng, zoom_level: center.zoom, id:null});
                },
                function(err){$log.error("MapCtrl, clickToAdd, MapService.getCenter, error ",err);}
            );
        };



        // rimuove un marker
        function deleteMarker(id){

            var index = searchMarkerIndex(id);
            //$log.debug("delete marker ",index,$scope.map.markers[index]);
            if(index > -1){
                delete $scope.map.markers[index];
                return true;
            }

            return false;
        }


        // aggiorna i markers della mappa
        function updateMarker(id){

            if(id < 1){
                return false;
            }

            MapService.get(id).then(
                function(marker){
                    $log.debug("MapCtrl, updateMarker, entityFactory.get, refresh marker ",id,marker);
                    var index = searchMarkerIndex(marker.id);
                    if(index > -1){
                        $scope.map.markers[index] = marker;
                    } else {
                        $scope.map.markers.push(marker);
                    }
                },
                function(err){$log.error("MapCtrl, updateMarker, entityFactory.get, errore ",err);}

            );
        }


        // cerca marker nella lista locale
        function searchMarkerIndex(id){
            var index = $scope.map.markers.map(function(e){return e.id}).indexOf(id);
            if(index > -1){
                return index;
            }
            return -1
        }



        // cambio visibilita' mappa
        // gestore livelli mappa
        // si comanda dal fitro categorie
        function changeVisibility(clickedItem){
            //changeMod to Edit: tutti off per la edit
            if(clickedItem===false){
                for(var el in $scope.map.layers.overlays){
                    $log.debug("spengo livello ",el);
                    $scope.map.layers.overlays[el].visible = false;
                }
            }
            //changeMod to View: tutti on per la view
            else if(clickedItem===true){
                for(var el1 in $scope.map.layers.overlays){
                    $scope.map.layers.overlays[el1].visible = true;
                }
            }
            //filtro all: attiva tutti i layer categorie (ed anche all!)
            else if(clickedItem===0 && !$scope.map.layers.overlays[0].visible){
                for(var el2 in self.map.layers.overlays){
                    $scope.map.layers.overlays[el2].visible = true;
                }
            }
            //filtro all: disattiva tutti i layer categorie
            else if(clickedItem===0 && $scope.map.layers.overlays[0].visible){
                for(var el3 in self.map.layers.overlays){
                    $scope.map.layers.overlays[el3].visible = false;
                }
            }
            else if($scope.map.layers.overlays[clickedItem].visible){
                $scope.map.layers.overlays[clickedItem].visible = false;
            }
            else {
                $scope.map.layers.overlays[clickedItem].visible = true;
            }
        };


        // funzione di cambio di modalita' della mappa
        function changeMode(mode){
            switch(mode){
                case 'edit':
                    $scope.editMode = true;
                    changeVisibility(false);
                    break;
                default:
                    $scope.editMode = false;
                    changeVisibility(true);
            }
            MapService.changeMode(mode);
            // changeVisibility(!$scope.editMode);
        }


        // centra su entita'
        function locateEntity(entityId){
            var index = searchMarkerIndex(entityId);
            // se il marker esiste
            if(index > -1){
                var marker = $scope.map.markers[index];
                $log.debug("Location: ", marker);
                /*self.map.center.lat = marker.lat;
                 self.map.center.lng = marker.lng,
                 self.map.center.zoom = $rootScope.info_position.zoom;*/
                var params = {lat:marker.lat,lng:marker.lng};//,zoom:parseInt(config.map.zoom_create)};
                locate(params);
                //$log.debug("nuova posizione", self.map.center);
            }else{
                //altrimenti invoco una get
                //$log.debug("chiamo per :", entityId);
                MapService.get(entityId).then(
                    function(marker){
                        // localizzo su marker
                        $log.debug("Location: ", marker);
                        /*self.map.center.lat = marker.lat;
                         self.map.center.lng = marker.lng,
                         self.map.center.zoom = $rootScope.info_position.zoom*/
                        var params = {lat:marker.lat,lng:marker.lng};//,zoom:parseInt(config.map.zoom_create)};
                        locate(params);
                        //$log.debug("nuova posizione", $scope.map.center);
                    },
                    function(err){$log.debug("Location error: ",err);}
                );
            }
        }



        // filtro i geoJSON per property (in properties) = value
        // es. level = 1
        function selectGeoJSONData(prop,value){
            $scope.geojson.data = $filter('filter')($scope.config.map.area.data.features,filterGeoJSON(prop,value));

        }
        function nextGeoJSONLevel(value){
            if($scope.geojson && $scope.geojson.data && $scope.geojson.levels){
                var index = $scope.geojson.levels.map(function(e){return e.key;}).indexOf(value);
                var newIndex = (index + 1) %$scope.geojson.levels.length;
                var newVal = $scope.geojson.levels[newIndex].key
                selectGeoJSONLevel(newVal);
            }
        }
        function selectGeoJSONLevel(value){
            if($scope.geojson && $scope.geojson.data && $scope.config.map.area && $scope.config.map.area.data){
                //$scope.$apply(function(){
                $scope.geojson.data = $filter('filter')($scope.config.map.area.data.features,filterGeoJSON('level',value));

                $scope.$broadcast('timeline.groups.setgroup',{group:value});
                //});
                $scope.$apply(function(){markerDisabler('level',value);});

            }
        }
        function filterGeoJSON(prop,value){
            return function (feature){
                if((!feature.properties[prop] && feature.properties[prop] !== 0) || feature.properties[prop] == value){
                    return true;
                }
                return false;
            }
        }

        function markerDisabler(prop,value){
            var disabledColor = $scope.config.design.colors[$scope.config.design.disabled_color];
            //$log.debug("develop ",value,$scope.favCat);
            for(var k in $scope.markersFiltered){

                if($scope.markersFiltered[k][prop] !== value){
                    var icon = angular.copy($scope.markersFiltered[k].icons[$scope.favCat]? $scope.markersFiltered[k].icons[$scope.favCat] : $scope.markersFiltered[k].icon);

                    var disabledHtml = '<div class="pin-marker" style="background-color:'+ disabledColor +'"></div>'+
                        '<div class="icon-box"><i class="icon ' + icon.icon + '"></i></div>';
                    icon.html = disabledHtml;
                    icon.color = disabledColor;
                    icon.index = $scope.config.design.disabled_color;
                    $scope.markersFiltered[k].icon = icon;
                }else{
                    $scope.markersFiltered[k].icon = $scope.markersFiltered[k].icons[$scope.favCat] ? $scope.markersFiltered[k].icons[$scope.favCat] : $scope.markersFiltered[k].icons[0];
                }
            }
        }



        // toggle dei parametri search custom

        function check4customFilters(e,old){
            var filters = config.map.filters;
            for(var i = 0 ; i < filters.length; i ++){
                var param = filters[i].search_param;
                var filter = filters[i];
                var index = $scope.filterConditions.map(function(e){return e.name}).indexOf(filter.key);
                if(!filter.skip){
                    if(e[param]){//trovato un parametro
                        // filtro per per la property
                        var rule = {key:filter.property,name:filter.key,values:[e[param]],mandatory:{condition:true,values:false},equal:false,excludeRule:false,excludeProperty:false,includeTypes:config.types.list.map(function(e){return e.key;})};

                        if(index > -1){
                            $scope.filterConditions[index] = rule;
                        }else{
                            $scope.filterConditions.push(rule);
                        }
                    }else{
                        // rimuovo filtro per la property
                        var index = $scope.filterConditions.map(function(e){return e.name}).indexOf(filter.key);
                        if(index > -1 ){
                            $scope.filterConditions.splice(index,1);
                        }
                    }
                }
            }

        }




        // recupero il layer geoJson
        function getData(){
//            interni 22 - 20 
//            building 19 - 18
//            city block 17 - 16
//            quartieri 15 - 15
//            borghi 14 - 13
//            circoscrizioni 12 - 11
//            citta 10 - 8
//            provincia 7 - 6

            //$log.debug('update geometries ',checkGeometries);
            // se ho le geometrie disabilitate
            if(!checkGeometries)
                return;

            var max = config.map.min_zoom_geometry_layer;
            leafletData.getMap("mymap").then(
                function(map) {
                    //$log.debug('check map',map);
                    var bounds = map.getBounds();
                    var zoom = map.getZoom();
                    var sw = {lat:bounds._southWest.lat,lng:bounds._southWest.lng};
                    var ne = {lat:bounds._northEast.lat,lng:bounds._northEast.lng};
                    //$log.debug('check map parameters',max,zoom,bounds);
                    if(max <= zoom){
                        indexingFactory.get(zoom,sw,ne).then(
                            function(response){
                                //$log.debug("indexFactory.get, response",response);
                                $scope.geojson.data = response;

                            },
                            function(response){
                                $log.error(response);
                            }
                        );
                    }else{
                        $scope.geojson.data.features = [];
                    }
                },
                function(response){
                    $log.error("MapService, getMapBounds, errore: ",response);
                });
        }


        // controllo parametro embed per setup del viewer
        function check4embed(e){
            // se il parametro e' settato
            if(e.embed){
                $log.debug('modalita embed',e.embed);
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
                if($scope.map.center.lat != e.lat || e.lng != $scope.map.center.lng || e.zoom != $scope.map.center.zoom){
                    locate(e);
                }
            }

        }
        // controllo il parametro entity
        function check4entity(e,old){
            if(e.entity){
                //if((!old.place && e.place) || (old && e.place != parseInt(old.place))){
                // placeModal da aprire
                $log.debug("trovato parametro entity, devo aprire una modal: ",e.entity);
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

            $log.debug('check4search, param q', e.q, old);
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
            entityFactory.get(e.groups).then(
                function(results){
                    $log.debug('get group',results)
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
        }


    }]).run(function(MapService, myConfig, $timeout, $rootScope, $log){

    self.map = MapService.initMap();

    // inizializzazione poller mappa
    var RELOAD_TIME = config.behaviour.bbox_reload_time;
    var timer = false;
    var polling = function (){
        $timeout.cancel(timer);
        $rootScope.$broadcast("leafletDirectiveMap.mymap.moveend");
        timer = $timeout(function() {
            $log.debug("polling!");
            polling();
        },RELOAD_TIME);
    };
    polling();
});
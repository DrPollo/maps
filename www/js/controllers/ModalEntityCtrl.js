angular.module('firstlife.controllers')

    .controller('ModalEntityCtrl', ['$scope', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup','$log', '$filter', 'myConfig', 'MapService', 'MemoryFactory', 'AuthService', function($scope, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $log,$filter, myConfig, MapService, MemoryFactory, AuthService) { 

        $scope.config = myConfig;
        $scope.infoPlace = {};
        $scope.now = new Date();

        var consoleCheck = false;
        var hide = null;


        // visualizzazione web o mobile?
        $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());


        // se lascio mapCtrl
        $scope.$on('ModalEntityCtrl', function(e){
            if(!e.ModalEntityCtrlPrevented){
                e.ModalEntityCtrlPrevented = true;
                $scope.closeModal();
            }
        });

        $scope.$on("markerClick", function(event,args){
            if (!event.markerClickPrevented) {
                event.markerClickPrevented = true;
                if(args.marker){
                    $scope.showMCardPlace(args.marker);
                }
            }
        }); 

        $scope.$on("markerClickClose", function(event,args){
            if (!event.markerClickClosePrevented) {
                event.markerClickClose=true;
                $scope.closeModal();
            }
        }); 

        $scope.$on('$destroy', function(e) {
            if(!e.destroyModalDestroyPrevented){
                e.destroyModalDestroyPrevented = true;
                $log.debug('destroy modal');
                delete $scope;
            }
        });

        //modal info sul place
        $scope.showMCardPlace = function(marker){  
            // inizializzo la maschera dei permessi per l'utente per il marker attuale
            initPerms(marker.user);
            // recupero il tipo e lo metto dentro $scope.currentType
            initTypeChecks(marker.entity_type);

            $log.debug('check hide!',hide,marker);
            if(!hide){
                $log.debug('init hide');
                hide = $scope.$on('modal.hidden', function(e) {
                    //segnalo la chiusura della modal
                    if($scope.infoPlace.modal && !e.modalHiddenPrevented){
                        e.modalHiddenPrevented = true;

                        //deregistro il listner per la hide
                        $log.debug('check hide listner!',hide);
                        hide();
                        hide = null;
                        chiudoModal();
                    }
                });
            }

            $log.log("marker da visualizzare",marker);
            // se la modal e' gia' aperta cambio solo il contenuto
            // to do incapsulare il codice in una closeModal con then
            if($scope.infoPlace.modal){
                // la modal esiste
                $scope.infoPlace.modal.show();
                changeModal(marker.id);
            }else{
                // la modal non esiste, la creo
                $scope.infoPlace = {};
                $scope.infoPlace.marker = angular.copy(marker);
                $scope.infoPlace.modify = false;    
                $scope.infoPlace.dataForm = {};

                $ionicModal.fromTemplateUrl('templates/modals/cardPlace.html', {
                    scope: $scope,
                    animation: 'fade-in',//'slide-in-up',
                    backdropClickToClose : true,
                    hardwareBackButtonClose : true
                }).then(function(modal) {
                    $log.debug("infoPlace, apro modal modal: ", modal);
                    $scope.infoPlace.modal = modal;
                    $scope.openModalPlace();
                    // parte l'update dopo 1 secondo
                    $ionicLoading.show();
                    $scope.$emit('openPlaceModal', {marker: marker.id});
                    updateDetails($scope.infoPlace.marker.id);
                });  
            }
            $scope.openModalPlace = function() {
                $scope.infoPlace.modal.show();
                // creo il menu per la modal
                $scope.showPopoverMenu();
            };

            $scope.closeModal = function() {
                chiudoModal(); 
            };
        };

        //        var hide = $scope.$on('modal.hidden', function(e) {
        //                //segnalo la chiusura della modal
        //                if($scope.infoPlace.modal && !e.modalHiddenPrevented){
        //                    e.modalHiddenPrevented = true;
        //                    //deregistro il listner per la hide
        //                    hide();
        //                    chiudoModal();
        //                }
        //            });
        //        

        //action sheet init-info sul place
        $scope.showASDeletedPlace = function(placeId){
            var title="";
            if(placeId===-1)
                title = $filter('translate')('ERROR_CANCEL');
            else
                title = $filter('translate')('SUCCESS_CANCEL');

            var hideSheet = $ionicActionSheet.show({
                titleText: title,
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                    $log.debug("Deleted place cancelled: "+placeId);
                }
            });
            if(consoleCheck)console.log("actionSheet", hideSheet);
            // to do serve per il routing, chiudo l'action sheet con il pulsante back
        };


        // menu popover della modals
        $scope.showPopoverMenu = function (){

            $ionicPopover.fromTemplateUrl('templates/map-ui-template/ModalPopoverMenu.html', {
                scope: $scope,
            }).then(function(popover) {
                $scope.popover = popover;
            });

            $scope.openPopover = function($event) {
                $scope.popover.show($event);
            };
            $scope.closePopover = function() {
                $scope.popover.hide();
            };

            $scope.removeButtonPopover = function (){
                var markerId = $scope.infoPlace.marker;
                if(consoleCheck)console.log("rimuovo il place ", markerId);
                $scope.closePopover();
                $scope.remove(markerId);
            };
            $scope.updateButtonPopover = function (){
                var marker = $scope.infoPlace.marker;
                $scope.closePopover();
                $scope.updateEntity(marker);
            };

            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });
        };

        //action sheet per creazione place/evento
        $scope.remove = function(marker){
            if(consoleCheck)console.log("ModalPlaceController, showASRemove, id: ",marker.id);

            $scope.showConfirm = function() {
                var confirmPopup = $ionicPopup.confirm({
                    title: $filter('translate')('DELETE'),
                    template: $filter('translate')('DELETE_ASK')
                });

                confirmPopup.then(
                    function(res) {
                        if(res) {
                            MapService.removeMarker(marker.id).then(
                                // success function 
                                function(response) {
                                    $scope.showASDeletedPlace(marker.id);
                                    $scope.$emit("deleteMarker",{id:marker.id});
                                    $scope.closeModal();
                                },
                                // error function 
                                function(error) {
                                    $scope.showASDeletedPlace(-1);
                                    $log.error("Failed to get required marker, result is " + error); 
                                    //$scope.closeModal();
                                    
                                });
                        } else {
                            $log.log('cancellazione annullata');
                        }
                    });
            };

            $scope.showConfirm();

        };

        //action sheet init-info sul place
        $scope.showASDeleted = function(entityId){
            var title="";
            if(entityId===-1)
                title = $filter('translate')('ERROR_CANCEL');
            else
                title = $filter('translate')('SUCCESS_CANCEL');

            var hideSheet = $ionicActionSheet.show({
                titleText: title,
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                }
            });
        };

        //Update marker in local/server
        $scope.updateEntity = function(marker){
            var params = {lat:marker.lat, lng:marker.lng, id:marker.id};
            $scope.$emit("startEditing",params);

            //fai uscire la wizardPlace con placeholder dati vecchi
            $scope.closeModal();
        }

        /*
         * Add child marker/place
         */
        $scope.addChildEntity = function(childType,rel){
            var entity_type = childType.slug;
            var entity_key = childType.key;
            var relations = $scope.currentType.relations;
            $log.debug('check add children ',entity_key,entity_type,rel,relations);

            //logica add child entity
            var skip = false;
            // se l'entita' e' bounded vuol dire che deve avere la posizione del padre
            if(relations[entity_key].bounded){
                // faccio saltare il riposizionamento
                skip = true;
            }

            $log.debug('add child ',entity_type,rel);
            if(!entity_type)
                type = parent_type;

            var marker = $scope.infoPlace.marker,
                params = {lat:marker.lat, lng:marker.lng, entity_type:entity_type,skip:skip};
            // questa notazione perche' rel e' una variabile
            params[rel] = marker.id;
            $scope.$emit("startEditing",params);

            //fai uscire la wizardPlace con placeholder dati vecchi
            $scope.closeModal();
        }


        /*
         * funzioni private
         */

        function updateDetails(entityId){
            // richiedo i dettagli del marker
            MapService.getDetails(entityId).then(
                function(marker){
                    angular.extend($scope.infoPlace.marker,marker);
                    $ionicLoading.hide();
                },
                function(err){
                    $ionicLoading.hide();
                    showAlert();
                    //todo allert per indicare il problema di caricamento
                    $log.error("errore caricamento marker modal place: ",err);
                }
            );
        }

        function changeModal(marker){
            MapService.getDetails(marker).then(
                function(marker){
                    $scope.infoPlace.marker = angular.copy(marker);
                    $scope.$emit('openPlaceModal', {marker: marker.id});
                },
                function(err){
                    $log.error("changeModal, errore ",err);
                    showAlert();
                }
            );
        }

        function chiudoModal(){
            // distruggo il menu popover
            if($scope.popover){
                $scope.popover.hide();
                //$scope.popover.remove();
            }
            if($scope.infoPlace.modal)
                $scope.infoPlace.modal.remove();

            $scope.$emit("closePlaceModal");
            $log.debug('check closePlaceModal');
            delete $scope.infoPlace.modal;
            //deregistro il listner per la hide
            hide();
        }


        function showLoadingScreen(text){
            if(!text || text === 'undefined'){
                text = 'Operazione in corso...';
            }

            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }

        // An alert dialog
        function showAlert (content) {
            if(!content){
                content = {};
            }
            if(!content.title){
                content.title = $filter('translate')('ERROR');
            }
            if(!content.text){
                content.text = $filter('translate')('UNKNOWN_ERROR');
            }
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });
        };


        function initPerms (author){
            if(!$scope.user)
                $scope.user = MemoryFactory.readUser();
            // se l'utente non e' definito
            if(!$scope.user)
                return false;

            var source = 'others';
            if(author == $scope.user.id)
                source = 'self';

            $scope.checkPerms = AuthService.checkPerms(source);
            return $scope.perms;
        }


        function initTypeChecks (entity_type){
            var index = $scope.config.types.list.map(function(e){return e.key}).indexOf(entity_type);
            // recupero il current type
            $scope.currentType = $scope.config.types.list[index];
        }


    }]);
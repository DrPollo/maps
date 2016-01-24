angular.module('firstlife.controllers')

    .controller('ModalPlaceCtrl', ['$scope', '$state', '$q', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup','$timeout', 'myConfig', 'ImageService', 'entityFactory', 'MapService', 'MemoryFactory', 'AuthFactory', 'CommentsFactory', function($scope, $state, $q, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, myConfig, ImageService, entityFactory, MapService, MemoryFactory, AuthFactory, CommentsFactory) { 

        $scope.config = myConfig;
        $scope.infoPlace = {};
        $scope.now = new Date();
        $scope.checkPerms = function(action){
            
            $scope.user = MemoryFactory.readUser();
            var author = $scope.infoPlace.marker.user;

            // se l'utente non e' definito
            if(!$scope.user)
                return false;

            var source = 'others';
            if(author == $scope.user.id)
                source = 'self';
            
            var check = AuthFactory.checkPerms(action,source);
            //console.log("ModalPlaceCtrl, checkPerms, user ",$scope.user,$scope.user.id,author,action,check);
            return check;
        }
        
        // visualizzazione web o mobile?
        $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
        
        $scope.$on("markerClick", function(event,args){
           
            if (!event.defaultPrevented) {
                //console.log("marker click in placeCtrl", event, args);
                
                event.defaultPrevented = true;
                if(args.marker){
                    $scope.showMCardPlace(args.marker);
                }
            }
        }); 

        $scope.$on("markerClickClose", function(event,args){

            if (!event.defaultPrevented) {
                //console.log("marker click in ModalPlaceCtrl", event, args);

                if($scope.infoPlace.modal){
                    // to do da integrare con il controllo delle immagini da salvare
                    $scope.closeModalPlace();
                }
                event.preventDefault();
            }
        }); 

        //modal info sul place
        $scope.showMCardPlace = function(marker){  
            
             
            
            console.log("marker da visualizzare",marker);
            // se la modal e' gia' aperta cambio solo il contenuto
            // to do incapsulare il codice in una closeModal con then
            if($scope.infoPlace.modal){chiudoModal();}
            //console.log("showMCardPlace e la modal e' da creare! ",marker);
            $scope.infoPlace = {};
            $scope.infoPlace.marker = angular.copy(marker);
            //console.log("infoPlace, prima di creare la modal: ", $scope.infoPlace.marker);
            $scope.infoPlace.modify = false;    
            $scope.infoPlace.dataForm = {};

            
            
            $ionicModal.fromTemplateUrl('templates/form/cardPlace.html', {
                scope: $scope,
                animation: 'fade-in',//'slide-in-up',
                backdropClickToClose : true,
                hardwareBackButtonClose : true
            }).then(function(modal) {
                $scope.infoPlace.modal = modal;
                $scope.openModalPlace();
                // parte l'update dopo 1 secondo
                $ionicLoading.show({
                    content: 'Apertura in corso...',
                    animation: 'fade-in',
                    noBackdrop : true,
                    maxWidth: 50,
                    showDelay: 0
                });
                $timeout(function(){
                    // aggiorno i dettagli
                    updateInfoPlaceDetails(marker.id);
                    $scope.$emit('openPlaceModal', {marker: marker.id});
                },1000);
                
            });  

            $scope.openModalPlace = function() {
                $scope.infoPlace.modal.show();
                // creo il menu per la modal
                $scope.showPopoverMenu();
            };

            $scope.closeModalPlace = function() {

                // chiedo all'utente se vuole cancellare le immagini non salvate
                if($scope.pendingImages){
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Immagini non salvate',
                        template: 'Le modifiche verranno perse, uscire ugualmente?  ',
                        cancelText: 'Annulla', // String (default: 'Cancel'). The text of the Cancel button.
                        //cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
                        okText: 'Esci', // String (default: 'OK'). The text of the OK button.
                        okType: '', // String (default: 'button-positive'). The type of the OK button.
                    });
                    confirmPopup.then(function(reply){
                        //console.log("cosa vuole fare l'utente? Esci: "+ reply);
                        //utente vuole perdere le immagini caricate
                        if(reply){
                            //distruggo le foto in attesa di essere salvate
                            $scope.resetPhoto();
                            // chiudo la modal
                            chiudoModal(); 
                        }

                    });
                }else{ // se non ho immagini non salvate
                    chiudoModal();
                }
            };

            function chiudoModal(){
                // distruggo il menu popover
                if($scope.popover){
                    $scope.popover.hide();
                    $scope.popover.remove();
                }
                if($scope.infoPlace.modal){
                    // nascondo la modal
                    $scope.infoPlace.modal.hide();
                    // distruggo la modal
                    $scope.infoPlace.modal.remove();
                    // rimuovo il campo modal
                    delete $scope.infoPlace.modal;
                    // invio un segnale di chiusura modal
                    //delete $scope.infoPlace.modal;
                    //$scope.$emit("closePlaceModal");
                }
            }

            $scope.$on('$destroy', function() {

                if($scope.infoPlace.modal)
                    $scope.infoPlace.modal.remove();
                if($scope.popover)
                    $scope.popover.remove();
            });
            $scope.$on('modal.hidden', function() {
                $scope.$emit("closePlaceModal");
            });
            $scope.infoPlace.changeMode = function(){
                if($scope.infoPlace.modify)
                    $scope.infoPlace.modify=false;
                else
                    $scope.infoPlace.modify=true;
            };
            //} // fine caso in cui la modal e' da creare

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
                console.log("rimuovo il place ", markerId);
                $scope.closePopover();
                $scope.removePlace(markerId);
            };
            $scope.updateButtonPopover = function (){
                var marker = $scope.infoPlace.marker;
                $scope.closePopover();
                $scope.updatePlace(marker);
            };

            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.popover.remove();
            });
            // Execute action on hide popover
            $scope.$on('popover.hidden', function() {
                // Execute action
            });
            // Execute action on remove popover
            $scope.$on('popover.removed', function() {
                // Execute action
            });
        };



        //action sheet init-info sul place
        $scope.showASTitlePlace = function(markerId){

            var hideSheet = $ionicActionSheet.show({
                titleText: 'In questo luogo...',
                buttons: [
                    { text: '<i class="icon ion-bookmark">Place</i>' }
                ],
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    if(index===0){
                        $scope.showMCardPlace(markerId);
                    }
                    hideSheet();

                }
            });

            //console.log("actionSheet", hideSheet);
        };



        //action sheet per creazione place/evento
        $scope.showASRemove = function(marker){
            console.log("ModalPlaceController, showASRemove, id: ",marker.id);
            var hideSheet = $ionicActionSheet.show({
                titleText: 'Vuoi davvero cancellare questo luogo?',
                buttons: [
                    { text: '<i class="icon ion-close-circled"></i>' },
                    { text: '<i class="icon ion-checkmark-circled"></i>' },
                ],
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    //console.log('BUTTON CLICKED', index);
                    ///this.hide();
                    if(index===1){
                        showLoadingScreen("Cancellazione in corso...");
                        //$scope.showMWizardPlace();
                        MapService.removeMarker(marker)
                            .then(
                            // success function 
                            function(resp) {
                                hideLoadingScreen();
                                //console.log("Marker da eliminare...", $scope.map.markers[marker.id]);
                                delete $scope.map.markers[marker.id];
                                //console.log("Marker eliminato!", $scope.map.markers[marker.id]);
                                $scope.closeModalPlace();
                                $scope.showASDeletedPlace(marker.id);

                            },
                            // error function 
                            function(error) {
                                hideLoadingScreen();
                                console.log("Failed to get required marker, result is " + error); 
                                $scope.closeModalPlace();
                                $scope.showASDeletedPlace(-1);
                            });
                    }
                    hideSheet();

                    //return index;
                }
            });
            //console.log("actionSheet", hideSheet);
            // to do serve per il routing, chiudo l'action sheet con il pulsante back
        };

        //action sheet init-info sul place
        $scope.showASDeletedPlace = function(placeId){
            var title="";
            if(placeId===-1)
                title = "Cancellazione fallita: per favore, riprova in seguito!";
            else
                title = "Cancellazione eseguita correttamente!";

            var hideSheet = $ionicActionSheet.show({
                titleText: title,
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                    console.log("Deleted place cancelled: "+placeId);
                }
            });
            //console.log("actionSheet", hideSheet);
            // to do serve per il routing, chiudo l'action sheet con il pulsante back
        };



        /*
         * Remove marker/place in local/server
         */
        $scope.removePlace = function(marker){
            //fai uscire la test edit
            $scope.showASRemove(marker);
        }

        /*
         * Update marker/place in local/server
         */
        $scope.updatePlace = function(marker){
            //fai uscire la wizardPlace con placeholder dati vecchi
            console.log("ModalPlaceCtrl, updatePlace, marker: ", marker);
            $scope.closeModalPlace();
            $state.go('app.editor', {lat:marker.lat, lng:marker.lng, id:marker.id});

        }

        /*
         * Add child marker/place
         */
        $scope.addChildEntity = function(entity_type,rel){
            if(!entity_type)
                type = parent_type;

            var marker = $scope.infoPlace.marker,
                params = {lat:marker.lat, lng:marker.lng, entity_type:entity_type};
            // questa notazione perche' rel e' una variabile
            params[rel]=marker.id;

            //fai uscire la wizardPlace con placeholder dati vecchi
            $scope.closeModalPlace();
            //console.log("ModalPlaceCtrl, check creazione entita' subordinata di tipo ",entity_type," con relazione ",rel," con ",marker.id );
            $state.go('app.editor', params);

        }

        $scope.deleteComment = function(commentId){
            showLoadingScreen();
            CommentsFactory.delete(commentId).then(
                function(response){
                    var index = $scope.infoPlace.marker.comments.map(function(e){return e.comment_id;}).indexOf(commentId);
                    $scope.infoPlace.marker.comments.splice(index,1);
                    hideLoadingScreen();
                    //console.log("ModalPlaceCtrl, deleteComment, response: ",response);
                },
                function(response){
                    hideLoadingScreen();
                    console.log("ModalPlaceCtrl, deleteComment, error: ",response);
                }
            );
        };
        
        $scope.isEmpty = function (obj) {
            if(obj && ( 
                (Array.isArray(obj) && obj.length > 0) || 
                (angular.isObject(obj) && !angular.equals({}, obj) ) || 
                (angular.isString(obj) && obj != '') ||
                (angular.isNumber(obj))
            ) ) {
                //console.log("Is empty ",obj, "? false");
                return false;
            }
            //console.log("Is empty ",obj, "? true");
            return true;

        }

        
        $scope.openCommentBox = function(){
            $scope.infoPlace.commento = "";
            //console.log("init commento: ",$scope.infoPlace.commento);
            $ionicModal.fromTemplateUrl('templates/map-ui-template/CommentBox.html', {
                scope: $scope,
                animation: 'fade-in',//'slide-in-up',
                backdropClickToClose : true,
                hardwareBackButtonClose : true
            }).then(function(modal) {
                $scope.infoPlace.commentBox = modal;
                $scope.infoPlace.commentBox.show();
                
                $scope.closeCommentBox = function(){$scope.infoPlace.commentBox.remove();};
                $scope.saveComment = function(){
                    console.log("Salvo il commento: ",$scope.infoPlace.commento);
                    addComment($scope.infoPlace.commento);
                };
            });  

        }
        
        function addComment(message){
            var id = $scope.infoPlace.marker.id;
            showLoadingScreen();
            CommentsFactory.add(id,message).then(
                function(response){
                    //console.log("ModalPlaceCtrl, addComment, response: ",response);
                    $scope.infoPlace.marker.comments.unshift({message:$scope.infoPlace.commento,display_name:$scope.displayName,timestamp:new Date(),user_id:$scope.user.id});
                    hideLoadingScreen();
                    $scope.closeCommentBox();
                },
                function(response){
                    console.log("ModalPlaceCtrl, addComment, error: ",error);
                    hideLoadingScreen();
                    showAlert();
                }
            );
        
        }
        
        
        /*
         * funzioni private
         */

        function updateInfoPlaceDetails(entityId){
            //console.log("ModalPlaceController, updateInfoPlaceDetails: ",entityId);
            // richiedo i dettagli del marker
            MapService.getDetails(entityId).then(
                function(marker){
                    angular.extend($scope.infoPlace.marker,marker);
                    // carico figli e padre del marker, se ce ne sono
                    loadSibillings(marker);
                    loadComments(marker);
                    // mando il messaggio per il check delle immagini a ImagesCtrl
                    $scope.$broadcast("checkImagePlaceModal",{marker:marker});
                    $ionicLoading.hide();
                },
                function(err){
                    $ionicLoading.hide();
                    //todo allert per indicare il problema di caricamento
                    console.log("errore caricamento marker modal place: ",err);
                }
            );

        }

        function loadSibillings (marker){
            $scope.infoPlace.marker.relations = {};
            
            //console.log("ModalPlaceCtrl, loadSibillings per il marker ", marker);
            // caricamento dei child
            var childrenRelations = $scope.config.types.child_relations[marker.entity_type];
            var children = {};
            for(key in childrenRelations){
                var childRel = childrenRelations[key];
                var c = MapService.searchFor(marker.id, childRel.field);
                //console.log("Cerco per il campo ",childRel.field," il marker con valore ", marker.id, " risultato ",c);
                if(!$scope.isEmpty(c)){
                    children[key] = angular.copy(childRel);
                    children[key].list = c;
                }
            }
            console.log("ModalPlaceCtrl, loadSibillings, costruzione dei figli ", children);
            $scope.infoPlace.marker.relations.children = children;
            
            // caricamento dei parent
            var parentsRelations = $scope.config.types.parent_relations[marker.entity_type];
            var parents = {};
            for(key in parentsRelations){
                var parentRel = parentsRelations[key];
                console.log("check campo per un padre ",parentRel, parentRel.field,marker[parentRel.field]);
                if(!$scope.isEmpty(marker[parentRel.field])){
                    var p = MapService.searchFor(marker[parentRel.field], 'id');
                    //console.log("Cerco per il campo id il marker con valore ", marker[parentRel.filed], " risultato ",p);
                    parents[key] = angular.copy(parentRel);
                    parents[key].list = p;
                }
            }
            console.log("ModalPlaceCtrl, loadSibillings, costruzione dei padri ", parents);
            $scope.infoPlace.marker.relations.parents = parents;
            
            console.log("ModalPlaceCtrl, loadSibillings, sibillings: ", $scope.infoPlace.marker.relations);
        }

        
        // richiedo i commenti per il marker
        function loadComments(marker){
            $scope.infoPlace.marker.comments = [];
            console.log("ModalPlaceCtrl, loadComments per il marker ", marker);
            CommentsFactory.get(marker.id).then(
                function(response){
                    console.log("ModalPlaceCtrl, loadComments, CommentsFactory.get, response: ",response);
                    $scope.infoPlace.marker.comments = response;
                },
                function(response){
                    console.log("ModalPlaceCtrl, loadComments, CommentsFactory.get, error: ",response);
                }
            );
            console.log("ModalPlaceCtrl, loadComments, sibillings: ", $scope.infoPlace.marker.comments);
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
                content.title = 'Errore';
            }
            if(!content.text){
                content.text = "L'operazione non &egrave; andata a buon fine.";
            }
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                console.log('Allert con contenuto: ',content);
            });
        };

    }]);
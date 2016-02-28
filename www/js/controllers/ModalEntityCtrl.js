angular.module('firstlife.controllers')

    .controller('ModalEntityCtrl', ['$scope', '$rootScope', '$state', '$q', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup','$timeout', 'myConfig', 'ImageService', 'entityFactory', 'MapService', 'MemoryFactory', 'AuthFactory', 'CommentsFactory', function($scope, $rootScope, $state, $q, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, myConfig, ImageService, entityFactory, MapService, MemoryFactory, AuthFactory, CommentsFactory) { 

        $scope.config = myConfig;
        $scope.infoPlace = {};
        $scope.now = new Date();

        var consoleCheck = true;
        var MODAL_RELOAD_TIME = $scope.config.behaviour.modal_relaod_time;
        // variabile dove inserisco il timer per il polling
        var timer = false;
        // funzione di polling
        var polling = function(id){ 
            $timeout.cancel(timer);
            updateInfoPlaceDetails(id);
            timer = $timeout(function(){
                // aggiorno i dettagli
                console.log("modal polling!");
                polling(id);
            },MODAL_RELOAD_TIME);
        };

        // visualizzazione web o mobile?
        $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());

        $scope.$on("markerClick", function(event,args){

            if (!event.defaultPrevented) {
                if(consoleCheck)console.log("marker click in placeCtrl", event, args);

                event.defaultPrevented = true;
                if(args.marker){
                    $scope.showMCardPlace(args.marker);
                }
                event.preventDefault();
            }
        }); 

        $scope.$on("markerClickClose", function(event,args){

            if (!event.defaultPrevented) {
                if(consoleCheck)console.log("marker click in ModalEntityCtrl", event, args);

                if($scope.infoPlace.modal){
                    // to do da integrare con il controllo delle immagini da salvare
                    $scope.closeModalPlace();
                }
                event.preventDefault();
            }
        }); 

        $scope.$on('modal.hidden', function(event) {
            if(!event.isDefaultPrevented){
                console.log("modal hidden",event);
                // cancello il polling
                $timeout.cancel(timer);
                event.defaultprevented = true; 
                event.preventDefault();
            }
        });

        //modal info sul place
        $scope.showMCardPlace = function(marker){  
            // inizializzo la maschera dei permessi per l'utente per il marker attuale
            initPerms(marker.user);
            // recupero il tipo e lo metto dentro $scope.currentType
            initTypeChecks(marker.entity_type);

            if(consoleCheck)console.log("marker da visualizzare",marker);
            // se la modal e' gia' aperta cambio solo il contenuto
            // to do incapsulare il codice in una closeModal con then
            if($scope.infoPlace.modal){chiudoModal();}
            if(consoleCheck)console.log("showMCardPlace e la modal e' da creare! ",marker);
            $scope.infoPlace = {};
            $scope.infoPlace.marker = angular.copy(marker);
            if(consoleCheck)console.log("infoPlace, prima di creare la modal: ", $scope.infoPlace.marker);
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
                console.log("modal?!?");
                $scope.$emit('openPlaceModal', {marker: marker.id});
                polling(marker.id);
            });  

            $scope.openModalPlace = function() {
                $scope.infoPlace.modal.show();
                // creo il menu per la modal
                $scope.showPopoverMenu();
            };

            $scope.closeModalPlace = function() {
                console.log("debug closeModalPlace");
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
                        if(consoleCheck)console.log("cosa vuole fare l'utente? Esci: "+ reply);
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
                // stop del polling
                console.log("cancello il polling ",$scope.infoPlace.timer);
                $timeout.cancel(timer);

                // distruggo il menu popover
                if($scope.popover){
                    $scope.popover.hide();
                    $scope.popover.remove();
                }
                if($scope.infoPlace.modal){
                    // nascondo la modal
                    $scope.infoPlace.modal.remove().then(function() {
                        $scope.infoPlace.modal = null;
                    });
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
                if(consoleCheck)console.log("rimuovo il place ", markerId);
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

            if(consoleCheck)console.log("actionSheet", hideSheet);
        };



        //action sheet per creazione place/evento
        $scope.showASRemove = function(marker){
            if(consoleCheck)console.log("ModalPlaceController, showASRemove, id: ",marker.id);
            var hideSheet = $ionicActionSheet.show({
                titleText: 'Vuoi davvero cancellare questo luogo?',
                buttons: [
                    { text: '<i class="icon ion-close-circled"></i>' },
                    { text: '<i class="icon ion-checkmark-circled"></i>' },
                ],
                cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                cancel: function() {
                    if(consoleCheck)console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    if(consoleCheck)console.log('BUTTON CLICKED', index);
                    ///this.hide();
                    if(index===1){
                        showLoadingScreen("Cancellazione in corso...");
                        //$scope.showMWizardPlace();
                        MapService.removeMarker(marker.id)
                            .then(
                            // success function 
                            function(resp) {
                                hideLoadingScreen();
                                if(consoleCheck)console.log("Marker da eliminare...", $scope.map.markers[marker.id]);

                                if(consoleCheck)console.log("Marker eliminato!", $scope.map.markers[marker.id]);
                                $scope.closeModalPlace();
                                $scope.showASDeletedPlace(marker.id);
                                $scope.$emit("deleteMarker",{id:marker.id});
                            },
                            // error function 
                            function(error) {
                                hideLoadingScreen();
                                if(consoleCheck)console.log("Failed to get required marker, result is " + error); 
                                $scope.closeModalPlace();
                                $scope.showASDeletedPlace(-1);
                            });
                    }
                    hideSheet();

                    //return index;
                }
            });
            if(consoleCheck)console.log("actionSheet", hideSheet);
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
                    if(consoleCheck)console.log("Deleted place cancelled: "+placeId);
                }
            });
            if(consoleCheck)console.log("actionSheet", hideSheet);
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
            $scope.closeModalPlace();
            var params = {lat:marker.lat, lng:marker.lng, id:marker.id};

            toPreEditor(params);
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
            if(consoleCheck)console.log("ModalEntityCtrl, check creazione entita' subordinata di tipo ",entity_type," con relazione ",rel," con ",marker.id );

            toEditor(params);
        }

        $scope.deleteComment = function(commentId){
            showLoadingScreen();
            var index = $scope.infoPlace.marker.comments.map(function(e){return e.comment_id;}).indexOf(commentId);
            MapService.removeMarker(commentId).then(
                function(response){
                    $scope.infoPlace.marker.comments.splice(index,1);
                    hideLoadingScreen();
                    if(consoleCheck)console.log("ModalEntityCtrl, deleteComment, response: ",response);
                },
                function(response){
                    hideLoadingScreen();
                    if(consoleCheck)console.log("ModalEntityCtrl, deleteComment, error: ",response);
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
                
                return false;
            }
            return true;

        }


        $scope.openCommentBox = function(){
            console.log("openCommentBox ",$scope.infoPlace);
            //todo simpleEditor
            var params = {
                "entity_type":"FL_COMMENTS", 
                "comment_of": $scope.infoPlace.marker.id,
                "lng": $scope.infoPlace.marker.lng,
                "lat": $scope.infoPlace.marker.lat,
            };
            $scope.closeModalPlace();
            $rootScope.$broadcast("simpleInsert",params);
            
            //            da cancellare
            //            $scope.infoPlace.commento = "";
            //            if(consoleCheck)console.log("init commento: ",$scope.infoPlace.commento);
            //            $ionicModal.fromTemplateUrl('templates/map-ui-template/CommentBox.html', {
            //                scope: $scope,
            //                animation: 'fade-in',//'slide-in-up',
            //                backdropClickToClose : true,
            //                hardwareBackButtonClose : true
            //            }).then(function(modal) {
            //                $scope.infoPlace.commentBox = modal;
            //                $scope.infoPlace.commentBox.show();
            //                
            //                $scope.closeCommentBox = function(){$scope.infoPlace.commentBox.remove();};
            //                $scope.saveComment = function(){
            //                    if(consoleCheck)console.log("Salvo il commento: ",$scope.infoPlace.commento);
            //                    addComment($scope.infoPlace.commento);
            //                };
            //            });  

        }

        function addComment(message){
            var id = $scope.infoPlace.marker.id;
            showLoadingScreen();
            CommentsFactory.add(id,message).then(
                function(response){
                    if(consoleCheck)console.log("ModalEntityCtrl, addComment, response: ",response);
                    //$scope.infoPlace.marker.comments.unshift({message:$scope.infoPlace.commento,display_name:$scope.displayName,timestamp:new Date(),user_id:$scope.user.id});
                    loadComments($scope.infoPlace.marker);
                    hideLoadingScreen();
                    $scope.closeCommentBox();
                },
                function(response){
                    if(consoleCheck)console.log("ModalEntityCtrl, addComment, error: ",error);
                    hideLoadingScreen();
                    showAlert();
                }
            );

        }


        /*
         * funzioni private
         */

        function updateInfoPlaceDetails(entityId){
            if(consoleCheck)console.log("ModalPlaceController, updateInfoPlaceDetails: ",entityId);
            // richiedo i dettagli del marker
            MapService.getDetails(entityId).then(
                function(marker){
                    angular.extend($scope.infoPlace.marker,marker);
                    // carico figli e padre del marker, se ce ne sono
                    loadSibillings(marker);
                    // se non disabilitati
                    if(!$scope.currentType.disable_comments)
                        loadComments(marker);
                    // mando il messaggio per il check delle immagini a ImagesCtrl
                    $scope.$broadcast("checkImagePlaceModal",{marker:marker});
                    $ionicLoading.hide();
                },
                function(err){
                    $ionicLoading.hide();
                    //todo allert per indicare il problema di caricamento
                    if(consoleCheck)console.log("errore caricamento marker modal place: ",err);
                }
            );

        }

        function loadSibillings (marker){
            $scope.infoPlace.marker.relations = {};

            if(consoleCheck)console.log("ModalEntityCtrl, loadSibillings per il marker ", marker);
            // caricamento dei child
            var childrenRelations = $scope.config.types.child_relations[marker.entity_type];
            var children = {};
            for(key in childrenRelations){
                var childRel = childrenRelations[key];
                var c = MapService.searchFor(marker.id, childRel.field);
                if(consoleCheck)console.log("Cerco per il campo ",childRel.field," il marker con valore ", marker.id, " risultato ",c);
                if(!$scope.isEmpty(c)){
                    children[key] = angular.copy(childRel);
                    children[key].list = c;
                }
            }
            if(consoleCheck)console.log("ModalEntityCtrl, loadSibillings, costruzione dei figli ", children);
            $scope.infoPlace.marker.relations.children = children;

            // caricamento dei parent
            var parentsRelations = $scope.config.types.parent_relations[marker.entity_type];
            if(consoleCheck)console.log("ModalEntityCtrl, loadSibillings, construzione dei padri ",parentsRelations);
            var parents = {};
            // serve ad impedire la duplicazione della ricerca per entita' con lo stesso field
            var keysBanList = {};
            for(key in parentsRelations){
                var parentRel = parentsRelations[key];
                if(consoleCheck)console.log("check campo per un padre ",parentRel, parentRel.field,marker[parentRel.field]);
                if(!$scope.isEmpty(marker[parentRel.field]) && !keysBanList[parentRel.field]){
                    // aggiungo il campo alla banList 
                    keysBanList[parentRel.field] = true;
                    var p = MapService.searchFor(marker[parentRel.field], 'id');
                    if(consoleCheck)console.log("Cerco per il campo id il marker con valore ", marker[parentRel.filed], " risultato ",p);
                    parents[key] = angular.copy(parentRel);
                    parents[key].list = p;
                }
            }
            if(consoleCheck)console.log("ModalEntityCtrl, loadSibillings, costruzione dei padri ", parents);
            $scope.infoPlace.marker.relations.parents = parents;

            if(consoleCheck)console.log("ModalEntityCtrl, loadSibillings, sibillings: ", $scope.infoPlace.marker.relations);
        }


        // richiedo i commenti per il marker
        function loadComments(marker){
            if(!$scope.infoPlace.marker.comments)
                $scope.infoPlace.marker.comments = [];
            if(consoleCheck)console.log("ModalEntityCtrl, loadComments per il marker ", marker);
            CommentsFactory.get(marker.id).then(
                function(response){
                    if(consoleCheck)console.log("ModalEntityCtrl, loadComments, CommentsFactory.get, response: ",response);
                    for (var i in response){
                        var c = response[i];
                        var index  = $scope.infoPlace.marker.comments.map(function(e){return e.comment_id;}).indexOf(c.comment_id);
                        if(index < 0){
                            if(consoleCheck)console.log("ModalEntityCtrl, loadComments, something new ",c);
                            $scope.infoPlace.marker.comments.push(c);
                        }
                    }
                    for(var i in $scope.infoPlace.marker.comments){
                        var c = $scope.infoPlace.marker.comments[i];
                        var index = response.map(function(e){return e.comment_id;}).indexOf(c.comment_id);
                        if(index < 0){
                            if(consoleCheck)console.log("ModalEntityCtrl, loadComments, something old ",c);
                            $scope.infoPlace.marker.comments.splice(i,1);
                        }
                    }
                    //$scope.infoPlace.marker.comments = response;
                },
                function(response){
                    if(consoleCheck)console.log("ModalEntityCtrl, loadComments, CommentsFactory.get, error: ",response);
                }
            );
            if(consoleCheck)console.log("ModalEntityCtrl, loadComments, sibillings: ", $scope.infoPlace.marker.comments);
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
                if(consoleCheck)console.log('Allert con contenuto: ',content);
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

            $scope.checkPerms = AuthFactory.checkPerms(source);

            if(consoleCheck)console.log("ModalEntityCtrl, initPerms, user ",$scope.user,$scope.user.id,$scope.perms);

            return $scope.perms;
        }


        function initTypeChecks (entity_type){
            var index = $scope.config.types.list.map(function(e){return e.key}).indexOf(entity_type);

            $scope.currentType = $scope.config.types.list[index];

            if(consoleCheck)console.log("ModalEntityCtrl, initTypeChecks, entity_type, index e type: ", entity_type, index, $scope.currentType);

        }


        function startEditing(params){

            $scope.$emit("startEditing",params);

        }

        
        // pre editor nella mappa
        function toPreEditor(params){
            // controllo l'editor adeguato
            // caso update
            var check = $scope.currentType.simple_editor;
            //se add child
            if(params.entity_type){
                var index = $scope.config.types.list.map(function(e){return e.slug}).indexOf(params.entity_type);
                check = $scope.config.types.list[index].simple_editor;
            }

            if(check && params.entity_type){
                $rootScope.$broadcast("simpleInsert",params);
            } else if(check){
                $rootScope.$broadcast("simpleUpdate",params);
            }else{
                startEditing(params);
            }

        }
        
        // va all'editor corretto
        function toEditor(params){
            // controllo l'editor adeguato
            // caso update
            var check = $scope.currentType.simple_editor;
            //se add child
            if(params.entity_type){
                var index = $scope.config.types.list.map(function(e){return e.slug}).indexOf(params.entity_type);
                check = $scope.config.types.list[index].simple_editor;
            }

            if(check && params.entity_type){
                $rootScope.$broadcast("simpleInsert",params);
            } else if(check){
                $rootScope.$broadcast("simpleUpdate",params);
            }else{
                $state.go('app.editor', params);
            }

        }

    }]);
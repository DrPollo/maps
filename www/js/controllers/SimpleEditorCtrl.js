angular.module('firstlife.controllers')

    .controller('SimpleEditorCtrl', ['$scope', '$rootScope', '$state', '$q', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup','$timeout', '$filter', 'myConfig', 'ImageService', 'entityFactory', 'MapService', 'MemoryFactory', 'AuthFactory', 'CommentsFactory', 'EntityService', function($scope, $rootScope, $state, $q, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, $filter, myConfig, ImageService, entityFactory, MapService, MemoryFactory, AuthFactory, CommentsFactory, EntityService) { 


        var self = this;


        var consoleCheck = false;


        // entity type di default
        var default_entity = "FL_COMMENTS";
        var contentKey = "description";


        self.config = myConfig;
        self.simpleEntity = {};
        self.now = new Date();

        self.currentUser = MemoryFactory.readUser();

        // switch tra create (true) e update mode (false)
        self.createMode = true;
        
        /*
         * Listners:
         * 1) richiesta di aperura editor, ascolta su evento "simpleInsert" da MapCtrl o CardPlaceCtrl
         */

        $scope.$on("simpleInsert", function(event,args){

            if (!event.defaultPrevented) {
                if(consoleCheck)console.log("SimpleEditorCtrl, listner ",event," parametri ",args);

                event.defaultPrevented = true;
                if(args){
                    initEntity(args);
                    self.createMode = true;
                    openEditor();

                }
            }
        });

        $scope.$on("simpleUpdate", function(event,args){

            if (!event.defaultPrevented) {
                if(consoleCheck)console.log("SimpleEditorCtrl, listner ",event," parametri ",args);

                showLoadingScreen();
                event.defaultPrevented = true;
                if(args){
                    MapService.getDetails(args.id).then( function(mark) {
                        if(self.config.dev) if(consoleCheck)console.log("simpleEditorCtrl, cambio di stato, edit marker, entityFactory.get, response: ",mark);

                        // cerco il campo per l'editor
                        var index = findIndex(mark.entity_type);
                        
                        self.contentKey = self.config.types.list[index].simple_editor;

                        hideLoadingScreen();
                        marker = EntityService.preprocessMarker(mark);
                        self.simpleEntity = marker;
                        initLabel(marker.entity_type);
                        self.createMode = false;
                        openEditor();
                    },function(error) {
                        hideLoadingScreen();
                        showAlert();
                        if(self.config.dev) if(consoleCheck)console.log("simpleEditorCtrl, cambio di stato, edit marker, entityFactory.get, errore: ",error); 
                    });
                }
            }
        });


        /*
         * Funzioni pubbliche:
         * 1) save: salva l'entita'
         * 2) abort: cancella l'inserimento
         */
        self.save = function(){
            if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, salvo l'entita': ",self.simpleEntity);
            saveEntity();
        };
        self.update = function(){
            if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, salvo l'entita': ",self.simpleEntity);
            updateEntity();
        };
        self.abort = function(){
            if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, chiudo la modal");
            if(self.modal){
                self.modal.hide();
                self.modal.remove();
            }
            delete self.simpleEntity;
        };




        /*
         * Funzioni private:
         * 1) initEntity: inizializzazione dell'entita'
         * 2) openEditor: apertura della modal
         * 3) saveEntity: salvataggio dell'entita'
         * 4) showLoadingScreen: apertura del loader
         * 5) hideLoadingScreen: chiusura del loader
         * 6) showAlert: popup di errore
         * 7) initTime: inizializzazione dei campi temporali
         */

        function initEntity(params) {
            if(self.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, initEntity params ",params);

            // setup entity_type
            var entity_type = default_entity;
            var typeIndex = -1;
            if(params.entity_type){
                // recupero per slug
                typeIndex = findIndex(params.entity_type);

                if(typeIndex > -1){
                    entity_type = self.config.types.list[typeIndex].key;
                    // setto il campo da riempire nella textarea
                    self.contentKey = self.config.types.list[typeIndex].simple_editor;
                }
            }
            if(self.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, initEntity, entity_type ",entity_type,self.contentKey);

            initLabel(entity_type);

            // init dell'entita'
            self.simpleEntity = EntityService.getDefaults(entity_type);

            // setup posizione
            self.simpleEntity.coordinates = [params.lng, params.lat];

            // todo gestione delle relazioni
            if(typeIndex > -1){
                var properties = config.types.list[typeIndex].properties;
                for(var prop in properties){
                    // se la proprieta' e' nei parametri di inizializzazione
                    if(params[prop]){
                        // aggiungo la proprieta'
                        self.simpleEntity[prop] = params[prop];
                    }
                }
            }

            // setup per sviluppo e debug
            if(self.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, initEntity ",self.simpleEntity);
        }

        function initLabel(entity_type){
            // init icona del tipo di entita'
            self.type_info = self.config.types.list[findIndex(entity_type)];
            self.type_info.color = self.config.design.colors[self.type_info.index];


        }

        function openEditor(){
            if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, init entita init: ",self.simpleEntity);
            $ionicModal.fromTemplateUrl('templates/form/simpleEditor.html', {
                scope: $scope,
                animation: 'fade-in',//'slide-in-up',
                backdropClickToClose : true,
                hardwareBackButtonClose : true,
                focusFirstInput: true
            }).then(function(modal) {
                self.modal = modal;
                self.modal.show();

            });  

        }

        function saveEntity(){
            showLoadingScreen();

            // todo da far processare 
            var dataForServer = EntityService.processData(self.simpleEntity);
            MapService.createMarker(dataForServer)
                .then(function(response){
                if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, addComment, response: ",response);
                hideLoadingScreen();
                self.abort();

                // restituisce l'id del padre o quello del marker
                var id = findParent(response);

                backToMap({id:id,marker:response});
                //todo manda messaggio a mapctrl per la gestione del risultato

            },function(error){
                if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, addComment, error: ",error);
                hideLoadingScreen();
                var marker = {id:-1};
                backToMap({marker:marker});
                //showAlert();
                //todo manda messaggio a mapctrl per la gestione del risultato
            });
        }
        function updateEntity(){
            showLoadingScreen();

            // todo da far processare 
            var dataForServer = EntityService.processData(self.simpleEntity);
            MapService.updateMarker(dataForServer)
                .then(function(response){
                if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, addComment, response: ",response);
                hideLoadingScreen();
                self.abort();

                // restituisce l'id del padre o quello del marker
                var id = findParent(response);

                backToMap({id:id,marker:response});
                //todo manda messaggio a mapctrl per la gestione del risultato

            },function(error){
                if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, addComment, error: ",error);
                hideLoadingScreen();
                var marker = {id:-1};
                backToMap({marker:marker});
                //showAlert();
                //todo manda messaggio a mapctrl per la gestione del risultato
            });


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

        function showAlert (content) {
            if(!content){
                content = {};
            }
            if(!content.title){
                content.title = $filter('translate')('ERROR');
            }
            if(!content.text){
                content.text = "L'operazione non &egrave; andata a buon fine.";
            }
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                if($scope.config.dev)if(consoleCheck)console.log('Allert con contenuto: ',content);
            });
        };


        // trova la relazioni tra entita' e restituisce l'id dell'entita' collegata
        function findParent(marker){
            var rels = self.config.types.relations.list;
            for (var i = 0; i < rels.length; i++){
                // se il marker ha un valore per un campo relazione
                if(marker[rels[i]]){
                    return marker[rels[i]];
                }
            }
            return marker.id;
        }

        function findIndex(entity_type){
            // recupero per slug
            var typeIndex = self.config.types.list.map(function(e){return e.slug;}).indexOf(entity_type);
            if(typeIndex < 0 ){
                // recupero per key
                typeIndex = self.config.types.list.map(function(e){return e.key;}).indexOf(entity_type);
            }
            return typeIndex;
        }

        // segnalo alla mappa la fine dell'editing
        function backToMap(params){
            $scope.$emit("endEditing",params);
        }
    }]);
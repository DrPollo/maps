angular.module('firstlife.controllers')

    .controller('SimpleEditorCtrl', ['$scope', '$rootScope', '$state', '$q', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup','$timeout', '$filter', '$log','myConfig', 'ImageService', 'entityFactory', 'MapService', 'MemoryFactory', 'AuthService', 'SimpleEntityFactory', 'EntityService', function($scope, $rootScope, $state, $q, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $timeout, $filter,$log, myConfig, ImageService, entityFactory, MapService, MemoryFactory, AuthService, SimpleEntityFactory, EntityService) { 


        var self = this;


        var consoleCheck = false;


        // entity type di default
        var default_entity = "FL_COMMENTS";
        var contentKey = "description";


        self.config = myConfig;
        self.simpleEntity = {};
        self.now = new Date();

        self.currentUser = MemoryFactory.readUser();

        self.types = self.config.types.simpleEntities;

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
        self.abort = function(){
            if($scope.config.dev)if(consoleCheck)console.log("SimpleEditorCtrl, chiudo la modal");
            if(self.modal){
                self.modal.remove();
                self.modal = null;
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
            self.type = types[params.type];
            self.simpleEntity = {
                type: params.type, 
                parent: params.entity,
                label: self.type.label,
                contentKey: self.type.contentKey
            };
            for(var k in self.type.fields){
                self.simpleEntity[k] = self.type.fields[k].default;
            }
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
            $log.debug("SimpleEditorCtrl, save entity, self.simpleEntity: ",self.simpleEntity);
            showLoadingScreen();
            
            SimpleEntityFactory.add(self.simpleEntity.parent,self.simpleEntity,self.type.key).then(
                function successCallback(response){
                    $log.debug("SimpleEditorCtrl, addComment, response: ",response);
                    hideLoadingScreen();
                    //backToMap({marker:{id:self.simpleEntity.parent}});
                    self.abort();

                },
                function errorCallback(error){
                    $log.error("SimpleEditorCtrl, addComment, error: ",error);
                    hideLoadingScreen();
                    //backToMap({marker:{id:self.simpleEntity.parent}});
                    // todo gestisci errore
                    showAlert();
                }
            );            
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
                content.text = $filter('translate')('UNKNOWN_ERROR');
            }
            var alertPopup = $ionicPopup.alert({
                title: content.title,
                template: content.text
            });

            alertPopup.then(function(res) {
                if($scope.config.dev)if(consoleCheck)console.log('Allert con contenuto: ',content);
            });
        };

        // segnalo alla mappa la fine dell'editing
        function backToMap(params){
            $scope.$emit("endEditing",params);
        }

    }]);
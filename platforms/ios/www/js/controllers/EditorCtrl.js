angular.module('firstlife.controllers')
    .controller('EditorCtrl', ['myConfig', 'entityFactory', '$scope', '$state','$stateParams', '$ionicPopup',  'categoriesFactory', 'entityFactory', '$window', 'TagsService', 'MemoryFactory', '$rootScope', '$ionicLoading', function(myConfig, entityFactory, $scope, $state, $stateParams, $ionicPopup, categoriesFactory, entityFactory, $window, TagsService, MemoryFactory, $rootScope, $ionicLoading) {


        $scope.config = myConfig;

        // oggetto contenente i form in modo da potene verificare la validità fuori scope
        $scope.form = {};
        //console.log($stateParams);
        //console.log($rootScope.currentUser.user.id);


        //$scope.categories = $rootScope.categories;
        //$scope.catIndex = $rootScope.categoriesIndex;
        console.log("categorie in EditorCtrl", $scope.categories);


        $scope.wizard = {};
        $scope.wizard.steps = ['Info', 'Category'];
        $scope.wizard.step = 0; 
        $scope.categories = [];

        $scope.valid_from = false;
        $scope.valid_to = false;

        $scope.types = $scope.config.types;

        self.currentUser = MemoryFactory.readUser();
        self.labels = {
            edit: "Modifica ",
            create: "Creazione "
        };


        // init delle maschere dei campi per il form
        // prendo il form di default
        $scope.perms = $scope.types.perms;
        // checklist
        $scope.checkList = {};



        //init timepicker
        $scope.timePickerObject = {
            inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
            step: 15,  //Optional
            format: 24,  //Optional
            titleLabel: '12-hour Format',  //Optional
            setLabel: 'Set',  //Optional
            closeLabel: 'Close',  //Optional
            setButtonType: 'button-positive',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
                timePickerCallback(val);
            }
        };

        function timePickerCallback(val){}


        if($rootScope.categories){
            $scope.categories = $rootScope.categories;
        }else{
            /* da cancellare se funziona il sistema passando da mapcCtrl */
            categoriesFactory.getAll().then(
                function(categories) {
                    // bug da fixare per le categorie multiple
                    $scope.categories = categories;
                    console.log("EditorCtrl, init categorie, categorie: ", categories);
                },

                function(error) {
                    console.log("Failed to get all categories (from EditorCtrl), result is " + error); 
                }
            );    
        }
        /**/




        /*
         * Listner
         * 1) cambio stato
         */
        // al cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {

            // cancello il form
            $scope.wizard.dataForm = {};
            // torno allo step 0
            $scope.wizard.step = 0; 

            if($rootScope.previousState === 'app.maps'){
                console.log("sono in EditorCtrl e vengo da ", $rootScope.previousState, " parametri di cambio stato: ",$stateParams, toState, toParams, fromState, fromParams);

                // da cancellare initSearchSource();

                self.currentUser = MemoryFactory.readUser();
                console.log("EditorCtrl, $on $stateChangeSuccess, MemoryFactory.readUser() : ", currentUser);

                // gestione del tipo
                var type = $scope.types.default.key,
                    typeIndex = $scope.types.default.id;



                // scelgo se fare update di un marker esistente o crearne uno nuovo
                // update place: init dataForm con dati del place...
                if($stateParams.id!= null && $stateParams.id!= ""){
                    //console.log("EditorCtrl, update, id: ",$stateParams.id);
                    //get place(id)
                    entityFactory.get($stateParams.id, true)
                        .then( function(mark) {
                        //console.log("EditorCtrl, cambio di stato, edit marker, entityFactory.get, response: ",mark);
                        setToEdit(mark);
                    },function(error) {
                        console.log("EditorCtrl, cambio di stato, edit marker, entityFactory.get, errore: ",error); 
                    });
                }
                //create place: init empty dataForm
                else{
                    // se il type e' settato
                    if($stateParams.entity_type){
                        typeIndex = $scope.types.list.map(function(e){return e.slug;}).indexOf($stateParams.entity_type);
                        type = $scope.types.list[typeIndex].key;
                        //console.log('EditorCtrl, creazione marker, tipo: ', type, " con indice: ", typeIndex );
                    }

                    //imposto i permessi
                    $scope.checkList = $scope.perms[typeIndex];
                    //console.log("EditorCtrl, checkList: ", $scope.checkList);

                    //
                    console.log("preparo il wizard per la create place: ",$stateParams, self.currentUser, self.labels.create.concat($scope.types.list[typeIndex].name));
                    var description = null;
                    if($scope.config.dev){
                        description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse faucibus pretium libero id consequat. Proin bibendum vehicula ultrices. Sed justo elit, gravida eget accumsan nec, aliquam a nunc. Aliquam vitae mi sed lacus porta congue. Maecenas sit amet purus ac urna sodales mollis. Maecenas vitae purus sit amet tellus fringilla finibus vitae id elit. Vivamus a sapien erat.';
                    }
                    
                    // creo il form basandomi sui permessi
                    //console.log("EditCtrl, init form, permessi: ",$scope.perms[type]);
                    $scope.wizard.dataForm.title= self.labels.create.concat($scope.types.list[typeIndex].name);

                    // creo il form 
                    for(key in $scope.perms[typeIndex]){
                        //console.log("EditCtrl, init form, inserisco proprieta': ",key,$scope.perms[type][key]);
                        $scope.wizard.dataForm[key] = null;
                    }

                    //console.log("EditCtrl, init form: ",$scope.wizard.dataForm);

                    //gestione categorie multiple, preparo il modello con un indice per ogni category space
                    $scope.wizard.dataForm.categories = [];
                    console.log("EditorCtrl, init form, init categories, cat: ",$scope.categories);
                    for( j = 0; j < $scope.categories.length; j++){
                        var cat = $scope.categories[j];
                        console.log("EditorCtrl, init form, init categories, cat: ",cat,type);
                        if(cat.entities.indexOf(type) > -1){
                            $scope.wizard.dataForm.categories[j] = {categories:[],category_space:cat.category_space}; 
                        }
                    }
                    //console.log("EditorCtrl, init form, init categories: ",$scope.categories, $scope.wizard.dataForm.categories);

                    // gestione relazioni da parametro search nel caso arrivassi da una add in una modal
                    // controllo che non sia settato una rel tra quelle definite per il tipo
                    var rels = $scope.config.types.relations;
                    //console.log("relazioni da controllare ",rels.length," in $stateParams ",$stateParams);
                    for( i = 0 ; i < rels.list.length ; i++ ){
                        //console.log("controllo regola ",i+1,rels[i]);
                        var key = rels.list[i],
                            field = rels.map[key];
                        // aggiungo il campo se trovo il parametro nella search
                        //console.log("check parametro ",key," in $stateParams ",$stateParams, " key, e field ",key,field);
                        if($stateParams[key]){
                            $scope.wizard.dataForm[field] = parseInt($stateParams[key]);
                            console.log("Aggiunto il parametro ",field," con valore ",$scope.wizard.dataForm[key]);
                        }
                    }
                    // fine gesione relazioni


                    // regole speciali per la gestione di alcuni campi
                    if(type)
                        $scope.wizard.dataForm.entity_type = type;
                    if($stateParams.lng && $stateParams.lng)
                        $scope.wizard.dataForm.geometries= [{type: "Point",coordinates: [$stateParams.lng,$stateParams.lat]}];
                    $scope.wizard.dataForm.tags = [];
                    //$scope.wizard.dataForm.categories = [];
                    if(description)
                        $scope.wizard.dataForm.description = description;
                    if(self.currentUser.id)
                        $scope.wizard.dataForm.user = parseInt(self.currentUser.id);
                    //regole per gli eventi
                    if(self.currentUser.id && $scope.checkList.organizer)
                        $scope.wizard.dataForm.organizer = parseInt(self.currentUser.id);
                    // template timepicker door_time
                    if($scope.checkList.door_time){
                        initDoorTime();
                    }
                    // template timepicker duration
                    if($scope.checkList.duration){
                        initDuration();
                    }
                    //fine regole eventi

                    // fine regole gestione campi speciali
                    console.log("EditCtrl, init del form: ",$scope.wizard.dataForm);


                }

            } else {console.log("Ignoro perche' vengo da: ",$rootScope.previousState);}
        });



        // filtro maggiore di per l'editor del place
        $scope.greaterThan = function(prop, val){
            return function(item){
                return item[prop] > val;
            }
        };
        // filtro "diverso da" di per l'editor del place
        $scope.differentThan = function(prop, val){
            return function(item){
                return item[prop] != val;
            }
        };


        // funzioni di callback per i datapicker 
        $scope.datePickerFrom = function (val) {
            //console.log("date picker from!");
            if(typeof(val)==='undefined'){      
                //console.log('Date not selected');
                $scope.valid_from = false;
            }else{
                //console.log('Selected date is : ', val);
                $scope.valid_from = true;

            }
        };
        $scope.datePickerTo = function (val) {
            if(typeof(val)==='undefined'){      
                //console.log('Date not selected');
                $scope.valid_to = false;
            }else{
                //console.log('Selected date is : ', val);
                $scope.valid_to = true;
            }
        };

        $scope.loadTags = function($query) {
            return TagsService.query($query).then(function(response) {
                console.log("EditorCtrl, loadTags response: ",response);
                return response.filter(function(resp) {
                    //console.log(resp);
                    return resp.tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            });
        }    



        // bug normalizzo i tag
        $scope.normalizeTags = function(tags){
            var oldTags= tags,
                newTag = "";

            for(i in tags){
                newTag += String(oldTags[i].tag)+",";
                //console.log("tag", newTag[i]);
            }
            return newTag.substring(0,newTag.length-1).split(",");
        }



        $scope.close = function() {
            //console.log("Close intro!", $scope.wizard.dataForm.tags);
            $state.centerParam = 0;
            //$state.mode = "cancel";
            //$window.history.back();
            $scope.wizard.dataForm = {};
            $state.go('app.maps',{lat:$stateParams.lat,lng:$stateParams.lng,place:$stateParams.id});
        };



        $scope.wizard.isFirstStep = function () {
            return $scope.wizard.step === 0;
        };

        $scope.wizard.isLastStep = function () {
            return $scope.wizard.step === ($scope.wizard.steps.length - 1);
        };

        $scope.wizard.isCurrentStep = function (step) {
            return $scope.wizard.step === step;
        };

        $scope.wizard.setCurrentStep = function (step) {
            $scope.wizard.step = step;
        };

        $scope.wizard.getCurrentStep = function () {
            return $scope.wizard.steps[$scope.wizard.step];
        };

        $scope.wizard.getNextLabel = function () {
            //console.log($scope.form);
            return ($scope.wizard.isLastStep()) ? 'Submit' : 'Next';
        };

        $scope.wizard.handlePrevious = function () {
            $scope.wizard.step -= ($scope.wizard.isFirstStep()) ? 0 : 1;
        };

        $scope.wizard.handleNext = function (isValid) {
            console.log("handlenext: ");
            console.log(isValid);
            if(!isValid){
                console.log("errore, form non valido!");
            } else if ($scope.wizard.isLastStep()) {
                processData();
            } else {
                $scope.wizard.step += 1;
            }
        };

        // preparo i dati del form per le chiamate al server
        function processData() {
            // apro schermata di loading
            showLoadingScreen('Salvataggio in corso...', $scope.wizard.dataForm);
            var dataForServer = $scope.wizard.dataForm;
            // set del parent id
            //console.log("parent_id normalizzato", dataForServer.parent_id.originalObject.id);
            if( dataForServer.parent_id != null && dataForServer.parent_id.originalObject != null && dataForServer.parent_id.originalObject.id != null){

                dataForServer.parent_id = dataForServer.parent_id.originalObject.id;
            }
            //normalizzazz. tags
            for(var el in $scope.wizard.dataForm.tags){
                dataForServer.tags[el] = $scope.wizard.dataForm.tags[el].tag;   
            }

            //accettaz. date
            if(!$scope.valid_from)
                dataForServer.valid_from = null;
            if(!$scope.valid_to)
                dataForServer.valid_to = null;

            if($scope.checkList.duration && $scope.wizard.dataForm.door_time && $scope.wizard.dataForm.close_time){
                var duration = 0;
                if(dataForServer.valid_from && dataForServer.valid_to){
                    // differenza tra giorni
                    duration += (dataForServer.valid_to - dataForServer.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    //console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    //console.log("considero le date, durata:",duration, " differenza tra orari? ", $scope.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += ($scope.wizard.dataForm.close_time - $scope.wizard.dataForm.door_time);  
                    console.log("EditorCtrl, calcolo durata:",duration);
                    dataForServer.duration = duration;
                }else{
                    dataForServer.duration = $scope.wizard.dataForm.close_time - $scope.wizard.dataForm.door_time;
                }
            }

            if(dataForServer.title)
                delete dataForServer.title;

            if(dataForServer.type){
                console.log("trovato il type: ", dataForServer.type);
                dataForServer.type = parseInt(dataForServer.type);
            }

            //console.log("Nel json: ", dataForServer.categories[0]," (", typeof(dataForServer.categories[0]),")", " --> ", $scope.categories[dataForServer.categories[0]].name);

            //update a place
            if($stateParams.id !=null && $stateParams.id !=""){

                //dataForServer.id=$stateParams.id;
                entityFactory.update(dataForServer, $stateParams.id)
                    .then(function(newplace){
                    console.log("update completed: ", newplace);
                    $state.centerParam = newplace.id;
                    //$state.mode = "update";

                    // vado alla mappa e mostro la modal del place
                    $state.go("app.maps",{place: newplace.id});

                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return newplace.id;
                },function(error){
                    console.log("update failed: ", error);
                    $state.centerParam = -1;

                    //$window.history.back();
                    $state.go("app.maps",{lat:$stateParams.lat,lng:$stateParams.lng,zoom:$stateParams.zoom});
                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return -1;
                });

            }
            //create place
            else{
                entityFactory.create(dataForServer)
                    .then(function(newplace){
                    console.log("creation completed: ", newplace);
                    $state.centerParam = newplace.id;
                    //$state.mode = "create";

                    // vado alla mappa e mostro la modal del place
                    $state.go("app.maps",{place: newplace.id,lat:newplace.lat,lng:newplace.lng,zoom:$stateParams.zoom});

                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return newplace.id;
                },
                          function(error){
                    console.log("creation failed: ", error);

                    $state.centerParam = -1;
                    $state.go("app.maps",{lat:$stateParams.lat,lng:$stateParams.lng,zoom:$stateParams.zoom});
                    //$window.history.back();
                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    // da testare 
                    return -1;
                });
            }


        };


        /*
         * Funzioni private
         * 1) setToEdit: prepara l'editor per la modifica del marker
         * *) initDoorTime: inizializzazione del campo door_time
         * *) doorTimeCallback: callback dell'inserimento del campo door_time
         * *) initDuration: inizializzazione del campo close_time e duration
         * *) durationCallback: callback dell'inserimento del campo close_time
         */

        // imposto il form con i dati del marker da modificare
        function setToEdit(mark){
            // se il type e' settato
            if(mark.entity_type){
                typeIndex = $scope.types.list.map(function(e){return e.key;}).indexOf(mark.entity_type);
                type = $scope.types.list[typeIndex].key;
                //console.log('EditorCtrl, edit marker, tipo: ', type, " con indice: ", typeIndex, " permessi: ", $scope.perms[typeIndex]);
            }

            //imposto i permessi
            $scope.checkList = angular.copy($scope.perms[typeIndex]);

            console.log("EditorCtrl, setToEdit, checkList: ", $scope.checkList);
            console.log("EditorCtrl received marker: ", mark, $scope.types.list[ typeIndex ]);

            $scope.wizard.dataForm = angular.copy(mark);
            $scope.wizard.dataForm.title = self.labels.edit.concat($scope.types.list[ typeIndex ].name);
            // gestione logica di alcuni campi particolari
            if(mark.geometries){
                $scope.wizard.dataForm.geometries = [{type: "Point",coordinates: [mark.lng,mark.lat]}];
            }
            if(mark.valid_from){
                $scope.wizard.dataForm.valid_from = new Date(mark.valid_from);
            }else{$scope.wizard.dataForm.valid_from =null; }
            if(mark.valid_to){
                $scope.wizard.dataForm.valid_to = new Date(mark.valid_to);
            }else{$scope.wizard.dataForm.valid_to =null; }
            if(self.currentUser.id)
                $scope.wizard.dataForm.user = parseInt(self.currentUser.id);
            if(mark.id_wp)
                $scope.wizard.dataForm.id_wp = parseInt(mark.id_wp);
            // recupero le informazioni sul padre se gia' inserite
            if( mark.parent_id != null && mark.parent_id !== "undefined"){
                console.log("ha un parent! ", mark.parent_id);
                $scope.wizard.dataForm.parent_id = parseInt(mark.parent_id);
                setParent(mark.parent_id);
            }
            // se door_time e' richiesto e non e' nel marker
            if($scope.checkList.door_time && !$scope.wizard.dataForm.door_time){
                //console.log("Entro in initDoorTime");
                initDoorTime();
            }
            // se duration e' richiesto e non e' nel marker
            if($scope.checkList.duration && !$scope.wizard.dataForm.duration){
                //console.log("Entro in initDuration");
                initDuration();
            }
            //console.log("EditorCtrl, checkList: ", $scope.checkList);

        }


        // ricerca tra i place per l'autocomplete del campo place_id
        /* da cancellare uso api di ricerca
        $scope.searchSource = [];

        function initSearchSource () {
            // creo il buffer di ricerca 
            entityFactory.getAll().then(function(markers){

                console.log("EditorCtrl, initSearchSource, marker per il buffer: ", markers);
                // bug deve essere dinamico            
                for (i in markers){
                    $scope.searchSource.push(angular.fromJson(angular.toJson(markers[i])));
                }

                //console.log("init sorgente di ricerca per l'autocomplete del campo place_id", typeof($scope.searchSource),$scope.searchSource);
            });


        };*/
        function setParent(parent_id){
            console.log("carico il parent ", parent_id);
            entityFactory.get(parseInt(parent_id)).then(
                function(mark){
                    console.log("parent ", mark);
                    $scope.wizard.dataForm.parent_id = mark;
                    // originalObject e' un campo di angucomplete, lo simuliamo inserendoci solo l'id
                    // originalObject viene utilizzato per costruire i dati per l'inserimento nel server
                    $scope.wizard.dataForm.parent_id.originalObject = {};
                    $scope.wizard.dataForm.parent_id.originalObject.id = mark.id;
                    console.log("set del parent ",$scope.wizard.dataForm.parent_id);
                }
            );
        }
        function showLoadingScreen(text){
            if(text === 'undefined'){
                text = 'Caricamento...';
            }

            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }
        function initDoorTime(){
            console.log("EditorCtrl, initDoorTime, c'e' door_time? ",$scope.checkList.door_time);
            var inputEpochTime = null;
            if($scope.wizard.dataForm.door_time)
                inputEpochTime = $scope.wizard.dataForm.door_time;
            
            $scope.checkList.door_time.template = {
                inputEpochTime: inputEpochTime,//((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $scope.checkList.door_time.label,  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    doorTimeCallback(val)
                }
            }
            $scope.wizard.dataForm.door_time = $scope.checkList.door_time.template.inputEpochTime;
            console.log("EditorCtrl, initDoorTime, aggiunta durata ",$scope.checkList.door_time.template.inputEpochTime," a ",$scope.wizard.dataForm.door_time);
        }
        function doorTimeCallback(val) {    
            if(val){
                console.log("Valore orario:",val);
                // se il door_time e' settato
                if($scope.wizard.dataForm.close_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += ($scope.wizard.dataForm.valid_to - $scope.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    console.log("considero le date, durata:",duration, " differenza tra orari? ", $scope.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += ($scope.wizard.dataForm.close_time - val);  
                    console.log("considero anche l'orario, durata:",duration);

                    if(duration >= 0){
                        $scope.wizard.dataForm.door_time = val;
                        $scope.wizard.dataForm.duration = duration;
                    }else{
                        $scope.wizard.dataForm.door_time = $scope.wizard.dataForm.close_time;
                        //errore
                        /*var alertPopup = $ionicPopup.alert({
                                            title: 'Errore!',
                                            template: "L'evento non pu&ograve; terminare prima dell'ora di inizio."
                                        });
                                        alertPopup.then(function(res) {
                                         console.log('Reset orario');
                                       });*/
                    }
                }else{
                    // se non door_time non e' impostato non devo controllare
                    $scope.wizard.dataForm.door_time = val;
                }
            }else{$scope.wizard.dataForm.door_time = null;}
        }
        function initDuration(){
            $scope.checkList.close_time = angular.copy($scope.checkList.duration);
            $scope.wizard.dataForm.close_time = null;
            $scope.checkList.close_time.template = {
                inputEpochTime: $scope.wizard.dataForm.close_time,// ((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $scope.checkList.close_time.label,  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    durationCallback(val);
                }
            }
            $scope.wizard.dataForm.close_time = $scope.checkList.close_time.template.inputEpochTime;
            console.log("EditorCtrl, initDuration, aggiunta durata ",$scope.checkList.close_time," a ",$scope.wizard.dataForm.close_time);
        }
        function durationCallback(val){
            if(val){
                console.log("Valore orario:",val);
                // se il door_time e' settato
                if($scope.wizard.dataForm.door_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += ($scope.wizard.dataForm.valid_to - $scope.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    console.log("considero le date, durata:",duration, " differenza tra orari? ", $scope.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (val - $scope.wizard.dataForm.door_time);  
                    console.log("considero anche l'orario, durata:",duration);

                    if(duration >= 0){
                        $scope.wizard.dataForm.close_time = val;
                        $scope.wizard.dataForm.duration = duration;
                    }else{
                        $scope.wizard.dataForm.close_time = $scope.wizard.dataForm.door_time;
                        //errore
                        /*var alertPopup = $ionicPopup.alert({
                                title: 'Errore!',
                                template: "L'evento non pu&ograve; terminare prima dell'ora di inizio."
                            });
                            alertPopup.then(function(res) {
                             console.log('Reset orario');
                           });*/
                    }
                }else{
                    // se non door_time non e' impostato non devo controllare
                    $scope.wizard.dataForm.close_time = val;
                }
            }else{$scope.wizard.dataForm.close_time = null;}
        }

    }]);
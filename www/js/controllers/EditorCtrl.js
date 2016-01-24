angular.module('firstlife.controllers')
    .controller('EditorCtrl', ['myConfig', 'entityFactory', '$state', '$scope','$stateParams', '$ionicPopup',  'categoriesFactory', 'entityFactory', '$window', 'TagsService', 'MemoryFactory', '$ionicLoading', '$previousState', function(myConfig, entityFactory, $state, $scope, $stateParams, $ionicPopup, categoriesFactory, entityFactory, $window, TagsService, MemoryFactory, $ionicLoading, $previousState) {

        var _this = this;
        _this.config = myConfig;

        // oggetto contenente i form in modo da potene verificare la validità fuori scope
        _this.form = {};
        //console.log($stateParams);

        console.log("categorie in EditorCtrl", _this.categories);


        // init del wizard
        _this.wizard = {};
        _this.wizard.steps = ['Info', 'Category'];
        _this.wizard.step = 0; 
        
        
        // init delle categorie
        _this.categories = categoriesFactory.gets();

        // init particolari: campi temporali
        _this.valid_from = false;
        _this.valid_to = false;

        // recupero i tipi dal file di configurazione
        _this.types = _this.config.types;

        // recupero l'utente corrente
        self.currentUser = MemoryFactory.readUser();
        
        // setup dei labels
        self.labels = {
            edit: "Modifica ",
            create: "Creazione "
        };


        // init delle maschere dei campi per il form
        // prendo il form di default
        _this.perms = _this.types.perms;
        // checklist
        _this.checkList = {};



        //init timepicker
        _this.timePickerObject = {
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


    

        /*
         * Listner
         * 1) cambio stato
         */
        // al cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {

            // cancello il form
            _this.wizard.dataForm = {};
            // torno allo step 0
            _this.wizard.step = 0; 
            
            //recupero lo stato precedente!
            var previousState = $previousState.get();
            console.log("EditorCtrl, cambio di stato, previousState: ",previousState);
            if(previousState.state.name === 'app.maps'){
                console.log("sono in EditorCtrl e vengo da ", previousState.state.name, " parametri di cambio stato: ",$stateParams, toState, toParams, fromState, fromParams);

                // da cancellare initSearchSource();

                self.currentUser = MemoryFactory.readUser();
                console.log("EditorCtrl, $on $stateChangeSuccess, MemoryFactory.readUser() : ", currentUser);

                // gestione del tipo
                var type = _this.types.default.key,
                    typeIndex = _this.types.default.id;

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
                        typeIndex = _this.types.list.map(function(e){return e.slug;}).indexOf($stateParams.entity_type);
                        type = _this.types.list[typeIndex].key;
                        console.log('EditorCtrl, creazione marker, tipo: ', type, " con indice: ", typeIndex );
                    }

                    //imposto i permessi
                    _this.checkList = _this.perms[typeIndex];
                    //console.log("EditorCtrl, checkList: ", _this.checkList);

                    //
                    console.log("preparo il wizard per la create place: ",$stateParams, self.currentUser, self.labels.create.concat(_this.types.list[typeIndex].name));
                    var description = null,
                        name = null;
                    if(_this.config.dev){
                        name = 'Prova';
                        description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse faucibus pretium libero id consequat. Proin bibendum vehicula ultrices. Sed justo elit, gravida eget accumsan nec, aliquam a nunc. Aliquam vitae mi sed lacus porta congue. Maecenas sit amet purus ac urna sodales mollis. Maecenas vitae purus sit amet tellus fringilla finibus vitae id elit. Vivamus a sapien erat.';
                    }
                    
                    // creo il form basandomi sui permessi
                    //console.log("EditCtrl, init form, permessi: ",_this.perms[type]);
                    _this.wizard.dataForm.title= self.labels.create.concat(_this.types.list[typeIndex].name);

                    // creo il form 
                    for(key in _this.perms[typeIndex]){
                        //console.log("EditCtrl, init form, inserisco proprieta': ",key,_this.perms[type][key]);
                        _this.wizard.dataForm[key] = null;
                    }

                    //console.log("EditCtrl, init form: ",_this.wizard.dataForm);

                    //gestione categorie multiple, preparo il modello con un indice per ogni category space
                    _this.wizard.dataForm.categories = [];
                    console.log("EditorCtrl, init form, init categories, cat: ",_this.categories);
                    for( j = 0; j < _this.categories.length; j++){
                        var cat = _this.categories[j];
                        console.log("EditorCtrl, init form, init category, cat: ",cat,type);
                        //non controllo ma lavoro sul risultato prima di mandarlo al server
                        //if(cat.entities.indexOf(type) > -1 ){
                            _this.wizard.dataForm.categories.push( {categories:[],category_space:cat.category_space}); 
                        //}
                    }
                    console.log("EditorCtrl, end init form, init categories: ",_this.categories, _this.wizard.dataForm.categories);

                    // gestione relazioni da parametro search nel caso arrivassi da una add in una modal
                    // controllo che non sia settato una rel tra quelle definite per il tipo
                    var rels = _this.config.types.relations;
                    //console.log("relazioni da controllare ",rels.length," in $stateParams ",$stateParams);
                    for( i = 0 ; i < rels.list.length ; i++ ){
                        //console.log("controllo regola ",i+1,rels[i]);
                        var key = rels.list[i],
                            field = rels.map[key];
                        // aggiungo il campo se trovo il parametro nella search
                        //console.log("check parametro ",key," in $stateParams ",$stateParams, " key, e field ",key,field);
                        if($stateParams[key]){
                            _this.wizard.dataForm[field] = parseInt($stateParams[key]);
                            console.log("Aggiunto il parametro ",field," con valore ",_this.wizard.dataForm[key]);
                        }
                    }
                    // fine gesione relazioni


                    // regole speciali per la gestione di alcuni campi
                    if(type)
                        _this.wizard.dataForm.entity_type = type;
                    if($stateParams.lng && $stateParams.lng)
                        _this.wizard.dataForm.geometries= [{type: "Point",coordinates: [$stateParams.lng,$stateParams.lat]}];
                    _this.wizard.dataForm.tags = [];
                    //_this.wizard.dataForm.categories = [];
                    if(name)
                        _this.wizard.dataForm.name = name;
                    if(description)
                        _this.wizard.dataForm.description = description;
                    if(self.currentUser.id)
                        _this.wizard.dataForm.user = parseInt(self.currentUser.id);
                    //regole per gli eventi
                    if(self.currentUser.id && _this.checkList.organizer)
                        _this.wizard.dataForm.organizer = parseInt(self.currentUser.id);
                    // template timepicker door_time
                    if(_this.checkList.door_time){
                        initDoorTime();
                    }
                    // template timepicker duration
                    if(_this.checkList.duration){
                        initDuration();
                    }
                    //fine regole eventi

                    // fine regole gestione campi speciali
                    console.log("EditCtrl, init del form: ",_this.wizard.dataForm);


                }

            } else {console.log("Ignoro perche' vengo da: ",previousState.state.name);}
        });



        // filtro maggiore di per l'editor del place
        _this.greaterThan = function(prop, val){
            return function(item){
                return item[prop] > val;
            }
        };
        // filtro "diverso da" di per l'editor del place
        _this.differentThan = function(prop, val){
            return function(item){
                return item[prop] != val;
            }
        };


        // funzioni di callback per i datapicker 
        _this.datePickerFrom = function (val) {
            //console.log("date picker from!");
            if(typeof(val)==='undefined'){      
                //console.log('Date not selected');
                _this.valid_from = false;
            }else{
                //console.log('Selected date is : ', val);
                _this.valid_from = true;

            }
        };
        _this.datePickerTo = function (val) {
            if(typeof(val)==='undefined'){      
                //console.log('Date not selected');
                _this.valid_to = false;
            }else{
                //console.log('Selected date is : ', val);
                _this.valid_to = true;
            }
        };

        _this.loadTags = function($query) {
            return TagsService.query($query).then(function(response) {
                console.log("EditorCtrl, loadTags response: ",response);
                return response.filter(function(resp) {
                    //console.log(resp);
                    return resp.tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            });
        }    



        // bug normalizzo i tag
        _this.normalizeTags = function(tags){
            var oldTags= tags,
                newTag = "";

            for(i in tags){
                newTag += String(oldTags[i].tag)+",";
                //console.log("tag", newTag[i]);
            }
            return newTag.substring(0,newTag.length-1).split(",");
        }



        _this.close = function() {
            //console.log("Close intro!", _this.wizard.dataForm.tags);
            $state.centerParam = 0;
            //$state.mode = "cancel";
            //$window.history.back();
            _this.wizard.dataForm = {};
            $state.go('app.maps',{lat:$stateParams.lat,lng:$stateParams.lng,place:$stateParams.id});
        };



        _this.wizard.isFirstStep = function () {
            return _this.wizard.step === 0;
        };

        _this.wizard.isLastStep = function () {
            return _this.wizard.step === (_this.wizard.steps.length - 1);
        };

        _this.wizard.isCurrentStep = function (step) {
            return _this.wizard.step === step;
        };

        _this.wizard.setCurrentStep = function (step) {
            _this.wizard.step = step;
        };

        _this.wizard.getCurrentStep = function () {
            return _this.wizard.steps[_this.wizard.step];
        };

        _this.wizard.getNextLabel = function () {
            //console.log(_this.form);
            return (_this.wizard.isLastStep()) ? 'Submit' : 'Next';
        };

        _this.wizard.handlePrevious = function () {
            _this.wizard.step -= (_this.wizard.isFirstStep()) ? 0 : 1;
        };

        _this.wizard.handleNext = function (isValid) {
            console.log("handlenext: ");
            console.log(isValid);
            if(!isValid){
                console.log("errore, form non valido!");
            } else if (_this.wizard.isLastStep()) {
                processData();
            } else {
                _this.wizard.step += 1;
            }
        };

        // preparo i dati del form per le chiamate al server
        function processData() {
            // apro schermata di loading
            showLoadingScreen('Salvataggio in corso...', _this.wizard.dataForm);
            var dataForServer = _this.wizard.dataForm;
            // set del parent id
            //console.log("parent_id normalizzato", dataForServer.parent_id.originalObject.id);
            if( dataForServer.parent_id != null && dataForServer.parent_id.originalObject != null && dataForServer.parent_id.originalObject.id != null){

                dataForServer.parent_id = dataForServer.parent_id.originalObject.id;
            }
            //normalizzazz. tags
            for(var el in _this.wizard.dataForm.tags){
                dataForServer.tags[el] = _this.wizard.dataForm.tags[el].tag;   
            }
            // elimino categorizzazioni vuote
            var catsTmp = [];
            //console.log("EditorCtrl, processData, check categorie: ",_this.wizard.dataForm.categories);
            for(var i = 0; i < _this.wizard.dataForm.categories.length; i++){
                var c = _this.wizard.dataForm.categories[i];
                if(c.categories.length > 0){
                    catsTmp.push(c);
                }
            }
            _this.wizard.dataForm.categories = catsTmp;
            //console.log("EditorCtrl, processData, check categorie: ",catsTmp, _this.wizard.dataForm.categories);
            
            //accettaz. date
            if(!_this.valid_from)
                dataForServer.valid_from = null;
            if(!_this.valid_to)
                dataForServer.valid_to = null;

            if(_this.checkList.duration && _this.wizard.dataForm.door_time && _this.wizard.dataForm.close_time){
                var duration = 0;
                if(dataForServer.valid_from && dataForServer.valid_to){
                    // differenza tra giorni
                    duration += (dataForServer.valid_to - dataForServer.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    //console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    //console.log("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (_this.wizard.dataForm.close_time - _this.wizard.dataForm.door_time);  
                    console.log("EditorCtrl, calcolo durata:",duration);
                    dataForServer.duration = duration;
                }else{
                    dataForServer.duration = _this.wizard.dataForm.close_time - _this.wizard.dataForm.door_time;
                }
            }

            if(dataForServer.title)
                delete dataForServer.title;

            if(dataForServer.type){
                console.log("trovato il type: ", dataForServer.type);
                dataForServer.type = parseInt(dataForServer.type);
            }

            //console.log("Nel json: ", dataForServer.categories[0]," (", typeof(dataForServer.categories[0]),")", " --> ", _this.categories[dataForServer.categories[0]].name);

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
                },function(error){
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
                typeIndex = _this.types.list.map(function(e){return e.key;}).indexOf(mark.entity_type);
                type = _this.types.list[typeIndex].key;
                //console.log('EditorCtrl, edit marker, tipo: ', type, " con indice: ", typeIndex, " permessi: ", _this.perms[typeIndex]);
            }

            //imposto i permessi
            _this.checkList = angular.copy(_this.perms[typeIndex]);

            console.log("EditorCtrl, setToEdit, checkList: ", _this.checkList);
            console.log("EditorCtrl received marker: ", mark, _this.types.list[ typeIndex ]);

            _this.wizard.dataForm = angular.copy(mark);
            _this.wizard.dataForm.title = self.labels.edit.concat(_this.types.list[ typeIndex ].name);
            // gestione logica di alcuni campi particolari
            if(mark.geometries){
                _this.wizard.dataForm.geometries = [{type: "Point",coordinates: [mark.lng,mark.lat]}];
            }
            if(mark.valid_from){
                _this.wizard.dataForm.valid_from = new Date(mark.valid_from);
            }else{_this.wizard.dataForm.valid_from =null; }
            if(mark.valid_to){
                _this.wizard.dataForm.valid_to = new Date(mark.valid_to);
            }else{_this.wizard.dataForm.valid_to =null; }
            if(self.currentUser.id)
                _this.wizard.dataForm.user = parseInt(self.currentUser.id);
            if(mark.id_wp)
                _this.wizard.dataForm.id_wp = parseInt(mark.id_wp);
            // recupero le informazioni sul padre se gia' inserite
            if( mark.parent_id != null && mark.parent_id !== "undefined"){
                console.log("ha un parent! ", mark.parent_id);
                _this.wizard.dataForm.parent_id = parseInt(mark.parent_id);
                setParent(mark.parent_id);
            }
            // se door_time e' richiesto e non e' nel marker
            if(_this.checkList.door_time && !_this.wizard.dataForm.door_time){
                //console.log("Entro in initDoorTime");
                initDoorTime();
            }
            // se duration e' richiesto e non e' nel marker
            if(_this.checkList.duration && !_this.wizard.dataForm.duration){
                //console.log("Entro in initDuration");
                initDuration();
            }
            //console.log("EditorCtrl, checkList: ", _this.checkList);

        }


        // ricerca tra i place per l'autocomplete del campo place_id
        /* da cancellare uso api di ricerca
        _this.searchSource = [];

        function initSearchSource () {
            // creo il buffer di ricerca 
            entityFactory.getAll().then(function(markers){

                console.log("EditorCtrl, initSearchSource, marker per il buffer: ", markers);
                // bug deve essere dinamico            
                for (i in markers){
                    _this.searchSource.push(angular.fromJson(angular.toJson(markers[i])));
                }

                //console.log("init sorgente di ricerca per l'autocomplete del campo place_id", typeof(_this.searchSource),_this.searchSource);
            });


        };*/
        function setParent(parent_id){
            console.log("carico il parent ", parent_id);
            entityFactory.get(parseInt(parent_id)).then(
                function(mark){
                    console.log("parent ", mark);
                    _this.wizard.dataForm.parent_id = mark;
                    // originalObject e' un campo di angucomplete, lo simuliamo inserendoci solo l'id
                    // originalObject viene utilizzato per costruire i dati per l'inserimento nel server
                    _this.wizard.dataForm.parent_id.originalObject = {};
                    _this.wizard.dataForm.parent_id.originalObject.id = mark.id;
                    console.log("set del parent ",_this.wizard.dataForm.parent_id);
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
            console.log("EditorCtrl, initDoorTime, c'e' door_time? ",_this.checkList.door_time);
            var inputEpochTime = null;
            if(_this.wizard.dataForm.door_time)
                inputEpochTime = _this.wizard.dataForm.door_time;
            
            _this.checkList.door_time.template = {
                inputEpochTime: inputEpochTime,//((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: _this.checkList.door_time.label,  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    doorTimeCallback(val)
                }
            }
            _this.wizard.dataForm.door_time = _this.checkList.door_time.template.inputEpochTime;
            console.log("EditorCtrl, initDoorTime, aggiunta durata ",_this.checkList.door_time.template.inputEpochTime," a ",_this.wizard.dataForm.door_time);
        }
        function doorTimeCallback(val) {    
            if(val){
                console.log("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.close_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    console.log("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (_this.wizard.dataForm.close_time - val);  
                    console.log("considero anche l'orario, durata:",duration);

                    if(duration >= 0){
                        _this.wizard.dataForm.door_time = val;
                        _this.wizard.dataForm.duration = duration;
                    }else{
                        _this.wizard.dataForm.door_time = _this.wizard.dataForm.close_time;
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
                    _this.wizard.dataForm.door_time = val;
                }
            }else{_this.wizard.dataForm.door_time = null;}
        }
        function initDuration(){
            _this.checkList.close_time = angular.copy(_this.checkList.duration);
            _this.wizard.dataForm.close_time = null;
            _this.checkList.close_time.template = {
                inputEpochTime: _this.wizard.dataForm.close_time,// ((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: _this.checkList.close_time.label,  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    durationCallback(val);
                }
            }
            _this.wizard.dataForm.close_time = _this.checkList.close_time.template.inputEpochTime;
            console.log("EditorCtrl, initDuration, aggiunta durata ",_this.checkList.close_time," a ",_this.wizard.dataForm.close_time);
        }
        function durationCallback(val){
            if(val){
                console.log("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.door_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    console.log("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (val - _this.wizard.dataForm.door_time);  
                    console.log("considero anche l'orario, durata:",duration);

                    if(duration >= 0){
                        _this.wizard.dataForm.close_time = val;
                        _this.wizard.dataForm.duration = duration;
                    }else{
                        _this.wizard.dataForm.close_time = _this.wizard.dataForm.door_time;
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
                    _this.wizard.dataForm.close_time = val;
                }
            }else{_this.wizard.dataForm.close_time = null;}
        }

    }]);
angular.module('firstlife.controllers')
    .controller('EditorCtrl', ['myConfig', 'entityFactory', '$state', '$scope','$stateParams', '$ionicPopup', 'entityFactory', 'EntityService', '$window', '$filter', 'TagsService', 'MemoryFactory', 'MapService', '$ionicLoading', '$previousState', '$log', function(myConfig, entityFactory, $state, $scope, $stateParams, $ionicPopup, entityFactory, EntityService, $window, $filter, TagsService, MemoryFactory, MapService, $ionicLoading, $previousState, $log) {

        var _this = this;
        _this.config = myConfig;

        _this.translator = $filter('translate');

        // oggetto contenente i form in modo da potene verificare la validità fuori scope
        _this.form = {};

        var dev = false;
       


        _this.wizard = {};
        _this.wizard.steps = ['Info', 'Category'];
        _this.wizard.step = 0; 

        //init checker controllo date inserite nei datapicker
        _this.valid_from = false;
        _this.valid_to = false;

        _this.types = _this.config.types;
        _this.categories = myConfig.types.categories;
        if(dev) console.log("categorie in EditorCtrl", _this.categories);
        
        
        _this.currentUser = MemoryFactory.readUser();
        _this.labels = {
            edit: "EDIT",
            create: "CREATE"
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


        _this.removeThumbnail = function(){
            delete _this.wizard.dataForm.thumbnail;
            return false;
        }




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

            // attualmente non e' necessario gestire gli stati di arrivo
            if(previousState && previousState.state && previousState.state.name === 'app.maps'){
                if(dev) console.log("sono in EditorCtrl e vengo da ", previousState, " parametri di cambio stato: ",$stateParams, toState, toParams, fromState, fromParams);

                // da cancellare initSearchSource();

                _this.currentUser = MemoryFactory.readUser();
                if(dev) console.log("EditorCtrl, $on $stateChangeSuccess, MemoryFactory.readUser() : ", _this.currentUser);

                // gestione del tipo
                var type = _this.types.default.key,
                    typeIndex = _this.types.default.id;

                // scelgo se fare update di un marker esistente o crearne uno nuovo
                // update place: init dataForm con dati del place...
                if($stateParams.id!= null && $stateParams.id!= ""){
                    //get place(id)
                    entityFactory.get($stateParams.id, true)
                        .then( function(mark) {

                        //todo gestisco la nuova posizione
                        mark.coordinates = [$stateParams.lng,$stateParams.lat];
                        mark.lat = $stateParams.lat;
                        mark.lng = $stateParams.lng;
                        // init dell'edit
                        setToEdit(mark);
                        //bug datapicker che non modifica la data a cacchio
                        // se la data e' settata allora metto a true il check
                        if(_this.wizard.dataForm.valid_from)
                            _this.valid_from = true
                        if(_this.wizard.dataForm.valid_to)
                            _this.valid_to = true
                    },function(error) {
                        if(dev) console.log("EditorCtrl, cambio di stato, edit marker, entityFactory.get, errore: ",error); 
                    });
                }
                //create place: init empty dataForm
                else{
                    // se il type e' settato
                    if($stateParams.entity_type){
                        typeIndex = _this.types.list.map(function(e){return e.slug;}).indexOf($stateParams.entity_type);
                        type = _this.types.list[typeIndex].key;
                        if(dev) console.log('EditorCtrl, creazione marker, tipo: ', type, " con indice: ", typeIndex );
                        _this.wizard.title = _this.labels.create;
                        _this.wizard.entityLabel = _this.types.list[typeIndex].name;
                    }

                    //imposto i permessi
                    _this.checkList = _this.config.types.perms[type];
                    if(dev) console.log("EditorCtrl, checkList: ", _this.checkList);
                    
                    // recupero i default per l'init dell'entita'
                    angular.extend(_this.wizard.dataForm,EntityService.getDefaults($stateParams.entity_type));
                    if(dev) console.log("EditCtrl, init form: ",_this.wizard.dataForm);
                    
                    // sistemo le coordinate
                    if($stateParams.lng && $stateParams.lng){
                        _this.wizard.dataForm.coordinates = [parseFloat($stateParams.lng),parseFloat($stateParams.lat)];
                    }

                    // gestione relazioni da parametro search nel caso arrivassi da una add in una modal
                    // controllo che non sia settato una rel tra quelle definite per il tipo
                    var rels = _this.config.types.relations;
                    if(dev) console.log("relazioni da controllare ",rels.map, rels.list.length," in $stateParams ",$stateParams);
                    for( var i = 0 ; i < rels.list.length ; i++ ){
                        if(dev) console.log("controllo regola ",i+1,rels[i]);
                        var key = rels.list[i],
                            field = rels.map[key];
                        // aggiungo il campo se trovo il parametro nella search
                        if(dev) console.log("check parametro ",key," in $stateParams ",$stateParams, " key, e field ",key,field);
                        if($stateParams[key] && $stateParams[key] !=='undefined'){
                            _this.wizard.dataForm[field] = parseInt($stateParams[key]);
                            if(dev) console.log("Aggiunto il parametro ",field," con valore ",_this.wizard.dataForm[key]);
                        }
                    }
                    // fine gesione relazioni

                    
                    //fine regole eventi

                    // template timepicker door_time
                    if(_this.checkList.door_time){
                        initDoorTime();
                    }
                    // template timepicker duration
                    if(_this.checkList.duration){
                        initDuration();
                    }
                    
                    // fine regole gestione campi speciali
                    if(dev) console.log("EditCtrl, init del form: ",_this.wizard.dataForm);


                }
                // gestione di stati di arrivo diversi non necessaria
            } else {
                if(dev) console.log("Ignoro perche' vengo da un altro stato o via link diretto, faccio redirect a app.maps");
                if($stateParams && $stateParams.lat && $stateParams.lng)
                    $state.go('app.maps',{lat:$stateParams.lat,lng:$stateParams.lng});
                else
                    $state.go('app.maps');
            }
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
            if(dev) console.log("date picker from!", val);
            if(typeof(val)==='undefined'){      
                if(dev) console.log('Date not selected');
                _this.valid_from = false;
                _this.wizard.dataForm.valid_from = null;
            }else{
                if(dev) console.log('Selected date is : ', val);
                _this.valid_from = true;

            }
        };
        _this.datePickerTo = function (val) {
            if(dev) console.log("date picker to!", val);
            if(typeof(val)==='undefined'){      
                if(dev) console.log('Date not selected');
                _this.valid_to = false;
                _this.wizard.dataForm.valid_to = null;
            }else{
                if(dev) console.log('Selected date is : ', val);
                _this.valid_to = true;
            }
        };

        _this.loadTags = function($query) {
            return TagsService.query($query).then(function(response) {
                if(dev) console.log("EditorCtrl, loadTags response: ",response);
                return response.filter(function(resp) {
                    if(dev) console.log(resp);
                    return resp.tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            });
        }    

        $scope.isCatRelevant = function (item) { 
            var check = ((item.entities.indexOf(_this.wizard.dataForm.entity_type) > -1) && item.is_editable);    
            if(dev) console.log("filtro ",item, check);
            return check; 
        };

        // bug normalizzo i tag
        _this.normalizeTags = function(tags){
            var oldTags= tags,
                newTag = "";

            for(i in tags){
                newTag += String(oldTags[i].tag)+",";
                if(dev) console.log("tag", newTag[i]);
            }
            return newTag.substring(0,newTag.length-1).split(",");
        }



        _this.close = function() {
            if(dev) console.log("Editor Ctrl, chiudo wizard ", $stateParams);
            //$state.mode = "cancel";
            //$window.history.back();
            _this.wizard.dataForm = {};
            $state.go('app.maps',{lat:$stateParams.lat,lng:$stateParams.lng});
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
            if(dev) console.log(_this.form);
            return (_this.wizard.isLastStep()) ? 'Submit' : 'Next';
        };

        _this.wizard.handlePrevious = function () {
            _this.wizard.step -= (_this.wizard.isFirstStep()) ? 0 : 1;
        };

        _this.wizard.handleNext = function (isValid) {
            if(dev) console.log("handlenext: ", _this.wizard.dataForm);
            if(dev) console.log(isValid);
            if(!isValid){
                if(dev) console.log("errore, form non valido!");
            } else if (_this.wizard.isLastStep()) {
                if(dev) console.log("form valido ",_this.wizard.dataForm);
                processData();
            } else {
                _this.wizard.step += 1;
            }
        };

        _this.wizard.save = function(){
            if(dev) console.log("form valido ",_this.wizard.dataForm);
            processData();
        }
        
        // preparo i dati del form per le chiamate al server
        function processData() {
            if(dev) console.log("process data:", _this.wizard.dataForm);
            // apro schermata di loading
            showLoadingScreen($filter('translate')('SAVING_MESSAGE'), _this.wizard.dataForm);
            var dataForServer = _this.wizard.dataForm;
            
            // set del parent id
            if( dataForServer.parent_id != null && dataForServer.parent_id.originalObject != null && dataForServer.parent_id.originalObject.id != null){
                if(dev) console.log("parent_id normalizzato", dataForServer.parent_id.originalObject.id);
                dataForServer.parent_id = dataForServer.parent_id.originalObject.id;
            }
            
            
            
            /*
             * Regole dell'editor
             */
            
            //normalizzazz. tags
            for(var el in _this.wizard.dataForm.tags){
                dataForServer.tags[el] = _this.wizard.dataForm.tags[el].tag;   
            }

            //accettaz. date
            if(!_this.valid_from){ // null se non sono state impostate
                dataForServer.valid_from = null;
            } 
            if(!_this.valid_to){
                dataForServer.valid_to = null;
            }

            // fix editor
            // tolgo il titolo
            if(dataForServer.title)
                delete dataForServer.title;
            
            dataForServer = EntityService.processData(dataForServer);

            //update a place
            if($stateParams.id !=null && $stateParams.id !=""){

                //dataForServer.id=$stateParams.id;
                entityFactory.update(dataForServer, $stateParams.id)
                    .then(function(newplace){
                    if(dev) console.log("update completed: ", newplace);
                    //$state.mode = "update";

                    // vado alla mappa e mostro la modal del place
                    $state.go("app.maps",{entity: newplace.id});

                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return newplace.id;
                },function(error){
                    if(dev) console.log("update failed: ", error);

                    //$window.history.back();
                    $state.go("app.maps",{lat:$stateParams.lat,lng:$stateParams.lng,zoom:$stateParams.zoom,entity:-1});
                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return -1;
                });

            }
            //create place
            else{
                MapService.createMarker(dataForServer)
                    .then(function(newplace){
                    if(dev) console.log("creation completed: ", newplace);
                    //$state.mode = "create";

                    // vado alla mappa e mostro la modal del place
                    $state.go("app.maps",{entity: newplace.id});

                    //chiudo la schermata di loading
                    hideLoadingScreen();
                    return newplace.id;
                },function(error){
                    if(dev) console.log("creation failed: ", error);
                    $state.go("app.maps",{entity:-1});
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
        function setToEdit(data){
            
            var mark = EntityService.preprocessMarker(data);
            // se il type e' settato
            if(mark.entity_type){
                typeIndex = _this.types.list.map(function(e){return e.key;}).indexOf(mark.entity_type);
                type = _this.types.list[typeIndex].key;
                if(dev) console.log('EditorCtrl, edit marker, tipo: ', type, " con indice: ", typeIndex, " permessi: ", _this.perms[typeIndex]);
            }
            
            //imposto i permessi
            _this.checkList = angular.copy(_this.types.perms[type]);

            if(dev) console.log("EditorCtrl, setToEdit, checkList: ", _this.checkList);
            if(dev) console.log("EditorCtrl received marker: ", mark, _this.types.list[ typeIndex ]);

            _this.wizard.dataForm = angular.copy(mark);
            _this.wizard.title = _this.labels.edit;
            _this.wizard.entityLabel = _this.types.list[typeIndex].name;
            // gestione logica di alcuni campi particolari
            if(mark.coordinates){
                _this.wizard.dataForm.coordinates = [mark.lng,mark.lat];
            }
//            if(mark.valid_from){
//                _this.wizard.dataForm.valid_from = new Date(mark.valid_from);
//            }else{_this.wizard.dataForm.valid_from =null; }
//            if(mark.valid_to){
//                _this.wizard.dataForm.valid_to = new Date(mark.valid_to);
//            }else{_this.wizard.dataForm.valid_to =null; }
            if(_this.currentUser.id)
                _this.wizard.dataForm.user = parseInt(_this.currentUser.id);
            if(mark.id_wp)
                _this.wizard.dataForm.id_wp = parseInt(mark.id_wp);
            // recupero le informazioni sul padre se gia' inserite
            if( mark.parent_id != null && mark.parent_id !== "undefined"){
                if(dev) console.log("ha un parent! ", mark.parent_id);
                _this.wizard.dataForm.parent_id = parseInt(mark.parent_id);
                setParent(mark.parent_id);
            }
            // se door_time e' richiesto e non e' nel marker
            if(_this.checkList.door_time && !_this.wizard.dataForm.door_time){
                if(dev) console.log("Entro in initDoorTime");
                initDoorTime();
            }
            // se duration e' richiesto e non e' nel marker
            if(_this.checkList.duration && !_this.wizard.dataForm.duration){
                if(dev) console.log("Entro in initDuration");
                initDuration();
            }
            if(dev) console.log("EditorCtrl, checkList: ", _this.checkList);
        }


        // ricerca tra i place per l'autocomplete del campo place_id
        /* da cancellare uso api di ricerca
        _this.searchSource = [];

        function initSearchSource () {
            // creo il buffer di ricerca 
            entityFactory.getAll().then(function(markers){

                if(dev) console.log("EditorCtrl, initSearchSource, marker per il buffer: ", markers);
                // bug deve essere dinamico            
                for (i in markers){
                    _this.searchSource.push(angular.fromJson(angular.toJson(markers[i])));
                }

                if(dev) console.log("init sorgente di ricerca per l'autocomplete del campo place_id", typeof(_this.searchSource),_this.searchSource);
            });


        };*/
        function setParent(parent_id){
            if(dev) console.log("carico il parent ", parent_id);
            entityFactory.get(parseInt(parent_id)).then(
                function(mark){
                    if(dev) console.log("parent ", mark);
                    _this.wizard.dataForm.parent_id = mark;
                    // originalObject e' un campo di angucomplete, lo simuliamo inserendoci solo l'id
                    // originalObject viene utilizzato per costruire i dati per l'inserimento nel server
                    _this.wizard.dataForm.parent_id.originalObject = {};
                    _this.wizard.dataForm.parent_id.originalObject.id = mark.id;
                    if(dev) console.log("set del parent ",_this.wizard.dataForm.parent_id);
                }
            );
        }
        function showLoadingScreen(text){
            if(text === 'undefined'){
                text = $filter('translate')('LOADING_MESSAGE');
            }

            $ionicLoading.show({
                template: text
            });

        }
        function hideLoadingScreen(){
            $ionicLoading.hide();
        }
        function initDoorTime(){
            if(dev) console.log("EditorCtrl, initDoorTime, c'e' door_time? ",_this.checkList.door_time,_this.wizard.dataForm.door_time);
            var inputEpochTime = null;

            if(_this.wizard.dataForm.door_time)
                inputEpochTime = angular.copy(_this.wizard.dataForm.door_time);

            angular.extend(_this.checkList.door_time, {template:{
                inputEpochTime: inputEpochTime,//((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $filter('translate')(_this.checkList.door_time.label),  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    doorTimeCallback(val)
                }
            }});
            //_this.checkList.door_time["template"] = template;
            _this.wizard.dataForm.door_time = angular.copy(_this.checkList.door_time.template.inputEpochTime);
            if(dev) console.log("EditorCtrl, initDoorTime, aggiunta durata ", _this.checkList.door_time.template," a ",_this.wizard.dataForm.door_time);
        }
        function doorTimeCallback(val) {    
            if(val){
                if(dev) console.log("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.close_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    if(dev) console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    if(dev) console.log("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (_this.wizard.dataForm.close_time - val);  
                    if(dev) console.log("considero anche l'orario, durata:",duration);

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
                                         if(dev) console.log('Reset orario');
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

            var inputEpochTime = null;
            if(_this.wizard.dataForm.close_time)
                inputEpochTime = angular.copy(_this.wizard.dataForm.close_time);

            angular.extend(_this.checkList.close_time,{template : {
                inputEpochTime: inputEpochTime,// ((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $filter('translate')(_this.checkList.close_time.label),  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    durationCallback(val);
                }
            }});

            _this.wizard.dataForm.close_time = angular.copy(_this.checkList.close_time.template.inputEpochTime);
            if(dev) console.log("EditorCtrl, initDuration, aggiunta durata ",_this.checkList.close_time.template," a ",_this.wizard.dataForm.close_time);
        }
        function durationCallback(val){
            if(val){
                if(dev) console.log("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.door_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    if(dev) console.log("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    if(dev) console.log("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (val - _this.wizard.dataForm.door_time);  
                    if(dev) console.log("considero anche l'orario, durata:",duration);

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
                             if(dev) console.log('Reset orario');
                           });*/
                    }
                }else{
                    // se non door_time non e' impostato non devo controllare
                    _this.wizard.dataForm.close_time = val;
                }
            }else{_this.wizard.dataForm.close_time = null;}
        }

    }]);
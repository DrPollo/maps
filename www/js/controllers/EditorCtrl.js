angular.module('firstlife.controllers')
    .controller('EditorCtrl', ['myConfig', 'entityFactory', '$state', '$scope','$location', '$ionicPopup', 'entityFactory', 'EntityService', '$window', '$filter', '$ionicLoading', '$previousState', '$log', 'TagsService', 'MemoryFactory', 'MapService',  'AuthService', function(myConfig, entityFactory, $state, $scope, $location, $ionicPopup, entityFactory, EntityService, $window, $filter,$ionicLoading, $previousState, $log, TagsService, MemoryFactory, MapService,  AuthService) {

        var _this = this;
        _this.config = myConfig;

        _this.translator = $filter('translate');

        // oggetto contenente i form in modo da potene verificare la validità fuori scope
        _this.form = {};

        var dev = false;

        _this.listOfTypes = $filter('orderBy')(myConfig.types.list,'id');

        _this.wizard = {};
        _this.wizard.steps = ['Info', 'Category'];
        _this.wizard.step = 0;
        // init form di raccolta tipo
        _this.typeform = {};


        //init checker controllo date inserite nei datapicker
        _this.valid_from = false;
        _this.valid_to = false;

        _this.types = _this.config.types;
        _this.categories = myConfig.types.categories;
        // $log.debug("categorie in EditorCtrl", _this.categories);


        _this.currentUser = AuthService.getUser();
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

            var params = $location.search();

            //recupero lo stato precedente!
            var previousState = $previousState.get();

            // attualmente non e' necessario gestire gli stati di arrivo
            if(previousState && previousState.state && previousState.state.name === 'app.maps'){
                $log.debug("sono in EditorCtrl e vengo da ", previousState, " parametri di cambio stato: ",params, toState, toParams, fromState, fromParams);

                // da cancellare initSearchSource();

                _this.currentUser = AuthService.getUser();

                // gestione del tipo
                var type = _this.types.default.key,
                    typeIndex = _this.types.default.id;

                // scelgo se fare update di un marker esistente o crearne uno nuovo
                // update place: init dataForm con dati del place...
                $log.debug('update?',(params.id && params.id!= ""),params.id)

                if(params.id && params.id != ""){
                    $scope.chooseType = false;
                    //get place(id)
                    entityFactory.get(params.id, true)
                        .then( function(mark) {

                            //todo gestisco la nuova posizione
                            mark.coordinates = [params.lng,params.lat];
                            mark.lat = parseFloat(params.lat);
                            mark.lng = parseFloat(params.lng);
                            mark.zoom_level = parseInt(params.zoom_level);
                            // init dell'edit
                            setToEdit(mark);
                            //bug datapicker che non modifica la data a cacchio
                            // se la data e' settata allora metto a true il check
                            if(_this.wizard.dataForm.valid_from)
                                _this.valid_from = true
                            if(_this.wizard.dataForm.valid_to)
                                _this.valid_to = true

                        },function(error) {
                            // $log.debug("EditorCtrl, cambio di stato, edit marker, entityFactory.get, errore: ",error);
                        });
                }
                //create place: init empty dataForm
                else{
                    // init del titolo 
                    _this.wizard.title = _this.labels.create;

                    // enables type form
                    $scope.chooseType = true;

                    // fine regole gestione campi speciali
                    $log.debug("EditCtrl, init del form: ",_this.wizard.dataForm);
                }
                // gestione di stati di arrivo diversi non necessaria
            } else {
                $log.debug("Ignoro perche' vengo da un altro stato o via link diretto, faccio redirect a app.maps");
                if(params && params.lat && params.lng)
                    $state.go('app.maps',{lat:params.lat,lng:params.lng});
                else
                    $state.go('app.maps');
            }
        });



        $scope.$watch(function(){return _this.wizard.dataForm.entity_type},function(e,old){
            if(e && e != old){
                initEntity(e);
            }
        })

        function initEntity(entity_type){
            var params = $location.search();

            $log.debug('entity_type',entity_type,_this.types.list.map(function(e){return e.key;}))

            var typeIndex = _this.types.list.map(function(e){return e.key;}).indexOf(entity_type);
            var type = _this.types.list[typeIndex].key;
            //$log.debug('EditorCtrl, creazione marker, tipo: ', type, " con indice: ", typeIndex );
            _this.wizard.title = _this.labels.create;
            _this.wizard.entityLabel = _this.types.list[typeIndex].name;


            //imposto i permessi
            _this.checkList = _this.config.types.perms[type];
            //$log.debug("EditorCtrl, checkList: ", _this.checkList);

            // recupero i default per l'init dell'entita'
            angular.extend(_this.wizard.dataForm,EntityService.getDefaults(entity_type));

            // sistemo le coordinate
            if(params.lat && params.lng){
                _this.wizard.dataForm.coordinates = [parseFloat(params.lng),parseFloat(params.lat)];
                $log.debug('fix coordinates',parseFloat(params.lng),parseFloat(params.lat),_this.wizard.dataForm.coordinates )
            }
            // sistemo zoom_level
            if(params.zoom_level){
                _this.wizard.dataForm.zoom_level = parseInt(params.zoom_level);
            }

            // bug datapicker che non modifica la data a cacchio
            // se la data e' settata allora metto a true il check
            if(_this.wizard.dataForm.valid_from){
                _this.valid_from = true
            }
            if(_this.wizard.dataForm.valid_to){
                _this.valid_to = true
            }

            // gestione relazioni da parametro search nel caso arrivassi da una add in una modal
            // controllo che non sia settato una rel tra quelle definite per il tipo
            var parentId = params.rel;
            var parentType = params.parent_type;
            if(parentId && parentType){
                var types = _this.config.types.list;
                var index = types.map(function(e){return e.key}).indexOf(parentType)
                var field = types[index].relations[entity_type].field ? types[index].relations[entity_type].field : 'generic_rel';
                _this.wizard.dataForm[field] = parentId;
            }


            // template timepicker door_time
            if(_this.checkList.door_time){
                initDoorTime();
            }
            // template timepicker duration
            if(_this.checkList.duration){
                initDuration();
            }

            // fine gesione relazioni
        }


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
            // $log.debug("date picker from!", val);
            if(typeof(val)==='undefined'){
                // $log.debug('Date not selected');
                _this.valid_from = false;
                _this.wizard.dataForm.valid_from = null;
            }else{
                // $log.debug('Selected date is : ', val);
                _this.valid_from = true;

            }
        };
        _this.datePickerTo = function (val) {
            // $log.debug("date picker to!", val);
            if(typeof(val)==='undefined'){
                // $log('Date not selected');
                _this.valid_to = false;
                _this.wizard.dataForm.valid_to = null;
            }else{
                // $log.debug('Selected date is : ', val);
                _this.valid_to = true;
            }
        };

        _this.loadTags = function($query) {
            return TagsService.query($query).then(function(response) {
                $log.debug("EditorCtrl, loadTags response: ",response);
                return response.filter(function(resp) {
                    $log.debug(resp);
                    return resp.tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            });
        }

        $scope.isCatRelevant = function (item) {
            var check = ((item.entities.indexOf(_this.wizard.dataForm.entity_type) > -1) && item.is_editable);
            //$log.debug("filtro categoria ",item, check, _this.wizard.dataForm.entity_type);
            return check;
        };

        // bug normalizzo i tag
        _this.normalizeTags = function(tags){
            var oldTags= tags,
                newTag = "";

            for(i in tags){
                newTag += String(oldTags[i].tag)+",";
                $log.debug("tag", newTag[i]);
            }
            return newTag.substring(0,newTag.length-1).split(",");
        }



        _this.close = function() {
            var params = $location.search();
            // $log.debug("Editor Ctrl, chiudo wizard ", params);
            //$state.mode = "cancel";
            //$window.history.back();
            _this.wizard.dataForm = {};
            $state.go('app.maps',{lat:params.lat,lng:params.lng});
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
            $log.debug(_this.form);
            return (_this.wizard.isLastStep()) ? 'Submit' : 'Next';
        };

        _this.wizard.handlePrevious = function () {
            _this.wizard.step -= (_this.wizard.isFirstStep()) ? 0 : 1;
        };

        _this.wizard.handleNext = function (isValid) {
            // $log.debug("handlenext: ", _this.wizard.dataForm);
            if(!isValid){
                $log.debug("errore, form non valido!");
            } else if (_this.wizard.isLastStep()) {
                // $log.debug("form valido ",_this.wizard.dataForm);
                processData();
            } else {
                _this.wizard.step += 1;
            }
        };

        _this.wizard.save = function(){
            // $log.debug("form valido ",_this.wizard.dataForm);
            processData();
        }

        // preparo i dati del form per le chiamate al server
        function processData() {
            var params = $location.search();
            // $log.debug("process data:", _this.wizard.dataForm);
            // apro schermata di loading
            showLoadingScreen($filter('translate')('SAVING_MESSAGE'), _this.wizard.dataForm);
            var dataForServer = _this.wizard.dataForm;

            // set del parent id
            if( dataForServer.parent_id != null && dataForServer.parent_id.originalObject != null && dataForServer.parent_id.originalObject.id != null){
                // $log.debug("parent_id normalizzato", dataForServer.parent_id.originalObject.id);
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

            $log.debug("dataForServer", dataForServer);
            dataForServer = EntityService.processData(dataForServer);
            $log.debug("dataForServer", dataForServer);
            //update a place
            if(params.id !=null && params.id !=""){

                //dataForServer.id=params.id;
                entityFactory.update(dataForServer, params.id)
                    .then(function(newplace){
                        //chiudo la schermata di loading
                        hideLoadingScreen();
                        $log.debug("update completed: ", newplace);
                        //$state.mode = "update";
                        // vado alla mappa e mostro la modal del place
                        $state.go("app.maps",{entity: newplace.id,lat:newplace.lat,lng:newplace.lng,zoom:params.zoom_level});

                        return newplace.id;
                    },function(error){
                        //chiudo la schermata di loading
                        hideLoadingScreen();

                        $log.error("update failed: ", error);

                        //$window.history.back();
                        $state.go("app.maps",{lat:params.lat,lng:params.lng,zoom:params.zoom_level,entity:-1});

                        return -1;
                    });

            }
            //create place
            else{
                MapService.createMarker(dataForServer)
                    .then(function(newplace){
                        //chiudo la schermata di loading
                        hideLoadingScreen();

                        //$log.debug("creation completed: ", newplace);
                        //$state.mode = "create";

                        // vado alla mappa e mostro la modal del place
                        $state.go("app.maps",{entity: newplace.id,lat:newplace.lat,lng:newplace.lng,zoom:params.zoom_level});


                        return newplace.id;
                    },function(error){
                        //chiudo la schermata di loading
                        hideLoadingScreen();
                        $log.error('creation error ',error);
                        // moderazione
                        var status = -2;
                        if(error.status == 500){
                            // errore di rete o bug
                            status = -1;
                        }
                        $state.go("app.maps",{entity:status,lat:params.lat,lng:params.lng,zoom:params.zoom_level});

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
            }

            //imposto i permessi
            _this.checkList = angular.copy(_this.types.perms[type]);

            // $log.debug("EditorCtrl, setToEdit, checkList: ", _this.checkList);
            // $log.debug("EditorCtrl received marker: ", mark, _this.types.list[ typeIndex ]);

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
                // $log.debug("ha un parent! ", mark.parent_id);
                _this.wizard.dataForm.parent_id = mark.parent_id;
                setParent(mark.parent_id);
            }
            // se door_time e' richiesto e non e' nel marker
            if(_this.checkList.door_time && !_this.wizard.dataForm.door_time){
                $log.debug("Entro in initDoorTime");
                initDoorTime();
            }
            // se duration e' richiesto e non e' nel marker
            if(_this.checkList.duration && !_this.wizard.dataForm.duration){
                $log.debug("Entro in initDuration");
                initDuration();
            }
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
            // $log.debug("carico il parent ", parent_id);
            entityFactory.get(parent_id).then(
                function(mark){
                    // $log.debug("parent ", mark);
                    _this.wizard.dataForm.parent_id = mark;
                    // originalObject e' un campo di angucomplete, lo simuliamo inserendoci solo l'id
                    // originalObject viene utilizzato per costruire i dati per l'inserimento nel server
                    _this.wizard.dataForm.parent_id.originalObject = {};
                    _this.wizard.dataForm.parent_id.originalObject.id = mark.id;
                    // $log.debug("set del parent ",_this.wizard.dataForm.parent_id);
                },
                function (err) {
                    $log.error('failed to load parent',parent_id,err)
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
            // $log.debug("EditorCtrl, initDoorTime, c'e' door_time? ",_this.checkList.door_time,_this.wizard.dataForm.door_time);
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
            // $log.debug("EditorCtrl, initDoorTime, aggiunta durata ", _this.checkList.door_time.template," a ",_this.wizard.dataForm.door_time);
        }
        function doorTimeCallback(val) {
            if(val){
                // $log.debug("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.close_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    // $log.debug("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    // $log.debug("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (_this.wizard.dataForm.close_time - val);
                    // $log.debug("considero anche l'orario, durata:",duration);

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
            // $log.debug("EditorCtrl, initDuration, aggiunta durata ",_this.checkList.close_time.template," a ",_this.wizard.dataForm.close_time);
        }
        function durationCallback(val){
            if(val){
                // $log.debug("Valore orario:",val);
                // se il door_time e' settato
                if(_this.wizard.dataForm.door_time){
                    var duration = 0;
                    // differenza tra giorni
                    duration += (_this.wizard.dataForm.valid_to - _this.wizard.dataForm.valid_from);
                    // bug la differenza tra date da un valore > 0 piccolo
                    // se la differenza e' minore di un giorno allora la setto a 0
                    // $log.debug("considero le date, durata:",duration);
                    if(duration < 3600*24)
                        duration = 0;
                    // $log.debug("considero le date, durata:",duration, " differenza tra orari? ", _this.wizard.dataForm.close_time, val);
                    // differenza tra orari
                    duration += (val - _this.wizard.dataForm.door_time);
                    // $log.debug("considero anche l'orario, durata:",duration);

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
angular.module('firstlife.controllers')
    .controller('EditorCtrl', ['$state', '$scope','$location', '$ionicPopup', '$window', '$filter', '$ionicLoading', '$log', '$ionicSlideBoxDelegate', '$timeout', '$ionicScrollDelegate','myConfig', 'EntityService', 'ThingsService',  'AuthService', 'PlatformService', 'SearchService', function($state, $scope, $location, $ionicPopup, $window, $filter,$ionicLoading, $log, $ionicSlideBoxDelegate,$timeout, $ionicScrollDelegate, myConfig, EntityService, ThingsService,  AuthService, PlatformService, SearchService) {

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
        $scope.checkList = {};



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


        $scope.isMobile = PlatformService.isMobile();

        // steps wizard
        $scope.wizardOptions = {
            loop: false,
            effect: 'fade',
            speed: 500
        };
        $scope.wizardSlider;

        $scope.getSlideBoxDelegateHandle = function(delegateIndex) {
            //get all the instances that ionic scroll delegate is handling
            var instances = $ionicSlideBoxDelegate["_instances"];
            //Create Instance you want to get
            var instance = null;
            for (var index in instances) {
                //set DelegateHandle value with your index
                //Ex) instances[index].$$delegateHandle = "slidebox"+index;
                //or just instances[index].$$delegateHandle = index;
                instances[index].$$delegateHandle = index;
                if (index == delegateIndex) {
                    instance = instances[index];
                }
            }
            return instance; //return the instance
        }

        /*
         * Listner
         * 1) cambio stato
         */
        // al cambio di stato
        $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
            if(event.preventEditorEvent)
                return
            event.preventEditorEvent = true;
            // se non devo gestire l'evento
            if(toState.name != 'app.editor')
                return;

            // disabilito swipe da mobile
            $ionicSlideBoxDelegate.$getByHandle('wizard').enableSlide(false);

            //recupero lo stato precedente!
            // var previousState = $previousState.get();
            // if( previousState && previousState.state && previousState.state.name == 'app.editor' )
            //     return

            $scope.chooseType = true;
            // cancello il form
            _this.wizard.dataForm = {};
            _this.wizard.step = 0;
            _this.wizard.index = 0;

            var params = $location.search();

            $log.log("sono in EditorCtrl  parametri di cambio stato: ",params, toState, toParams, fromState, fromParams);
            $log.log("check",$scope);
            // attualmente non e' necessario gestire gli stati di arrivo
            // if(previousState && previousState.state && previousState.state.name == 'app.maps'){

            // se non ho i parametri per il wizard o utente non loggato
            if( !params.lat && !params.id || !AuthService.isAuth()){
                // esco dal wizard
                $state.go('home');
            }

            // da cancellare initSearchSource();

            _this.currentUser = AuthService.getUser();


            $log.debug('update?',(params.id && params.id!= ""),params.id);


            // scelgo se fare update di un marker esistente o crearne uno nuovo
            // update place: init dataForm con dati del place...
            if(params.id && params.id != ""){
                $log.debug('update',params.id);
                _this.wizard.title = _this.labels.edit;
                _this.wizard.newThing = false;

                $scope.chooseType = false;



                //get place(id)
                ThingsService.get(params.id)
                    .then( function(mark) {
                        $log.debug('update marker',mark);
                        //todo gestisco la nuova posizione
                        mark.coordinates = params.lng && params.lat ?  [params.lng,params.lat] : mark.coordinates;
                        mark.lat = params.lat ? parseFloat(params.lat) : mark.lat;
                        mark.lng = params.lng ? parseFloat(params.lng) : mark.lng;
                        mark.zoom_level = params.zoom_level ? parseInt(params.zoom_level) : mark.zoom_level;
                        mark.area_id = params.area_id ? params.area_id.toString() : mark.area_id;

                        // init dell'edit
                        setToEdit(mark);

                        //gestione steps
                        $scope.wizardHandler = $ionicSlideBoxDelegate.$getByHandle('wizard');

                        // controllo se serve la scheda categorie
                        var check = $filter('filter')(_this.categories, $scope.isCatRelevant);
                        $scope.checkCat = ( check.length > 0 );
                        $log.log('skip to next',!$scope.checkCat);
                        var initialStep = 0;
                        if(!$scope.checkCat){
                            initialStep = 1;
                        }
                        $scope.wizardHandler.slide(initialStep);
                        $ionicScrollDelegate.scrollTop();
                        $scope.wizardHandler.update();
                        $scope.wizardIndex = $scope.wizardHandler.currentIndex() || 1;
                        $scope.wizardSteps = $scope.wizardHandler.slidesCount() || 2;

                        //bug datapicker che non modifica la data a cacchio
                        // se la data e' settata allora metto a true il check
                        if(_this.wizard.dataForm.valid_from)
                            _this.valid_from = true;
                        if(_this.wizard.dataForm.valid_to)
                            _this.valid_to = true;

                    },function(error) {
                        $log.error(error);
                    });

                // // valori per update (salto step tipo)
                // $timeout(function(){
                //     $scope.wizardHandler = $ionicSlideBoxDelegate.$getByHandle('wizard');
                //     $scope.wizardHandler.slide(0);
                //     $ionicScrollDelegate.scrollTop();
                //     $scope.wizardHandler.update();
                //     $scope.wizardIndex = $scope.wizardHandler.currentIndex() || 1;
                //     $scope.wizardSteps = $scope.wizardHandler.slidesCount() || 2;
                // },100);
            }
            //create place: init empty dataForm
            else{
                $log.debug('new thing');
                // init del titolo
                _this.wizard.title = _this.labels.create;
                _this.wizard.newThing = true;

                // enables type form
                $scope.chooseType = true;

                // fine regole gestione campi speciali
                $log.log("EditCtrl, init del form: ",_this.wizard);

                $timeout(function(){
                    $scope.wizardHandler = $ionicSlideBoxDelegate.$getByHandle('wizard');
                    $ionicScrollDelegate.scrollTop();
                    $scope.wizardHandler.update();
                    $log.debug('handler',$scope.wizardHandler);
                    $scope.wizardIndex = $scope.wizardHandler.currentIndex() || 1;
                    $scope.wizardSteps = $scope.wizardHandler.slidesCount() || 2;
                },100);
            }


        });

        // $timeout(function(){
        //     $scope.wizardIndex = $ionicSlideBoxDelegate.currentIndex() || 1;
        //     $scope.wizardSteps = $ionicSlideBoxDelegate.slidesCount();
        // },100);

        $scope.changeWizardStep = function (index) {
          $scope.wizardIndex = index+1;
        };

        $scope.initType = function (type) {
            initEntity(type);
            var check = $filter('filter')(_this.categories, $scope.isCatRelevant);
            $scope.checkCat = ( check.length > 0 );
            //$log.debug("filtro categoria ",item, check, _this.wizard.dataForm.entity_type);
            // $log.debug('check',(check.length > 0));
            // check cats
            if( $scope.checkCat ){
                $scope.nextStep();
            }else{
                $scope.wizardHandler.slide(2);
                $ionicScrollDelegate.scrollTop();
            }

            $scope.wizardHandler.update();
        }

        $scope.nextStep = function(){
            // passo allo step 2
            // $log.debug('slide to next',$ionicSlideBoxDelegate.$getByHandle('wizard'));
            $scope.wizardHandler.next();
            $ionicScrollDelegate.scrollTop();
        };
        $scope.prevStep = function(){
            // passo allo step 2
            // $log.debug('slide to next',$ionicSlideBoxDelegate.$getByHandle('wizard'));
            // $log.debug('prev or 0?', $scope.checkCat, $scope.checkCat && $scope.wizardHandler.currentIndex() === 2);
            if(!$scope.checkCat && $scope.wizardHandler.currentIndex() === 2){
                $scope.wizardHandler.slide(0);
                $ionicScrollDelegate.scrollTop();
            } else {
                $scope.wizardHandler.previous();
                $ionicScrollDelegate.scrollTop();
            }
        };

        // aggiorno lo stato del wizard dato il tipo
        function initEntity(entity_type){
            var params = $location.search();

            // $log.debug('entity_type',entity_type,_this.types.list.map(function(e){return e.key;}));

            var typeIndex = _this.types.list.map(function(e){return e.key;}).indexOf(entity_type);
            var type = _this.types.list[typeIndex].key;
            //$log.debug('EditorCtrl, creazione marker, tipo: ', type, " con indice: ", typeIndex );
            _this.wizard.title = _this.labels.create;
            _this.wizard.entityLabel = _this.types.list[typeIndex].name;


            //imposto i permessi
            $scope.checkList = _this.config.types.perms[type];
            // $log.debug("EditorCtrl, checkList: ", $scope.checkList);

            // recupero i default per l'init dell'entita'
            _this.wizard.dataForm = angular.extend({},EntityService.getDefaults(entity_type));

            // sistemo le coordinate
            if(params.lat && params.lng){
                _this.wizard.dataForm.coordinates = [parseFloat(params.lng),parseFloat(params.lat)];
                // $log.debug('fix coordinates',parseFloat(params.lng),parseFloat(params.lat),_this.wizard.dataForm.coordinates )
            }
            // sistemo zoom_level
            if(params.zoom_level){
                _this.wizard.dataForm.zoom_level = parseInt(params.zoom_level);
            }
            if(params.area_id){
                _this.wizard.dataForm.area_id = params.area_id.toString();
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
            // $log.debug('check rel',parentId,parentType,_this.wizard.dataForm);

            // template timepicker door_time
            if($scope.checkList.door_time){
                initDoorTime();
            }
            // template timepicker duration
            if($scope.checkList.duration){
                initDuration();
            }

            // fine gesione relazioni

            // autofill address
            if(!_this.wizard.dataForm.address){
                SearchService.reverseGeocoding({zoom:params.zoom_level, lat: params.lat, lng: params.lng}).then(
                    function (res) {
                        $log.log('address',res);
                        _this.wizard.dataForm.address = res.display_name;
                    },
                    function (err) {

                    }
                );
            }
        };


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


        $scope.isCatRelevant = function (item) {
            var check = ((item.entities.indexOf(_this.wizard.dataForm.entity_type) > -1) && item.is_editable);
            //$log.debug("filtro categoria ",item, check, _this.wizard.dataForm.entity_type);
            return check;
        };


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
            $log.debug("form valido ",_this.wizard.dataForm);
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

            $log.debug("dataForServer pre", dataForServer);
            dataForServer = EntityService.processData(dataForServer);
            $log.debug("dataForServer post", dataForServer);
            //update a place
            if(params.id && params.id !=""){

                //dataForServer.id=params.id;
                ThingsService.update(dataForServer, params.id)
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
                ThingsService.create(dataForServer)
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
                        switch(error.status){
                            case 500:
                                // errore sconosciuto
                            case 422:
                                // errore di form
                            status = -1;
                            break;
                            default:
                                status = -2;

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
            // $log.debug('setToEdit');
            var mark = EntityService.preprocessMarker(data);
            // se il type e' settato
            if(mark.entity_type){
                typeIndex = _this.types.list.map(function(e){return e.key;}).indexOf(mark.entity_type);
                type = _this.types.list[typeIndex].key;
            }

            //imposto i permessi
            $scope.checkList = angular.copy(_this.types.perms[type]);
            // template timepicker door_time
            if($scope.checkList.door_time){
                initDoorTime();
            }
            // template timepicker duration
            if($scope.checkList.duration){
                initDuration();
            }

            // $log.debug("EditorCtrl, setToEdit, checkList: ", $scope.checkList);
            // $log.debug("EditorCtrl received marker: ", mark, _this.types.list[ typeIndex ]);

            _this.wizard.dataForm = angular.copy(mark);
            _this.wizard.title = _this.labels.edit;
            _this.wizard.entityLabel = _this.types.list[typeIndex].name;
            // gestione logica di alcuni campi particolari
            if(mark.coordinates){
                _this.wizard.dataForm.coordinates = [mark.lng,mark.lat];
            }

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
            if($scope.checkList.door_time && !_this.wizard.dataForm.door_time){
                // $log.debug("Entro in initDoorTime");
                initDoorTime();
            }
            // se duration e' richiesto e non e' nel marker
            if($scope.checkList.duration && !_this.wizard.dataForm.duration){
                // $log.debug("Entro in initDuration");
                initDuration();
            }
            // $log.debug('fine setToEdit', $scope.checkList);

            if(!_this.wizard.dataForm.address){
                SearchService.reverseGeocoding({zoom:params.zoom_level, lat: params.lat, lng: params.lng}).then(
                    function (res) {
                        $log.log('address',res);
                        _this.wizard.dataForm.address = res.display_name;
                    },
                    function (err) {

                    }
                );
            }
        }

        function setParent(parent_id){
            // $log.debug("carico il parent ", parent_id);
            ThingsService.get(parent_id).then(
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
            // $log.debug("EditorCtrl, initDoorTime, c'e' door_time? ",$scope.checkList.door_time,_this.wizard.dataForm.door_time);
            var inputEpochTime = null;

            if(_this.wizard.dataForm.door_time)
                inputEpochTime = angular.copy(_this.wizard.dataForm.door_time);

            angular.extend($scope.checkList.door_time, {template:{
                inputEpochTime: inputEpochTime,//((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $filter('translate')($scope.checkList.door_time.label),  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    doorTimeCallback(val)
                }
            }});
            //$scope.checkList.door_time["template"] = template;
            _this.wizard.dataForm.door_time = angular.copy($scope.checkList.door_time.template.inputEpochTime);
            // $log.debug("EditorCtrl, initDoorTime, aggiunta durata ", $scope.checkList.door_time.template," a ",_this.wizard.dataForm.door_time);
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
            $scope.checkList.close_time = angular.copy($scope.checkList.duration);
            _this.wizard.dataForm.close_time = null;

            var inputEpochTime = null;
            if(_this.wizard.dataForm.close_time)
                inputEpochTime = angular.copy(_this.wizard.dataForm.close_time);

            angular.extend($scope.checkList.close_time,{template : {
                inputEpochTime: inputEpochTime,// ((new Date()).getHours() * 60 * 60),  //Optional
                step: 15,  //Optional
                format: 24,  //Optional
                titleLabel: $filter('translate')($scope.checkList.close_time.label),  //Optional
                setLabel: '<i class="icon ion-checkmark-round"></i>',  //Optional
                closeLabel: '<i class="icon ion-close-round"></i>',  //Optional
                setButtonType: 'button-positive',  //Optional
                closeButtonType: 'button-stable',  //Optional
                callback: function (val) {    //Mandatory
                    durationCallback(val);
                }
            }});

            _this.wizard.dataForm.close_time = angular.copy($scope.checkList.close_time.template.inputEpochTime);
            // $log.debug("EditorCtrl, initDuration, aggiunta durata ",$scope.checkList.close_time.template," a ",_this.wizard.dataForm.close_time);
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
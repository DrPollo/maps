angular.module('firstlife.directives').directive('simpleEntityList',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            entityType:'=entityType',
            owner: '=owner',
            logged:'=',
        },
        templateUrl: '/templates/map-ui-template/simpleEntityList.html',
        controller: ['$scope','$log','$filter','$ionicModal','$ionicPopup','$ionicActionSheet','$timeout','SimpleEntityFactory','myConfig','MemoryFactory','AuthService', function($scope,$log,$filter,$ionicModal,$ionicPopup,$ionicActionSheet, $timeout,SimpleEntityFactory,myConfig,MemoryFactory, AuthService){

            $scope.config = myConfig;
            $scope.types = myConfig.types.simpleEntities;
            $scope.groups = [];
            $scope.user = AuthService.getUser();

            var MODAL_RELOAD_TIME = myConfig.behaviour.modal_relaod_time;
            // variabile dove inserisco il timer per il polling
            var timer = false;
            // funzione di polling
            var polling = function(){
                $log.log('simple entity polling ',$scope);
                $timeout.cancel(timer);
                updateGroups();
                timer = $timeout(function(){
                    // aggiorno i dettagli
                    polling();
                },MODAL_RELOAD_TIME);
            };

            $scope.$on('$destroy', function(e) {
                if(!e.preventSimpleEntityList){
                    e.preventSimpleEntityList = true;
                    $timeout.cancel(timer);
                    delete $scope;
                }
            });

            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // stop polling
                    $timeout.cancel(timer);
                    // init delle simple entities
                    initList();
                }
            });

            $scope.toggle = 0;
            $scope.setToggle = function(i){$scope.toggle = i;}

            $scope.altro = $scope.owner;
            $scope.$watch('owner',function(e,old){
                // cambia il marker
                if(e != old){
                    $scope.altro = $scope.owner;
                }
            });

            initList();


            function initList(){
                $scope.groups = [];
                for(var k in $scope.types){
                    var type = $scope.types[k];

                    // se ci sono delle esclusioni da considerare e 
                    // se non devo escludere il simple type
                    if(!type.exclude || type.exclude.indexOf($scope.entityType) < 0){
                        var group = angular.copy(type);
                        group.list = [];
                        // se non devo escludere il tipo dalla add
                        if(!type.excludeAdd || type.excludeAdd.indexOf($scope.entityType) < 0){
                            // altra logica se necessario va qui
                            group.enable = true;
                        }
                        $scope.groups.push(group);
                    }
                }
                polling();
            }

            function updateGroups(){
                for(var i = 0; i < $scope.groups.length; i++){
                    updateGroupOfEntities(i);
                }
            }

            function updateGroupOfEntities(index){
                SimpleEntityFactory.get($scope.id,$scope.groups[index].key).then(
                    function(response){
                        if(Array.isArray(response)){
                            upadateGroupList(response,index);
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
                );
                function upadateGroupList(list,i){
                    var group = $scope.groups[i];
                    for(var j = 0; j < list.length; j++){
                        var id = list[j]['id'];
                        var index = group.list.map(function(e){return e.id}).indexOf(id);
                        // se manca nella memoria locale aggiungo
                        if(index < 0){group.list.push(list[j]);}
                    }
                    for(var q = 0; q < group.list.length; q++){
                        var id = group.list[q]['id'];
                        var index = list.map(function(e){return e.id}).indexOf(id);
                        // se non c'e' tra i risultati online cancello dalla memoria locale
                        if(index < 0){group.list.slice(q,1);}
                    }
                }
            }



            // cancella entita' semplice
            $scope.delete = function(id,type,i){
                // aggiungi check con alert

                $scope.showConfirm = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: $filter('translate')('DELETE'),
                        template: $filter('translate')('DELETE_ASK')
                    });

                    confirmPopup.then(
                        function(res) {
                            if(res) {
                                $log.debug('delete ',id,type,i)
                                SimpleEntityFactory.delete($scope.id,id,type).then(
                                    function(response){
                                        // cancello l'elemento dalla memoria locale
                                        var index = $scope.groups[i].list.map(function(e){return e.id}).indexOf(id);
                                        $log.debug('check delete',id,type,i,$scope.groups[i],$scope.groups[i].list,index);
                                        if(index > -1){
                                            $scope.groups[i].list.splice(index,1);
                                        }
                                        actionReport(true);
                                    },
                                    function(response){$log.error('memers list, SimpleEntityFactory.delete, errore ',response);}
                                );
                            } else {
                                $log.log('cancellazione annullata');
                            }
                        });
                };

                $scope.showConfirm();
            }



            // aggiunge entita' semplice
            $scope.edit = function(id,type,i){
                var index = $scope.groups[i].list.map(function(e){return e.id}).indexOf(id);
                if(index > -1){
                    $scope.publish = false;
                    $scope.type = angular.copy($scope.types[type]);
                    $scope.boxEntity = {};
                    $scope.simpleEntity = angular.copy($scope.groups[i].list[index]);
                    $scope.simpleEntity.type = $scope.type.key;
                    $scope.simpleEntity.label = $scope.type.label;
                    $scope.simpleEntity.contentKey = $scope.type.contentKey;
                    $scope.simpleEntity.parent = $scope.id;
                    openEditor();
                }
            }
            $scope.update = function(){
                var data = {};
                for(var k in $scope.type.fields){
                    data[k] = $scope.simpleEntity[k];
                }

                SimpleEntityFactory.update($scope.id, $scope.simpleEntity.id,data,$scope.simpleEntity.type).then(
                    function(response){
                        // cancello l'elemento dalla memoria locale
                        var i = $scope.groups.map(function(e){return e.key}).indexOf($scope.simpleEntity.type);
                        var index = $scope.groups[i].list.map(function(e){return e.id}).indexOf($scope.simpleEntity.id);
                        if(index > -1){
                            $scope.groups[i].list.splice(index,1);
                        }
                        $scope.editor.hide();
                        actionReport(true);
                    },
                    function(response){$log.error('memers list, SimpleEntityFactory.update, errore ',response);}
                );
            }

            function actionReport(success){
                var text = 'SUCCESS';
                if(!success){
                    text = 'ERROR';
                }
                var hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(text),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        $log.log('CANCELLED');
                    }
                });
            }


            /*
             * Gestione galleria foto
             * openGallery: inizializza e apre la galleria
             */
            $scope.gallery = {};
            $scope.slider = {};
            $scope.slider.images = [];
            $scope.slider.pointer = 0;

            $scope.openGallery = function(index,gallery){

                $scope.slider.images = gallery;
                if(!isNaN(index)){
                    $scope.slider.pointer = index;
                }
                $ionicModal.fromTemplateUrl('templates/modals/gallery.html', {
                    scope: $scope,
                    animation: 'fade-in'
                }).then(function(modal){
                    console.log("gallery modal",modal);
                    $scope.gallery = modal;
                    if(index > 0){
                        //$scope.galery.goToSlide(index);
                    }
                    $scope.gallery.show();
                }, function(err){
                    $log.error("gallery error",err);
                });

                $scope.gallery.close = function() {
                    $scope.gallery.hide();
                    $rootScope.galleryStatus = false;
                };
                // Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                    $scope.gallery.remove();
                });
                // Execute action on hide modal
                $scope.$on('gallery.hide', function() {
                    // Execute action
                });
                // Execute action on remove modal
                $scope.$on('gallery.removed', function() {
                    // Execute action
                });
                $scope.$on('gallery.shown', function() {
                    console.log('Gallery is shown!');
                });

                // Called each time the slide changes
                $scope.gallery.slideChanged = function(index) {
                    $scope.gallery.slideIndex = index;
                };

                $scope.slider.next = function(){
                    if($scope.slider.pointer < $scope.slider.images.length -1){
                        $scope.slider.pointer++;
                    }else{
                        $scope.slider.pointer = 0;
                    }
                }
                $scope.slider.prev = function(){
                    if($scope.slider.pointer > 0){
                        $scope.slider.pointer--;
                    }else{
                        $scope.slider.pointer =  $scope.slider.images.length -1;
                    }
                }
                $scope.slider.slideTo = function(index){
                    if(index > -1 && index < $scope.slider.images.length-1){
                        $scope.slider.pointer = index;
                    }
                }
            };




            /*
             * Add simpleEntity
             * 0) add: evento pulsante add
             * 1) initEntity: inizializzazione dell'entita'
             * 2) openEditor: apertura della modal
             * 3) addEntity: salvataggio dell'entita'
             */

            // aggiunge entita' semplice
            $scope.add = AuthService.doAction(function(key){
                $scope.publish = true;
                $scope.type = angular.copy($scope.types[key]);
                $log.debug('check type init simple entity ',$scope.type);
                initEntity($scope.type);
                openEditor();
            });

            function initEntity(type) {
                $scope.boxEntity = {};
                $scope.simpleEntity = {
                    type: type.key,
                    parent: $scope.id,
                    label: type.label,
                    contentKey: type.contentKey
                };

                for(var k in type.fields){
                    $scope.simpleEntity[k] = type.fields[k].default;
                }
                $log.debug('check simple entity init ',$scope.simpleEntity,type.fields)
            }


            function openEditor(){
                $ionicModal.fromTemplateUrl('templates/modals/simpleEditor.html', {
                    scope: $scope,
                    animation: 'fade-in',//'slide-in-up',
                    backdropClickToClose : true,
                    hardwareBackButtonClose : true,
                    focusFirstInput: true
                }).then(function(modal) {
                    $scope.editor = modal;
                    $scope.editor.show();
                },function(err){$log.error('open modal ',err);});
            }

            $scope.addEntity = function(){
                if(!Array.isArray($scope.simpleEntity[$scope.simpleEntity.contentKey])){
                    sendEntity($scope.simpleEntity);
                }else{
                    // mando un'immagine alla volta
                    for(i in $scope.simpleEntity[$scope.simpleEntity.contentKey]){
                        var val = $scope.simpleEntity[$scope.simpleEntity.contentKey][i];
                        var entity = angular.copy($scope.simpleEntity);
                        entity[entity.contentKey] = val;
                        sendEntity(entity);
                    }
                }

                function sendEntity(entity){
                    SimpleEntityFactory.add(entity.parent,entity,entity.type).then(
                        function successCallback(response){
                            $scope.editor.hide();
                            actionReport(true);
                        },
                        function errorCallback(error){
                            $log.error("SimpleEditorCtrl, addComment, error: ",error);
                            actionReport(false);
                        }
                    );

                }
            }


        }]
    }

}).directive('entityRelations',function(){
    return {
        restrict: 'EG',
        scope: {
            marker: '=marker',
            click: '=click'
        },
        templateUrl: '/templates/map-ui-template/entityRelations.html',
        controller: ['$scope','$log','$filter','myConfig','MapService', function($scope,$log,$filter,myConfig,MapService){

            $scope.config = myConfig;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyEntityRelations){
                    e.preventDestroyEntityRelations = true;
                    delete $scope;
                }
            });

            $scope.$watch('marker',function(e,old){
                // cambia il marker
                if(!e.preventEntityRelationsUpdateMarker && e && e.id && (!old || e.id != old.id )){
                    e.preventEntityRelationsUpdateMarker = true;
                    loadSibillings();
                }
            });


            loadSibillings();

            function loadSibillings (){
                if(!$scope.marker || !$scope.marker.entity_type)
                    return

                $scope.relations = {};

                // caricamento dei child
                var childrenRelations = $scope.config.types.child_relations[$scope.marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor($scope.marker.id, childRel.field);
                    if(!$filter('isEmpty')(c)){
                        children[key] = angular.copy(childRel);
                        for(var j = 0; j<c.length;j++){
                            var thing = c[j];
                            if(!children[thing.entity_type])
                                children[thing.entity_type] = angular.copy(childrenRelations[thing.entity_type]);
                            if(!children[thing.entity_type].list)
                                children[thing.entity_type].list = [];

                            var index = children[thing.entity_type].list.map(function(e){return e.id}).indexOf(thing.id);
                            if(index < 0)
                                children[thing.entity_type].list.push(thing);
                        }

                    }
                }
                $scope.relations.children = children;

                // caricamento dei parent
                var parentsRelations = $scope.config.types.parent_relations[$scope.marker.entity_type];
                var parents = {};
                // serve ad impedire la duplicazione della ricerca per entita' con lo stesso field
                var keysBanList = {};
                for(key in parentsRelations){
                    var parentRel = parentsRelations[key];
                    if(!$filter('isEmpty')($scope.marker[parentRel.field]) && !keysBanList[parentRel.field]){
                        // aggiungo il campo alla banList 
                        keysBanList[parentRel.field] = true;
                        var p = MapService.searchFor($scope.marker[parentRel.field], 'id');
                        parents[key] = angular.copy(parentRel);
                        parents[key].list = p;
                    }
                }
                $scope.relations.parents = parents;
            }
        }]
    }

}).directive('relationsActions', function() {

    return {
        restrict: 'EG',
        scope: {
            relations: '=relations',
            callback: '=callback',
            label: '=label',
            id: '=id'
        },
        templateUrl: '/templates/map-ui-template/AddChildren.html',
        controller: ['$rootScope', '$scope','$log','$filter','myConfig','AuthService','groupsFactory', function($rootScope, $scope,$log,$filter,myConfig,AuthService,groupsFactory){


            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyRelationsActions){
                    e.preventDestroyRelationsActions = true;
                    delete $scope;
                }
            });

            $rootScope.$on('groupReset',function(e,args){
                if(!e.preventGroupResetRelationActions){
                    e.preventGroupResetRelationActions = true;
                    checker = groupsFactory.getMembersRx($scope.id);
                    initRelations();
                }
            })

            var checker = groupsFactory.getMembersRx($scope.id);
            var colors = myConfig.design.colors;
            // init relazioni
            initRelations();


            /*
             * funzioni private
             * initRelations: crea la lista di relazioni per la vista
             * lazyCheck: controlla le relazioni che hanno il campo check impostato
             */

            // fix dei check se necessario
            function initRelations(){
                $scope.relationsList = angular.copy($scope.relations);
                $scope.count = 0;
                for(var i in $scope.relationsList){
                    if(!$scope.relationsList[i].rel.check){
                        $scope.relationsList[i].check = true;
                        $scope.count++;
                    } else {
                        // controllo e metto a false fino a risposta
                        lazyCheck($scope.relationsList[i],$scope.relationsList[i].rel.check);
                        $scope.relationsList[i].check = false;
                    }
                    $scope.relationsList[i].color = colors[$scope.relationsList[i].index];
                }
                //$log.debug('check relations',$scope.relations,$scope.relationsList);
            }



            function lazyCheck(relation,check){
                switch(check){
                    case 'membership':
                        console.log('checker ',checker);
                        checker.subscribe(
                            function(response){
                                relation.check = true;
                                $scope.count++;
                            },
                            function(response){$log.log('no member!');},
                            function(){}
                        );
                        break;
                    default:
                }
            }
        }]
    }
}).directive('subscribersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '='
        },
        templateUrl: '/templates/map-ui-template/subscribersCounter.html',
        controller: ['$rootScope','$scope','$log','$filter','notificationFactory', function($rootScope, $scope,$log,$filter,notificationFactory){


            var subscribers = notificationFactory.subscribersRx($scope.id);
            initCounter();


            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyNotificationCounter){
                    e.preventDestroyNotificationCounter = true;
                    if(subscribers)
                        try{subscribers.unsubscribe();}catch(e){}
                    delete $scope;
                }
            });

            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    initCounter();
                }
            });

            $rootScope.$on('subscribersReset',function(e,args){
                if(!e.preventSubscribersResetCouter){
                    e.preventSubscribersResetCouter = true;
                    subscribers = args.observable;
                    initCounter();
                }
            })


            function initCounter(){
                $scope.counter = 1;
                subscribers.subscribe(
                    function(response){
                        if(Array.isArray(response)){
                            $scope.counter = response.length;
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);},
                    function(){}
                );
            }

        }]
    }

}).directive('entityActions', function() {

    return {
        restrict: 'EG',
        scope: {
            actions: '=actions',
            marker: '=marker',
            close:'=close',
            label:'=label'
        },
        templateUrl: '/templates/map-ui-template/actionsModal.html',
        controller: ['$rootScope','$scope','$location','$log','$filter','$ionicLoading','$ionicPopup','$ionicActionSheet','$q','AuthService','groupsFactory','MemoryFactory','notificationFactory', 'AuthService', function($rootScope, $scope, $location, $log, $filter,$ionicLoading,$ionicPopup,$ionicActionSheet,$q,AuthService,groupsFactory,MemoryFactory,notificationFactory, AuthService){
            // visualizzazione web o mobile?
            if(!$scope.isMobile) $scope.isMobile = (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
            // controllo azioni
            $scope.member = false;
            $scope.owner = false;
            $scope.subscriber = false;
            $scope.markerOwner = $scope.marker.owner;

            if(!$scope.user)
                $scope.user = AuthService.getUser();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    delete $scope;
                }
            });

            $scope.$watch('marker',function(e,old){
                // cambia il marker
                if(e && e.id && (!old || e.id != old.id )){
                    // init delle simple entities
                    subscribers = notificationFactory.subscribersRx($scope.marker.id);
                    init();
                }
            });


            var subscribers = null;
            if($scope.marker){
                subscribers = notificationFactory.subscribersRx($scope.marker.id);
                // $log.debug('debug modal',$scope.marker)
                init();
            }

            function init(){
                // lista di promise
                var promises = [];
                // se e' un gruppo inizializzo con i membri
                if($scope.marker.entity_type === "FL_GROUPS"){
                    //bug da sistemare
                    promises.push(initGroup());
                }
                // aggiungo il recupero dei sottoscrittori
                promises.push(initSubscribers());
                // creo una promise da tutte le inizializzazioni
                var deferred = $q.all(promises);
                // quando le promise sono pronte
                deferred.then(
                    function(){
                        // $log.debug('ok, go to initActions')
                        // init delle azioni
                        initActions();
                    },
                    function(err){$log.error('init entityActions, err ',err);}
                );
            }

            // recupero i membri se e' un gruppo
            function initGroup(){
                // $log.debug('init group!')
                var deferred = $q.defer();
                groupsFactory.getMembersRx($scope.marker.id).subscribe(
                    function(response){
                        // $log.debug('groupFactory, getMembers: there are members')
                        $scope.users = response;
                        var index = response.map(function(e){return e.id}).indexOf($scope.user.id);
                        if(index > -1){
                            // se esiste allora membro
                            $scope.member = true;
                        }else{
                            $scope.member = false;
                            $scope.owner = false;
                        }
                        // $log.debug('check ownership', $scope.markerOwner, $scope.user.id, $scope.markerOwner == $scope.user.id)
                        if($scope.markerOwner == $scope.user.id){
                            // se ha impostato il ruolo proprietario
                            $scope.owner = true;
                            $scope.member = true;
                        }
                        deferred.resolve();
                    },
                    function(response){
                        // $log.debug('groupFactory, getMembers: the user is not a group member!');
                        // giusto per essere sicuro...
                        $scope.member = false;
                        $scope.owner = false;
                        deferred.reject();
                    },
                    function(){deferred.resolve();}
                );
                return deferred.promise;
            }

            // [
            //     {
            //         "first_name": "Alessio",
            //         "last_name": "Antonini",
            //         "type": 1,
            //         "banned": false,
            //         "username": "alessio",
            //         "email": "aleyho@gmail.com",
            //         "created": "2017-02-18T11:19:30.483Z",
            //         "id": "58a82dc2b5db431b4531fa41",
            //         "modified": "2017-02-18T11:19:30.483Z"
            //     }
            // ]
            function initSubscribers(){
                var deferred = $q.defer();
                subscribers.subscribe(
                    function(response){
                        // $log.debug('check subscribers',response);
                        if($scope.user)
                            var index = response.map(function(e){return e.id}).indexOf($scope.user.id);
                        $scope.subscriber = index < 0 ? false : true;
                        deferred.resolve();
                    },
                    function(response){ $log.error('check subscribers ',response); deferred.reject(response);},
                    function(){deferred.resolve();}
                );
                return deferred.promise;
            }

            $scope.actionEntity = AuthService.doAction(function(action, param){
                // $log.debug('check action ',action,param);
                switch(action){
                    case 'unsubscribe':
                        //parte richiesta di unsubscribe
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_UNSUBSCRIBE'),
                                template: $filter('translate')('ENTITY_UNSUBSCRIBE_ASK')
                            });
                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        notificationFactory.unsubscribe($scope.marker.id).then(
                                            function(response){
                                                $scope.subscriber = false;
                                                initActions();
                                                reset('subscribers');
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("notificationFactory, unsubscribe, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('unsubscribe annullata');
                                    }
                                });
                        };
                        $scope.showConfirm();
                        break;
                    case 'subscribe':
                        //parte richiesta di subscribe
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_SUBSCRIBE'),
                                template: $filter('translate')('ENTITY_SUBSCRIBE_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        notificationFactory.subscribe($scope.marker.id).then(
                                            function(response){
                                                $scope.subscriber = true;
                                                initActions();
                                                reset('subscribers');
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("notificationFactory, subscribe, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('subscribe annullata');
                                    }
                                });
                        };
                        $scope.showConfirm();
                        break;
                    case 'view':
                        //aggiorno i parametri search con il filtro
                        $location.search(param,$scope.marker.id);
                        //chiudo la modal
                        $scope.close();
                        break;
                    case 'join':
                        //parte richiesta di join
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_JOIN'),
                                template: $filter('translate')('GROUP_JOIN_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        groupsFactory.joinGroup($scope.marker.id).then(
                                            function(response){
                                                $scope.member = true;
                                                if(response.role == 'owner'){
                                                    // se ha impostato il ruolo proprietario
                                                    $scope.owner = true;
                                                }
                                                initActions();
                                                reset('members');
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("actionEntity, join, errore",response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('join annullata');
                                    }
                                });
                        };

                        $scope.showConfirm();

                        break;
                    case 'leave':
                        // conferma se uscire
                        $scope.showConfirm = function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_LEAVE'),
                                template: $filter('translate')('GROUP_LEAVE_ASK')
                            });

                            confirmPopup.then(
                                function(res) {
                                    if(res) {
                                        groupsFactory.leaveGroup($scope.marker.id).then(
                                            function(response){
                                                // reset dei permessi
                                                $scope.member = false;
                                                $scope.owner = false;
                                                // reinizializzo i permessi
                                                initActions();
                                                reset('members');
                                                actionReport(true);
                                            },
                                            function(response){
                                                $log.error("actionEntity, leave, errore",response);
                                                $log.error(response);
                                                // notifica errore
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('cancellazione annullata');
                                    }
                                });
                        };

                        $scope.showConfirm();
                        break;
                    case 'users':
                        // apri lista utenti in loco (modal?)
//                        groupsFactory.getMembers($scope.marker.id).then(
//                            function(response){
//                                $scope.users = response;
//                            },
//                            function(response){
//                                $log.error('manage users, error',response);
//                                // avverti dell'errore
//                            }
//                        );
                        break;
                    default:

                }

            });

            // calcolo i permessi per le azioni
            function initActions(){
                // copio le azioni per manipolarle
                $scope.actionList = angular.copy($scope.actions);
                for(var i in $scope.actionList){
                    switch($scope.actionList[i].check){
                        case 'membership':
                            angular.extend($scope.actionList[i], {check:$scope.member});
                            break;
                        case 'ownership':
                            angular.extend($scope.actionList[i], {check:$scope.owner});
                            break;
                        case 'noOwnership':
                            angular.extend($scope.actionList[i], {check:(!$scope.owner && $scope.member)});
                            break;
                        case 'noMembership':
                            angular.extend($scope.actionList[i], {check:(!$scope.member && !$scope.owner)});
                            break;
                        case 'subscriber':
                            angular.extend($scope.actionList[i], {check:$scope.subscriber});
                            break;
                        case 'noSubscriber':
                            angular.extend($scope.actionList[i], {check:!$scope.subscriber});
                            break;
                        default: //se nessun check e' richiesto > true
                            angular.extend($scope.actionList[i], {check:true});
                    }
                }
                $log.debug('check actionList ',$scope.actionList);
            }

            function loading(){
                $ionicLoading.show({
                    template: 'REQUESTING...',
                    animation: 'fade-in',
                    noBackdrop : true,
                    maxWidth: 50,
                    showDelay: 0
                });
            }
            function done(){
                $ionicLoading.hide();
            }
            function actionReport(success){
                var text = 'SUCCESS';
                if(!success){
                    text = 'ERROR';
                }
                var hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(text),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        $log.log('CANCELLED');
                    }
                });
            }

            function reset(action){
                // lancio il reset
                switch(action){
                    case 'members':
                        $rootScope.$emit('groupReset',{observable: groupsFactory.getMembersRx($scope.marker.id) });
                        break;
                    case 'subscribers':
                        $rootScope.$emit('subscribersReset',{observable: notificationFactory.subscribersRx($scope.marker.id) });
                    default:
                }
            }

        }]
    };
}).directive('loader',function(){
    return {
        scope:{},
        restrict: 'E',
        template:'<div style="width:100%;text-align:center;padding:40px;"><ion-spinner icon="android" class="spinner-positive"></ion-spinner></div>'
    }
}).directive('reportEntity',['$log', '$ionicModal', '$ionicActionSheet', '$filter','AuthService', 'entityFactory', function($log,$ionicModal, $ionicActionSheet,$filter, AuthService, entityFactory){
    return {
        scope:{
            id: '=',
            close:'='
        },
        restrict: 'E',
        template:'<ion-item class="item-icon-left" on-tap="report.open()"> <i class="icon ion-alert-circled"></i>{{"REPORT_CONTENT"|translate}}</ion-item>',
        link: function(scope, element, attrs){

            scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    if(hideSheet){
                        hideSheet.hide();
                    }
                    if(scope.report.modal && scope.report.modal.remove){
                        scope.report.modal.remove();
                    }
                    delete scope;
                }
            });
            var hideSheet = null;
            scope.disclaimer = $filter('translate')('REPORT_DISCLAIMER');
            scope.user = AuthService.getUser();
            scope.report = {
                content:{
                    thing_id: scope.id,
                    message:'sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una '
                },
                form:{}
            };
            // apro la lista dei membri
            scope.report.open = AuthService.doAction(
                function (){
                    scope.close();
                    // apro la modal
                    scope.report.modal = {};
                    $ionicModal.fromTemplateUrl('templates/modals/reportEntity.html', {
                        scope: scope,
                        animation: 'fade-in',//'slide-in-up',
                        backdropClickToClose : true,
                        hardwareBackButtonClose : true
                    }).then(function(membersmodal) {
                        scope.report.modal = membersmodal;
                        scope.report.modal.show();
                    });

                }
            );

            scope.submit = function(){
                $log.debug('check fields',scope.report.content);

                // invio la segnalazione
                entityFactory.report(scope.report.content).then(
                    function (result) {
                        // tutto ok
                        $log.debug('segnalazione ok',result);
                        scope.report.modal.remove();
                        feedback('REPORT_SUCCESS_FEEDBACK');
                    },
                    function (err) {
                        // se non e' possibile fare il report
                        $log.debug('errore segnalazione',err)
                        feedback('REPORT_ERROR_FEEDBACK');
                    }
                );
            }

            function feedback(title){
                hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(title),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function() {
                        // $log.debug('CANCELLED');
                    }
                });
            }

        }

    }


}]);
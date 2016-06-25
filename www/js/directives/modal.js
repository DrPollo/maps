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
        controller: ['$scope','$log','$filter','$ionicModal','$ionicPopup','$ionicActionSheet','$timeout','SimpleEntityFactory','myConfig','MemoryFactory', function($scope,$log,$filter,$ionicModal,$ionicPopup,$ionicActionSheet, $timeout,SimpleEntityFactory,myConfig,MemoryFactory){

            $scope.config = myConfig;
            $scope.types = myConfig.types.simpleEntities;
            $scope.groups = [];
            $scope.user = MemoryFactory.getUser();

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
                        var id = list[j][group.idKey];
                        var index = group.list.map(function(e){return e[group.idKey]}).indexOf(id);
                        // se manca nella memoria locale aggiungo
                        if(index < 0){group.list.push(list[j]);}
                    }
                    for(var q = 0; q < group.list.length; q++){
                        var id = group.list[q][group.idKey];
                        var index = list.map(function(e){return e[group.idKey]}).indexOf(id);
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
                                SimpleEntityFactory.delete(id,type).then(
                                    function(response){
                                        // cancello l'elemento dalla memoria locale
                                        var index = $scope.groups[i].list.map(function(e){return e[$scope.groups[i].idKey]}).indexOf(id);
                                        console.debug('check delete',id,type,i,$scope.groups[i].list,index);
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
                var index = $scope.groups[i].list.map(function(e){return e[$scope.groups[i].idKey]}).indexOf(id);
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
                //data[$scope.type.idKey] = $scope.simpleEntity[$scope.type.idKey];
                //data.type = $scope.simpleEntity.type;
                
                SimpleEntityFactory.update($scope.simpleEntity[$scope.type.idKey],data,$scope.simpleEntity.type).then(
                    function(response){
                        // cancello l'elemento dalla memoria locale
                        var i = $scope.groups.map(function(e){return e.key}).indexOf($scope.simpleEntity.type);
                        var index = $scope.groups[i].list.map(function(e){return e[$scope.groups[i].idKey]}).indexOf($scope.simpleEntity[$scope.type.idKey]);
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
            $scope.add = function(key){
                $scope.publish = true;
                $scope.type = angular.copy($scope.types[key]);
                $log.debug('check type init simple entity ',$scope.type);
                initEntity($scope.type);
                openEditor();
            }

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
                if(e.id != old.id){
                    loadSibillings();
                }
            });


            loadSibillings();

            function loadSibillings (){

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
            id: '=id',
            reset: '=reset'
        },
        templateUrl: '/templates/map-ui-template/AddChildren.html',
        controller: ['$scope','$log','$filter','myConfig','AuthService','groupsFactory', function($scope,$log,$filter,myConfig,AuthService,groupsFactory){

            // controllo il flag di reset che viene passato nel setup della direttiva nella vista
            $scope.$watch('reset',function(e,old){
                if(e && !old){
                    //init relations, qualcosa e' cambiato
                    initRelations();
                    // reset del flag
                    $scope.reset = false;
                }

            });

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyRelationsActions){
                    e.preventDestroyRelationsActions = true;
                    delete $scope;
                }
            });

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
                        AuthService.checkMembership($scope.id).then(
                            function(response){
                                relation.check = true;
                                $scope.count++;
                            },
                            function(response){$log.log('no member!');}
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
            details: '=',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/subscribersCounter.html',
        controller: ['$scope','$log','$filter','notificationFactory', function($scope,$log,$filter,notificationFactory){

            initCounter();


            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyNotificationCounter){
                    e.preventDestroyNotificationCounter = true;
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
            $scope.$watch('reset',function(e,old){
                // cambia il marker
                if(e && e != old){
                    // init delle simple entities
                    initCounter();
                }
            });


            function initCounter(){
                $scope.counter = 1;
                notificationFactory.subscribers($scope.id).then(
                    function(response){
                        if(Array.isArray(response)){
                            $scope.counter = response.length;
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
                );
            }
        }]
    }

});
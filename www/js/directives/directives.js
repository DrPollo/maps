angular.module('firstlife.directives', [])
    .directive('validPin', ['$http', function($http) {
        return {
            require: 'ngModel',
            link: function(scope, ele, attrs, c) {
                scope.$watch(attrs.ngModel, function(pinValue) {
                    // $http({
                    // 	method: 'POST',
                    // 	url: '/api/check/' + attrs.validPin,
                    // 	data: {'pin': attrs.validPin}
                    // }).success(function(data, status, headers, cfg) {
                    // 	c.$setValidity('valid-pin', data.isValid);
                    // }).error(function(data, status, headers, cfg) {
                    // 	c.$setValidity('valid-pin', false);
                    // });
                    if(pinValue=="12345")
                    {
                        c.$setValidity('valid-pin', true);
                    }
                    else
                    {
                        c.$setValidity('valid-pin', false);
                    }
                });
            }
        };
    }])
    .directive('isMobile', [ function() {
        return {
            link: function(scope, ele, attrs, c) {
                return (ionic.Platform.isIPad() || ionic.Platform.isIOS() || ionic.Platform.isAndroid() || ionic.Platform.isWindowsPhone());
            }
        }
    }
                           ])
    .directive('showHide', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var anchor = angular.element('<a/>');
                anchor.addClass("toggle-view-anchor");
                anchor.text("SHOW");
                element.parent().append(anchor);

                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var toggle_view_anchor = this,
                        password_input = toggle_view_anchor.parentElement.querySelector('input[show-hide]'),
                        input_type = password_input.getAttribute('type');

                    if(input_type=="text")
                    {
                        password_input.setAttribute('type', 'password');
                        toggle_view_anchor.text = "SHOW";
                    }
                    if(input_type=="password")
                    {
                        password_input.setAttribute('type', 'text');
                        toggle_view_anchor.text = "HIDE";
                    }
                }, anchor);
            }
        };
    }])


    .directive('biggerText', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var text_element = document.querySelector(attrs.biggerText),
                        root_element = document.querySelector(".menu-content"),
                        current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
                        current_size = parseFloat(current_size_str),
                        new_size = Math.min((current_size+2), 24),
                        new_size_str = new_size + 'px';

                    root_element.classList.remove("post-size-"+current_size_str);
                    root_element.classList.add("post-size-"+new_size_str);
                }, element);
            }
        };
    }])

    .directive('smallerText', ['$ionicGesture', function($ionicGesture) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $ionicGesture.on('touch', function(event){
                    event.stopPropagation();
                    event.preventDefault();

                    var text_element = document.querySelector(attrs.smallerText),
                        root_element = document.querySelector(".menu-content"),
                        current_size_str = window.getComputedStyle(text_element, null).getPropertyValue('font-size'),
                        current_size = parseFloat(current_size_str),
                        new_size = Math.max((current_size-2), 12),
                        new_size_str = new_size + 'px';

                    root_element.classList.remove("post-size-"+current_size_str);
                    root_element.classList.add("post-size-"+new_size_str);
                }, element);
            }
        };
    }])
    .directive('nxEqual', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqual) {
                console.error('nxEqual expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqual, function (value) {
                model.$setValidity('nxEqual', value === model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value === scope.$eval(attrs.nxEqual);
                model.$setValidity('nxEqual', isValid);
                return isValid ? value : undefined;
            });
        }
    };
})
    .directive('nxEqualEx', function() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.nxEqualEx) {
                console.error('nxEqualEx expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.nxEqualEx, function (value) {
                // Only compare values if the second ctrl has a value.
                if (model.$viewValue !== undefined && model.$viewValue !== '') {
                    model.$setValidity('nxEqualEx', value === model.$viewValue);
                }
            });
            model.$parsers.push(function (value) {
                // Mute the nxEqual error if the second ctrl is empty.
                if (value === undefined || value === '') {
                    model.$setValidity('nxEqualEx', true);
                    return value;
                }
                var isValid = value === scope.$eval(attrs.nxEqualEx);
                model.$setValidity('nxEqualEx', isValid);
                return isValid ? value : undefined;
            });
        }
    };
})
    .directive('standardTimeNoMeridian', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            etime: '=etime'
        },
        template: "<span>{{stime}}</span>",
        link: function(scope, elem, attrs) {
            scope.placeholder = attrs.placeholder;
            scope.stime = epochParser(scope.etime, 'time');

            function prependZero(param) {
                if (String(param).length < 2) {
                    return "0" + String(param);
                }
                return param;
            }

            function epochParser(val, opType) {
                if (val === null) {
                    if(scope.placeholder){
                        //console.log("placeholder? ",scope.placeholder);
                        return scope.placeholder;
                    }else
                        return "<span>00:00</span>";
                } else {
                    if (opType === 'time') {
                        var hours = parseInt(val / 3600);
                        var minutes = (val / 60) % 60;

                        return (prependZero(hours) + ":" + prependZero(minutes));
                    }
                }
            }

            scope.$watch('etime', function(newValue, oldValue) {
                scope.stime = epochParser(scope.etime, 'time');
            });

        }
    };
})
    .directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
    .directive('searchResults', function(){
    return {
        restrict: 'EG',
        scope: {
            query:'=',
            click:'=',
            close:'='
        },
        templateUrl: '/templates/map-ui-template/searchResults.html',
        controller: ['$scope','$log','$location','myConfig','SearchService','CBuffer', function($scope,$log,$location,myConfig,SearchService,CBuffer){
            var limit = myConfig.behaviour.query_limit;
            var SEARCH_DELAY = myConfig.behaviour.searchend_delay;
            var result_limit = myConfig.behaviour.search_results_limit;
            
            var searchendSetTimeout;
            initForm();

            //cleanup
            $scope.$on('$destroy',function(){delete scope;});

            
            // al cambio della query
            $scope.$watch('query', 
                          function(e, old){
                $log.debug("SearchCtrl, old: ",old, " new: ",e);
                if(e && old != e && e.length > limit){
                    if (SEARCH_DELAY > 0) {
                        if (searchendSetTimeout) {
                            $log.debug("clearTimeout");
                            clearTimeout(searchendSetTimeout);
                        }
                        searchendSetTimeout = setTimeout(
                            function(){
                                $log.debug("cerco ",$scope.query);
                                checkQuery(e);
                            }, SEARCH_DELAY);
                    } 
                    else {
                        checkQuery(e);
                    } 
                }else if( e == '' ){
                    // reset
                    $scope.locations = [];
                    $scope.results = [];
                }
            });

            $scope.locate = function(r){
                $log.debug('check location street',r);
                $location.search('lat',r.lat);
                $location.search('lng',r.lng);
                $scope.close();
            }

            /*
             * Funzioni private
             * 1) checkQuery: fa partire le richieste ai service di ricerca
             * 2) pushCache: aggiunge nel buffer circolare il contenuto del form di ricerca
             * 3) initForm: inizializza la struttura dati del form di ricerca
             */

            // richieste per i service di ricerca
            function checkQuery(e){
                // togliamo la ricerca interna per ora
//                SearchService.query(e).then(
//                    function(response){
//                        $log.debug("SearchCtrl, watch query, SearchService.query, response: ",response);
//                        $scope.results = response.length >= result_limit ? response.slice(0,result_limit) : response;
//                        $log.debug("SearchCtrl, watch query, SearchService.query, response: ",response,$scope.results,result_limit);
//                        if($scope.query != '' && $scope.results.length > 0)
//                            pushCache(e);
//                    },
//                    function(response){ console.log("SearchCtrl, watch query, SearchService.query, error: ",response);}
//                );
                SearchService.geocoding(e).then(
                    function(response){
                        $log.debug("SearchCtrl, watch query, SearchService.geocoding, response: ",response);
                        $scope.locations = response.length >= result_limit ? response.slice(result_limit) : response;
                        if($scope.query != '' && $scope.locations.length > 0)
                            pushCache(e);
                    },
                    function(response){ 
                        $log.error("SearchCtrl, watch query, SearchService.geocoding, error: ",response);
                    }
                );
            }

            // aggiunge una ricerca nei buffer di ricerca
            function pushCache(e){
                $log.debug('check push ',entry,$scope.bufferSearch,$scope.bufferSearch.toArray())
                //var entry = angular.copy($scope.form);
                var entry = {query:e};
                if($scope.bufferSearch.toArray().map(function(e) { return e.query; }).indexOf(entry.query) < 0)
                    $scope.bufferSearch.push(entry);
            }

            // inizializzazione del form di ricerca
            function initForm(){
                $scope.locations = [];
                $scope.results = [];
                $scope.bufferSearch = new CBuffer(result_limit);
                $scope.bufferSearch.overflow = function(data) {
                    //console.log("Buffer overflow: ",data);
                };
            }

        }]
    }
})
    .directive('wall', function() {

    return {
        restrict: 'EG',
        scope: {
            content: '=content',
            close: '=close',
            click: '=click'
        },
        templateUrl: '/templates/map-ui-template/wallTemplate.html',
        controller: ['$scope','$location', '$log', '$filter', 'myConfig', 'MemoryFactory', 'MapService', function($scope,$location,$log,$filter,myConfig,MemoryFactory,MapService){
            var config = myConfig;
            var bounds = {};
            $scope.markerChildren = {};

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyWall){
                    e.preventDestroyWall = true;
                    delete $scope;
                }
            });

            MapService.getMapBounds().then(
                function(response){
                    $scope.wallArray = [];
                    bounds = response;
                    $scope.wallArray = $filter('filter')($scope.content, boundsFiltering);
                },
                function(response){
                    $log.error("MapCtrl, setMapMarkers, MapService.getMapBounds, errore ",response);}
            );

            // click cambio di parametro search e chiudo modal
            $scope.clickWallItem = function(entityId){
                // cambio paramentro search
                $location.search('entity',entityId);
                //chiudo la modal
                $scope.close();
            };

            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val){
                return bounds.contains([val.lat,val.lng]);
            }

            $scope.loadChildren = function(marker){

                // caricamento dei child
                var childrenRelations = config.types.child_relations[marker.entity_type];
                var children = {};
                for(key in childrenRelations){
                    var childRel = childrenRelations[key];
                    var c = MapService.searchFor(marker.id, childRel.field);
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
                $scope.markerChildren[marker.id] = children;
            };


        }]
    }
}).directive('groupActions', function() {

    return {
        restrict: 'EG',
        scope: {
            actions: '=actions',
            id: '=id',
            close:'=close',
            label:'=label',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/groupActionsModal.html',
        controller: ['$scope','$location','$log','$filter','$ionicLoading','AuthService','groupsFactory','MemoryFactory', function($scope,$location,$log,$filter,$ionicLoading,AuthService,groupsFactory,MemoryFactory){

            // controllo azioni
            $scope.member = false;
            $scope.owner = false;


            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    delete $scope;
                }
            });

            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    initGroupActions();
                }
            });


            initGroupActions();
            function initGroupActions(){
                groupsFactory.getMembers($scope.id).then(
                    function(response){

                        if(!$scope.user)
                            $scope.user = MemoryFactory.getUser();
                        var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                        if(index > -1){
                            // se esiste allora membro
                            $scope.member = true;
                            if(response[index].role == 'owner'){
                                // se ha impostato il ruolo proprietario
                                $scope.owner = true;
                            }
                        }
                        // init delle azioni
                        initActions();
                    },
                    function(response){
                        $log.log('the user is not a group member!');
                        // giusto per essere sicuro...
                        $scope.member = false;
                        $scope.owner = false;
                        // init delle azioni
                        initActions();
                    }
                );

            }




            $scope.actionEntity = function(action, param){

                switch(action){
                    case 'view':
                        //chiudo la modal
                        $scope.close();
                        //aggiorno i parametri search con il filtro
                        $location.search(param,$scope.id);
                        break;
                    case 'join':
                        //parte richiesta di join
                        $ionicLoading.show();
                        groupsFactory.joinGroup($scope.id).then(
                            function(response){
                                $scope.member = true;
                                if(response.role == 'owner'){
                                    // se ha impostato il ruolo proprietario
                                    $scope.owner = true;
                                }
                                initActions();
                                $ionicLoading.hide();
                            },
                            function(response){
                                $log.error("actionEntity, join, errore",response);
                                $ionicLoading.hide();
                            }
                        );

                        break;
                    case 'leave':
                        // conferma se uscire
                        $ionicLoading.show();
                        groupsFactory.leaveGroup($scope.id).then(
                            function(response){
                                // reset dei permessi
                                $scope.member = false;
                                $scope.owner = false;
                                // reinizializzo i permessi
                                initActions();
                                $ionicLoading.hide();
                            },
                            function(response){
                                $log.error("actionEntity, leave, errore",response);
                                $log.error(response);
                                // notifica errore
                                $ionicLoading.hide();
                            }
                        );
                    case 'users':
                        // apri lista utenti in loco (modal?)
                        groupsFactory.getMembers($scope.id).then(
                            function(response){
                                $scope.users = response;
                            },
                            function(response){
                                $log.error('manage users, error',response);
                                // avverti dell'errore
                            }
                        );
                        break;
                    default:

                }

            }

            // calcolo i permessi per le azioni
            function initActions(){
                // lancio il reset
                $scope.reset = true;
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
                            angular.extend($scope.actionList[i], {check:!$scope.owner});
                            break;
                        case 'noMembership':
                            angular.extend($scope.actionList[i], {check:!$scope.member});
                            break;
                        default: //se nessun check e' richiesto > true
                            angular.extend($scope.actionList[i], {check:true});
                    }
                }
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

        }]
    };
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
}).directive('membersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details'
        },
        templateUrl: '/templates/map-ui-template/membersCounter.html',
        controller: ['$scope','$log','$filter','groupsFactory', function($scope,$log,$filter,groupsFactory){

            initCounter();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersCounter){
                    e.preventDestroyMembersCounter = true;
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


            function initCounter(){
                $scope.counter = 1;
                groupsFactory.getMembers($scope.id).then(
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

})
    .directive('membersList',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details'
        },
        templateUrl: '/templates/map-ui-template/membersList.html',
        controller: ['$scope','$log','$filter','groupsFactory','MemoryFactory', function($scope,$log,$filter,groupsFactory,MemoryFactory){

            //$scope.counter = [];
            $scope.user = MemoryFactory.getUser();
            //$scope.role = false;

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyMembersList){
                    e.preventDestroyMembersList = true;
                    delete $scope;
                }
            });


            $scope.$watch('id',function(e,old){
                // cambia il marker
                if(e != old){
                    // init delle simple entities
                    initList();
                }
            });

            initList();


            function initList(){
                $scope.role = false;
                $scope.counter = [];
                $scope.membersList = [];

                groupsFactory.getMembers($scope.id).then(
                    function(response){
                        if(Array.isArray(response)){
                            $scope.membersList = response;
                            if($scope.user){
                                var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                                if(index > -1){
                                    $scope.role = response[index].role?response[index].role:'member';
                                }
                            }
                        }
                    },
                    function(response){$log.error('groupsFactory, getMembers, error ',response);}
                );

            }

            $scope.deleteMember = function(groupId,memberId){
                groupsFactory.removeUser(groupId,memberId).then(
                    function(response){
                        // reinizializzo la lista
                        initList();
                    },
                    function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                );
            }
        }]
    }

})
    .directive('entityRelations',function(){
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

}).directive('pictureLoader',function(){
    return {
        restrict: 'EG',
        scope: {
            id:'=id',
            imageCache:'=images'
        },
        templateUrl: '/templates/form/pictureLoader.html',
        controller:['$scope','$log','$filter','$ionicLoading',function($scope,$log,$filter,$ionicloading){


            $scope.$on('$destroy', function(e) {
                if(!e.preventPictureLoader){
                    e.preventPictureLoader = true;
                    delete $scope;
                }
            });


            initLoader();

            if(!$scope.imageCache)
                $scope.imageCache = [];

            function initLoader(){

                $scope.file = '';
            }

            $scope.removeImage = function(index) {
                $scope.imageCache.splice(index, 1);
            };

            //action to upload photos
            $scope.loadCamera = function(){
                Cameras.getPicture({
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.CAMERA,
                    quality: 70,
                    targetWidth: 800,
                    targetHeight: 800,
                    saveToPhotoAlbum: false
                }).then(function(imageURI) {
                    //  alert(imageURI);
                    addToImageCache(imageURI);
                }, function(err) {
                    console.log(err);
                });    
            };

            //action to choose images
            $scope.imagePicker = function(){

                var options = {
                    quality: 70,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    targetWidth: 800,
                    targetHeight: 800
                };

                $cordovaCamera.getPicture(options).then(function(imageUri) {
                    //  alert('img' + imageUri);
                    addToImageCache(imageUri);

                }, function(err) {
                    console.log('error'+ err);
                });

            };





            $scope.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
                addToImageCache(fileObj);
            }

            function addToImageCache(image){
                // aggiungo le immagini alla cache, senza duplicati
                if($scope.imageCache.indexOf(image) < 0){
                    var data = 'data:';
                    data = data.concat(image.filetype).concat(';base64,').concat(image.base64);
                    $scope.imageCache.push(data);
                }
            }

            // send photo to api
            $scope.sendPhoto = function(entity_id,entity_type) {
                if(Array($scope.imageCache).length > 0){
                    Sender.images($scope.imageCache, entity_id,entity_type).then(
                        function(data){
                            // reset immagini
                            $scope.resetImageCache();
                            //console.log('Immagini caricate!',data);
                            // ho salvato le immagini, le ricarico dal server
                            $scope.refreshImages(entity_id,entity_type);
                        },
                        function(err){
                            // reset immagini
                            $scope.resetImageCache();
                            // todo errore di caricamento
                            var title = $filter('translate')('ERROR');
                            var template = $filter('translate')('UNKNOWN_ERROR');
                            switch(err.status){
                                case '413':
                                    // immagine troppo grande
                                    // errore di rete
                                    template = $filter('translate')('SIZE_ERROR');
                                    break;
                                default:
                                    // errore di rete

                            }
                            var alertPopup = $ionicPopup.alert({
                                title: title,
                                template: template
                            });
                            $log.error('sendPhoto, errore',err);
                        });
                }

            };

            // send photo to api
            $scope.resetImageCache = function(markerId) {
                //console.log("reset immagini");
                $scope.imageCache = [];
                $scope.isPendingImages = false;

            };

        }]
    }
})
    .directive('simpleEntityList',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            entityType:'=entityType',
            owner: '=owner'
        },
        templateUrl: '/templates/map-ui-template/simpleEntityList.html',
        controller: ['$scope','$log','$filter','$ionicModal','$ionicLoading','$ionicPopup','$timeout','SimpleEntityFactory','myConfig','MemoryFactory', function($scope,$log,$filter,$ionicModal,$ionicLoading,$ionicPopup,$timeout,SimpleEntityFactory,myConfig,MemoryFactory){

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
                SimpleEntityFactory.delete(id,type).then(
                    function(response){
                        // cancello l'elemento dalla memoria locale
                        var index = $scope.groups[i].list.map(function(e){return e[$scope.groups[i].idKey]}).indexOf(id);
                        if(index > -1){
                            $scope.groups[i].list.splice(index,1);
                        }
                    },
                    function(response){$log.error('memers list, groupsFactory.removeUser, errore ',response);}
                );
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
                    console.log("gallery ",modal);
                    $scope.gallery = modal; 
                    if(index > 0){
                        //$scope.galery.goToSlide(index);
                    }
                    $scope.gallery.show();
                }, function(err){
                    $log.error("gallery error",err);
                    console.log(err);
                    deferred.reject(false);
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
             * 3) saveEntity: salvataggio dell'entita'
             * 6) alertError: popup di errore
             */

            // aggiunge entita' semplice
            $scope.add = function(key){
                $scope.type = angular.copy($scope.types[key]);
                initEntity($scope.type);
                openEditor();
            }

            function initEntity(type) {
                $scope.simpleEntity = {
                    type: type.key, 
                    parent: $scope.id,
                    label: type.label,
                    contentKey: type.contentKey
                };
                $log.debug('check init entity, fields ',type.fields);

                for(var k in type.fields){
                    $scope.simpleEntity[k] = type.fields[k].default;
                }
                $log.debug('check init entity ',$scope.simpleEntity);
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
                $ionicLoading.show();
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
                    $ionicLoading.hide();
                }

                function sendEntity(entity){
                    SimpleEntityFactory.add(entity.parent,entity,entity.type).then(
                        function successCallback(response){
                            $ionicLoading.hide();
                            $scope.editor.hide();
                        },
                        function errorCallback(error){
                            $log.error("SimpleEditorCtrl, addComment, error: ",error);
                            $ionicLoading.hide();
                            alertError();
                        }
                    ); 

                }           
            }

            function alertError(){
                $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: $filter('translate')('UNKNOWN_ERROR')
                });
            }

        }]
    }

}).directive('categoryFilters',['$log','myConfig', function ($log,myConfig) {
    return {
        restrict: 'E',
        templateUrl: '/templates/map-ui-template/treeMap.html',
        //template: '<svg height="{{size.height}}" width="{{size.width}}" style="overflow: hidden; position: relative;"><rect ng-repeat="box in boxes track by $index" stroke="#fefefe" fill="#006628" x="{{box[0]}}" y="{{box[1]}}" width="{{box[2]-box[0]}}" height="{{box[3]-box[1]}}" r="0" rx="0" ry="0" ></rect><svg>',
        scope: {
            markers:"=array"
        },
        link: function (scope, element) {

            scope.$on('$destroy',function(){delete scope;});

            scope.colors = myConfig.design.colors;
            // fatta a mano
            scope.cats = angular.copy(myConfig.types.categories);

            var ids = [];
            var firstLevel = [];
            for (var i = 0 ; i < scope.cats.length; i++) {
                //if(data[i].is_visible){
                firstLevel.push(scope.cats[i].categories.length);
                ids.push(scope.cats[i].category_space);

                //}
            }
            scope.$watch(function() {
                return element[0].clientWidth;
            }, function(value,old){
                $log.debug(element[0].getBoundingClientRect());
                initTree(element[0].getBoundingClientRect());
            });

            function initTree(rect){
                scope.size = rect;
                var boxes = Treemap.generate(firstLevel,rect.width,rect.height);
                //$log.debug(scope.cats,boxes);
                for(var i = 0; i < boxes.length; i++){
                    scope.cats[i].rect = toPer(boxes[i]);
                    //$log.debug(scope.cats[i],boxes[i]);
                    scope.cats[i].toggle = false;
                }
                for (var i = 0 ; i < scope.cats.length; i++) {
                    //if(scope.cats[i].is_visible){
                    var cats = scope.cats[i].categories;
                    var buff = [];
                    for(var j = 0; j < cats.length; j++){
                        buff[j] = 1;
                    }
                    var boxes2 = Treemap.generate(buff,rect.width,rect.height);
                    for(var k = 0; k < boxes2.length; k++){
                        scope.cats[i].categories[k].rect = toPer(boxes2[k]);
                    }
                    //}
                }
                $log.debug(scope.cats);
            }

            scope.back = false;
            scope.toggle = function(space){
                if(scope.back == space.category_space){
                    scope.back = false;
                }else{
                    scope.back = space.category_space;
                    scope.label = space.name;
                }
            }
            scope.close = function(){
                $log.debug('close!');
                scope.back = false;
            }
            scope.catToggle = function(cat){
                $log.debug('cat toggle!',cat);
            }
            function toPer(rect){
                //$log.debug(rect,scope.size);
                // x,y,width,height

                var x = (rect[0]/scope.size.width)*100;
                var y = (rect[1]/scope.size.height)*100;
                var width = ((rect[2]-rect[0])/scope.size.width)*100;
                var height = (((rect[3]-rect[1])/scope.size.height)*100);
                var r = [x.toString().concat('%'),
                         y.toString().concat('%'),
                         width.toString().concat('%'),
                         height.toString().concat('%')];
                return r;
            }

        }
    };
}]);
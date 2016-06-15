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
    .directive('searchCards', function() {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/templates/map-ui-template/SearchCards.html',
        controller: ['$scope','$location', '$log', '$stateParams', 'myConfig', 'MemoryFactory', 'MapService', function($scope,$location,$log,$stateParams,myConfig,MemoryFactory,MapService){
            var config = myConfig;
            var filters = config.map.filters;
            var filterList = filters.map(function(e){return e.search_param});

            var listners = {};
            
            // inizializzazione
            if(!$scope.cards){
                $scope.cards = {};
                checkParams($location.search());
            }

            $scope.$on('$destroy', function(e) {
                if(!e.preventSearchCards){
                    e.preventSearchCards = true;
                    delete $scope;
                }
            });
            
            // todo listner su rootscope
            $scope.$watch(
                function(){return $location.search()},
                function(e, old){
                // se cambiati controllo
                checkParams($location.search());
            },true);

            $scope.closeCard = function(k,value){
                // rimuovo il parametro
                removeFilter(k,value);
                // dovrebbe rimuovere anche la card al prossimo controllo
                var key = k.toString().concat(value);
                if($scope.cards[key])
                    delete $scope.cards[key];
                if($scope.cards[k])
                    delete $scope.cards[k];
            };

            function checkParams(params){
                // aggiungo le schede dei parametri che mi mancano
                for(var k in params){
                    var i = filterList.indexOf(k);
                    // se e' nella lista dei filtri search
                    if(i > -1){
                        var values = params[k].toString().split(',');
                        for(var j = 0; j < values.length; j++){

                            var key = k.toString().concat(values[j]);
                            // se la card non esiste
                            if(!$scope.cards[key]){
                                createCard(k,values[j],filters[i],key);
                            }
                        } 
                    }
                }
                // rimuovo le schede se i parametri sono stati rimossi
                for(var k in $scope.cards){
                    var key = $scope.cards[k].search_param;
                    if(!params[key]){
                        delete $scope.cards[k];
                    }
                }
            }

            function createCard(search,value,filter,key){
                var card = angular.copy(filter);
                card.value = value;
                switch(search){
                    case 'q':
                        card.label2 = value;
                        $scope.cards['q'] = card;
                        break;
                    case 'users':
                        // cerco il nome utente
                        var user = MemoryFactory.getUser();
                        if(value == user.id && user.displayName){
                            card.label2 = user.displayName;
                            $scope.cards[key] = card;
                        }else{ $log.error("utente sconosciuto o mancanza di displayName",value,user); }
                        break;
                    case 'groups':
                        // cerco il nome del gruppo
                        MapService.get(value).then(
                            function(response){
                                if(response.entity_type == filter.entity_type){
                                    card.label2 = response.name;
                                    $scope.cards[key] = card;
                                }else{
                                    //rimuovo filtro
                                    removeFilter(search,value);
                                }
                            },
                            function(response){
                                $log.error("non trovo il gruppo ",value,", errore ",response);
                                //rimuovo filtro
                                removeFilter(search,value);
                            }
                        );
                        break;
                    default:
                        $log.error("Non so gestire il parametro search: ",key,value,filter);
                }
            }

            function removeFilter(key,value){
                if(!value){
                    $location.search(key,null);
                }
                var params = $location.search();

                if(params[key]){
                    var values = params[key];
                    var a = values.toString().split(',');
                    for(var i = 0 ; i < a.length; i ++){
                        if(a[i] == value){
                            a.splice(i,1);
                        } 
                    }
                    var newValues = a.join(',');
                    if(newValues != '')
                        $location.search(key,newValues);
                    else
                        $location.search(key,null);
                }
            }

        }]
    };
})
    
    .directive('entityActions', function() {

    return {
        restrict: 'EG',
        scope: {
            actions: '=actions',
            marker: '=marker',
            close:'=close',
            label:'=label',
            reset:'=reset'
        },
        templateUrl: '/templates/map-ui-template/actionsModal.html',
        controller: ['$scope','$location','$log','$filter','$ionicLoading','$ionicPopup','$ionicActionSheet','$q','AuthService','groupsFactory','MemoryFactory','notificationFactory', function($scope,$location,$log,$filter,$ionicLoading,$ionicPopup,$ionicActionSheet,$q,AuthService,groupsFactory,MemoryFactory,notificationFactory){

            // controllo azioni
            $scope.member = false;
            $scope.owner = false;
            $scope.subscriber = false;
            if(!$scope.user)
                $scope.user = MemoryFactory.getUser();

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyActions){
                    e.preventDestroyActions = true;
                    delete $scope;
                }
            });

            $scope.$watch('marker',function(e,old){
                // cambia il marker
                if(e.id != old.id){
                    // init delle simple entities
                    init();
                }
            });

            init();


            function init(){
                var promises = [];
                if($scope.marker.entity_type == "FL_GROUPS"){
                    promises.push(initGroup());
                }
                promises.push(initSubscriptions());
                //quando sono tutti i valori inizializzati
                $q.all(promises).then(
                    function(response){
                        // init delle azioni
                        initActions();
                    });

            }

            // recupero i subscribers
            function initSubscriptions(){
                return notificationFactory.subscribers($scope.marker.id).then(
                    function(response){
                        $log.debug('check subscribers ',response);
                        var subscribers = response;
                        if($scope.user)
                            var index = subscribers.indexOf($scope.user.id);
                        $scope.subscriber = index < 0 ? false : true;
                    },
                    function(response){
                        $log.error('check subscribers ',response);
                    }
                );

            }

            // recupero i membri se e' un gruppo
            function initGroup(){
                return groupsFactory.getMembers($scope.marker.id).then(
                    function(response){
                        var index = response.map(function(e){return e.memberId}).indexOf($scope.user.id);
                        if(index > -1){
                            // se esiste allora membro
                            $scope.member = true;
                            if(response[index].role == 'owner'){
                                // se ha impostato il ruolo proprietario
                                $scope.owner = true;
                            }
                        }else{
                            $scope.member = false;
                            $scope.owner = false;
                        }
                    },
                    function(response){
                        $log.log('the user is not a group member!');
                        // giusto per essere sicuro...
                        $scope.member = false;
                        $scope.owner = false;
                    }
                );
            }

            $scope.actionEntity = function(action, param){
                $log.debug('check action ',action,param);
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
                        groupsFactory.getMembers($scope.marker.id).then(
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
}).directive('membersCounter',function(){
    return {
        restrict: 'EG',
        scope: {
            id: '=id',
            details: '=details',
            reset:'=reset'
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
            $scope.$watch('reset',function(e,old){
                // cambia il marker
                if(e && e != old){
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


            // init form
            $scope.loader = {};
            var limit = 5000000;
            $scope.onLoad = function( e, reader, file, fileList, fileOjects, fileObj){
                $log.error('check onLoad, da scartare? ',e,reader,file,fileObj);
                // se non supera la dimensione massima di 5Mb
                if(fileObj.filesize <= limit){
                    addToImageCache(fileObj);
                }
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
                    titleText: 'asd <i class="icon ion-sad-outline"></i>'+$filter('translate')(text),
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

}).directive('categoryFilters',['$log','$filter','myConfig', function ($log,$filter,myConfig) {
    return {
        restrict: 'E',
        templateUrl: '/templates/map-ui-template/treeMap.html',
        scope: {
            markers:"=array",
            toggleCat:"=toggle",
            filters:"=",
            changeFavCat:"=",
            favCat:"="
        },
        link: function (scope, element) {

            var backHeight = 47; //pixels
            scope.$on('$destroy',function(){delete scope;});

            scope.colors = myConfig.design.colors;

            scope.cats = [];
            var firstLevel = [];
            for (var i in scope.filters) {
                if(i != 'entity_type'){
                    firstLevel.push(scope.filters[i].list.length);
                    scope.cats.push(scope.filters[i]);  
                }
            }
            scope.$watch(function() {
                return element[0].clientWidth;
            }, function(value,old){
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
                    var cats = scope.cats[i].list;
                    var buff = [];
                    for(var j = 0; j < cats.length; j++){
                        buff[j] = 1;
                    }
                    var boxes2 = Treemap.generate(buff,rect.width,rect.height-backHeight);
                    for(var k = 0; k < boxes2.length; k++){
                        scope.cats[i].list[k].rect = toPer(boxes2[k]);
                    }
                }
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
                scope.back = false;
                return false;
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
}]).directive('entityFilter',['$log','myConfig', function ($log,myConfig) {
    return {
        restrict: 'EG',
        templateUrl: '/templates/map-ui-template/entityTypeFilter.html',
        scope: {
            toggle:"=",
            filter:"="
        },
        link: function (scope, element) {
            scope.$on('$destroy',function(){delete scope;});
            //$log.debug("check entityFilter ",scope.filter.list,scope.toggle);
        }
    }
}]).directive('subscribersCounter',function(){
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

}).directive('userHandler',function(){
    return {
        restrict: 'E',
        scope: {
            check:'='
        },
        templateUrl: '/templates/map-ui-template/userHandlerOmnibar.html',
        controller: ['$scope','$log','$filter','$timeout','$state', '$ionicModal', '$location', 'notificationFactory', 'MemoryFactory','myConfig', function($scope,$log,$filter,$timeout,$state,$ionicModal,$location, notificationFactory,MemoryFactory,myConfig){

            $scope.$on('$destroy', function(e) {
                if(!e.preventDestroyUserHandler){
                    e.preventDestroyUserHandler = true;
                    $timeout.cancel(timer);
                    delete $scope;
                }
            });

            $scope.$watch('check',function(e,old){
                if(e!=old){
                    init();
                }
            })

            // recupero l'utente

            // tempo di polling
            var MODAL_RELOAD_TIME = myConfig.behaviour.bbox_reload_time;
            // variabile dove inserisco il timer per il polling
            var timer = false;
            // ultimo check
            var since = false;
            // check novita'
            var now = new Date();
            // last check
            $scope.last = new Date();
            // funzione di polling
            var polling = function(){ 
                $log.log('check notifications!');
                $timeout.cancel(timer);

                // check notifiche
                checkNotifications();

                timer = $timeout(function(){
                    // aggiorno i dettagli
                    polling();
                },MODAL_RELOAD_TIME);
            };


            init();

            function init(){
                $scope.user = MemoryFactory.getUser();
                $scope.highlight = false;
                $log.debug('check user notification',$scope.user);
                if($scope.user){
                    initNotifications();
                }else{
                    $timeout.cancel(timer);
                }
            }

            function initNotifications(){
                $scope.highlights = 0;
                $scope.news =[];
                polling();
            }

            function checkNotifications(){
                notificationFactory.get(since).then(
                    function(response){
                        $scope.last = new Date();
                        $log.debug('check get notfications ',response);
                        // se c'e' qualcosa da leggere segnalo
                        if(response.length > 0)
                            $scope.highlight = true;
                        // segno da leggere!
                        for(var i = 0; i < response.length; i++){
                            // se la notifica e' stata generata dopo il caricamento della pagina
                            if(now <= new Date(response[i].timestamp)){
                                // highlight della notizia
                                response[i].new = true;
                            }
                            // indice della notizia per controllo duplicati
                            var j = $scope.news.map(function(e){return e.id;}).indexOf(response[i].id);
                            // se non gia' presente aggiungo
                            if(j < 0){
                                $scope.news.push(response[i]);
                            }
                        }
                    },
                    function(response){$log.error('check get notfications ',response);}
                );
                // aggiorno la since
                since = new Date();
            }


            $scope.login = function(){
                $state.go('login', {action:'login'});
            };


            $scope.show = function(){
                $log.debug('show notifications ',$scope.news);
                //apro modal
                openModal();
                $scope.highlight = false;
            }

            $scope.go = function(notification){
                $log.debug('check notification ',notification);
                // notifica letta
                notification.new = false;
                // chiudo la modal
                $scope.close();
                // cambio paramentro search
                $location.search('entity',notification.object);
            }
            
            $scope.clear = function(){
                // consume delle notifiche
                $scope.news = [];
                notificationFactory.consume($scope.last).then(
                    function(response){
                    },
                    function(response){
                        $log.error('impossibile cancellare le notifiche',response);
                    }
                );
                
            }

            $scope.consume = function(notification){
                var i = $scope.news.map(function(e){return e.id}).indexOf(notification.id);
                if(i > -1)
                    $scope.news.splice(i,1);
                
                // consume della notifica
                notificationFactory.read(notification.id).then(
                    function(response){
                    },
                    function(response){
                        $log.error('impossibile cancellare la notifica',response);
                    }
                );
            }

            function openModal(){
                $ionicModal.fromTemplateUrl('templates/modals/notifications.html', {
                    scope: $scope,
                    animation: 'fade-in'
                }).then(function(modal){
                    $scope.notifications = modal; 
                    $scope.notifications.show();
                }, function(err){
                    $log.error("notification modal error",err);
                });

                $scope.close = function() {
                    $log.debug('hide close');
                    $scope.notifications.hide();
                };
                // Cleanup the modal when we're done with it!
                $scope.$on('$destroy', function() {
                    $scope.notifications.remove();
                });
                // Execute action on hide modal
                $scope.$on('notifications.hidden', function() {
                    // Execute action
                    $log.debug('chiuse le notifiche');
                });
                // Execute action on remove modal
                $scope.$on('notifications.removed', function() {
                    // Execute action
                });
                $scope.$on('notifications.shown', function() {
                    //$log.log('Notification modal is shown!');
                });

            };


        }]
    }

});
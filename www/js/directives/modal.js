angular.module('firstlife.directives').directive('thingCard', function () {
    return {
        restrict: 'EG',
        scope: {
            id: "<"
        },
        templateUrl: "/templates/thing/card.html",
        controller: ['$scope', '$timeout', '$location', '$ionicModal', '$ionicPopover', '$ionicActionSheet', '$ionicLoading', '$ionicPopup', '$log', '$filter', '$window', 'myConfig', 'ThingsService', 'AuthService', 'notificationFactory', 'groupsFactory', 'PlatformService', 'shareFactory', function ($scope, $timeout, $location, $ionicModal, $ionicPopover, $ionicActionSheet, $ionicLoading, $ionicPopup, $log, $filter, $window, myConfig, ThingsService, AuthService, notificationFactory, groupsFactory, PlatformService, shareFactory) {

            $scope.config = myConfig;
            $scope.infoPlace = {};
            $scope.now = new Date();

            var consoleCheck = false;
            var hide = null;
            var searchParams = $location.search();
            $scope.embed = searchParams.embed || false;


            // visualizzazione web o mobile?
            $scope.isMobile = PlatformService.isMobile();

            $scope.$on('$destroy', function (e) {
                if (e.defaultPrevented)
                    return;
                e.preventDefault();

                delete $scope;
            });


            $scope.$on('markerClick', function (event, args) {
                // $log.debug('markerClick?',args);
                if (event.defaultPrevented)
                    return;
                event.preventDefault();
                // $log.debug('markerClick?',args);
                if (args.id) {
                    // $log.debug('markerClick',args);
                    init(args.id);
                }
            });


            $scope.$on('subscribersReset', function (event) {
                if (event.defaultPrevented)
                    return;
                event.preventDefault();

                // $log.debug('subscribersReset');
                $timeout(initSubscribers, 1);
            });
            $scope.$on('membersReset', function (event) {
                if (event.defaultPrevented)
                    return;
                event.preventDefault();

                $log.debug('membersReset');
                $timeout(initMembers, 1);
            });


            // se all'apertura trovo il parametro entity nella search apro la modal
            var initEntity = $location.search().entity;
            if (initEntity) {
                // $log.debug('init entity?',initEntity);
                // init(initEntity);
                $scope.$emit('wallClick', {id: initEntity})
            }

            $scope.locateOnMap = function (thingId) {
                $log.log('locateOnMap', $scope.id);
                $scope.$emit('locateThing', {id: thingId});
            };

            //action sheet init-info sul place
            $scope.showASDeletedPlace = function (entityId) {
                var title = "";
                if (entityId === -1)
                    title = $filter('translate')('ERROR_CANCEL');
                else
                    title = $filter('translate')('SUCCESS_CANCEL');

                var hideSheet = $ionicActionSheet.show({
                    titleText: title,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function () {
                        //$log.debug("Deleted place cancelled: "+entityId);
                    }
                });
                //$log.debug("actionSheet", hideSheet);
                // to do serve per il routing, chiudo l'action sheet con il pulsante back
            };

            $scope.share = AuthService.doAction(function (thingId) {
                $scope.inviteForm = {
                    url: $window.location.href,
                    id: thingId,
                    inClipboard: false,
                    embed: {
                        iframe: '<iframe border="0" src="' + $window.location.href + '&embed=viewer' + '"></iframe>',
                        inClipboard: false
                    },
                    emails: null,
                    message: null,
                    tab: 0,
                    sendError: false,
                    sendOk: false,
                    toggle: function (i) {
                        $scope.inviteForm.tab = i;
                    },
                    close: function () {
                        alertPopup.close();
                    },
                    action: function () {
                        switch ($scope.inviteForm.tab) {
                            case 1:
                                $scope.copyToClipboard('url');
                                break;
                            case 2:
                                $scope.copyToClipboard('embed');
                                break;
                            default:
                                if (!$scope.inviteForm.emails) {
                                    return;
                                } else {
                                    shareFactory.thing($scope.inviteForm).then(
                                        function (res) {
                                            $scope.inviteForm.sendError = false;
                                            $scope.inviteForm.emails = null;
                                            $scope.inviteForm.message = null;
                                            $scope.inviteForm.sendOk = true;
                                            $timeout(function () {
                                                alertPopup.close();
                                            }, 2000);
                                        },
                                        function (err) {
                                            $scope.inviteForm.sendError = true;
                                        }
                                    );
                                }
                        }

                    }
                };
                if ($location.search().entity) {
                    angular.extend($scope.inviteForm, {id: $location.search().entity});
                }
                $scope.copyToClipboard = function (type) {
                    if (!clipboard.supported)
                        return;
                    switch (type) {
                        case 'embed':
                            clipboard.copyText($scope.inviteForm.embed.iframe);
                            $scope.inviteForm.embed.inClipboard = true;
                            $scope.inviteForm.inClipboard = false;
                            break;
                        default:
                            clipboard.copyText($scope.inviteForm.url);
                            $scope.inviteForm.inClipboard = true;
                            $scope.inviteForm.embed.inClipboard = false;
                    }
                };
                var buttons = [];
                var options = {
                    title: $filter('translate')('INVITE_ALERT_TITLE'),
                    subTitle: $filter('translate')('INVITE_ALERT_SUBTITLE'),
                    templateUrl: 'templates/popup/share.html',
                    buttons: buttons,
                    scope: $scope
                };

                var alertPopup = $ionicPopup.show(options, $scope);

                alertPopup.then(function (res) {
                    // $log.debug('onTap',res);
                });
            });


            $scope.toggleFollow = AuthService.doAction(function () {

                // $log.debug('is subscriber', $scope.isSubscriber);

                if ($scope.isSubscriber) {

                    //parte richiesta di unsubscribe
                    $scope.showConfirm = function () {
                        var confirmPopup = $ionicPopup.confirm({
                            title: $filter('translate')('ENTITY_UNSUBSCRIBE'),
                            template: $filter('translate')('ENTITY_UNSUBSCRIBE_ASK')
                        });
                        confirmPopup.then(
                            function (res) {
                                if (res) {
                                    notificationFactory.unsubscribe($scope.infoPlace.marker.id).then(
                                        function (response) {
                                            // $log.debug(response);
                                            initSubscribers();
                                        },
                                        function (response) {
                                            $log.error("notificationFactory, unsubscribe, errore", response);
                                        }
                                    );
                                } else {
                                    $log.log('unsubscribe annullata');
                                }
                            });
                    };
                    $scope.showConfirm();

                } else {

                    //parte richiesta di subscribe
                    $scope.showConfirm = function () {
                        var confirmPopup = $ionicPopup.confirm({
                            title: $filter('translate')('ENTITY_SUBSCRIBE'),
                            template: $filter('translate')('ENTITY_SUBSCRIBE_ASK')
                        });

                        confirmPopup.then(
                            function (res) {
                                if (res) {
                                    notificationFactory.subscribe($scope.infoPlace.marker.id).then(
                                        function (response) {
                                            // $log.debug(response);
                                            initSubscribers();
                                        },
                                        function (response) {
                                            $log.error("notificationFactory, subscribe, errore", response);
                                        }
                                    );
                                } else {
                                    $log.log('subscribe annullata');
                                }
                            });
                    };
                    $scope.showConfirm();
                }

            });

            // menu popover della modals
            function initPopoverMenu() {

                $ionicPopover.fromTemplateUrl('templates/popovers/ModalPopoverMenu.html', {
                    scope: $scope
                }).then(function (popover) {
                    $scope.popover = popover;
                });

                $scope.openPopover = function ($event) {
                    $scope.popover.show($event);
                };
                $scope.closePopover = function () {
                    $scope.popover.hide();
                };

                $scope.removeButtonPopover = function () {
                    var marker = $scope.infoPlace.marker;
                    //$log.debug("rimuovo il place ", markerId);
                    $scope.closePopover();
                    $scope.remove(marker);
                };
                $scope.updateButtonPopover = function () {
                    var marker = $scope.infoPlace.marker;
                    $scope.closePopover();
                    $scope.updateEntity(marker);
                };


                //Cleanup the popover when we're done with it!
                $scope.$on('$destroy', function () {
                    try {
                        $scope.popover.remove();
                    } catch (e) {
                    }
                });
            };

            //action sheet per creazione place/evento
            $scope.remove = function (marker) {
                if (consoleCheck) console.log("ModalPlaceController, showASRemove, id: ", marker.id);

                $scope.showConfirm = function () {
                    var confirmPopup = $ionicPopup.confirm({
                        title: $filter('translate')('DELETE'),
                        template: $filter('translate')('DELETE_ASK')
                    });
                    confirmPopup.then(
                        function (res) {
                            if (res) {
                                ThingsService.remove(marker.id).then(
                                    // success function
                                    function (response) {
                                        $scope.showASDeletedPlace(marker.id);
                                        // $log.debug('deleteMarker',marker.id,response);
                                        // notifico la mappa

                                        $scope.$emit("requestDeleteMarker", {id: marker.id});
                                        $scope.exit();
                                    },
                                    // error function
                                    function (error) {
                                        $scope.showASDeletedPlace(-1);
                                        $log.error("Failed to get required marker, result is " + error);
                                        //$scope.closeModal();

                                    });
                            } else {
                                // $log.debug('cancellazione annullata');
                            }
                        });
                };

                $scope.showConfirm();

            };

            //action sheet init-info sul place
            $scope.showASDeleted = function (entityId) {
                var title = "";
                if (entityId === -1 || entityId === -2)
                    title = $filter('translate')('ERROR_CANCEL');
                else
                    title = $filter('translate')('SUCCESS_CANCEL');

                var hideSheet = $ionicActionSheet.show({
                    titleText: title,
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function () {
                    }
                });
            };

            //Update marker in local/server
            $scope.updateEntity = function (marker) {
                var params = {lat: marker.lat, lng: marker.lng, zoom: marker.zoom_level, id: marker.id};
                $scope.$emit("updateThing", params);

                //fai uscire la wizardPlace con placeholder dati vecchi
                $scope.exit();
            };

            /*
             * Add child marker/place
             */
            $scope.addChildEntity = function () {

                var marker = $scope.infoPlace.marker,
                    params = {
                        lat: marker.lat,
                        lng: marker.lng,
                        zoom_level: marker.zoom_level,
                        rel: marker.id,
                        parent_type: marker.entity_type
                    };

                $log.debug('addChildEntity', params);
                //fai uscire la wizardPlace con placeholder dati vecchi
                $scope.exit();
                // mando il messaggio
                $scope.$emit("requestEditing", params);
            };

            // click su tag o categoria per filtrare
            $scope.filter = function (text, type) {
                var query = text;
                switch (type) {
                    case 'user':
                        break;
                    case 'group':
                        break;
                    case 'icon':
                        query = $filter('translate')(text);
                    default:
                        // aggiorno il parametro q
                        $scope.$emit('openSideLeft');
                        $scope.$emit('handleUpdateQ', {q: query});
                }
                // chiudo la modal
                if (text) {
                    $scope.exit();
                }
            };


            /*
             * funzioni private
             */

            function init(markerId) {
                $log.debug('opening thing card', markerId);
                $location.search('entity', markerId);
                // inizio caricamento modal
                $scope.loaded = false;
                $scope.error = false;
                // cancello il marker
                $scope.infoPlace.marker = angular.extend({});


                $scope.infoPlace = {};
                $scope.infoPlace.modify = false;
                $scope.infoPlace.dataForm = {};
                // carico il contenuto della modal
                loadModal(markerId);
                // creo il menu per la modal
                initPopoverMenu();
            };

            function loadModal(markerId) {
                $scope.obs = ThingsService.get(markerId).then(
                    function (marker) {
                        $scope.infoPlace.marker = angular.copy(marker);
                        $log.debug('openPlaceModal', marker)
                        $scope.$emit('openPlaceModal', {marker: marker.id});
                        $scope.loaded = true;
                        // contatore sottoscrittori
                        initSubscribers();
                        // se un gruppo
                        if ($scope.infoPlace.marker.entity_type === 'FL_GROUPS') {
                            initMembers();
                        } else {
                            $scope.members = 0;
                        }

                        // inizializzo la maschera dei permessi per l'utente per il marker attuale
                        if (marker.owner && marker.owner.id)
                            initPerms(marker.owner.id);
                        // recupero il tipo e lo metto dentro $scope.currentType
                        initTypeChecks(marker.entity_type);

                    },
                    function (err) {
                        $log.error("changeModal, errore ", err);
                        $scope.loaded = true;
                        $scope.error = true;
                        switch (err.status) {
                            case 404:
                                showAlert({text: 'DELETED_MARKER_MESSAGE', title: 'DELETED_MARKER_TITLE'});
                                $scope.$emit("lostMarker", {id: markerId});
                                break;
                            default:
                                showAlert({text: 'SORRY_NETWORK_ERROR', title: 'ERROR_NETWORK'});
                        }

                        $scope.exit();
                    }
                );
            }

            $scope.exit = function () {
                $scope.$emit('exitThingCard');
            };

            function initMembers() {
                groupsFactory.getMembers($scope.infoPlace.marker.id).then(
                    function (result) {
                        $scope.members = result.length ? result.length : 0;
                    },
                    function (error) {
                        $log.error('groupsFactory, getMembers, error ', error);
                    }
                );
            }

            // An alert dialog
            function showAlert(content) {
                if (!content) {
                    content = {};
                }
                if (!content.title) {
                    content.title = 'ERROR';
                }
                if (!content.text) {
                    content.text = 'UNKNOWN_ERROR';
                }
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')(content.title),
                    template: $filter('translate')(content.text)
                });
            };


            function initPerms(author) {
                if (!$scope.user)
                    $scope.user = AuthService.getUser();
                // se l'utente non e' definito
                if (!$scope.user)
                    return false;

                var source = 'others';
                if (author == $scope.user.id)
                    source = 'self';


                // $log.debug(author,'==',$scope.user.id);
                $scope.checkPerms = AuthService.checkPerms(source);
                return $scope.perms;
            }


            function initTypeChecks(entity_type) {
                var index = $scope.config.types.list.map(function (e) {
                    return e.key
                }).indexOf(entity_type);
                // recupero il current type
                $scope.currentType = $scope.config.types.list[index];
            }


            function initSubscribers() {
                // $log.debug('id?',$scope.infoPlace.marker.id);
                if (!$scope.user)
                    $scope.user = AuthService.getUser();

                // $scope.user = AuthService.getUser();
                notificationFactory.subscribers($scope.infoPlace.marker.id).then(
                    function (response) {
                        // $log.debug('check subscribers',response);
                        $scope.subscribers = response.length;
                        if ($scope.user) {
                            var index = response.map(function (e) {
                                return e.id
                            }).indexOf($scope.user.id);
                            $scope.isSubscriber = (index > -1);
                            // $log.debug('check isSubscriber',index);
                        }
                    },
                    function (response) {
                        $log.error('check subscribers ', response);
                    }
                );
            }

        }]
    }
}).directive('relationsActions', function () {

    return {
        restrict: 'EG',
        scope: {
            relations: '=relations',
            callback: '=callback',
            label: '=label',
            id: '=id'
        },
        templateUrl: '/templates/map-ui-template/AddChildren.html',
        controller: ['$rootScope', '$scope', '$log', '$filter', 'myConfig', 'AuthService', 'groupsFactory', function ($rootScope, $scope, $log, $filter, myConfig, AuthService, groupsFactory) {


            $scope.$on('$destroy', function (e) {
                if (!e.preventDestroyRelationsActions) {
                    e.preventDestroyRelationsActions = true;
                    delete $scope;
                }
            });

            $rootScope.$on('groupReset', function (e, args) {
                if (!e.preventGroupResetRelationActions) {
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
            function initRelations() {
                $scope.relationsList = angular.copy($scope.relations);
                $scope.count = 0;
                for (var i in $scope.relationsList) {
                    if (!$scope.relationsList[i].rel.check) {
                        $scope.relationsList[i].check = true;
                        $scope.count++;
                    } else {
                        // controllo e metto a false fino a risposta
                        lazyCheck($scope.relationsList[i], $scope.relationsList[i].rel.check);
                        $scope.relationsList[i].check = false;
                    }
                    $scope.relationsList[i].color = colors[$scope.relationsList[i].index];
                }
                //$log.debug('check relations',$scope.relations,$scope.relationsList);
            }


            function lazyCheck(relation, check) {
                switch (check) {
                    case 'membership':
                        console.log('checker ', checker);
                        checker.subscribe(
                            function (response) {
                                relation.check = true;
                                $scope.count++;
                            },
                            function (response) {
                                $log.log('no member!');
                            },
                            function () {
                            }
                        );
                        break;
                    default:
                }
            }
        }]
    }
}).directive('entityActions', ['$location', '$log', '$filter', '$ionicLoading', '$ionicPopup', '$ionicActionSheet', '$q', '$window', '$timeout', 'AuthService', 'groupsFactory', 'MemoryFactory', 'notificationFactory', 'clipboard', 'myConfig', 'PlatformService', 'shareFactory', function ($location, $log, $filter, $ionicLoading, $ionicPopup, $ionicActionSheet, $q, $window, $timeout, AuthService, groupsFactory, MemoryFactory, notificationFactory, clipboard, myConfig, PlatformService, shareFactory) {
    return {
        restrict: 'EG',
        scope: {
            actions: '< actions',
            marker: '< marker',
            close: '&close',
            label: '< label'
        },
        templateUrl: '/templates/thing/actionsModal.html',
        link: function (scope, element, attr) {

            scope.$on('$destroy', function (event) {
                if (event.defautPrevented)
                    return;
                event.preventDefault();

                delete scope;
            });


            // controllo azioni
            scope.member = false;
            scope.owner = false;
            scope.markerOwner = scope.marker.owner ? scope.marker.owner.id : null;

            scope.user = AuthService.getUser();
            // visualizzazione web o mobile?
            scope.isMobile = PlatformService.isMobile();

            init();
            var subscribers = null;

            // $log.debug('actions ', scope.actions);

            function init() {
                // lista di promise
                var promises = [];
                // se e' un gruppo inizializzo con i membri
                if (scope.marker.entity_type === "FL_GROUPS") {
                    //bug da sistemare
                    promises.push(initGroup());
                }
                // aggiungo il recupero dei sottoscrittori
                // promises.push(initSubscribers());
                // creo una promise da tutte le inizializzazioni
                var deferred = $q.all(promises);
                // quando le promise sono pronte
                deferred.then(
                    function () {
                        $log.debug('ok, go to initActions')
                        // init delle azioni
                        initActions();
                    },
                    function (err) {
                        $log.error('init entityActions, err ', err);
                    }
                );
            }

            // recupero i membri se e' un gruppo
            function initGroup() {
                // $log.debug('init group!')
                var deferred = $q.defer();
                groupsFactory.getMembers(scope.marker.id).then(
                    function (response) {
                        // $log.debug('groupFactory, getMembers: there are members')
                        scope.users = response;
                        var index = -1;
                        if (AuthService.isAuth()) {
                            index = response.map(function (e) {
                                return e.id
                            }).indexOf(scope.user.id);
                        }
                        if (index > -1) {
                            // se esiste allora membro
                            scope.member = true;
                        } else {
                            scope.member = false;
                            scope.owner = false;
                        }
                        if (scope.user && scope.markerOwner === scope.user.id) {
                            // se ha impostato il ruolo proprietario
                            scope.owner = true;
                            scope.member = true;
                        }
                        deferred.resolve();
                    },
                    function (response) {
                        // $log.debug('groupFactory, getMembers: the user is not a group member!');
                        // giusto per essere sicuro...
                        scope.member = false;
                        scope.owner = false;
                        deferred.reject();
                    }
                );
                return deferred.promise;
            }

            function initSubscribers() {
                var deferred = $q.defer();
                notificationFactory.subscribers(scope.marker.id).then(
                    function (response) {
                        // $log.debug('check subscribers',response);
                        if (scope.user)
                            var index = response.map(function (e) {
                                return e.id
                            }).indexOf(scope.user.id);
                        scope.subscriber = (index < 0);
                        deferred.resolve();
                    },
                    function (response) {
                        $log.error('check subscribers ', response);
                        deferred.reject(response);
                    }
                );
                return deferred.promise;
            }


            scope.actionEntity = AuthService.doAction(function (action, param) {
                // $log.debug('check action ',action,param);
                switch (action) {
                    case 'unsubscribe':
                        //parte richiesta di unsubscribe
                        scope.showConfirm = function () {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_UNSUBSCRIBE'),
                                template: $filter('translate')('ENTITY_UNSUBSCRIBE_ASK')
                            });
                            confirmPopup.then(
                                function (res) {
                                    if (res) {
                                        notificationFactory.unsubscribe(scope.marker.id).then(
                                            function (response) {
                                                scope.subscriber = false;
                                                initActions();
                                                reset('subscribers');
                                            },
                                            function (response) {
                                                $log.error("notificationFactory, unsubscribe, errore", response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('unsubscribe annullata');
                                    }
                                });
                        };
                        scope.showConfirm();
                        break;
                    case 'subscribe':
                        //parte richiesta di subscribe
                        scope.showConfirm = function () {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('ENTITY_SUBSCRIBE'),
                                template: $filter('translate')('ENTITY_SUBSCRIBE_ASK')
                            });

                            confirmPopup.then(
                                function (res) {
                                    if (res) {
                                        notificationFactory.subscribe(scope.marker.id).then(
                                            function (response) {
                                                scope.subscriber = true;
                                                initActions();
                                                reset('subscribers');
                                            },
                                            function (response) {
                                                $log.error("notificationFactory, subscribe, errore", response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('subscribe annullata');
                                    }
                                });
                        };
                        scope.showConfirm();
                        break;
                    case 'view':
                        //aggiorno i parametri search con il filtro
                        $location.search(param, scope.marker.id);
                        scope.$emit('setGroupCard', {group: scope.marker});
                        //chiudo la modal
                        scope.close();
                        break;
                    case 'join':
                        //parte richiesta di join
                        scope.showConfirm = function () {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_JOIN'),
                                template: $filter('translate')('GROUP_JOIN_ASK')
                            });

                            confirmPopup.then(
                                function (res) {
                                    if (res) {
                                        groupsFactory.joinGroup(scope.marker.id).then(
                                            function (response) {
                                                scope.member = true;
                                                if (response.role == 'owner') {
                                                    // se ha impostato il ruolo proprietario
                                                    scope.owner = true;
                                                }
                                                initActions();
                                                reset('members');
                                            },
                                            function (response) {
                                                $log.error("actionEntity, join, errore", response);
                                                actionReport(false);
                                            }
                                        );
                                    } else {
                                        $log.log('join annullata');
                                    }
                                });
                        };

                        scope.showConfirm();

                        break;
                    case 'leave':
                        // conferma se uscire
                        scope.showConfirm = function () {
                            var confirmPopup = $ionicPopup.confirm({
                                title: $filter('translate')('GROUP_LEAVE'),
                                template: $filter('translate')('GROUP_LEAVE_ASK')
                            });

                            confirmPopup.then(
                                function (res) {
                                    if (res) {
                                        groupsFactory.leaveGroup(scope.marker.id).then(
                                            function (response) {
                                                // reset dei permessi
                                                scope.member = false;
                                                scope.owner = false;
                                                // reinizializzo i permessi
                                                initActions();
                                                reset('members');
                                            },
                                            function (response) {
                                                $log.error("actionEntity, leave, errore", response);
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

                        scope.showConfirm();
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
            function initActions() {
                // copio le azioni per manipolarle
                scope.actionList = angular.copy(scope.actions);
                for (var i in scope.actionList) {
                    switch (scope.actionList[i].check) {
                        case 'membership':
                            angular.extend(scope.actionList[i], {check: scope.member});
                            break;
                        case 'ownership':
                            angular.extend(scope.actionList[i], {check: scope.owner});
                            break;
                        case 'noOwnership':
                            angular.extend(scope.actionList[i], {check: (!scope.owner && scope.member)});
                            break;
                        case 'noMembership':
                            angular.extend(scope.actionList[i], {check: (!scope.member && !scope.owner)});
                            break;
                        case 'subscriber':
                            angular.extend(scope.actionList[i], {check: scope.subscriber});
                            break;
                        case 'noSubscriber':
                            angular.extend(scope.actionList[i], {check: !scope.subscriber});
                            break;
                        default: //se nessun check e' richiesto > true
                            angular.extend(scope.actionList[i], {check: true});
                    }
                }
                // $log.debug('check actionList ',$scope.actionList);
            }

            function loading() {
                $ionicLoading.show({
                    template: 'REQUESTING...',
                    animation: 'fade-in',
                    noBackdrop: true,
                    maxWidth: 50,
                    showDelay: 0
                });
            }

            function done() {
                $ionicLoading.hide();
            }

            function actionReport(success) {
                var text = 'SUCCESS';
                if (!success) {
                    text = 'ERROR';
                }
                var hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(text),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function () {
                        // $log.debug('CANCELLED');
                    }
                });
            }

            function reset(action) {
                // lancio il reset
                switch (action) {
                    case 'members':
                        scope.$emit('membersReset', {id: scope.marker.id});
                        break;
                    case 'subscribers':
                        scope.$emit('subscribersReset', {id: scope.marker.id});
                        break;
                    default:
                        break;
                }
            }

        }
    };
}]).directive('loader', function () {
    return {
        scope: {},
        restrict: 'E',
        template: '<div style="width:100%;text-align:center;padding:40px;"><ion-spinner icon="android" class="spinner-positive"></ion-spinner></div>'
    }
}).directive('modalLists', ['$log', '$ionicScrollDelegate', '$location', 'AuthService', 'PlatformService', 'notificationFactory', 'groupsFactory', 'postFactory', function ($log, $ionicScrollDelegate, $location, AuthService, PlatformService, notificationFactory, groupsFactory, postFactory) {
    return {
        restrict: 'E',
        scope: {
            marker: '=',
            show: '&show',
            add: '&',
            close: '&'
        },
        templateUrl: '/templates/thing/modalLists.html',
        link: function (scope, element, attrs) {

            scope.$on('$destroy', function (e) {
                if (e.defaultPrevented)
                    return;

                $location.hash();
                e.preventDefault();
                delete scope;
            });

            scope.isMobile = PlatformService.isMobile();
            scope.subscribers = 0;
            scope.initiatives = 0;
            scope.posts = 0;
            scope.members = 0;
            scope.contents = 0;

            // numero di tab
            var tabs = 4;
            // parto con la prima tag
            scope.toggle = 0;
            // cambio di tab
            scope.setToggle = function (i) {
                scope.toggle = i > -1 && i < tabs ? i : scope.toggle;
                $location.hash('modalLists');
                $ionicScrollDelegate.anchorScroll(true);
            };
            scope.click = function (id) {
                // $log.debug('click',id);
                scope.$emit('wallClick', {id: id});
            };

            scope.parent = {};

            scope.$on('updateParent', function (event, args) {
                if (event.defaultPrevented)
                    return;
                event.preventDefault();

                scope.parent = args.parent || {};
            });

            scope.$on('counterUpdate', function (event, args) {
                if (event.defaultPrevented)
                    return;
                event.preventDefault();

                if (args.subscribers) {
                    scope.subscribers = args.subscribers;
                }
                if (args.posts) {
                    scope.posts = args.posts;
                }
                if (args.initiatives) {
                    scope.initiatives = args.initiatives;
                }
                if (args.members) {
                    scope.members = args.members;
                }
                if (args.contents) {
                    scope.contents = args.contents;
                }
            });

        }
    }
}]).directive('reportEntity', ['$log', '$ionicModal', '$ionicActionSheet', '$filter', 'AuthService', 'ThingsService', 'myConfig', function ($log, $ionicModal, $ionicActionSheet, $filter, AuthService, ThingsService, myConfig) {
    return {
        scope: {
            id: '=',
            close: '='
        },
        restrict: 'E',
        template: '<ion-item class="item item-button-right">{{"REPORT_CONTENT"|translate}}<button class="button button-positive"  on-tap="report.open()"><i class="icon ion-alert"></i></button></ion-item>',
        link: function (scope, element, attrs) {

            scope.$on('$destroy', function (e) {
                if (!e.preventDestroyReportEntity) {
                    e.preventDestroyReportEntity = true;
                    if (hideSheet) {
                        hideSheet.hide();
                    }
                    if (scope.report.modal && scope.report.modal.remove) {
                        scope.report.modal.remove();
                    }
                    delete scope;
                }
            });
            var hideSheet = null;

            scope.disclaimer = $filter('translate')('REPORT_DISCLAIMER');
            scope.user = AuthService.getUser();
            scope.report = {
                content: {
                    thing_id: scope.id,
                    message: !myConfig.dev ? '' : 'sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una '
                },
                form: {}
            };
            // apro la lista dei membri
            scope.report.open = AuthService.doAction(
                function () {
                    scope.close();
                    // apro la modal
                    scope.report.modal = {};
                    $ionicModal.fromTemplateUrl('templates/modals/reportEntity.html', {
                        scope: scope,
                        animation: 'fade-in',//'slide-in-up',
                        backdropClickToClose: true,
                        hardwareBackButtonClose: true
                    }).then(function (membersmodal) {
                        scope.report.modal = membersmodal;
                        scope.report.modal.show();
                    });

                }
            );

            scope.submit = function () {
                // $log.debug('check fields',scope.report.content);

                // invio la segnalazione
                ThingsService.report(scope.report.content).then(
                    function (result) {
                        // tutto ok
                        // $log.debug('segnalazione ok',result);
                        scope.report.modal.remove();
                        feedback('REPORT_SUCCESS_FEEDBACK');
                    },
                    function (err) {
                        // se non e' possibile fare il report
                        $log.error('errore segnalazione', err)
                        feedback('REPORT_ERROR_FEEDBACK');
                    }
                );
            }

            function feedback(title) {
                hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(title),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function () {
                        // $log.debug('CANCELLED');
                    }
                });
            }

        }

    }
}]).directive('claimEntity', ['$log', '$ionicModal', '$ionicActionSheet', '$filter', 'AuthService', 'ThingsService', 'myConfig', function ($log, $ionicModal, $ionicActionSheet, $filter, AuthService, ThingsService, myConfig) {
    return {
        scope: {
            id: '=',
            close: '='
        },
        restrict: 'E',
        template: '<ion-item class="item item-button-right">{{"CLAIM_CONTENT"|translate}}<button class="button button-positive"  on-tap="claim.open()"><i class="icon ion-magnet"></i></button></ion-item>',
        link: function (scope, element, attrs) {

            scope.$on('$destroy', function (e) {
                if (!e.preventDestroyClaimEntity) {
                    e.preventDestroyClaimEntity = true;
                    if (hideSheet) {
                        hideSheet.hide();
                    }
                    if (scope.claim.modal && scope.claim.modal.remove) {
                        scope.claim.modal.remove();
                    }
                    delete scope;
                }
            });
            var hideSheet = null;

            scope.disclaimer = $filter('translate')('CLAIM_DISCLAIMER');
            scope.user = AuthService.getUser();
            scope.claim = {
                content: {
                    message: !myConfig.dev ? '' : 'sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una prova sono una '
                },
                form: {}
            };
            // apro la lista dei membri
            scope.claim.open = AuthService.doAction(
                function () {
                    scope.close();
                    // apro la modal
                    scope.claim.modal = {};
                    $ionicModal.fromTemplateUrl('templates/modals/claimEntity.html', {
                        scope: scope,
                        animation: 'fade-in',//'slide-in-up',
                        backdropClickToClose: true,
                        hardwareBackButtonClose: true
                    }).then(function (membersmodal) {
                        scope.claim.modal = membersmodal;
                        scope.claim.modal.show();
                    });

                }
            );

            scope.submit = function () {
                // $log.debug('check fields',scope.claim.content);

                // invio la segnalazione
                ThingsService.claim(scope.id, scope.claim.content).then(
                    function (result) {
                        // tutto ok
                        // $log.debug('claim ok',result);
                        scope.claim.modal.remove();
                        feedback('CLAIM_SUCCESS_FEEDBACK');
                    },
                    function (err) {
                        // se non e' possibile fare il claim
                        $log.error('errore claim', err)
                        feedback('CLAIM_ERROR_FEEDBACK');
                    }
                );
            }

            function feedback(title) {
                hideSheet = $ionicActionSheet.show({
                    titleText: $filter('translate')(title),
                    cancelText: '<i class="icon ion-ios-arrow-down"></i>',
                    cancel: function () {
                        // $log.debug('CANCELLED');
                    }
                });
            }

        }

    }
}]).directive('nothingToRead', function () {
    return {
        'template': '<div class="no-content-box row"><div class="col col-center">{{"NOCONTENTS_MESSAGE"|translate}}</div></div>'
    }
}).directive('errorWithSomething', function () {
    return {
        scope: {
            flag: '='
        },
        'template': '<div class="error-box row"><button on-tap="close()" class="button button-icon button-clear button-small button-dark ion-close"></button><div class="col col-center"><img src="/img/errors/rete-sovraffollata.svg"><div>{{"SORRY_NETWORK_ERROR"|translate}}</div></div></div>',
        link: function (scope, element, attr) {
            scope.$on('$destroy', function (e) {
                if (!e.defaultPrevented)
                    e.preventDefault();

                delete scope;
            });

            scope.close = function () {
                scope.flag = false;
            }
        }
    }
});
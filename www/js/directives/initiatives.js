/**
 * Created by drpollo on 07/04/2017.
 */
angular.module('firstlife.directives')
    .directive('initiativeList',['$log', '$location','AuthService','InitiativeFactory',function ($log,$location, AuthService,InitiativeFactory) {
        return {
            restrict: 'EG',
            scope: {
                thingId: '< id',
                close: '&'
            },
            templateUrl:'/templates/initiative/initiative-list.html',
            link: function (scope,element,attr) {
                scope.$on('$destroy',function (e) {
                    if(!e.defaultPrevented)
                        e.preventDefault();

                    delete scope;
                });

                // editor status
                scope.edit = false;
                var searchParams = $location.search();
                scope.embed = searchParams.embed || false;


                // init initiative list
                initList();


                // open and close editor
                scope.openEditor = AuthService.doAction(function () {
                    scope.edit = true;
                });
                scope.closeEditor = function () {
                    scope.edit = false;
                    initList ();
                };


                // show select initiative
                scope.show = function (initiative) {
                    // $log.debug('show initiative',initiative.id);
                    $location.search('initiative',initiative.id);
                    scope.$emit('showInitiative',{initiative:initiative});
                    scope.close();
                };


                // init initiative list
                function initList (){
                    // $log.debug('init initiative list',scope.thingId);
                    InitiativeFactory.getAllInitiatives(scope.thingId).then(
                        function (results) {
                            scope.initiatives = angular.copy(results);
                            requestUpdate(results.length);
                            // $log.debug('list of initiatives',results);
                        },
                        function (error) {
                            $log.error(error);
                        }
                    );
                }

                function requestUpdate(counter) {
                    scope.$emit('counterUpdate',{initiatives:counter});
                }

            }
        }
    }]).directive('initiativeEditor',['$log','$filter','$timeout','AuthService','InitiativeFactory',function ($log,$filter,$timeout,AuthService,InitiativeFactory) {
    return {
        restrict: 'EG',
        scope: {
            thingId: '=id',
            close: '&'
        },
        templateUrl: '/templates/initiative/initiative-editor.html',
        link: function (scope, element, attr) {
            scope.$on('$destroy', function (e) {
                if (!e.defaultPrevented)
                    e.preventDefault();

                delete scope;
            });

            scope.q = {
                name: ''
            };
            scope.choice = null;
            scope.list = [];
            scope.error = false;

            initFullList();




            // check if exists
            scope.check = function (form, q) {
                if(q.name === ''){
                    return resetForm(form);
                }
                var res = $filter('filter')(scope.list,q);
                // $log.debug('check result',res);
                // exactly one choice
                if(res.length === 1 && res[0].name === q.name){
                    scope.setChoice(form,res[0]);
                }
            }

            // select an existing initiative
            scope.setChoice = function (form, initiative) {
                form.$setDirty();
                // set the current choice
                scope.choice = angular.copy(initiative);
                // set current initiative name
                scope.q = {name:initiative.name};
                scope.select = initiative.id;
            }
            // reset current choice
            scope.resetChoice = function (form) {
                resetForm(form);
                scope.close();
            };


            /*
             * link initiative to thing
             * Possible cases:
             * 1. user selects an existing initiative > choice == initiative > link(id)
             * 2. user selects an existing initiative > changes the name > reset of choice > create new initiative > link(id)
             * 3. user digits the name of an existing initiative > search among initiative and retrieve it > link (id)
             * 4. user digits the name of a new initiative > create new initiative > link(id)
             */
            scope.linkTo = function(){
                scope.loading = true;
                $log.debug('linkTo',scope.q,scope.choice);

                // if an existing initiative was chosen
                if(scope.choice && scope.choice.id){
                    link(scope.choice.id);
                }else if(scope.q.name){
                    // if a new initiative was defined
                    // $log.debug('creating intiative',scope.q.name);
                    createInitiative(scope.q).then(
                        function (results) {
                            // then link to the new initiative
                            // $log.debug('create intiative',results);
                            link(results.id);
                        },
                        function (error) {
                            $log.error(error);
                            scope.loading = false;
                            scope.error = true;
                        }
                    )
                }
            };


            // reset form
            function resetForm(form) {
                form.$setPristine();
                // reset input field
                scope.q = {
                    name: ''
                };
                // delete current choice
                scope.choice = null;
                // deselect the choice from radio buttons
                scope.select = false;
                // reset errors
                scope.error = true;
            }

            // link an initiative
            function link(id) {
                // $log.debug('link to ',id);
                InitiativeFactory.link(scope.thingId,id).then(
                    function (result) {
                        // $log.debug('link result',result);
                        scope.loading = false;
                        // $log.debug('link ',id,' to ',scope.thingId);
                        scope.close();
                    },
                    function (error) {
                        scope.loading = false;
                        $log.error(error);
                        scope.error = true;
                    }
                );
            }
            // create an initiative
            function createInitiative(q) {
                return InitiativeFactory.create(q);
            }


            // autocomplete of initiatives
            function initFullList() {
                InitiativeFactory.list().then(
                    function (results) {
                        scope.list = angular.copy(results);
                    },
                    function (error) {
                        $log.error(error);
                        scope.error = false;
                    }
                );
            }
        }
    }
}]);
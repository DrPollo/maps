/**
 * Angular directive to display an interactive visualization chart to visualize events in time,
 * relaying on Almende's Timeline (http://almende.github.io/chap-links-library/timeline.html)
 * @author Gabriele Destefanis
 * @version 0.1.0
 */

'use strict';


angular.module('destegabry.timeline', [])
    .directive('timeline', function() {

    var ItemRangePopup = function(data, options) {
        links.Timeline.ItemRange.call(this, data, options);
    };

    ItemRangePopup.prototype = new links.Timeline.ItemRange();

    ItemRangePopup.prototype.updateDOM = function() {
        var divBox = this.dom;
        if (divBox) {

            divBox.className = "timeline-event timeline-event-range timeline-event-range-popup ui-widget ui-state-default";
            divBox.style.height = "22px";

            if (this.content) {
                $(divBox).tooltip({
                    'placement': 'top',
                    'html': true,
                    'title': this.content,
                    'container': 'body'
                });
            }

            if (this.isCluster) {
                links.Timeline.addClassName(divBox, 'timeline-event-cluster ui-widget-header');
            }

            if (this.className) {
                links.Timeline.addClassName(divBox, this.className);
            }
        }
    };




    return {
        restrict: 'A',
        scope: {
            model: '=timeline',
            options: '=timelineOptions',
            selection: '=timelineSelection',
            fullRange: '=timelinefullRangeUpdate',
            timeline: '=timelineCtrl',
            groups: '=timelineGroups'
        },
        link: function($scope, $element) {
            var timeline = new links.Timeline($element[0]);
            timeline.addItemType('range-popup', ItemRangePopup);


            $scope.timeline = timeline;

            $scope.timeline.redraw = function(){
                timeline.draw($scope.model, $scope.options);
            }

            
            //rangechanged 
            
            links.events.addListener(timeline, 'rangechanged', function() {
                    
                $scope.$apply(function () {
                    $scope.timeline;
                    console.log("debug timeline, rangechanged",$scope.timeline);
                });
                
            });
            
            links.events.addListener(timeline, 'select', function() {
                $scope.selection = undefined;
                var sel = timeline.getSelection();

                if (sel[0]) {

                    $scope.$apply(function () {
                        $scope.$emit("timeline.select",{event:$scope.model[sel[0].row]});
                        $scope.selection = $scope.model[sel[0].row];
                    });
                }
            });

            $scope.$watch('model', function(newVal, oldVal) {
                timeline.setData(newVal);
                refreshGroups();
                if ($scope.fullRange) {
                    timeline.setVisibleChartRangeAuto();
                }
            },true);

            $scope.$watch('options', function(newVal, oldVal) {
                timeline.draw($scope.model, $scope.options);
            },true);

            $scope.$watch('selection', function(newVal, oldVal) {
                if (!angular.equals(newVal, oldVal)) {
                    for (var i = $scope.model.length - 1; i >= 0; i--) {
                        if (angular.equals($scope.model[i], newVal)) {
                            timeline.setSelection([{
                                row: i
                            }]);
                            break;
                        }
                    };
                }
            });

            $scope.$watch('groups.current', function(newVal, oldVal) {
                refreshGroups();
            },true);

            var groupLabels = document.getElementsByClassName("timeline-groups-text");

            function initListner(o){
                var index = getGroupIndex(o.innerHTML);
                if(index > -1){
                     console.log("debug listner",index);
                    o.addEventListener('click', emitGroupSignal, false);
                }
            }

            function getGroupIndex (name){
                return $scope.groups.list.map(function(e){return e.name}).indexOf(name);
            }

            function emitGroupSignal(e){
                
                console.log("debug emit",this.innerHTML);
                var index = this.getAttribute("group-index");
                $scope.groups.current = index;
                $scope.$emit("timeline.groups.click",{group:this.innerHTML});
                    
            }
            
            function refreshGroups(){
                for (var i = 0; i < groupLabels.length; i++) {
                    var o = groupLabels[i];
                    // imposto attributo di gruppo
                    var index = getGroupIndex(o.innerHTML);
                    var group = $scope.groups[index];
                    o.setAttribute("group-index",index);
                    
                    //imposto il current
                    if(index == $scope.groups.current)
                        o.id = "selectedGroup";
                    else 
                        o.id = "";
                    
                    // init del listner se necessario
                    initListner(o);
                }
                // se il livello corrente non e' nella lista cambio al piu' basso
                    //if(!$scope.groups.current)
            }
        }
    };
});

angular.module('firstlife.directives', []).directive('categoryFilters',['$log','$filter','myConfig', function ($log,$filter,myConfig) {
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
}]);
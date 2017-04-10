
angular.module('firstlife.filters', [])

    .filter('rawHtml', ['$sce', function($sce){
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }])

    .filter('truncate', function (){
    return function (text, length, end){
        if (text !== undefined){
            if (isNaN(length)){
                length = 10;
            }

            if (end === undefined){
                end = "...";
            }

            if (text.length <= length || text.length - end.length <= length){
                return text;
            }else{
                return String(text).substring(0, length - end.length) + end;
            }
        }
    };
})

    .filter('split', function() {
    return function(input, splitChar, splitIndex) {
        return input.split(splitChar)[splitIndex];
    }
})


    .filter('isEmpty', function() {
    return function(obj) {
        if(obj && ( 
            (Array.isArray(obj) && obj.length > 0) || 
            (angular.isObject(obj) && !angular.equals({}, obj) ) || 
            (angular.isString(obj) && obj != '') ||
            (angular.isNumber(obj))
        ) ) {

            return false;
        }
        return true;
    }
}) .filter('fullsearch',function () {
    return function (objects, searchText) {
        var q = searchText.toLowerCase();
        var filtered = {};
        console.log('searching',q,'in',objects)
        angular.forEach(objects, function(item) {
            console.log(q);
            var index = JSON.stringify(item).toLowerCase().search(q);
            if( index > -1 ) {
                filtered[item.id] = item;
            }
        });
        return filtered;
    }
});

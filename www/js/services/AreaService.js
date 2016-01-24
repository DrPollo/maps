angular.module('firstlife.services')

.service('AreaService', ['myConfig', function(myConfig) {

var config = myConfig;    
    
var area = config.navigator.default_area;
area.places = config.navigator.places;
    //console.log("areaService: ", area);
return {
    getArea: function(){
        return area;
    },
    getPlace: function(num){
        return area.places[num];
    }
};

}]);
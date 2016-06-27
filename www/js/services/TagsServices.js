angular.module('firstlife.services')

.service('TagsService', [ '$q', '$resource', '$http', 'myConfig', function($q, $resource, $http, myConfig) {
    
    var url = myConfig.backend_tags;
    var format = myConfig.format;

    var tags = [
        { "text": "Tag1" }
    ];

    function convertServerTags(serverTags){
        console.log(typeof(serverTags));

        for(el in serverTags[0])
            console.log(serverTags[el]);

    };

    return{
        getAll: function(){
            var deferred = $q.defer();
            var jsonObj = null;
            var url2 = url.concat(format);

            $http.get(url2)
            .success(function(response) {
                console.log("Tags from server success...");
                //jsonObj = JSON.parse(response);
                jsonObj = response.data;
                console.log(jsonObj.data);
                //convertServerTags(response);
                deferred.resolve(jsonObj.data);
            })
            .error(function(response) {
                console.log("Tags from server error...");
                deferred.reject(response);
            });

            return deferred.promise;
        },
        query: function(query){
            var deferred = $q.defer();
            var urlId = url.concat(format).concat("?q=").concat(query);
            var jsonObj =null;

            $http.get(urlId, {cache: true})
            .then(function(response) {
                //console.log("Tag Query from server success...", response.data);
                //jsonObj = JSON.parse(response);
                console.log("TagService, query, response ",response.data);
                deferred.resolve(response.data);
            },function(response) {
                console.log("Tag Query from server error...", response);
                deferred.reject(response);
            });

            return deferred.promise;

        }

    }
}]);
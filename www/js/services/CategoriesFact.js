angular.module('firstlife.factories')

    .factory('categoriesFactory', ['$http', '$q', 'myConfig', '$rootScope', 'MemoryFactory', function($http, $q, myConfig, $rootScope, MemoryFactory) {
        self.config = myConfig;
        var url = config.backend_categories;
        var format = '.json';
        var categories = set(myConfig.types.categories);
        var cssClusterIcon = [];


        // Public API here
        return {
            getAll: function() {
                var deferred = $q.defer();
                console.log("CategoriesFactory, getAll :",myConfig.types.categories);
                deferred.resolve(set(myConfig.types.categories));
                //Now return the promise.
                return deferred.promise;
            },
            gets: function() {
                return set(myConfig.types.categories);
            },
            /*getAll: function() {
                var deferred = $q.defer();
                var urlId = url.concat(format);
                //console.log("CategoriesFactory getAll");
                //cache
                if (categories.length > 0) {
                    deferred.resolve(categories);
                    console.log("CategoriesFactory cached service! ",categories);
                }
                // memoria del broweser
                else if(MemoryFactory.getConfig()){
                    var cats = MemoryFactory.getConfig();
                    console.log("CategoriesFactory from browser: ", cats);
                    var cats  = set(cats);
                    deferred.resolve(cats);
                    // comunque aggiorno le configurazioni
                    getFromServer();
                }
                //server call
                else {
                    getFromServer().then(
                        function(response) {
                        deferred.resolve(response);
                    },
                        function(err){
                        console.log("CategoriesFactory from server: error.", err);
                        deferred.reject(err);
                    });
                }

                //Now return the promise.
                return deferred.promise;
            },*/
            
            set: function(cats) {
                //console.log("CategoriesFactory from memory: ", cats);
                set(cats);
            },
            get: function(id) {
                var deferred = $q.defer();
                // da cancellare chiamata per singola categoria, a che serve?
                // var urlId = url.concat('/').concat(id).concat(format);
                if(categories[id]){
                    //console.log("catFactory: get cached service!");
                    deferred.resolve(categories[id]);
                }
                else{
                    getFromServer()
                        .then(function(response) {
                        deferred.resolve(response);
                    },function(response) {
                        console.log("catFactory: get server service error! ", response.message);
                        deferred.reject(response);
                    });
                }
            }
        };

        function set(cats){
            // imposto i colori nelle cateogorie
            var catsR = setupColor(cats);
            //MemoryFactory.saveConfig(catsR);
            //categories = catsR;
            return catsR;
        };

        function getFromServer(){
            var urlId = url.concat(format);
            
            var deferred = $q.defer();
            
            $http.get(urlId).then(
                function(response) {
                var cats  = set(response.data.data);
                //console.log("CategoriesFactory from server, after set(): ", cats);
                deferred.resolve(cats);
            },function(response) {
                console.log("CategoriesFactory from server: error:",response);
                deferred.reject(response);
            });

            return deferred.promise;
        }

        // imposto i colori nelle categorie
        function setupColor(catsList){
            for(i = 0; i < catsList.length; i++){
                for(j = 0; j < catsList[i].categories.length; j++){
                    var cats = catsList[i].categories,
                        colorIndex = cats[j].category_index - 1,
                        index = cats[j].category_index,
                        icon = cats[j].icon_name,
                        color = config.design.colors[colorIndex % config.design.colors.length]; 
                    catsList[i].categories[j].colorIndex = colorIndex;
                    catsList[i].categories[j].index = index;
                    catsList[i].categories[j].color = color;
                    catsList[i].categories[j].icon = icon;
                    //console.log("CategoryFactory, setupColor: ", catsList[i].categories[j]);
                }
            }
            //console.log("CategoryFactory, setupColor: ", catsList);
            return catsList;
        }
        

    }])
    .run(function(categoriesFactory){
    //init get categories from server
    categoriesFactory.getAll().then(
        function(cats){
            // todo  da cambiare incorporare categorie alle configurazioni dell'app per il dominio
            console.log("init categorie: ", cats);
        },
        function(err){
            console.log("categoriesFactory.run, categoriesFactory.getAll, errore: ", err);
        }
    );
});
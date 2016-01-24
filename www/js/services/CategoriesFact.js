angular.module('firstlife.factories')

    .factory('categoriesFactory', ['$http', '$q', 'myConfig', '$rootScope', 'MemoryFactory', function($http, $q, myConfig, $rootScope, MemoryFactory) {
        self.config = myConfig;
        var url = config.backend_categories;
        var format = '.json';
        var categories = [];
        var cssClusterIcon = [];


        // Public API here
        return {
            getAll: function() {
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
            },
            
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
            MemoryFactory.saveConfig(catsR);
            categories = catsR;
            $rootScope.categories = catsR;
            $rootScope.mainCategories = catsR[0];
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
        
        /* da cancellare, overlay unico
        function setCategoryOverlays(cats){
            //console.log("categorie dal server: ",cats);
            categories[0] = {
                id: 0,
                name: 'AllCategories',
                type: "markercluster",
                visible: true,
                colorIndex: 0

            }

            for(var el in cats){
                var classColor = config.design.colors[cats[el].category_index - 1 % config.design.colors.length]; 
                //console.log("CategoryFactory, setCategoryOverlays, categoria da convertire: ", el);
                categories[parseInt(cats[el].category_index)] = {
                    id: cats[el].id,
                    name: cats[el].name,
                    type: "marker",
                    visible: true, 
                    description: cats[el].description,
                    icon: cats[el].icon_name,
                    index:parseInt(cats[el].category_index),
                    colorIndex: cats[el].category_index - 1,
                    color: classColor,
//                    layerOptions: {
//                        //chunkedLoading: true,
//                        spiderfyDistanceMultiplier: 2,
//                        iconCreateFunction :
//
//                        // funzione di creazione delle icone dei cluster
//                        function (cluster) {
//                            //console.log(cluster.getAllChildMarkers());
//                            var array = cluster.getAllChildMarkers();
//                            //console.log("ARR CAT: ", array[0].options.categories[0])
//
//                            var childCount = cluster.getChildCount();
//                            var color = array[0].options.categoryColor;
//
//                            return new L.DivIcon(
//                                { 
//                                    html: '<div class="outer" style="background-color: '+ 
//                                    color 
//                                    +'" ><div class="inner"><span>' + childCount + '</span></div></div>', 
//                                    className: 'marker-cluster', 
//                                    iconSize: new L.Point(40, 40) 
//                                });
//
//                        }
//                    }

                }
                //console.log('marker-cluster-' + (cats[el].id).toString());
                
            }
            
            //console.log("setCategoryOverlays: ", categories);
        }*/

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
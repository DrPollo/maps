angular.module('firstlife.services')
    .service('EntityService',['myConfig', 'MemoryFactory', '$filter', function(myConfig, MemoryFactory, $filter) {

        /*
         * Service che implementa parte della logica delle proprieta' delle entita'
         */

        self = this;
        self.config = myConfig;
        self.categories = self.config.types.categories;
        var dev = false;


        return {
            // restituisce un oggetto entita' con gli attributi di default
            getDefaults: function(entity_type){
                return initEntityModel(entity_type);
            },

            // regole speciali per il trattamento dei campi e delle entita'
            processData: function(data){
                return processData(data);
            }
        }




        function initEntityModel(entity_type){
            // recupero l'utente
            var user = MemoryFactory.readUser();

            if(self.config.dev)console.log("EntityFactory, getDefaults ",entity_type,user);

            var now = new Date();
            var day = $filter('date')(now,'dd/MM/yyyy, HH:mm');
            var type = getType(entity_type);
            var typeKey = type.key;
            if(self.config.dev)console.log("EntityFactory, getDefaults, type ",type);
            // costruisco descrizione di default
            var defaultDescription = $filter('translate')(type.name).concat(", ").concat($filter("translate")("CREATED_BY")).concat(" ").concat(user.displayName).concat(" - ").concat(day);
            
            // lorem ipsum di dev per i campi testuali principali
            var devContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse faucibus pretium libero id consequat. Proin bibendum vehicula ultrices.";
            var defaultName = $filter('translate')(type.name).concat(" ").concat($filter("translate")("OF")).concat(" ").concat(day);


            // permessi
            var checkList = type.perms;
            var defaults = {};
            for(key in checkList){
                var property = checkList[key];
                defaults[key] = property.default;
            }
            
            // regole di default per tutti
            defaults.coordinates = [self.config.map.map_default_lng,self.config.map.map_default_lat];
            defaults.user = user ? parseInt(user.id) : -1;
            defaults.entity_type = typeKey;

            // regole specifiche per tipi
            switch(entity_type){
                case 'FL_EVENTS' :
                    defaults.valid_from = now.setHours(0,0,0,0).toISOString();
                    defaults.valid_to = now.setHours(23,59,59,999).toISOString();
                    if(self.config.dev) defaults.description = devContent;
                    break;
                case 'FL_ARTICLES' :
                    defaults.valid_from = now.toISOString();
                    defaults.description = defaultDescription;
                    if(self.config.dev) defaults.text = devContent;
                    break;
                case 'FL_IMAGES' :
                    defaults.valid_from = now.toISOString();
                    defaults.valid_to = now.toISOString();
                    break;
                case 'FL_COMMENTS' :
                    defaults.valid_from = now.toISOString();
                    defaults.valid_to = now.toISOString();
                    defaults.description = defaultDescription;
                    if(self.config.dev) defaults.text_message = devContent;
                    defaults.name = defaultName;
                    break;
                default:
                    defaults.type = 1;
                    if(self.config.dev) defaults.description = devContent;
            }

            // setup categories
            var entityCategories = [];
            if(dev) console.log("EntityService, getDefaults, init categories, cat: ",self.categories);
            for( var j = 0; j < self.categories.length; j++){
                var cat = self.categories[j];
                if(dev) console.log("EntityService, getDefaults, init category, cat: ",cat,typeKey);

                if( cat.entities.indexOf(typeKey) > -1 && (cat.is_editable || !cat.is_visible && cat.is_mandatory)){
                    var c = {categories:[],category_space:cat.category_space};
                    if(dev) console.log("EntityService, getDefaults, init category, c ",c);
                    if(!cat.is_visible && cat.is_mandatory){
                        if(dev) console.log("Categoria invisibile e obbligatoria ",cat);
                        // bug da sistemare
                        c.categories.push(cat.categories[0].id)
                    }
                    entityCategories.push(c); 
                }
            }
            defaults.categories = entityCategories;

            
            //dev rules
            if(self.config.dev) defaults.name = defaultName;
            
            if(dev)console.log("EntityService, getDefaults ",defaults,defaultDescription);
            return defaults;
        }




        // preparo i dati del form per le chiamate al server
        function processData(data) {
            var typeInfo = getType(data.entity_type);
            // dati da inviare
            var dataForServer = {};


            if(dev) console.log("processData init: ", data, typeInfo);


            var typeProperties = typeInfo.perms;
            // check campi del tipo
            for(var key in typeProperties){
                if(data[key]){
                    dataForServer[key] = data[key];
                }
            }
            if(dev) console.log("processData, type properties : ", data, dataForServer);



            // semantica di tipo 
            //todo da spostare su server
            switch(data.entity_type){
                case 'FL_EVENTS':
                    // controlla duration da doortime, le combina con valid_from e valid_to
                    dataForServer = checkEventTime(data,dataForServer);
                    break;
                case 'FL_COMMENTS':
                    // bug collisione con message del popup
                    dataForServer.message = dataForServer.message_text;
                    break;
                case 'FL_IMAGES':
                    break;
                case 'FL_ARTICLES':
                    break;
                default: // FL_PLACES
                    // gestione type
                    if(data.type){
                        if(dev) console.log("trovato il type: ", data.type);
                        dataForServer.type = parseInt(data.type);
                    } else {
                        dataForServer.type = 1;
                    }

            }
            if(dev)console.log("EntityService, processData, semantica del tipo: ", data, dataForServer);


            // entity_type, serve per la create
            dataForServer.entity_type = data.entity_type;

            // categorie
            // inserisco le categorie e scarto quelle vuote
            dataForServer = fillCats(data,dataForServer);

            // geometrie
            // gestisco la geometria
            if(data.coordinates){ // se e' un punto
                //todo dataForServer.geometry = {type:"Points", coordinates:data.coordinates};
                dataForServer.coordinates = [parseFloat(data.coordinates[0]),parseFloat(data.coordinates[1])];
            }
            // todo geometrie diverse

            // fix ?

            return dataForServer;
        }



        function checkEventTime(data, dataForServer){
            var duration = 0;// _this.wizard.dataForm.door_time - _this.wizard.dataForm.close_time;

            // aggiungo l'orario alle date
            if(dataForServer.valid_from){
                var tmp = data.valid_from.getTime();
                if(dev) console.log("Set data ",dataForServer.valid_from," con orario ",data.door_time);
                dataForServer.valid_from.setTime(tmp + data.door_time * 1000);
                if(dev) console.log("Risultato ",dataForServer.valid_from);
            }
            if(dataForServer.valid_to){
                dataForServer.valid_to.setHours(0,0,0,0);
                var tmp = data.valid_to.getTime();
                if(dev) console.log("Set data ",dataForServer.valid_to," con orario ",data.close_time);
                dataForServer.valid_to.setTime(tmp + data.close_time * 1000);
                if(dev) console.log("Risultato ",dataForServer.valid_to);
            }

            // calcolo da durata come differenza tra le due date
            if(dataForServer.valid_from && dataForServer.valid_to){
                // differenza tra giorni
                duration = (dataForServer.valid_to.getTime() - dataForServer.valid_from.getTime());
                if(dev) console.log("EditorCtrl, calcolo durata:",duration);
                dataForServer.duration = duration;
            }else{
                dataForServer.duration = data.close_time - data.door_time;
            }

            //fix campo durata
            if(dataForServer.duration){
                dataForServer.duration = dataForServer.duration/1000;
                var h = parseInt(dataForServer.duration/3600);
                var m = parseInt(dataForServer.duration % 60);
                if(m < 10)
                    m = '0'+m;
                if(h < 10 )
                    h = '0'+h;
                dataForServer.duration = h+':'+m;
            }
            // fix campo door_time
            if(dataForServer.door_time){
                var h = parseInt((data.door_time/3600)%24);
                var m = parseInt(data.door_time % 60);
                if(m < 10)
                    m = '0'+m;
                if(h < 10 )
                    h = '0'+h;
                dataForServer.door_time = h+':'+m;
            }


            // fix orario delle date, l'orario impostato e' errato e va troncato
            return dataForServer;
        }

        function fillCats(data,dataForServer){
            // elimino categorizzazioni vuote
            var catsTmp = [];
            if(dev) console.log("EntityService, processData, check categorie: ",data.categories);
            for(var i = 0; i < data.categories.length; i++){
                var c = data.categories[i];
                if(c && c.categories.length > 0){
                    catsTmp.push(c);
                }
            }
            dataForServer.categories = catsTmp;
            if(dev) console.log("EntityService, processData, check categorie: ",catsTmp, data.categories,dataForServer);
            return dataForServer;
        }

        function getType(entity_type){
            var index = findIndex(entity_type);

            if(index > -1){return self.config.types.list[index];}
            return null;
        }

        function findIndex(entity_type){
            // recupero per slug
            var typeIndex = self.config.types.list.map(function(e){return e.slug;}).indexOf(entity_type);
            if(typeIndex < 0 ){
                // recupero per key
                typeIndex = self.config.types.list.map(function(e){return e.key;}).indexOf(entity_type);
            }
            return typeIndex;
        }


    }]);
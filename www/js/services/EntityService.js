angular.module('firstlife.services')
    .service('EntityService',['$filter', '$log', 'myConfig', 'MemoryFactory', 'AuthService',function($filter, $log, myConfig, MemoryFactory, AuthService) {

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
            },
            
            // regole di conversione del marker per l'update
            preprocessMarker: function(data){
                return editPreProcessing(data);
            }
            
        }




        function initEntityModel(entity_type){
            // recupero l'utente
            var user = AuthService.getUser();
            
            // $log.debug('initEntityModel', user);


            var now = new Date();
            var day = $filter('date')(now,'dd/MM/yyyy, HH:mm');
            var type = getType(entity_type);
            var typeKey = type.key;
            // $log.debug("EntityService, getDefaults, type ",type);
            // costruisco descrizione di default
            var defaultDescription = $filter('translate')(type.name).concat(", ").concat($filter("translate")("CREATED_BY")).concat(" ").concat(user.username).concat(" - ").concat(day);
            
            // lorem ipsum di dev per i campi testuali principali
            var devContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis varius dolor non mauris cursus consectetur. Cras eget interdum ipsum, non accumsan ligula. In ultricies fermentum velit in finibus. Fusce euismod posuere nisi id tempor. Aliquam erat volutpat. Ut pulvinar a mauris nec maximus. In volutpat justo ac est convallis, vitae pellentesque orci ultricies.";
            var defaultName = $filter('translate')(type.name).concat(" ").concat($filter("translate")("OF")).concat(" ").concat(day);


            // permessi
            var checkList = type.perms;
            var defaults = {};
            for(key in checkList){
                var property = checkList[key];
                defaults[key] = angular.copy(property.default);
            }
            
            // regole di default per tutti
            defaults.coordinates = [self.config.map.map_default_lng,self.config.map.map_default_lat];
            defaults.zoom_level = self.config.map.zoom_create;
            defaults.user = user ? user.id : -1;
            defaults.entity_type = typeKey;
            // $log.debug('check entity_type', typeKey);
            // regole specifiche per tipi
            switch(typeKey){
                case 'FL_PLACES' :
                    defaults.valid_from = null;
                    defaults.valid_to = null;
                    break;
                case 'FL_EVENTS' :
                    defaults.valid_to = now;
                    defaults.valid_from = now;
                    if(self.config.dev) defaults.description = devContent;
                    if(self.config.dev) defaults.thumbnail = devContent;
                    break;
                case 'FL_ARTICLES' :
                    defaults.valid_from = now;
                    if(self.config.dev) defaults.text = devContent.concat(' Mauris id venenatis arcu. Curabitur a blandit orci. Mauris eu erat turpis. Donec eget aliquam nunc. Proin nec risus quis ipsum tempus varius sed eu lorem. Ut lacus elit, semper in lobortis eget, dictum id tellus. Donec dictum auctor diam, eu sollicitudin nibh viverra sed. Etiam ut tellus eu nunc auctor porttitor. Donec metus sapien, commodo eget magna vel, maximus tristique odio. Proin aliquet in leo sit amet elementum. Vivamus dolor lacus, fermentum eu facilisis ac, gravida id augue.');
                    break;
                case 'FL_GROUPS' :
                    defaults.valid_from = now;
                    defaults.valid_to = null;
                    if(self.config.dev) defaults.thumbnail = devContent;
                    break;
                case 'FL_IMAGES' :
                    defaults.valid_from = now;
                    defaults.valid_to = now;
                    break;
                case 'FL_NEWS' :
                    defaults.valid_from = now;
                    //defaults.valid_to = now;
                    if(self.config.dev) defaults.message_text = devContent;
                    if(self.config.dev) defaults.name = defaultName;
                    break;
                case 'comment' :
                    defaults.message = defaultName;
                    if(self.config.dev) defaults.message = devContent;
                    break;
                default:
                    defaults.type = 1;
                    if(self.config.dev) defaults.description = devContent;
            }

            // setup categories
            var entityCategories = [];
            if(dev) $log.debug("EntityService, getDefaults, init categories, cat: ",self.categories);
            for( var j = 0; j < self.categories.length; j++){
                var cat = self.categories[j];
                if(dev) $log.debug("EntityService, getDefaults, init category, cat: ",cat,typeKey);

                if( cat.entities.indexOf(typeKey) > -1 && (cat.is_editable || !cat.is_visible && cat.is_mandatory)){
                    var c = {categories:[],category_space:cat.category_space};
                    if(dev) $log.debug("EntityService, getDefaults, init category, c ",c);
                    if(!cat.is_visible && cat.is_mandatory){
                        if(dev) $log.debug("Categoria invisibile e obbligatoria ",cat);
                        // bug da sistemare
                        c.categories.push(cat.categories[0].id)
                    }
                    entityCategories.push(c); 
                }
            }
            defaults.categories = entityCategories;

            
            //dev rules
            if(self.config.dev) defaults.name = defaultName;
            
            // $log.debug("EntityService, getDefaults ",defaults,defaultDescription);
            return defaults;
        }


        // conversione del marker nel formato per l'editor
        function editPreProcessing(marker){
            var tmp = angular.copy(marker);
//            $log.debug("preparo per l'edit", marker)
            // fix categorie
            var tmpCats  = [];
            for(var i =0; i < tmp.categories.length; i++){
                var c = tmp.categories[i];
                var cats = c.categories.map(function(e){return e.id});
//                $log.debug("cats?", cats);
                tmpCats.push({category_space:c.category_space.id, categories:cats});
            }
            tmp.categories = tmpCats;
            
            //fix tempo
            if(!tmp.valid_from){
                tmp.valid_from = null;
            }else if(tmp.valid_from){
//                $log.debug('converto data ',tmp.valid_from);
                tmp.valid_from = new Date(tmp.valid_from);
            }
                
            if(!tmp.valid_to){
                tmp.valid_to = null;
            }else if(tmp.valid_to){
//                $log.debug('converto data ',tmp.valid_to);
                tmp.valid_to = new Date(tmp.valid_to);
            }

            // fix delle tag
            tmp.tags = tmp.tags.map(function(e){return {tag:e}});

            // $log.debug("EntityService, editPreProcessing, marker ", marker, " conversione ", tmp);
            return tmp;    
        }

        // preparo i dati del form per le chiamate al server
        function processData(data) {
            var typeInfo = getType(data.entity_type);
            // dati da inviare
            var dataForServer = {};


            // $log.debug("processData init: ", data, typeInfo);


            var typeProperties = typeInfo.perms;
            // check campi del tipo
            for(var key in typeProperties){
                $log.debug("check perm ", key, data[key], data[key] ? true : false );
                // se c'e' setto altrimento metto null
                dataForServer[key] = data[key] ? data[key] : null;
                
            }
            // $log.debug("processData, type properties : ", data, dataForServer);



            // semantica di tipo 
            //todo da spostare su server
            switch(data.entity_type){
                case 'FL_EVENTS':
                    // controlla duration da doortime, le combina con valid_from e valid_to
                    dataForServer = checkEventTime(data,dataForServer);
                    break;
                case 'FL_NEWS':
                    // forzo tempo puntuale
                    dataForServer.valid_to = dataForServer.valid_from;
                    // bug collisione con message del popup
                    dataForServer.message = dataForServer.message_text;
                    break;
                case 'FL_IMAGES':
                    break;
                case 'FL_ARTICLES':
                    break;
                case 'FL_GROUPS':
                    break;
                default: // FL_PLACES
                    // gestione type
                    if(data.type){
                        // $log.debug("trovato il type: ", data.type);
                        dataForServer.type = parseInt(data.type);
                    } else {
                        dataForServer.type = 1;
                    }

            }
            
            // conversione formato data
            // bug va in errore il toISOString
            if(dataForServer.valid_to)
                dataForServer.valid_to = dataForServer.valid_to.toISOString();
            else
                dataForServer.valid_to = null;
            if(dataForServer.valid_from)
                dataForServer.valid_from = dataForServer.valid_from.toISOString();
            else
                dataForServer.valid_from = null;
            
            // $log.debug("EntityService, processData, semantica del tipo: ", data, dataForServer);
            

            // entity_type, serve per la create
            dataForServer.entity_type = data.entity_type;
            // aggiungo il dominio
            dataForServer.domain_id = self.config.domain_id;

            // categorie
            // inserisco le categorie e scarto quelle vuote
            dataForServer = fillCats(data,dataForServer);

            // fix tag
            // [{tag:'tag1',....}] > [tag1,tags]
            dataForServer.tags = data.tags.map(function(e){return e.tag});


            // geometrie
            // gestisco la geometria
            if(data.coordinates){ // se e' un punto
                //todo dataForServer.geometry = {type:"Points", coordinates:data.coordinates};
                dataForServer.coordinates = [parseFloat(data.coordinates[0]),parseFloat(data.coordinates[1])];
            }
            // todo geometrie diverse

            // $log.debug('check data for server',dataForServer);
            return dataForServer;
        }



        function checkEventTime(data, dataForServer){
            var duration = 0;// _this.wizard.dataForm.door_time - _this.wizard.dataForm.close_time;
            // $log.debug("Set data valid_from , valid_to, door_time, close_time, duration ",data.valid_from,data.valid_to,data.door_time,data.close_time,data.duration);
            // aggiungo l'orario alle date
            
            
            // se per qualche ragione le date sono invertite faccio il fix
            if(data.valid_from && data.valid_to && data.valid_from.getTime() > data.valid_to.getTime()){
                data.valid_to = angular.copy(data.valid_from);
            }

            // se le date non sono state impostate
            if(!data.valid_to){
                dataForServer.valid_to = moment(Date.now());
                dataForServer.valid_to.set({'hour':23,'minute':59,'second':59,'millisecond':999});
            }
            if(!data.valid_from){
                dataForServer.valid_from = moment(Date.now());
                dataForServer.valid_from.set({'hour':0,'minute':0,'second':0,'millisecond':0});
            }


            if(data.valid_from){
                dataForServer.valid_from = moment(data.valid_from);
                if(data.door_time){
                    dataForServer.valid_from.set({'hour':0,'minute':0,'second':0,'millisecond':0});
                    dataForServer.valid_from.add(data.door_time,'seconds');
                }
                // $log.debug("Set data valid_from Risultato ",dataForServer.valid_from);
            }


            if(data.valid_to){
                dataForServer.valid_to = moment(data.valid_to);
                if(data.close_time){
                    dataForServer.valid_to.set({'hour':0,'minute':0,'second':0,'millisecond':0});
                    dataForServer.valid_to.add(data.close_time,'seconds');
                }else{
                    dataForServer.valid_to.set({'hour':23,'minute':59,'second':59,'millisecond':999});
                }
                // $log.debug("Set data valid_to Risultato ",dataForServer.valid_to);
            }



            // calcolo da durata come differenza tra le due date
            if(data.valid_to && data.valid_from){
                // differenza tra giorni
                duration = (data.valid_to.getTime() - data.valid_from.getTime());
                // $log.debug("EditorCtrl, calcolo durata da valid_to - valid_from:",duration);
                dataForServer.duration = duration;
            }
            // fix campo door_time
            if(dataForServer.door_time){
                //var h = parseInt((data.door_time/3600)%24);
                var m = parseInt(data.door_time % 60);
                dataForServer.door_time = m;
            }

            // $log.debug("Set data valid_from , valid_to, door_time, close_time, duration ",dataForServer.valid_from,dataForServer.valid_to,dataForServer.door_time,dataForServer.close_time,dataForServer.duration);
            // fix orario delle date, l'orario impostato e' errato e va troncato
            return dataForServer;
        }

        function fillCats(data,dataForServer){
            // elimino categorizzazioni vuote
            var catsTmp = [];
            for(var i = 0; i < data.categories.length; i++){
                var c = data.categories[i];
                var tmp_c = {"category_space":{id:c.category_space}, "categories":[]};
                    
                for(var j = 0; j < c.categories.length > 0; j++){
                    tmp_c.categories.push({"id":c.categories[j]});
                } 
                catsTmp.push(tmp_c);
            }
            dataForServer.categories = catsTmp;
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
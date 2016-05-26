angular.module('firstlife.timeline',[])
    .directive('timeline', function() {

    return {
        restrict: 'EG',
        scope: {
            data:'='
        },
        templateUrl:'/templates/map-ui-template/timeline.html',
        controller: ['$scope','$rootScope','$log','myConfig','MapService',function($scope,$rootScope,$log,myConfig,MapService){
            
            $scope.$on('destroy',function(){
                $scope.stopClock();
                delete $scope;
            });
            
            // listner cambio dei dati
            $scope.$watch('data',function(e,old){
                if(!angular.equals(e,old)){
                    //$log.error('cambio dati della mappa ',$scope.data);
                    // ricalcolo i dati sulla timeline
                    scanData(e);
                }
            });
            
            var types = {"FL_PLACES":3,"FL_EVENTS":5,"FL_ARTICLES":7,"FL_COMMENTS":9,"FL_GROUPS":11,};

            //setup lingua di moment js
            moment.locale('it');
            moment().isoWeek(1);

            var localeData = moment.localeData();
            $log.debug('check localeData ',localeData, localeData._monthsShort);

            // unita' temporale di default
            // 0: fasi della giornata
            // 1: giorno della settimana
            // 2: settimana del mese
            // 3: giorno del mese
            // 4: mese dell'anno
            $scope.defaultUnit = 1;
            $scope.indexDefaultUnit = $scope.defaultUnit; //mi segno l'indice
            var units = ["hour", "day", "date","year"]; //unità di misura delle timeline
            var defaultUnit = units[$scope.indexDefaultUnit]; //unità di misura usata in partenza

            // momento attuale
            $scope.moment = moment();
            // inizializzo il buffer
            initBuffer();

            // ruoto indietro la timeline
            $scope.forward = function(){
                // recupero la unit da aggiungere
                var unit = getUnitToShift();
                $log.debug('add a ',unit);
                // aggiungo una unit
                $scope.moment = $scope.moment.add(1,unit);
                // ricalcolo il buffer
                initBuffer();
            }

            // ruoto in avanti la timeline
            $scope.rewind = function(){
                // recupero la unit da sottrarre
                var unit = getUnitToShift();
                $log.debug('subtract a ',unit);
                // sottraggo una unit
                $scope.moment = $scope.moment.subtract(1,unit);
                // ricalcolo il buffer
                initBuffer();
            }

            // salgo di scala di unita'
            $scope.scaleUp = function(){
                // se non ho raggiunto la massima
                // salgo di una unita'
                if($scope.indexDefaultUnit < units.length-1)
                    $scope.indexDefaultUnit++;

                // ricalcolo il buffer
                initBuffer();
            }


            // scendo di scala di unita' 
            $scope.scaleDown = function(slot){
                // se non ho raggiunto la minima
                // scalo di una scala
                if($scope.indexDefaultUnit > 0){
                    //$log.debug('scale down start ',slot.interval.start().format('DD/MM/YYYY'),' end ',slot.interval.end().format('DD/MM/YYYY'));
                    $scope.moment = angular.copy(slot.interval.start());
                    //$log.debug('scale down moment',$scope.moment);
                    $scope.indexDefaultUnit--;
                    // ricalcolo il buffer
                    initBuffer();
                }
            }


            // reset della timeline a now e con la unit time di default
            $scope.resetNow = function(){
                // reimposto la default unit
                $scope.indexDefaultUnit = $scope.defaultUnit;
                // ricalcolo il momento attuale
                $scope.moment = moment();
                // ricalcolo il buffer
                initBuffer();
            }


            // inizializzo la timeline
            function initBuffer(){
                var now = angular.copy($scope.moment);
                // recupero l'unita' corrente (es. mese, giorno, settimana)
                var unit = getNowWithFilter(now);
                // recupero la lungheza dell'unita' corrente
                var slots = getNowUnits(now);
                // recupero dell'indice di ora nell'unita' corrente
                $scope.now = getNowInUnits(moment());
                // recupero il contesto dell'momento attuale dato l'indice
                $scope.context = getNowContext(now);
                //$log.debug('check context ',$scope.context);
                // stampo nei log ora, l'indice e l'array dell'unita' corrente
                $log.info('check now; ',now,'; check indice: ',$scope.now,'; check slots: ',slots);
                // init del buffer con la lunghezza corretta
                $scope.timewindow = [];
                // inserisco le date nel buffer
                for(var i = 0; i < slots.length; i++){
                    $scope.timewindow.push(slots[i]);
                }
                // controllo il geojson
                //scanGeojson();
                // avviso del cambio di timeline
                applyTimeFilters();
            }



            //applicare questi filtri per il dato che si vuole effettivamente vedere
            function getNowWithFilter(time){
                var filter;
                if(defaultUnit == "day") filter = time.date();  //per mostrare il giorno del mese
                else if (defaultUnit == "month") filter = time.get($scope.indexDefaultUnit) +1; //i mesi sono da 0 a 11, io voglio da 1 a 12
                else filter = time.get($scope.indexDefaultUnit);

                return filter;
            }


            // recupera l'array dei possibili valori dell'unita' temporale
            function getNowUnits(now){
                let initStart = {hour:0,minute:0,second:0,millisecond:0};
                let initEnd = {hour:23,minute:59,second:59,millisecond:999};
                // considero l'unita' correte (es. settimana, mese, anno)
                switch(units[$scope.indexDefaultUnit]){
                        // fasi della giornata
                    case 'hour':
                        // 0: notte, 1: mattina, 2: pomeriggio, 3: sera
                        // intervalli di 6 ore
                        let phases = ['Notte','Mattina','Pomeriggio','Sera'];
                        let duration = parseInt(24/phases.length);
                        let n = angular.copy(now);
                        n.set(initStart);
                        let array = [];
                        for (var i = 0; i < phases.length; i++){
                            let start = angular.copy(n)
                            start.add(i*duration,'hour');
                            let end = angular.copy(n)
                            end.add((i+1)*duration,'hour').subtract(1,'millisecond');
                            let interval = moment.interval(start,end);
                            array.push({label:phases[i],interval:interval});
                            //$log.debug('check interval phases ',interval.start(),interval.end());
                        }
                        $log.debug('check interval phases ',array);
                        return array;
                        break;
                        // giorni della settimana
                    case 'day':
                        // 0: lunedi, 1: martedi, 2: mercoledi
                        // 3: giovedi, 4: venerdi, 5: sabato,6: domenica,
                        var labels = moment.weekdays();
                        var days = [];
                        for(var i = 0; i < 7; i++){
                            // genero l'intervallo giornaliero
                            let start = angular.copy(now).weekday(i).set(initStart);
                            let end = angular.copy(now).weekday(i).set(initEnd);
                            let interval = moment.interval(start,end);
                            let obj = {label:labels[(i+1)%7],interval:interval};
                            days.push(obj);
                            $log.debug('check interval weekdays ',interval.start(),interval.end());
                        }
                        $log.debug('check interval weekdays ',days);
                        return days;
                        break;
                        // settimane del mese
                    case 'date':
                        var weeks = [];
                        // calcolo quante settimane ci sono nel mese corrente
                        // creo un array con i giorni del mese
                        let current = angular.copy(now);
                        let daysInMonth = current.daysInMonth()+current.day();
                        let week = 1;
                        //$log.debug('numero di giorni del mese pesati con current day ',daysInMonth,current.day(),7-current.day());
                        for(let j = 1; j <= daysInMonth+6; j += 7){
                            // prendo un giorno ogni sette, in modo da caricare nelle settimane
                            current.date(j);
                            $log.debug(j,' current ',current.format('DD/MM/YYYY'));
                            // calcolo l'intervallo della settimana (puo' uscire dal mese)
                            let start = angular.copy(current).weekday(0);
                            let end = angular.copy(current).weekday(6);
                            let interval = angular.copy(moment.interval(start,end));
                            // creo l'etichetta per la settimana
                            let label = "";
                            // controllo se lunedi e' nel mese corrente
                            //$log.debug(j,' start ',start.format('DD/MM/YYYY'),' check ',now.month() <= start.month());
                            if(now.month() == start.month()){
                                label = label.concat(week++).concat("a ").concat('Settimana');
                            }else if(start.month() < now.month() || start.year() < now.year()){
                                // caso: ultima settimana del mese precedente
                                // ultimo lunedi del mese precedente - 1 /7 ti da il numero di settimane 
                                let prevMonth = angular.copy(now).endOf('month').subtract(1,'month').day('Monday').date()-1;
                                label = label.concat(parseInt((prevMonth)/7)+1).concat("a ").concat('Settimana');
                            }else{break;}
                            weeks.push({label:label,interval:interval}); 
                            $log.debug('check interval date ',interval.start().format('DD/MM/YYYY'),interval.end().format('DD/MM/YYYY'));
                        }
                        $log.debug('check interval date ',weeks);
                        return weeks;
                        break;
                        // giorni del mese
                    case 'month':
                        var days = [];
                        // creo un array con i giorni del mese
                        for(var j = 1; j <= now.daysInMonth(); j++){
                            let start = angular.copy(now).date(j).set(initStart);
                            let end = angular.copy(now).date(j).set(initEnd);
                            let interval = moment.interval(start,end);
                            days.push({label:j,interval:interval}); 
                            //$log.debug('check interval month ',interval.start(),interval.end());
                        }
                        $log.debug('check interval month ',days);
                        return days;
                        break;
                        // mesi dell'anno
                    case 'year':
                        // 0: gennaio, 1: febbraio, 2: marzo, 3: aprile, 4: maggio
                        // 5: giugno, 6: luglio, 7: agosto, 8: settembre, 9: ottobre
                        // 10: novembre, 11: dicembre
                        let months = [];
                        let month = angular.copy(now);
                        for(let i = 0 ; i < 12; i ++){
                            month.month(i);
                            let start = angular.copy(month).date(1).set(initStart);
                            let end = angular.copy(month).date(month.daysInMonth()).set(initEnd);
                            let interval = moment.interval(start,end);
                            months.push({label:localeData._monthsShort[i],interval:interval});
                            //$log.debug('check interval year ',interval.start(),interval.end());
                        }
                        $log.debug('check interval year ',months);
                        return months;
                        break;
                        // altrimenti array vuoto
                    default:
                        return [];
                }

            }


            // clock che controlla l'indice attuale rispetto al tempo
            var clock;
            $scope.clock = function() {
                // non far partire il clock se e' gia' partito
                if ( angular.isDefined(clock) ) return;
                stop = $interval(function() {
                    getNowInUnits(moment())
                }, 60000); // ogni minuto
            };

            $scope.stopClock = function() {
                if (angular.isDefined(clock)) {
                    $interval.cancel(clock);
                    stop = undefined;
                }
            };

            // recupera indice corrente per l'unita' temporale
            function getNowInUnits(now){
                var r = now;
                // considero l'unita' corrente (es. settimana, mese, anno)
                switch(units[$scope.indexDefaultUnit]){
                    case 'hour':
                        // restituiscce fase del giorno corrente
                        r = parseInt(r.hour()/6);
                        break;
                    case 'day':
                        // restituisce giorno corrente della settimana
                        r = angular.copy(r.isoWeekday())-1;
                        break;
                    case 'date':
                        // restituisce settimana corrente del mese corrente
                        r = parseInt(r.date()/7);
                        // se la prima settimana inizia nel mese prima
                        if(angular.copy(now).date(1).day() != "Monday" )
                            r++;
                        break;
                    case 'month':
                        // restituisce giorno corrente del mese corrente
                        r = r.date()-1;
                        break;
                    case 'year':
                        // restituisce mese corrente dell'anno corrente
                        r = r.month();
                        break;
                    default:
                        return -1;
                }
                $log.debug('check index ',r,getNowContext(now),getNowContext($scope.moment));
                // se la timeline e' centrata sul momento attuale
                if(getNowContext(now) == getNowContext($scope.moment))
                    return r;
                // altrimenti restituisco indice nullo
                return -1;
            }


            // recupera il contesto di now
            function getNowContext(now){
                var label = "";
                // considero l'unita' corrente (es. settimana, mese, anno)
                switch(units[$scope.indexDefaultUnit]){
                    case 'hour':
                        // appende il giorno corrente della settimana e il numero
                        label = label.concat(now.format('dddd')).concat(" ").concat(now.format('D'));
                        break;
                    case 'day':
                        // appende la settimana del mese il numero del mese
                        //label = label.concat(parseInt(now.date()/7)+1).concat("a settimana di ").concat(localeData._months[now.month()]);
                        // data di lunedi
                        label = label.concat("dal ").concat(now.isoWeekday(1).format('D'));
                        // data di domenica
                        label = label.concat(" al ").concat(now.isoWeekday(7).format('D'));
                        // del mese
                        label = label.concat(" di ").concat(localeData._months[now.month()]);
                        break;
                    case 'date':
                    case 'month':
                        // appende 
                        // appende il mese
                        label = label.concat(localeData._months[now.month()]).concat(" ");
                    default:
                        label = label.concat(now.year());
                }
                return label;
            }

            // calcolo la unit da aggiungere o sottrarre con uno shift di timeline
            function getUnitToShift(){
                // valuto la label della unit corrente
                switch(units[$scope.indexDefaultUnit]){
                    case 'hour':
                        // appende il giorno corrente della settimana e il numero
                        return 'day';
                        break;
                    case 'day':
                        // appende la settimana del mese il numero del mese
                        return 'week';
                        break;
                    case 'date':
                        return 'month';
                        break;
                    case 'month':
                        return 'month';
                        break;
                    default:
                        return 'year';
                }
                return null;
            }
            
            
            // scansione dei dati dalla mappa
            function scanData(features){
                if(!features||!Array.isArray(features)||features.length < 1)
                    return false;
                
                //$log.error('start scanData ',features,features.length,' entities');
                // per ogni feature controllo se cadono nella timeline
                for(let i = 0; i < features.length; i++){
                    let feature = features[i];
                    //$log.error('feature da controllare? ',feature);
                    if(feature.start && feature.end){
                        var start = moment(angular.copy(feature.start));
                        var index = getNowInUnits(start);
                        //$log.error('feature da considerare? ',index > -1,' data ',start.format('DD/MM/YYYY'));
                        if(index > -1){
                            // se non inizializzato creo una proprieta' con array
                            if(!$scope.timewindow[index].markers){
                                $scope.timewindow[index].markers = {};
                            }
                            //$log.debug('add feature prop ',features[i].type);
                            var type = features[i].type;
                            if(!$scope.timewindow[index].markers[type])
                                $scope.timewindow[index].markers[type] = {counter:0,color:features[i].color};
                            // aggiungo il marker alla timeline
                            $scope.timewindow[index].markers[type].counter++;
                            //$log.debug('trovato marker che entra nella timeline ',$scope.timewindow[index].markers[type]);
                        }
                    }
                }
            }
            
            // calcola l'intervallo definito dalla timeline
            function getFullInterval(){
                var time = {};
                time.from = new Date($scope.timewindow[0].interval.start().toISOString());
                time.to = new Date($scope.timewindow[$scope.timewindow.length -1 ].interval.end().toISOString());
                return time;
            }
            
            
            /*
             * gestione eventi per la mappa
             */
            
            // salvo il nuovo intervallo e avviso la mappa
            function applyTimeFilters(){
                var time = getFullInterval();
                MapService.setTimeFilters(time);
                $rootScope.$emit("timeUpdate",{time:time});
                //MapService.resetMarkersDistributed();
                //$log.error('timeUpdate! ',time);
            }
            
            
        }]
    };
});
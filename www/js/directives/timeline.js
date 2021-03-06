angular.module('firstlife.timeline',[])
    .directive('timeline', function() {

    return {
        restrict: 'EG',
        scope: {},
        templateUrl:'/templates/map-ui-template/timeline.html',
        controller: ['$scope','$rootScope','$log', '$filter','$translate', '$location', '$window','myConfig','ThingsService','PlatformService', 'leafletData', function($scope,$rootScope,$log, $filter,$translate,$location, $window,myConfig,ThingsService,PlatformService, leafletData){

            $scope.$on('destroy',function(){
                $scope.stopClock();
                delete $scope;
            });

            $scope.color = myConfig.design.default_colors;

            // todo gestione dati nella timeline
            $scope.data = {};
            //listner cambio dei parametri get
            $scope.$on('timelineDataRefresh', function(event, args) {
                if(event.defaultPrevented)
                    event.preventDefault();

                // todo calcolo dati da visualizzare nella timeline
            });

            $scope.$on('timelineReset', function(event, args) {
                if(event.defaultPrevented)
                    event.preventDefault();

                $scope.reset();
            });

            $scope.$on('changeLanguage',function (event,args) {
               $log.debug('changeLanguage',args);
               if(args.id){
                   localeData = moment.localeData(args.id);
                   initBuffer(true);
               }
            });




            $scope.config = myConfig;

            // mobile o no?
            $scope.isMobile = PlatformService.isMobile();

            // c'e' la navbar
            $scope.navbar = myConfig.design.navbar;

            // e' in embed?
            $scope.flUri = $location.search().embed ? $window.location.href.replace('embed=viewer','') : false;

            //setup lingua di moment js
            moment.locale($translate.use());
            moment().isoWeek(1);

            // gestione del viewer
            $scope.viewer = $location.search().embed === 'viewer';
            $log.debug('timeline viewer?',$scope.viewer);

            var localeData = moment.localeData();
            // $log.debug('check localeData ',localeData, localeData._monthsShort);

            // unita' temporale di default
            // 0: fasi della giornata
            // 1: giorno della settimana
            // 2: settimana del mese
            // 3: giorno del mese
            // 4: mese dell'anno
            $scope.defaultUnit = 3;
            $scope.indexDefaultUnit = $scope.defaultUnit; //mi segno l'indice
            $scope.units = [
                {key:"year",label:"YEAR_BUTTON"},
                {key:"date",label:"DATE_BUTTON"},
                {key:"day",label:"DAY_BUTTON"},
                {key:"hour",label:'HOUR_BUTTON'}]; //unità di misura delle timeline

            var defaultUnit = $scope.units[$scope.indexDefaultUnit].key; //unità di misura usata in partenza

            // momento attuale
            $scope.moment = moment();



            // inizializzo il buffer
            initBuffer(true);



            /*
             * Funzioni pubbliche di controllo della timeline
             */


            // ruoto indietro la timeline
            $scope.forward = function(){
                // $log.debug('forward');
                // recupero la unit da aggiungere
                var unit = getUnitToShift();
                //$log.debug($scope.moment,'add 1 ',unit);
                // aggiungo una unit
                // $log.debug('forward to ',$scope.moment, moment().add(1,unit));
                $scope.moment = $scope.moment.add(1,unit);
                //$log.debug('forward to ',$scope.moment.toISOString());
                // ricalcolo il buffer
                initBuffer();
            }

            // ruoto in avanti la timeline
            $scope.rewind = function(){
                // recupero la unit da sottrarre
                var unit = getUnitToShift();
                // $log.debug('subtract a ',unit);
                // sottraggo una unit
                $scope.moment = $scope.moment.subtract(1,unit);
                // ricalcolo il buffer
                initBuffer();
            }

            // salgo di scala di unita'
            $scope.scaleUp = function(){
                // se non ho raggiunto la massima
                // salgo di una unita'
                //$log.debug('scaleUp', $scope.indexDefaultUnit)
                if($scope.indexDefaultUnit > 0){
                    $scope.indexDefaultUnit--;
                    // ricalcolo il buffer
                    initBuffer();
                }
            }

            // scendo di scala di unita' 
            $scope.scaleDown = function(slot){
                // se non ho raggiunto la minima
                // scalo di una scala
                if($scope.indexDefaultUnit < $scope.units.length-1){
                    //$log.debug('scale down start ',slot.interval.start().format('DD/MM/YYYY'),' end ',slot.interval.end().format('DD/MM/YYYY'));
                    $scope.moment = angular.copy(slot.interval.start());
                    //$log.debug('scale down moment',$scope.moment);
                    $scope.indexDefaultUnit++;
                    // ricalcolo il buffer
                    initBuffer();
                }
            }


            // reset della timeline a now e con la unit time di default
            $scope.reset = function(){
                // reimposto la default unit
                $scope.indexDefaultUnit = $scope.defaultUnit;
                // ricalcolo il momento attuale
                $scope.moment = moment();
                // ricalcolo il buffer
                initBuffer();
            }

            // reset della timeline a now
            $scope.resetNow = function(){
                // ricalcolo il momento attuale
                $scope.moment = moment();
                // ricalcolo il buffer
                initBuffer();
            }


            // sali alla scala
            $scope.scaleUpTo = function(index){
                // imposto l'indice
                if(index < 0 || index >= $scope.units.length || index > $scope.indexDefaultUnit)
                    return false;
                if(index == $scope.indexDefaultUnit)
                    return true;

                if(index < $scope.indexDefaultUnit){
                    $scope.indexDefaultUnit = index;
                    // ricalcolo il buffer
                    initBuffer();
                }
            }



            /*
             * funzioni interne
             */



            // inizializzo la timeline
            function initBuffer(skip){
                // $log.debug('skipping override params',skip);
                if(!skip) {
                    $log.log('setting unit');
                    // setup dei parametri search
                    $location.search('date',$scope.moment.toISOString());
                    // fix unit nei parametri search
                    $location.search('unit', $scope.units[$scope.indexDefaultUnit].key);
                }

                // init del tempo a oggi
                var now = angular.copy($scope.moment);
                //$log.debug('init buffer from',$scope.moment.toISOString());
                // parametri temporali nell'url
                // "date" e' la data centrale e "unit" la granularita'
                var params = $location.search();
                $log.log('timeline search date',angular.extend({},$location.search()),params.date, ' - unit', params.unit);
                // se parametro date impostato sovrascrivo il now
                if(params.date && moment(params.date)){
                    // recupero il moment da parametro
                    $scope.moment = moment(params.date);
                    // sovrascrivo il now
                    now = angular.copy($scope.moment);
                }
                // se definito parametro unit o default valido (tra gli indici delle unita' temporali)
                // $log.debug('check unit',$scope.units.map(function(e){return e.key}).indexOf(params.unit));
                if(params.unit && $scope.units.map(function(e){return e.key}).indexOf(params.unit) > -1){
                    // recupero l'indice
                    $scope.indexDefaultUnit= $scope.units.map(function(e){return e.key}).indexOf(params.unit);
                    // recupero la key dell'unita' corrente
                    defaultUnit = $scope.units[$scope.indexDefaultUnit].key;
                }
                // recupero l'unita' corrente (es. mese, giorno, settimana)
                var unit = getNowWithFilter(now, params.unit || defaultUnit);
                // recupero la lungheza dell'unita' corrente
                var slots = getNowUnits(now);
                // recupero dell'indice di ora nell'unita' corrente
                $scope.now = getNowInUnits(moment());

                // recupero il contesto dell'momento attuale dato l'indice
                setContextButtons(now);
                //$log.debug('check context ',$scope.context);
                // stampo nei log ora, l'indice e l'array dell'unita' corrente
                //                $log.debug('check now; ',now,'; check indice: ',$scope.now,'; check slots: ',slots);
                // init del buffer con la lunghezza corretta
                $scope.timewindow = [];
                // inserisco le date nel buffer
                for(var i = 0; i < slots.length; i++){
                    $scope.timewindow.push(slots[i]);
                }
                // imposto filtro temporale
                var newInterval = getFullInterval();
                // $log.debug('new interval ',newInterval);
                ThingsService.setTimeFilters(newInterval);

                // evento di update per mapCtrl
                $scope.$emit("timeUpdate",{time:newInterval});
                if(skip) {
                    $log.log('setting unit',$scope.units[$scope.indexDefaultUnit].key);
                    // setup dei parametri search
                    $location.search('date',$scope.moment.toISOString());
                    // fix unit nei parametri search
                    $location.search('unit', $scope.units[$scope.indexDefaultUnit].key);
                }
            }



            //applicare questi filtri per il dato che si vuole effettivamente vedere
            function getNowWithFilter(time,unit){
                switch(unit) {
                    case "day":
                        return time.date();  //per mostrare il giorno del mese
                    case "month":
                        return time.get($scope.indexDefaultUnit) + 1; //i mesi sono da 0 a 11, io voglio da 1 a 12
                    default:
                        return time.get($scope.indexDefaultUnit);
                }
            }


            // recupera l'array dei possibili valori dell'unita' temporale
            function getNowUnits(now){
                //$log.debug('getNowUnits',now.toISOString(), 'calc for unit ',$scope.units[$scope.indexDefaultUnit].key);
                var initStart = {hour:0,minute:0,second:0,millisecond:0};
                var initEnd = {hour:23,minute:59,second:59,millisecond:999};
                var phases = ['NIGHT','MORNING','AFTERNOON','EVENING'];
                // considero l'unita' correte (es. settimana, mese, anno)
                switch($scope.units[$scope.indexDefaultUnit].key){
                        // fasi della giornata
                    case 'hour':
                        // 0: notte, 1: mattina, 2: pomeriggio, 3: sera
                        // intervalli di 6 ore
                        var duration = parseInt(24/phases.length);
                        var n = angular.copy(now);
                        n.set(initStart);
                        var array = [];
                        for (var i = 0; i < phases.length; i++){
                            var start = angular.copy(n)
                            start.add(i*duration,'hour');
                            var end = angular.copy(n)
                            end.add((i+1)*duration,'hour').subtract(1,'millisecond');
                            var interval = moment.interval(start,end);
                            var obj = {label:phases[i],interval:interval,upLabel:interval.start().format('HH:mm'),class:'noclick'};
                            if(!$scope.isMobile){
                                obj.class='six';
                            }
                            array.push(obj);
                            //$log.debug('check interval phases ',interval.start(),interval.end());
                        }
                        //$log.debug('check interval phases ',array);
                        return array;
                        break;
                        // giorni della settimana
                    case 'day':
                        // 0: lunedi, 1: martedi, 2: mercoledi
                        // 3: giovedi, 4: venerdi, 5: sabato,6: domenica,
                        var labels = moment.weekdays();
                        var format = $scope.isMobile ? 'ddd' : 'dddd';
                        //var format = $scope.isMobile ? '' : '';//moment.weekdays();
                        var days = [];
                        for(var i = 0; i < 7; i++){
                            // genero l'intervallo giornaliero

                            var start = angular.copy(now).weekday(i).set(initStart);
                            var end = angular.copy(now).weekday(i).set(initEnd);
                            var interval = moment.interval(start,end);
                            var weekday = $scope.isMobile ? localeData.weekdaysShort(start):localeData.weekdays(start);
                            var obj = {label:weekday,//start.format(format),
                                       interval:interval,
                                      upLabel:interval.start().format('DD')};
                            if(!$scope.isMobile){
                                obj.class='four';
                            }
                            //$log.debug('is sunday?',interval.start().format('dddd'),interval.start().format('dddd') === 'Sunday')
                            if(interval.start().format('dddd') === 'Sunday' || interval.start().format('dddd') === 'Domenica')
                                obj.class = obj.class+' red';
                            days.push(obj);
                            // $log.debug('check interval weekdays ',interval.start(),interval.end());
                        }
                        // $log.debug('check interval weekdays ',days);
                        return days;
                        break;
                        // settimane del mese
                    case 'date':
                        var weeks = [];
                        // calcolo quante settimane ci sono nel mese corrente
                        // creo un array con i giorni del mese
                        var current = angular.copy(now);
                        var daysInMonth = current.daysInMonth()+current.day();
                        var week = 1;
                        //                        $log.debug('numero di giorni del mese pesati con current day ',daysInMonth,current.day(),7-current.day());
                        for(var j = 1; j <= daysInMonth+6 ; j += 7){
                            // prendo un giorno ogni sette, in modo da caricare nelle settimane
                            current.date(j);
                            //                            $log.debug(j,' current ',current.format('DD/MM/YYYY'));
                            // calcolo l'intervallo della settimana (puo' uscire dal mese)
                            var startIndex = 0,
                                endIndex = 6;
                            // if($translate.use() === 'en'){
                            //     startIndex = 1;
                            //     endIndex = 7;
                            // }
                            var start = angular.copy(current).weekday(startIndex);
                            var end = angular.copy(current).weekday(endIndex);
                            var interval = angular.copy(moment.interval(start,end));
                            // creo l'etichetta per la settimana
                            var label = "";
                            // costruzione della label
                            if(start.month() < now.month() ){
                                label = label.concat(start.format('DD'),"-",end.format('DD'))
                            }else if( end.month() > now.month()){
                                label = label.concat(start.format('DD'),"-",end.format('DD/MM'))
                            }else{
                                label = label.concat(start.format('DD'),"-",end.format('DD'))
                            }
                            // scorro
                            if(now.month() == start.month()){
                                // label = label.concat(week++).concat("a ").concat('Settimana');
                            }else if(start.month() < now.month() || start.year() < now.year()){
                                // caso: ultima settimana del mese precedente
                                // ultimo lunedi del mese precedente - 1 /7 ti da il numero di settimane 
                                var prevMonth = angular.copy(now).endOf('month').subtract(1,'month').day('Monday').date()-1;
                                //                                label = label.concat(parseInt((prevMonth)/7)+1).concat("a ").concat('Settimana');
                            }else{
                                break;
                            }

                            var monthLabel = $scope.isMobile ? localeData.monthsShort(interval.start()) : localeData.months(interval.start());
                            var obj = {
                                interval:interval,
                                upLabel:interval.start().format('DD').concat(" ",monthLabel)};
                            if(!$scope.isMobile){
                                obj.class='seven';
                            }
                            weeks.push(obj);
//                            weeks.push({label:label,interval:interval,upLabel:interval.start().format('DD MMMM')}); 
                            //                            $log.debug('check interval date ',interval.start().format('DD/MM/YYYY'),interval.end().format('DD/MM/YYYY'));
                        }
                        // $log.debug('check interval date ',weeks);
                        return weeks;
                        break;
                        // giorni del mese
                    case 'month':
                        var days = [];
                        // creo un array con i giorni del mese
                        for(var j = 1; j <= now.daysInMonth(); j++){
                            var start = angular.copy(now).date(j).set(initStart);
                            var end = angular.copy(now).date(j).set(initEnd);
                            var interval = moment.interval(start,end);
                            days.push({label:j,interval:interval,upLabel:interval.start().format('')}); 
                            //$log.debug('check interval month ',interval.start(),interval.end());
                        }
                        // $log.debug('check interval month ',days);
                        return days;
                        break;
                        // mesi dell'anno
                    case 'year':
                        // 0: gennaio, 1: febbraio, 2: marzo, 3: aprile, 4: maggio
                        // 5: giugno, 6: luglio, 7: agosto, 8: settembre, 9: ottobre
                        // 10: novembre, 11: dicembre
                        var months = [];
                        var month = angular.copy(now);
                        for(var i = 0 ; i < 12; i ++){
                            month.month(i);
                            var start = angular.copy(month).date(1).set(initStart);
                            var end = angular.copy(month).date(month.daysInMonth()).set(initEnd);
                            var interval = moment.interval(start,end);
                            var e = {label:start.format('M'),interval:interval}

                            var monthLabel = $scope.isMobile ? localeData.monthsShort(interval.start()) : localeData.months(interval.start());
                            e.upLabel = monthLabel;//interval.start().format('MMMM');
                            months.push(e);
                            //$log.debug('check interval year ',interval.start(),interval.end());
                        }
                        // $log.debug('check interval year ',months);
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
                switch($scope.units[$scope.indexDefaultUnit].key){
                    case 'hour':
                        // restituiscce fase del giorno corrente
                        r = parseInt(r.hour()/6);
                        break;
                    case 'day':
                        // fix italiano
                        r = angular.copy(r.isoWeekday())-1;
                        // restituisce giorno corrente della settimana
                        // if($translate.use() === "en"){
                        //     r = angular.copy(r.isoWeekday());
                        // }
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
                //                $log.debug('check index ',r,getNowContext(now),getNowContext($scope.moment));
                // se la timeline e' centrata sul momento attuale
                if(getNowContext(now) == getNowContext($scope.moment))
                    return r;
                // altrimenti restituisco indice nullo
                return -1;
            }


            // recupera il contesto di now e inizializza le lable di bottoni
            //            $scope.units = [{key:"hour",label:'HOUR_BUTTON'},
            //                            {key:"day",label:"DAY_BUTTON"},
            //                            {key:"date",label:"DATE_BUTTON"},
            //                            {key:"year",label:"YEAR_BUTTON"}];
            function setContextButtons(now){
                var keys = $scope.units.map(function(e){return e.key});

                $scope.units[keys.indexOf('hour')].label = ($scope.isMobile ? localeData.weekdaysShort(now) : localeData.weekdays(now)).concat(" ").concat(now.format('D'));
                $scope.units[keys.indexOf('day')].label = (now.isoWeekday(1).format('D')).concat(" - ",now.isoWeekday(7).format('D'));
                $scope.units[keys.indexOf('date')].label = localeData._months[now.month()];
                $scope.units[keys.indexOf('year')].label = now.year();
            }
            function getNowContext(now){
                var label = "";
                // considero l'unita' corrente (es. settimana, mese, anno)
                switch($scope.units[$scope.indexDefaultUnit].key){
                    case 'hour':
                        // appende il giorno corrente della settimana e il numero
                        label = label.concat(now.format('dddd')).concat(" ").concat(now.format('D')).concat(" ",localeData._months[now.month()]);

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
                switch($scope.units[$scope.indexDefaultUnit].key){
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

            // filtro bounding box della mappa, filtro preventivamente
            function boundsFiltering(val,bounds){
                return bounds.contains([val.lat,val.lng]);
            }

            // calcola l'intervallo definito dalla timeline
            function getFullInterval(){
                var time = {};
                time.from = new Date($scope.timewindow[0].interval.start()).toISOString();
                time.to = new Date($scope.timewindow[$scope.timewindow.length -1 ].interval.end()).toISOString();
                return time;
            }

            // calcola l'intervallo definito dalla timeline
            function getCurrentInterval(){
                return moment.interval($scope.timewindow[0].interval.start(),$scope.timewindow[$scope.timewindow.length -1 ].interval.end());
            }


            // calcola gli slot da occupare per un intervallo
            function calcSlot(features, unit, bounds){
                unit.markers = {};
                unit.total = 0;
                for(var i in features){
                    if(features[i].eTimeline && boundsFiltering(features[i],bounds)){
                        var feature = features[i].eTimeline;
                        if(intersect(feature.interval,unit.interval)){
                            var type = feature.type;
                            if(!unit.markers[type]){
                                unit.markers[type] = {counter:0,color:feature.color};
                            }
                            // aggiungo il marker alla timeline
                            unit.markers[type].counter++;
                            // calcolo il totale dei marker
                            unit.total++;
                        }
                    }
                }
            }

            // calcola intersezione tra intervalli
            function intersect(i,j){
                // l'inizio e' contenuto nell'intervallo
                if(i.start() && i.start() >= j.start() && i.start() <= j.end())
                    return true;
                // la fine e' contenuta nell'intervallo
                if(i.end() && i.end() >= j.start() && i.end() <= j.end())
                    return true;
                // contiene l'intervallo
                if(i.start() && i.end() && i.start() <= j.start() && i.end() >= j.end())
                    return true;

                return false;
            }


        }]
    };
});

"use strict";
var app = angular.module("ionic-datepicker", ["ionic", "ionic-datepicker.templates"]);
app.service("DatepickerService", function() {}), app.directive("ionicDatepicker", ["$ionicPopup","$filter", "DatepickerService", function(e) {
    return {
        restrict: "AE",
        replace: !0,
        scope: {
            ipDate: "=idate",
            disablePreviousDates: "=disablepreviousdates",
            disableFutureDates: "=disablefuturedates",
            callback: "=callback",
            title: "=title",
            disabledDates: "=?disableddates",
            disableAfter: "=?disableafter",
            disableAfterEnabled: "=?disableafterenabled",
            disableBefore: "=?disablebefore",
            disableBeforeEnabled: "=?disablebeforeenabled",
            translator: "=translator",
            mondayfirst: "=mondayfirst"
        },
        link: function(t, a) {
            t.datePickerTitle = t.title || "Select Date";
            var i = [{
                id: 0,
                name: "Gennaio"
            }, {
                id: 1,
                name: "Febraio"
            }, {
                id: 2,
                name: "Marzo"
            }, {
                id: 3,
                name: "Aprile"
            }, {
                id: 4,
                name: "Maggio"
            }, {
                id: 5,
                name: "Giugno"
            }, {
                id: 6,
                name: "Luglio"
            }, {
                id: 7,
                name: "Agosto"
            }, {
                id: 8,
                name: "Settembre"
            }, {
                id: 9,
                name: "Ottobre"
            }, {
                id: 10,
                name: "Novembre"
            }, {
                id: 11,
                name: "Dicembre"
            }];
            t.monthsList = i;
            var l = [];
            for (r = 1901; 2100 >= r; r++) l.push({
                id: r,
                name: r
            });
            if (t.yearsList = l, t.currentMonth = "", t.currentYear = "", t.ipDate || (t.ipDate = new Date), angular.isDefined(t.disabledDates))
                for (var r = 0; r < t.disabledDates.length; r++) t.disabledDates[r] = t.disabledDates[r].getTime();
            else t.disabledDates = [];
            t.previousDayEpoch = +new Date - 864e5, t.nextDayEpoch = +new Date;
            var o = angular.copy(t.ipDate);
            o.setHours(0), o.setMinutes(0), o.setSeconds(0), o.setMilliseconds(0), t.selctedDateString = o.toString(), t.weekNames = t.mondayfirst ? ["L", "M", "M", "G", "V", "S", "D"]:["D", "L", "M", "M", "G", "V", "S"], t.today = {};
            var s = function(e) {
                var t = new Date(e.getFullYear(), e.getMonth(), e.getDate());
                return {
                    dateObj: e,
                    date: t.getDate(),
                    month: t.getMonth(),
                    year: t.getFullYear(),
                    day: t.getDay(),
                    dateString: t.toString(),
                    epochLocal: t.getTime(),
                    epochUTC: t.getTime() + 60 * t.getTimezoneOffset() * 1e3
                }
            };
            t.today = s(new Date);
            var d = function(e) {
                e.setHours(0), e.setMinutes(0), e.setSeconds(0), e.setMilliseconds(0), o = angular.copy(e);
                var a = new Date(e.getFullYear(), e.getMonth(), 1).getDate(),
                    n = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate();
                t.dayList = [];
                for (var i = a; n >= i; i++) {
                    var l = new Date(e.getFullYear(), e.getMonth(), i);
                    t.dayList.push({
                        date: l.getDate(),
                        month: l.getMonth(),
                        year: l.getFullYear(),
                        day: l.getDay(),
                        dateString: l.toString(),
                        epochLocal: l.getTime(),
                        epochUTC: l.getTime() + 60 * l.getTimezoneOffset() * 1e3
                    })
                }
                var a = t.mondayfirst ? (t.dayList[0].day -1) % t.weekNames.length : t.dayList[0].day;
                console.log('check daylist',t.dayList[0].day);
                t.currentMonthFirstDayEpoch = t.dayList[0].epochLocal, t.currentMonthLastDayEpoch = t.dayList[t.dayList.length - 1].epochLocal;
                for (var r = 0; a > r; r++) t.dayList.unshift({});
                t.rows = [], t.cols = [], t.currentMonth = o.getMonth(), t.currentYear = e.getFullYear(), t.currentMonthSelected = t.currentMonth, t.currentYearSelected = t.currentYear, t.numColumns = 7, t.rows.length = 6, t.cols.length = t.numColumns
            };
            t.monthChanged = function() {
                o.setDate(3), o.setMonth(t.currentMonth), t.currentYear = o.getFullYear(), d(o)
            }, t.yearChanged = function() {
                o.setFullYear(t.currentYear), d(o)
            }, t.prevMonth = function() {
                0 === o.getMonth() ? (o.setMonth(11), o.setFullYear(o.getFullYear() - 1)) : o.setMonth(o.getMonth() - 1), t.currentMonth = o.getMonth(), t.currentYear = o.getFullYear(), d(o)
            }, t.nextMonth = function() {
                11 === o.getMonth() && o.setFullYear(o.getFullYear()), o.setMonth(o.getMonth() + 1), t.currentMonth = o.getMonth(), t.currentYear = o.getFullYear(), d(o)
            }, t.date_selection = {
                selected: !1,
                selectedDate: "",
                submitted: !1
            }, t.dateSelected = function(e) {
                t.selctedDateString = e.dateString, t.date_selection.selected = !0, t.date_selection.selectedDate = new Date(e.dateString), o = new Date(e.dateString)
            }, t.setBeforeAfterDates = function() {
                if (angular.isDefined(t.disableAfter))
                    if (console.log("disable after ", t.disableAfter), t.disableAfterEnabled && null != t.disableAfter) {
                        var e = new Date(t.disableAfter);
                        e = +e.getTime() + 864e5, console.log("data calcolata ", e)
                    } else t.disableAfter = null;
                if (angular.isDefined(t.disableBefore))
                    if (console.log("disable before ", t.disableBefore), t.disableBeforeEnabled && null != t.disableBefore) {
                        var a = new Date(t.disableBefore);
                        a = +a.getTime() - 864e5, console.log("data calcolata ", a)
                    } else t.disableBefore = null
            }, a.on("click", function() {
                var a = new Date;
                t.ipDate ? (a = angular.copy(t.ipDate), d(a)) : d(a), t.setBeforeAfterDates(), t.date_selection.selected || t.dateSelected(s(a)), e.show({
                    templateUrl: "date-picker-modal.html",
                    title: t.translator ? t.translator(t.datePickerTitle) : t.datePickerTitle,
                    subTitle: "",
                    scope: t,
                    buttons: [{
                        text: '<i class="icon ion-close-round"></i>',
                        type: "button-positive button-outline",
                        onTap: function() {
                            t.callback(void 0)
                        }
                    }, {
                        text: '<i class="ion-checkmark-round"></i>',
                        type: "button-positive",
                        onTap: function(e) {
                            t.date_selection.submitted = !0, t.date_selection.selected === !0 ? (t.ipDate = angular.copy(t.date_selection.selectedDate), t.callback(t.ipDate)) : e.preventDefault()
                        }
                    }]
                })
            })
        }
    }
}]);
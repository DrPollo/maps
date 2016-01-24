//By Rajeshwar Patlolla
//https://github.com/rajeshwarpatlolla

"use strict";
var app = angular.module('ionic-datepicker', ['ionic', 'ionic-datepicker.templates']);

app.service('DatepickerService', function () {

});

app.directive('ionicDatepicker', ['$ionicPopup', 'DatepickerService', function ($ionicPopup, DatepickerService) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            ipDate: '=idate',
            disablePreviousDates: '=disablepreviousdates',
            disableFutureDates: '=disablefuturedates',
            callback: '=callback',
            title: '=title',
            disabledDates: '=?disableddates',
            disableAfter: '=?disableafter',
            disableAfterEnabled: '=?disableafterenabled',
            disableBefore: '=?disablebefore',
            disableBeforeEnabled: '=?disablebeforeenabled'
        },
        link: function (scope, element, attrs) {

            scope.datePickerTitle = scope.title || 'Select Date';
            var monthsList = [
                {
                    id: 0, name: 'Gennaio'
                },
                {
                    id: 1, name: 'Febraio'
                },
                {
                    id: 2, name: 'Marzo'
                },
                {
                    id: 3, name: 'Aprile'
                },
                {
                    id: 4, name: 'Maggio'
                },
                {
                    id: 5, name: 'Giugno'
                },
                {
                    id: 6, name: 'Luglio'
                },
                {
                    id: 7, name: 'Agosto'
                },
                {
                    id: 8, name: 'Settembre'
                },
                {
                    id: 9, name: 'Ottobre'
                },
                {
                    id: 10, name: 'Novembre'
                },
                {
                    id: 11, name: 'Dicembre'
                }
            ];
            scope.monthsList = monthsList;
            var yearsList = [];
            for (i = 1901; i <= 2100; i++) {
                yearsList.push({ id: i, name: i });
            }

            scope.yearsList = yearsList;

            scope.currentMonth = '';
            scope.currentYear = '';

            if (!scope.ipDate) {
                scope.ipDate = new Date();
            }

            if (!angular.isDefined(scope.disabledDates)) {
                scope.disabledDates = [];
            } else {
                for (var i = 0; i < scope.disabledDates.length; i++) {
                    scope.disabledDates[i] = scope.disabledDates[i].getTime();
                }
            }

            scope.previousDayEpoch = (+(new Date()) - 86400000);
            scope.nextDayEpoch = (+(new Date()));




            var currentDate = angular.copy(scope.ipDate);

            currentDate.setHours(0);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);

            scope.selctedDateString = currentDate.toString();
            scope.weekNames = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
            scope.today = {};

            var getDateObject = function (date) {
                var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                return {
                    dateObj: date,
                    date: tempDate.getDate(),
                    month: tempDate.getMonth(),
                    year: tempDate.getFullYear(),
                    day: tempDate.getDay(),
                    dateString: tempDate.toString(),
                    epochLocal: tempDate.getTime(),
                    epochUTC: (tempDate.getTime() + (tempDate.getTimezoneOffset() * 60 * 1000))
                };
            };

            scope.today = getDateObject(new Date());

            var refreshDateList = function (current_date) {
                current_date.setHours(0);
                current_date.setMinutes(0);
                current_date.setSeconds(0);
                current_date.setMilliseconds(0);

                currentDate = angular.copy(current_date);

                var firstDay = new Date(current_date.getFullYear(), current_date.getMonth(), 1).getDate();
                var lastDay = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate();

                scope.dayList = [];

                for (var i = firstDay; i <= lastDay; i++) {
                    var tempDate = new Date(current_date.getFullYear(), current_date.getMonth(), i);
                    scope.dayList.push({
                        date: tempDate.getDate(),
                        month: tempDate.getMonth(),
                        year: tempDate.getFullYear(),
                        day: tempDate.getDay(),
                        dateString: tempDate.toString(),
                        epochLocal: tempDate.getTime(),
                        epochUTC: (tempDate.getTime() + (tempDate.getTimezoneOffset() * 60 * 1000))
                    });
                }

                var firstDay = scope.dayList[0].day;

                scope.currentMonthFirstDayEpoch = scope.dayList[0].epochLocal;
                scope.currentMonthLastDayEpoch = scope.dayList[scope.dayList.length - 1].epochLocal;

                for (var j = 0; j < firstDay; j++) {
                    scope.dayList.unshift({});
                }

                scope.rows = [];
                scope.cols = [];

                scope.currentMonth = currentDate.getMonth();
                scope.currentYear = current_date.getFullYear();
                scope.currentMonthSelected = scope.currentMonth;
                scope.currentYearSelected = scope.currentYear;

                scope.numColumns = 7;
                scope.rows.length = 6;
                scope.cols.length = scope.numColumns;
            };

            scope.monthChanged = function () {
                currentDate.setDate(3); // setting to arbitrary day in the middle of month. i.e. previous month if we're on the 31st
                currentDate.setMonth(scope.currentMonth);
                scope.currentYear = currentDate.getFullYear();
                refreshDateList(currentDate);
            };

            scope.yearChanged = function () {
                currentDate.setFullYear(scope.currentYear);
                refreshDateList(currentDate);
            };

            scope.prevMonth = function () {
                if (currentDate.getMonth() === 0) {
                    currentDate.setMonth(11);
                    currentDate.setFullYear(currentDate.getFullYear() - 1);
                }
                else {
                    currentDate.setMonth(currentDate.getMonth() - 1);
                }
                scope.currentMonth = currentDate.getMonth();
                scope.currentYear = currentDate.getFullYear();

                refreshDateList(currentDate);
            };

            scope.nextMonth = function () {
                if (currentDate.getMonth() === 11) {
                    currentDate.setFullYear(currentDate.getFullYear());
                }
                currentDate.setMonth(currentDate.getMonth() + 1);
                scope.currentMonth = currentDate.getMonth();
                scope.currentYear = currentDate.getFullYear();
                refreshDateList(currentDate);
            };

            scope.date_selection = {selected: false, selectedDate: '', submitted: false};

            scope.dateSelected = function (date) {
                scope.selctedDateString = date.dateString;
                scope.date_selection.selected = true;
                scope.date_selection.selectedDate = new Date(date.dateString);
                currentDate = new Date(date.dateString);
            };


            scope.setBeforeAfterDates = function() {
                // set delle date se il campo e' definito
                if (angular.isDefined(scope.disableAfter)) {
                    console.log("disable after ", scope.disableAfter);
                    if(scope.disableAfterEnabled && scope.disableAfter != null){
                        var afterDate = new Date(scope.disableAfter);
                        afterDate = (+(afterDate.getTime()) + 86400000);
                        console.log("data calcolata ", afterDate);
                    }else{
                        scope.disableAfter = null;
                    }
                }
                if (angular.isDefined(scope.disableBefore)) {
                    console.log("disable before ", scope.disableBefore);
                    if(scope.disableBeforeEnabled && scope.disableBefore != null){
                        var beforeDate = new Date(scope.disableBefore);
                        beforeDate = (+(beforeDate.getTime()) - 86400000);
                        console.log("data calcolata ", beforeDate);
                    }else{
                        scope.disableBefore = null;
                    }
                }

            }

            element.on("click", function () {
                var defaultDate = new Date();
                if (!scope.ipDate) {
                    refreshDateList(defaultDate);
                } else {
                    defaultDate = angular.copy(scope.ipDate);
                    refreshDateList(defaultDate);
                }
                scope.setBeforeAfterDates();
                // set the current date if not selected
                if (!scope.date_selection.selected) {
                    scope.dateSelected(getDateObject(defaultDate));
                }

                $ionicPopup.show({
                    templateUrl: 'date-picker-modal.html',
                    title: scope.datePickerTitle,
                    subTitle: '',
                    scope: scope,
                    buttons: [
                        {
                            text: '<i class="icon ion-close-round"></i>',
                            type: 'button-positive button-outline',
                            onTap: function (e) {
                                scope.callback(undefined);
                            }
                        },
                        /*{
              text: 'Oggi',
              type: '',
              onTap: function (e) {

                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                today.setMilliseconds(0);

                var tempEpoch = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var todayObj = {
                  date: today.getDate(),
                  month: today.getMonth(),
                  year: today.getFullYear(),
                  day: today.getDay(),
                  dateString: today.toString(),
                  epochLocal: tempEpoch.getTime(),
                  epochUTC: (tempEpoch.getTime() + (tempEpoch.getTimezoneOffset() * 60 * 1000))
                };

                scope.selctedDateString = todayObj.dateString;
                scope.date_selection.selected = true;
                scope.date_selection.selectedDate = new Date(todayObj.dateString);
                refreshDateList(new Date());
                e.preventDefault();
              }
            },*/
                        {
                            text: '<i class="ion-checkmark-round"></i>',
                            type: 'button-positive',
                            onTap: function (e) {
                                scope.date_selection.submitted = true;

                                if (scope.date_selection.selected === true) {
                                    scope.ipDate = angular.copy(scope.date_selection.selectedDate);
                                    scope.callback(scope.ipDate);
                                } else {
                                    e.preventDefault();
                                }
                            }
                        }
                    ]
                })
            })
        }
    }
}]);
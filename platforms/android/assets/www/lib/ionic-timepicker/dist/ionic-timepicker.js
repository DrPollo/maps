! function (t, e) {
    var i = t.createElement("style");
    if (t.getElementsByTagName("head")[0].appendChild(i), i.styleSheet) i.styleSheet.disabled || (i.styleSheet.cssText = e);
    else try {
        i.innerHTML = e
    } catch (n) {
        i.innerText = e
    }
}(document, "/* Empty. Add your own CSS if you like */\n\n.timePickerColon {\n  padding-top: 40px;\n  text-align: center;\n  font-weight: bold;\n}\n\n.timePickerArrows {\n  width: 100%;\n}\n\n.timePickerBoxText {\n  text-align: center;\n  border: 1px solid #dddddd !important;\n}\n\n.bar.bar-stable, .tabs {\n  box-shadow: 0 0 5px #555;\n}\n\n.overflowShow {\n  white-space: normal !important;\n}"),
    function (t) {
    try {
        t = angular.module("ionic-timepicker.templates")
    } catch (e) {
        t = angular.module("ionic-timepicker.templates", [])
    }
    t.run(["$templateCache", function (t) {
        t.put("ionic-timepicker-12-hour.html", '<div class=12HourTimePickerChildDiv><div class=row><span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark timePickerArrows marginBottom10" ng-click=increaseHours()><i class="icon ion-chevron-up"></i></button> <input type=text ng-model=time.hours class="ipBoxes timePickerBoxText" disabled> <button type=button class="button button-clear button-small button-dark timePickerArrows marginTop10" ng-click=decreaseHours()><i class="icon ion-chevron-down"></i></button></span> <label class="col col-10 timePickerColon">:</label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark timePickerArrows marginBottom10" ng-click=increaseMinutes()><i class="icon ion-chevron-up"></i></button> <input type=text ng-model=time.minutes class="ipBoxes timePickerBoxText" disabled> <button type=button class="button button-clear button-small button-dark timePickerArrows marginTop10" ng-click=decreaseMinutes()><i class="icon ion-chevron-down"></i></button></span> <label class="col col-10 timePickerColon">:</label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark timePickerArrows marginBottom10" ng-click=changeMeridian()><i class="icon ion-chevron-up"></i></button> <input type=text ng-model=time.meridian class="ipBoxes timePickerBoxText" disabled> <button type=button class="button button-clear button-small button-dark timePickerArrows marginTop10" ng-click=changeMeridian()><i class="icon ion-chevron-down"></i></button></span></div></div>')
    }])
}(),
    function (t) {
    try {
        t = angular.module("ionic-timepicker.templates")
    } catch (e) {
        t = angular.module("ionic-timepicker.templates", [])
    }
    t.run(["$templateCache", function (t) {
        t.put("ionic-timepicker-24-hour.html", '<div class=24HourTimePickerChildDiv><div class=row><span class="button-small col col-offset-20 col-25"><button type=button class="button button-clear button-small button-dark timePickerArrows marginBottom10" ng-click=increaseHours()><i class="icon ion-chevron-up"></i></button> <input type=text ng-model=time.hours class="ipBoxes timePickerBoxText" disabled> <button type=button class="button button-clear button-small button-dark timePickerArrows marginTop10" ng-click=decreaseHours()><i class="icon ion-chevron-down"></i></button></span> <label class="col col-10 timePickerColon">:</label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark timePickerArrows marginBottom10" ng-click=increaseMinutes()><i class="icon ion-chevron-up"></i></button> <input type=text ng-model=time.minutes class="ipBoxes timePickerBoxText" disabled> <button type=button class="button button-clear button-small button-dark timePickerArrows marginTop10" ng-click=decreaseMinutes()><i class="icon ion-chevron-down"></i></button></span></div></div>')
    }])
}(),
    function () {
    "use strict";
    angular.module("ionic-timepicker", ["ionic", "ionic-timepicker.templates"])
}(),
    function () {
    "use strict";

    function t(t) {
        return {
            restrict: "AE",
            replace: !0,
            scope: {
                inputObj: "=inputObj"
            },
            link: function (e, i, n) {
                console.log(e.inputObj);
                var o = new Date,
                    s = o.getHours();
                e.inputEpochTime = e.inputObj.inputEpochTime ? e.inputObj.inputEpochTime : 60 * s * 60, 
                    e.step = e.inputObj.step ? e.inputObj.step : 15, 
                    e.format = e.inputObj.format ? e.inputObj.format : 24, 
                    e.titleLabel = e.inputObj.titleLabel ? e.inputObj.titleLabel : "Time Picker", 
                    e.setLabel = e.inputObj.setLabel ? e.inputObj.setLabel : "Set", 
                    e.closeLabel = e.inputObj.closeLabel ? e.inputObj.closeLabel : "Close", 
                    e.setButtonType = e.inputObj.setButtonType ? e.inputObj.setButtonType : "button-positive", e.closeButtonType = e.inputObj.closeButtonType ? e.inputObj.closeButtonType : "button-stable";
                var u = {
                    epochTime: e.inputEpochTime,
                    step: e.step,
                    format: e.format
                };
                e.time = {
                    hours: 0,
                    minutes: 0,
                    meridian: ""
                };
                var m = new Date(1e3 * u.epochTime);
                e.increaseHours = function () {
                    e.time.hours = Number(e.time.hours), 12 == u.format && (12 != e.time.hours ? e.time.hours += 1 : e.time.hours = 1), 24 == u.format && (23 != e.time.hours ? e.time.hours += 1 : e.time.hours = 0), e.time.hours = e.time.hours < 10 ? "0" + e.time.hours : e.time.hours
                }, 
                    e.decreaseHours = function () {
                    e.time.hours = Number(e.time.hours), 12 == u.format && (e.time.hours > 1 ? e.time.hours -= 1 : e.time.hours = 12), 24 == u.format && (e.time.hours > 0 ? e.time.hours -= 1 : e.time.hours = 23), e.time.hours = e.time.hours < 10 ? "0" + e.time.hours : e.time.hours
                }, 
                    e.increaseMinutes = function () {
                    e.time.minutes = Number(e.time.minutes), e.time.minutes != 60 - u.step && e.time.minutes + u.step <= 60 ? e.time.minutes += u.step : e.time.minutes = 0, e.time.minutes = e.time.minutes < 10 ? "0" + e.time.minutes : e.time.minutes
                }, 
                    e.decreaseMinutes = function () {
                    e.time.minutes = Number(e.time.minutes), 0 != e.time.minutes && e.time.minutes - u.step > 0 ? e.time.minutes -= u.step : e.time.minutes = 60 - u.step, e.time.minutes = e.time.minutes < 10 ? "0" + e.time.minutes : e.time.minutes
                }, 
                    e.changeMeridian = function () {
                    e.time.meridian = "AM" === e.time.meridian ? "PM" : "AM"
                }, 
                    i.on("click", function () {
                    e.inputObj.inputEpochTime && (m = new Date(1e3 * e.inputObj.inputEpochTime)), 12 == u.format ? (e.time.meridian = m.getUTCHours() >= 12 ? "PM" : "AM", e.time.hours = m.getUTCHours() > 12 ? m.getUTCHours() - 12 : m.getUTCHours(), e.time.minutes = m.getUTCMinutes(), e.time.hours = e.time.hours < 10 ? "0" + e.time.hours : e.time.hours, e.time.minutes = e.time.minutes < 10 ? "0" + e.time.minutes : e.time.minutes, 0 == e.time.hours && "AM" == e.time.meridian && (e.time.hours = 12), t.show({
                        templateUrl: "ionic-timepicker-12-hour.html",
                        title: e.titleLabel,
                        subTitle: "",
                        scope: e,
                        buttons: [{
                            text: e.closeLabel,
                            type: e.closeButtonType,
                            onTap: function (t) {
                                e.inputObj.callback(void 0)
                            }
                        }, {
                            text: e.setLabel,
                            type: e.setButtonType,
                            onTap: function (t) {
                                e.loadingContent = !0;
                                var i = 0;
                                i = 12 != e.time.hours ? 60 * e.time.hours * 60 + 60 * e.time.minutes : 60 * e.time.minutes, "AM" === e.time.meridian ? i += 0 : "PM" === e.time.meridian && (i += 43200), e.etime = i, e.inputObj.callback(e.etime)
                            }
                        }]
                    })) : 24 == u.format && (e.time.hours = m.getUTCHours(), e.time.minutes = m.getUTCMinutes(), e.time.hours = e.time.hours < 10 ? "0" + e.time.hours : e.time.hours, e.time.minutes = e.time.minutes < 10 ? "0" + e.time.minutes : e.time.minutes, t.show({
                        templateUrl: "ionic-timepicker-24-hour.html",
                        title: e.titleLabel,
                        subTitle: "",
                        scope: e,
                        buttons: [{
                            text: e.closeLabel,
                            type: e.closeButtonType,
                            onTap: function (t) {
                                e.inputObj.callback(void 0)
                            }
                        }, {
                            text: e.setLabel,
                            type: e.setButtonType,
                            onTap: function (t) {
                                e.loadingContent = !0;
                                var i = 0;
                                i = 24 != e.time.hours ? 60 * e.time.hours * 60 + 60 * e.time.minutes : 60 * e.time.minutes, e.etime = i, e.inputObj.callback(e.etime)
                            }
                        }]
                    }))
                })
            }
        }
    }
    angular.module("ionic-timepicker").directive("ionicTimepicker", t), t.$inject = ["$ionicPopup"]
}();
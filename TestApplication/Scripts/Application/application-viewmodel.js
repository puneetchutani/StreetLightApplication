/// <reference path="../Definitions/knockout.d.ts" />
/// <reference path="../Definitions/jquery.d.ts" />
var Rsl;
(function (Rsl) {
    var ApplicationViewModel = (function () {
        // get applicant to add a loader here
        function ApplicationViewModel(_apiAccess) {
            var _this = this;
            this._apiAccess = _apiAccess;
            this.streetlights = ko.observable();
            this.selectedStreetlight = ko.observable();
            this.loadData().done(function (x) {
                _this.streetlights(x);
            });
        }
        ApplicationViewModel.prototype.selectStreetlight = function (parent, streetlight) {
            parent.selectedStreetlight(null);
            parent.loadDetails(streetlight.id).done(function (x) {
                parent.selectedStreetlight(x);
            });
        };
        ApplicationViewModel.prototype.clickObject = function (parent, data) {
            parent.set(data);
        };
        ApplicationViewModel.prototype.isFailed = function (bulb) {
            return bulb.bulbStatus().fault > 0;
        };
        ApplicationViewModel.prototype.selectedStreetlightPowerdraw = function (light) {
            if (light.isSwitchedOn()) {
                if (light.bulbs.length > 0) {
                    var power = 0;
                    for (var i = 0; i < light.bulbs.length; i++) {
                        if (light.bulbs[i].bulbStatus().isOn) {
                            power = power + light.bulbs[i].bulbInformation.powerDraw;
                        }
                    }
                    return power;
                }
            }
            return 0;
        };
        ApplicationViewModel.prototype.toggleLightState = function (light) {
            var _this = this;
            var isOn = light.isSwitchedOn();
            if (isOn) {
                this._apiAccess.switchOffLight(light.id).always(function (x) {
                    _this.selectStreetlight(_this, {
                        id: light.id,
                        description: light.description
                    });
                });
            }
            else {
                this._apiAccess.switchOnLight(light.id).always(function (x) {
                    _this.selectStreetlight(_this, {
                        id: light.id,
                        description: light.description
                    });
                });
            }
        };
        ApplicationViewModel.prototype.toggleBulbState = function (bulb, isStreetLightOn, parent) {
            var _this = this;
            var isOn = bulb.bulbStatus().isOn;
            if (isStreetLightOn) {
                if (isOn) {
                    // always switch off
                    parent._apiAccess.switchOffBulb(bulb.bulbInformation.id)
                        .done(function (x) {
                        // reload bulb data
                        _this.updateBulbStatus(bulb);
                    });
                }
                else {
                    if (bulb.bulbStatus().fault > 0) {
                        alert("The button is disabled until the fault is repaired.");
                        return;
                    }
                    parent._apiAccess.switchOnBulb(bulb.bulbInformation.id)
                        .done(function (x) {
                        // reload bulb data
                        _this.updateBulbStatus(bulb);
                    });
                }
            }
        };
        ApplicationViewModel.prototype.updateBulbStatus = function (bulb) {
            this._apiAccess.loadBulbDetail(bulb.bulbInformation.id).done(function (x) {
                bulb.bulbStatus(x.bulbCurrentState);
            });
        };
        ApplicationViewModel.prototype.loadData = function () {
            return this._apiAccess.loadStreetlights();
        };
        ApplicationViewModel.prototype.loadDetails = function (id) {
            return this._apiAccess.loadStreetlightDetail(id);
        };
        return ApplicationViewModel;
    }());
    Rsl.ApplicationViewModel = ApplicationViewModel;
})(Rsl || (Rsl = {}));
//# sourceMappingURL=application-viewmodel.js.map
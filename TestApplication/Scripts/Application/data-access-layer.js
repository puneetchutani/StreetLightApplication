/// <reference path="../Definitions/knockout.d.ts" />
var Rsl;
(function (Rsl) {
    (function (RequestType) {
        RequestType[RequestType["Get"] = 0] = "Get";
        RequestType[RequestType["Post"] = 1] = "Post";
        RequestType[RequestType["Delete"] = 2] = "Delete";
    })(Rsl.RequestType || (Rsl.RequestType = {}));
    var RequestType = Rsl.RequestType;
    var ApiAccess = (function () {
        function ApiAccess() {
        }
        ApiAccess.prototype.loadStreetlights = function () {
            return this.makeRequest();
        };
        ApiAccess.prototype.loadStreetlightDetail = function (id) {
            var deferred = $.Deferred();
            this.makeRequest([id]).done(function (streetlight) {
                deferred.resolve({
                    description: streetlight.description,
                    electricalDraw: streetlight.electricalDraw,
                    id: streetlight.id,
                    isSwitchedOn: ko.observable(streetlight.isSwitchedOn),
                    bulbs: (streetlight.bulbs ? streetlight.bulbs.map(function (x) {
                        return {
                            bulbInformation: x.bulbInformation,
                            bulbStatus: ko.observable(x.bulbCurrentState)
                        };
                    }) : null)
                });
            })
                .fail(function () {
                deferred.reject();
            });
            return deferred.promise();
        };
        ApiAccess.prototype.loadBulbDetail = function (id) {
            return this.makeRequest(["bulb", id]);
        };
        ApiAccess.prototype.switchOffLight = function (id) {
            return this.makeRequest([id, "off"], "POST");
        };
        ApiAccess.prototype.switchOnLight = function (id) {
            return this.makeRequest([id, "on"], "POST");
        };
        ApiAccess.prototype.switchOffBulb = function (id) {
            return this.makeRequest(["bulb", id, "off"], "POST");
        };
        ApiAccess.prototype.switchOnBulb = function (id) {
            return this.makeRequest(["bulb", id, "on"], "POST");
        };
        ApiAccess.prototype.makeRequest = function (pathElements, type, data) {
            if (pathElements === void 0) { pathElements = []; }
            if (type === void 0) { type = "GET"; }
            return $.ajax({
                url: location.protocol + '//' + location.host + "/api/streetlights/" + pathElements.join("/"),
                data: data ? JSON.stringify(data) : null,
                contentType: "application/json",
                type: type,
                crossDomain: false,
                cache: false,
                beforeSend: function () {
                    $('#loading').show();
                },
                complete: function () {
                    $('#loading').hide();
                }
            });
        };
        return ApiAccess;
    }());
    Rsl.ApiAccess = ApiAccess;
})(Rsl || (Rsl = {}));
//# sourceMappingURL=data-access-layer.js.map
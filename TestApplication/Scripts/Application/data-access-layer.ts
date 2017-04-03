/// <reference path="../Definitions/knockout.d.ts" />

module Rsl {
    export interface IStreetlightDetailViewModel {
        description: string;
        id: string;
        bulbs: IBulbStateViewModel[];
        isSwitchedOn: KnockoutObservable<boolean>;
        electricalDraw: number;

    }
    export interface IBulbStateViewModel {
        bulbInformation: Models.IBulbInformation;
        bulbStatus: KnockoutObservable<Models.IBulbStatus>;
    }

    export interface IApiAccess {
        loadStreetlights(): JQueryPromise<Models.IStreetlightSummary[]>;
        loadStreetlightDetail(id: string): JQueryPromise<IStreetlightDetailViewModel>;
        loadBulbDetail(id: string): JQueryPromise<Models.IBulbState>;

        // control functions
        switchOffLight(id: string): JQueryPromise<boolean>;
        switchOnLight(id: string): JQueryPromise<string[]>;

        switchOffBulb(id: string): JQueryPromise<boolean>;
        switchOnBulb(id: string): JQueryPromise<boolean>;
    }

    export enum RequestType {
        Get,
        Post,
        Delete
    }

    export class ApiAccess implements IApiAccess {
        constructor() {
        }

        public loadStreetlights(): JQueryPromise<Models.IStreetlightSummary[]> {
            return this.makeRequest();
        }

        public loadStreetlightDetail(id: string): JQueryPromise<IStreetlightDetailViewModel> {
            var deferred = $.Deferred<IStreetlightDetailViewModel>();
            this.makeRequest<Models.IStreetlightDetail>([id]).done(streetlight => {
                deferred.resolve({
                    description: streetlight.description,
                    electricalDraw: streetlight.electricalDraw,
                    id: streetlight.id,
                    isSwitchedOn: ko.observable(streetlight.isSwitchedOn),
                    bulbs: (streetlight.bulbs ? streetlight.bulbs.map<IBulbStateViewModel>(x => {
                        return {
                            bulbInformation: x.bulbInformation,
                            bulbStatus: ko.observable(x.bulbCurrentState)
                        };
                    }) : null)
                });
            })
                .fail(() => {
                    deferred.reject();
                });

            return deferred.promise();
        }

        public loadBulbDetail(id: string): JQueryPromise<Models.IBulbState> {
            return this.makeRequest<Models.IBulbState>(["bulb", id]);
        }

        public switchOffLight(id: string): JQueryPromise<boolean> {
            return this.makeRequest<boolean>([id, "off"], "POST");
        }

        public switchOnLight(id: string): JQueryPromise<string[]> {
            return this.makeRequest<string[]>([id, "on"], "POST");
        }

        public switchOffBulb(id: string): JQueryPromise<boolean> {
            return this.makeRequest<boolean>(["bulb", id, "off"], "POST");
        }

        public switchOnBulb(id: string): JQueryPromise<boolean> {
            return this.makeRequest<boolean>(["bulb", id, "on"], "POST");
        }

        private makeRequest<T>(pathElements: string[] = [], type: string = "GET", data?: any): JQueryPromise<T> {
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
        }
    }
}
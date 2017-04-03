/// <reference path="../Definitions/knockout.d.ts" />
/// <reference path="../Definitions/jquery.d.ts" />

module Rsl {
    export class ApplicationViewModel {
        public streetlights: KnockoutObservable<Models.IStreetlightSummary[]>;
        public selectedStreetlight: KnockoutObservable<IStreetlightDetailViewModel>;

        // get applicant to add a loader here
        constructor(private _apiAccess: IApiAccess) {
            this.streetlights = ko.observable<Models.IStreetlightSummary[]>();
            this.selectedStreetlight = ko.observable<IStreetlightDetailViewModel>();
            this.loadData().done(x => {
                this.streetlights(x);
            });
        }

        public selectStreetlight(parent: ApplicationViewModel, streetlight: Models.IStreetlightSummary): void {
            parent.selectedStreetlight(null);
            parent.loadDetails(streetlight.id).done(x => {
                parent.selectedStreetlight(x);
            });
        }

        public clickObject(parent: any, data: any): void {
            parent.set(data);
        }

        public isFailed(bulb: IBulbStateViewModel): boolean {
            return bulb.bulbStatus().fault > 0;
        }

        public selectedStreetlightPowerdraw(light: IStreetlightDetailViewModel): number {
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
        }

        public toggleLightState(light: IStreetlightDetailViewModel): void {
            var isOn = light.isSwitchedOn();
            if (isOn) {
                this._apiAccess.switchOffLight(light.id).always(x => {
                    this.selectStreetlight(this, {
                        id: light.id,
                        description: light.description
                    });
                });
            }
            else {
                this._apiAccess.switchOnLight(light.id).always(x => {
                    this.selectStreetlight(this, {
                        id: light.id,
                        description: light.description
                    });
                });
            }
        }

        public toggleBulbState(bulb: IBulbStateViewModel, isStreetLightOn: boolean, parent: ApplicationViewModel): void {
            var isOn = bulb.bulbStatus().isOn;
            if (isStreetLightOn) {
                if (isOn) {
                    // always switch off
                    parent._apiAccess.switchOffBulb(bulb.bulbInformation.id)
                        .done(x => {
                            // reload bulb data
                            this.updateBulbStatus(bulb);
                        });
                }
                else {
                    if (bulb.bulbStatus().fault > 0) {
                        alert("The button is disabled until the fault is repaired.");
                        return;
                    }
                    parent._apiAccess.switchOnBulb(bulb.bulbInformation.id)
                        .done(x => {
                            // reload bulb data
                            this.updateBulbStatus(bulb);

                        });
                }
            }
        }

        private updateBulbStatus(bulb: IBulbStateViewModel) {
            this._apiAccess.loadBulbDetail(bulb.bulbInformation.id).done(x => {
                bulb.bulbStatus(x.bulbCurrentState);
            });
        }

        private loadData(): JQueryPromise<Models.IStreetlightSummary[]> {
            return this._apiAccess.loadStreetlights();
        }

        private loadDetails(id: string): JQueryPromise<IStreetlightDetailViewModel> {
            return this._apiAccess.loadStreetlightDetail(id);
        }
    }
}
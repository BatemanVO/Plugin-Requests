/*:
* @plugindesc Allows events to have comments that indicate if they move to a region Id, they should
* call a common event.
* @author Zevia
*
* @help In the event's note box (next to its name in the top), make a comment with
* the format <regionCommonEvent: x, y>, where x is the region ID and y is the
* number of the common event to call if the event moves onto the specified region
* ID.
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var EventRegionCommonEvent = module.Zevia.EventRegionCommonEvent = {};

    EventRegionCommonEvent.update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        if (!this.isMoving()) {
            var regionCommonEvent = $dataMap.events[this._eventId].meta.regionCommonEvent;
            if (regionCommonEvent) {
                var regionAndEventIds = regionCommonEvent.split(',');
                if (regionAndEventIds.length === 2) {
                    if (this.regionId() === parseInt(regionAndEventIds[0])) {
                        if (!this._hasRunCommonEvent) {
                            $gameTemp.reserveCommonEvent(parseInt(regionAndEventIds[1]));
                            this._hasRunCommonEvent = true;
                        }
                    } else {
                        this._hasRunCommonEvent = false;
                    }
                }
            }
        }
        EventRegionCommonEvent.update.call(this);
    };
})(window);

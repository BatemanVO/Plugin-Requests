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

    Game_Event.prototype.regionCommonEvent = function() {
        if (this.isMoving()) { return; }

        var regionCommonEvent = $dataMap.events[this._eventId].meta.regionCommonEvent;
        if (!regionCommonEvent) { return; }

        var regionAndEventIds = regionCommonEvent.split(',');
        if (regionAndEventIds.length !== 2) { return; }

        if (this.regionId() === parseInt(regionAndEventIds[0])) {
            if (!this._hasRunCommonEvent) {
                $gameTemp.reserveCommonEvent(parseInt(regionAndEventIds[1]));
                this._hasRunCommonEvent = true;
            }
        } else {
            this._hasRunCommonEvent = false;
        }
    };

    EventRegionCommonEvent.update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        this.regionCommonEvent();
        EventRegionCommonEvent.update.call(this);
    };
})(window);

/*:
* @plugindesc Allows events to have notes that indicate if they move to a region Id, they should
* call a common event or act as a page condition to auto-execute.
* @author Zevia
*
* @help In the event's note box (next to its name in the top), make a comment with
* the format <regionCommonEvent: x, y>, where x is the region ID and y is the
* number of the common event to call if the event moves onto the specified region
* ID.
*
* Alternatively, if you put a comment at the top of a page's list of commands
* with the format <regionCondition: x>, where x is the region ID, then that
* page will execute whenever the event moves onto a tile with that ID.
*
* Note that a comment with the text "<regionCondition: x>" must be the first
* command at the top of a page. When using regionCondition, all other
* conditions for the page must also be met in order to execute that page's logic.
*
* In both cases, the event will only fire the first time the event enters
* an "area" of that region. As an example, if there are 5 tiles in a row
* with region ID 2 and the event steps on tile 1, the common event or
* page commands will run, but tiles 2, 3, 4, and 5 will not execute any
* logic until the event steps off a tile with that region ID and steps
* back on another tile with that region.
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var EventRegionCommonEvent = module.Zevia.EventRegionCommonEvent = {};
    var COMMENT_CODE = 108;

    EventRegionCommonEvent.initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        this._executedRegionEvents = {};
        EventRegionCommonEvent.initialize.call(this, mapId, eventId);
    };

    Game_Event.prototype.hasRunRegionEvent = function(regionId) {
        return this._executedRegionEvents[regionId];
    };

    Game_Event.prototype.regionCommonEvent = function() {
        var regionCommonEvent = $dataMap.events[this._eventId].meta.regionCommonEvent;
        if (!regionCommonEvent) { return; }

        var regionAndEventIds = regionCommonEvent.split(',');
        if (regionAndEventIds.length !== 2) { return; }

        var regionId = this.regionId();
        if (regionId === parseInt(regionAndEventIds[0])) {
            if (!this.hasRunRegionEvent(regionId)) {
                $gameTemp.reserveCommonEvent(parseInt(regionAndEventIds[1]));
                this._executedRegionEvents[regionId] = true;
            }
        } else {
            this._executedRegionEvents[regionId] = false;
        }
    };

    Game_Event.prototype.doesNotHaveRegionCondition = function(page) {
        var firstItem = page.list[0];
        return (firstItem.code !== COMMENT_CODE) || (firstItem.parameters[0].indexOf('regionCondition') === -1);
    };

    EventRegionCommonEvent.meetsConditions = Game_Event.prototype.meetsConditions;
    Game_Event.prototype.meetsConditions = function(page) {
        return EventRegionCommonEvent.meetsConditions.call(this, page) &&
            this.doesNotHaveRegionCondition(page);
    };

    Game_Event.prototype.regionConditions = function() {
        var pages = this.event().pages;
        var hasRegionPage = false;
        for (var i = pages.length - 1; i >= 0; i--) {
            var currentPage = pages[i];
            if (!EventRegionCommonEvent.meetsConditions.call(this, currentPage)) { continue; }

            var firstItem = currentPage.list[0];
            if (firstItem.code !== COMMENT_CODE) { continue; }

            var regionCondition = firstItem.parameters[0].match(/<regionCondition:(\s?|\s+?)\d+(\s+?|\s?)>/);
            if (!regionCondition) { continue; }

            var regionId = regionCondition[0].match(/\d+/);
            if (!regionId) { continue; }

            if (this.regionId() === parseInt(regionId[0])) {
                hasRegionPage = true;
                this._pageIndex = i;
                this.setupPage();
            }
        }

        var regionId = this.regionId();
        if (!hasRegionPage) {
            this._executedRegionEvents[regionId] = false;
        } else if (!this.hasRunRegionEvent(regionId)) {
            Object.keys(this._executedRegionEvents).forEach(function(id) {
                this._executedRegionEvents[id] = false;
            }.bind(this));
            this._executedRegionEvents[regionId] = true;
            this._interpreter = new Game_Interpreter();
            this._interpreter.setup(this.list(), this._eventId);
        }
    };

    EventRegionCommonEvent.update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        if (!this.isMoving()) {
            this.regionCommonEvent();
            this.regionConditions();
        }
        EventRegionCommonEvent.update.call(this);
    };
})(window);

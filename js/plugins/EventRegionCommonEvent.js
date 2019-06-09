/*:
* @plugindesc Allows events to have notes that indicate if they move to a region Id, they should call a common event or act as a page condition to auto-execute.
* @author Zevia
*
* @help In the event's note box (next to its name in the top), make a comment with
* the format <regionCommonEvent: x, y>, where x is the region ID and y is the
* number of the common event to call if the event moves onto the specified
* region ID.
*
* IMPORTANT: By default, this functionality is tied to Switch 15, so that it
* only works if that switch is ON. Ensure that when you want the common event
* functionality to work, you have turned the corresponding Switch ON. You can
* change the switch number in the Plugin parameters.
*
* Alternatively, if you put a comment at the top of a page's list of commands
* with the format <regionCondition: x>, where x is the region ID, then that
* page will execute whenever the event moves onto a tile with that ID.
*
* You can optionally add comma-separated regions to indicate that the page
* should run for any of those regions, such as <regionCondition: 1, 2, 3>
* indicating that the page condition applies to any of those regions.
*
* Note that a comment with the text "<regionCondition: x>" must be the first
* command at the top of a page. When using regionCondition, all other
* conditions for the page must also be met in order to execute that page's
* logic.
*
* In both cases, the event will only fire the first time the event enters
* an "area" of that region. As an example, if there are 5 tiles in a row
* with region ID 2 and the event steps on tile 1, the common event or
* page commands will run, but tiles 2, 3, 4, and 5 will not execute any
* logic until the event steps off a tile with that region ID and steps
* back on another tile with that region.
*
* If using comma-separated regions for a single page, each unique
* region ID is considered a separate "area" for the above functionality.
*
* @param switchNumber
* @text Enable Region Common Events
* @desc If this switch number is ON, then the common events for region IDs in the note box of an event will run.
* @type switch
* @default 15
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var EventRegionCommonEvent = module.Zevia.EventRegionCommonEvent = {};
    var COMMENT_CODE = 108;

    var regionCommonEventSwitchNumber = parseInt(PluginManager.parameters('EventRegionCommonEvent').switchNumber);
    if (isNaN(regionCommonEventSwitchNumber)) {
        throw new Error(
            'Configuration Error: EventRegionCommonEvent requires a valid switch number to be' +
            ' specified in the setup parameters'
        );
    }

    EventRegionCommonEvent.initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        this._executedRegionEvents = {};
        EventRegionCommonEvent.initialize.call(this, mapId, eventId);
    };

    Game_Event.prototype.hasRunRegionEvent = function(regionId) {
        return this._executedRegionEvents[regionId];
    };

    Game_Event.prototype.regionCommonEvent = function() {
        if (!$gameSwitches.value(regionCommonEventSwitchNumber)) { return; }

        var regionCommonEvent = $dataMap.events[this._eventId].meta.regionCommonEvent;
        if (!regionCommonEvent) { return; }

        var regionAndEventIds = regionCommonEvent.split(',');
        if (regionAndEventIds.length !== 2) { return; }

        var regionId = this.regionId();
        if (regionId === parseInt(regionAndEventIds[0])) {
            if (!this._hasRunCommonEvent) {
                $gameTemp.reserveCommonEvent(parseInt(regionAndEventIds[1]));
                this._hasRunCommonEvent = true;
            }
        } else {
            this._hasRunCommonEvent = false;
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
        var regionId = this.regionId();
        for (var i = pages.length - 1; i >= 0; i--) {
            var currentPage = pages[i];
            if (!EventRegionCommonEvent.meetsConditions.call(this, currentPage)) { continue; }

            var firstItem = currentPage.list[0];
            if (firstItem.code !== COMMENT_CODE) { continue; }

            var regionCondition = firstItem.parameters[0].match(/<regionCondition:(.*)>/);
            if (!regionCondition) { continue; }

            var regionIds = regionCondition[1];
            if (!regionIds) { continue; }

            var allIds = regionIds.match(/\d+/g);
            if (!allIds) { continue; }

            for (var j = 0; j < allIds.length; j++) {
                if (regionId === parseInt(allIds[j])) {
                    hasRegionPage = true;
                    this._pageIndex = i;
                    this.setupPage();
                    break;
                }
            }
        }

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

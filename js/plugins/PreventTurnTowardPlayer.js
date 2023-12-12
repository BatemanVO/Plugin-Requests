/*:
* @plugindesc When events are interacted with on the Map, stops the behavior where they turn towards the player.
* @author Zevia
*
* @help When an event would normally turn towards the player and be "locked" in
* place, the event will no longer turn towards the player if its name has
* the text "[NOTURN]" in it. As an example, if you have an event named
* "EV004 [NOTURN]", then it will not turn towards the player when interacted
* with.
*
* This Plugin will likely have compatibility issues with other Plugins that
* overwrite the lock functionality on Game_Event. You can try loading this
* Plugin first to see if that fixes any issues, but if not, a compatibility
* patch will need to be applied.
*/

(function(module) {
    module.Zevia = module.Zevia || {};
    var PreventTurnTowardPlayer = module.Zevia.PreventTurnTowardPlayer = {};

    PreventTurnTowardPlayer.lock = Game_Event.prototype.lock;
    Game_Event.prototype.lock = function() {
        if (!this._locked) {
            this._prelockDirection = this.direction();
            if (!$dataMap.events[this._eventId].name.match(/\[NOTURN\]/i)) {
                this.turnTowardPlayer();
            }
            this._locked = true;
        }
    }
})(window);

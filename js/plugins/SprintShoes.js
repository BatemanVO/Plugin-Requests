/*:
* @plugindesc Allows the equipping and unequipping of an item to change
* the player's overworld movement speed
*
* @help In the notes box of an equippable item, put <changeMovementSpeed: x>, where
* x is an Integer between 1 and 6. "Normal" move speed in the default engine
* is 4, with higher numbers being faster and lower numbers being slower.

* If an item that changes movement speed is removed, the player's speed is returned
* to the default of 4.
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};
    var DEFAULT_MOVE_SPEED = 4;

    Zevia.equipItemOk = Scene_Equip.prototype.onItemOk;
    Scene_Equip.prototype.onItemOk = function() {
        const item = this._itemWindow.item();
        if (item && item.meta && item.meta.changeMovementSpeed) {
            $gamePlayer.isItemSpeedAffected = true;
            $gamePlayer.setMoveSpeed(parseInt(item.meta.changeMovementSpeed));
        } else if ($gamePlayer.isItemSpeedAffected) {
            $gamePlayer.setMoveSpeed(DEFAULT_MOVE_SPEED);
            $gamePlayer.isItemSpeedAffected = false;
        }
        Zevia.equipItemOk.call(this);
    };
})(window);

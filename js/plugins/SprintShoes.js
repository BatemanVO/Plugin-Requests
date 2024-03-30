/*:
* @plugindesc Allows the equipping and unequipping of an item to change
* the player's overworld movement speed
* @author Zevia
*
* @help In the notes box of an equippable item, put <changeMovementSpeed: x>, where
* x is an Integer between 1 and 6. "Normal" move speed in the default engine
* is 4, with higher numbers being faster and lower numbers being slower.

* The highest speed of all changeMovementSpeed items will be applied to the party.
* If the party is not wearing any changeMovementSpeed items, a default speed of
* 4 will be set.
* If the highest speed of all changeMovementSpeed items is less than 4, that value
* will still be used.
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};
    var DEFAULT_MOVE_SPEED = 4;

    Zevia.equipItemOk = Scene_Equip.prototype.onItemOk;
    Scene_Equip.prototype.onItemOk = function() {
        Zevia.equipItemOk.call(this);
        var highestItemMoveSpeed = Math.max.apply(null, $gameParty.members().reduce(function(moveSpeeds, member) {
            return moveSpeeds.concat(member.equips().map(function(item) {
                return (item && item.meta && item.meta.changeMovementSpeed && parseInt(item.meta.changeMovementSpeed)) || 0;
            }));
        }, []));
        $gamePlayer.setMoveSpeed(highestItemMoveSpeed || DEFAULT_MOVE_SPEED);
    };
})(window);

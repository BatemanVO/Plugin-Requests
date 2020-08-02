/*:
* @plugindesc Allows the user to tag items as usable only by a specific actor.
* @author Zevia
*
* @help In the note box of an item, add <actorRestricted: x> where x is the Id
* of the actor that's allowed to use the item.
* Additional actors can be specified with comma separation. For example,
* <actorRestricted: 1, 4> would mean only actors 1 and 4 can use the item.
* If an actor cannot use the item, it will be greyed out in the item menu.
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};

    Zevia.isItemEnabled = Window_ItemList.prototype.isEnabled;
    Window_ItemList.prototype.isEnabled = function(item) {
        return Zevia.isItemEnabled.call(this, item) &&
            (
                !item.meta ||
                !item.meta.actorRestricted ||
                !BattleManager.actor() ||
                item.meta.actorRestricted.split(',').map(function(actorId) {
                    return parseInt(actorId.replace(/\s+/, ''));
                }).indexOf(BattleManager.actor().actorId()) !== -1
            );
    };
})(window);

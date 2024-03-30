/*:
* @plugindesc Allows specifying a custom modifier to the price
* of an item for a given shop via comments
* @author Zevia
*
* @help Before a shop processing command in a window, add comments in the
* format "customSellModifier: itemCategory, itemId, modifier".
* For example:
* customSellModifier: item, 1, 2
* customSellModifier: weapon, 3, 1.5
* customSellModifier: armor, 4, 0.1
* itemCategory MUST be either item, weapon, or armor.
* The default modifier for selling items is 0.5, meaning an item
* sells for half its purchase price. So with the above examples,
* in a default project, Potion would sell for double its buy
* price, Sword would sell for 50% over its buy price, and
* Ring would sell for 10% of its buy price.
*
* All customSellModifiers should be entered as separate comments,
* but as many as desired can be added in as many comments before
* the shop processing command as desired. Comments after
* the shop processing command won't be recognized.
*
* customSellModifiers are cleared after a shop interaction
* completes / when the Scene_Shop is popped.
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};
    var itemTypeByProperty = {
        atypeId: 'armor',
        itypeId: 'item',
        wtypeId: 'weapon'
    };

    Zevia.commentCommand = Game_Interpreter.prototype.command108;
    Game_Interpreter.prototype.command108 = function() {
        var parts = this._params[0].split('customSellModifier:')[1];
        if (!parts) { return Zevia.commentCommand.call(this); }

        var parameters = parts.split(',');
        if (parameters.length !== 3) { return Zevia.commentCommand.call(this); }

        var itemType = parameters[0].replace(/[^a-zA-Z]/g, '');
        var data = ({
            armor: $dataArmors,
            item: $dataItems,
            weapon: $dataWeapons
        })[itemType];
        if (!data) { return Zevia.commentCommand.call(this); }

        var itemId = parameters[1].replace(/\D/g, '');
        var item = data[itemId];
        if (!item) { return Zevia.commentCommand.call(this); }

        var modifier = Number(parameters[2].replace(/[^\d.]/g, ''));
        if (isNaN(modifier)) { return Zevia.commentCommand.call(this); }

        $gameParty.sellModifierByItemIdByItemType = Object.assign(
            $gameParty.sellModifierByItemIdByItemType || {},
            {
                [itemType]: {
                    [itemId]: modifier
                }
            }
        )
        return Zevia.commentCommand.call(this);
    };

    Zevia.sellingPrice = Scene_Shop.prototype.sellingPrice;
    Scene_Shop.prototype.sellingPrice = function() {
        var properties = ['atypeId', 'itypeId', 'wtypeId'];
        var itemType;
        for (let i = 0; i < properties.length; i++) {
            var property = properties[i];
            if (this._item[property]) {
                itemType = itemTypeByProperty[property];
                break;
            }
        }
        if (!itemType) { return Zevia.sellingPrice.call(this); }

        var modifierByItemId = $gameParty.sellModifierByItemIdByItemType[itemType];
        if (!modifierByItemId) { return Zevia.sellingPrice.call(this); }

        var modifier = modifierByItemId[this._item.id];
        if (!modifier && modifier !== 0) { return Zevia.sellingPrice.call(this); }

        return Math.floor(this._item.price * modifier);
    };

    Zevia.popScene = SceneManager.pop;
    SceneManager.pop = function() {
        if (this._scene instanceof Scene_Shop) {
            $gameParty.sellModifierByItemIdByItemType = {};
        }
        Zevia.popScene.call(this);
    };
})(window);

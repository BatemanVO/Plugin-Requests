/*:
* @plugindesc Sets a switch to ON if the party bought something in a shop,
* then to OFF whenever a new shop interaction starts.
* @author Zevia
*
* @help Specify the number of the switch to be reserved for confirming whether the
* party bought something in a shop.
* Whenever the shop Scene is initiated, the switch is set to OFF. If something
* is purchased, the switch is set to ON.
*
* @param switchNumber
* @text Confirm Buy Switch Number
* @type switch
* @desc The switch number to set ON if an item is purchased or
* OFF if not
* @default 15
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};

    var switchNumber = parseInt(PluginManager.parameters('ConfirmShopBuy').switchNumber);
    if (isNaN(switchNumber)) {
        throw new Error(
            'Configuration Error: ConfirmShopBuy requires a valid switch number to be' +
            ' specified in the setup parameters'
        );
    }
    Zevia.SceneShopCreate = Scene_Shop.prototype.create;
    Scene_Shop.prototype.create = function() {
        Zevia.SceneShopCreate.call(this);
        $gameSwitches.setValue(switchNumber, false);
    };

    Zevia.SceneShopBuy = Scene_Shop.prototype.doBuy;
    Scene_Shop.prototype.doBuy = function(number) {
        Zevia.SceneShopBuy.call(this, number);
        $gameSwitches.setValue(switchNumber, true);
    }
})(window);

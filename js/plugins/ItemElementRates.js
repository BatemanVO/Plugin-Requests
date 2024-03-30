/*:
* @plugindesc Allows specifying element rates on equipment such
* that equipped items can affect element offense and defense.
* @author Zevia
*
* @help In the notes box of an equippable item, put <elementOffense: x, y> or
* <elementDefense: x, y> where x is the Id of the element and y is the rate
* to apply as a percentage where 100 means no modifier.
*
* As an example, on a weapon in a default project, <elementOffense: 2, 150>
* would mean that the weapon increases fire damage of all abilities by 50%.
* On an armor, <elementDefense: 2, 10> would mean fire damage is decreased
* by 90% (that is, fire damage taken is reduced to 10%).
* Multiple elementOffense and elementDefense tags can be added to the same
* item and each one will be calculated multiplicatively with any other
* element rate modifiers such as states and traits.
*
* For example, a weapon with <elementOffense: 2, 150> AND
* <elementDefense: 2, 10> would mean that equipping that weapon
* increases all fire damage that actor does by 50% and reduces all
* fire damage that actor takes by 90%.
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};

    var calculateEquipElementRate = function(property, equips, rate, elementId) {
        return equips.reduce(function(elementRate, equip) {
            if (!equip || !equip.meta || !equip.meta[property]) { return elementRate; }
            var values = equip.meta[property].split(',');
            if (Number(values[0].match(/\d+/)) !== elementId) { return elementRate; }
            return elementRate * (values[1].match(/\d+/) / 100);
        }, rate);
    };

    Zevia.targetElementRate = Game_BattlerBase.prototype.elementRate;
    Game_BattlerBase.prototype.elementRate = function(elementId, subject) {
        var rate = Zevia.targetElementRate.call(this, elementId);
        if (subject && subject.equips) {
            return calculateEquipElementRate('elementOffense', subject.equips(), rate, elementId);
        }
        if (!this.equips) { return rate; }
        return calculateEquipElementRate('elementDefense', this.equips(), rate, elementId);
    };

    Zevia.calcElementRate = Game_Action.prototype.calcElementRate;
    Game_Action.prototype.calcElementRate = function(target) {
        var rate = Zevia.calcElementRate.call(this, target);
        var elementId = this.item().damage.elementId;
        if (elementId < 0 || !this.subject().equips) { return rate; }

        return calculateEquipElementRate('elementOffense', this.subject().equips(), rate, elementId);
    };

    Zevia.elementsMaxRate = Game_Action.prototype.elementsMaxRate;
    Game_Action.prototype.elementsMaxRate = function(target, elements) {
        var maxRate = Zevia.elementsMaxRate.call(this, target, elements);
        var subject = this.subject();
        if (!subject.equips || !elements.length) { return maxRate; }

        return Math.max.apply(null, elements.map(function(elementId) {
            return target.elementRate(elementId, subject);
        }, this).concat(maxRate));
    };
})(window);

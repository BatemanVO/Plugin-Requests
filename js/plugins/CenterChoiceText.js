/*:
* @plugindesc Centers text used in Show Choice event commands
* @author Zevia
*
* @help Causes all text drawn using the Show Choice command to be centered.
* This plugin is likely not compatible with other plugins that modify the
* drawItem function of Window_ChoiceList. You can try placing this Plugin
* above other Plugins that modify it for compatibility, but otherwise,
* it will require a compatibility fix / enhancement.
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var CenterChoiceText = module.Zevia.CenterChoiceText = {};

    CenterChoiceText.drawItem = Window_ChoiceList.prototype.drawItem;
    Window_ChoiceList.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        this.drawTextEx(
            this.commandName(index),
            ((this.width - this.textWidthEx(this.commandName(index))) / 2) - this.standardPadding(),
            rect.y
        );
    };
})(window);

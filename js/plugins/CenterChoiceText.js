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
        var text = this.commandName(index);
        this.drawTextEx(
            text,
            ((this.width - this.textWidthEx(text)) / 2) - this.standardPadding(),
            this.itemRectForText(index).y
        );
    };
})(window);

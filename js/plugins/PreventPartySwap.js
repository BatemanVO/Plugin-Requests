/*:
* @plugindesc Allows a variable and switch to specify an actor Id to be "locked"
* to the party such that they cannot be moved with the change party command
* @author Zevia
*
* @help If the switch number configured in the parameters is set to ON, then
* the actor whose Id matches the actorId variable configured in the
* parameters cannot be moved from their position in the party.
*
* By default, the switch is switch number 15 and the unmovable actor is
* actor 1.
*
* @param switchNumber
* @text Prevent swap switch #
* @type switch
* @desc The switch number to set ON if the actorId cannot be removed
* from the party
* @default 15
*
* @param actorId
* @text Actor Id to lock to party
* @type number
* @desc The Id of the actor who can't be swapped
* @default 1
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};
    var parameters = PluginManager.parameters('PreventPartySwap');
    var switchNumber = parseInt(parameters.switchNumber);
    var actorId = parseInt(parameters.actorId);
    [switchNumber, actorId].forEach(function(requiredParameter, index) {
        if (isNaN(requiredParameter)) {
            throw new Error(
                'Configuration Error: PreventPartySwap requires a valid switch number and actorId to be' +
                ' specified in the setup parameters, but ' + requiredParameter + ' is not a valid value'
            );
        }
    });

    Zevia.menuProcessOk = Window_MenuStatus.prototype.processOk;
    Window_MenuStatus.prototype.processOk = function() {
        if ($gameSwitches.value(switchNumber) && $gameParty.members()[this.index()].actorId() === actorId) {
            SoundManager.playBuzzer();
            return;
        }
        Zevia.menuProcessOk.call(this);
    };
})(window);

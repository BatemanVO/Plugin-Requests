/*:
* @plugindesc Allows a user to specify a switch to use to indicate whether a Map's BGM should
* continue to play after battle end. If the switch is ON, it will not play.
* @author Zevia
*
* @help Specify a switch in the setup, then whenever that switch is ON, the BGM on the
* Map will stop after the battle is over. If a victory ME is enabled, it will stop the Map
* music from playing after the victory ME. If a victory ME is not enabled, it will stop
* the Map music from playing as soon as the battle processes its end.
*
* @param switchNumber
* @text Stop Map BGM Switch
* @type switch
* @default 20
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var StopMapBgm = module.Zevia.stopMapBgm = {};

    var stopSwitch = parseInt(PluginManager.parameters('StopMapBgm').switchNumber);
    if (isNaN(stopSwitch)) {
        throw new Error('The switch specified needs to be an Integer, please check the Plugin settings for StopMapBgm');
    }

    StopMapBgm.replayBattleBgsAndBgm = BattleManager.replayBgmAndBgs;
    BattleManager.replayBgmAndBgs = function() {
        if ($gameSwitches._data[stopSwitch]) {
            BattleManager._mapBgm = null;
        }
        StopMapBgm.replayBattleBgsAndBgm.call(BattleManager);
    };
})(window);

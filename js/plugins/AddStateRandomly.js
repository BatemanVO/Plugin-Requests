/*:
* @plugindesc Allows the user to add a state by ID to a random living member in a troop, the party, or both.
* @author Zevia
*
* @help In a script command, call one of the following, where x is the ID of the state
* you want to add:
* - "$gameTroop.addStateRandomly(x)" to add the state to a random living enemy
* - "$gameParty.addStateRandomly(x)" to add the state to a random living party
*      member in the combat party
* - "$gameTroop.addStateRandomlyToAll(x)" to add the state to a random living
*      enemy or party member
*
* @param shouldFilter
* @type boolean
* @desc Whether enemies already afflicted should be ignored. If true and all living enemies are afflicted, nothing happens.
* @default true
*/

(function() {
    'use strict';

    var shouldFilter = !!PluginManager.parameters('AddStateRandomly').shouldFilter.match(/true/i);

    function addStateRandomly(stateId, members) {
        var aliveMembers = members.filter(function(member) {
            return !shouldFilter || !member.isStateAffected(stateId);
        });

        if (!aliveMembers.length) { return; }
        aliveMembers[Math.floor(Math.random() * aliveMembers.length)].addState(stateId);
    }

    Game_Party.prototype.addStateRandomly = function(stateId) {
        addStateRandomly.call(this, stateId, this.battleMembers().filter(function(member) {
            return member.isAlive();
        }));
    }

    Game_Troop.prototype.addStateRandomly = function(stateId) {
        addStateRandomly.call(this, stateId, this.aliveMembers());
    };

    Game_Troop.prototype.addStateRandomlyToAll = function(stateId) {
        addStateRandomly.call(this, stateId, this.aliveMembers().concat($gameParty.battleMembers().filter(function(member) {
            return member.isAlive();
        })));
    }
})();

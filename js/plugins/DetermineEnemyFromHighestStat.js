/*:
* @plugindesc Provides Script call to get an enemy based on the highest stat provided.
* @author Zevia
*
* @help Set aside a variable to store the Ids of every enemy that's been defeated.
* The default is 19, but can be changed in the Plugin configuration.
* Whenever an enemy dies, its Id will be added to the collection of enemy Ids
* stored in that variable.
* Use a script command with the following code to get the property of an
* enemy with the highest value based on its parameters:
* Zevia.getEnemyPropertyByHighestValue()
* OR
* Zevia.getEnemyPropertyByHighestValue(x, y)
* where x is the parameter Id you want to compare for defeated enemies and
* y is the property of the enemy you want, as a String. For example:
* Zevia.getEnemyPropertyByHighestValue(0, 'name')
* would return the name of the defeated enemy with the highest MHP.
* If x and y are not provided, the default values are 0 (MHP) and 'name'.
* Parameter Ids map to enemy properties as values:
* 0: mhp
* 1: mmp
* 2: atk
* 3: def
* 4: mat
* 5: mdf
* 6: agi
* 7: luk
*
* Additional examples:
* Get the experience value of the defeated enemy with the highest MMP:
* Zevia.getEnemyPropertyByHighestValue(1, 'exp')
* Get the gold of the defeated enemy with the highest luk:
* Zevia.getEnemyPropertyByHighestValue(7, 'gold')

* @param defeatedEnemiesVariable
* @text Defeated Enemy Ids Variable
* @type variable
* @desc The variable used to store the Ids of every defeated enemy
* @default 19
*/

(function(module) {
    'use strict';

    var Zevia = module.Zevia || {};
    module.Zevia = Zevia;

    var parameters = PluginManager.parameters('DetermineEnemyFromHighestStat');
    var defeatedEnemiesVariable = parseInt(parameters.defeatedEnemiesVariable);

    Zevia.getEnemyPropertyByHighestValue = function(paramId, enemyProperty) {
        const parameterId = paramId || 0;
        const property = enemyProperty || 'name';
        const defeatedEnemyIds = $gameVariables.value(defeatedEnemiesVariable) || [];
        if (defeatedEnemyIds.length === 0) {
            return '';
        }
        if (defeatedEnemyIds.length === 1) {
            return $dataEnemies[defeatedEnemyIds[0]][property];
        }
        return defeatedEnemyIds.reduce((highestEnemyId, enemyId) => {
            const highestEnemy = $dataEnemies[highestEnemyId];
            const enemy = $dataEnemies[enemyId];
            return (highestEnemy && highestEnemy.params[parameterId] >= enemy.params[parameterId]) ? highestEnemy : enemy;
        })[property] || '';
    };

    Zevia.enemyDie = Game_Enemy.prototype.die;
    Game_Enemy.prototype.die = function() {
        Zevia.enemyDie.call(this);
        const defeatedEnemyIds = $gameVariables.value(defeatedEnemiesVariable) || [];
        if (defeatedEnemyIds.indexOf(this._enemyId) === -1) {
            $gameVariables.setValue(defeatedEnemiesVariable, defeatedEnemyIds.concat(this._enemyId));
        }
    };
})(window);

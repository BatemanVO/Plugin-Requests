/*:
* @plugindesc Skips the fight/escape menu at the start of each turn.
* @author Zevia
*
* @help This plugin will cause the party menu where you choose fight or escape
* to be skipped at the start of each turn. The Escape command will be moved
* to the end of the command menu. The Escape command can be removed altogether
* by changing the "Add Escape Command" parameter in the configuration.
*
* The formation command can also be added at the end of the menu, just above
* "Escape", if "Add Formation Command" is checked. You can also enable it in
* the game, but temporarily disable it by turning on and off the switch
* specified in the configuration. By default, it's switch 20.
*
* @param isEscapeEnabled
* @text Add Escape Command
* @type boolean
* @desc Whether the Escape command will be added to the actor's command list or not
* @default true
*
* @param isFormationEnabled
* @text Add Formation Command
* @type boolean
* @desc Whether the Formation command will be added to the actor's command list or not
* @default false
*
* @param disableFormationSwitch
* @text Switch number that, if on, disables formation in battle
* @type switch
* @default 20
*
* @param shouldDisablePartyMenu
* @text Disable Party Menu
* @type boolean
* @desc Prevent the User from going back to the Fight/Escape menu by hitting the escape key.
* @default true
*/

(function(module) {
    'use strict';

    module.Zevia = module.Zevia || {};
    var SkipPartyMenu = module.Zevia.SkipPartyMenu = {};
    var ESCAPE_SYMBOL = 'escape';
    var FORMATION_SYMBOL = 'formation';
    var parameters = PluginManager.parameters('SkipPartyMenu');
    var isEscapeEnabled = !!parameters.isEscapeEnabled.match(/true/i);
    var isFormationEnabled = !!parameters.isFormationEnabled.match(/true/i);
    var disableFormationSwitch = parseInt(parameters.disableFormationSwitch);
    var shouldDisablePartyMenu = !!parameters.shouldDisablePartyMenu.match(/true/i);

    SkipPartyMenu.shouldPreventCancelMenu = function() {
        return shouldDisablePartyMenu &&
            (
                BattleManager._actorIndex < 1 ||
                (BattleManager.isSTB && BattleManager.isSTB()) ||
                (BattleManager.isATB && BattleManager.isATB())
            );
    };

    // Compatibility fixes for Yanfly BattleEngineCore
    if (typeof(Yanfly) !== 'undefined' && Yanfly.BEC) {
        SkipPartyMenu.needsSelection = Game_Action.prototype.needsSelection;
        Game_Action.prototype.needsSelection = function() {
            return this.item() && SkipPartyMenu.needsSelection.call(this);
        }

        SkipPartyMenu.checkItemScope = Game_Action.prototype.checkItemScope;
        Game_Action.prototype.checkItemScope = function(list) {
            return this.item() && SkipPartyMenu.checkItemScope.call(this, list);
        };
    }

    SkipPartyMenu.startBattlerInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        SkipPartyMenu.startBattlerInput.call(this);
        if (BattleManager.isSTB && BattleManager.isSTB()) { return; }

        BattleManager.selectNextCommand();
    };

    Scene_Battle.prototype.setFormationMode = function(isForming) {
        this._isForming = isForming;
    };
    Scene_Battle.prototype.resetFormationSelections = function() {
        this._actorWindow._pendingIndex = null;
    };

    SkipPartyMenu.onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        if (!this._isForming) {
            SkipPartyMenu.onActorOk.call(this);
            return;
        }
        this._actorWindow.activate();

        SoundManager.playOk();
        if (!this._actorWindow._pendingIndex && this._actorWindow._pendingIndex !== 0) {
            this._actorWindow._pendingIndex = this._actorWindow.index();
            this._actorWindow.refresh();
        } else {
            $gameParty.swapOrder(this._actorWindow._pendingIndex, this._actorWindow.index());
            this._actorWindow.hide();
            BattleManager.changeActor(BattleManager._actorIndex, 'waiting');
            this._actorCommandWindow.activate();
            this._actorWindow.deactivate();
            this._skillWindow._actor = $gameParty.battleMembers()[BattleManager._actorIndex];
            this.setFormationMode(false);
            this._statusWindow.refresh();
            const swappedMember = $gameParty.battleMembers()[this._actorWindow.index()];
            swappedMember.deselect();
            swappedMember.setActionState('undecided');
        }
    };

    SkipPartyMenu.onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        if (!this._isForming) {
            SkipPartyMenu.onActorCancel.call(this);
            return;
        }
        this._actorWindow.hide();
        this.setFormationMode(false);
        this.resetFormationSelections();
    };

    Scene_Battle.prototype.addEscapeCommand = function() {
        if (!isEscapeEnabled) { return; }

        this._actorCommandWindow.setHandler(ESCAPE_SYMBOL, function() {
            BattleManager.actor()._actionState = '';
            if (!BattleManager.processEscape() && BattleManager.isATB && BattleManager.isATB()) {
                BattleManager._phase = 'atb';
                SceneManager._scene._actorCommandWindow.deactivate();
            }
        });
    };

    Scene_Battle.prototype.addFormationCommand = function() {
        if (!isFormationEnabled) { return; }

        this._actorCommandWindow.setHandler(FORMATION_SYMBOL, () => {
            this.resetFormationSelections();
            this.setFormationMode(true);
            this.selectActorSelection();
        });
    };

    SkipPartyMenu.createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        SkipPartyMenu.createActorCommandWindow.call(this);
        this.addEscapeCommand();
        this.addFormationCommand();
    };

    SkipPartyMenu.changeInputWindow = Scene_Battle.prototype.changeInputWindow;
    Scene_Battle.prototype.changeInputWindow = function() {
        if (!shouldDisablePartyMenu) {
            SkipPartyMenu.changeInputWindow.call(this);
            return;
        }

        if (BattleManager.isInputting()) {
            if (!BattleManager.actor()) {
                BattleManager._actorIndex = 0;
                BattleManager.actor().setActionState('inputting');
            }
            this.startActorCommandSelection();
        } else {
            this.endCommandSelection();
        }
    };

    Window_BattleActor.prototype.drawItemBackground = Window_MenuStatus.prototype.drawItemBackground;

    SkipPartyMenu.drawActorWindowItem = Window_BattleActor.prototype.drawItem;
    Window_BattleActor.prototype.drawItem = function(index) {
        SkipPartyMenu.drawActorWindowItem.call(this, index);
        this.drawItemBackground(index);
    };

    SkipPartyMenu.makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        SkipPartyMenu.makeCommandList.call(this);
        if (!this._actor) { return; }
        if (isFormationEnabled) {
            this.addCommand(TextManager.formation, FORMATION_SYMBOL, !$gameSwitches.value(disableFormationSwitch));
        }
        if (isEscapeEnabled) {
            this.addCommand(TextManager.escape, ESCAPE_SYMBOL, BattleManager.canEscape());
        }
    };

    SkipPartyMenu.processCancel = Window_ActorCommand.prototype.processCancel;
    Window_ActorCommand.prototype.processCancel = function() {
        if (SkipPartyMenu.shouldPreventCancelMenu()) { return; }
        SkipPartyMenu.processCancel.call(this);
    };
})(window);

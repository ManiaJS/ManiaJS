/**
 * Mode Game Flow
 */

import {App} from '../App';
import {Model} from 'sequelize';
import {Game} from './index';

/**
 * Maps game flow class.
 *
 * @class Maps
 * @type {Maps}
 */
export class Mode {

  private facade: Game.Facade;
  private app: App;

  public gameMode: number;
  public scriptName: string;

  constructor(facade: Game.Facade) {
    this.facade = facade;
    this.app = facade.app;
  }

  public async boot() {
    this.gameMode = this.app.server.currentMode();
    // TODO: Current script name.
    // this.scriptName = this.app.server.currentScript();
  }

  /**
   * Begin map call.
   *
   * @param uid
   */
  public async begin(uid) {
    // Copy current to see if it's changed.
    let currentMode = this.gameMode;
    let currentScript = this.scriptName;

    let newMode = this.app.server.currentMode();
    let newScript = this.app.server.currentScript();
    if (newMode !== currentMode) {
      // Game Mode changed, send the event to all listeners.
      this.app.server.emit('mode.change', [currentMode, newMode]);

      // Set new mode in context.
      this.gameMode = newMode;
    }

    // TODO: Script change (script.change).
  }

  /**
   * Change gamemode to new legacy mode.
   * @param mode
   */
  public async changeTo (mode: number) {
    await this.app.server.send().custom('SetGameMode', [mode]).exec();
  }

  // TODO: Set script name
}

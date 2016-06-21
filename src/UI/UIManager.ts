/**
 * UI Manager
 */

import {EventEmitter} from 'events';
import {App} from '../App';
import {Interface} from './Interface';
import {UI} from './index';

/**
 * UI Manager
 *
 * @class UIManager
 * @type {UIManager}
 *
 * @property {App} app
 *
 * @property {Map} interfaces  Player Specifics Interfaces.
 */
export class UIManager extends EventEmitter {

  private facade: UI.Facade;
  private app: App;
  private interfaces: Map<string, Interface>;

  private interval: any;

  constructor (facade: UI.Facade) {
    super();
    this.setMaxListeners(0);

    this.facade = facade;
    this.app = facade.app;

    this.interfaces = new Map();

    // Update Interval
    this.interval = null;
  }

  /**
   * Execute when server is started. (run mode).
   */
  public start () {
    // Callbacks
    this.app.server.on('player.disconnect', (player) => this.playerDisconnect(player));
  }

  /**
   * Called on player disconnect.
   *
   * @param player
   */
  public playerDisconnect(player) {
    // Try to cleanup player's data in UI's.
    for (let [id, ui] of this.interfaces) {
      if (ui.playerData.hasOwnProperty(player.login)) {
        ui.destroy([player.login], true);
      }
    }
  }

  /**
   * Update Interface.
   *
   * @param {InterfaceBuilder} ui
   * @param {boolean} force Force update to all players?
   * @param {[]}      logins Array with logins to send to (better for performance).
   *
   * @returns {Promise}
   */
  public update (ui, force, logins) {
    if (! this.interfaces.has(ui.id)) {
      this.interfaces.set(ui.id, ui);
    }

    let sendLogins = logins.slice(0);
    let sendForce  = force ? true : false;

    ui.forceUpdate = false;
    ui.playersChanged = [];

    // Update the UI ID!
    return this.sendInterface(ui, sendForce, sendLogins);
  }

  /**
   * Will send UI, parse the (players)data.
   * @param {InterfaceBuilder} ui
   * @param {boolean} force Force update to all players?
   * @param {[]}      updateLogins Array with logins to send to (better for performance).
   *
   * @returns {Promise}
   */
  public async sendInterface (ui: Interface, force: boolean, updateLogins: string[]) {
    var data    = {}; // Holds all global data.
    var players = []; // Holds login.

    var send    = '';

    // Global Data
    data = ui.globalData;

    // Player specific, or global?
    if (Object.keys(ui.playerData).length > 0) {
      // Per player data, only send to the players.
      if (force) {
        players = Object.keys(ui.playerData);
      } else {
        players = updateLogins;
      }
    }

    // Foreach or global?
    if (players.length > 0) {
      // Player specific.

      try {
        for (let login of players) {
          let sendData = Object.assign({}, data, ui.playerData[login]);

          send =  '<manialink ';
          if(ui.version == 2)
            send += ' version="2"';
          send += 'id="' + ui.id + '">';
          send += ui.template(sendData);
          send += '</manialink>';

          await this.app.server.send().custom('SendDisplayManialinkPageToLogin', [login, send, ui.timeout, ui.hideClick]).exec();

          // If scripted, disable alt menu for players.
          if (this.app.server.isScripted()) {
            this.app.server.send().script('LibXmlRpc_DisableAltMenu', login).exec(); // TODO: Enable on some time.
          }

          sendData = null;
        }
      } catch (err) {
        send = null;
        data = null;
        this.app.log.error(err);
        throw err;
      }
    } else {
      try {
        // Global
        send =  '<manialink ';
        if(ui.version == 2)
          send += ' version="2"';
        send += 'id="'+ui.id+'">';
        send += ui.template(data);
        send += '</manialink>';

        await this.app.server.send().custom('SendDisplayManialinkPage', [send, ui.timeout, ui.hideClick]).exec();

        send = null;
        data = null;
        players = null;
      } catch (err) {
        send = null;
        data = null;
        players = null;
        this.app.log.error(err);
        throw err;
      }
    }
  }

  /**
   * Destroy ManiaLink ID for logins or global.
   *
   * @param {string} id ManiaLink ID.
   * @param {string[]|boolean} [logins] Array with logins, or false for all.
   * @param {boolean} [hide] Hide at client, default false.
   */
  public destroy (id, logins?, hide?) {
    logins = logins || false;
    hide = hide || false;

    let send = '<manialink id="' + id + '"></manialink>';

    // Remove from map.
    if (this.interfaces.has(id)) {
      this.interfaces.delete(id);
    }

    // Enable alt menu after closing.
    if (logins && this.app.server.isScripted()) {
      logins.forEach((login) => {
        this.app.server.send().script('LibXmlRpc_EnableAltMenu', login).exec();
      });
    }

    if (hide) {
      if (logins)
        return this.app.server.send().custom('SendDisplayManialinkPageToLogin', [logins.join(','), send, 0, false]).exec();
      return this.app.server.send().custom('SendDisplayManialinkPage', [send, 0, false]).exec();
    }
  }

  /**
   * ManiaLink Answer Event.
   *
   * @param {object} params
   * @param {number} params.playerid
   * @param {string} params.login
   * @param {string} params.answer
   * @param {[]}     params.entries
   */
  public answer (params) {
    // Emit event on manager.
    if (params.answer.indexOf('core_button_') === 0) {
      this.emit(params.answer.substr(12), params); // Only get the last bit if it's a core button.
    } else if (params.answer.indexOf('|') !== -1) {
      // Is ListView action!
      this.emit(params.answer.substr(0, params.answer.indexOf('|')), params);
    } else {
      // Normal UI event.
      this.emit(params.answer, params);
    }
    return Promise.resolve();
  }
}

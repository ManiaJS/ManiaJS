/**
 * UI Manager
 */
'use strict';

import * as hash from 'object-hash';
import * as async from 'async';

import { EventEmitter } from 'events';

/**
 * UI Manager
 *
 * @class UIManager
 *
 * @property {App} app
 *
 * @property {Map} interfaces  Player Specifics Interfaces.
 */
export default class extends EventEmitter {

  constructor (app) {
    super();
    this.setMaxListeners(0);

    this.app = app;

    this.interfaces = new Map();

    // Update Interval
    this.interval = null;
  }

  /**
   * Execute when server is started. (run mode).
   */
  start () {
    // Callbacks
    this.app.server.on('player.disconnect', (player) => this.playerDisconnect(player));
  }

  /**
   * Called on player disconnect.
   *
   * @param player
   */
  playerDisconnect(player) {
    // Try to cleanup player's data in UI's.
    this.interfaces.forEach((ui) => {
      if (ui.playerData.hasOwnProperty(player.login)) {
        ui.destroy([player.login], true);
      }
    });
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
  update (ui, force, logins) {
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
  sendInterface (ui, force, updateLogins) {
    return new Promise((resolve, reject) => {
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

        async.eachSeries(players, (login, callback) => {
          let sendData = Object.assign({}, data, ui.playerData[login]);

          send =  '<manialink ';
          if(ui.version == 2)
            send += ' version="2"';
          send += 'id="' + ui.id + '">';
          send += ui.template(sendData);
          send += '</manialink>';

          this.app.server.send().custom('SendDisplayManialinkPageToLogin', [login, send, ui.timeout, ui.hideClick]).exec()
            .then (()    => {
              sendData = null;
              return callback();
            })
            .catch((err) => {
              sendData = null;
              return callback(err);
            });
        }, (err) => {
          send = null;
          data = null;

          if (err) {
            return reject(err);
          }
          return resolve();
        });
      } else {


        // Global
        send =  '<manialink ';
        if(ui.version == 2)
          send += ' version="2"';
        send += 'id="'+ui.id+'">';
        send += ui.template(data);
        send += '</manialink>';

        this.app.server.send().custom('SendDisplayManialinkPage', [send, ui.timeout, ui.hideClick]).exec()
          .then (()    => {
            send = null;
            data = null;
            players = null;
            return resolve();
          })
          .catch((err) => {
            send = null;
            data = null;
            players = null;
            return reject(err);
          });
      }
    });
  }

  /**
   * Destroy ManiaLink ID for logins or global.
   *
   * @param {string} id ManiaLink ID.
   * @param {string[]|boolean} [logins] Array with logins, or false for all.
   * @param {boolean} [hide] Hide at client, default false.
   */
  destroy (id, logins, hide) {
    logins = logins || false;
    hide = hide || false;

    let send = '<manialink id="' + id + '"></manialink>';

    // Remove from map.
    if (this.interfaces.has(id)) {
      this.interfaces.delete(id);
    }

    if (hide) {
      if (logins) {
        return this.app.server.send().custom('SendDisplayManialinkPageToLogin', [logins.join(','), send, 0, false]).exec();
      }
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
  answer (params) {
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

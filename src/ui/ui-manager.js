/**
 * UI Manager
 */
import * as hash from 'object-hash';

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

  }


  /**
   * Update Interface.
   *
   * @param {InterfaceBuilder} ui
   */
  update (ui) {
    if (! this.interfaces.has(ui.id)) {
      this.interfaces.set(ui.id, ui);
    }

    // Update the UI ID!
    this.sendInterface(ui);
  }


  /**
   * Will send UI, parse the (players)data.
   * @param {InterfaceBuilder} ui
   * @returns {Promise}
   */
  sendInterface (ui) {
    return new Promise((resolve, reject) => {
      var data    = {}; // Holds all global data.
      var players = []; // Holds login.

      var send    = '';


      // Global Data
      data = Object.assign(data, ui.globalData);

      // Player specific, or global?
      if (Object.keys(ui.playerData).length > 0) {
        // Per player data, only send to the players.
        players = Object.keys(ui.playerData);
      }

      // Foreach or global?
      if (players.length > 0) {
        // Player specific.
        players.forEach((login) => {
          let sendData =  Object.assign(data, ui.playerData[login]);

          send =  '<manialink ';
          if(ui.version == 2)
            send += ' version="2"';
          send += 'id="'+ui.id+'">';
          send += ui.template(sendData);
          send += '</manialink>';

          this.app.server.send().custom('SendDisplayManialinkPageToLogin', [login, send, 0, false]).exec()
            .then (()    => {
              return resolve();
            })
            .catch((err) => {
              return reject(err);
            });
        });
      } else {
        // Global
        send =  '<manialink ';
        if(ui.version == 2)
          send += ' version="2"';
        send += 'id="'+ui.id+'">';
        send += ui.template(data);
        send += '</manialink>';

        this.app.server.send().custom('SendDisplayManialinkPage', [send, 0, false]).exec()
          .then (()    => {
            return resolve();
          })
          .catch((err) => {
            return reject(err);
          });
      }
    });
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
    this.emit(params.answer, params);
    return Promise.resolve();
  }
}

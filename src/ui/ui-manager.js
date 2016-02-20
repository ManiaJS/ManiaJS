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
          send += 'id="'+ui.id+'">';
          send += ui.template(sendData);
          send += '</manialink>';

          this.app.server.send().custom('SendDisplayManialinkPageToLogin', [login, send, 0, false]).exec()
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

        this.app.server.send().custom('SendDisplayManialinkPage', [send, 0, false]).exec()
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

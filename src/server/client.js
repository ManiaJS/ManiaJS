'use strict';
/**
 * Client Manager - Will connect to the maniaplanet server
 */
import Gbx from 'gbxremote';
import { EventEmitter } from 'events';

import CallbackManager from './callback-manager';
import CommandManager from './command-manager';
import Send from './send';

/**
 * Server Client.
 * @class ServerClient
 *
 * @function {Send} send
 *
 * @property {object} game
 * @property {object} game.CurrentGameInfos
 * @property {number} game.CurrentGameInfos.GameMode
 * @property {object] game.NextGameInfos
 * @property {number} game.NextGameInfos.GameMode
 */
export default class extends EventEmitter {

  /**
   * Prepare the client. parse configuration and pass it to the gbx client.
   *
   * @param {App} app context
   */
  constructor(app) {
    super();

    this.setMaxListeners(0);

    this.app = app;
    this.gbx = null;
    /** @type {CallbackManager} */
    this.callback = null;

    /** @type {CommandManager} */
    this.command = null;

    this.server = app.config.server;

    // Server properties
    this.titleId = null;
    this.version = null;
    this.build = null;
    this.apiVersion = null;

    this.login = null;
    this.name = null;
    this.comment = null;
    this.path = null;
    this.ip = null;
    this.ports = {};
    this.playerId = null;

    // Current Game Name, 'trackmania' or 'shootmania'.
    this.gameName = app.config.server.game || 'trackmania';

    this.options = {}; // Will be the result of GetServerOptions() call to the mp server.
    this.game = {}; // Will be the result of GetGameInfo() call.
  }

  /**
   * Build a sending query.
   *
   * @returns {Send}
   */
  send() {
    return new Send(this.app, this);
  }

  /**
   * Connect to the server.
   *
   * @returns {Promise}
   */
  connect() {
    this.app.log.debug("Connecting to ManiaPlanet Server...");

    return new Promise( (resolve, reject) => {
      this.gbx = Gbx.createClient(this.server.port, this.server.address);

      // On Connect
      this.gbx.on('connect', () => {
        this.app.log.debug('Connection to ManiaPlanet server successful!');

        if (this.app.config.hasOwnProperty('debug') && this.app.config.debug) {
          this.gbx.on('callback', (method, params) => {
            this.app.log.debug("GBX: Callback '" + method + "':", params);
          });
        }
        return resolve();
      });

      // On Error
      this.gbx.on('error', (err) => {
        console.error(err.name);
        this.app.log.fatal(err.stack);
        return reject(err);
      });

    }).then(() => {
      // Authentication
      return this.gbx.query('Authenticate', [this.server.authentication.username, this.server.authentication.password]);
    }).then(() => {
      // Set API Version
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully authenticated!");
      return this.gbx.query('SetApiVersion', ['2015-02-10']);
    }).then(() => {
      // Set Callbacks On
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully set api version!");

      return this.gbx.query('EnableCallbacks', [true]);
    }).then(() => {
      // Get server information
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully enabled callbacks!");
      // Send boot msg
      this.send().chat("$o$f90Mania$z$o$f90JS$z$fff: Booting Controller...").exec();

      // Hide all current ManiaLinks
      this.gbx.query('SendHideManialinkPage', []);

      return this.gbx.query('GetVersion', []);
    }).then((res) => {
      // Get System Info
      this.app.log.debug("Connection to ManiaPlanet Server, Getting information...!");

      this.version = res.Version;
      this.build = res.Build;
      this.apiVersion = res.ApiVersion;

      return this.gbx.query('GetSystemInfo', []);
    }).then((res) => {
      // Get Detailed Server Player Information (about the server player).
      this.ip = res.PublishedIp;
      this.ports = {port: res.Port, P2PPort: res.P2PPort};
      this.titleId = res.TitleId;
      this.login = res.ServerLogin;
      this.playerId = res.ServerPlayerId;

      return this.gbx.query('GetDetailedPlayerInfo', [this.login]);
    }).then((res) => {
      // Get server options
      this.path = res.Path;

      return this.getServerOptions();
    }).then((options) => {
      this.name = options.Name;
      this.comment = options.Comment;
      this.options = options;
    }).then(() => {
      // Get game info
      return this.getGameInfos();
    }).then((info) => {
      this.game = info;
    });
  }

  /**
   * Register the Callbacks.
   *
   * @return {Promise}
   */
  register() {
    this.app.log.debug('Registering callbacks...');
    return new Promise((resolve) => {
      this.callback = new CallbackManager(this.app, this);
      this.command = new CommandManager(this.app, this);

      this.callback.loadSet('maniaplanet');

      if (1==1) { // TODO: Check if trackmania
        this.callback.loadSet('trackmania');
      }

      return resolve();
    });
  }

  /**
   * Update information about the server.
   *
   * @return {Promise}
   */
  updateInfos() {
    // Update
    return this.getServerOptions()
      .then(() => this.getGameInfos());
  }

  /**
   * Is Current mode scripted?
   *
   * @returns {boolean}
   */
  isScripted() {
    return this.game.CurrentGameInfos.GameMode === 0 || false;
  }

  /**
   * Get Current Mode Integer, try to convert script name to game mode integer.
   * @returns {number}
   */
  currentMode() {
    if (this.isScripted()) {
      // TODO: Script => legacy integers.
    }
    return this.game.CurrentGameInfos.GameMode;
  }


  /**
   * Get Options of server.
   *
   * @returns {Promise}
   */
  getServerOptions() {
    return new Promise((resolve, reject) => {
      this.gbx.query('GetServerOptions', []).then((res) => {
        // Update properties.
        this.name = res.Name;
        this.comment = res.Comment;
        this.options = res;

        return resolve(res);
      }).catch((err) => reject(err));
    });
  }

  /**
   * Get GetGameInfos call info. Will also update current server.game infos.
   *
   * @returns {Promise}
   */
  getGameInfos() {
    return new Promise((resolve, reject) => {
      this.gbx.query('GetGameInfos', []).then((res) => {
        this.game = res;
        return resolve(res);
      }).catch((err) => reject(err));
    });
  }

}

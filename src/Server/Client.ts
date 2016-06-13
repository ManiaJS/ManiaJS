/**
 * Client Manager - Will connect to the maniaplanet server
 */
declare var GbxClient; // TODO: Propper fix gbxremote loading..

import {Client as GbxClient} from 'gbxremote';

import {EventEmitter} from 'events';
import * as fs from 'fs';

import {CallbackManager} from './CallbackManager';
import {CommandManager} from './CommandManager';
import {Send} from './Send';
import {App} from '../App';
import {Server} from './index';

export class Client extends EventEmitter {
  private app: App;
  private facade: Server.Facade;

  public gbx: any;
  public command: CommandManager;
  public callback: CallbackManager;

  public server;

  public titleId: string;
  public version: string;
  public build: string;
  public apiVersion: string;
  public login: string;
  public name: string;
  public comment: string;
  public path: string;
  public ip: string;
  public ports: {port?: number, P2PPort?: number};
  public playerId: string; // TODO: Number?

  public paths: {
    data: string,
    maps: string,
    skins: string
  };

  public gameName: string;

  public options: any;
  public game: any;

  /**
   * Prepare the client. parse configuration and pass it to the gbx client.
   */
  constructor(facade: Server.Facade) {
    super();
    this.setMaxListeners(0);

    this.facade = facade;
    this.app = facade.app;

    this.gbx = null;
    /** @type {CallbackManager} */
    this.callback = null;

    /** @type {CommandManager} */
    this.command = null;

    this.server = this.app.config.config.server;

    // Current Game Name, 'trackmania' or 'shootmania'.
    this.gameName = this.app.config.config.server.game || 'trackmania';

    this.options = {}; // Will be the result of GetServerOptions() call to the mp server.
    this.game = {}; // Will be the result of GetGameInfo() call.
  }

  /**
   * Build a sending query.
   *
   * @returns {Send}
   */
  public send(): Send {
    return new Send(this.facade);
  }

  /**
   * Connect to the server.
   *
   * @returns {Promise}
   */
  public async connect() {
    this.app.log.debug("Connecting to ManiaPlanet Server...");

    this.gbx = new GbxClient(this.server.port, this.server.address);

    // Connect to ManiaPlanet
    await this.gbx.connect();

    // Debug all callbacks.
    if (this.app.config.config.hasOwnProperty('debug') && this.app.config.config.debug) {
      this.gbx.on('callback', (method, params) => {
        this.app.log.debug("GBX: Callback '" + method + "':", params);
      });
    }

    // On gbx error.
    this.gbx.on('error', (err) => {
      this.app.log.fatal(err.stack);

      if (err.message === 'read ECONNRESET') {
        this.app.log.fatal('Connection with ManiaPlanet server lost!');
        process.exit(1);
      }
    });

    // Authenticate, set api version, set callbacks on.
    try {
      await this.gbx.query('Authenticate', [this.server.authentication.username, this.server.authentication.password]);
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully authenticated!");
      await this.gbx.query('SetApiVersion', ['2015-02-10']);
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully set api version!");
      await this.gbx.query('EnableCallbacks', [true]);
      this.app.log.debug("Connection to ManiaPlanet Server, Successfully enabled callbacks!");

      // Send booting message to chat.
      await this.send().chat("$o$f90Mania$o$f90JS$z$fff$s: Booting Controller...").exec();
      // Hide all current ManiaLinks
      await this.gbx.query('SendHideManialinkPage');

      // Version Information
      let versionInfo = await this.gbx.query('GetVersion');
      this.version = versionInfo.Version;
      this.build = versionInfo.Build;
      this.apiVersion = versionInfo.ApiVersion;

      // System Information
      let systemInfo = await this.gbx.query('GetSystemInfo');
      this.ip = systemInfo.PublishedIp;
      this.ports = {port: systemInfo.Port, P2PPort: systemInfo.P2PPort};
      this.titleId = systemInfo.TitleId;
      this.login = systemInfo.ServerLogin;
      this.playerId = systemInfo.ServerPlayerId;

      // Get Detailed Server Player Information (about the server player).
      let serverPlayerInfo = await this.gbx.query('GetDetailedPlayerInfo', [this.login]);
      this.path = serverPlayerInfo.Path;

      // Update server options.
      await this.getServerOptions();

      // Update game infos.
      await this.getGameInfos();

      // Get directories
      this.paths = await this.getServerDirectories();

      // Test writing files (test if we have access to the directories).
      if (! fs.existsSync(this.paths.data))
        throw new Error('ManiaJS could not find the ManiaPlanet data dir! Is ManiaJS running on the same machine?');
      fs.accessSync(this.paths.data);

      // If scripted? Then enable scripted callbacks
      if (this.isScripted()) {
        this.app.log.debug('Enabling Scripted Callbacks...');

        let settings = await this.gbx.query('GetModeScriptSettings');
        if (! settings) {
          throw new Error('No ScriptSettings received!');
        }

        // Add callback listener.
        if (! settings.hasOwnProperty('S_UseScriptCallbacks')) {
          return; // Ignore and continue.
        }

        settings['S_UseScriptCallbacks'] = true;

        // TODO: Floats.
        console.log(settings);

        // Set and resolve, BUG: will throw error, type error.
        await this.gbx.query('SetModeScriptSettings', [settings]);

        let newSettings = await this.gbx.query('GetModeScriptSettings', []);
        // TODO
      }
    } catch (err) {
      this.app.log.fatal(err);
      process.exit(1);
    }
  }

  /**
   * Register the Callbacks.
   *
   * @return {Promise}
   */
  public async register() {
    this.app.log.debug('Registering callbacks...');

    this.callback = new CallbackManager(this.facade);
    this.command = new CommandManager(this.facade);

    this.callback.loadSet('maniaplanet');

    if (this.app.config.config.server.game === 'trackmania')
      this.callback.loadSet('trackmania');
  }

  /**
   * Update information about the server.
   *
   * @return {Promise}
   */
  public async updateInfos() {
    // Update
    return this.getServerOptions()
      .then(() => this.getGameInfos());
  }

  /**
   * Is Current mode scripted?
   *
   * @returns {boolean}
   */
  public isScripted(): boolean {
    return this.game.CurrentGameInfos.GameMode === 0 || false;
  }

  /**
   * Get Current Mode Integer, try to convert script name to game mode integer.
   * @returns {number}
   */
  public currentMode(): number {
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
  public async getServerOptions(): Promise<any> {
    let res = await this.gbx.query('GetServerOptions');
    this.name = res.Name;
    this.comment = res.Comment;
    this.options = res;

    return res;
  }

  /**
   * Get GetGameInfos call info. Will also update current server.game infos.
   *
   * @returns {Promise}
   */
  public async getGameInfos(): Promise<any> {
    let res = await this.gbx.query('GetGameInfos');
    this.game = res;

    return res;
  }

  /**
   * Get Server Directories.
   * @returns Promise promise with object: data, maps, skins.
   */
  public async getServerDirectories(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gbx.query('system.multicall', [[
        {methodName: 'GameDataDirectory', params: []},
        {methodName: 'GetMapsDirectory', params: []},
        {methodName: 'GetSkinsDirectory', params: []}
      ]]).then((results) => {
        return resolve({data: results[0][0], maps: results[1][0], skins: results[2][0]});
      }).catch((err) => {
        return reject(err);
      });
    });
  }
}

export enum Game {
  trackmania, shootmania
}

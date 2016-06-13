/**
 * Interface Building Class, will trigger the template engine and fill with data.
 */

import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import {App} from '../App';
import {UI} from './index';

/**
 * Interface Class
 *
 * @class Interface
 * @type {Interface}
 *
 * @property {{}|null} plugin Plugin Context, null if not running in plugin!
 * @property {string}  templatePath Template Base Path.
 *
 * @property {[]|boolean} players Player Logins, false for global (all players).
 * @property {{}|null} template Handlebars Template Instance.
 * @property {{}} data Handlebars Data.
 */
export class Interface {

  private app: App;
  private facade: UI.Facade;

  public id: any;

  public plugin: any;
  public file: string;
  public version: number;
  public template: HandlebarsTemplateDelegate = null;

  public timeout: number = 0;
  public hideClick: boolean = false;
  public listeners: Array<{ action: string, callback: Function }> = [];

  public globalData: any = {};
  public playerData: {[s: string]: any} = {};

  public forceUpdate: boolean = true;
  public playersChanged: Array<any> = [];

  /**
   * Construct the Interface.
   * @param {UI.Facade} facade
   * @param {string} viewFile View File.
   * @param {{}} [plugin] Plugin Context, optional, only when calling from plugin.
   * @param {number} [version] ManiaLink Version, defaults to 2.
   * @param {string} [idSuffix] Unique ID Suffix. Optional, But give when interface is for one player only!
   */
  constructor (facade: UI.Facade, viewFile, plugin, version, idSuffix) {
    this.facade = facade;
    this.app = facade.app;

    plugin = plugin || false;
    version = version || 2;
    idSuffix = idSuffix || '';

    // ManiaLink ID.
    this.id = (plugin ? plugin.name : 'core') + '__' + viewFile.substr(viewFile.lastIndexOf('/')+1);
    if (idSuffix) {
      this.id += idSuffix;
    }

    this.plugin = plugin;
    this.file = viewFile;
    this.version = version;

    // Directly compile (sync).
    this.compile();
  }

  /**
   * Compile the template view file.
   */
  public compile () {
    try {
      let source = fs.readFileSync(this.file, 'utf-8');
      this.template = Handlebars.compile (source);
    } catch (err) {
      this.app.log.error('Error with loading/compiling view (' + this.file + ').: ', err);
    }
  }

  /**
   * Set Data for the template.
   * @param {{}} data
   *
   * @returns {Interface}
   */
  public global (data): this {
    this.globalData = data;

    this.forceUpdate = true;
    return this;
  }

  /**
   * Set Data for the template, for a specific player.
   * @param {string} login Player Login.
   * @param {{}} [data] Data. Indexed by Player Logins.
   *
   * @returns {Interface}
   */
  public player (login: string, data?: any): this {
    data = data || {};

    this.playerData[login] = data;

    this.playersChanged.push(login);
    return this;
  }

  /**
   * Update/Display interface.
   *
   * @see update
   * @returns {*}
   */
  public async display () {
    return this.update();
  }

  /**
   * Update Interface. Will send update to the client(s).
   */
  public async update () {
    return this.app.uiFacade.manager.update(this, this.forceUpdate, this.playersChanged);
  }

  /**
   * Hide the current ManiaLink.
   * @param {string[]|boolean} [logins] Optional logins to hide the interface. Ignore or false for all players.
   * @returns {Promise}
   */
  public async hide (logins?: string[]) {
    logins = logins || null;
    return this.app.uiFacade.manager.destroy(this.id, logins);
  }

  /**
   * Destroy data and hide manialink. This will clear the data arrays! Please use this when you want to cleanup!
   * @param {string[]} [logins] Optional logins, when provided we will not clear global data!.
   * @param {boolean} [noHide] Optional, don't send empty manialink to hide, default false.
   * @returns {Promise}
   */
  public async destroy (logins?: string[], noHide?: boolean) {
    logins = logins || null;
    noHide = noHide || null;

    // Cleanup.
    if (! logins) {
      this.playerData = [];
      this.globalData = [];
    } else {
      logins.forEach((login) => {
        delete this.playerData[login];
      });
    }

    // Remove listeners
    this.removeAllListeners();

    // Destroy at manager (and hide).
    return this.app.uiFacade.manager.destroy(this.id, logins, noHide === null);
  }

  /**
   * Remove all listeners from manager.
   */
  public removeAllListeners() {
    this.listeners.forEach((listener) => {
      this.app.uiFacade.manager.removeListener(listener.action, listener.callback);
    });
  }

  /**
   * On Answer.
   * @param {string} action Action Name.
   * @param {callback} callback Callback.
   * @params {object} callback.data
   */
  public on (action: string, callback: Function) {
    this.listeners.push({action: action, callback: callback});

    this.app.uiFacade.manager.on(action, callback);
  }

  /**
   * Once Answer.
   * @param {string} action Action Name.
   * @param {callback} callback Callback.
   * @params {object} callback.data
   */
  public once (action: string, callback: Function) {
    this.listeners.push({action: action, callback: callback});

    this.app.uiFacade.manager.once(action, callback);
  }
}

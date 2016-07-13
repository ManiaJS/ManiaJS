/**
 * UI Facade
 */

import * as path from 'path';
import {BaseFacade} from '../Util/Facade';
import {UIManager} from './UIManager';
import {Interface} from './Interface';
import {GenericInterface} from './GenericInterface';
import {ListView} from './Generic/ListView';
import {Configuration} from '../Util/Configuration';
import {App} from '../App';

/**
 * UI Facade
 *
 * @class UIFacade
 * @type {UIFacade}
 *
 * @property {{}}           interfaces      Interfaces, indexed by player login.
 * @property {UIManager|{}} manager         UI Manager
 */
export module UI {
  export class Facade extends BaseFacade {

    public manager: UIManager;
    public generic: GenericInterface;

    constructor (
      app: App
    ) {
      super(app);

      this.manager = new UIManager(this);
      this.generic = new GenericInterface(this);
    }

    public async init() {

    }

    public async run() {
      await this.manager.start();
    }

    public async stop() {

    }


    /**
     * Get a builder instance.
     *
     * @param {{}} context Give the plugin class, or app class (for core).
     * @param {string} viewName View File Name.
     * @param {number} [version] Optional manialink version (defaults to 2)
     * @param {string} [idSuffix] Optional unique id suffix.
     * @returns {Interface}
     */
    public build (context: any, viewName: string, version?: number, idSuffix?: string): Interface {
      version = version || 2;
      idSuffix = idSuffix || '';

      // Determinate if running from plugin.
      var plugin = false;
      var contextName = 'core';
      var baseDirectory = __dirname + '/view/';

      if (context.hasOwnProperty('directory')) {
        plugin = context;
        contextName = context.name || 'unknown';
        baseDirectory = context.directory + '/view/';
      }

      if (! viewName.endsWith('.hbs')) {
        viewName += '.hbs';
      }

      let ui = new Interface(this, path.normalize(baseDirectory + viewName), plugin, version, idSuffix);

      // Make sure we register the UI at the ui manager with the contextstring.
      this.manager.registerContextInterface (context, ui);

      return ui;
    }


    /**
     * Prepare List Interface for given column metadata, and given data. To Display, do .display().
     *
     * => Click on column > subscribe on events you provided with the event in columns.
     * => Returning parameter will be the record on that position.
     *
     * When close is called the view will be vanished automatically! But you still need to cleanup your variables!
     * When next/prev is called, the data will be automatically sliced and used. (the events will still be called).
     *
     * @param {string} title Title of list.
     * @param {string} player Player Login (single login!).
     * @param {[{name: {string}, field: {string}, width: {number}, [level]: {number}, [event]: {string}}]} columns Columns to define.
     * @param {[{}]} data Array with objects. Give a custom manialink with the 'custom' key. This will be injected into the row!
     *
     * @returns {ListView} ListView Interface on success!
     */
    public list (title: string, player: string, columns: any,
                 data: any): ListView { // TODO: Column type!
      return this.generic.list(title, player, columns, data);
    }

    /**
     * Prepare and make Alert interface. To display call .display() on the result.
     *
     * @param {string} title Title Text
     * @param {string} message Message Text
     * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
     * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
     * @param {string} [button] Button text, default 'OK'
     * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
     * @param {string} [iconsubstyle] Icon Sub Style, default 'Editor'
     *
     * @returns {Interface} Interface Object, call .display() to display to the login(s).
     */
    public alert (title: string, message: string, players: string | string[],
                  size?: string, button?: string, iconstyle?: string, iconsubstyle?: string): Interface {
      return this.generic.alert(title, message, players, size, button, iconstyle, iconsubstyle);
    }

    /**
     * Prepare and make Confirm interface. To display call .display() on the result.
     * To get answer, subscribe on the interface with .once('core_button_yes', function()); or core_button_no
     *
     * @param {string} title Title Text
     * @param {string} message Message Text
     * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
     * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
     * @param {string} [buttonYes] Button text, default 'Yes'
     * @param {string} [buttonNo] Button text, default 'No'
     * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
     * @param {string} [iconsubstyle] Icon Sub Style, default 'Options'
     *
     * @returns {Interface} Interface Object, call .display() to display to the login(s).
     */
    public confirm (title: string, message: string, players: string | string[],
                    size?: string, buttonYes?: string, buttonNo?: string,
                    iconstyle?: string, iconsubstyle?: string): Interface {
      return this.generic.confirm(title, message, players, size, buttonYes, buttonNo, iconstyle, iconsubstyle);
    }
  }
}

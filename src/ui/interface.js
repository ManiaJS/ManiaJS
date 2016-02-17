/**
 * Interface Building Class, will trigger the template engine and fill with data.
 */
'use strict';

import * as fsp from 'fs-promise';
import * as path from 'path';

import * as Handlebars from 'handlebars';

/**
 * Interface Builder Class
 *
 * @class InterfaceBuilder
 *
 * @property {{}|null} plugin Plugin Context, null if not running in plugin!
 * @property {string}  templatePath Template Base Path.
 *
 * @property {[]|boolean} players Player Logins, false for global (all players).
 * @property {{}|null} template Handlebars Template Instance.
 * @property {{}} data Handlebars Data.
 */
export default class {

  /**
   * Construct the Interface Builder.
   * @param {App} app App Context.
   * @param {UIFacade} facade UI Facade.
   * @param {string} templatePath Template Base Path.
   * @param {{}} [plugin] Plugin Context, optional, only when calling from plugin.
   */
  constructor (app, facade, templatePath, plugin) {
    plugin = plugin || false;

    this.facade = facade;
    this.app = app;
    this.plugin = plugin;
    this.base = path.normalize(templatePath);

    this.players = false;
    this.template = null;
    this.templateName = null;
    this.data = {};
  }

  /**
   * Load in the template file.
   *
   * @param templateName
   * @param {{}} [data] Optional data to pass (could be inserted later too)
   *
   * @returns {Promise}
   */
  load (templateName, data) {
    data = data || false;

    if (! templateName.endsWith('.hbs')) {
      templateName += '.hbs';
    }
    if (data) {
      this.data = data;
    }
    this.templateName = templateName;

    return new Promise((resolve, reject) => {
      fsp.readFile(this.templatePath, 'utf8').then((source) => {
        this.template = Handlebars.compile(source, { noEscape: true });
        return resolve(this);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  /**
   * Set Data for the template.
   * @param {{}} data
   *
   * @returns {InterfaceBuilder}
   */
  data (data) {
    this.data = Object.assign(this.data, data);
    return this;
  }

  /**
   * Send Player Logins. Empty players or parameters for all players.
   *
   * @param {[]|boolean} [players] Give false or ignore for all players.
   *
   * @returns {InterfaceBuilder}
   */
  players (players) {
    players = players || false;
    players = Array.isArray(players) ? players : false;
    this.players = players;
    return this;
  }

  /**
   * Send the data to the client. (Or update when already send to the client)
   * This will trigger a recompile of all the parts for sending, will also trigger a update asap!
   *
   * @param {{}} [data] Provide (extra) data.
   *
   * @returns {InterfaceBuilder}
   */
  update (data) {
    if (data) {
      this.data = Object.assign(this.data, data);
    }

    // Add to the manager, the manager will make sure the ui is being created or updated the right way!.
    this.facade.manager.add(this);

    return this;
  }
}

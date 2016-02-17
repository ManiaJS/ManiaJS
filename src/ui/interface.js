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
 * @property {{}|null} template Handlebars Template Instance.
 * @property {{}} data Handlebars Data.
 */
export default class {

  /**
   * Construct the Interface Builder.
   * @param {App} app App Context.
   * @param {UIFacade} ui UI Facade.
   * @param {string} templatePath Template Base Path.
   * @param {{}} [plugin] Plugin Context, optional, only when calling from plugin.
   */
  constructor (app, ui, templatePath, plugin) {
    plugin = plugin || false;

    this.app = app;
    this.plugin = plugin;
    this.base = path.normalize(templatePath);

    this.template = null;
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

    return new Promise((resolve, reject) => {
      fsp.readFile(this.templatePath, 'utf8').then((source) => {
        this.template = Handlebars.compile(source, {noEscape: true});
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
   * Send the data to the client. (Or update when already send to the client)
   * This will trigger a recompile of all the parts for sending, will also trigger a update asap!
   *
   * @param {{}} [data] Provide (extra) data.
   * @param {[]} [players] Player logins to send UI to, empty or false for all.
   */
  update (players, data) {
    players = players || false;
    players = Array.isArray(players) ? players : [];

    if (data) {
      this.data = Object.assign(this.data, data);
    }


  }
}

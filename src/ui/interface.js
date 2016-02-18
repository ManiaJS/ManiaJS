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
   * @param {string} viewFile View File.
   * @param {{}} [plugin] Plugin Context, optional, only when calling from plugin.
   */
  constructor (app, facade, viewFile, plugin) {
    plugin = plugin || false;

    this.facade = facade;
    this.app = app;
    this.plugin = plugin;
    this.file = viewFile;

    this.template = null;

    // Add the interface to the compile stack.
    facade.stack.push(this);
  }

  /**
   * Compile the template view file.
   *
   * @returns {Promise}
   */
  compile () {
    return fsp.readFile(this.file, 'utf-8').then((source) => {
      this.template = Handlebars.compile (source);
    });
  }

  /**
   * Set Data for the template.
   * @param {{}} data
   *
   * @returns {InterfaceBuilder}
   */
  global (data) {
    this.data = Object.assign(this.data, data);
    return this;
  }

  player (login, data) {

  }


  update () {

  }

}

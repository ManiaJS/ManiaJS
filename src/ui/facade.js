/**
 * UI Facade
 */
'use strict';

import * as path from 'path';
import * as async from 'async';

import Facade from './../lib/base-facade';

import UIManager from './ui-manager';
import InterfaceBuilder from './interface';
import GenericInterface from './generic';


/**
 * UI Facade
 *
 * @class UIFacade
 *
 * @property {{}}           interfaces      Interfaces, indexed by player login.
 * @property {UIManager|{}} manager         UI Manager
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.manager = new UIManager(app);
    this.generic = new GenericInterface(app);

    this.stack = [];
  }

  /**
   * Prepare Component
   *
   * @return {Promise}
   */
  init() {
    return Promise.resolve();
  }

  /**
   * Run Component
   * @return {Promise}
   */
  run() {
    // Starting, will start the loop for checking and updating UI.
    this.manager.start();

    return Promise.resolve();
  }

  /**
   * Get a builder instance.
   *
   * @param {{}} context Give the plugin class, or app class (for core).
   * @param {string} viewName View File Name.
   * @param {number} [version] Optional manialink version (defaults to 2)
   */
  build(context, viewName, version) {
    version = version || 2;

    // Determinate if running from plugin.
    var plugin = false;
    var baseDirectory = __dirname + '/view/';

    if (context.hasOwnProperty('directory')) {
      plugin = context;
      baseDirectory = context.directory + '/view/';
    }

    if (! viewName.endsWith('.hbs')) {
      viewName += '.hbs';
    }

    return new InterfaceBuilder(this.app, this, path.normalize(baseDirectory + viewName), plugin, version);
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
   * @returns {InterfaceBuilder} Interface Object, call .display() to display to the login(s).
   */
  alert(title, message, players, size, button, iconstyle, iconsubstyle) {
    return this.generic.alert(title, message, players, size, button, iconstyle, iconsubstyle);
  }
}

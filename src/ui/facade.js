/**
 * UI Facade
 */
'use strict';

import * as path from 'path';
import * as async from 'async';

import Facade from './../lib/base-facade';

import UIManager from './ui-manager';
import InterfaceBuilder from './interface';


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

    // Add callback to disconnect action.
    this.app.server.on('player.disconnect', (player) => this.manager.disconnect(player));

    return Promise.resolve();
  }

  /**
   * Compile templates.
   * @returns {Promise}
   */
  compile() {
    // Compile the templates
    this.app.log.debug('Compiling UI Templates...');

    return new Promise((resolve, reject) => {
      try {
        async.each(this.stack, (ui, callback) => {
          ui.compile()
            .then(() => callback())
            .catch((err) => callback(err));
        }, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * Get a builder instance.
   *
   * @param {{}} context Give the plugin class, or app class (for core).
   * @param {string} viewName View File Name.
   */
  build(context, viewName, version = null) {
    // Determinate if running from plugin.
    var plugin = false;
    var baseDirectory = __dirname + '/../view/';

    if (context.hasOwnProperty('directory')) {
      plugin = context;
      baseDirectory = context.directory + '/view/';
    }

    if (! viewName.endsWith('.hbs')) {
      viewName += '.hbs';
    }

    return new InterfaceBuilder(this.app, this, path.normalize(baseDirectory + viewName), plugin, version);
  }

}

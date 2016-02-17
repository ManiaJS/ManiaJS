/**
 * UI Facade
 */
'use strict';

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
   * Get a builder instance.
   *
   * @param {{}} context Give the plugin class, or app class (for core).
   */
  build(context) {
    // Determinate if running from plugin.
    var plugin = false;
    var baseDirectory = __dirname + '/../view/';

    if (context.hasOwnProperty('directory')) {
      plugin = context;
      baseDirectory = context.directory + '/view/';
    }

    return new InterfaceBuilder(this.app, this, baseDirectory, plugin);
  }

}

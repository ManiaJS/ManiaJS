'use strict';

import Facade from './../lib/base-facade';

import Client from './client';

/**
 * Database Facade
 *
 * @class DatabaseFacade
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.client = new Client(app, app.config.db);
  }

  /**
   * Init
   * @returns {Promise}
   */
  init() {
    this.app.log.debug("Connecting to database...");

    return this.client.connect();
  }


  run() {
    this.app.log.debug("Registering models...");
    this.defineModels();

    this.app.log.debug("Syncing models with database...");

  }


  /**
   * Define Models of ManiaJS and Plugins!
   */
  defineModels() {
    // First the core models.


    // Plugin models.
    this.app.pluginFacade.manager.loadModels(this.client.sequelize);
  }
}

'use strict';

import Facade from './../lib/base-facade';

import Client from './client';

/**
 * Database Facade
 *
 * @class DatabaseFacade
 * @type {DatabaseFacade}
 */
export default class DatabaseFacade extends Facade {

  constructor(app) {
    super(app);

    this.client = new Client(app, app.config.db);
  }

  /**
   * Init
   * @returns {Promise}
   */
  init() {
    this.app.log.debug('Connecting to database...');

    return this.client.connect();
  }

  /**
   * Run
   * @returns {Promise}
   */
  run() {
    this.app.log.debug('Registering models...');

    return this.defineModels().then(() => {
      this.app.log.debug('Syncing models with database...');
      return this.client.sync();
    }).catch((err) => {
      this.app.log.fatal('Fatal error with syncing/connecting to the database', err.stack);
      process.exit(0);
    });
  }

  /**
   * Exit Handling.
   */
  stop() {
  }


  /**
   * Define Models of ManiaJS and Plugins!
   *
   * @returns {Promise}
   */
  defineModels() {
    return new Promise((resolve) => {
      // First the core models.
      this.client.loadCoreModels();

      // Plugin models.
      this.app.pluginFacade.manager.loadModels(this.client.sequelize);

      resolve();
    });
  }
}

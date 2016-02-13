'use strict';

import Facade from './../lib/base-facade';

import Client from './client';
import CallbackManager from './callback-manager';

/**
 * Server Client Facade
 *
 * @class ServerFacade
 *
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    /** @type {Client} */
    this.client = null;
  }

  /**
   * Init Server Client.
   * @returns {Promise}
   */
  init() {
    let self = this;

    this.client = new Client(this.app);

    // Inject into App (client of mp, server for plugins).
    this.app.server = this.client;

    return this.client.connect().catch((err) => {
      self.app.log.error(err);
    });
  }

  /**
   * Run, called after everything has been constructed, but before plugins are init.
   *
   * @returns {Promise}
   */
  run() {
    return this.client.register();
  }
}

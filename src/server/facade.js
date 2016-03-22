'use strict';

import Facade from './../lib/base-facade';

import Client from './client';

/**
 * Server Client Facade
 *
 * @class ServerFacade
 * @type {ServerFacade}
 */
export default class ServerFacade extends Facade {

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
    this.client = new Client(this.app);

    // Inject into App (client of mp, server for plugins).
    this.app.server = this.client;

    return this.client.connect();
  }

  /**
   * Run, called after everything has been constructed, but before plugins are init.
   *
   * @returns {Promise}
   */
  run() {
    return this.client.register();
  }

  /**
   * Exit Handling.
   */
  stop() {
  }
}

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

    this.client = new Client();
  }

  /**
   * Init
   * @returns {Promise}
   */
  init() {
    return Promise.resolve();
  }
}

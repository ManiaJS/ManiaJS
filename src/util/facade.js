'use strict';

import Facade from './../lib/base-facade';

import * as times from './times';

/**
 * Server Client Facade
 *
 * @class ServerFacade
 *
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.times = times;
  }

  /**
   * Init Server Client.
   * @returns {Promise}
   */
  init() {
    return Promise.resolve();
  }

  /**
   * Run, called after everything has been constructed, but before plugins are init.
   *
   * @returns {Promise}
   */
  run() {
    return Promise.resolve();
  }
}

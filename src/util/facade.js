'use strict';

import Facade from './../lib/base-facade';

import * as times from './times';
import * as gbx from './gbx';

/**
 * Util Facade
 *
 * @class UtilFacade
 * @type {UtilFacade}
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.times = times;
    this.gbx = gbx;
  }

  /**
   * Init Util.
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

  /**
   * Exit Handling.
   */
  stop() {
  }
}

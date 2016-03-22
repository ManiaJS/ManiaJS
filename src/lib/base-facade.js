'use strict';

/**
 * Base Facade
 * @class BaseFacade
 * @type {BaseFacade}
 * @abstract
 *
 * @property {App} app
 * @function {Promise} init
 */
export default class BaseFacade {

  /**
   * Construct Facade
   *
   * @param {App} app Application Context
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * Init Facade (promise!)
   *
   * @return {Promise}
   */
  init() {}

  /**
   * Run Facade (promise!)
   *
   * @return {Promise}
   */
  run() {}

  /**
   * Stop Facade (SYNC!).
   */
  stop() {}

  /**
   * Is Facade?
   * @returns {boolean}
   */
  isFacade() {
    return true;
  }
}

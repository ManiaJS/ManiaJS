'use strict';

/**
 * base facade
 * @class BaseFacade
 *
 * @property {App} app
 * @function {Promise} init
 */
export default class {

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
   * Is Facade?
   * @returns {boolean}
   */
  isFacade() {
    return true;
  }
}

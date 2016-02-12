'use strict';

/**
 * base facade
 */
export default class {

  /**
   *
   */
  constructor() {

  }

  /**
   * Initiate the facade classes, will init server connections.
   *
   * @abstract
   * @returns {Promise}
   */
  init();

  /**
   * Is Facade?
   * @returns {boolean}
   */
  isFacade() {
    return true;
  }
}

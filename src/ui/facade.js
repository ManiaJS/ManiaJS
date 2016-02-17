/**
 * UI Facade
 */
'use strict';

import Facade from './../lib/base-facade';


/**
 * UI Facade
 *
 * @class UIFacade
 */
export default class extends Facade {

  constructor(app) {
    super(app);
  }

  /**
   * Prepare Component
   *
   * @return {Promise}
   */
  init() {
    return Promise.resolve();
  }

  /**
   * Run Component
   * @return {Promise}
   */
  run() {
    return Promise.resolve();
  }


  /**
   * Get a builder instance.
   *
   * @todo: Add support for plugin building.
   * @todo: Add support for core building.
   * @todo: Add support for custom building.
   */
  build() {

  }

}

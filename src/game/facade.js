'use strict';

import Facade from './../lib/base-facade';

import Players from './players';


/**
 * Game Facade
 *
 * @class GameFacade
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.players = new Players(app);
  }

  /**
   * Init
   * @returns {Promise}
   */
  init() {
    return Promise.resolve();
  }

  /**
   * Run
   * @returns {Promise}
   */
  run() {
    return Promise.resolve();
  }
}

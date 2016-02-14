'use strict';

import Facade from './../lib/base-facade';

import Players from './players';
import Maps from './maps';


/**
 * Game Facade
 *
 * @class GameFacade
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.players = new Players(app);
    this.maps = new Maps(app);
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
    return this.players.boot()
      .then(() => {
        return this.maps.boot();
      });
  }
}

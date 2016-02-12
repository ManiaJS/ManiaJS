'use strict';

import Facade  from './../lib/base-facade';

import Manager from './plugin';

/**
 * Plugin Facade
 *
 * @class PluginFacade
 */
export default class extends Facade {

  constructor() {
    super();

    this.manager = new Manager();
  }

  init() {
    let self = this;

    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

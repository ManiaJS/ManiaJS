'use strict';

import Facade  from './../lib/base-facade';

import Manager from './plugin';

/**
 * Plugin Facade
 *
 * @class PluginFacade
 */
export default class extends Facade {

  constructor(app) {
    super(app);

    this.manager = new Manager(app);
  }

  init() {
    return this.manager.loadPlugins();
  }

  run() {
    this.manager.startPlugins();
  }
}

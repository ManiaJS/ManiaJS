
/**
 * App Public Interface. Facade to the class instances.
 */
import DatabaseFacade  from './database/facade';
import ServerFacade    from './server/facade';
import PluginFacade    from './plugin/facade';

import { config, raw as rawConfig } from './util/configuration';


/**
 * App Interface Class.
 *
 * @class App
 */
export default class {

  constructor (log) {
    this.log = log;

    this.config =         config;
    this.config.plugins = rawConfig.plugins; // Map plugin into config.

    this.server =   new ServerFacade(this);
    this.database = new DatabaseFacade(this);
    this.plugin =   new PluginFacade(this);
  }

  /**
   * Prepare by loading core's facade and managers.
   * Prepare the plugins by loading the info.
   *
   * @returns {Promise}
   */
  prepare() {
    let self = this;
    return self.server.init()
      .then(() => {
        return self.database.init();
      })
      .then(() => {
        return self.plugin.init();
      });
  }

  /**
   * Run the Controller.
   * @returns {Promise}
   */
  run() {
    let self = this;

    return this.plugin.run()
      .then(() => {self.log.debug("Ready...")});
  }
}

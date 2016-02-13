
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

    /**
     * INTERNAL FACADE
     * Facade classes of components.
     */
    this.serverFacade   =   new ServerFacade(this);
    this.databaseFacade =   new DatabaseFacade(this);
    this.pluginFacade   =   new PluginFacade(this);


    /**
     * PUBLIC INTERFACE VARIABLES
     * Will be used for providing plugins features. Keep stable please.
     */
    this.server        = null;
    this.plugins       = null;
  }

  /**
   * Prepare by loading core's facade and managers.
   * Prepare the plugins by loading the info.
   *
   * @returns {Promise}
   */
  prepare() {
    let self = this;
    return self.serverFacade.init()
      .then(() => {
        return self.databaseFacade.init();
      })
      .then(() => {
        return self.pluginFacade.init();
      });
  }

  /**
   * Run the Controller.
   * @returns {Promise}
   */
  run() {
    let self = this;

    return this.serverFacade.run()
      .then(() => { return this.pluginFacade.run();   })
      .then(() => { return this.databaseFacade.run(); })
      .then(() => { self.log.debug("Ready...");       });
  }
}

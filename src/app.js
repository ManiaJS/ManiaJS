
/**
 * App Public Interface. Facade to the class instances.
 */
import DatabaseFacade  from './database/facade';
import ServerFacade    from './server/facade';
import PluginFacade    from './plugin/facade';
import GameFacade      from './game/facade';

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
    this.gameFacade     =   new GameFacade(this);


    /**
     * PUBLIC INTERFACE VARIABLES
     * Will be used for providing plugins features. Keep stable please.
     */
    this.server        = null;
    this.plugins       = null;
    this.models        = {  };
    this.players       = this.gameFacade.players;
    this.maps          = this.gameFacade.maps;
  }

  /**
   * Prepare by loading core's facade and managers.
   * Prepare the plugins by loading the info.
   *
   * @returns {Promise}
   */
  prepare() {
    return this.serverFacade.init()
      .then(() => {
        return this.databaseFacade.init();
      })
      .then(() => {
        return this.pluginFacade.init();
      })
      .then(() => {
        return this.gameFacade.init();
      });
  }

  /**
   * Run the Controller.
   * @returns {Promise}
   */
  run() {
    return this.serverFacade.run()
      .then(() => { return this.databaseFacade.run(); })
      .then(() => { return this.gameFacade.run();     })
      .then(() => { return this.pluginFacade.run();   })
      .then(() => { this.log.debug("Ready...");       })
      .catch((err) => {
        console.error(err.stack);
      });
  }
}

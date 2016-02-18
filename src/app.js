
/**
 * App Public Interface. Facade to the class instances.
 */
import DatabaseFacade  from './database/facade';
import ServerFacade    from './server/facade';
import PluginFacade    from './plugin/facade';
import GameFacade      from './game/facade';
import UtilFacade      from './util/facade';
import UIFacade        from './ui/facade';

import Package         from './../package.json';

import { config, raw as rawConfig } from './util/configuration';


/**
 * App Interface Class.
 *
 * @class App
 *
 * @property {{}}                 config
 * @property {{}}                 log
 * @property {string}             version
 * @property {ServerClient}       server
 * @property {{}}                 models
 * @property {Players}            players
 * @property {Maps}               maps
 * @property {UtilFacade}         util
 * @property {UIFacade}           ui
 */
export default class {

  constructor (log) {
    this.log = log;
    this.version = Package.version;

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
    this.uiFacade       =   new UIFacade(this);
    this.utilFacade     =   new UtilFacade(this);


    /**
     * PUBLIC INTERFACE VARIABLES
     * Will be used for providing plugins features. Keep stable please.
     */
    this.server        = null;
    this.plugins       = null;
    this.models        = {  };
    this.players       = this.gameFacade.players;
    this.maps          = this.gameFacade.maps;
    this.util          = this.utilFacade;
    this.ui            = this.uiFacade;
  }

  /**
   * Prepare by loading core's facade and managers.
   * Prepare the plugins by loading the info.
   *
   * @returns {Promise}
   */
  prepare() {
    return this.serverFacade.init()
      .then(() => { return this.databaseFacade.init(); })
      .then(() => { return this.uiFacade.init();   })
      .then(() => { return this.pluginFacade.init();   })
      .then(() => { return this.gameFacade.init();     })
      .catch((err) => {
        this.log.fatal(err);
        process.exit(1);
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
      .then(() => { return this.uiFacade.run();       })
      .then(() => { return this.pluginFacade.run();   })
      .then(() => { return this.uiFacade.compile();   })
      .then(() => {
        this.log.debug('Ready...');
        this.server.send().chat('$o$f90Mania$z$o$f90JS$z$fff: Controller ready!').exec();
      })
      .catch((err) => {
        this.log.error(err);
      });
  }
}


/**
 * App Public Interface. Facade to the class instances.
 */
import DatabaseFacade  from './database/facade';
import ServerFacade    from './server/facade';
import PluginFacade    from './plugin/facade';

import { config }      from './util/configuration';


/**
 * App Interface Class.
 *
 * @class App
 */
export default class {

  constructor (log) {
    this.log = log;

    this.server =   new ServerFacade(this);
    this.database = new DatabaseFacade(this);
    this.plugin =   new PluginFacade(this);

    this.config =   config;
  }

  prepare() {
    return this.server.init().then(this.database.init).then(this.plugin.init);
  }

  run() {
    // Run YOW!
  }
}

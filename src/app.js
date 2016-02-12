
/**
 * App Public Interface. Facade to the class instances.
 */

import { DatabaseFacade }  from './database/facade';
import { ServerFacade }    from './server/facade';
import { PluginFacade }    from './plugin/facade';

/**
 * App Interface Class.
 *
 * @class App
 */
export default class {

  constructor () {
    this.server = new ServerFacade();
    this.database = new DatabaseFacade();
    this.plugin = new PluginFacade();
  }

  prepare() {
    return new Promise(function (resolve, reject) {
      return this.server.init();
    }).then(function() {
      return this.database.init();
    }).then(function() {
      return this.plugin.init();
    });
  }

}
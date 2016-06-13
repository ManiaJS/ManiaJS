

import {BaseFacade} from '../Util/Facade';
import {PluginManager} from './PluginManager';
import {Configuration} from '../Util/Configuration';
import {App} from '../App';

export module Plugin {

  /**
   * Plugin Facade
   */
  export class Facade extends BaseFacade {

    public manager: PluginManager;

    constructor (
      app: App
    ) {
      super(app);

      this.manager = new PluginManager(this);
    }

    public async init() {
      await this.manager.loadPlugins();
    }

    public async run () {
      await this.manager.startPlugins();
    }

    public async stop() {

    }
  }
}

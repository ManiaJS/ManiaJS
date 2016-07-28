//

import {BaseFacade} from '../Util/Facade';
import {PluginManager} from './PluginManager';
import {App} from '../App';

export module Plugin {

  /**
   * Plugin Facade
   */
  export class Facade extends BaseFacade {

    public manager: PluginManager;
    public pluginManager: PluginManager;

    constructor (
      app: App
    ) {
      super(app);

      this.manager = new PluginManager(this);
      this.pluginManager = this.manager;
    }

    public async init() {
      await this.pluginManager.loadPlugins();
    }

    public async run () {
      await this.pluginManager.startPlugins();
    }

    public async stop() {}
  }
}

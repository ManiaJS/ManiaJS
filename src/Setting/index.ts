

import {BaseFacade} from '../Util/Facade';
import {SettingManager} from './SettingManager';
import {App} from '../App';

export module Setting {

  /**
   * Setting Facade
   */
  export class Facade extends BaseFacade {

    public settingManager: SettingManager;

    constructor (
      app: App
    ) {
      super(app);

      this.settingManager = new SettingManager(this);
    }

    public async init() {}
    public async run () {}
    public async stop() {}
  }
}

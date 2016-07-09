
import {EventEmitter} from 'events';

import {Setting} from './index';
import {App} from '../App';

import {SettingStore} from './SettingStore';

export class SettingManager extends EventEmitter {

  public app: App;
  public facade: Setting.Facade;

  private stores: {[k: string]: SettingStore};

  constructor (facade: Setting.Facade) {
    super();

    this.facade = facade;
    this.app = this.facade.app;

    this.stores = {};
  }

  /**
   * Get the SettingStore for the context given. This will be a single instance of the SettingStore class.
   * Every context has it's own unique storage and own unique keys.
   *
   * @param context Context, Please give the plugin context (the instance of the plugin with the init functions).
   *                Or can be the core App instance (ONLY for core settings), for internally usage.
   */
  public getStore (context: any): SettingStore {
    let contextString = this.getContextString(context);
    if (! this.stores.hasOwnProperty(contextString))
      this.stores[contextString] = new SettingStore(this, context);
    return this.stores[contextString];
  }

  /**
   * Get context string from context. Is used internally within the core. Can change!
   *
   * @param context
   * @return {string}
   */
  public getContextString (context: any): string {
    return context.hasOwnProperty('name') ?
      context.name
      :
      (
        context.hasOwnProperty('serverFacade') ?
          'maniajs'
          :
          null
      );
  }


  /**
   * Parse setting (decode JSON).
   * @param setting
   * @return {any}
   */
  public parseSetting (setting): any {
    if (! setting) return null;
    try {
      setting.value = JSON.parse(setting.value);
    } catch (err) {
      // Can't parse, so it's not json encoded.
      this.app.log.error(err);
    }
    return setting;
  }
}

interface Setting {
  key: string,
  name?: string,
  foreignKey?: number,
  value?: any
}

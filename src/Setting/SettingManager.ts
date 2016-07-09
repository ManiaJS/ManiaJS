
import {EventEmitter} from 'events';

import {Setting} from './index';
import {App} from '../App';

import {Model} from 'sequelize';
import {Instance} from 'sequelize';

// todo: Rework so you can have an instance only for one context.
export class SettingManager extends EventEmitter {

  private app: App;

  private facade: Setting.Facade;
  private settingModel: Model<any, any>;

  constructor (facade: Setting.Facade) {
    super();

    this.facade = facade;
    this.app = this.facade.app;
  }

  public async loadSettings () {
    return;
  }

  public async startSettings () {
    this.settingModel = this.app.models['Setting'];

    // Save to settings for next start.
    this.app.settings.setSetting(this.app, 'test.key', true);

    this.clearSettings(this.app);
    this.clearSettings(this.app.plugins['@maniajs/plugin-karma']);
    return;
  }

  /**
   * Get all plugin settings.
   * @param context Plugin class instance or app instance for global.
   */
  public async getAllSettings (context: any): Promise<Setting[]> {
    let settings: any[] = await this.settingModel.find({
      where: { context: { $eq: this.getContextString(context) } }
    });

    return settings.map((setting) => {
      return this.parseSetting(setting);
    });
  }

  /**
   * Set all settings for context. (Will not delete existing and non replacing settings!).
   * @param context Plugin instance or app instance.
   * @param settings
   */
  public async setAllSettings (context: any, settings: Setting[]): Promise<any> {
    for (let setting of settings) {
      await this.replaceSetting(context, setting);
    }
  }

  /**
   * Set setting value.
   * @param context Please provide the Plugin instance, or another core instance, this is dependent and will
   *                specify your unique store environment
   * @param key Provide the string key, or if you want to supply the foreignKey too, supply an object with
   *            'key' and 'foreignKey' in it.
   * @param value
   */
  public async setSetting (context: any, key: string | {key: string, foreignKey?: number}, value: any): Promise<any> {
    let context: string = this.getContextString(context);
    var realKey: string;
    var foreignKey: number;

    if (typeof key === 'object') {
      foreignKey = key.foreignKey;
      realKey = key.key;
    } else if (typeof key === 'string') {
      foreignKey = null;
      realKey = key;
    }

    let where: any = {$and: [{
      context: {$eq: this.getContextString(context)},
      key: {$eq: realKey},
      foreignKey: {$eq: foreignKey}
    }]};

    let setting = await this.settingModel.findOrCreate({
      where,
      defaults: {
        context: this.getContextString(context),
        key: realKey,
        foreignKey,
        value: value
      }
    });

    setting.set('value', value);
    await setting.save();
  }

  /**
   * Get setting.
   * @param context Please provide the Plugin instance, or another core instance, this is dependent and will
   *                specify your unique store environment
   * @param key Provide the string key, or if you want to supply the foreignKey too, supply an object with
   *            'key' and 'foreignKey' in it.
   */
  public async getSetting (context: any, key?: string | {key: string, foreignKey?: number}): Promise<Setting> {
    let context: string = this.getContextString(context);
    var realKey: string;
    var foreignKey: number;

    if (typeof key === 'object') {
      foreignKey = key.foreignKey;
      realKey = key.key;
    } else if (typeof key === 'string') {
      foreignKey = null;
      realKey = key;
    }

    let where: any = {$and: [{
      context: {$eq: this.getContextString(context)},
      key: {$eq: realKey},
      foreignKey: {$eq: foreignKey}
    }]};

    let setting = await this.settingModel.findOne({
      where
    });
    return this.parseSetting(setting);
  }

  /**
   * Replace setting.
   * @param context
   * @param setting
   */
  public async replaceSetting (context: any, setting: Setting): Promise<any> {
    let instance = await this.settingModel.findOne({
      where: { $and: [
        {context: { $eq: this.getContextString(context) }},
        {key: { $eq: setting.key }}
      ]}
    });
    if (! instance) throw new Error('Setting key is not yet saved before! (\''+setting.key+'\')');

    instance.set(setting);

    await instance.save();
  }

  /**
   * Remove setting.
   * @param context
   * @param setting key or setting instance.
   */ // todo: Add foreign key support
  public async removeSetting (context: any, setting: Setting | string): Promise<any> {
    let instance: Instance<any> = await this.settingModel.findOne({
      where: { $and: [
        {context: { $eq: this.getContextString(context) }},
        {key: { $eq: (typeof setting === 'string' ? setting : (setting as Setting).key) }}
      ]}
    });
    if (instance) {
      await instance.destroy();
      return true;
    }
    return false;
  }

  /**
   * Clear all settings in context.
   * @param context
   * @param [keys] Optional, only the following keys.
   */ // todo: Add foreign key support
  public async clearSettings (context: any, keys?: string[]): Promise<any> {
    let where: any = { $and: [
      {context: { $eq: this.getContextString(context) }}
    ]};
    if (keys) {
      let or = { $or: []};
      for (let key of keys) {
        or.$or.push({key: {$eq: key}});
      }
      where.$and.push(or);
    }

    await this.settingModel.destroy({
      where
    });
  }


  /**
   * Parse setting (decode JSON).
   * @param setting
   * @return {any}
   */
  private parseSetting (setting): any {
    if (! setting) return null;
    try {
      setting.value = JSON.parse(setting.value);
    } catch (_) {
      // Can't parse, so it's not json encoded.
    }
    if (setting.enumeration) {
      try {
        setting.enumeration = JSON.parse(setting.enumeration);
      } catch (_) {
        // Can't parse, so it's not json encoded.
      }
    }
    return setting;
  }

  /**
   * Get context string from context (instance).
   * @param context
   * @return {string}
   */
  private getContextString (context: any): string {
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
}

interface SettingSchema {
  categories: string[],
  settings: Setting[]
}

interface Setting {
  key: string,
  name: string,
  type: string, // 'text', 'boolean', 'enum', 'largetext', etc
  foreignKey?: number,
  enumeration?: string[],
  description?: string,
  value?: any,
  category?: any,
  visible?: boolean
}

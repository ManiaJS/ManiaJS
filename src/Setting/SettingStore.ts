

import {App} from '../App';
import {SettingManager} from './SettingManager';

import {Model} from 'sequelize';


export class SettingStore {

  public contextString: string;
  public context: any;

  private app: App;
  private manager: SettingManager;

  private model: Model<any, any>;

  constructor (manager, context) {
    this.app = manager.app;
    this.manager = manager;
    this.context = context;
    this.contextString = this.manager.getContextString(context);

    this.model = this.app.models['Setting'];
  }

  /**
   * Get setting by key.
   *
   * @param {string} key
   * @return {Promise<any>}
   */
  public async get(key: string) {
    return this.get(key, null);
  }

  /**
   * Get setting by key and foreignKey.
   *
   * @param {string} key
   * @param {number} foreignKey
   * @return {any}
   */
  public async get(key: string, foreignKey?: number) {
    let where: any = {$and: [
      {context: {$eq: this.contextString}},
      {key: {$eq: key}},
      {foreignKey: {$eq: foreignKey}}
    ]};

    let setting = await this.model.findOne({
      where
    });

    return this.manager.parseSetting(setting);
  }


  /**
   * Set setting value (will create when not yet existing).
   *
   * @param {string} key
   * @param {any} value
   * @return {Promise<boolean>}
   */
  public async set(key: string, value: any) {
    return this.set(key, null, value);
  }

  /**
   * Set setting value (will create when not yet existing).
   *
   * @param {string} key
   * @param {number} foreignKey
   * @param {any} value
   *
   * @return {Promise<boolean>}
   */
  public async set(key: string, foreignKey: number, value: any) {
    let where: any = {$and: [
      {context: {$eq: this.contextString}},
      {key: {$eq: key}},
      {foreignKey: {$eq: foreignKey}}
    ]};

    let [setting, created] = await this.model.findOrBuild({
      where,
      defaults: {
        context: this.contextString,
        key,
        foreignKey,
        value
      }
    });

    if (! created) {
      setting.set('value', value);
      await setting.save();
    }
    return true;
  }
}



import {App} from '../App';
import {SettingManager, Setting} from './SettingManager';

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
  public async get(key: string): Promise<Setting>;
  public async get(key: string, foreignKey?: number): Promise<Setting>;

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
  public async set(key: string, value: any);
  public async set(key: string, foreignKeyOrValue: number | any, value?: any);

  /**
   * Set setting value (will create when not yet existing).
   *
   * @param {string} key
   * @param {number|any} foreignKeyOrValue
   * @param {any} value
   *
   * @return {Promise<boolean>}
   */
  public async set(key: string, foreignKeyOrValue: number | any, value?: any) {
    var realValue: any;
    var realForeignKey: number = null;

    if (typeof foreignKeyOrValue === 'number') {
      realForeignKey = foreignKeyOrValue;
      realValue = value;
    } else {
      realValue = foreignKeyOrValue;
    }

    let where: any = {$and: [
      {context: {$eq: this.contextString}},
      {key: {$eq: key}},
      {foreignKey: {$eq: realForeignKey}}
    ]};

    let [setting, created] = await this.model.findOrBuild({
      where,
      defaults: {
        context: this.contextString,
        key,
        foreignKey: realForeignKey,
        realValue
      }
    });

    if (! created) {
      setting.set('value', realValue);
      await setting.save();
    }
    return true;
  }
}

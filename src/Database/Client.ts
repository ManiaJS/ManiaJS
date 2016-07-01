
import * as path from 'path';
import * as glob from 'glob';
import * as Sequelize from 'sequelize';
import {Sequelize as SequelizeInstance} from 'sequelize';

import {App} from '../app';
import {Database} from './index';

export class Client {

  private app: App;
  public sequelize: SequelizeInstance;

  private options: any;

  private database: string;
  private username: string;
  private password: string;

  constructor (facade: Database.Facade) {
    this.app = facade.app;
    let config = facade.config.config.config.db;
    this.sequelize = null;

    let options: any = {
      pool: config.pool,
      dialectOptions: {}
    };

    // MySQL/MariaDB and Postgres requires only host and port.
    if (config.dialect ===  'mysql'
      || config.dialect === 'postgres') {

      Object.assign(options, {
        host: config[config.dialect].host,
        port: config[config.dialect].port,
        dialect: config.dialect
      });
    }

    // MsSQL Requires special config, can contain only port or only instance name.
    if (config.dialect === 'mssql') {
      let mssqlOptions: any = {
        dialect: config.dialect,
        host: config[config.dialect].host
      };

      // When instance is provided, we will not fill in the port!
      if (! config[config.dialect].port && config[config.dialect].instance) {
        mssqlOptions.dialectOptions = {instanceName: config[config.dialect].instance};
      } else if (config[config.dialect].port && ! config[config.dialect].instance) {
        mssqlOptions.port = config[config.dialect].port;
      } else {
        throw new Error('For the MSSQL dialect is a port OR a instance name required, not both!');
      }
      // Copy the MsConfig parts to the options object.
      Object.assign(options, mssqlOptions);
    }

    // SQLite requires a storage path.
    if (config.dialect === 'sqlite') {
      Object.assign(options, {
        dialect: 'sqlite',
        storage: (
          config.sqlite.storage.startsWith('./') ?
            path.normalize(location + '/' + config.sqlite.storage)
            :
            path.resolve(config.sqlite.storage)
        )
      });
    }

    // Logging settings.
    options.logging = false;
    if (this.app.config.config.db.debug) {
      options.logging = (input) => {
        this.app.log.debug(input);
      };
    }

    this.options = options;
    this.database = config.database;
    this.username = config.authentication.username;
    this.password = config.authentication.password;
  }

  /**
   * Connect to the database.
   * @async
   */
  public connect () {
    this.sequelize = new Sequelize(this.database, this.username, this.password, this.options);
  }

  /**
   * Sync Database
   * @return {Promise<any>}
   * @async
   */
  public async sync () {
    return this.sequelize.sync();
  }

  /**
   * Load All Models for the Core.
   */
  public async loadCoreModels () {
    let list = glob.sync(path.normalize(__dirname + '/../Models/') + '*.js');

    if (list.length > 0) {
      list.forEach((file) => {
        // Import sequelize model.
        let model:any = this.sequelize.import(file);

        // Save to model storage of app.
        this.app.models[model.name] = model;
      });
    }
  }

}

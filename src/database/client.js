/**
 * Database Client. Connects to the underlying managers.
 */
'use strict';

import { basedir, normalize } from 'path';
import * as glob from 'glob';

import Sequelize from 'sequelize';

export default class Client {

  constructor(app, config) {
    // Init props
    this.sequelize = null;
    this.app = app;

    // Prepare config for constructing sequelize...
    let options = {
      pool: config.pool
    };

    if (config.dialect === 'mysql'
      || config.dialect === 'mariadb'
      || config.dialect === 'mssql'
      || config.dialect === 'postres') {

      Object.assign(options, {
        host: config[config.dialect].host,
        port: config[config.dialect].port,
        dialect: config.dialect
      });
    }

    if (config.dialect === 'sqlite') {
      Object.assign(options, {
        dialect: 'sqlite',
        storage: basedir(__dirname + "/../../" + config.sqlite.storage)
      });
    }

    if (app.config.db.debug) {
      Object.assign(options, {
        logging: (input) => {app.log.debug(input);}
      });
    } else {
      Object.assign(options, {
        logging: false
      });
    }


    this.options = options;
    this.database = config.database;
    this.username = config.authentication.username;
    this.password = config.authentication.password;
  }


  /**
   * Connect to database.
   *
   * @returns {Promise}
   */
  connect() {
    let self = this;
    return new Promise((resolve, reject) => {
      try {
        self.sequelize = new Sequelize(self.database, self.username, self.password, self.options);
      } catch (err) {
        return reject(err);
      }
      return resolve();
    });
  }


  /**
   * Sync models with database structure.
   * @returns {Promise}
   */
  sync() {
    return this.sequelize.sync({force: false});
  }

  /**
   * Load all core models.
   */
  loadCoreModels() {
    let list = glob.sync(normalize(__dirname + '/../models/') + '*.js');

    if (list.length > 0) {
      list.forEach((file) => {
        // Import sequelize model.
        let model = this.sequelize.import(file);

        // Save to model storage of app.
        this.app.models[model.name] = model;
      });
    }
  }
}

/**
 * Database Client. Connects to the underlying managers.
 */
'use strict';

import { basedir } from 'path';

import Sequelize from 'sequelize';

export default class Client {

  constructor(app, config) {
    // Init props
    this.sequelize = null;

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

    if (app.config.debug) {
      Object.assign(options, {
        logging: (input) => {app.log.debug(input);}
      });
    }


    this.options = options;
    this.database = config.database;
    this.username = config.username;
    this.password = config.password;
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
    let self = this;
    return new Promise((resolve, reject) => {
      return resolve();
    });
  }

}

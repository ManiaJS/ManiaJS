/**
 * Configuration
 */

'use strict';

// Imports
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import Joi from 'joi';

import * as directory from './directory'

/**
 * Config Schema.
 */
var configSchema = {
  config: {
    debug: Joi.boolean(),
    server: {
      address: Joi.string().required(),
      port: Joi.number().required(),
      authentication: {
        username: Joi.string().required(),
        password: Joi.string().required()
      }
    },
    masteradmins: Joi.array().items(Joi.string()),
    db: {
      dialect: Joi.array().items(Joi.string().valid('mysql', 'mariadb', 'sqlite')),
      database: Joi.string(),
      authentication: {
        username: Joi.string(),
        password: Joi.string()
      },
      pool: {
        max: Joi.number().required(),
        min: Joi.number().required(),
        idle: Joi.number().required()
      },
      mysql: {
        host: Joi.string().required(),
        port: Joi.number().required()
      },
      mariadb: {
        host: Joi.string().required(),
        port: Joi.number().required()
      },
      sqlite: {
        storage: Joi.string().required()
      }
    }
  },
  plugins: Joi.array()
};

export var raw;
export var config;
export var location;

export function load(file) {
  file = file || directory.rootPath() + 'config.yaml';
  raw = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  config = raw.config;
  location = file;
}

export function validate() {
  var res = Joi.validate(this._config, configSchema);
  if (res.error) {
    throw res.error;
  }
  return true;
}

import * as Joi from 'joi';
import * as directory from './Directory'

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import {Game} from '../Server/Client';
import * as Package from 'pjson';

/**
 * Configuration Class. Access by using the instance export.
 */
export class Configuration {
  private raw: any;
  private location: string;
  private pkg: any;

  public  config: ConfigSchema;
  public  version: string;

  constructor() {
    this.pkg = Package;
    this.version = this.pkg.version;
  }

  public load (location?: string) {
    this.location = location || directory.rootPath() + 'config.yaml';
    this.config = yaml.safeLoad(fs.readFileSync(this.location, 'utf8'));
  }

  public validate(): boolean {
    var res = Joi.validate(this.config, schema);
    if (res.error) {
      throw res.error;
    }
    return true;
  }
}


let schema = {
  config: {
    debug: Joi.boolean(),
    server: {
      game: Joi.string().required(),
      address: Joi.string().required(),
      port: Joi.number().required(),
      authentication: {
        username: Joi.string().required(),
        password: Joi.string()
      }
    },
    masteradmins: Joi.array().items(Joi.string()),
    db: {
      debug: Joi.any().optional(),
      dialect: Joi.string().valid('mysql', 'mssql', 'sqlite', 'postgres'),
      database: Joi.string(),
      authentication: {
        username: Joi.any().optional(),
        password: Joi.any().optional()
      }, pool: {
        max: Joi.number().required(),
        min: Joi.number().required(),
        idle: Joi.number().required()
      },
      mysql: {
        host: Joi.string().required(),
        port: Joi.number().required()
      },
      mssql: {
        host: Joi.string().required(),
        port: Joi.number().required()
      },
      postgres: {
        host: Joi.string().required(),
        port: Joi.number().required()
      },
      sqlite: {
        storage: Joi.string().required()
      }
    }
  },
  plugins: Joi.any()
};

export interface ConfigSchema {
  config: AppConfig,
  plugins:{
    [s: string]: PluginConfig
  }
}

export interface AppConfig {
  debug: boolean,
  server: {
    address: string,
    port: number,
    authentication: {
      username: string,
      password: string
    },
    game: string,
  },
  masteradmins?: string[],
  db: {
    dialect: DatabaseDialect,
    database: string,
    authentication: {
      username: string,
      password: string
    },
    pool: {
      min: number,
      max: number,
      idle: number
    },
    mysql: {
      host: number,
      port: number
    },
    mariadb: {
      host: number,
      port: number
    },
    sqlite: {
      storage: string
    },
    debug?: boolean
  }
}

export interface PluginConfig {

}

export enum DatabaseDialect {
  mssql,
  mysql,
  sqlite,
  postgres
}

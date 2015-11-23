/**
 * Configuration
 */

'use strict';

// Imports
var fs = require('fs');
var yaml = require('js-yaml');
var Joi = require('joi');
var _ = require('underscore');

var directory = require('./directory');


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
        db: {
            driver: Joi.array().items(Joi.string().valid('mysql', 'mariasql', 'sqlite3')),
            authentication: {
                host: Joi.string().required(),
                username: Joi.string(),
                password: Joi.string()
            },
            mysql: {
                port: Joi.number().required(),
                database: Joi.string().required()
            },
            mariasql: {
                port: Joi.number().required(),
                database: Joi.string().required()
            },
            sqlite3: {
                database: Joi.string().required()
            }
        }
    },
    plugins: Joi.array()
};

var config = yaml.safeLoad(fs.readFileSync(directory.rootPath() + 'config.yaml', 'utf8'));

module.exports = {};
_.extend(module.exports, config);
module.exports.validate = function() {
    var res = Joi.validate(this._config, configSchema);
    if(res.error) {
        throw res.error;
    }
    return true;
};

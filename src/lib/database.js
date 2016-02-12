'use strict';

// TODO: Rework into database/client.js
// We will wait on the db decision first.!

/*
var glob = require('glob');
var async = require('async');
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');

var directory = require('./directory');

var config = require('./configuration').config;
var plugins = require('./configuration').plugins;
let pluginIds = Object.keys(plugins);

// Prepare connection
var dialect = config.db.dialect;
var options = {
  host: config.db[dialect].host || 'localhost',
  port: config.db[dialect].port || 0,
  pool: config.db.pool
};
if (dialect == 'sqlite') {
  options.storage = config.db.sqlite.storage
}

// Make Connection
var sequelize = new Sequelize(config.db.database, config.db.authentication.username, config.db.authentication.password, options);

// Define exports
module.exports = {};
module.exports.sequelize = sequelize;

var models = {
  core: {},
  plugin: {}
};

module.exports.models = models;


module.exports._syncDatabase = function () {
  'use strict';
  // Database should be loaded, but we will check if the database could be accessed
  console.log("Info: Updating database...");
  return sequelize.sync({force: false}).then(function () {
    console.log("Info: Database is ready!")
  });
};


// Load models
module.exports._loadModels = function () {
  "use strict";
  return new Promise(function (resolve, reject) {
    console.log("Info: Loading models...");

    async.series({
      core: function (back) {
        glob(directory.srcPath() + 'model' + directory.sep + '!(_)*.js', function (err, files) {
          // Require all core files
          for (var i = 0; i < files.length; i++) {
            let file = files[i];
            let modelname = path.basename(file, '.js');

            // Add to models
            models.core[modelname] = require(file);
          }

          return back();
        });
      },
      plugin: function (back) {
        // Info getter
        async.eachSeries(pluginIds, function (pluginId, callback) {
          let pluginPath = directory.pluginsPath() + pluginId + directory.sep;

          // Get models from directory
          if (fs.existsSync(pluginPath + 'model')) {
            // Load models
            glob(pluginPath + 'model' + directory.sep + '!(_)*.js', function (err, files) {
              for (var i = 0; i < files.length; i++) {
                let file = files[i];
                let modelname = path.basename(file, '.js');

                // Add to models
                if (!models.plugin[pluginId]) {
                  models.plugin[pluginId] = {};
                }
                models.plugin[pluginId][modelname] = require(file);
              }
              return callback(null, files);
            });
          } else {
            return callback(null, []);
          }
        }, function (err, results) {
          return back();
        });
      }
    }, function (err, results) {
      console.log("Info: Models loaded!");
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};
*/
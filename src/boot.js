
'use strict';

import * as async from 'async';
import * as fs from 'fs';


import * as clientManager from './server/client';
import * as databaseManager from './database/client';

import * as pluginManager from './plugin/plugin';

/*

clientLib.client.on('ready', function () {
  // Load database and database models
  database._loadModels()
    .then(function () {
      // Check if database will load
      return database._syncDatabase();
    })
    .then(function () {
      // DB OK, Load all plugins
      return pluginManager.loadPlugins();
    })
    .then(function () {
      console.log("Info: Plugins Loaded!");
    })
    .catch(function (err) {
      console.error("Error: Error with loading Controller.JS:");
      console.error(err);
      process.exit(1);
    });
});
clientLib.client.on('close', function () {
  // What happened here? TODO
});

*/

/** Add exit handlers */
process.stdin.resume();
function exitHandler(options, err) {
  if (options.cleanup) {
    // TODO: Implement termination of plugins and client connection
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}
process.on('exit', exitHandler.bind(null, {cleanup: true}));
process.on('SIGINT', exitHandler.bind(null, {exit: true}));
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

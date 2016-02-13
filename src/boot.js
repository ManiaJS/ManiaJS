/**
 * Boot.js
 *
 * Read out all the configs. register exit handlers. start logging.
 *
 * Then finally start maniajs facades.
 */
'use strict';

import * as async         from 'async';
import * as fs            from 'fs';
import Bunyan             from 'bunyan';
import PrettyStream       from 'bunyan-prettystream';

import App                from './app';


// Logger
var prettyOut = new PrettyStream();
    prettyOut.pipe(process.stdout);
var log = Bunyan.createLogger({
  name: 'maniajs',
  streams: [{
    level: 'debug',
    type: 'raw',
    stream: prettyOut
  }]
});
log.debug("Init ManiaJS..");

// Start ManiaJS.. Finally..
let app = new App(log);

app.prepare()
  .then(()=>app.run());




// Resume application.
process.stdin.resume();

// Start handlers for exitting.
process.on('exit', exitHandler.bind(null, {cleanup: true}));
process.on('SIGINT', exitHandler.bind(null, {exit: true}));
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

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

function exitHandler(options, err) {
  if (options.cleanup) {
    // TODO: Implement termination of plugins and client connection
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

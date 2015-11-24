
// REQUIRE
var async = require('async');
var fs = require('fs');

var clientLib = require('./lib/client');
var pluginManager = require('./lib/plugin');
var database = require('./lib/database');

clientLib.client.on('ready', function() {
    "use strict";

    // Load database and database models
    database._loadModels()
        .then(function() {
            // Check if database will load
            return database._syncDatabase();
        })
        .then(function() {
            // DB OK, Load all plugins
            return pluginManager.loadPlugins();
        })
        .then(function() {
            console.log("Info: Plugins Loaded!");
        })
        .catch(function(err) {
            console.error("Error: Error with loading Controller.JS:");
            console.error(err);
            process.exit(1);
        });
});
clientLib.client.on('close', function() {
    "use strict";
    // What happened here? TODO
});

/** Add exit handlers */
process.stdin.resume();
function exitHandler(options, err) {
    if (options.cleanup) {
        // TODO: Implement termination of plugins and client connection
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}
process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

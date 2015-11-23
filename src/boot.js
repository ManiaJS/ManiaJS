
// REQUIRE
var fs = require('fs');

var clientLib = require('./lib/client');
var pluginManager = require('./lib/plugin');

clientLib.client.on('ready', function() {
    "use strict";
    // Load all plugins
    pluginManager.loadPlugins()
        .then(function() {
            console.log("Info: Plugins Loaded!");
        })
        .catch(function(err) {
            console.error("Error: Plugins not loaded correctly!");
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


var async = require('async');
var debug = require('debug');
var mkdirp = require('mkdirp');

module.exports = {};

module.exports.pluginInfo = {
    id: 'cjs-chat',
    authors: [
        "Tom Valk <tomvalk@lt-box.info>"
    ],
    version: "1.0.0",
    description: "Chat handlers, In and output for chat access.",
    dependencies: [],   // What plugins are needed to operate
    requirements: [],   // What plugins are required to be started before we can start
    games: null,        // Define array with list of supported games, null for all (including future games)
    modes: null         // Define array with list of supported gamemodes, null for all
};

module.exports.loadPlugin = function(pluginInterface, callback) {
    "use strict";
    //console.log(pluginInterface);

    console.log(async);
    console.log(debug);
    console.log(mkdirp);

    setTimeout(function() {
        return callback(null);
    }, 200)
};
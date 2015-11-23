
module.exports = {};

module.exports.pluginInfo = {
    id: 'cjs-localrecords',
    authors: [
        "Tom Valk <tomvalk@lt-box.info>"
    ],
    version: "1.0.0",
    description: "Local records",
    dependencies: ['cjs-chat'], // What plugins are needed to operate
    requirements: ['cjs-chat'], // What plugins are required to be started before we can start
    games: null,                // Define array with list of supported games, null for all (including future games)
    modes: null                 // Define array with list of supported gamemodes, null for all
};

module.exports.loadPlugin = function(pluginInterface, callback) {
    "use strict";
    callback();
};
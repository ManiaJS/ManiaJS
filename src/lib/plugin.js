
var fs = require('fs');
var directory = require('./directory');
var async = require('async');

var pluginInterface = require('./interface');

var DependencyGraph = require('dependency-graph').DepGraph;
var graph = new DependencyGraph();

var configuration = require('./configuration');

var pluginOrder = [];


module.exports = {};
module.exports.plugins = {};

/**
 * Load all plugins from configuration
 */
module.exports.loadPlugins = function() {
    "use strict";
    return new Promise(function (resolve, reject) {
        // Get all plugin info's first
        let pluginIds = Object.keys(configuration.plugins);

        var pluginInfo = [];
        var i = 0;

        // Info getter
        for(i = 0; i < pluginIds.length; i++) {
            let pluginId = pluginIds[i];

            // Get info
            let info = module.exports.getPluginInfo(pluginId);

            // Error and exit when not loaded
            if(!info) {
                console.error("Error loading plugin: '" + pluginId + "'. No pluginInfo found/No file's found!");
                process.exit(1);
            }

            // Add to info
            pluginInfo.push(info);

            // Add node
            graph.addNode(pluginId);
        }

        // Add dependencies
        for(i = 0; i < pluginInfo.length; i++) {
            //let pluginId = pluginInfo[i];
            let pluginDependencies = pluginInfo[i].dependencies || [];
            let pluginRequirements = pluginInfo[i].requirements || [];

            // Check if dependencies will also be loaded
            for(var d = 0; d < pluginDependencies.length; d++) {
                if (pluginIds.indexOf(pluginDependencies[d]) == -1) {
                    let error = Error("Error: Plugin '" + pluginInfo[i].id + "' needs to have plugin '" + pluginDependencies[d] + "'! Try to install the plugin or disable the plugin.");
                    console.error(error);
                    reject(error);
                }
            }

            // Enter dependencies
            for(var r = 0; r < pluginRequirements.length; r++) {
                graph.addDependency(pluginInfo[i].id, pluginRequirements[r]);
            }
        }

        // Calculate dependencies
        pluginOrder = graph.overallOrder();

        // Load plugins async
        async.eachSeries(pluginOrder, function(id, callback) {
            module.exports.loadPlugin(id, function(err) {
                callback(err);
            });
        },
        function(err) {
            if (err) {
                console.error(err);
                reject(err);
            }else{
                resolve();
            }
        });
    });
};

/**
 * Load Plugin
 * @param pluginid {string}
 * @param callback {function}
 */
module.exports.loadPlugin = function(pluginid, callback) {
    "use strict";
    console.log("Info: Loading plugin '" + pluginid + "'...");

    // Load plugin
    let plugin = require(directory.pluginsPath() + pluginid + directory.sep + "plugin");
    module.exports.plugins[pluginid] = plugin;

    // Start plugin
    plugin.loadPlugin(pluginInterface, function(err) {
        callback(err);
    });
};

/**
 * Get module info object
 * @param pluginid
 * @return {Object}
 */
module.exports.getPluginInfo = function(pluginid) {
    "use strict";
    if(fs.existsSync(directory.pluginsPath() + pluginid + directory.sep + "plugin.js")) {
        return require(directory.pluginsPath() + pluginid + directory.sep + "plugin").pluginInfo;
    }
    return null;
};

/**
 * Unload all plugins from configuration
 */
module.exports.unloadPlugins = function() {
    "use strict";

};


module.exports.unloadPlugin = function(pluginid) {
    "use strict";

};
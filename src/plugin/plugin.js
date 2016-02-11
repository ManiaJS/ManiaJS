
'use strict';

import * as fs from 'fs';
import * as async from 'async';
import { DepGraph } from 'dependency-graph';

import * as directory from './../util/directory';

// var pluginInterface = require('./interface');

import * as configuration from './../util/configuration';

var graph = new DepGraph();
var pluginOrder = [];

/**
 * Plugin class.
 */
export default class {

  constructor() {
    this.plugins = {};
  }


  /**
   * Load all plugins in order of requirements/dependencies.
   *
   * @returns {Promise}
   */
  loadPlugins() {
    return new Promise(function (resolve, reject) {
      // Get all plugin info's first
      let pluginIds = Object.keys(configuration.plugins);

      var pluginInfo = [];
      var i = 0;

      // Info getter
      for (i = 0; i < pluginIds.length; i++) {
        let pluginId = pluginIds[i];

        // Get info
        let info = this.getPluginInfo(pluginId);

        // Error and exit when not loaded
        if (!info) {
          console.error("Error loading plugin: '" + pluginId + "'. No pluginInfo found/No file's found!");
          process.exit(1);
        }

        // Add to info
        pluginInfo.push(info);

        // Add node
        graph.addNode(pluginId);
      }

      // Add dependencies
      for (i = 0; i < pluginInfo.length; i++) {
        //let pluginId = pluginInfo[i];
        let pluginDependencies = pluginInfo[i].dependencies || [];
        let pluginRequirements = pluginInfo[i].requirements || [];

        // Check if dependencies will also be loaded
        for (var d = 0; d < pluginDependencies.length; d++) {
          if (pluginIds.indexOf(pluginDependencies[d]) == -1) {
            let error = Error("Error: Plugin '" + pluginInfo[i].id + "' needs to have plugin '" + pluginDependencies[d] + "'! Try to install the plugin or disable the plugin.");
            console.error(error);
            reject(error);
          }
        }

        // Enter dependencies
        for (var r = 0; r < pluginRequirements.length; r++) {
          graph.addDependency(pluginInfo[i].id, pluginRequirements[r]);
        }
      }

      // Calculate dependencies
      pluginOrder = graph.overallOrder();

      // Load plugins async
      async.eachSeries(pluginOrder, function (id, callback) {
          this.loadPlugin(id, function (err) {
            callback(err);
          });
        },
        function (err) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
    });
  }





  /**
   * Load Plugin
   * @param pluginid {string}
   * @param callback {function}
   */
  loadPlugin(pluginid, callback) {
    console.log("Info: Loading plugin '" + pluginid + "'...");

    // Load plugin
    // TODO: IMPORT syntax
    let plugin = require(directory.pluginsPath() + pluginid + directory.sep + "plugin");
    plugin._path = directory.pluginsPath() + pluginid + directory.sep;

    this.plugins[pluginid] = plugin;

    // Start plugin TODO: New plugin interface
    /*plugin.loadPlugin(pluginInterface, function (err) {
     callback(err);
     });*/
  }



  /**
   * Get module info object
   * @param pluginid
   * @return {Object}
   */
  getPluginInfo(pluginid) {
    if (fs.existsSync(directory.pluginsPath() + pluginid + directory.sep + "plugin.js")) {
      return require(directory.pluginsPath() + pluginid + directory.sep + "plugin").pluginInfo;
    }
    return null;
  }







  /**
   * Unload all plugins from configuration
   */
  unloadPlugins() {

  }


  unloadPlugin(pluginid) {

  }
}


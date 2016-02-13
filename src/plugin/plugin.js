
'use strict';

import * as fs from 'fs';
import * as async from 'async';
import { DepGraph } from 'dependency-graph';

import * as directory from './../util/directory';

import Interface from 'maniajs-plugin';

import * as configuration from './../util/configuration';


var graph = new DepGraph();
var pluginOrder = [];

/**
 * Plugin class.
 */
export default class {

  /**
   * Construct plugin manager.
   *
   * @param {App} app
   */
  constructor(app) {
    this.app = app;
    this.plugins = [];
  }


  /**
   * Load all plugins in order of requirements/dependencies.
   *
   * @returns {Promise}
   */
  loadPlugins() {
    let self = this;
    this.app.log.debug("Loading plugins from configuration...");

    return new Promise((resolve, reject) => {
      // Get all plugin info's first
      let pluginIds = Object.keys(self.app.config.plugins) || [];
      console.log(pluginIds);

      // Inject APP into plugin interface
      Interface.prototype.app = self.app;

      // Init plugins.
      pluginIds.forEach((pluginId) => {
        self.app.log.debug("Loading plugin '" + pluginId + "'...");

        // Import plugin.
        try {
          var plugin = require(pluginId).default.plugin;

          // Inject app.
          plugin.app = self.app;

          // Save plugin details to plugin array.
          self.plugins[pluginId] = plugin;
        } catch  (err) {
          self.app.log.error("Error with loading plugin '%s'. Stack: %O", pluginId, err);
        }
      });

      return resolve();
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


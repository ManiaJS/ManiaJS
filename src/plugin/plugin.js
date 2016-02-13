
'use strict';

import * as fs from 'fs';
import * as async from 'async';
import { DepGraph } from 'dependency-graph';

import * as directory from './../util/directory';

import { inject } from 'maniajs-plugin';

import * as configuration from './../util/configuration';

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
    this.graph = new DepGraph();

    // ObjectArray
    this.plugins = {};
    // Array of plugin ids in order for starting.
    this.order = [];
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

      // Init plugins.
      pluginIds.forEach((pluginId) => {
        self.app.log.debug("Loading plugin '" + pluginId + "'...");

        // Import plugin.
        try {
          var PluginClass = require(pluginId).default;

          // Save plugin details to plugin array.
          self.plugins[pluginId] = new PluginClass();

          // Inject App.
          self.plugins[pluginId].inject(self.app);

          // Register node
          self.graph.addNode(pluginId);
        } catch  (err) {
          self.app.log.error("Error with loading plugin '%s'.", pluginId, err.stack);
        }
      });

      return resolve();
    });
  }

  /**
   * Start all plugins, this will first determinate the start order, then ask the plugins to init, async and in order.
   *
   * @return {Promise}
   */
  startPlugins() {
    let self = this;
    this.app.log.debug("Starting all plugins... Determinate order...");

    // Determinate order.
    try {
      this.determinateOrder();
    } catch (err) {
      console.error(err);
      return;
    }

    this.app.log.debug("Starting all plugins... Calling init...");

    return new Promise((resolve, reject) => {
      async.eachSeries(self.order, (id, callback) => {
        self.plugins[id].init()
          .then(() => {callback();})
          .catch((err) => {callback(err);});
      }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
        });
    });
  }


  /**
   * Determinate start order.
   */
  determinateOrder() {
    let ids = Object.keys(this.plugins);

    // Loop and register dependencies to nodes.
    for (var i = 0; i < ids.length; i++) {
      let id =     ids[i];
      let plugin = this.plugins[id];

      if (plugin.hasOwnProperty('dependencies')) {
        let dependencies = plugin.dependencies;
        if (dependencies.length > 0) {
          // Parse, add node and go on.
          this.graph.addDependency(plugin);
        }
      }
    }
    this.order = this.graph.overallOrder();
  }



}

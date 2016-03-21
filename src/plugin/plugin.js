
'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as async from 'async';
import { DepGraph } from 'dependency-graph';

/**
 * Plugin class.
 * @class PluginManager
 * @type {PluginManager}
 */
export default class PluginManager {

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
    this.app.log.debug("Loading plugins from configuration...");

    return new Promise((resolve, reject) => {
      // Get all plugin info's first
      let plugins = this.app.config.plugins && this.app.config.plugins !== null ? this.app.config.plugins : [];
      let pluginIds = Object.keys(plugins);

      // Init plugins.
      pluginIds.forEach((pluginId) => {
        this.app.log.debug("Loading plugin '" + pluginId + "'...");

        // Import plugin.
        try {
          // Plugin config.
          let config = this.app.config.plugins[pluginId];

          // Load plugin (require).
          var PluginClass = require(pluginId).default;

          // Save plugin details to plugin array.
          this.plugins[pluginId] = new PluginClass();

          // Is Plugin suited for the Game (trackmania/shootmania)
          if (this.plugins[pluginId].hasOwnProperty('game') && this.plugins[pluginId].game.hasOwnProperty('games')) {
            if (this.plugins[pluginId].game.games.indexOf(this.app.serverFacade.client.gameName) > -1
            ||  this.plugins[pluginId].game.games.length === 0) {
              // All Right! Let's continue.
            } else {
              // Don't load! Unload from local properties, throw warning.
              delete this.plugins[pluginId];
              this.app.log.warn('Plugin \'' + pluginId + '\' is not suited for the current game! Plugin unloaded!');

              return; // Stop current loop.
            }
          }

          // Inject App, options and child logger.
          this.plugins[pluginId].inject(this.app, config, this.app.log.child({plugin: pluginId}));

          // Register node
          this.graph.addNode(pluginId);
        } catch  (err) {
          return reject(err);
        }
      });

      // Set plugins to app plugins.
      this.app.plugins = this.plugins;

      return resolve();
    });
  }

  /**
   * Call on MapBegin, will check against current game mode.
   * Will also disable plugins when not compatible with game mode.
   */
  begin() {
    return new Promise((resolve, reject) => {
      Object.keys(this.plugins).forEach((pluginId) => {
        let plugin = this.plugins[pluginId];

        if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes') && plugin.game.modes.length > 0) {
          if (plugin.game.modes.indexOf(this.app.serverFacade.client.currentMode()) > -1) {
            // All OK!
          } else {
            // Stop!
            // TODO: Stop plugin.
          }
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
      return Promise.reject(err);
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


  /**
   * Load all models from plugins.
   *
   * @param sequelize
   *
   * @returns {Promise}
   */
  loadModels(sequelize) {
    if (this.order.length === 0) {
      this.determinateOrder();
    }

    this.order.forEach((id) => {
      if (this.plugins[id].directory) {
        let modelDirectory = path.normalize(this.plugins[id].directory + '/models/');

        try {
          if (modelDirectory && fs.existsSync(modelDirectory)) {
            let list = glob.sync(modelDirectory + '*.js');

            if (list.length > 0) {
              list.forEach((file) => {
                // Import sequelize model.
                let model = sequelize.import(file);

                // Set in the plugin.
                if (! this.plugins[id].models) {
                  this.plugins[id].models = {};
                }
                this.plugins[id].models[model.name] = model;

                // Set in the global models.
                if (! this.app.models.hasOwnProperty(id)) {
                  this.app.models[id] = {};
                }
                this.app.models[id][model.name] = model;
              });
            }
          }

        } catch (err) {
          this.app.log.warn('Warning, can\'t load models for plugin ' + id, err.stack);
        }
      }
    });
  }


  /**
   * Emit event on all plugins!
   * Will be in the order calculated on dependencies.
   *
   * @param {string} event
   * @param {object} params
   * @param {object} options
   */
  emitAll (event, params, options) {
    params = params || {};
    options = options || {};

    // Always do it on the specific order we always use!
    this.order.forEach((id) => {
      this.plugins[id].emit(event, params);
    });
  }

}

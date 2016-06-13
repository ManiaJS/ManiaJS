
let fs = require('fs-promise');// import * as fs from 'fs-promise';
import * as path from 'path';
import * as glob from 'glob';

import {App} from '../App';
import {Sequelize} from 'sequelize';
import {BaseFacade} from '../Util/Facade';
import {DepGraph} from '@tomvlk/dependency-graph';

export class ModulePlugin {
  // TODO: Define in interface project
}

/**
 * Plugin class.
 * @class PluginManager
 * @type {PluginManager}
 */
export class PluginManager {

  private app: App;
  private graph: any;

  private plugins: {[s: string]: any}; // TODO: Interface project, the definition of plugin itself.
  private order: Array<string>; // Order of plugin UID's.

  private facade: BaseFacade;

  /**
   * Construct plugin manager.
   */
  constructor(facade: BaseFacade) {
    this.facade = facade;
    this.app = facade.app;

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
  public async loadPlugins() {
    this.app.log.debug('Loading plugins from configuration...');

    // Get plugins from config.
    let plugins = this.app.config.plugins && this.app.config.plugins !== null ? this.app.config.plugins : [];
    let pluginIds = Object.keys(plugins);

    for (let pluginId of pluginIds) {
      if (! pluginId) continue;
      this.app.log.debug(`Loading plugin ${pluginId}...`);

      // Import plugin
      try {
        // Plugin config.
        let config = this.app.config.plugins[pluginId];

        // Load plugin (require).
        // TODO: ModulePlugin type.
        var PluginClass: any = require(pluginId).default;

        // Save plugin details to plugin array.
        this.plugins[pluginId] = new PluginClass();

        // Is Plugin suited for the Game (trackmania/shootmania)
        if (this.plugins[pluginId].hasOwnProperty('game') && this.plugins[pluginId].game.hasOwnProperty('games')) {
          if (this.plugins[pluginId].game.games.indexOf(this.app.serverFacade.client.gameName) > -1
            || this.plugins[pluginId].game.games.length === 0) {
            // All Right! Let's continue.
          } else {
            // Don't load! Unload from local properties, throw warning.
            delete this.plugins[pluginId];
            this.app.log.warn('Plugin \'' + pluginId + '\' is not suited for the current game! Plugin unloaded!');

            continue; // Stop current loop.
          }
        }

        // Inject App, options and child logger.
        this.plugins[pluginId].inject(this.app, config, this.app.log.child({plugin: pluginId}));

        // Register node
        this.graph.addNode(pluginId);

      } catch (err) {
        this.app.log.error(`Plugin ${pluginId} could not be loaded, error: `, err);
      }

      // Set plugins to app plugins.
      this.app.plugins = this.plugins;
    }
  }

  /**
   * Call on MapBegin, will check against current game mode.
   * Will also disable plugins when not compatible with game mode.
   */
  public async begin() {
    for (let pluginId of Object.keys(this.plugins)) {
      let plugin:any = this.plugins[pluginId]; // TODO: Interface type convert.

      if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes') && plugin.game.modes.length > 0) {
        if (plugin.game.modes.indexOf(this.app.serverFacade.client.currentMode()) > -1) {
          // All OK!
        } else {
          // Stop!
          // TODO: Stop plugin.
        }
      }
    }
  }

  /**
   * Start all plugins, this will first determinate the start order, then ask the plugins to init, async and in order.
   *
   * @return {Promise}
   */
  public async startPlugins() {
    this.app.log.debug("Starting all plugins... Determinate order...");

    // Determinate order. (throws exception on error).
    this.determinateOrder();

    this.app.log.debug("Starting all plugins... Calling init...");

    for (let pluginId of this.order) {
      await this.plugins[pluginId].init();
    }
  }


  /**
   * Determinate start order.
   */
  private determinateOrder() {
    let ids = Object.keys(this.plugins);

    for (let id of Object.keys(this.plugins)) {
      let plugin: any = this.plugins[id]; // TODO: Type after interface.
      if (plugin.hasOwnProperty('dependencies')) {
        let dependencies = plugin.dependencies;
        if (dependencies.length > 0) {
          // Parse, add node and go on.
          this.graph.addDependency(plugin);

          // TODO: Test dependencies loading!
        }
      }
    }

    this.order = this.graph.overallOrder();
  }


  /**
   * Load all models from plugins.
   *
   * @param sequelize {Sequelize}
   *
   * @returns {Promise}
   */
  public async loadModels(sequelize: Sequelize) {
    if (this.order.length === 0) {
      this.determinateOrder();
    }

    for (let id of this.order) {
      if (this.plugins[id].directory) {
        var modelDirectory = path.normalize(this.plugins[id].directory + '/models/');
        var exists = await fs.exists(modelDirectory);
        if (! exists) {
          modelDirectory = path.normalize(this.plugins[id].directory + '/Models/');
          exists = await fs.exists(modelDirectory);
          if (! exists) continue;
        }

        try {
          let list = glob.sync(modelDirectory + '*.js');

          if (list.length > 0) {
            for (let file of list) {
              // Import sequelize model.
              let model: any = sequelize.import(file);

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
            }
          }
        } catch (err) {
          this.app.log.warn('Warning, can\'t load models for plugin ' + id, err.stack);
        }
      }
    }
  }


  /**
   * Emit event on all plugins!
   * Will be in the order calculated on dependencies.
   *
   * @param {string} event
   * @param {object} [params]
   * @param {object} [options]
   */
  public emitAll (event: string, params?: any, options?: any) {
    params = params || {};
    options = options || {};

    // Always do it on the specific order we always use!
    this.order.forEach((id) => {
      this.plugins[id].emit(event, params);
    });
  }
}


let fs = require('fs-promise');// import * as fs from 'fs-promise';
import * as path from 'path';
import * as glob from 'glob';

import {Plugin} from './index';

import {App} from '../App';
import {Sequelize} from 'sequelize';
import {BaseFacade} from '../Util/Facade';
import {DepGraph} from '@tomvlk/dependency-graph';

/**
 * Plugin class.
 * @class PluginManager
 * @type {PluginManager}
 */
export class PluginManager {

  private app: App;
  private graph: any;

  private plugins: {[s: string]: any};

  // Contains incompatible plugins (disabled by system).
  private incompatible: {[s: string]: any};

  // Contains manually disabled plugins.
  private disabled: {[s: string]: any}; // Contains all disabled plugins.

  private order: Array<string>; // Order of plugin UID's.

  private facade: BaseFacade;

  /**
   * Construct plugin manager.
   */
  constructor(facade: Plugin.Facade) {
    this.facade = facade;
    this.app = facade.app;

    this.graph = new DepGraph();

    // ObjectArray
    this.plugins = {};
    this.disabled = {};
    this.incompatible = {};

    // Array of plugin ids in order for starting.
    this.order = [];
  }


  /**
   * Load all plugins in order of requirements/dependencies.
   *
   * @returns {Promise}
   */
  public async loadPlugins() {
    // Register for Mode Changes and Script Changes
    this.app.server.on('mode.change', (transition) => { this.onGameChange('mode', transition); });

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
        var PluginClass: any = require(pluginId).default;

        // Save plugin details to plugin array.
        let plugin = new PluginClass();
        this.plugins[pluginId] = plugin;

        // Inject several properties.
        plugin.inject({
          app: this.app,
          config,
          log: this.app.log.child({plugin: pluginId}),
          settingStore: this.app.settings.getStore(plugin)
        });

        // Is Plugin suited for the Game (trackmania/shootmania)
        var compatible = true;



        if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('games')) {
          if (plugin.game.games.indexOf(this.app.serverFacade.client.gameName) > -1
           || plugin.game.games.length === 0) {
            // All Right! Let's continue.
          } else {
            compatible = false;
          }
        }

        if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes')) {
          if (plugin.game.modes.indexOf(this.app.serverFacade.client.currentMode()) > -1
           || plugin.game.modes.length === 0) {
            // All Right! Let's continue.
          } else {
            compatible = false;
          }
        }

        if (! compatible) {
          // Don't load! Unload from local properties, throw warning.
          this.incompatible[pluginId] = this.plugins[pluginId];

          delete this.plugins[pluginId];
          this.app.log.warn('Plugin \'' + pluginId + '\' is not suited for the current game or mode! Plugin disabled!');
        } else {
          // Register node
          this.graph.addNode(pluginId);
        }
      } catch (err) {
        this.app.log.error(`Plugin ${pluginId} could not be loaded, error: `, err);
      }
    }

    // Set plugins to app plugins.
    this.app.plugins = this.plugins;
  }

  /**
   * Call on MapBegin, will check against current game mode.
   * Will also disable plugins when not compatible with game mode.
   */
  public async begin() {
    // this.pluginChecks()
  }

  /**
   * Check each plugin if it needs to be (re)started or stopped based on gameMode and game.
   */
  private async pluginChecks () {
    let currentMode = this.app.serverFacade.client.currentMode();

    // Check if we need to disable plugins.
    for (let pluginId of Object.keys(this.plugins)) {
      let plugin:any = this.plugins[pluginId];

      if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes') && plugin.game.modes.length > 0) {
        if (plugin.game.modes.indexOf(currentMode) === -1) {
          // Stop!
          await this.disable (pluginId, true);
        }
      }
    }

    // Check if we need to enable plugins.
    for (let pluginId of Object.keys(this.incompatible)) {
      let plugin:any = this.incompatible[pluginId];

      if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes') && plugin.game.modes.length > 0) {
        if (plugin.game.modes.indexOf(currentMode) > -1) {
          // All OK!
          await this.enable (pluginId, true);
        }
      } else {
        await this.enable (pluginId, true);
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
   * Disable plugin.
   * @param pluginId
   */
  public async disable (pluginId: string);
  public async disable (pluginId: string, incompatible?: boolean);

  /**
   * Disable Plugin.
   * @param pluginId
   * @param [incompatible]
   */
  public async disable (pluginId: string, incompatible?: boolean) {
    incompatible = incompatible || false;
    let plugin: any = this.plugins[pluginId];
    if (! plugin) throw new Error('Plugin ID not found in current enabled plugins!');

    this.app.log.info(`Disabling plugin ${pluginId}...`);

    // If the plugin has a stop function, we call it. We think it's a promise. so await.
    if (plugin.hasOwnProperty('stop') && typeof plugin.stop === 'function') {
      let stop = plugin.stop();
      if (stop.hasOwnProperty('then'))
        await stop;
    }

    // Make sure we stop all the UI elements the plugin was ever using!
    await this.app.uiFacade.manager.destroyContextInterfaces(plugin);

    // Move to disabled plugins.
    if (incompatible)
      this.incompatible[pluginId] = plugin;
    else
      this.disabled[pluginId] = plugin;

    // Remove from order list
    let orderNr = this.order.indexOf(pluginId);
    if (orderNr >= 0)
      delete this.order[orderNr];

    delete this.plugins[pluginId];
  }

  /**
   * Enable Plugin that has been disabled before.
   * @param pluginId
   */
  public async enable (pluginId: string);
  public async enable (pluginId: string, forceIncompatible?: boolean);

  /**
   * Enable plugin that has been disabled/unloaded before.
   * @param pluginId
   * @param forceIncompatible
   */
  public async enable (pluginId: string, forceIncompatible?: boolean) {
    var plugin: any;

    if (forceIncompatible && this.incompatible[pluginId])
      plugin = this.incompatible[pluginId];
    else if (this.disabled[pluginId])
      plugin = this.disabled[pluginId];

    if (! plugin) throw new Error('Plugin is not loaded so can not be enabled!');

    if (plugin.hasOwnProperty('game') && plugin.game.hasOwnProperty('modes') && plugin.game.modes.length > 0) {
      if (plugin.game.modes.indexOf(this.app.serverFacade.client.currentMode()) === -1) {
        // Stop loading, it isn't compatible!
        throw new Error('Plugin that is being enabled is not compatible with current Game Mode!');
      }
    }

    this.app.log.info(`Enable plugin ${pluginId}...`);

    // Move it to the enabled plugins.
    this.plugins[pluginId] = plugin;

    // Remove from source.
    if (forceIncompatible && this.incompatible[pluginId]) delete this.incompatible[pluginId];
    else if (this.disabled[pluginId])                     delete this.disabled[pluginId];

    // (Re)import models
    await this.loadPluginModels(plugin, pluginId, this.app.databaseFacade.client.sequelize);

    // Start the plugin Init command.
    await this.plugins[pluginId].init();
  }

  /**
   * On Gamemode Change.
   * @param type
   * @param transition
   */
  private onGameChange (type: string, transition: Array<any>) {
    // Check if plugins needs to be disabled/enabled.
    this.pluginChecks();
  }


  /**
   * Determinate start order.
   */
  private determinateOrder() {
    for (let id of Object.keys(this.plugins)) {
      let plugin: any = this.plugins[id];
      if (plugin.hasOwnProperty('dependencies')) {
        plugin.dependencies.forEach((dep) => {
          try {
            this.graph.addDependency(id, dep);
          } catch (err) {
            this.app.log.fatal(
              `Can't start plugin '${id}'! Dependency to plugin '${dep}' not met. Please install the
               other plugin too, or contact the owner if you think this is an issue with the plugin (${id}).`, err);
            process.exit(1);
          }

        });
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
      await this.loadPluginModels (this.plugins[id], id, sequelize);
    }
  }

  /**
   * Load all models for specific plugin.
   * @param plugin
   * @param id
   * @param sequelize
   */
  private async loadPluginModels (plugin: any, id: string, sequelize: Sequelize) {
    if (plugin.directory) {
      var modelDirectory = path.normalize(plugin.directory + '/models/');
      var exists = await fs.exists(modelDirectory);
      if (! exists) {
        modelDirectory = path.normalize(plugin.directory + '/Models/');
        exists = await fs.exists(modelDirectory);
        if (! exists) return;
      }

      try {
        let list = glob.sync(modelDirectory + '*.js');

        if (list.length > 0) {
          for (let file of list) {
            // Import sequelize model.
            let model: any = sequelize.import(file);

            // Set in the plugin.
            if (! plugin.models) {
              plugin.models = {};
            }
            plugin.models[model.name] = model;

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

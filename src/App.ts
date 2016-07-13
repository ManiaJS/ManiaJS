/**
 * ManiaJS App Class.
 */

import {Logger} from './Util/Logger';
import {ConfigSchema, Configuration} from './Util/Configuration';

import {Server} from './Server/index';
import {Util} from './Util/index';
import {Database} from './Database/index';
import {Plugin} from './Plugin/index';
import {Game} from './Game/index';
import {Setting} from './Setting/index';
import {UI} from './UI/index';

import {SettingManager} from './Setting/SettingManager';
import {Client as ServerClient} from './Server/Client';
import {Logger as Bunyan} from 'bunyan';

/**
 * ManiaJS App
 */
export class App {
  public logger: Logger;
  public log: Bunyan;
  public version: string;
  public config: ConfigSchema;

  /**
   * INTERNAL FACADE
   * Facade classes of components.
   */
  public serverFacade: Server.Facade;
  public databaseFacade: Database.Facade;
  public pluginFacade: Plugin.Facade;
  public gameFacade: Game.Facade;
  public settingFacade: Setting.Facade;
  public uiFacade: UI.Facade;
  public utilFacade: Util.Facade;

  /**
   * PUBLIC INTERFACE VARIABLES
   * Will be used for providing plugins features. Keep stable please.
   */
  public util;
  public ui;
  public players;
  public maps;
  public server: ServerClient;
  public models: { [s: string]: any } = {};
  public plugins: { [s: string]: any } = {}; // TODO: Change to ModulePlugin once the interface is converted too.
  public settings: SettingManager;

  public configuration: Configuration;

  constructor (
    logger: Logger,
    configuration: Configuration
  ) {
    this.configuration = configuration;
    this.config = configuration.config;
    this.version = configuration.version;

    this.logger = logger;
    this.log = logger.log;

    this.serverFacade = new Server.Facade(this);
    this.databaseFacade = new Database.Facade(this);
    this.pluginFacade = new Plugin.Facade(this);
    this.gameFacade = new Game.Facade(this);
    this.settingFacade = new Setting.Facade(this);
    this.uiFacade = new UI.Facade(this);
    this.utilFacade = new Util.Facade(this);

    this.players = this.gameFacade.players;
    this.maps = this.gameFacade.maps;
    this.server = this.serverFacade.client;
    this.settings = this.settingFacade.settingManager;

    this.util = this.utilFacade;
    this.ui = this.uiFacade;
  }

  public async prepare () {
    try {
      await this.serverFacade.init();
      await this.databaseFacade.init();
      await this.settingFacade.init();
      await this.uiFacade.init();
      await this.pluginFacade.init();
      await this.gameFacade.init();
    } catch (err) {
      this.log.fatal(err);
      process.exit(1);
    }
  }

  public async run () {
    try {
      await this.serverFacade.run();
      await this.databaseFacade.run();
      await this.settingFacade.run();
      await this.gameFacade.run();
      await this.uiFacade.run();
      await this.pluginFacade.run();

      this.log.info('Controller Ready!');
      await this.server.send().chat(`$o$f90Mania$o$f90JS$z$fff$s: Controller ready! $n(${this.version})`).exec();
      await this.server.send().chat('$6DFThis server is running $f90Mania$f90JS$6DF, ' +
        'the next generation, enormous fast and plugin based ManiaPlanet server controller.').exec();
      await this.server.send().chat('$6DFMore information about $f90Mania$f90JS$6DF ' +
        'is available on our site $lmaniajs.github.io$l').exec();
    } catch (err) {
      this.log.fatal(err);
    }
  }

  public async exit () {
    this.server.send().chat('$o$f90Mania$o$f90JS$z$fff$s: Controller shutting down!').exec();
    this.pluginFacade.stop();
    this.uiFacade.stop();
    this.gameFacade.stop();
    this.serverFacade.stop();
    this.settingFacade.stop();
    this.databaseFacade.stop();
    this.utilFacade.stop();
  }
}


/**
 * Declare the Plugin Base class module.
 */
declare module '@maniajs/plugin' {
  import {Instance} from 'sequelize';
  import {Model} from 'sequelize';

  /**
   * ManiaJS Typescript Declaration
   * ==============================
   * Use this declaration for typescript plugins to get auto-completion.
   */
  namespace ManiaJS {
    import EventEmitter = NodeJS.EventEmitter;

    namespace Core {
      interface App extends EventEmitter {
        logger: Util.Logger;
        log: Util.Bunyan;

        version: string;
        config: any;

        /**
         * Facades
         */
        serverFacade: Server.Facade;
        databaseFacade: Database.Facade;
        pluginFacade: Core.Plugin.Facade;
        gameFacade: Game.Facade;
        uiFacade: UI.Facade;
        utilFacade: Util.Facade;


        /**
         * PUBLIC INTERFACE VARIABLES
         * Will be used for providing plugins features. Keep stable please.
         */
        util: Util.Facade;
        ui: UI.Facade;
        players: Game.Players;
        maps: Game.Maps;
        server: Server.Client;
        models: { [s: string]: any };
        plugins: { [s: string]: any };

        configuration: Util.Configuration;
      }

      namespace Database {
        interface Facade extends Util.BaseFacade {
          client: Database.Client;
        }

        interface Client {
          sequelize: any; // Sequelize Instance.
        }
      }


      namespace Game {
        interface Facade extends Util.BaseFacade {
          players: Game.Players;
          maps: Game.Maps;
        }

        interface Maps {
          list: {[s: string]: Model.Map};
          current: Model.Map;
        }

        interface Players {
          list: {[s: string]: Model.Player};
          online: {[s: string]: Model.Player | boolean};

          countPlayers(): number;
          countSpectators(): number;

          isPlayer(login: string): boolean;
          isOperator(login: string): boolean;
          isAdmin(login: string): boolean;
          isMasterAdmin(login: string): boolean;
          isMinimal(login: string, level: number): boolean;
          isLevel(login: string, level: number, minimum?: boolean): boolean;

          setLevel(login: string, level: number): Promise<Model.Player>;
          details(player: Model.Player | string): Promise<any>;
        }

      }

      namespace Model {
        interface Map extends Instance<any> {
          uid: string;
          name: string;
          author: string;
          environment: string;
        }

        interface Player extends Instance<any> {
          login: string;
          nickname: string;
          level: number;
        }

        /*interface MapModel extends Model<any, any> {
          name: string;
        }

        interface PlayerModel extends Model<any, any> {
          name: string;
        }*/
      }


      namespace Plugin {
        interface Facade extends Util.BaseFacade {
          manager: Core.Plugin.PluginManager;
        }

        interface PluginManager {
          /**
           * Emit Event on all plugins.
           *
           * @param event
           * @param params
           * @param options
           */
          emitAll(event: string, params?: any, options?: any)
        }
      }


      namespace Server {
        interface Facade extends Util.BaseFacade {
          client: Server.Client;
        }

        interface Client {
          gbx: GbxRemote;
          command: CommandManager;
          callback: CallbackManager;

          /**
           * Server Configuration
           */
          server: any;

          titleId: string;
          version: string;
          build: string;
          apiVersion: string;
          login: string;
          name: string;
          comment: string;
          path: string;
          ip: string;
          ports: {port?: number, P2PPort?: number};
          playerId: string; // TODO: Number?

          paths: {
            data: string,
            maps: string,
            skins: string
          };

          gameName: Game;

          options: any;
          game: any;

          send(): Send;

          updateInfos(): Promise<any>;
          isScripted(): boolean;
          currentMode(): number;
          getServerOptions(): Promise<any>;
          getGameInfos(): Promise<any>;
          getServerDirectories(): Promise<any>;
        }
        enum Game {
          trackmania, shootmania
        }

        interface GbxRemote extends EventEmitter {
          constructor (port: number, address: string);
          connect (): Promise<any>;
          query (name: string, params?: any[]): Promise<any>;
        }

        interface CommandOptions {
          level?: number;
          hide?: boolean;
          text?: string;
          strict?: boolean;
          admin?: boolean;
          command?: string;
        }
        interface CommandManager {
          on(command: string, options: CommandOptions, callback: Function);
          once(command: string, level: number, callback: Function);
          register(command: string, options: CommandOptions | string | number | any, callback: Function, single?: boolean);
        }

        interface CallbackManager {
          register(options: CallbackOptions): Promise<any>;
          loadSet(name: string);
        }
        interface CallbackOptions {
          callback: string;
          event: string;
          parameters?: {[s: string]: number};

          game?: Game[];
          type?: CallbackType;

          flow? (app: App, params: any): Promise<any>;
          pass? (params: any): boolean;
          parse? (raw: any): any;
        }
        enum CallbackType {
          native,
          scripted
        }

        interface Send {
          chat (text: string, options?: SendChatOptions): this;
          custom (query: string, params?: any): this;
          exec (): Promise<any>;
        }
        interface SendChatOptions {
          source?: SendChatSource;
          destination?: boolean | string;
        }
        enum SendChatSource {
          player, server, global
        }
      }

      namespace UI {
        interface Facade extends Util.BaseFacade {
          manager: UIManager;
          generic: GenericInterface;

          /**
           * Get a builder instance.
           *
           * @param {{}} context Give the plugin class, or app class (for core).
           * @param {string} viewName View File Name.
           * @param {number} [version] Optional manialink version (defaults to 2)
           * @param {string} [idSuffix] Optional unique id suffix.
           * @returns {Interface}
           */
          build (context: any, viewName: string, version?: number, idSuffix?: string): Interface

          /**
           * Prepare List Interface for given column metadata, and given data. To Display, do .display().
           *
           * => Click on column > subscribe on events you provided with the event in columns.
           * => Returning parameter will be the record on that position.
           *
           * When close is called the view will be vanished automatically! But you still need to cleanup your variables!
           * When next/prev is called, the data will be automatically sliced and used. (the events will still be called).
           *
           * @param {string} title Title of list.
           * @param {string} player Player Login (single login!).
           * @param {[{name: {string}, field: {string}, width: {number}, [level]: {number}, [event]: {string}}]} columns Columns to define.
           * @param {[{}]} data Array with objects. Give a custom manialink with the 'custom' key. This will be injected into the row!
           *
           * @returns {ListView} ListView Interface on success!
           */
          list (title: string, player: string, columns: any, data: any): ListView;

          /**
           * Prepare and make Alert interface. To display call .display() on the result.
           *
           * @param {string} title Title Text
           * @param {string} message Message Text
           * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
           * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
           * @param {string} [button] Button text, default 'OK'
           * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
           * @param {string} [iconsubstyle] Icon Sub Style, default 'Editor'
           *
           * @returns {Interface} Interface Object, call .display() to display to the login(s).
           */
          alert (title: string, message: string, players: string | string[],
                 size?: string, button?: string, iconstyle?: string, iconsubstyle?: string): Interface;

          /**
           * Prepare and make Confirm interface. To display call .display() on the result.
           * To get answer, subscribe on the interface with .once('core_button_yes', function()); or core_button_no
           *
           * @param {string} title Title Text
           * @param {string} message Message Text
           * @param {string[]|string} players Player Logins to display to, empty for all players, single string for only one login
           * @param {string} [size] Size, could be 'sm', 'md' or 'lg'. (small to big). Default 'md'.
           * @param {string} [buttonYes] Button text, default 'Yes'
           * @param {string} [buttonNo] Button text, default 'No'
           * @param {string} [iconstyle] Icon Style, default 'Icons128x128_1'
           * @param {string} [iconsubstyle] Icon Sub Style, default 'Options'
           *
           * @returns {Interface} Interface Object, call .display() to display to the login(s).
           */
          confirm (title: string, message: string, players: string | string[],
                   size?: string, buttonYes?: string, buttonNo?: string,
                   iconstyle?: string, iconsubstyle?: string): Interface;
        }

        /**
         * Its better to use the functions on Interface instance itself!.
         */
        interface UIManager extends EventEmitter {
          update(ui: Interface, force: boolean, logins: string[]): Promise<any>;
          sendInterface(ui: Interface, force: boolean, updateLogins: string[]): Promise<any>;
          destroy(id: string, logins?: string[] | boolean, hide?: boolean): Promise<any>;
        }

        // Skip this interface as it's only for internal use.
        interface GenericInterface {
        }


        interface ListView extends EventEmitter {
          title: string;
          player: ManiaJS.Core.Model.Player;
          columns: any;
          data: any;
          range: {start: number, stop: number};

          ui: Interface;

          /**
           * @internal
           * @private
           */
          parse();

          /**
           * List Event Handler.
           *
           * @param {string} event
           * @param {{}}     params
           */
          handle (event: string, params?: any);

          /**
           * Start displaying to player.
           *
           * @returns {Promise}
           */
          display (): Promise<any>;

          /**
           * Stop displaying to player.
           *
           * @returns {Promise}
           */
          close (): Promise<any>;

          /**
           * Get UI instance.
           * @returns {Interface}
           */
          toUI (): Interface;
        }


        interface Interface {
          file: string;
          version: number;
          template: any;
          timeout: number;
          hideClick: boolean;

          /**
           * @private
           * @internal
           */
          globalData: any;
          /**
           * @private
           * @internal
           */
          playerData: {[s: string]: any};

          forceUpdate: boolean;
          playersChanged: any[];

          compile();

          /**
           * Set Data for the template.
           * @param {{}} data
           *
           * @returns {Interface}
           */
          global(data: any): this;

          /**
           * Set Data for the template, for a specific player.
           * @param {string} login Player Login.
           * @param {{}} [data] Data. Indexed by Player Logins.
           *
           * @returns {Interface}
           */
          player(login: string, data?: any): this;

          /**
           * Display
           * @returns {Promise}
           */
          display(): Promise<any>;
          update(): Promise<any>;

          /**
           * Hide the current ManiaLink.
           * @param {string[]|boolean} [logins] Optional logins to hide the interface. Ignore or false for all players.
           * @returns {Promise}
           */
          hide (logins?: string[]): Promise<any>;

          /**
           * Destroy data and hide manialink. This will clear the data arrays! Please use this when you want to cleanup!
           * @param {string[]} [logins] Optional logins, when provided we will not clear global data!.
           * @param {boolean} [noHide] Optional, don't send empty manialink to hide, default false.
           * @returns {Promise}
           */
          destroy (logins?: string[], noHide?: boolean): Promise<any>;

          /**
           * Remove all listeners from manager.
           */
          removeAllListeners();

          /**
           * On Answer.
           * @param {string} action Action Name.
           * @param {callback} callback Callback.
           * @params {object} callback.data
           */
          on (action: string, callback: Function);

          /**
           * Once Answer.
           * @param {string} action Action Name.
           * @param {callback} callback Callback.
           * @params {object} callback.data
           */
          once (action: string, callback: Function);
        }
      }

      namespace Util {
        interface Facade extends BaseFacade {
          times: Times;
          gbx: any;
        }

        interface Times {
          /**
           * Get maniaplanet time in string format.
           *
           * @param {number} input
           * @returns {string}
           */
          stringTime (input): string;
        }

        interface BaseFacade {
          app: Core.App;
          log: Core.Util.Logger;
          config: Core.Util.Configuration;

          constructor (app: App);

          init(): Promise<any>;
          run (): Promise<any>;
          stop(): Promise<any>;
        }

        interface Logger {
          log: Bunyan;
        }

        interface Bunyan {
          addStream(stream:any):void;
          addSerializers(serializers:any):void;
          child(options:any, simple?:boolean):Logger;
          child(obj:Object, simple?:boolean):Logger;
          reopenFileStreams():void;

          level():string|number;
          level(value: number | string):void;
          levels(name: number | string, value: number | string):void;

          fields:any;
          src:boolean;

          trace(error:Error, format?:any, ...params:any[]):void;
          trace(buffer:Buffer, format?:any, ...params:any[]):void;
          trace(obj:Object, format?:any, ...params:any[]):void;
          trace(format:string, ...params:any[]):void;
          debug(error:Error, format?:any, ...params:any[]):void;
          debug(buffer:Buffer, format?:any, ...params:any[]):void;
          debug(obj:Object, format?:any, ...params:any[]):void;
          debug(format:string, ...params:any[]):void;
          info(error:Error, format?:any, ...params:any[]):void;
          info(buffer:Buffer, format?:any, ...params:any[]):void;
          info(obj:Object, format?:any, ...params:any[]):void;
          info(format:string, ...params:any[]):void;
          warn(error:Error, format?:any, ...params:any[]):void;
          warn(buffer:Buffer, format?:any, ...params:any[]):void;
          warn(obj:Object, format?:any, ...params:any[]):void;
          warn(format:string, ...params:any[]):void;
          error(error:Error, format?:any, ...params:any[]):void;
          error(buffer:Buffer, format?:any, ...params:any[]):void;
          error(obj:Object, format?:any, ...params:any[]):void;
          error(format:string, ...params:any[]):void;
          fatal(error:Error, format?:any, ...params:any[]):void;
          fatal(buffer:Buffer, format?:any, ...params:any[]):void;
          fatal(obj:Object, format?:any, ...params:any[]):void;
          fatal(format:string, ...params:any[]):void;
        }

        interface Configuration {
          config: ConfigSchema;
          version: string;

          load(location?: string);
          validate(): boolean;
        }
        interface ConfigSchema {
          config: AppConfig,
          plugins:{
            [s: string]: PluginConfig
          }
        }
        interface AppConfig {
          debug: boolean,
          server: {
            address: string,
            port: number,
            authentication: {
              username: string,
              password: string
            },
            game: Core.Server.Game,
          },
          masteradmins?: string[],
          db: {
            dialect: DatabaseDialect,
            database: string,
            authentication: {
              username: string,
              password: string
            },
            pool: {
              min: number,
              max: number,
              idle: number
            },
            mysql: {
              host: number,
              port: number
            },
            mariadb: {
              host: number,
              port: number
            },
            sqlite: {
              storage: string
            },
            debug?: boolean
          }
        }
        interface PluginConfig {

        }
        enum DatabaseDialect {
          mssql,
          mysql,
          sqlite,
          postgres
        }
      }
    }

    namespace Plugin {
      interface GameRequirements {
        games?: string[];
        modes?: any[];
      }

      interface Author {
        name: string;
        email?: string;
        website?: string;
      }

      /**
       * Abstract Plugin base.
       * @abstract
       * @type {BasePlugin}
       * @class BasePlugin
       * @namespace ManiaJS.Plugin
       */
      abstract class BasePlugin {
        public name: string;
        public author: Author[];
        public version: string;
        public directory: string;

        public dependencies: string[];
        public game: GameRequirements;

        /**
         * Following will be available after inject has been completed
         */
        public app: ManiaJS.Core.App;
        public log: ManiaJS.Core.Util.Bunyan;
        public server: ManiaJS.Core.Server.Client;
        public players: ManiaJS.Core.Game.Players;
        public maps: ManiaJS.Core.Game.Maps;
        public plugins: any;
        public ui: ManiaJS.Core.UI.Facade;
        public models: {[s: string]: any};

        /**
         * Make sure you don't use any of the app or other local properties yet. Only fill in the details about the
         * plugin and prepare some properties. Create interfaces in the init() function!.
         */
        constructor ();

        /**
         * Init Function, Start all the components, from now the app property and several other properties are filled
         * Please return a promise, also if you are not doing anything here.
         * Rejecting the promise will stop the pluginmanager from loading all plugins, be carefully to only reject
         * when it's really an issue and the controller should really stop!
         *
         * @returns {Promise}
         */
        init (): Promise<any>;

        /**
         * Stop function. Return promise and do stop tasks, make sure you don't take too long to stop the tasks!
         * @ignore Is not yet implemented in the manager!
         *
         * @returns {Promise}
         */
        stop (): Promise<any>;

        /**
         * Inject function is used between the contruction and init() commands. Will inject the ManiaJS instance itself
         * into the plugin. Please don't override this as the footprint may change!
         * @internal
         * @param args
         */
        inject (...args)

        // EventEmitter functions
        addListener(event: string, listener: Function): this;
        on(event: string, listener: Function): this;
        once(event: string, listener: Function): this;
        removeListener(event: string, listener: Function): this;
        removeAllListeners(event?: string): this;
        setMaxListeners(n: number): this;
        getMaxListeners(): number;
        listeners(event: string): Function[];
        emit(event: string, ...args: any[]): boolean;
        listenerCount(type: string): number;
      }
    }
  }

  export default ManiaJS.Plugin.BasePlugin;
  export class BasePlugin extends ManiaJS.Plugin.BasePlugin {}
}

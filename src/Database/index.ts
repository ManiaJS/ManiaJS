
import {BaseFacade} from '../Util/facade';
import {Client} from './Client';
import {App} from '../App';

export module Database {
  /**
   * Database Facade
   */
  export class Facade extends BaseFacade {
    /**
     * Database Client.
     */
    public client: Client;

    constructor (
      app: App
    ) {
      super(app);

      this.client = new Client(this);
    }

    /**
     * Connect to database.
     */
    public async init () {
      this.app.log.debug('Connecting to database...');
      await this.client.connect();
    }

    /**
     * Register and sync with database.
     */
    public async run () {
      this.app.log.debug('Registering models...');

      await this.defineModels();
      await this.client.sync();
    }

    /**
     * Stop.
     */
    public async stop () {

    }

    /**
     * Define and register models (sequelize).
     */
    private async defineModels () {
      try {
        // Load core models
        await this.client.loadCoreModels();

        // Plugin models.
        await this.app.pluginFacade.manager.loadModels(this.client.sequelize);
      } catch (error) {
        this.app.log.fatal('Fatal error with syncing/connecting to the database', error.stack);
        process.exit(1);
      }
    }
  }
}

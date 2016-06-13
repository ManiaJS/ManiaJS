
import {App} from '../App';
import {Logger} from './Logger';
import {Configuration} from './Configuration';

export abstract class BaseFacade {

  public app: App;
  public log: Logger;
  public config: Configuration;

  constructor (
    app: App
  ) {
    this.app = app;
    this.log = app.logger;
    this.config = app.configuration;
  }

  public abstract async init();
  public abstract async run();
  public abstract async stop();
}

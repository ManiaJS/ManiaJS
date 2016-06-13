
import {BaseFacade} from '../Util/Facade';
import {Client} from './Client';
import {Configuration} from '../Util/Configuration';
import {App} from '../App';

export module Server {
  export class Facade extends BaseFacade {

    public client: Client;

    constructor (
      app: App
    ) {
      super(app);

      this.client = new Client(this);
    }

    public async init() {
      return this.client.connect();
    }

    public async run () {
      this.client.register();
    }

    public async stop () {}
  }
}

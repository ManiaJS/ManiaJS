

import {BaseFacade} from '../Util/Facade';
import Players from './Players';
import {Maps} from './Maps';
import {Configuration} from '../Util/Configuration';
import {App} from '../App';

export module Game {
  export class Facade extends BaseFacade {

    public players: Players;
    public maps: Maps;

    constructor (
      app: App
    ) {
      super(app);

      this.players = new Players(this);
      this.maps = new Maps(this);
    }

    public async init() {}

    public async run () {
      await this.players.boot();
      await this.maps.boot();
    }

    public async stop() {}
  }
}

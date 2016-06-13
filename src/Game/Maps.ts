/**
 * Maps Game Flow
 */

import {App} from '../App';
import {Model} from 'sequelize';
import {Instance} from 'sequelize';
import {Game} from './index';

// TODO
export interface Map extends Instance<any> {

}

/**
 * Maps game flow class.
 *
 * @class Maps
 * @type {Maps}
 */
export class Maps {

  private facade: Game.Facade;
  private app: App;

  public list: {[s:string]: Map};
  public current: Map;

  constructor(facade: Game.Facade) {
    this.facade = facade;
    this.app = facade.app;

    /**
     * Maplist.
     *
     * Key:   uid
     * Value: object
     *
     * @type {{string: Map}}
     */
    this.list = {};

    /**
     * Current Map.
     *
     * @type {Map}
     */
    this.current = null;
  }

  public async boot() {
    let Map: Model<any,any> = this.app.models['Map'];

    // Get all maps on server, sync with database.
    let mapList: any[] = await this.app.serverFacade.client.gbx.query('GetMapList', [-1, 0]);

    // Clear current list first.
    this.list = {};

    // TODO: Define interfaces for the maniaplanet return values.
    for (let data of mapList) {
      let exists = await Map.findOne({where: {uid: data.UId}});
      if (! exists) {
        let map = await Map.create({
          uid: data.UId,
          name: data.Name,
          author: data.Author,
          environment: data.Environnement
        });

        // Save created database model to local list.
        this.list[data.UId] = map;

      } else {
        // Name update?
        if (exists.name !== data.Name) {
          exists.set('name', data.Name);
          let map = await exists.save();
          this.list[data.UId] = map;
        } else {
          this.list[data.UId] = exists;
        }
      }
    }

    // The sync with db is done, now check the current map and set it in the this.current
    let currentMapInfo = await this.app.serverFacade.client.gbx.query('GetCurrentMapInfo', []);
    if (currentMapInfo) {
      this.current = this.list[currentMapInfo.UId];
    }
  }

  /**
   * Begin map call.
   *
   * @param uid
   */
  public async begin(uid) {
    if (this.list.hasOwnProperty(uid)) {
      this.current = this.list[uid];
    }

    // TODO: When not yet in the list.

    return Promise.resolve();
  }


  // TODO: Adding maps should do something with the maplist.
}

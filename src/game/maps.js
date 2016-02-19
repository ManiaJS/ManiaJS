/**
 * Maps Game Flow
 */
'use strict';

import * as async from 'async';


/**
 * Maps game flow class.
 *
 * @class Maps
 */
export default class {
  constructor(app) {
    this.app = app;

    /**
     * Maplist.
     *
     * Key:   uid
     * Value: object
     *
     * @type {{}}
     */
    this.list = {};

    /**
     * Current Map.
     *
     * @type {null}
     */
    this.current = null;
  }

  boot() {
    let Map = this.app.models.Map;

    // Get all maps on server, sync with database.
    return new Promise((resolve, reject) => {
      this.app.serverFacade.client.gbx.query('GetMapList', [-1, 0]).then((res) => {
        // Clear list first.
        this.list = {};

        // Loop foreach async (parallel).
        async.eachSeries(res, (data, callback) => {
          Map.findOne({
            where: {
              uid: data.UId
            }
          }).then((map) => {
            if (! map) {
              // Create
              Map.create({
                uid: data.UId,
                name: data.Name,
                author: data.Author,
                environment: data.Environnement
              }).then((map) => {
                this.list[data.UId] = map;

                return callback();
              });
            } else {
              // Already in there.
              // Name update?
              if (map.name !== data.Name) {
                map.set('name', data.Name);
                map.save().then((map) => {
                  this.list[data.UId] = map;
                  return callback();
                }).catch((err) => {
                  return callback(err);
                });
              } else {
                this.list[data.UId] = map;
                return callback();
              }
            }
          }).catch((err) => {
            return callback(err);
          })
        }, (err) => {
          if (err) {
            return reject(err);
          }

          // The sync with db is done, now check the current map and set it in the this.current
          this.app.serverFacade.client.gbx.query('GetCurrentMapInfo', []).then((res) => {
            if (res) {
              this.current = this.list[res.UId];
            }
            return resolve();
          }).catch((err) => {
            return reject(err);
          });
        });
      });
    });
  }

  /**
   * Begin map call.
   *
   * @param uid
   */
  begin(uid) {
    if (this.list.hasOwnProperty(uid)) {
      this.current = this.list[uid];
    }

    // TODO: When not yet in the list.

    return Promise.resolve();
  }


  // TODO: Adding maps should do something with the maplist.
}

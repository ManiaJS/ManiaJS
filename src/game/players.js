/**
 * Players Game Flow
 */
'use strict';

import * as async from 'async';


/**
 * Players game flow class.
 *
 * @class Players
 */
export default class {
  constructor(app) {
    this.app = app;

    /**
     * List with players currently on the server.
     * Includes fetched data from database.
     *
     * Key: login
     * Value: Player object
     *
     * @type {{}}
     */
    this.list = {};
  }

  boot() {
    // Get all current players, controller just boot.
    return new Promise((resolve, reject) => {
      this.app.serverFacade.client.gbx.query('GetPlayerList', [-1, 0], (err, players) => {
        // Loop and fetch players.
        async.eachSeries(players, (player, callback) => {
          if (player.PlayerId === 0) {
            // Skip, its the server.
            return callback();
          }

          // Fetch from database
          this.update(player.Login, player.NickName)
            .then(() => {
              callback();
            })
            .catch((err) => {
              callback(err);
            });
        }, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
    });
  }


  /**
   * Call when player connect event is given.
   *
   * @param login
   * @returns {Promise.<T>}
   */
  connect(login) {
    return Promise.resolve();
  }

  /**
   * Call when info changed.
   *
   * @param login
   * @param nickname
   * @returns {Promise}
   */
  update(login, nickname) {
    let Player = this.app.models.Player;

    return new Promise((resolve, reject) => {
      if (! this.list.hasOwnProperty(login)) {
        // Fetch or create from db.
        Player.findOne({
          where: {
            login: login
          }
        }).then((player) => {
          if (! player) {
            // Create
            return Player.create({
              login: login,
              nickname: nickname
            }).then((player) => {
              this.list[login] = player;

              return resolve();
            }).catch((err) => {
              return reject(err);
            });
          }

          if (player.nickname === nickname) {
            this.list[login] = player;
            return resolve();
          }

          // Update
          player.set('nickname', nickname);
          player.save()
            .then((player) => {
              this.list[login] = player;
              resolve();
            })
            .catch((err) => {
              reject(err);
            });

        }).catch((err) => {
          reject(err);
        });
      }
    });
  }

  /**
   * Call disconnected
   * @param login
   */
  disconnect(login) {
    // Remove from this.list (after 5 seconds);
    setTimeout(() => {
      if (this.list.hasOwnProperty(login)) {
        delete this.list[login];
      }
    }, 5000);
  }
}
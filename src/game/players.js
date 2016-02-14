/**
 * Players Game Flow
 */
'use strict';


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
    // TODO: Make this working.

    return Promise.resolve();
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
    // Remove from this.list;
    if (this.list.hasOwnProperty(login)) {
      delete this.list[login];
      console.log(this.list);
    }
  }
}
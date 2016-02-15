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
            return callback();
          }
          let isSpectator =       player.SpectatorStatus           % 10;
          let isTempSpectator =  (player.SpectatorStatus / 10)     % 10;
          let isPureSpectator =  (player.SpectatorStatus / 100)    % 10;
          let autoTarget =       (player.SpectatorStatus / 1000)   % 10;
          let targetId =         (player.SpectatorStatus / 10000)      ;
          let info = {
            login: player.Login,
            nickName: player.NickName,
            playerId: player.PlayerId,
            teamId: player.TeamId,
            spectatorStatus: player.SpectatorStatus,
            flags: player.Flags,

            isSpectator: isSpectator,
            isTempSpectator: isTempSpectator,
            isPureSpectator: isPureSpectator,
            autoTarget: autoTarget,
            targetId: targetId
          };

          // Fetch from database
          this.update(player.Login, player.NickName, info)
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
   * Count players (non-spectators).
   * @returns {int}
   */
  countPlayers() {
    return this.list.filter((value) => {
      return value.hasOwnProperty('info') && ! value.info.isSpectator;
    }).length;
  }

  /**
   * Count players (non-spectators).
   * @returns {int}
   */
  countSpectators() {
    return this.list.filter((value) => {
      return value.hasOwnProperty('info') && value.info.isSpectator;
    }).length;
  }

  /**
   * Is Login Player?
   *
   * @param {string} login
   * @returns {boolean}
   */
  isPlayer(login) {
    return this.isLevel(login, 0);
  }

  /**
   * Is Login Operator?
   *
   * @param {string} login
   * @returns {boolean}
   */
  isOperator(login) {
    return this.isLevel(login, 1);
  }

  /**
   * Is Login Admin?
   *
   * @param {string} login
   * @returns {boolean}
   */
  isAdmin(login) {
    return this.isLevel(login, 2);
  }

  /**
   * Is Login MasterAdmin?
   *
   * @param {string} login
   * @returns {boolean}
   */
  isMasterAdmin(login) {
    return this.isLevel(login, 3);
  }

  /**
   * Is Login Minimum Level?
   *
   * @param {string} login
   * @param {number} level Mininum level, 0, 1, 2 or 3.
   * @returns {boolean}
   */
  isMinimal(login, level) {
    return this.isLevel(login, level, true);
  }

  /**
   * Is Login Level.
   *
   * @private
   * @param login
   * @param level
   * @param minimum
   * @returns {boolean}
   */
  isLevel(login, level, minimum) {
    minimum = minimum || false;
    if (this.list.hasOwnProperty(login)) {
      if (minimum) {
        return (this.list[login].level >= level);
      }
      return (this.list[login].level === level);
    }
    return false;
  }

  /**
   * Set Player Level.
   *
   * @param {string} login
   * @param {number} level
   * @returns {Promise}
   */
  setLevel(login, level) {
    if (this.list.hasOwnProperty(login)) {
      this.list[login].set('level', level);
      return this.list[login].save();
    }
    return Promise.reject(new Error('Player not in list!'));
  }




















  /**
   * GAME FLOW FUNCTIONS
   */



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
   * @param info
   * @returns {Promise}
   */
  update(login, nickname, info) {
    info = info || {};

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
              player.info = info;
              this.list[login] = player;

              return resolve();
            }).catch((err) => {
              return reject(err);
            });
          }

          if (player.nickname === nickname) {
            player.info = info;
            this.list[login] = player;
            return resolve();
          }

          // Update
          player.set('nickname', nickname);
          player.save()
            .then((player) => {
              player.info = info;
              this.list[login] = player;
              resolve();
            })
            .catch((err) => {
              reject(err);
            });

        }).catch((err) => {
          reject(err);
        });
      } else {
        // Update info only.
        this.list[login].info = info;
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
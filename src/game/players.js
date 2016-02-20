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
     * @type {object}
     */
    this.list = {};

    // Holds connecting locks.
    this.online = {};
  }

  boot() {
    // Get all current players, controller just boot.
    return new Promise((resolve, reject) => {
      this.app.serverFacade.client.gbx.query('GetPlayerList', [-1, 0, 1]).then((players) => {
        async.eachSeries(players, (player, callback) => {
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
          this.connect(player.Login, player.NickName, info)
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
    var num = 0;
    if (! this.list) return num;

    for (let login in this.list) {
      let one = this.list[login];
      if (one.info && ! one.info.isSpectator) {
        num++;
      }
    }
    return num;
  }

  /**
   * Count players (non-spectators).
   * @returns {int}
   */
  countSpectators() {
    var num = 0;
    if (! this.list) return num;

    for (let login in this.list) {
      let one = this.list[login];
      if (one.info && one.info.isSpectator) {
        num++;
      }
    }
    return num;
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
   * @param {string|Instance} login
   * @param {number} level
   * @returns {Promise}
   */
  setLevel(login, level) {
    if (typeof login !== 'string') {
      login.set('level', level);
      return login.save();
    } else {
      if (this.list.hasOwnProperty(login)) {
        this.list[login].set('level', level);
        return this.list[login].save();
      }
    }
    return Promise.reject(new Error('Player not in list!'));
  }




















  /**
   * GAME FLOW FUNCTIONS
   */



  /**
   * Call on info change (on connection, first time only)
   *
   * @param login
   * @param nickname
   * @param info
   * @param {boolean} [emit] Emit connect? default false.
   * @returns {Promise}
   */
  connect(login, nickname, info, emit) {
    info = info || {};
    emit = emit || false;

    if (this.online.hasOwnProperty(login) && this.online[login]) {
      return Promise.resolve();
    }

    if (this.list.hasOwnProperty(login) && this.list[login].disconnected) {
      delete this.list[login];
    }

    this.online[login] = false;

    return new Promise((resolve, reject) => {
      let Player = this.app.models.Player;

      // Fetch or create from db.
      Player.findOne({
        where: {
          login: login
        }
      }).then((player) => {
        if (!player) {
          // Create
          return Player.create({
            login: login,
            nickname: nickname
          }).then((player) => {
            return resolve(player);
          }).catch((err) => {
            return reject(err);
          });
        }

        if (player.nickname === nickname) {
          return resolve(player);
        }

        // Update
        player.set('nickname', nickname);
        return player.save()
          .then((player) => {
            return resolve(player);
          })
          .catch((err) => {
            return reject(err);
          });
      }).catch((err) => {
        return reject(err);
      });
    }).then((player) => {
      if (!player) {
        // No update!
        return Promise.resolve(player);
      }

      // Maybe this player is the masteradmin? (see config).
      if (this.app.config.hasOwnProperty('masteradmins') && this.app.config.masteradmins) {
        if (this.app.config.masteradmins.filter((adminLogin => adminLogin === login)).length > 0) {
          // Yes! Make the player admin!
          return this.setLevel(player, 3);
        }
      }
      return Promise.resolve(player);
    }).then((player) => {
      // If already, then stop!.
      if (this.list.hasOwnProperty(login)) {
        return Promise.resolve(player);
      }

      // Save to local list. Remove lock.
      player.info = info;
      this.list[login] = player;

      if (! this.online[login]) {
        this.online[login] = true;

        // Now call the player.connect event
        if (emit) {
          this.app.serverFacade.client.emit('player.connect', this.list[login].info);
        }

        return Promise.resolve(player);
      }
      return Promise.resolve(player);
    }).catch((err) => {
      this.app.log.error(err);
    });

  }

  /**
   * Call disconnected
   * @param login
   */
  disconnect(login) {
    if (this.list.hasOwnProperty(login)) {
      this.list[login].disconnected = true;
    }
    if (this.online.hasOwnProperty(login)) {
      delete this.online[login];
    }

    // Remove later.
    setTimeout(() => {
      if (this.list.hasOwnProperty(login) && ! this.online.hasOwnProperty(login)) {
        delete this.list[login];
      }
    }, 5000);

    return Promise.resolve();
  }
}

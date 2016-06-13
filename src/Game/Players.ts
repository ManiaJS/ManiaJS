/**
 * Players Game Flow
 */
'use strict';

import {App} from '../App';
import {Instance} from 'sequelize';
import {Game} from './index';

export interface Player extends Instance<any> {
  login: string;
  nickname: string;

  info: PlayerInfo | boolean;
  level: number;

  disconnected: boolean;
}

export interface PlayerInfo {
  login: string;
  nickName: string;
  playerId: number;
  teamId: number;
  spectatorStatus: number;
  flags: number;

  isSpectator: boolean;
  isTempSpectator: boolean;
  isPureSpectator: boolean;
  autoTarget: number;
  targetId: number;
}

/**
 * Players game flow class.
 *
 * @class Players
 * @type {Players}
 */
export default class Players {

  /**
   * List with players currently on the server.
   * Includes fetched data from database.
   *
   * Key: login
   * Value: Player object
   *
   * @type {object}
   */
  public list: {[s: string]: Player};
  public online: {[s: string]: Player | boolean};

  private app: App;
  private facade: Game.Facade;

  constructor(facade: Game.Facade) {
    this.facade = facade;
    this.app = facade.app;

    this.list = {};
    this.online = {};
  }

  public async boot() {
    let playerList: any[] = await this.app.serverFacade.client.gbx.query('GetPlayerList', [-1, 0, 1]);

    for (let data of playerList) {
      let isSpectator =       data.SpectatorStatus           % 10;
      let isTempSpectator =  (data.SpectatorStatus / 10)     % 10;
      let isPureSpectator =  (data.SpectatorStatus / 100)    % 10;
      let autoTarget =       (data.SpectatorStatus / 1000)   % 10;
      let targetId =         (data.SpectatorStatus / 10000)      ;
      let info = {
        login: data.Login,
        nickName: data.NickName,
        playerId: data.PlayerId,
        teamId: data.TeamId,
        spectatorStatus: data.SpectatorStatus,
        flags: data.Flags,

        isSpectator: isSpectator,
        isTempSpectator: isTempSpectator,
        isPureSpectator: isPureSpectator,
        autoTarget: autoTarget,
        targetId: targetId
      };

      // Let the connect function simulate a connection
      await this.connect(data.Login, data.NickName, info);
    }
  }

  /**
   * Count players (non-spectators).
   * @returns {int}
   */
  public countPlayers(): number {
    var num = 0;
    if (! this.list) return num;

    for (let login in this.list) {
      if (! this.list.hasOwnProperty(login)) continue;
      let one = this.list[login];
      let info: any = this.list[login].info;
      if (info && ! info.isSpectator) {
        num++;
      }
    }
    return num;
  }

  /**
   * Count players (non-spectators).
   * @returns {int}
   */
  public countSpectators(): number {
    var num = 0;
    if (! this.list) return num;

    for (let login in this.list) {
      if (! this.list.hasOwnProperty(login)) continue;
      let one = this.list[login];
      let info: any = one.info;
      if (info && info.isSpectator) {
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
  public isPlayer(login: string): boolean {
    return this.isLevel(login, 0);
  }

  /**
   * Is Login Operator?
   *
   * @param {string} login
   * @returns {boolean}
   */
  public isOperator(login: string): boolean {
    return this.isLevel(login, 1);
  }

  /**
   * Is Login Admin?
   *
   * @param {string} login
   * @returns {boolean}
   */
  public isAdmin(login: string): boolean {
    return this.isLevel(login, 2);
  }

  /**
   * Is Login MasterAdmin?
   *
   * @param {string} login
   * @returns {boolean}
   */
  public isMasterAdmin(login: string): boolean {
    return this.isLevel(login, 3);
  }

  /**
   * Is Login Minimum Level?
   *
   * @param {string} login
   * @param {number} level Mininum level, 0, 1, 2 or 3.
   * @returns {boolean}
   */
  public isMinimal(login: string, level: number): boolean {
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
  public isLevel(login: string, level: number, minimum?: boolean): boolean {
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
  public async setLevel(login, level) {
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
   * Get Details (Promise!).
   *
   * @param {Player|string} player Player db object or login!
   * @returns {Promise<{}>}
   */
  public async details (player): Promise<any> { // todo: declare the interface of returning value type.
    let login = player.login || player;
    return this.app.server.send().custom('GetDetailedPlayerInfo', [login]).exec();
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
   * @returns {Promise<Player>}
   */
  public async connect(login: string, nickname: string, info?: PlayerInfo | boolean | any,
                       emit?: boolean): Promise<Player> {
    info = info || {};
    emit = emit || false;

    try {
      if (this.online.hasOwnProperty(login) && this.online[login])
        return null;

      if (this.list.hasOwnProperty(login) && this.list[login].disconnected)
        delete this.list[login];

      this.online[login] = false; // Set on false for now, set on true after fetching is completed.

      let Player = this.app.models['Player'];
      var player: Player = await Player.findOne({where: {login: login}});

      // If player doesnt exist in database, create it!
      if (! player) {
        player = await Player.create({
          login: login,
          nickname: nickname
        });
      } else {
        // Check if player is changed.
        if (player.nickname !== nickname) {
          player.set('nickname', nickname);
          await player.save();
        }
      }

      // Maybe this player is the masteradmin? (see config).
      if (this.app.config.config.hasOwnProperty('masteradmins') && this.app.config.config.masteradmins) {
        if (this.app.config.config.masteradmins.filter((adminLogin => adminLogin === login)).length > 0) {
          // Yes! Make the player admin!
          await this.setLevel(player, 3);
        }
      }

      // If already in list, stop!
      if (this.list.hasOwnProperty(login)) {
        return player;
      }

      // Save to local list. Remove lock.
      player.info = info;
      this.list[login] = player;

      // Set online status.
      if (! this.online[login]) {
        this.online[login] = true;

        // Now call the player.connect event
        if (emit) {
          this.app.serverFacade.client.emit('player.connect', this.list[login].info);
        }
      }
      return player;
    } catch (err) {
      this.app.log.error(err);
    }
  }

  /**
   * Call disconnected
   * @param login
   */
  public async disconnect(login) {
    if (this.list.hasOwnProperty(login)) {
      this.list[login].disconnected = true;
    }
    if (this.online.hasOwnProperty(login)) {
      delete this.online[login];
    }

    // Remove later to let the plugins perform their actions.
    setTimeout(() => {
      if (this.list.hasOwnProperty(login) && ! this.online.hasOwnProperty(login)) {
        delete this.list[login];
      }
    }, 5000);

    return;
  }
}

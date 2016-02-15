/**
 * CommandManager
 */

import { EventEmitter } from 'events';

/**
 * CommandManager - Holds events for '/' commands.
 * @class CommandManager
 *
 * @property {object} commands
 * @property {App} app
 * @property {ServerClient} client
 */
export default class extends EventEmitter {

  /**
   * @param {App} app
   * @param {ServerClient} client
   */
  constructor(app, client) {
    super();
    this.setMaxListeners(0);

    this.app = app;
    this.client = client;

    this.commands = {};

    // Register chat event
    this.client.on('player.chat', (data) => {
      if(data.command) {
        let parts = data.text.substr(1).split(' ');

        let command = parts[0];
        let params  = parts.slice(1);

        if (this.commands.hasOwnProperty(command) &&
            this.app.players.list.hasOwnProperty(data.login)) {
          this.emit(command, this.app.players.list[data.login], params, data);
        }
      }
    });
  }

  /**
   * Register callback for command.
   *
   * @param {string} command.
   * @param {number} [level] player minimum level.
   * @param {CommandManager~CommandCallback} callback
   */
  on(command, level, callback) {
    this.register(command, level, callback, false);
  }

  /**
   * Register callback for command. (One single time).
   *
   * @param {string} command.
   * @param {number} [level] player minimum level.
   * @param {CommandManager~CommandCallback} callback
   */
  once(command, level, callback) {
    this.register(command, level, callback, true);
  }

  /**
   * Register callback for command.
   *
   * @param {string} command.
   * @param {number} [level] player minimum level.
   * @param {CommandManager~CommandCallback} callback
   * @param {boolean} [single] Single time?
   */
  register(command, level, callback, single) {
    callback = callback || level;
    if (typeof level !== 'number' || level < 0 || level > 3) {
      level = 0;
    }
    single = single || false;

    if (this.commands.hasOwnProperty(command)) {
      throw new Error('The command \''+command+'\' is already registered for a command!');
    }
    // Level
    this.commands[command] = level;

    // Register callback.
    if (single) {
      super.once(command, (player, params) => {
        if (player && this.commands.hasOwnProperty(command)) {
          if (player.level >= this.commands[command]) {
            // Call
            callback(player, params);
          }
        }
      });
    } else {
      super.on(command, (player, params) => {
        if (player && this.commands.hasOwnProperty(command)) {
          if (player.level >= this.commands[command]) {
            // Call
            callback(player, params);
          }
        }
      });
    }
  }

  /**
   * @callback CommandManager~CommandCallback
   *
   * @param {Player} player Player object.
   * @param {object} param Parameter array.
   * @param {object} raw Raw data of command response.
   */
}



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
          let options = this.commands[command];

          if (this.app.players.list[data.login].level >= options.level) {
            this.emit(command, this.app.players.list[data.login], params, data);
          } else {
            this.app.server.send().chat('Error, you are not allowed to use this command!', {destination: data.login}).exec();
          }
        } else {
          console.log(this.commands);
          this.app.server.send().chat('Error, command doesn\'t exist!', {destination: data.login}).exec();
        }
      }
    });
  }

  /**
   * Register callback for command.
   *
   * @param {string} command.
   * @param {object} options Options, such as level, hide in help and comment.
   * @param {CommandManager~CommandCallback} callback
   */
  on(command, options, callback) {
    this.register(command, options, callback, false);
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
   *
   * @param {object|string|number} options Options, such as level, hide in help and comment. Give string for comment, number for level or object for mixed.
   * @param {number} options.level Level of command, (minimum level).
   * @param {boolean} options.hide Hide in help display (default false)
   * @param {string} options.text Description and syntax of command.
   * @param {boolean} options.strict Command can only have one listener, default false!.
   *
   * @param {CommandManager~CommandCallback} callback
   * @param {boolean} [single] Single time?
   */
  register(command, options, callback, single) {
    // Parse optional and combined parameters.
    callback = callback || function() {};
    if (typeof options === 'number') {
      options = {level: options, hide: false, text: '', strict: false};
    }
    if (typeof options === 'string') {
      options = {level: 0, hide: false, text: options, strict: false};
    }
    if (! options.hide) options.hide = false;
    if (! options.text) options.text = '';
    if (! options.level) options.level = 0;
    if (! options.strict) options.strict = false;

    if (options.level > 3 || options.level < 0) {
      options.level = 0;
    }
    single = single || false;

    // Strict mode on for commands?
    if (this.commands.hasOwnProperty(command)) { // && (this.commands[command].strict || options.strict)) {
      throw new Error('The command \''+command+'\' is already registered for a command! One of the commands has strict mode on!');
    }

    // Set options, register to commands array.
    this.commands[command] = options;

    // Register callback.
    if (single) {
      super.once(command, (player, params) => {
        callback(player, params);
      });
    } else {
      super.on(command, (player, params) => {
        callback(player, params);
      });
    }
  }

  /**
   * @callback CommandManager~CommandCallback
   *
   * @param {Player} player Player object.
   * @param {object} param Parameter array.
   */
}



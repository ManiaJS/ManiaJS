/**
 * UI Manager
 */
import * as hash from 'object-hash';

/**
 * UI Manager
 *
 * @class UIManager
 *
 * @property {App} app
 *
 * @property {Map} interfaces  Player Specifics Interfaces.
 * @property {boolean} update  Will send UI updates to clients.
 */
export default class {

  constructor (app) {
    this.app = app;

    this.interfaces = new Map();

    this.update = false;

    // Update Interval
    this.interval = null;
  }

  /**
   * Execute when server is started. (run mode).
   */
  start () {
    this.interval = setInterval(() => {
      if (this.update) {
        this.update = false;
        this.executeUpdate();
      }
    }, 2000);

    this.executeUpdate();
  }

  /**
   * Player Disconnect Event.
   * @param {{}} player
   */
  disconnect (player) {
    if (this.interfaces.hasOwnProperty(player.login)) {
      delete this.interfaces[player.login];
    }
  }

  /**
   * Add UI to manager.
   *
   * @param {InterfaceBuilder|{}} ui UI Builder instance.
   */
  add (ui) {
    // Get hash of specific content. (but not the data, as that could be changed).
    let objectHash = hash(ui, {
      base: ui.base,
      players: ui.players,
      template: ui.templateName
    });

    // In Array check
    if (this.interfaces.has(objectHash)) {
      // Already have the interface. Replace it, it will be updated!
      this.interfaces.set(objectHash, ui);
      this.update = true;

      return true;
    }

    // Add to the array.
    this.interfaces.set(objectHash, ui);
    this.update = true;
  }

  /**
   * Execute Update, will force reload of the UI to the players.
   */
  executeUpdate () {
    return new Promise((resolve, reject) => {
      var head = '<manialink version="2" id="sample">';

      var body = '<quad posn="117 72 0" sizen="41 29" bgcolor="FFFA" style="Bgs1" substyle="BgCardBuddy"/>';
      var bodyPlayers = {}; // Player indexed body.

      var footer = '</manialink>';

      // Concat all
      var all = '';

      var logins = [];
      for (let login in this.app.players.list) {
        if (this.app.players.list.hasOwnProperty(login) && this.app.players.list[login].info ) {
          logins.push(login);
        }
      }

      for (let [hash, ui] of this.interfaces) {

        // Globals
        if (! ui.players || ui.players.length === 0) {
          body += ui.render();
        } else {
          // Player specific.
          ui.players.forEach((login) => {
            if (! bodyPlayers.hasOwnProperty(login)) {
              bodyPlayers[login] = '';
            }

            bodyPlayers[login] += ui.render(login);
          });
        }

        // Send to client(s)
        // TODO

      }

      this.app.server.send().custom('SendDisplayManialinkPage', [head + body + footer, 0, false]).exec().then((res) => {
        console.log(res);
      }).catch((err) => {
        console.error(err.stack);
      });


    });
  }

}

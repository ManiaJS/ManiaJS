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
 */
export default class {

  constructor (app) {
    this.app = app;

    this.interfaces = new Map();

    // Update Interval
    this.interval = null;
  }

  /**
   * Execute when server is started. (run mode).
   */
  start () {
    /*this.interval = setInterval(() => {
      if (this.update) {
        this.update = false;
        this.executeUpdate();
      }
    }, 2000);

    this.executeUpdate();
    */
  }

  /**
   * Player Disconnect Event.
   * @param {{}} player
   */
  disconnect (player) {
    /*if (this.interfaces.hasOwnProperty(player.login)) {
      delete this.interfaces[player.login];
    }*/
  }


  /**
   * Update Interface.
   *
   * @param {InterfaceBuilder} ui
   */
  update (ui, version = null) {
    if (! this.interfaces.has(ui.id)) {
      this.interfaces.set(ui.id, ui);
    }

    if(!version)
      version = 2;

    // Update the UI ID!
    this.sendInterface(ui, version);
  }


  sendInterface (ui, version) {
    return new Promise((resolve, reject) => {
      var data    = {}; // Holds all global data.
      var players = []; // Holds login.

      var send    = '';


      // Global Data
      data = Object.assign(data, ui.globalData);

      // Player specific, or global?
      if (Object.keys(ui.playerData).length > 0) {
        // Per player data, only send to the players.
        players = Object.keys(ui.playerData);
      }

      // Foreach or global?
      if (players.length > 0) {
        // Player specific.
        players.forEach((login) => {
          data =  Object.assign(data, ui.playerData[login]);

          send =  '<manialink ';
          if(version == 2)
            send += ' version="2"';
          send += 'id="'+ui.id+'">';
          send += ui.template(data);
          send += '</manialink>';

          this.app.server.send().custom('SendDisplayManialinkPageToLogin', [login, send, 0, false]).exec()
            .then (()    => {
              console.log("11111 AJAJAJAJAJAJJAJAJAJ - version: " + version);
            })
            .catch((err) => {
              console.error(err.stack);
            });
        });
      } else {
        // Global
        send =  '<manialink ';
        if(version == 2)
          send += ' version="2"';
        send += 'id="'+ui.id+'">';
        send += ui.template(data);
        send += '</manialink>';

        this.app.server.send().custom('SendDisplayManialinkPage', [send, 0, false]).exec()
          .then (()    => {
            console.log("22222 AJAJAJAJAJAJJAJAJAJ - version: " + version);
          })
          .catch((err) => {
            console.error(err.stack);
          });
      }
    });
  }


  /**
   * Execute Update, will force reload of the UI to the players.
   */
  /*
  executeUpdate () {
    return new Promise((resolve, reject) => {
      var head = '<manialink version="2" id="sample">';

      var body = '';
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
        // console.log(res);
      }).catch((err) => {
        console.error(err.stack);
      });


    });
  }
  */

}

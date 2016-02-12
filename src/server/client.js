'use strict';
/**
 * Client Manager - Will connect to the maniaplanet server
 */
import Gbx from 'gbxremote';

import { config } from './../util/configuration';
import * as times from './../lib/times';

/**
 * Server Client.
 * @class ServerClient
 */
export default class {

  /**
   * Prepare the client. parse configuration and pass it to the gbx client.
   *
   * @param {App} app context
   */
  constructor(app) {
    this.app = app;

    this.gbx = null;

    this.server = app.config.server;
  }

  /**
   * Connect to the server.
   *
   * @returns {Promise}
   */
  connect() {
    let self = this;

    // TODO: Replace for logging stuff
    console.log("Starting connection to MP Server...");

    return new Promise( (resolve, reject) => {
      self.gbx = Gbx.createClient(self.server.port, self.server.address, (err) => {
        if (err) {
          console.error(err);
          return reject(err);
        }

        // TODO: Add error handlers here.

        // DEBUG, print every call we get.
        if (self.app.config.debug) {
          self.gbx.on('callback', (method, params) => {
            console.log("Call: %s [%O]", method, params);
          });
          // finish
          self.gbx.on('TrackMania.PlayerFinish', function (params) {
            let finish = {PlayerUid: params[0], Login: params[1], TimeOrScore: params[2]};

            if (finish.TimeOrScore > 0) {
              let msg = "Player $i'" + finish.Login + "'$i drove " + times.getStringTime(finish.TimeOrScore);
              self.gbx.query('ChatSendServerMessage', [msg])
            }
          });
        }

        console.log("MP Server connected!");

        return resolve();
      });
    }).then(() => {

      // Now let's authenticate.
      return new Promise( (resolve, reject) => {
        self.gbx.query("Authenticate", [self.server.authentication.username, self.server.authentication.password], (err, res) => {
          if (err) {
            return reject(err);
          }
          console.log("MP Server authenticated!");
          return resolve(res);
        });
      });
    }).then(() => {

      // Set api version
      return new Promise( (resolve, reject) => {
        self.gbx.query('SetApiVersion', ['2015-02-10'], (err, res) => {
          if (err) {
            return reject(err);
          }
          console.log("MP Server set api version done!");
          return resolve(res);
        });
      });
    }).then(() => {

      // Set callbacks true
      return new Promise( (resolve, reject) => {
        self.gbx.query('EnableCallbacks', [true], (err, res) => {
          if (err) {
            return reject(err);
          }
          console.log("MP Server enabled callbacks!");
          self.gbx.query('ChatSendServerMessage', ["$o$f90Mania$z$o$f90JS$z$fff: Booting Controller..."]);

          return resolve(res);
        });
      });
    });
  }
}

'use strict';
/**
 * Client Manager - Will connect to the maniaplanet server
 */
import Gbx from 'gbxremote';
import { EventEmitter } from 'events';

import CallbackManager from './callback-manager';
import Send from './send';

import config from './../util/configuration';
import times from './../lib/times';

/**
 * Server Client.
 * @class ServerClient
 */
export default class extends EventEmitter {

  /**
   * Prepare the client. parse configuration and pass it to the gbx client.
   *
   * @param {App} app context
   */
  constructor(app) {
    super();

    this.app = app;
    this.gbx = null;
    /** @type {CallbackManager} */
    this.callback = null;

    this.server = app.config.server;
  }

  /**
   * Build a sending query.
   *
   * @returns {{}|*}
   */
  send() {
    return new Send(this.app, this);
  }

  /**
   * Connect to the server.
   *
   * @returns {Promise}
   */
  connect() {
    let self = this;

    this.app.log.debug("Connecting to ManiaPlanet Server...");

    return new Promise( (resolve, reject) => {
      self.gbx = Gbx.createClient(self.server.port, self.server.address, (err) => {
        if (err) {
          self.app.log.error(err);
          return reject(err);
        }

        // TODO: Add error handlers here.

        // DEBUG, print every call we get.
        if (self.app.config.debug) {
          self.gbx.on('callback', (method, params) => {
            self.app.log.debug("Callback '"+method+"'", params);
            //console.log("Call: %s [%O]", method, params);
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

        self.app.log.debug("Connection to ManiaPlanet Server Successful!");

        return resolve();
      });
    }).then(() => {

      // Now let's authenticate.
      return new Promise( (resolve, reject) => {
        self.gbx.query("Authenticate", [self.server.authentication.username, self.server.authentication.password], (err, res) => {
          if (err) {
            return reject(err);
          }
          self.app.log.debug("Connection to ManiaPlanet Server, Successfully authenticated!");
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
          self.app.log.debug("Connection to ManiaPlanet Server, Successfully set api version!");
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
          self.app.log.debug("Connection to ManiaPlanet Server, Successfully enabled callbacks!");

          self.gbx.query('ChatSendServerMessage', ["$o$f90Mania$z$o$f90JS$z$fff: Booting Controller..."]);

          return resolve(res);
        });
      });
    });
  }

  /**
   * Register the Callbacks.
   *
   * @return {Promise}
   */
  register() {
    let self = this;

    this.app.log.debug('Registering callbacks...');
    return new Promise((resolve, reject) => {
      self.callback = new CallbackManager(self);

      self.callback.loadSet('maniaplanet');




      // Test
      self.on('player.chat', (data) => {
        console.log(data);
      });

      return resolve();
    });
  }
}

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

    return new Promise(function (resolve, reject) {
      self.gbx = Gbx.createClient(self.server.port, self.server.address, function(err) {
        if (err) {
          console.error(err);
          return reject(err);
        }

        console.log("MP Server connected!");
        return resolve();
      });
    });
  }
}
/*

export var connected = false;

// TODO: This is just for testing, should be removed and rebuild.
console.log('Info: Connecting to ManiaPlanet Server...');
var client = gbx.createClient(config.server.port, config.server.address);
client.on('connect', function () {
  // module.exports.connected = true;

  console.log("Info: Connected to ManiaPlanet Server.");

  // Authenticate
  client.query("Authenticate", [config.server.authentication.username, config.server.authentication.password], function (err, res) {
    if (err) {
      console.error("Error: Can't authenticate to ManiaPlanet Server!");
      console.error(err);
      process.exit(1);
    }

    // Enable callbacks and set api version
    client.query('SetApiVersion', ['2015-02-10']);
    client.query('EnableCallbacks', [true]);

    client.query('ChatSendServerMessage', ["$o$f90Mania$z$o$f90JS$z$fff: Booting Controller..."], function (err) {
      // We need to reindex the players on the server!
      client.query('GetPlayerList', [999, 0], function (err, res) {
        if (!err && res) {
          // TODO: Parse current player list, store it.
        }
        //console.log(res);

        client.emit('ready');
      });
    });
  });
});


client.on('close', function (had_error) {
  if (configuration.config.debug) {
    console.log('Warn: ManiaPlanet Connection Closed!');
  }
});

client.on('error', function (err) {
  console.error("Error with connection to ManiaPlanet:");
  console.error(err);
  process.exit(1);
});

*/

/**
 * Callback all-catcher.
 */

/*
client.on('callback', function (method, params) {
  console.log("Call: %s", method);
});

client.on('TrackMania.PlayerFinish', function (params) {
  let finish = {PlayerUid: params[0], Login: params[1], TimeOrScore: params[2]};

  if (finish.TimeOrScore > 0) {
    let msg = "Player $i'" + finish.Login + "'$i drove " + times.getStringTime(finish.TimeOrScore);
    client.query('ChatSendServerMessage', [msg])
  }
});

export { client };
*/
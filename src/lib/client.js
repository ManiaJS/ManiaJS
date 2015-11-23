/**
 * Created by tom on 22-11-2015.
 */
'use strict';

var configuration = require('./configuration');

var gbx = require('gbxremote');

var times = require('./times');

var client = gbx.createClient(configuration.config.server.port, configuration.config.server.address);
client.on('connect', function() {
    module.exports.connected = true;

    // Enable callbacks and set api version
    client.query('SetApiVersion', ['2015-02-10']);
    client.query('EnableCallbacks', [true]);

    console.log("Info: Connected to ManiaPlanet Server.");

    // Authenticate
    client.query("Authenticate", [configuration.config.server.authentication.username, configuration.config.server.authentication.password], function(err, res) {
        if (err) {
            console.error("Error: Can't authenticate to ManiaPlanet Server!");
            console.error(err);
            process.exit(1);
        }

        client.query('ChatSendServerMessage', ["$o$f90Controller$z$fff$o$w.$z$o$f90JS$z$fff: Booting Controller..."], function(err) {
            // We need to reindex the players on the server!
            client.query('GetPlayerList', [999,0], function(err, res) {
                if(!err && res) {
                    // TODO: Parse current player list, store it.
                }
                //console.log(res);

                client.emit('ready');
            });
        });
    });
});


client.on('close', function(had_error) {
    if(configuration.config.debug) {
        console.log('Closed!');
    }
});


client.on('callback', function(method, params) {
    console.log("Call: %s", method);
});

client.on('TrackMania.PlayerFinish', function(params) {
    let finish = {PlayerUid: params[0], Login: params[1], TimeOrScore: params[2]};

    if (finish.TimeOrScore > 0) {
        let msg = "Player $i'"+finish.Login+"'$i drove " + times.getStringTime(finish.TimeOrScore);
        client.query('ChatSendServerMessage', [msg])
    }
});

module.exports = {};
module.exports.client = client;
module.exports.connected = false;


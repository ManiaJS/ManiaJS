/**
 * ManiaPlanet Generic Callbacks
 *
 * Maps generic mp callbacks into events.
 */
'use strict';

/**
 * Run the registers.
 *
 * @param {CallbackManager} manager
 */
export default function (manager) {
  // Register player connect/disconnect.
  manager.register({
    callback: 'ManiaPlanet.PlayerConnect',
    event: 'player.connect',
    parameters: {
      login: 0,
      spectator: 1
    }
  });




  // Chat
  manager.register({
    callback: 'ManiaPlanet.PlayerChat',
    event: 'player.chat',
    parameters: {
      playerid: 0,
      login: 1,
      text: 2,
      command: 3
    }
  });
}

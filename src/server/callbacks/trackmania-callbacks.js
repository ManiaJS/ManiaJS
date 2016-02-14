/**
 * TrackMania Callbacks
 */
'use strict';

/**
 * Run the registers.
 *
 * @param {CallbackManager} manager
 * @param {function} manager.register
 */
export default function (manager) {

  manager.register({
    callback: 'TrackMania.PlayerCheckpoint',
    event: 'trackmania.player.checkpoint',
    parameters: {
      playerId: 0,
      login: 1,
      timeOrScore: 2,
      curLap: 3,
      checkpoint: 4
    }
  });

  manager.register({
    callback: 'TrackMania.PlayerFinish',
    event: 'trackmania.player.finish',
    parameters: {
      playerId: 0,
      login: 1,
      timeOrScore: 2
    }
  });

  manager.register({
    callback: 'TrackMania.PlayerIncoherence',
    event: 'trackmania.player.incoherence',
    parameters: {
      playerId: 0,
      login: 1
    }
  });
}

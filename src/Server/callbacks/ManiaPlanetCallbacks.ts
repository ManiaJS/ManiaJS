/**
 * ManiaPlanet Generic Callbacks
 *
 * Maps generic mp callbacks into events.
 */

import {CallbackManager} from '../CallbackManager';

/**
 * Run the registers.
 *
 * @param {CallbackManager} manager
 * @param {function} manager.register
 */
export function legacy (manager: CallbackManager) {

  /**
   * PLAYER EVENTS
   */
  // Connect
  manager.register({
    callback: 'ManiaPlanet.PlayerConnect',
    event: 'player.connect',
    parameters: {
      login: 0,
      spectator: 1
    },
    pass: (params) => {
      return false; // We don't have the player info yet, wait until info change event is fetching player info from db.
    }
  });

  // Disconnect
  manager.register({
    callback: 'ManiaPlanet.PlayerDisconnect',
    event: 'player.disconnect',
    parameters: {
      login: 0,
      reason: 1
    },
    flow: (app, params) => {
      return app.gameFacade.players.disconnect(params.login);
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
    },
    pass: function(params) {
      return (params[0] !== 0); // Prevent the server itself being seen as a chat message event.
    }
  });

  // info change
  manager.register({
    callback: 'ManiaPlanet.PlayerInfoChanged',
    event: 'player.change',
    parse: (raw) => {
      let info = raw[0];

      let isSpectator =       info.SpectatorStatus           % 10;
      let isTempSpectator =  (info.SpectatorStatus / 10)     % 10;
      let isPureSpectator =  (info.SpectatorStatus / 100)    % 10;
      let autoTarget =       (info.SpectatorStatus / 1000)   % 10;
      let targetId =         (info.SpectatorStatus / 10000)      ;

      return {
        login: info.Login,
        nickName: info.NickName,
        playerId: info.PlayerId,
        teamId: info.TeamId,
        spectatorStatus: info.SpectatorStatus,
        flags: info.Flags,

        isSpectator: isSpectator,
        isTempSpectator: isTempSpectator,
        isPureSpectator: isPureSpectator,
        autoTarget: autoTarget,
        targetId: targetId
      };
    },
    flow: (app, params) => {
      if (! app.gameFacade.players.list.hasOwnProperty(params.login) || app.gameFacade.players.list[params.login].disconnected) {
        return app.gameFacade.players.connect(params.login, params.nickName, params, true);
      }
      return Promise.resolve();
    }
  });

  // alies changed
  manager.register({
    callback: 'ManiaPlanet.PlayerAlliesChanged',
    event: 'player.alieschange',
    parameters: {
      login: 0
    }
  });


  // manialink answer
  manager.register({
    callback: 'ManiaPlanet.PlayerManialinkPageAnswer',
    event: 'player.manialinkanswer',
    parameters: {
      playerid: 0,
      login: 1,
      answer: 2,
      entries: 3
    },
    flow: (app, params) => {
      // First call the ui manager.
      return app.uiFacade.manager.answer(params);
    }
  });

  /**
   * SERVER EVENTS
   */
  manager.register({
    callback: 'ManiaPlanet.Echo',
    event: 'server.echo',
    parameters: {
      internal: 0,
      public: 1
    }
  });

  manager.register({
    callback: 'ManiaPlanet.ServerStart',
    event: 'server.start'
  });

  manager.register({
    callback: 'ManiaPlanet.ServerStop',
    event: 'server.stop'
  });


  /**
   * MATCH EVENTS
   */
  manager.register({
    callback: 'ManiaPlanet.BeginMatch',
    event: 'match.begin'
  });

  manager.register({
    callback: 'ManiaPlanet.EndMatch',
    event: 'match.end',
    parameters: {
      rankings: 0,
      winnerTeam: 1
    }
  });

  /**
   * MAP EVENTS
   */
  manager.register({
    callback: 'ManiaPlanet.BeginMap',
    event: 'map.begin',
    parse: (raw) => {
      return raw[0];
    },
    async flow (app, params) {
      // Update Infos and map list.
      await app.serverFacade.client.refreshInfos();
      await app.gameFacade.maps.begin(params.UId);
      await app.gameFacade.mode.begin(params.UId);
      await app.pluginFacade.manager.begin();
    }
  });

  manager.register({
    callback: 'ManiaPlanet.EndMap',
    event: 'map.end',
    parameters: {
      map: 0
    }
  });

  /**
   * OTHER EVENTS
   */
  manager.register({
    callback: 'ManiaPlanet.BillUpdated',
    event: 'bill.update',
    parameters: {
      billId: 0,
      state: 1,
      stateName: 2,
      transactionId: 3
    }
  });

  manager.register({
    callback: 'ManiaPlanet.TunnelDataReceived',
    event: 'server.tunneldatareceived',
    parameters: {
      playerId: 0,
      login: 1,
      data: 2 // base64, needs decoding maybe?
    }
  });

  manager.register({
    callback: 'ManiaPlanet.MapListModified',
    event: 'map.listchange',
    parameters: {
      currentMapIndex: 0,
      nextMapIndex: 1,
      isListModified: 2
    }
  });

  manager.register({
    callback: 'ManiaPlanet.VoteUpdated',
    event: 'vote.update',
    parameters: {
      stateName: 0, // StateName values: NewVote, VoteCancelled, VotePassed or VoteFailed
      login: 1,
      cmdName: 2,
      cmdParam: 3
    }
  });
}

export function script (manager: CallbackManager) {
  // First register legacy calls.
  legacy(manager);

  manager.register({
    callback: 'LibXmlRpc_BeginServer',
    event: 'script.server.begin'
  });

  manager.register({
    callback: 'LibXmlRpc_BeginServerStop',
    event: 'script.server.begin.stop'
  });

  manager.register({
    callback: 'LibXmlRpc_BeginMatch',
    event: 'script.match.begin',
    parameters: {
      matchNumber: 0, // Match Number
      restarted: 1 // Is restarted?
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginMatchStop',
    event: 'script.match.begin.stop',
    parameters: {
      matchNumber: 0, // Match Number
      restarted: 1 // Is restarted?
    }
  });

  manager.register({
    callback: 'LibXmlRpc_LoadingMap',
    event: 'script.map.loading',
    parameters: {
      number: 0,
      uid: 1,
      restarted: 2
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginMap',
    event: 'script.map.begin',
    parameters: {
      number: 0,
      uid: 1,
      restarted: 2
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginMapStop',
    event: 'script.map.begin.stop',
    parameters: {
      number: 0,
      uid: 1,
      restarted: 2
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginSubmatch',
    event: 'script.submatch.begin',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginSubmatchStop',
    event: 'script.submatch.begin.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginRound',
    event: 'script.round.begin',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginRoundStop',
    event: 'script.round.begin.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginTurn',
    event: 'script.turn.begin',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginTurnStop',
    event: 'script.turn.begin.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BeginPlaying',
    event: 'script.playing.begin'
  });

  manager.register({
    callback: 'LibXmlRpc_EndPlaying',
    event: 'script.playing.end'
  });

  manager.register({
    callback: 'LibXmlRpc_EndTurn',
    event: 'script.turn.end',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndTurnStop',
    event: 'script.turn.end.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndRound',
    event: 'script.round.end',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndRoundStop',
    event: 'script.round.end.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndSubmatch',
    event: 'script.submatch.end',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndSubmatchStop',
    event: 'script.submatch.end.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndMap',
    event: 'script.map.end',
    parameters: {
      number: 0,
      uid: 1
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndMapStop',
    event: 'script.map.end.stop',
    parameters: {
      number: 0,
      uid: 1
    }
  });

  manager.register({
    callback: 'LibXmlRpc_UnloadingMap',
    event: 'script.map.unloading',
    parameters: {
      number: 0,
      uid: 1
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndMatch',
    event: 'script.match.end',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndMatchStop',
    event: 'script.match.end.stop',
    parameters: {
      number: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_EndServer',
    event: 'script.server.end'
  });

  manager.register({
    callback: 'LibXmlRpc_EndServerStop',
    event: 'script.server.end.stop'
  });

  manager.register({
    callback: 'LibXmlRpc_BeginPodium',
    event: 'script.podium.begin'
  });

  manager.register({
    callback: 'LibXmlRpc_EndPodium',
    event: 'script.podium.end'
  });

  manager.register({
    callback: 'LibXmlRpc_BeginWarmUp',
    event: 'script.warmup.begin'
  });

  manager.register({
    callback: 'LibXmlRpc_EndWarmUp',
    event: 'script.warmup.end'
  });

  manager.register({
    callback: 'LibXmlRpc_Pause',
    event: 'script.pause',
    parameters: {
      pause: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_ScoresReady',
    event: 'script.scores.ready'
  });

  manager.register({
    callback: 'LibXmlRpc_Callbacks',
    event: 'script.callbacks',
    parse (raw) {
      return raw;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_CallbackHelp',
    event: 'script.callbacks.help',
    parse (raw) {
      return raw;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_BlockedCallbacks',
    event: 'script.callbacks.blocked',
    parse (raw) {
      return raw;
    }
  });

  manager.register({
    callback: 'UI_Properties',
    event: 'script.ui.properties',
    parse (raw) {
      return raw;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_WarmUp',
    event: 'script.warmup',
    parameters: {
      warmup: 0
    }
  });

  // mode.change will be called on change of gamemode!

}

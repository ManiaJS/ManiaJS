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
    flow: (app, params) => {
      // Update Infos and map list.
      return app.serverFacade.client.updateInfos()
        .then(() => app.gameFacade.maps.begin(params.UId))
        .then(() => app.pluginFacade.manager.begin());
    }
  });

  manager.register({
    callback: 'ManiaPlanet.EndMap',
    event: 'map.end',
    parameters: {
      map: 0
    }
  });

  // TODO: ManiaPlanet.StatusChanged

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


  // custom script callbacks.
  // TODO: ModeScriptCallback + ModeScriptCallbackArray

}

export function script (manager: CallbackManager) {
  // First register legacy calls.
  legacy(manager);

  manager.register({
    callback: 'LibXmlRpc_BeginServer',
    event: 'script.beginserver',
    
  })
}

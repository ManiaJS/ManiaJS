/**
 * TrackMania Callbacks
 */

import {CallbackManager} from '../CallbackManager';

/**
 * Run the registers.
 *
 * @param {CallbackManager} manager
 * @param {function} manager.register
 */
export function legacy (manager: CallbackManager) {}

export function script (manager: CallbackManager) {
  legacy(manager);

  manager.register({
    callback: 'LibXmlRpc_Rankings',
    event: 'script.rankings',
    parse (raw) {
      let rawString: string = raw[0];
      let playerRankings = {};
      let rawRankings = rawString.split(/;/);

      rawRankings.forEach((raw) => {
        let splitted = raw.split(/:/);
        playerRankings[splitted[0]] = parseInt(splitted[1]);
      });

      return playerRankings;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_Scores',
    event: 'script.scores',
    parse (raw) {return raw;}
  });

  manager.register({
    callback: 'LibXmlRpc_PlayerRanking',
    event: 'script.player.ranking',
    parameters: {
      score: 0,
      login: 1,
      nickname: 2,
      teamid: 3,
      spectatorstatus: 4,
      awaystatus: 5,
      points: 6,
      zone: 7
    }
  });

  manager.register({
    callback: 'WarmUp_Status',
    event: 'script.warmup',
    parameters: {
      warmup: 0
    }
  });

  manager.register({
    callback: 'LibAFK_IsAFK',
    event: 'script.afk.isafk',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'LibAFK_Properties',
    event: 'script.afk.properties',
    parameters: {
      idletimelimit: 0,
      spawntimelimit: 1,
      checkinterval: 2,
      forcespec: 3
    }
  });

  // ShootMania Mode.
  manager.register({
    callback: 'LibXmlRpc_OnShoot',
    event: 'script.shootmania.shoot',
    parameters: {
      login: 0,
      weapon: 1
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnHit',
    event: 'script.shootmania.hit',
    parameters: {
      shooter: 0,
      victim: 1,
      damage: 2,
      weapon: 3, // 1: Laser, 2: Rocket, 3: Nucleus, 5: Arrow.
      points: 4,
      distance: 5,
      shooterposition: 6,
      victimposition: 7,
      shooteraim: 8,
      victimaim: 9
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnNearMiss',
    event: 'script.shootmania.nearmiss',
    parameters: {
      shooter: 0,
      victim: 1,
      weapon: 2,
      distance: 3 // Distance missed.
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnArmorEmpty',
    event: 'script.shootmania.armorempty',
    parameters: {
      shooter: 0,
      victim: 1,
      damage: 2,
      weapon: 3,
      points: 4
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnCapture',
    event: 'script.shootmania.capture',
    parse (raw) {
      return raw[0].split(/;/);
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnPlayerRequestRespawn',
    event: 'script.shootmania.player.requestrespawn',
    parameters: {
      login: 0
    }
  });


  // Matchmaking

  manager.register({
    callback: 'Matchmaking_ReadyState',
    event: 'script.shootmania.matchmaking.ready',
    parameters: {
      login: 0,
      ready: 1
    }
  });


  // Royal

  manager.register({
    callback: 'Royal_UpdatePoints',
    event: 'script.shootmania.royal.points.update',
    parameters: {
      login: 0,
      type: 1,
      points: 2
    }
  });

  manager.register({
    callback: 'Royal_SpawnPlayer',
    event: 'script.shootmania.royal.player.spawn',
    parameters: {
      login: 0,
      type: 1
    }
  });

  manager.register({
    callback: 'Royal_RoundWinner',
    event: 'script.shootmania.royal.round.winner',
    parameters: {
      login: 0
    }
  });


  // TimeAttack

  manager.register({
    callback: 'TimeAttack_OnStart',
    event: 'script.shootmania.timeattack.start',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'TimeAttack_OnCheckpoint',
    event: 'script.shootmania.timeattack.checkpoint',
    parameters: {
      login: 0,
      time: 1
    }
  });

  manager.register({
    callback: 'TimeAttack_OnFinish',
    event: 'script.shootmania.timeattack.finish',
    parameters: {
      login: 0,
      time: 1
    }
  });

  manager.register({
    callback: 'TimeAttack_OnRestart',
    event: 'script.shootmania.timeattack.restart',
    parameters: {
      login: 0,
      time: 1
    }
  });


  // Joust

  manager.register({
    callback: 'Joust_OnReload',
    event: 'script.shootmania.joust.reload',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'Joust_SelectedPlayers',
    event: 'script.shootmania.joust.players',
    parameters: {
      login1: 0,
      login2: 1
    }
  });

  manager.register({
    callback: 'Joust_RoundResult',
    event: 'script.shootmania.joust.result',
    parse (raw) {
      let splitPlayer1 = raw[0].split(/:/);
      let splitPlayer2 = raw[1].split(/:/);
      let ret = {};
      ret[splitPlayer1[0]] = parseInt(splitPlayer1[1]);
      ret[splitPlayer2[0]] = parseInt(splitPlayer2[1]);
      return ret;
    }
  });


  // Combo

  manager.register({
    callback: 'Combo_Pause',
    event: 'script.shootmania.combo.pause',
    parameters: {
      pause: 0
    }
  });


  // Elite

  manager.register({
    callback: 'Elite_BeginTurn',
    event: 'script.shootmania.elite.turn.begin',
    parse (raw) {
      let splitDefenders = raw[1].split(/;/);
      return {
        attacker: raw[0],
        defenders: splitDefenders
      };
    }
  });

  manager.register({
    callback: 'Elite_EndTurn',
    event: 'script.shootmania.elite.turn.end',
    parameters: {
      type: 0 // 1 -> Time limit, 2 -> Capture, 3 -> Attacker eliminated, 4-> Defenders eliminated
    }
  });

  // Elite Legacy, Is turned off.
}

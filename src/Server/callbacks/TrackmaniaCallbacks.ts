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
export function legacy (manager: CallbackManager) {

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

export function script (manager: CallbackManager) {
  legacy(manager);

  // Common Trackmania

  manager.register({
    callback: 'LibXmlRpc_OnStartCountdown',
    event: 'script.trackmania.startcountdown',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnStartLine',
    event: 'script.trackmania.startline',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnWayPoint',
    event: ['script.trackmania.waypoint', 'script.trackmania.checkpoint'],
    parameters: {
      login: 0,
      blockid: 1,
      racetime: 2,
      waypointnumberrace: 3,
      endrace: 4,
      laptime: 5,
      waypointnumberlap: 6,
      endlap: 7
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnPlayerFinish',
    event: 'script.trackmania.finish',
    parameters: {
      login: 0,
      blockid: 1,
      time: 2
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnGiveUp',
    event: 'script.trackmania.giveup',
    parameters: {
      login: 0
    }
  });

  manager.register({
    callback: 'LibXmlRpc_OnRespawn',
    event: 'script.trackmania.respawn',
    parameters: {
      login: 0,
      blockid: 1,
      waypointnumberrace: 2,
      waypointnumberlap: 3,
      respawns: 4
    }
  });

  //The stunts names are: None, StraightJump, Flip, BackFlip, Spin, Aerial, AlleyOop, Roll, Corkscrew, SpinOff, Rodeo,
  // FlipFlap, Twister, FreeStyle, SpinningMix, FlippingChaos, RollingMadness, WreckNone, WreckStraightJump, WreckFlip,
  // WreckBackFlip, WreckSpin, WreckAerial, WreckAlleyOop, WreckRoll, WreckCorkscrew, WreckSpinOff, WreckRodeo,
  // WreckFlipFlap, WreckTwister, WreckFreeStyle, WreckSpinningMix, WreckFlippingChaos, WreckRollingMadness,
  // TimePenalty, RespawnPenalty, Grind, Reset.
  manager.register({
    callback: 'LibXmlRpc_OnStunt',
    event: 'script.trackmania.stunt',
    parameters: {
      login: 0,
      stuntpoints: 1,
      combo: 2,
      totalscore: 3,
      factor: 4,
      stuntname: 5,
      angle: 6,
      straight: 7,
      reversed: 8,
      masterjump: 9
    }
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
    callback: 'LibXmlRpc_PlayersRanking',
    event: 'script.players.ranking',
    parse (raw) {
      let res = {};
      raw.forEach((playerRaw) => {
        let playerSplit = playerRaw.split(/:/);

        res[playerSplit[0]] = {
          login: playerSplit[0],
          rank: parseInt(playerSplit[1]),
          bestcheckpoints: playerSplit[2].split(/,/),
          teamid: parseInt(playerSplit[3]),
          spectatorstatus: playerSplit[4] === 'True',
          awaystatus: playerSplit[5] === 'True',
          besttime: parseInt(playerSplit[6]),
          zone: playerSplit[7],
          points: parseInt(playerSplit[8]),
          score: parseInt(playerSplit[9])
        };
      });
      return res;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_PlayersScores',
    event: 'script.players.scores',
    parse (raw) {
      let res = {};
      raw.forEach((playerRaw: string) => {
        let playerSplit = playerRaw.split(/:/);
        res[playerSplit[0]] = parseInt(playerSplit[1]);
      });
      return res;
    }
  });

  manager.register({
    callback: 'LibXmlRpc_PlayersTimes',
    event: 'script.players.times',
    parse (raw) {
      let res = {};
      raw.forEach((playerRaw: string) => {
        let playerSplit = playerRaw.split(/:/);
        res[playerSplit[0]] = parseInt(playerSplit[1]);
      });
    }
  });

  manager.register({
    callback: 'LibXmlRpc_Scores',
    event: 'script.scores',
    parse (raw) {return raw;}
  });

  manager.register({
    callback: 'LibXmlRpc_TeamsScores',
    event: 'script.teams.scores',
    parse (raw) {return raw;}
  });

  manager.register({
    callback: 'LibXmlRpc_TeamsMode',
    event: 'script.teams.mode',
    parameters: {
      teams: 0
    }
  });


  // Rounds/Cup

  manager.register({ // Answer on Rounds_GetPointsRepartition
    callback: 'Rounds_PointsRepartition',
    event: 'script.trackmania.rounds.pointsrepartition',
    parse (raw) {return raw;}
  });
}

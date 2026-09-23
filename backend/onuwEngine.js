// backend/onuwEngine.js
import { GameEngine } from './gameEngine.js';

export const ROLES = {
  WEREWOLF: 'werewolf',
  MINION: 'minion',
  MASON: 'mason',
  SEER: 'seer',
  ROBBER: 'robber',
  TROUBLEMAKER: 'troublemaker',
  DRUNK: 'drunk',
  INSOMNIAC: 'insomniac',
  VILLAGER: 'villager',
  HUNTER: 'hunter',
  TANNER: 'tanner',
  DOPPELGANGER: 'doppelganger'
};

export const NIGHT_ACTION_ORDER = [
  ROLES.DOPPELGANGER,
  ROLES.WEREWOLF,
  ROLES.MINION,
  ROLES.MASON,
  ROLES.SEER,
  ROLES.ROBBER,
  ROLES.TROUBLEMAKER,
  ROLES.DRUNK,
  ROLES.INSOMNIAC
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class OnuwEngine extends GameEngine {
  constructor(room) {
    super(room);
    this.game = {
      centerCards: [],
      currentNightIndex: -1,
      nightTimer: null,
      dayTimer: null,
      logs: []
    };
  }

  startGame(io) {
    const roles = shuffleArray([...this.room.settings.selectedRoles]);
    const allPlayers = Array.from(this.room.players.values());

    // 发放初始身份
    for (let i = 0; i < allPlayers.length; i++) {
      allPlayers[i].initialRole = roles[i];
      allPlayers[i].currentRole = roles[i];
      allPlayers[i].votesFor = null;
      allPlayers[i].hasActed = false;
    }

    // 留出 3 张中央底牌
    this.game.centerCards = roles.slice(allPlayers.length);
    this.room.status = 'NIGHT';
    this.game.currentNightIndex = -1;
    this.game.logs = [];

    const playersList = allPlayers.map(p => ({
      sessionId: p.sessionId,
      nickname: p.nickname,
      seatNumber: p.seatNumber,
      isHost: p.sessionId === this.room.hostId
    }));

    allPlayers.forEach(p => {
      io.to(p.socketId).emit('game_started', {
        gameType: 'onuw',
        initialRole: p.initialRole,
        players: playersList
      });
    });

    // 等待 5 秒钟看牌后，开始结算黑夜行动
    setTimeout(() => {
      this.nextNightTurn(io);
    }, 5000);
  }

  nextNightTurn(io) {
    if (this.room.status !== 'NIGHT') return;

    this.game.currentNightIndex++;

    // 黑夜行动结算完毕，天亮
    if (this.game.currentNightIndex >= NIGHT_ACTION_ORDER.length) {
      this.startDayPhase(io);
      return;
    }

    const currentActiveRole = NIGHT_ACTION_ORDER[this.game.currentNightIndex];
    const roleInGame = this.room.settings.selectedRoles.includes(currentActiveRole);

    // 如果该角色不在本局游戏中，直接跳过
    if (!roleInGame) {
      this.nextNightTurn(io);
      return;
    }

    const timeLimit = this.room.settings.actionTime || 12;

    io.to(this.room.roomId).emit('night_action_update', {
      activeRole: currentActiveRole,
      timeLimit: timeLimit
    });

    this.game.nightTimer = setTimeout(() => {
      io.to(this.room.roomId).emit('night_action_close', {
        closedRole: currentActiveRole
      });

      setTimeout(() => {
        this.nextNightTurn(io);
      }, 3000); // 留3秒闭眼时间缓冲
    }, timeLimit * 1000);

    Array.from(this.room.players.values()).forEach(player => {
      if (player.initialRole === currentActiveRole) {
        const viewData = this.getRoleNightViewData(player);
        io.to(player.socketId).emit('your_turn', viewData);
      }
    });
  }

  getRoleNightViewData(player) {
    const data = {};
    const allPlayers = Array.from(this.room.players.values());

    switch (player.initialRole) {
      case ROLES.WEREWOLF:
        data.werewolfMates = allPlayers
          .filter(p => p.initialRole === ROLES.WEREWOLF && p.seatNumber !== player.seatNumber)
          .map(p => p.seatNumber);
        break;
      case ROLES.MASON:
        data.masonMates = allPlayers
          .filter(p => p.initialRole === ROLES.MASON && p.seatNumber !== player.seatNumber)
          .map(p => p.seatNumber);
        break;
      case ROLES.MINION:
        data.werewolves = allPlayers
          .filter(p => p.initialRole === ROLES.WEREWOLF)
          .map(p => p.seatNumber);
        break;
      case ROLES.INSOMNIAC:
        data.currentRole = player.currentRole;
        break;
    }
    return data;
  }

  handlePlayerAction(sessionId, actionData, io) {
    const player = this.room.players.get(sessionId);
    if (!player || player.hasActed) return { success: false, error: '无效操作或已行动过' };

    player.hasActed = true;
    const allPlayersArray = Array.from(this.room.players.values());
    let result = { success: true };
    let logText = '';

    switch (actionData.type) {
      case 'WEREWOLF_VIEW':
        result.seenRole = this.game.centerCards[actionData.centerIndex];
        logText = `狼人查看了中央第 ${actionData.centerIndex + 1} 张牌`;
        break;
      case 'SEER_PLAYER':
        const targetP = allPlayersArray.find(p => p.seatNumber === actionData.targetSeat);
        if (targetP) {
          result.seenRole = targetP.currentRole;
          logText = `预言家查验了 ${targetP.seatNumber} 号玩家，其真实身份为 ${targetP.currentRole}`;
        }
        break;
      case 'SEER_CENTER':
        result.seenRoles = actionData.centerIndices.map(idx => this.game.centerCards[idx]);
        logText = `预言家查看了中央两张底牌`;
        break;
      case 'ROB_PLAYER':
        const robTarget = allPlayersArray.find(p => p.seatNumber === actionData.targetSeat);
        if (robTarget) {
          const temp = player.currentRole;
          player.currentRole = robTarget.currentRole;
          robTarget.currentRole = temp;
          result.newRole = player.currentRole;
          logText = `强盗偷取了 ${robTarget.seatNumber} 号玩家的身份`;
        }
        break;
      case 'SWAP_PLAYERS':
        const t1 = allPlayersArray.find(p => p.seatNumber === actionData.targetSeats[0]);
        const t2 = allPlayersArray.find(p => p.seatNumber === actionData.targetSeats[1]);
        if (t1 && t2) {
          const temp = t1.currentRole;
          t1.currentRole = t2.currentRole;
          t2.currentRole = temp;
          logText = `捣蛋鬼交换了 ${t1.seatNumber} 号和 ${t2.seatNumber} 号玩家的身份`;
        }
        break;
      case 'DRUNK_SWAP':
        const cIdx = actionData.centerIndex;
        const tempDrunk = player.currentRole;
        player.currentRole = this.game.centerCards[cIdx];
        this.game.centerCards[cIdx] = tempDrunk;
        logText = `酒鬼与中央第 ${cIdx + 1} 张牌交换了身份`;
        break;
      case 'NONE':
      default:
        logText = `${player.initialRole} 放弃行动闭眼`;
        break;
    }

    if (logText) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      this.game.logs.push(`[${timeStr}] ${logText}`);
    }

    return result;
  }

  startDayPhase(io) {
    this.room.status = 'DAY';
    io.to(this.room.roomId).emit('day_started', {
      discussTime: this.room.settings.discussTime || 300
    });

    this.game.dayTimer = setTimeout(() => {
      this.startVotingPhase(io);
    }, (this.room.settings.discussTime || 300) * 1000);
  }

  startVotingPhase(io) {
    this.room.status = 'VOTING';
    io.to(this.room.roomId).emit('voting_started');
  }

  forceAction(actionName, io) {
    if (actionName === 'start_voting_countdown' && this.room.status === 'VOTING') {
      if (this.game.votingTimer) return false;
      this.game.votingTimeLeft = 30;
      io.to(this.room.roomId).emit('voting_countdown', this.game.votingTimeLeft);
      
      this.game.votingTimer = setInterval(() => {
        this.game.votingTimeLeft--;
        if (this.game.votingTimeLeft <= 0) {
          clearInterval(this.game.votingTimer);
          this.game.votingTimer = null;
          
          this.room.status = 'END';
          const allPlayers = Array.from(this.room.players.values());
          allPlayers.forEach(p => p.isReady = false);
          
          const gameResult = this.calculateGameResult();
          io.to(this.room.roomId).emit('game_ended', gameResult);
        } else {
          io.to(this.room.roomId).emit('voting_countdown', this.game.votingTimeLeft);
        }
      }, 1000);
      return true;
    }
    if (actionName === 'force_vote' && this.room.status === 'DAY') {
      clearTimeout(this.game.dayTimer);
      this.startVotingPhase(io);
      return true;
    }
    return false;
  }

  submitVote(sessionId, voteTarget, io) {
    if (this.room.status !== 'VOTING') return false;

    const player = this.room.players.get(sessionId);
    if (player) {
      player.votesFor = voteTarget;
      return true;
    }
    return false;
  }

  calculateGameResult() {
    const allPlayers = Array.from(this.room.players.values());
    const voteCounts = {};
    allPlayers.forEach(p => {
      if (p.votesFor !== null && p.votesFor !== -1) {
        voteCounts[p.votesFor] = (voteCounts[p.votesFor] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let exiledSeats = [];
    for (const [seat, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        exiledSeats = [Number(seat)];
      } else if (count === maxVotes) {
        exiledSeats.push(Number(seat));
      }
    }

    // 如果最高票数只有 1 票，视为和平流局，无人出局
    if (maxVotes <= 1) exiledSeats = [];

    const exiledPlayers = exiledSeats.map(seat => allPlayers.find(p => p.seatNumber === seat));

    let winner = 'error';
    let summary = '';

    const exiledRoles = exiledPlayers.map(p => p.currentRole);
    const hasWerewolfExiled = exiledRoles.includes(ROLES.WEREWOLF);
    const hasTannerExiled = exiledRoles.includes(ROLES.TANNER);
    const werewolvesInPlay = allPlayers.filter(p => p.currentRole === ROLES.WEREWOLF);

    if (hasTannerExiled) {
      winner = 'tanner';
      summary = '皮匠被成功放逐，皮匠单独获得胜利！';
    } else if (hasWerewolfExiled) {
      winner = 'good';
      summary = '狼人被成功揪出放逐，正义村民阵营获胜！';
    } else {
      if (werewolvesInPlay.length === 0) {
        if (exiledPlayers.length === 0) {
          winner = 'good';
          summary = '和平流局。场上无狼人，村民阵营获胜！';
        } else {
          winner = 'evil';
          summary = '场上无狼人，但有好人被无辜放逐，狼人阵营获胜！';
        }
      } else {
        winner = 'evil';
        summary = '狼人潜伏成功未被放逐，狼人阵营获胜！';
      }
    }

    return {
      winner,
      summary,
      exiledPlayers: exiledPlayers.map(p => p.nickname),
      finalRoles: allPlayers.map(p => ({
        nickname: p.nickname,
        initialRole: p.initialRole,
        currentRole: p.currentRole
      })),
      timeline: this.game.logs
    };
  }
}
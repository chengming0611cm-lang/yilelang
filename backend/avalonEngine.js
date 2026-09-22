// backend/avalonEngine.js
import { GameEngine } from './gameEngine.js';

export const AVALON_ROLES = {
  MERLIN: 'merlin',
  PERCIVAL: 'percival',
  LOYAL: 'loyal',
  ASSASSIN: 'assassin',
  MORGANA: 'morgana',
  MORDRED: 'mordred',
  OBERON: 'oberon',
  MINION: 'minion'
};

export const AVALON_RULES = {
  5: { good: 3, evil: 2, quests: [2, 3, 2, 3, 3] },
  6: { good: 4, evil: 2, quests: [2, 3, 4, 3, 4] },
  7: { good: 4, evil: 3, quests: [2, 3, 3, 4, 4] },
  8: { good: 5, evil: 3, quests: [3, 4, 4, 5, 5] },
  9: { good: 6, evil: 3, quests: [3, 4, 4, 5, 5] },
  10: { good: 6, evil: 4, quests: [3, 4, 4, 5, 5] }
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class AvalonEngine extends GameEngine {
  constructor(room) {
    super(room);
    this.game = {
      phase: 'waiting',
      currentQuestIndex: 0,
      questResults: [],
      leaderSeat: 0,
      failedVotes: 0,
      proposedTeam: [],
      votes: {},
      questCards: {},
      logs: []
    };
  }

  startGame(io) {
    const playerCount = this.room.players.size;
    let effectiveCount = playerCount < 5 ? 5 : playerCount;
    if (playerCount > 10) throw new Error('最多支持 10 人游戏');

    let roles = shuffleArray([...this.room.settings.selectedRoles]);
    const allPlayers = Array.from(this.room.players.values());

    // 严格按照座号排列，以确定初始队长
    allPlayers.sort((a, b) => a.seatNumber - b.seatNumber);
    this.game.leaderSeat = allPlayers[0].seatNumber;

    for (let i = 0; i < allPlayers.length; i++) {
      allPlayers[i].role = roles[i];
      allPlayers[i].hasConfirmedNight = false;
    }

    this.game.phase = 'night';
    this.game.currentQuestIndex = 0;
    this.game.questResults = [];
    this.game.failedVotes = 0;

    for (const player of allPlayers) {
      const vision = {};

      // 梅林视角：能看到所有的邪恶阵营，但不包括莫德雷德
      if (player.role === AVALON_ROLES.MERLIN) {
        vision.evils = allPlayers
          .filter(p => p.seatNumber !== player.seatNumber &&
            [AVALON_ROLES.ASSASSIN, AVALON_ROLES.MORGANA, AVALON_ROLES.OBERON, AVALON_ROLES.MINION].includes(p.role))
          .map(p => p.seatNumber);
      }
      // 派西维尔视角：能看到梅林和莫甘娜（且无法分辨真假）
      else if (player.role === AVALON_ROLES.PERCIVAL) {
        vision.merlinOrMorgana = allPlayers
          .filter(p => p.seatNumber !== player.seatNumber &&
            [AVALON_ROLES.MERLIN, AVALON_ROLES.MORGANA].includes(p.role))
          .map(p => p.seatNumber);
      }
      // 邪恶阵营互认视角：除了奥伯伦以外，其他人互相知道底细
      else if ([AVALON_ROLES.ASSASSIN, AVALON_ROLES.MORGANA, AVALON_ROLES.MORDRED, AVALON_ROLES.MINION].includes(player.role)) {
        vision.evilMates = allPlayers
          .filter(p => p.seatNumber !== player.seatNumber &&
            [AVALON_ROLES.ASSASSIN, AVALON_ROLES.MORGANA, AVALON_ROLES.MORDRED, AVALON_ROLES.MINION].includes(p.role))
          .map(p => p.seatNumber);
      }

      io.to(player.socketId).emit('avalon_game_started', {
        playerState: {
          initialRole: player.role,
          seatNumber: player.seatNumber
        },
        gameState: {
          phase: this.game.phase,
          vision: vision,
          leaderSeat: this.game.leaderSeat,
          currentQuestSize: (AVALON_RULES[effectiveCount] || AVALON_RULES[5]).quests[0],
          failedVotes: 0
        },
        playersList: allPlayers.map(p => ({ seatNumber: p.seatNumber, nickname: p.nickname, offline: p.offline }))
      });
    }
  }

  handlePlayerAction(sessionId, actionData, io) {
    const player = this.room.players.get(sessionId);
    if (!player) return { success: false, error: '玩家不存在' };

    if (actionData.type === 'NIGHT_CONFIRM') {
      if (this.game.phase !== 'night') return { success: false, error: '当前不在初始黑夜阶段' };
      if (player.hasConfirmedNight) return { success: false, error: '你已确认过，请等待其他人' };

      player.hasConfirmedNight = true;
      const allPlayers = Array.from(this.room.players.values());
      const allConfirmed = allPlayers.every(p => p.hasConfirmedNight);

      if (allConfirmed) {
        this.game.phase = 'team_building';
        const totalPlayers = this.room.players.size;
        const rule = AVALON_RULES[totalPlayers] || AVALON_RULES[5];

        io.to(this.room.roomId).emit('avalon_phase_change', {
          phase: this.game.phase,
          leaderSeat: this.game.leaderSeat,
          currentQuestSize: rule.quests[this.game.currentQuestIndex],
          failedVotes: this.game.failedVotes
        });
      }
      return { success: true };
    }

    if (actionData.type === 'PROPOSE_TEAM') {
      if (this.game.phase !== 'team_building') return { success: false, error: '不在车队组建阶段' };
      if (player.seatNumber !== this.game.leaderSeat) return { success: false, error: '你不是当前的带队队长' };

      const totalPlayers = this.room.players.size;
      const rule = AVALON_RULES[totalPlayers] || AVALON_RULES[5];
      const requiredSize = rule.quests[this.game.currentQuestIndex];

      if (!Array.isArray(actionData.team) || actionData.team.length !== requiredSize) {
        return { success: false, error: `当前任务必须恰好选择 ${requiredSize} 人出征` };
      }

      this.game.proposedTeam = actionData.team;
      this.game.votes = {};
      this.game.phase = 'team_voting';

      io.to(this.room.roomId).emit('avalon_phase_change', {
        phase: this.game.phase,
        leaderSeat: this.game.leaderSeat,
        currentQuestSize: requiredSize,
        failedVotes: this.game.failedVotes,
        proposedTeam: this.game.proposedTeam
      });
      return { success: true };
    }

    if (actionData.type === 'VOTE_TEAM') {
      if (this.game.phase !== 'team_voting') return { success: false, error: '不在车队投票阶段' };
      if (this.game.votes[player.seatNumber]) return { success: false, error: '你已经表过态了' };
      if (actionData.vote !== 'approve' && actionData.vote !== 'reject') return { success: false, error: '非法的投票数据' };

      this.game.votes[player.seatNumber] = actionData.vote;

      const totalPlayers = this.room.players.size;
      const voteEntries = Object.entries(this.game.votes);

      if (voteEntries.length >= totalPlayers) {
        const approveCount = voteEntries.filter(([_, v]) => v === 'approve').length;
        const isApproved = approveCount > totalPlayers / 2;

        io.to(this.room.roomId).emit('avalon_team_vote_result', {
          votes: this.game.votes,
          isApproved,
          approveCount
        });

        if (isApproved) {
          this.game.failedVotes = 0;
          this.game.phase = 'quest_execution';
          this.game.questCards = {};
          io.to(this.room.roomId).emit('avalon_phase_change', {
            phase: this.game.phase,
            leaderSeat: this.game.leaderSeat,
            currentQuestSize: (AVALON_RULES[totalPlayers] || AVALON_RULES[5]).quests[this.game.currentQuestIndex],
            failedVotes: this.game.failedVotes,
            proposedTeam: this.game.proposedTeam
          });
        } else {
          this.game.failedVotes++;
          if (this.game.failedVotes >= 5) {
            this.triggerEndGame(io, { winner: 'evil', reason: '连续 5 次发车被否决，规则无情制裁，邪恶阵营直接获胜！' });
          } else {
            this.game.phase = 'team_building';
            this.game.leaderSeat = this.getNextLeaderSeat();
            io.to(this.room.roomId).emit('avalon_phase_change', {
              phase: this.game.phase,
              leaderSeat: this.game.leaderSeat,
              currentQuestSize: (AVALON_RULES[totalPlayers] || AVALON_RULES[5]).quests[this.game.currentQuestIndex],
              failedVotes: this.game.failedVotes
            });
          }
        }
      }
      return { success: true };
    }

    if (actionData.type === 'SUBMIT_QUEST') {
      if (this.game.phase !== 'quest_execution') return { success: false, error: '当前没有队伍在出任务' };
      if (!this.game.proposedTeam.includes(player.seatNumber)) return { success: false, error: '你不在本次出征的车队中' };
      if (this.game.questCards && this.game.questCards[player.seatNumber]) return { success: false, error: '你已经提交过任务牌了' };

      const role = player.role;
      const isGood = role === AVALON_ROLES.MERLIN || role === AVALON_ROLES.PERCIVAL || role === AVALON_ROLES.LOYAL;
      if (isGood && actionData.card !== 'success') return { success: false, error: '好人阵营绝对不允许选择任务失败！' };
      if (actionData.card !== 'success' && actionData.card !== 'fail') return { success: false, error: '无效的任务卡牌' };

      if (!this.game.questCards) this.game.questCards = {};
      this.game.questCards[player.seatNumber] = actionData.card;

      const cardsKeys = Object.keys(this.game.questCards);
      if (cardsKeys.length >= this.game.proposedTeam.length) {
        const totalPlayers = this.room.players.size;
        const currentQuest = this.game.currentQuestIndex;
        let needsTwoFails = false;

        // 阿瓦隆核心规则：7人及以上的对局中，第 4 轮任务必须需要两张失败牌才会导致任务失败
        if (totalPlayers >= 7 && currentQuest === 3) {
          needsTwoFails = true;
        }

        const cards = Object.values(this.game.questCards);
        const shuffledCards = shuffleArray(cards);

        const failCount = shuffledCards.filter(c => c === 'fail').length;
        const isQuestSuccess = needsTwoFails ? failCount < 2 : failCount < 1;

        this.game.questResults.push(isQuestSuccess ? 1 : -1);

        const successQuests = this.game.questResults.filter(r => r === 1).length;
        const failQuests = this.game.questResults.filter(r => r === -1).length;

        io.to(this.room.roomId).emit('avalon_quest_result', {
          cards: shuffledCards,
          isQuestSuccess,
          failCount,
          questResults: this.game.questResults,
          needsTwoFails
        });

        // 留出时间播放揭晓动画，然后再做状态流转
        setTimeout(() => {
          if (failQuests >= 3) {
            this.triggerEndGame(io, { winner: 'evil', reason: '邪恶阵营成功破坏了 3 次任务，邪恶势力全面获胜！' });
          } else if (successQuests >= 3) {
            this.game.phase = 'assassination';
            io.to(this.room.roomId).emit('avalon_phase_change', {
              phase: this.game.phase,
              leaderSeat: this.game.leaderSeat,
              currentQuestSize: 0,
              failedVotes: this.game.failedVotes
            });
          } else {
            this.game.currentQuestIndex++;
            this.game.phase = 'team_building';
            this.game.leaderSeat = this.getNextLeaderSeat();

            const rule = AVALON_RULES[totalPlayers] || AVALON_RULES[5];
            io.to(this.room.roomId).emit('avalon_phase_change', {
              phase: this.game.phase,
              leaderSeat: this.game.leaderSeat,
              currentQuestSize: rule.quests[this.game.currentQuestIndex],
              failedVotes: this.game.failedVotes
            });
          }
        }, shuffledCards.length * 1000 + 3000);
      }
      return { success: true };
    }

    if (actionData.type === 'ASSASSINATE') {
      if (this.game.phase !== 'assassination') return { success: false, error: '还未进入刺杀阶段' };
      if (player.role !== AVALON_ROLES.ASSASSIN) return { success: false, error: '你不是刺客，无权行刺' };

      const targetSeat = actionData.targetSeat;
      let targetPlayer = null;
      for (const [_, p] of this.room.players.entries()) {
        if (p.seatNumber === targetSeat) {
          targetPlayer = p;
          break;
        }
      }

      if (!targetPlayer) return { success: false, error: '找不到刺杀目标' };

      if (targetPlayer.role === AVALON_ROLES.MERLIN) {
        this.triggerEndGame(io, { winner: 'evil', reason: `刺客一发入魂，成功刺杀了梅林 [${targetPlayer.nickname}]，邪恶阵营绝地翻盘！` });
      } else {
        this.triggerEndGame(io, { winner: 'good', reason: `刺客判断失误，错杀了 [${targetPlayer.nickname}]，正义阵营锁定最终胜局！` });
      }

      return { success: true };
    }

    return { success: false, error: '未知操作指令' };
  }

  // 安全获取下一个队长座号（跳过可能离线但未销毁数据的空洞号段）
  getNextLeaderSeat() {
    const allPlayers = Array.from(this.room.players.values()).sort((a, b) => a.seatNumber - b.seatNumber);
    const currentIndex = allPlayers.findIndex(p => p.seatNumber === this.game.leaderSeat);
    const nextIndex = (currentIndex + 1) % allPlayers.length;
    return allPlayers[nextIndex].seatNumber;
  }

  triggerEndGame(io, result) {
    this.game.phase = 'end';
    this.room.status = 'END';
    Array.from(this.room.players.values()).forEach(p => p.isReady = false);
    result.finalRoles = this.getFinalRoles();
    io.to(this.room.roomId).emit('avalon_game_end', result);
  }

  getFinalRoles() {
    const roles = [];
    for (const [_, p] of this.room.players.entries()) {
      roles.push({
        nickname: p.nickname,
        initialRole: p.role,
        currentRole: p.role
      });
    }
    return roles;
  }
}
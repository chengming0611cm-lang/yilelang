export class SgsEngine {
  constructor(room) {
    this.room = room;
  }

  startGame(io) {
    const { selectedRoles } = this.room.settings;
    if (!selectedRoles || selectedRoles.length !== this.room.players.size) {
      throw new Error(`请选择刚好 ${this.room.players.size} 张牌！`);
    }

    const shuffledRoles = this.shuffle([...selectedRoles]);
    let index = 0;
    
    for (const player of this.room.players.values()) {
      player.role = shuffledRoles[index];
      player.initialRole = player.role; // 记录初始身份
      index++;
    }

    this.room.status = 'PLAYING';

    // Broadcast roles
    for (const player of this.room.players.values()) {
      io.to(player.socketId).emit('sgs_game_started', {
        role: player.role
      });
    }
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  handlePlayerAction(sessionId, actionData, io) {
    return { success: false, error: 'SGS mode has no night actions' };
  }
}

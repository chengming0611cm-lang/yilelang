const fs = require('fs');

let code = fs.readFileSync('backend/onuwEngine.js', 'utf8');

const regex = /startVotingPhase\(io\) \{[\s\S]*?forceAction\(actionName, io\) \{[\s\S]*?if \(actionName === 'start_voting_countdown'[\s\S]*?return true;\s*\}/;

const newCode = `startVotingPhase(io) {
    this.room.status = 'VOTING';
    this.game.votingEndTime = Date.now() + 30000;
    io.to(this.room.roomId).emit('voting_started', {
      votingEndTime: this.game.votingEndTime
    });

    if (this.game.votingTimer) clearTimeout(this.game.votingTimer);

    this.game.votingTimer = setTimeout(() => {
      this.game.votingTimer = null;
      this.room.status = 'END';
      const allPlayers = Array.from(this.room.players.values());
      allPlayers.forEach(p => p.isReady = false);
      
      const gameResult = this.calculateGameResult();
      io.to(this.room.roomId).emit('game_ended', gameResult);
    }, 30000);
  }

  forceAction(actionName, io) {`;

if (code.match(regex)) {
    code = code.replace(regex, newCode);
    fs.writeFileSync('backend/onuwEngine.js', code, 'utf8');
    console.log("Backend updated successfully.");
} else {
    console.log("Backend match failed.");
}

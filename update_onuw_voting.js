const fs = require('fs');
let code = fs.readFileSync('backend/onuwEngine.js', 'utf8');

// 1. In submitVote, remove the allVoted check and calculation.
code = code.replace(/const allVoted = allPlayers\.every\(p => p\.votesFor !== null\);\s*if \(allVoted\) \{[\s\S]*?return true;\s*\}/, '');

// 2. Add forceAction 'start_voting_countdown'
code = code.replace(/forceAction\(actionName, io\) \{/, `forceAction(actionName, io) {
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
    }`);

// Also clear votingTimer in initialization
code = code.replace(/this\.game\.dayTimer = null;/, `this.game.dayTimer = null;
    this.game.votingTimer = null;
    this.game.votingTimeLeft = 0;`);

fs.writeFileSync('backend/onuwEngine.js', code, 'utf8');
console.log('Modified onuwEngine.js successfully!');

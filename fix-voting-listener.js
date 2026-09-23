const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');
if (!code.includes("voting_countdown', (timeLeft)")) {
  code = code.replace(/socket\.on\('game_ended', \(result\) => \{/, `socket.on('voting_countdown', (timeLeft) => {
      votingCountdown.value = timeLeft;
    });
    
    socket.on('game_ended', (result) => {`);
  fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
  console.log('Fixed index.vue voting_countdown listener');
}

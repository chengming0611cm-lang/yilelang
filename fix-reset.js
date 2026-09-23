const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/appState\.value = 'END';/, `appState.value = 'END';
      votingCountdown.value = null;
      selectedVote.value = null;`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

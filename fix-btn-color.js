const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/<button v-else class="confirm-btn secondary-btn" @click="appState = 'WAITING'">/, 
  `<button v-else class="confirm-btn" @click="appState = 'WAITING'">`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

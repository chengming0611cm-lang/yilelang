const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/socket\.on\('room_update', \(data\) => \{([\s\S]*?)players\.value = data\.players;/, `socket.on('room_update', (data) => {$1players.value = data.players;
    const me = data.players.find(p => p.sessionId === sessionId.value);
    if (me) isHost.value = me.isHost;`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

code = code.replace(/socket\.on\('transfer_host', \(data\) => \{([\s\S]*?)\}\);/, `socket.on('transfer_host', (data) => {
    console.log('transfer_host received:', data);$1
  });`);

code = code.replace(/socket\.on\('kick_player', \(data\) => \{([\s\S]*?)\}\);/, `socket.on('kick_player', (data) => {
    console.log('kick_player received:', data);$1
  });`);

fs.writeFileSync('backend/server.js', code, 'utf8');

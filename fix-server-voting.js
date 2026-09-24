const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

code = code.replace(/nightViewData: room\.status === 'NIGHT' && typeof room\.engine\.getRoleNightViewData === 'function' \? room\.engine\.getRoleNightViewData\(player\) : \{\}/g,
`nightViewData: room.status === 'NIGHT' && typeof room.engine.getRoleNightViewData === 'function' ? room.engine.getRoleNightViewData(player) : {},
            votingEndTime: room.engine.game.votingEndTime || null`);

fs.writeFileSync('backend/server.js', code, 'utf8');
console.log("server.js updated.");

const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

if (!code.includes('start_voting_countdown')) {
  code = code.replace(/socket\.on\('force_vote', \(data\) => \{[\s\S]*?\}\);/,
    `$&
  
  // 7. 房主开启投票倒计时
  socket.on('start_voting_countdown', (data) => {
    const { sessionId, roomId } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.hostId === sessionId) {
      room.forceAction('start_voting_countdown', io);
    }
  });`);
  fs.writeFileSync('backend/server.js', code, 'utf8');
  console.log('Updated server.js');
}

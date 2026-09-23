const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

if (!code.includes("socket.on('transfer_host'")) {
  code = code.replace(/socket\.on\('force_return_lobby', \(data\) => \{[\s\S]*?\}\);/, `$&
  
  // 移交房主
  socket.on('transfer_host', (data) => {
    const { sessionId, roomId, targetId } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.transferHost(sessionId, targetId)) {
      io.to(roomId).emit('room_update', room.getRoomInfo());
    }
  });

  // 踢出玩家
  socket.on('kick_player', (data) => {
    const { sessionId, roomId, targetId } = data;
    const room = RoomManager.getRoom(roomId);
    if (room) {
      const kickedSocketId = room.kickPlayer(sessionId, targetId);
      if (kickedSocketId) {
        io.to(kickedSocketId).emit('kicked_from_room');
        const kickedSocket = io.sockets.sockets.get(kickedSocketId);
        if (kickedSocket) kickedSocket.leave(roomId);
        io.to(roomId).emit('room_update', room.getRoomInfo());
      }
    }
  });`);
  fs.writeFileSync('backend/server.js', code, 'utf8');
  console.log('Updated server.js');
}

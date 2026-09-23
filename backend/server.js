import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
      html = html.replace(/crossorigin/g, ''); // 移除 crossorigin 属性
      return res.send(html);
    } catch (e) {
      console.error(e);
    }
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('用户已连接', socket.id);

  // 1. 加入房间
  socket.on('join_room', (data, callback) => {
    const { roomId, nickname, sessionId } = data;
    if (!roomId || !sessionId) return callback({ success: false, msg: '参数错误' });

    const joinResult = RoomManager.joinRoom(roomId, nickname, sessionId, socket.id);
    if (!joinResult.success) {
      return callback({ success: false, msg: joinResult.msg });
    }

    socket.join(roomId);
    const room = joinResult.room;
    const player = joinResult.player;

    broadcastRoomUpdate(roomId);

    
      let gameState = null;
      if (room.engine && room.engine.game) {
        if (room.gameType === 'avalon') {
          gameState = {
            phase: room.engine.game.phase,
            vision: room.engine.getVisionForRole ? room.engine.getVisionForRole(player.initialRole, player.seatNumber) : {},
            leaderSeat: room.engine.game.leaderSeat,
            currentQuestSize: room.engine.game.currentQuestSize,
            failedVotes: room.engine.game.failedVotes,
            proposedTeam: room.engine.game.proposedTeam,
            questResults: room.engine.game.questResults
          };
        } else if (room.gameType === 'onuw') {
          gameState = {
            currentNightRole: room.engine.game.currentActiveRole || '',
            nightViewData: room.status === 'NIGHT' && typeof room.engine.getRoleNightViewData === 'function' ? room.engine.getRoleNightViewData(player) : {}
          };
        }
      }

      callback({
        success: true,
        roomId,
        roomStatus: room.status,
        gameType: room.gameType,
        isHost: room.hostId === sessionId,
        settings: room.settings,
        playerState: {
          initialRole: player.initialRole || player.role,
          currentRole: player.currentRole || player.role
        },
        gameState
      });

  });

  // 2. 切换游戏类型
  socket.on('change_game_type', (data) => {
    const { sessionId, roomId, gameType } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.hostId === sessionId && room.status === 'WAITING') {
      room.setGameType(gameType);
      broadcastRoomUpdate(roomId);
    }
  });

  // 3. 更新设置
  socket.on('update_settings', (data) => {
    const { sessionId, roomId, settings } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.hostId === sessionId && room.status === 'WAITING') {
      room.settings = { ...room.settings, ...settings };
      broadcastRoomUpdate(roomId);
    }
  });

  // 3.5 玩家准备/取消准备
  socket.on('toggle_ready', (data) => {
    const { sessionId, roomId, isReady } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.status === 'WAITING') {
      const player = room.players.get(sessionId);
      if (player && room.hostId !== sessionId) {
        player.isReady = isReady;
        broadcastRoomUpdate(roomId);
      }
    }
  });

  // 4. 开始游戏
  socket.on('start_game', (data) => {
    const { sessionId, roomId } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.hostId === sessionId && room.status === 'WAITING') {
      // 强制校验所有人必须准备
      let allReady = true;
      for (const player of room.players.values()) {
        if (player.sessionId !== room.hostId && !player.isReady && !player.offline) {
          allReady = false;
          break;
        }
      }

      if (!allReady) {
        io.to(socket.id).emit('error_msg', '有玩家未准备');
        return;
      }

      try {
        room.startGame(io);
        broadcastRoomUpdate(roomId);
      } catch (err) {
        io.to(socket.id).emit('error_msg', err.message);
      }
    }
  });

  // 5. 游戏行为
  socket.on('game_action', (data, callback) => {
    const { sessionId, roomId, actionData } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const result = room.handlePlayerAction(sessionId, actionData, io);
    if (callback) callback(result);
  });

  socket.on('night_action', (data, callback) => {
    const { sessionId, roomId, actionData } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const result = room.handlePlayerAction(sessionId, actionData, io);
    if (callback) callback(result);
  });

  // 6. 房主提前进入投票
  socket.on('force_vote', (data) => {
    const { sessionId, roomId } = data;
    const room = RoomManager.getRoom(roomId);
    if (room && room.hostId === sessionId) {
      if (room.forceAction('force_vote', io)) {
        broadcastRoomUpdate(roomId);
      }
    }
  });

  // 7. 提交投票
  socket.on('submit_vote', (data) => {
    const { sessionId, roomId, voteTarget } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    if (room.submitVote(sessionId, voteTarget, io)) {
      broadcastRoomUpdate(roomId);
    }
  });

  // 8. 退出房间
  socket.on('leave_room', (data, callback) => {
    const { sessionId, roomId } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, msg: '错误' });
      return;
    }

    room.players.delete(sessionId);
    socket.leave(roomId);

    if (room.players.size === 0) {
      RoomManager.rooms.delete(roomId);
    } else {
      let aborted = false;
      if (room.hostId === sessionId) {
        room.hostId = Array.from(room.players.keys())[0];
      }
      if (room.status !== 'WAITING') {
        room.status = 'WAITING';
        room.engine = null;
        aborted = true;
      }

      broadcastRoomUpdate(roomId);
      if (aborted) {
        io.to(roomId).emit('game_aborted', { reason: '玩家中途退出，对局中止' });
      }
    }
    if (typeof callback === 'function') callback({ success: true });
  });

  // 9. 强制返回大厅
  socket.on('force_return_lobby', (data, callback) => {
    const { sessionId, roomId } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) {
      if (typeof callback === 'function') callback({ success: false, msg: '错误' });
      return;
    }
    if (room.hostId !== sessionId) {
      if (typeof callback === 'function') callback({ success: false, msg: '没有权限' });
      return;
    }

    room.status = 'WAITING';
    room.engine = null;
    for (const player of room.players.values()) {
      player.isReady = false;
    }

    broadcastRoomUpdate(roomId);
    io.to(roomId).emit('return_to_lobby', { reason: '房主强制重开' });
    if (typeof callback === 'function') callback({ success: true });
  });

  // 处理断线
  socket.on('disconnect', () => {
    console.log('连接断开 :', socket.id);
    for (const [roomId, room] of RoomManager.rooms.entries()) {
      for (const [sessionId, player] of room.players.entries()) {
        if (player.socketId === socket.id) {
          player.offline = true;
          broadcastRoomUpdate(roomId);

          player.offlineTimer = setTimeout(() => {
            if (player.offline) {
              room.players.delete(sessionId);
              if (room.players.size === 0) {
                RoomManager.rooms.delete(roomId);
              } else if (room.hostId === sessionId) {
                room.hostId = Array.from(room.players.keys())[0];
                broadcastRoomUpdate(roomId);
              } else {
                broadcastRoomUpdate(roomId);
              }
            }
          }, 5 * 60 * 1000);
          break;
        }
      }
    }
  });

  // 状态同步 (断线重连)
  socket.on('sync_state', (data, callback) => {
    const { roomId, sessionId } = data;
    const room = RoomManager.getRoom(roomId);
    if (!room) return callback({ success: false, msg: '错误' });

    const player = room.players.get(sessionId);
    if (!player) return callback({ success: false, msg: '错误' });

    player.socketId = socket.id;
    player.offline = false;
    if (player.offlineTimer) {
      clearTimeout(player.offlineTimer);
      player.offlineTimer = null;
    }

    socket.join(roomId);
    broadcastRoomUpdate(roomId);

    const snapshot = {
      success: true,
      roomId,
      roomStatus: room.status,
      gameType: room.gameType,
      isHost: room.hostId === sessionId,
      settings: room.settings,
      playerState: {
        initialRole: player.initialRole,
        currentRole: player.currentRole
      }
    };

    if (room.engine && typeof room.engine.getSnapshotForPlayer === 'function') {
      snapshot.gameState = room.engine.getSnapshotForPlayer(player);
    }

    callback(snapshot);
  });

  function broadcastRoomUpdate(roomId) {
    const room = RoomManager.getRoom(roomId);
    if (!room) return;

    const playersList = Array.from(room.players.values()).map(p => ({
      nickname: p.nickname,
      sessionId: p.sessionId,
      isHost: p.sessionId === room.hostId,
      seatNumber: p.seatNumber,
      offline: p.offline,
      isReady: p.isReady
    }));

    io.to(roomId).emit('room_update', {
      players: playersList,
      settings: room.settings,
      gameType: room.gameType,
      status: room.status
    });
  }
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
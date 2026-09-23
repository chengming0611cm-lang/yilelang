import { OnuwEngine } from './onuwEngine.js';
import { AvalonEngine } from './avalonEngine.js';
import { SgsEngine } from './sgsEngine.js';

export class Room {
  constructor(roomId, hostSessionId) {
    this.roomId = roomId;
    this.hostId = hostSessionId;
    this.status = 'WAITING'; // WAITING | PLAYING | NIGHT | DAY ... (由引擎驱动)
    this.players = new Map();
    this.gameType = 'onuw'; // 'onuw' | 'avalon'
    this.settings = {}; //  
    this.engine = null;
  }

  transferHost(hostSessionId, targetSessionId) {
    if (this.hostId !== hostSessionId) return false;
    if (!this.players.has(targetSessionId)) return false;
    this.hostId = targetSessionId;
    this.players.get(targetSessionId).isReady = false;
    return true;
  }

  kickPlayer(hostSessionId, targetSessionId) {
    if (this.hostId !== hostSessionId) return false;
    const target = this.players.get(targetSessionId);
    if (!target) return false;
    if (target.isReady) return false;

    this.players.delete(targetSessionId);
    return target.socketId;
  }

  setGameType(type) {
    if (this.status !== 'WAITING') return false;
    this.gameType = type;
    this.settings = {}; //  ?
    return true;
  }

  startGame(io) {
    if (this.status !== 'WAITING') return false;

    if (this.gameType === 'onuw') {
      this.engine = new OnuwEngine(this);
      this.engine.startGame(io);
    } else if (this.gameType === 'sgs') {
      this.engine = new SgsEngine(this);
      this.engine.startGame(io);
    } else if (this.gameType === 'avalon') {
      this.engine = new AvalonEngine(this);
      this.engine.startGame(io);
    } else {
      throw new Error('Unknown game type');
    }
    
    return true;
  }

  handlePlayerAction(sessionId, actionData, io) {
    if (!this.engine) return { success: false, error: 'Engine not initialized' };
    return this.engine.handlePlayerAction(sessionId, actionData, io);
  }

  forceAction(actionName, io) {
    if (!this.engine) return false;
    return this.engine.forceAction(actionName, io);
  }

  submitVote(sessionId, voteTarget, io) {
    if (!this.engine || typeof this.engine.submitVote !== 'function') return false;
    return this.engine.submitVote(sessionId, voteTarget, io);
  }
}

class Manager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  createOrGetRoom(roomId, hostSessionId) {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId, hostSessionId);
      this.rooms.set(roomId, room);
    }
    return room;
  }

  //  
  joinRoom(roomId, nickname, sessionId, socketId) {
    let room = this.rooms.get(roomId);
    
    //  ?
    if (!room) {
      room = this.createOrGetRoom(roomId, sessionId);
    }

    let player = room.players.get(sessionId);

    //  
    if (!player) {
      const existingPlayer = Array.from(room.players.values()).find(p => p.nickname === nickname);
      if (existingPlayer) {
                if (existingPlayer.offline) {
          //  
          if (room.hostId === existingPlayer.sessionId) {
             room.hostId = sessionId; //  
          }
          room.players.set(sessionId, existingPlayer);
          room.players.delete(existingPlayer.sessionId);
          existingPlayer.sessionId = sessionId;
          player = existingPlayer;
        } else {
          //  
          return { success: false, msg: 'error' };
        }
      }
    }

    if (!player) {
      if (room.status !== 'WAITING') {
        return { success: false, msg: 'error' };
      }
      player = {
        sessionId,
        socketId,
        nickname,
        seatNumber: Array.from(room.players.values()).reduce((max, p) => Math.max(max, p.seatNumber), 0) + 1,
        isReady: false,
        offline: false,
        offlineTimer: null
      };
      room.players.set(sessionId, player);
    } else {
      //   socketId  ?nickname
      player.socketId = socketId;
      player.nickname = nickname;
      player.offline = false;
      if (player.offlineTimer) {
        clearTimeout(player.offlineTimer);
        player.offlineTimer = null;
      }
    }

    return {
      success: true,
      room,
      player
    };
  }
}

export const RoomManager = new Manager();

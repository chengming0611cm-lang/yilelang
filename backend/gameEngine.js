export class GameEngine {
  constructor(room) {
    this.room = room; // RoomManager   Room  
  }

  //  
  startGame(io) {
    throw new Error('startGame must be implemented');
  }

  //  
  handlePlayerAction(sessionId, actionData) {
    throw new Error('handlePlayerAction must be implemented');
  }

  //  
  forceAction(actionName, io) {
    throw new Error('forceAction must be implemented');
  }
}

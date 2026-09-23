const fs = require('fs');
let code = fs.readFileSync('backend/roomManager.js', 'utf8');

if (!code.includes('transferHost(hostSessionId, targetSessionId)')) {
  code = code.replace(/getRoomInfo\(\) \{/, `transferHost(hostSessionId, targetSessionId) {
    if (this.hostId !== hostSessionId) return false;
    if (!this.players.has(targetSessionId)) return false;
    this.hostId = targetSessionId;
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

  getRoomInfo() {`);
  fs.writeFileSync('backend/roomManager.js', code, 'utf8');
  console.log('Updated roomManager.js');
}

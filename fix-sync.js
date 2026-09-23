const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

const gameStateLogic = `
      let gameState = null;
      if (room.engine && room.engine.game) {
        if (room.gameType === 'avalon') {
          gameState = {
            phase: room.engine.game.phase,
            vision: room.engine.getVisionForRole ? room.engine.getVisionForRole(player.initialRole || player.role, player.seatNumber) : {},
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
      snapshot.gameState = gameState;
`;

code = code.replace(/if \(room\.engine && typeof room\.engine\.getSnapshotForPlayer === 'function'\) \{[\s\S]*?\}/, gameStateLogic);

fs.writeFileSync('backend/server.js', code, 'utf8');

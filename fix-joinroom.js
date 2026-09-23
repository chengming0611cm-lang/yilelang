const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

const injection = `if (res.settings && res.settings.selectedRoles) {
              selectedRoles.value = res.settings.selectedRoles;
            }
            if (gameType.value === 'avalon' && res.gameState) {
               avalonState.value.role = res.playerState.initialRole;
               avalonState.value.phase = res.gameState.phase;
               avalonState.value.vision = res.gameState.vision || {};
               avalonState.value.leaderSeat = res.gameState.leaderSeat;
               avalonState.value.currentQuestSize = res.gameState.currentQuestSize;
               avalonState.value.failedVotes = res.gameState.failedVotes;
               avalonState.value.proposedTeam = res.gameState.proposedTeam || [];
               avalonState.value.questResults = res.gameState.questResults || [];
            } else if (gameType.value === 'onuw' && res.gameState) {
               currentNightRole.value = res.gameState.currentNightRole;
               nightViewData.value = res.gameState.nightViewData;
            }`;

code = code.replace(/if \(res\.settings && res\.settings\.selectedRoles\) \{\s*selectedRoles\.value = res\.settings\.selectedRoles;\s*\}/g, injection);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

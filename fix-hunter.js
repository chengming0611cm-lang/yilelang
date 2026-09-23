const fs = require('fs');
let code = fs.readFileSync('backend/onuwEngine.js', 'utf8');

const targetStr = `    let winner = 'error';
    let summary = '';

    const exiledRoles = exiledPlayers.map(p => p.currentRole);
    const hasWerewolfExiled = exiledRoles.includes(ROLES.WEREWOLF);
    const hasTannerExiled = exiledRoles.includes(ROLES.TANNER);`;

const hunterLogic = `    // ======== 猎人带人判定 ========
    const hunterPlayers = exiledPlayers.filter(p => p.currentRole === ROLES.HUNTER);
    hunterPlayers.forEach(hunter => {
      if (hunter.votesFor !== null && hunter.votesFor !== -1) {
        const targetPlayer = allPlayers.find(p => p.seatNumber === hunter.votesFor);
        if (targetPlayer && !exiledPlayers.includes(targetPlayer)) {
          exiledPlayers.push(targetPlayer);
        }
      }
    });

    let winner = 'error';
    let summary = '';

    const exiledRoles = exiledPlayers.map(p => p.currentRole);
    const hasWerewolfExiled = exiledRoles.includes(ROLES.WEREWOLF);
    const hasTannerExiled = exiledRoles.includes(ROLES.TANNER);`;

code = code.replace(targetStr, hunterLogic);
fs.writeFileSync('backend/onuwEngine.js', code, 'utf8');

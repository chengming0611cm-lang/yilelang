const fs = require('fs');
let code = fs.readFileSync('backend/onuwEngine.js', 'utf8');

const werewolfLogic = `case 'WEREWOLF_VIEW':
          const isLoneWolf = allPlayersArray.filter(p => p.initialRole === 'werewolf').length === 1;
          const seen = this.game.centerCards[actionData.centerIndex];
          if (isLoneWolf && seen === 'werewolf' && !actionData.isSecondView) {
            player.hasActed = false;
            player.werewolfFirstViewIndex = actionData.centerIndex;
            result.seenRole = seen;
            result.allowSecondView = true;
            logText = \`孤狼查看了中央第 \${actionData.centerIndex + 1} 张牌，是狼人，获得了再看一张的机会\`;
          } else {
            if (actionData.isSecondView) {
              result.seenRoles = ['werewolf', seen];
              logText = \`孤狼第二次查看了中央第 \${actionData.centerIndex + 1} 张牌\`;
            } else {
              result.seenRole = seen;
              logText = \`狼人查看了中央第 \${actionData.centerIndex + 1} 张牌\`;
            }
          }
          break;`;
code = code.replace(/case 'WEREWOLF_VIEW':[\s\S]*?break;/, werewolfLogic.replace(/'werewolf'/g, 'ROLES.WEREWOLF'));

const hunterLogic = `
    // ======== 猎人带人判定 ========
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

code = code.replace(/let winner = 'error';[\s\S]*?const hasTannerExiled = exiledRoles\.includes\(ROLES\.TANNER\);/, hunterLogic);

fs.writeFileSync('backend/onuwEngine.js', code, 'utf8');

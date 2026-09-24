const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Remove socket.on('voting_countdown')
code = code.replace(/socket\.on\('voting_countdown'[\s\S]*?\}\);/, "");

// 2. Replace voting_started
const oldVotingStarted = /socket\.on\('voting_started', \(\) => \{[\s\S]*?\}\);/;
const newVotingStarted = `socket.on('voting_started', (data) => {
      appState.value = 'VOTING';
      playSound('vote');
      if (isHost.value) {
        speak("讨论时间结束，请所有人在手机上投票。");
      }
      if (data && data.votingEndTime) {
        startLocalCountdown(data.votingEndTime);
      }
    });`;
code = code.replace(oldVotingStarted, newVotingStarted);

// 3. Inject startLocalCountdown before startVotingCountdown
const startCountdownCode = `let localVotingTimer = null;
  const startLocalCountdown = (endTime) => {
    if (localVotingTimer) clearInterval(localVotingTimer);
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      votingCountdown.value = remaining;
      if (remaining <= 0) {
        clearInterval(localVotingTimer);
      }
    };
    updateCountdown();
    localVotingTimer = setInterval(updateCountdown, 1000);
  };
  
  const startVotingCountdown = () => {`;
code = code.replace(/const startVotingCountdown = \(\) => \{/, startCountdownCode);

// 4. Update sync_state block
const oldSyncState = `if (gameType.value === 'avalon' && res.gameState) {`;
const newSyncState = `if (gameType.value === 'onuw' && res.gameState && res.gameState.votingEndTime) {
              startLocalCountdown(res.gameState.votingEndTime);
            }
            if (gameType.value === 'avalon' && res.gameState) {`;
code = code.replace(oldSyncState, newSyncState);

// 5. Update HTML Block for voting
const oldVotingHTML = /<view v-if="votingCountdown === null && isHost"[\s\S]*?<\/view>[\s\n]*<view v-else style="margin-bottom: 30rpx; text-align: center;">[\s\n]*<text style="font-size: 30rpx; color: #94a3b8;">等待房主开启投票\.\.\.<\/text>[\s\n]*<\/view>/;

const newVotingHTML = `<view v-if="votingCountdown > 0" style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 40rpx; color: #ef4444; font-weight: 900;">⏳ 距离投票结束还有：{{ votingCountdown }}s</text>
          </view>
          <view v-else style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 40rpx; color: #94a3b8; font-weight: 900;">正在结算...</text>
          </view>`;
if (code.match(oldVotingHTML)) {
  code = code.replace(oldVotingHTML, newVotingHTML);
} else {
  console.log("Could not find the HTML block exactly, attempting loose regex");
  const looseVotingHTML = /<view v-if="votingCountdown === null && isHost"[\s\S]*?等待房主开启投票\.\.\.<\/text>\s*<\/view>/;
  code = code.replace(looseVotingHTML, newVotingHTML);
}

// 6. Fix :disabled logic in template
code = code.replace(/:disabled="votingCountdown === null"/g, ':disabled="votingCountdown <= 0"');

// 7. Fix submitVote validation
code = code.replace(/if \(votingCountdown\.value === null\) \{/, `if (votingCountdown.value <= 0) {`);
code = code.replace(/title: '投票尚未开启'/, `title: '投票已结束'`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log("index.vue updated successfully.");

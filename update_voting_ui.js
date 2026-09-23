const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Template changes: Add Start Voting button, Countdown, button classes and disabled state, and margin-top to bottom-action-container.
const oldVotingTemplate = `        <!-- ==================== VOTING (投票阶段) ==================== -->
        <view v-else-if="appState === 'VOTING'" class="voting-wrapper">
          <view class="voting-header">
            <text class="voting-title">🗳️ 全员投票放逐</text>
            <text class="voting-sub">选择你认为最可疑的玩家进行放逐，也可弃权</text>
          </view>
          
          <view class="voting-grid">
            <view 
              class="vote-player-item" 
              v-for="p in sortedPlayers" 
              :key="p.sessionId">
              <view class="vote-player-info">
                <view class="vote-seat-badge">{{ p.seatNumber }}</view>
                <text class="vote-player-name">{{ p.nickname }}</text>
              </view>
              <button class="vote-action-btn" hover-class="action-btn-hover" @click="submitVote(p.seatNumber)">投TA</button>
            </view>
          </view>

          <view class="bottom-action-container">
            <button class="abstain-btn" @click="submitVote(-1)">🏳️ 放弃本次投票（弃权）</button>
          </view>
        </view>`;

const newVotingTemplate = `        <!-- ==================== VOTING (投票阶段) ==================== -->
        <view v-else-if="appState === 'VOTING'" class="voting-wrapper">
          <view class="voting-header">
            <text class="voting-title">🗳️ 全员投票放逐</text>
            <text class="voting-sub">选择你认为最可疑的玩家进行放逐，也可弃权</text>
          </view>
          
          <view v-if="votingCountdown === null && isHost" style="margin-bottom: 30rpx; width: 100%;">
            <button class="confirm-btn" @click="startVotingCountdown" style="width: 100%; border-radius: 12rpx; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: bold; border: none;">▶️ 房主开启投票 (30s倒计时)</button>
          </view>
          <view v-else-if="votingCountdown !== null" style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 40rpx; color: #ef4444; font-weight: 900;">⏳ 距离投票结束还有：{{ votingCountdown }}s</text>
          </view>
          <view v-else style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 30rpx; color: #94a3b8;">等待房主开启投票...</text>
          </view>

          <view class="voting-grid">
            <view 
              class="vote-player-item" 
              v-for="p in sortedPlayers" 
              :key="p.sessionId">
              <view class="vote-player-info">
                <view class="vote-seat-badge">{{ p.seatNumber }}</view>
                <text class="vote-player-name">{{ p.nickname }}</text>
              </view>
              <button 
                class="vote-action-btn" 
                :class="{'voted-active': selectedVote === p.seatNumber}"
                hover-class="action-btn-hover" 
                @click="submitVote(p.seatNumber)"
                :disabled="votingCountdown === null">
                {{ selectedVote === p.seatNumber ? '已投TA' : '投TA' }}
              </button>
            </view>
          </view>

          <view class="bottom-action-container" style="margin-top: 40rpx; width: 100%; position: relative;">
            <button 
              class="abstain-btn" 
              :class="{'abstain-active': selectedVote === -1}"
              @click="submitVote(-1)"
              :disabled="votingCountdown === null">
              🏳️ {{ selectedVote === -1 ? '已选弃权' : '放弃本次投票（弃权）' }}
            </button>
          </view>
        </view>`;

if (code.includes('全员投票放逐')) {
  code = code.replace(/<!-- ==================== VOTING \(投票阶段\) ==================== -->[\s\S]*?<\/view>\s*<\/view>\s*<\/template>/, newVotingTemplate + '\n        </template>');
}

// 2. Script changes: state variables and functions
code = code.replace(/const selectedRoles = ref\(\[\]\);/, `const selectedRoles = ref([]);
  const selectedVote = ref(null);
  const votingCountdown = ref(null);`);

const submitVoteFunc = `const startVotingCountdown = () => {
    socket.emit('start_voting_countdown', { sessionId: sessionId.value, roomId: roomId.value });
  };

  const submitVote = (targetseatNumber) => {
    if (votingCountdown.value === null) {
      return uni.showToast({ title: '投票尚未开始', icon: 'none' });
    }
    selectedVote.value = targetseatNumber;
    socket.emit('submit_vote', { 
      sessionId: sessionId.value, 
      roomId: roomId.value, 
      voteTarget: targetseatNumber 
    });
  };`;

code = code.replace(/const submitVote = \(targetseatNumber\) => \{[\s\S]*?\}\);[\s\S]*?\};/, submitVoteFunc);

// Handle socket events for countdown and reset
const countdownSocket = `    socket.on('voting_countdown', (timeLeft) => {
      votingCountdown.value = timeLeft;
    });
    
    socket.on('game_ended', (data) => {`;
code = code.replace(/socket\.on\('game_ended', \(data\) => \{/, countdownSocket);

// Handle state reset on return to lobby
code = code.replace(/appState\.value = 'LOBBY';/, `appState.value = 'LOBBY';
          votingCountdown.value = null;
          selectedVote.value = null;`);
          
// 3. CSS changes: align button to right (margin:0), add selected state colors
const votingCSS = `
.vote-action-btn {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 800;
  border-radius: 14rpx;
  padding: 10rpx 28rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.4);
  margin: 0; 
}
.voted-active {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.4) !important;
}
.abstain-active {
  background: rgba(16, 185, 129, 0.3) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
}
`;

code = code.replace(/\.vote-action-btn\s*\{[\s\S]*?box-shadow:[^;]+;\s*\}/, votingCSS.trim());

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Updated index.vue UI and logic for voting phase');

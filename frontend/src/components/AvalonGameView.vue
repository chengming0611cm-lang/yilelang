<template>
  <view class="avalon-container">
    <view class="header">
      <text class="title">⚔️ 阿瓦隆</text>
      <text class="phase-badge">{{ getPhaseName(avalonState.phase) }}</text>
    </view>

    <!-- 任务进度指示器（全局顶部） -->
    <view class="quest-tracker" v-if="avalonState.phase !== 'waiting' && avalonState.phase !== 'night'">
      <view v-for="(res, idx) in 5" :key="idx" class="quest-dot" :class="getQuestDotClass(idx)">
        <text class="dot-num" v-if="getQuestDotClass(idx) === 'dot-pending'">{{ idx + 1 }}</text>
        <text class="dot-icon" v-else-if="getQuestDotClass(idx) === 'dot-success'">🏆</text>
        <text class="dot-icon" v-else-if="getQuestDotClass(idx) === 'dot-fail'">🗡️</text>
      </view>
    </view>

    <!-- ================= 初始夜晚确认阶段 ================= -->
    <view v-if="avalonState.phase === 'night'" class="night-phase center-layout section">
      <text class="sub-title" style="margin-bottom: 20rpx;">夜幕降临，请确认你的身份与情报</text>
      
      <view class="flip-card-container mt" @click="isFlipped = !isFlipped">
        <view class="flip-card" :class="{ flipped: isFlipped }">
          <!-- 卡牌背面（未翻开时显示的内容） -->
          <view class="flip-card-front">
            <text style="color: white; font-size: 36rpx; font-weight: bold;">点击翻开底牌</text>
            <text style="font-size: 100rpx; margin-top: 30rpx;">🎭</text>
          </view>
          <!-- 卡牌正面（翻开后的内容） -->
          <view class="flip-card-back role-card-3d" :class="isGoodRole ? 'glow-good' : 'glow-evil'">
            <view class="role-sprite-large avalon-sprite" :style="{'background-position': AVALON_ROLES_DICTIONARY[avalonState.role]?.spritePosition}"></view>
            
          </view>
        </view>
      </view>

      <view class="vision-panel mt" v-if="hasVision">
        <text class="vision-title">👁️ 你的夜间情报</text>
        
        <template v-if="avalonState.role === 'merlin'">
          <text class="vision-text">你看到的邪恶阵营玩家（不含莫德雷德）有：</text>
          <view class="vision-players">
            <text class="vision-player" v-for="seat in avalonState.vision.evils" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
          </view>
        </template>

        <template v-else-if="avalonState.role === 'percival'">
          <text class="vision-text">你看到的梅林嫌疑人（梅林或莫甘娜）有：</text>
          <view class="vision-players">
            <text class="vision-player" v-for="seat in avalonState.vision.merlinOrMorgana" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
          </view>
        </template>

        <template v-else-if="avalonState.vision.evilMates">
          <text class="vision-text">你的邪恶同伴（不含奥伯伦）有：</text>
          <view class="vision-players">
            <text class="vision-player" v-for="seat in avalonState.vision.evilMates" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
            <text v-if="avalonState.vision.evilMates.length === 0" class="vision-player">无（你是唯一的坏人，或只有奥伯伦）</text>
          </view>
        </template>
      </view>
      
      <view class="vision-panel mt" v-else>
        <text class="vision-title">👁️ 你的夜间情报</text>
        <text class="vision-text">你没有获取任何额外情报，请闭眼等待天亮。</text>
      </view>

      <button 
        class="btn mt confirm-btn" 
        type="primary" 
        :disabled="hasConfirmed"
        @click="confirmNight">
        {{ hasConfirmed ? '已确认，等待其他玩家...' : '确认完毕' }}
      </button>
    </view>

    <!-- ================= 组建车队阶段 ================= -->
    <view v-else-if="avalonState.phase === 'team_building'" class="team-building-phase center-layout section">
      <view class="fail-tracker" style="margin-bottom: 20rpx; padding: 10rpx 20rpx; background: #fdf2e9; border-radius: 8rpx; border: 1px solid #e67e22;">
        <text style="color: #d35400; font-weight: bold;">连续发车失败次数: {{ avalonState.failedVotes }} / 5</text>
      </view>
      
      <template v-if="isLeader">
        <text class="sub-title mt">你是队长，请选择 {{ avalonState.currentQuestSize }} 名玩家组建车队：</text>
        <view class="player-grid mt">
          <view 
            v-for="p in sortedPlayers" 
            :key="p.seatNumber" 
            class="player-item" 
            :class="{ selected: selectedTeam.includes(p.seatNumber), 'offline-player': p.offline }"
            @click="toggleTeamMember(p.seatNumber)"
          >
            <!-- 头像及座号徽章 -->
            <view class="avatar-container">
              <view class="avatar" :style="p.offline ? 'filter: grayscale(100%);' : ''">{{ p.nickname.charAt(0) }}</view>
              <view class="seat-badge">{{ p.seatNumber }}</view>
            </view>
            <text class="name" :style="p.offline ? 'color: #95a5a6;' : ''">{{ p.nickname }}</text>
          </view>
        </view>
        <button 
          class="btn mt confirm-btn" 
          type="primary" 
          :disabled="selectedTeam.length !== avalonState.currentQuestSize"
          @click="proposeTeam"
        >
          确认发车 ({{ selectedTeam.length }}/{{ avalonState.currentQuestSize }})
        </button>
      </template>

      <template v-else>
        <text class="sub-title mt">等待队长 [{{ avalonState.leaderSeat }}号] {{ getPlayerName(avalonState.leaderSeat) }} 组建车队...</text>
        <view class="loader mt">⌛</view>
      </template>
    </view>

    <!-- ================= 车队投票阶段 ================= -->
    <view v-else-if="avalonState.phase === 'team_voting'" class="team-voting-phase center-layout section">
      <text class="sub-title">队长 [{{ avalonState.leaderSeat }}号] {{ getPlayerName(avalonState.leaderSeat) }} 提名的车队名单：</text>
      <view class="proposed-team mt">
        <view v-for="seat in sortedProposedTeam" :key="seat" class="team-member">
          <view class="avatar-container">
            <view class="avatar">{{ getPlayerName(seat).charAt(0) }}</view>
            <view class="seat-badge">{{ seat }}</view>
          </view>
          <text class="name">{{ getPlayerName(seat) }}</text>
        </view>
      </view>

      <text class="mt" style="font-size: 36rpx; margin-bottom: 40rpx; font-weight: bold; margin-top: 40rpx; display: block;">你是否同意该车队发车？</text>
      
      <view class="vote-buttons" v-if="!hasVotedTeam">
        <button class="vote-btn approve" @click="submitTeamVote('approve')">👍 赞成</button>
        <button class="vote-btn reject" @click="submitTeamVote('reject')">👎 反对</button>
      </view>
      <view v-else class="mt">
        <text style="color: #27ae60; font-size: 32rpx; font-weight: bold;">已投票，等待其他玩家...</text>
      </view>
    </view>

    <!-- ================= 执行任务阶段 ================= -->
    <view v-else-if="avalonState.phase === 'quest_execution'" class="quest-execution-phase center-layout section">
      <text class="sub-title">任务执行</text>

      <template v-if="isOnQuest">
        <text class="desc mt" style="margin-bottom: 40rpx;">你是本次车队成员，请提交你的任务牌：</text>
        <view class="quest-cards" v-if="!hasSubmittedQuest">
          <view class="quest-card success-card" @click="submitQuest('success')">
            <text class="emoji">🏆</text>
            <text class="quest-card-text">任务成功</text>
          </view>
          
          <view class="quest-card fail-card" :class="{ disabled: isGoodRole }" @click="!isGoodRole && submitQuest('fail')">
            <text class="emoji">🗡️</text>
            <text class="quest-card-text">任务失败</text>
            <text class="role-tip" v-if="isGoodRole">(好人不可选)</text>
          </view>
        </view>
        <view v-else class="mt">
          <text style="color: #27ae60; font-size: 32rpx; font-weight: bold;">已提交，等待其他玩家...</text>
        </view>
      </template>
      <template v-else>
        <text class="desc mt" style="margin-bottom: 40rpx;">等待车队成员执行任务...</text>
        <!-- 为非车队成员展示当前出征的车队名单 -->
        <view class="proposed-team mt" style="margin-bottom: 40rpx;">
          <view v-for="seat in sortedProposedTeam" :key="seat" class="team-member">
            <view class="avatar-container">
              <view class="avatar">{{ getPlayerName(seat).charAt(0) }}</view>
              <view class="seat-badge">{{ seat }}</view>
            </view>
            <text class="name">{{ getPlayerName(seat) }}</text>
          </view>
        </view>
        <view class="loader mt">⌛</view>
      </template>

      <!-- 任务结果展示（延时动画版） -->
      <view class="quest-result-display mt" v-if="avalonState.questDisplayCards && avalonState.questDisplayCards.length > 0">
        <text class="sub-title mt">任务结算</text>
        <view class="revealed-cards">
          <view v-for="(card, idx) in avalonState.questDisplayCards" :key="idx" class="revealed-card" :class="[card, { 'reveal-anim': true }]" :style="{ animationDelay: `${idx * 1}s` }">
            <text>{{ card === 'success' ? '🏆 成功' : '🗡️ 失败' }}</text>
          </view>
        </view>
        <text v-if="avalonState.isQuestSuccess !== null" class="quest-final-result mt" :class="avalonState.isQuestSuccess ? 'color-good' : 'color-evil'" style="font-weight: bold; font-size: 36rpx; display: block; margin-top: 40rpx; text-align: center;">
          {{ avalonState.isQuestSuccess ? '本次任务成功！' : '本次任务失败！' }}
        </text>
      </view>
    </view>

    <!-- ================= 刺客阶段 ================= -->
    <view v-else-if="avalonState.phase === 'assassination'" class="assassination-phase center-layout section">
      <view class="fail-tracker" style="background: #f9ebea; border-color: #c0392b;">
        <text style="color: #c0392b; font-weight: bold;">正义阵营已完成 3 轮任务！进入刺杀环节！</text>
      </view>

      <template v-if="avalonState.role === 'assassin'">
        <text class="sub-title mt">你是刺客，请找出并刺杀梅林以翻盘：</text>
        <view class="player-grid mt">
          <view 
            v-for="p in sortedPlayers" 
            :key="p.seatNumber" 
            class="player-item" 
            :class="{ selected: targetSeat === p.seatNumber }"
            v-show="p.seatNumber !== myPlayerInfo.seatNumber"
            @click="targetSeat = p.seatNumber"
          >
            <view class="avatar-container">
              <view class="avatar">{{ p.nickname.charAt(0) }}</view>
              <view class="seat-badge">{{ p.seatNumber }}</view>
            </view>
            <text class="name">{{ p.nickname }}</text>
          </view>
        </view>
        <button 
          class="btn mt confirm-btn" 
          style="background-color: #c0392b;"
          type="primary" 
          :disabled="targetSeat === null"
          @click="submitAssassination"
        >
          确认刺杀
        </button>
      </template>

      <template v-else>
        <text class="desc mt">等待刺客执行最终行动...</text>
        <view class="loader mt" style="font-size: 80rpx;">🗡️</view>
      </template>
    </view>

    <!-- ================= 游戏结束阶段 ================= -->
    <view v-else-if="avalonState.phase === 'end'" class="end-phase center-layout section">
      <text class="night-title" style="color: #e74c3c; margin-bottom: 30rpx; font-weight: bold; font-size: 48rpx;">🏆 游戏结束</text>
      <text style="color: #666; margin-bottom: 40rpx; font-size: 32rpx; text-align: center;">请查看外层结算面板</text>
    </view>

    <!-- 其他阶段占位 -->
    <view v-else class="other-phase center-layout section">
      <text class="sub-title">当前处于：{{ getPhaseName(avalonState.phase) }}</text>
      <text class="desc mt">该阶段的 UI 还在开发中，敬请期待！</text>
    </view>

    <!-- ================= 投票结果弹窗 ================= -->
    <view class="vote-result-modal" v-if="avalonState.voteResult && showVoteResultModal">
      <view class="vote-result-panel">
        <text class="vote-result-title" :class="avalonState.voteResult.isApproved ? 'color-good' : 'color-evil'">
          车队 {{ avalonState.voteResult.isApproved ? '发车成功！' : '被否决！' }}
        </text>
        <text class="mt" style="color: #666; font-size: 28rpx; display: block; margin-bottom: 30rpx;">赞成票数: {{ avalonState.voteResult.approveCount }} / {{ players.length }}</text>
        
        <scroll-view scroll-y class="vote-list">
          <view v-for="seat in sortedVoteResultSeats" :key="seat" class="vote-item">
            <text class="vote-name">[{{ seat }}号] {{ getPlayerName(seat) }}</text>
            <text class="vote-choice" :class="avalonState.voteResult.votes[seat] === 'approve' ? 'color-good' : 'color-evil'">
              {{ avalonState.voteResult.votes[seat] === 'approve' ? '👍 赞成' : '👎 反对' }}
            </text>
          </view>
        </scroll-view>

        <text class="close-tip mt">({{ voteResultCountdown }}s) 后自动关闭...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { AVALON_ROLES_DICTIONARY } from '../rolesDictionary.js';

const props = defineProps({
  avalonState: {
    type: Object,
    required: true
  },
  players: {
    type: Array,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true
  }
});

const hasConfirmed = ref(false);
const isFlipped = ref(false);
const emit = defineEmits(['action']);

// 按座号严格排序的玩家列表和车队列表
const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => a.seatNumber - b.seatNumber);
});

const sortedProposedTeam = computed(() => {
  return [...(props.avalonState.proposedTeam || [])].sort((a, b) => a - b);
});

const sortedVoteResultSeats = computed(() => {
  if (!props.avalonState.voteResult || !props.avalonState.voteResult.votes) return [];
  return Object.keys(props.avalonState.voteResult.votes).map(Number).sort((a, b) => a - b);
});

// 角色解析
const getRoleName = (role) => AVALON_ROLES_DICTIONARY[role]?.name || role;
const getRoleDesc = (role) => AVALON_ROLES_DICTIONARY[role]?.description || '';
const isGoodRole = computed(() => AVALON_ROLES_DICTIONARY[props.avalonState.role]?.camp === '正义阵营');

const getPhaseName = (phase) => {
  const map = {
    waiting: '等待中',
    night: '初始黑夜',
    team_building: '组建车队',
    team_voting: '车队投票',
    quest_execution: '执行任务',
    assassination: '刺杀阶段',
    end: '游戏结束'
  };
  return map[phase] || phase;
};

const getPlayerName = (seatNumber) => {
  const p = props.players.find(p => p.seatNumber === seatNumber);
  return p ? p.nickname : `座位${seatNumber}`;
};

const hasVision = computed(() => {
  const v = props.avalonState.vision;
  return (v.evils && v.evils.length > 0) || 
         (v.merlinOrMorgana && v.merlinOrMorgana.length > 0) || 
         (v.evilMates);
});

const confirmNight = () => {
  hasConfirmed.value = true;
  emit('action', { type: 'NIGHT_CONFIRM' });
};

// 组建车队逻辑
const myPlayerInfo = computed(() => props.players.find(p => p.sessionId === props.sessionId));
const isLeader = computed(() => myPlayerInfo.value && myPlayerInfo.value.seatNumber === props.avalonState.leaderSeat);
const selectedTeam = ref([]);

const toggleTeamMember = (seatNumber) => {
  if (!isLeader.value) return;
  const idx = selectedTeam.value.indexOf(seatNumber);
  if (idx !== -1) {
    selectedTeam.value.splice(idx, 1);
  } else {
    if (selectedTeam.value.length < props.avalonState.currentQuestSize) {
      selectedTeam.value.push(seatNumber);
    } else {
      uni.showToast({ title: `该任务最多需要 ${props.avalonState.currentQuestSize} 人`, icon: 'none' });
    }
  }
};

const proposeTeam = () => {
  if (selectedTeam.value.length !== props.avalonState.currentQuestSize) return;
  emit('action', { type: 'PROPOSE_TEAM', team: selectedTeam.value });
};

// 车队投票逻辑
const hasVotedTeam = ref(false);
const showVoteResultModal = ref(false);
const voteResultCountdown = ref(5);
let countdownTimer = null;

const submitTeamVote = (vote) => {
  hasVotedTeam.value = true;
  emit('action', { type: 'VOTE_TEAM', vote });
};

// 监听状态变化，重置各个阶段的防呆状态
watch(() => props.avalonState.phase, (newPhase, oldPhase) => {
  if (newPhase === 'night') {
    hasConfirmed.value = false;
    isFlipped.value = false;
  } else if (newPhase === 'team_building') {
    selectedTeam.value = [];
    hasVotedTeam.value = false;
  } else if (newPhase === 'team_voting') {
    hasVotedTeam.value = false;
  } else if (newPhase === 'quest_execution') {
    hasSubmittedQuest.value = false;
  }
});

// 执行任务逻辑
const isOnQuest = computed(() => props.avalonState.proposedTeam && myPlayerInfo.value && props.avalonState.proposedTeam.includes(myPlayerInfo.value.seatNumber));
const hasSubmittedQuest = ref(false);

const submitQuest = (card) => {
  if (isGoodRole.value && card !== 'success') return;
  hasSubmittedQuest.value = true;
  emit('action', { type: 'SUBMIT_QUEST', card });
};

// 刺客逻辑
const targetSeat = ref(null);
const submitAssassination = () => {
  if (targetSeat.value === null) return;
  emit('action', { type: 'ASSASSINATE', targetSeat: targetSeat.value });
};

// 进度指示器
const getQuestDotClass = (index) => {
  const results = props.avalonState.questResults || [];
  if (index >= results.length) return 'dot-pending';
  return results[index] === 1 ? 'dot-success' : 'dot-fail';
};

watch(() => props.avalonState.voteResult, (newResult) => {
  if (newResult) {
    showVoteResultModal.value = true;
    voteResultCountdown.value = 5;
    if (countdownTimer) clearInterval(countdownTimer);
    
    countdownTimer = setInterval(() => {
      voteResultCountdown.value--;
      if (voteResultCountdown.value <= 0) {
        clearInterval(countdownTimer);
        showVoteResultModal.value = false;
      }
    }, 1000);
  }
});
</script>

<style scoped>
.mt {
  margin-top: 30rpx;
}
.avalon-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background-color: #2c3e50;
  color: white;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
}
.phase-badge {
  background-color: #e67e22;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}
.flip-card-container {
  width: 320rpx;
  height: 448rpx;
  perspective: 1000px;
  margin-bottom: 30rpx;
}
.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card.flipped {
  transform: rotateY(180deg);
}
.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.15);
  box-sizing: border-box;
}
.flip-card-front {
  background: #2c3e50;
  color: white;
  border: 4rpx solid #34495e;
}
.flip-card-back {
  background: #2c3e50;
  transform: rotateY(180deg);
  overflow: hidden;
  border: 4rpx solid transparent;
}

/* 原画雪碧图与卡牌文字遮罩 */
.avalon-sprite {
  width: 100%;
  height: 100%;
  background-image: url('/static/avalon-sprite.jpg');
  background-size: 448.72% 386.72%; 
  background-repeat: no-repeat;
  opacity: 0.95;
}
.card-name-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  color: white;
  font-size: 48rpx;
  font-weight: bold;
  padding: 30rpx 0 20rpx 0;
  letter-spacing: 6rpx;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.8);
}

.glow-good {
  box-shadow: inset 0 0 40rpx rgba(59, 130, 246, 0.6), 0 16rpx 40rpx rgba(59, 130, 246, 0.4);
  border-color: #60a5fa;
}
.glow-evil {
  box-shadow: inset 0 0 40rpx rgba(239, 68, 68, 0.6), 0 16rpx 40rpx rgba(239, 68, 68, 0.4);
  border-color: #f87171;
}
.card-label {
  font-size: 28rpx;
  color: #7f8c8d;
  display: block;
  margin-bottom: 10rpx;
}
.card-name {
  font-size: 60rpx;
  font-weight: bold;
  display: block;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}
.color-good {
  color: #2980b9;
}
.color-evil {
  color: #c0392b;
}
.role-desc {
  font-size: 26rpx;
  color: #34495e;
  line-height: 1.5;
  display: block;
  text-align: left;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px dashed #ccc;
}
.vision-panel {
  background: #34495e;
  color: white;
  padding: 30rpx;
  border-radius: 16rpx;
  width: 90%;
  margin-bottom: 40rpx;
}
.vision-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
  color: #f1c40f;
}
.vision-text {
  font-size: 28rpx;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}
.vision-players {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.vision-player {
  background: rgba(255,255,255,0.2);
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
}
.confirm-btn {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  border-radius: 44rpx;
  background-color: #27ae60;
  color: white;
}
.confirm-btn[disabled] {
  background-color: #95a5a6;
  color: #ecf0f1;
}

/* 组建车队阶段样式及座号徽章系统 */
.player-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
  margin-bottom: 40rpx;
}
.player-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #ecf0f1;
  border: 4rpx solid transparent;
  transition: all 0.2s;
  width: 140rpx;
}
.player-item.selected {
  background: #d4efdf;
  border-color: #27ae60;
  transform: scale(1.05);
}

.avatar-container {
  position: relative;
  display: inline-block;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  background: #34495e;
  color: white;
  border-radius: 50%;
  line-height: 80rpx;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  text-align: center;
}
.seat-badge {
  position: absolute;
  top: -12rpx;
  left: -12rpx;
  width: 40rpx;
  height: 40rpx;
  background: #2980b9;
  color: white;
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #ecf0f1;
  z-index: 2;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.3);
}

.name {
  font-size: 24rpx;
  color: #2c3e50;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: center;
}
.loader {
  font-size: 60rpx;
  animation: spin 2s linear infinite;
  text-align: center;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* 提名的车队样式 */
.proposed-team {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  flex-wrap: wrap;
}
.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f1c40f;
  padding: 16rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  width: 140rpx;
}
.team-member .avatar {
  background: #e67e22;
}
.team-member .seat-badge {
  border-color: #f1c40f;
}

/* 投票按钮 */
.vote-buttons {
  display: flex;
  gap: 40rpx;
  width: 90%;
  justify-content: space-around;
}
.vote-btn {
  width: 45%;
  height: 120rpx;
  line-height: 120rpx;
  font-size: 40rpx;
  border-radius: 16rpx;
  font-weight: bold;
}
.vote-btn.approve {
  background-color: #2ecc71;
  color: white;
}
.vote-btn.reject {
  background-color: #e74c3c;
  color: white;
}

/* 投票结果弹窗 */
.vote-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.vote-result-panel {
  background: white;
  width: 80%;
  max-height: 80vh;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.vote-result-title {
  font-size: 48rpx;
  font-weight: bold;
}
.vote-list {
  width: 100%;
  max-height: 50vh;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}
.vote-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
}
.vote-name { color: #333; font-weight: bold; }
.vote-choice { font-weight: bold; }

/* 进度指示器 */
.quest-tracker {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.quest-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28rpx;
  border: 4rpx solid #bdc3c7;
  background: white;
}
.dot-pending { color: #7f8c8d; }
.dot-success { background: #2980b9; border-color: #2980b9; color: white; font-size: 32rpx; }
.dot-fail { background: #c0392b; border-color: #c0392b; color: white; font-size: 32rpx; }

/* 任务卡牌 */
.quest-cards {
  display: flex;
  gap: 40rpx;
  justify-content: center;
}
.quest-card {
  width: 240rpx;
  height: 320rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.quest-card:active { transform: scale(0.95); }
.success-card { background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); color: white; }
.fail-card { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; }
.fail-card.disabled { filter: grayscale(100%); opacity: 0.5; }
.emoji { font-size: 80rpx; margin-bottom: 20rpx; }
.quest-card-text { font-size: 36rpx; font-weight: bold; }
.role-tip { font-size: 24rpx; margin-top: 10rpx; opacity: 0.8; }

/* 揭晓动画 */
.revealed-cards {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30rpx;
}
.revealed-card {
  width: 140rpx;
  height: 200rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
  opacity: 0;
  transform: rotateY(90deg);
}
.revealed-card.success { background: #56ab2f; color: white; }
.revealed-card.fail { background: #c0392b; color: white; }
.reveal-anim {
  animation: revealCard 0.6s forwards;
}
@keyframes revealCard {
  100% { opacity: 1; transform: rotateY(0deg); }
}
</style>
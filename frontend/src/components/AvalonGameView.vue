<template>
  <view class="avalon-container">
    <view class="avalon-header-card">
      <view class="header-title-box">
        <text class="title">⚔️ 阿瓦隆</text>
        <text class="sub-game-tip">亚瑟传奇 · 阵营决战</text>
      </view>
      <view class="header-right-actions">
        <view class="view-role-btn" v-if="avalonState.role" @click="showRoleModal = true">
          <text class="eye-icon">👁️</text>
          <text>底牌</text>
        </view>
        <text class="phase-badge">{{ getPhaseName(avalonState.phase) }}</text>
      </view>
    </view>

    <!-- 任务进度圣盾圆盘（全局顶部） -->
    <view class="quest-tracker-card" v-if="avalonState.phase !== 'waiting' && avalonState.phase !== 'night'">
      <view class="tracker-header">
        <text class="tracker-label">五轮远征战况</text>
        <text class="tracker-sub">需胜 3 轮判定胜利</text>
      </view>
      <view class="quest-dots-row">
        <view v-for="(res, idx) in 5" :key="idx" class="quest-dot" :class="getQuestDotClass(idx)">
          <text class="dot-num" v-if="getQuestDotClass(idx) === 'dot-pending'">{{ idx + 1 }}</text>
          <text class="dot-icon" v-else-if="getQuestDotClass(idx) === 'dot-success'">🏆</text>
          <text class="dot-icon" v-else-if="getQuestDotClass(idx) === 'dot-fail'">🗡️</text>
        </view>
      </view>
    </view>

    <!-- ================= 初始夜晚确认阶段 ================= -->
    <view v-if="avalonState.phase === 'night'" class="night-phase center-layout glass-panel">
      <text class="panel-heading">🌙 夜幕降临 · 身份与军情确认</text>
      
      <view class="flip-card-container mt" @click="isFlipped = !isFlipped">
        <view class="flip-card" :class="{ flipped: isFlipped }">
          <!-- 卡牌背面（未翻开时显示的内容） -->
          <view class="flip-card-front">
            <text class="card-prompt-text">点击翻开底牌</text>
            <text class="card-prompt-emoji">🎭</text>
          </view>
          <!-- 卡牌正面（翻开后的内容） -->
          <view class="flip-card-back role-card-3d" :class="isGoodRole ? 'glow-good' : 'glow-evil'">
            <view class="role-sprite-large avalon-sprite" :style="{'background-position': AVALON_ROLES_DICTIONARY[avalonState.role]?.spritePosition}"></view>
            <view class="card-name-overlay">
              <text class="card-overlay-title">{{ getRoleName(avalonState.role) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="vision-panel mt" v-if="hasVision">
        <text class="vision-title">👁️ 你的夜间情报</text>
        
        <template v-if="avalonState.role === 'merlin'">
          <text class="vision-text">你看到的邪恶阵营玩家（不含莫德雷德）有：</text>
          <view class="vision-players">
            <text class="vision-player evil-tag" v-for="seat in avalonState.vision.evils" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
          
    <!-- 随时查看身份弹窗 -->
    <view v-if="showRoleModal" class="avalon-modal-mask" @click="showRoleModal = false">
      <view class="avalon-modal-content" @click.stop>
        <view class="avalon-modal-header">
          <text class="avalon-modal-title">你的底牌</text>
        </view>
        <view class="avalon-modal-body">
          <view class="role-card-3d" :class="isGoodRole ? 'glow-good' : 'glow-evil'" style="margin: 0 auto; transform: scale(1.1);">
            <view class="role-sprite-large avalon-sprite" :style="{'background-position': AVALON_ROLES_DICTIONARY[avalonState.role]?.spritePosition}"></view>
            <view class="card-name-overlay">
              <text class="card-overlay-title">{{ getRoleName(avalonState.role) }}</text>
            </view>
          </view>
        </view>
        <view class="avalon-modal-footer">
          <button class="avalon-modal-btn confirm-btn" hover-class="confirm-btn-hover" @click="showRoleModal = false">收起底牌</button>
        </view>
      </view>
    </view>
  </view>
</template>

        <template v-else-if="avalonState.role === 'percival'">
          <text class="vision-text">你看到的梅林嫌疑人（梅林或莫甘娜）有：</text>
          <view class="vision-players">
            <text class="vision-player suspect-tag" v-for="seat in avalonState.vision.merlinOrMorgana" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
          </view>
        </template>

        <template v-else-if="avalonState.vision.evilMates">
          <text class="vision-text">你的邪恶同伴（不含奥伯伦）有：</text>
          <view class="vision-players">
            <text class="vision-player evil-tag" v-for="seat in avalonState.vision.evilMates" :key="seat">
              [{{ seat }}号] {{ getPlayerName(seat) }}
            </text>
            <text v-if="avalonState.vision.evilMates.length === 0" class="vision-player">无（你是唯一的坏人，或只有奥伯伦）</text>
          </view>
        </template>
      </view>
      
      <view class="vision-panel mt" v-else>
        <text class="vision-title">👁️ 你的夜间情报</text>
        <text class="vision-text">你没有获取任何额外视觉情报，请依靠推理寻找邪恶阵营。</text>
      </view>

      <button 
        class="confirm-btn mt" 
        :disabled="hasConfirmed"
        @click="confirmNight">
        {{ hasConfirmed ? '✓ 已确认，等待其他玩家...' : '确认完毕并闭眼' }}
      </button>
    </view>

    <!-- ================= 组建车队阶段 ================= -->
    <view v-else-if="avalonState.phase === 'team_building'" class="team-building-phase center-layout glass-panel">
      <!-- 连续发车失败指示器 -->
      <view class="fail-alert-bar" :class="{ 'high-risk': avalonState.failedVotes >= 3 }">
        <text class="alert-icon">⚠️</text>
        <text class="alert-text">连续发车失败次数：{{ avalonState.failedVotes }} / 5 (满5次邪恶阵营直接获胜)</text>
      </view>
      
      <template v-if="isLeader">
        <view class="leader-title-box mt">
          <text class="leader-badge-pill">👑 你是当前队长</text>
          <text class="sub-title">请选择 {{ avalonState.currentQuestSize }} 名队员组建本轮远征车队：</text>
        </view>

        <view class="player-grid mt">
          <view 
            v-for="p in sortedPlayers" 
            :key="p.seatNumber" 
            class="player-item" 
            :class="{ selected: selectedTeam.includes(p.seatNumber), 'offline-player': p.offline }"
            @click="toggleTeamMember(p.seatNumber)"
          >
            <view class="avatar-container">
              <view class="avatar" :style="p.offline ? 'filter: grayscale(100%);' : ''">{{ p.nickname.charAt(0).toUpperCase() }}</view>
              <view class="seat-badge">{{ p.seatNumber }}</view>
              <view v-if="selectedTeam.includes(p.seatNumber)" class="selected-check">✓</view>
            </view>
            <text class="name" :style="p.offline ? 'color: #94a3b8;' : ''">{{ p.nickname }}</text>
          </view>
        </view>

        <button 
          class="confirm-btn mt" 
          :disabled="selectedTeam.length !== avalonState.currentQuestSize"
          @click="proposeTeam"
        >
          {{ selectedTeam.length === avalonState.currentQuestSize ? `确认发车 (${selectedTeam.length}/${avalonState.currentQuestSize}人)` : `请选择 ${avalonState.currentQuestSize} 名队员 (已选${selectedTeam.length})` }}
        </button>
      </template>

      <template v-else>
        <view class="waiting-leader-box mt">
          <text class="waiting-icon">⏳</text>
          <text class="sub-title">等待队长提议车队...</text>
          <view class="leader-display-card">
            <text class="leader-seat-tag">[ {{ avalonState.leaderSeat }}号 ]</text>
            <text class="leader-name">{{ getPlayerName(avalonState.leaderSeat) }}</text>
            <text class="leader-role-desc">正在斟酌 {{ avalonState.currentQuestSize }} 人远征名单</text>
          </view>
        </view>
      </template>
    </view>

    <!-- ================= 车队投票阶段 ================= -->
    <view v-else-if="avalonState.phase === 'team_voting'" class="team-voting-phase center-layout glass-panel">
      <view class="voting-banner-header">
        <text class="sub-title">队长 [{{ avalonState.leaderSeat }}号] {{ getPlayerName(avalonState.leaderSeat) }} 提名的车队名单：</text>
      </view>

      <view class="proposed-team mt">
        <view v-for="seat in sortedProposedTeam" :key="seat" class="team-member">
          <view class="avatar-container">
            <view class="avatar">{{ getPlayerName(seat).charAt(0).toUpperCase() }}</view>
            <view class="seat-badge">{{ seat }}</view>
          </view>
          <text class="name">{{ getPlayerName(seat) }}</text>
        </view>
      </view>

      <text class="vote-prompt-title mt">你是否同意该车队发车？</text>
      
      <view class="vote-buttons" v-if="!hasVotedTeam">
        <button class="vote-btn approve" @click="submitTeamVote('approve')">
          <text class="vote-emoji">👍</text> 赞成发车
        </button>
        <button class="vote-btn reject" @click="submitTeamVote('reject')">
          <text class="vote-emoji">👎</text> 否决车队
        </button>
      </view>
      <view v-else class="voted-waiting-box mt">
        <text class="voted-check-icon">✓</text>
        <text class="voted-text">投票已提交，等待其他玩家表决...</text>
      </view>
    </view>

    <!-- ================= 执行任务阶段 ================= -->
    <view v-else-if="avalonState.phase === 'quest_execution'" class="quest-execution-phase center-layout glass-panel">
      <view class="phase-title-badge">
        <text>⚔️ 秘密远征执行</text>
      </view>

      <template v-if="isOnQuest">
        <text class="desc mt">你是本次车队出征成员，请秘密提交你的任务牌：</text>
        <view class="quest-cards" v-if="!hasSubmittedQuest">
          <view class="quest-card success-card" @click="submitQuest('success')">
            <text class="emoji">🏆</text>
            <text class="quest-card-text">任务成功</text>
            <text class="card-subtitle">支持远征</text>
          </view>
          
          <view class="quest-card fail-card" :class="{ disabled: isGoodRole }" @click="!isGoodRole && submitQuest('fail')">
            <text class="emoji">🗡️</text>
            <text class="quest-card-text">任务失败</text>
            <text class="role-tip" v-if="isGoodRole">好人必须忠诚不可选</text>
            <text class="card-subtitle" v-else>邪恶破坏</text>
          </view>
        </view>
        <view v-else class="voted-waiting-box mt">
          <text class="voted-check-icon">✓</text>
          <text class="voted-text">任务牌已秘密提交，等待远征结果公布...</text>
        </view>
      </template>
      <template v-else>
        <text class="desc mt">本次出征成员正在密室执行任务：</text>
        <!-- 为非车队成员展示当前出征的车队名单 -->
        <view class="proposed-team mt">
          <view v-for="seat in sortedProposedTeam" :key="seat" class="team-member">
            <view class="avatar-container">
              <view class="avatar">{{ getPlayerName(seat).charAt(0).toUpperCase() }}</view>
              <view class="seat-badge">{{ seat }}</view>
            </view>
            <text class="name">{{ getPlayerName(seat) }}</text>
          </view>
        </view>
        <view class="loader-box mt">
          <text class="loader-icon">⏳</text>
          <text class="loader-desc">等待车队成员做出抉择...</text>
        </view>
      </template>

      <!-- 任务结果展示（延时动画版） -->
      <view class="quest-result-display mt" v-if="avalonState.questDisplayCards && avalonState.questDisplayCards.length > 0">
        <text class="sub-title mt">本轮任务牌揭晓：</text>
        <view class="revealed-cards">
          <view v-for="(card, idx) in avalonState.questDisplayCards" :key="idx" class="revealed-card" :class="[card, { 'reveal-anim': true }]" :style="{ animationDelay: `${idx * 0.8}s` }">
            <text class="reveal-text">{{ card === 'success' ? '🏆 成功' : '🗡️ 失败' }}</text>
          </view>
        </view>
        <view v-if="avalonState.isQuestSuccess !== null" class="quest-verdict-box mt" :class="avalonState.isQuestSuccess ? 'verdict-good' : 'verdict-evil'">
          <text class="verdict-title">{{ avalonState.isQuestSuccess ? '🎉 本次任务圆满成功！' : '💥 本次任务遭到破坏失败！' }}</text>
        </view>
      </view>
    </view>

    <!-- ================= 刺客阶段 ================= -->
    <view v-else-if="avalonState.phase === 'assassination'" class="assassination-phase center-layout glass-panel">
      <view class="assassination-alert">
        <text class="alert-icon">🗡️</text>
        <text class="alert-title">正义阵营已完成 3 轮任务！进入刺杀绝杀环节！</text>
      </view>

      <template v-if="avalonState.role === 'assassin'">
        <text class="sub-title mt">你是刺客，请锁定并刺杀梅林以绝地翻盘：</text>
        <view class="player-grid mt">
          <view 
            v-for="p in sortedPlayers" 
            :key="p.seatNumber" 
            class="player-item assassin-target" 
            :class="{ selected: targetSeat === p.seatNumber }"
            v-show="p.seatNumber !== myPlayerInfo.seatNumber"
            @click="targetSeat = p.seatNumber"
          >
            <view class="avatar-container">
              <view class="avatar">{{ p.nickname.charAt(0).toUpperCase() }}</view>
              <view class="seat-badge">{{ p.seatNumber }}</view>
            </view>
            <text class="name">{{ p.nickname }}</text>
          </view>
        </view>
        <button 
          class="confirm-btn danger-assassin-btn mt" 
          :disabled="targetSeat === null"
          @click="submitAssassination"
        >
          {{ targetSeat !== null ? `锁定并刺杀 [${targetSeat}号] ${getPlayerName(targetSeat)}` : '请选择刺杀目标' }}
        </button>
      </template>

      <template v-else>
        <view class="waiting-leader-box mt">
          <text class="assassin-loader-icon">🗡️</text>
          <text class="sub-title">刺客正在暗处寻找真正的梅林...</text>
          <text class="desc">若梅林被刺中，邪恶阵营将逆转取胜！</text>
        </view>
      </template>
    </view>

    <!-- ================= 游戏结束阶段 ================= -->
    <view v-else-if="avalonState.phase === 'end'" class="end-phase center-layout glass-panel">
      <text class="night-title" style="color: #f87171; margin-bottom: 20rpx; font-weight: 900; font-size: 48rpx;">🏆 阿瓦隆战局结束</text>
      <text style="color: #94a3b8; font-size: 28rpx; text-align: center;">请查看外层详细复盘面板</text>
    </view>

    <!-- 其他阶段占位 -->
    <view v-else class="other-phase center-layout glass-panel">
      <text class="sub-title">当前处于：{{ getPhaseName(avalonState.phase) }}</text>
      <text class="desc mt">正在同步对局状态...</text>
    </view>

    <!-- ================= 投票结果弹窗 ================= -->
    <view class="vote-result-modal" v-if="avalonState.voteResult && showVoteResultModal">
      <view class="vote-result-panel">
        <text class="vote-result-title" :class="avalonState.voteResult.isApproved ? 'color-good' : 'color-evil'">
          车队 {{ avalonState.voteResult.isApproved ? '发车成功！' : '被否决！' }}
        </text>
        <text class="vote-count-summary">赞成票数: {{ avalonState.voteResult.approveCount }} / {{ players.length }}</text>
        
        <scroll-view scroll-y class="vote-list">
          <view v-for="seat in sortedVoteResultSeats" :key="seat" class="vote-item">
            <text class="vote-name">[{{ seat }}号] {{ getPlayerName(seat) }}</text>
            <text class="vote-choice" :class="avalonState.voteResult.votes[seat] === 'approve' ? 'color-good' : 'color-evil'">
              {{ avalonState.voteResult.votes[seat] === 'approve' ? '👍 赞成' : '👎 反对' }}
            </text>
          </view>
        </scroll-view>

        <text class="close-tip mt">({{ voteResultCountdown }}s) 后自动返回对局...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
  const showRoleModal = ref(false);
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

/* 查看底牌按钮 */
.header-right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.view-role-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #38bdf8;
  font-weight: 600;
  box-shadow: 0 0 10rpx rgba(56, 189, 248, 0.2);
  transition: all 0.2s;
}
.view-role-btn:active {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(0.95);
}

/* 阿瓦隆专属弹窗 */
.avalon-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}
.avalon-modal-content {
  width: 600rpx;
  background: #1E293B;
  border-radius: 24rpx;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 30rpx rgba(59, 130, 246, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.avalon-modal-header {
  padding: 40rpx 40rpx 10rpx;
  text-align: center;
}
.avalon-modal-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 2rpx;
}
.avalon-modal-body {
  padding: 40rpx;
  display: flex;
  justify-content: center;
}
.avalon-modal-footer {
  padding: 0 40rpx 40rpx;
}
.avalon-modal-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.4);
}
.avalon-modal-btn::after { border: none; }
.confirm-btn-hover {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(37, 99, 235, 0.6);
}

.mt {
  margin-top: 24rpx;
}

.avalon-container {
  width: 100%;
  max-width: 760rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  box-sizing: border-box;
}

/* 顶部标题栏 */
.avalon-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 28rpx;
  background: rgba(18, 24, 38, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.4);
}

.header-title-box {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 36rpx;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 2rpx;
}

.sub-game-tip {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 2rpx;
}

.phase-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  padding: 6rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.35);
}

/* 任务进度圣盾圆盘 */
.quest-tracker-card {
  background: rgba(18, 24, 38, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.tracker-label {
  font-size: 24rpx;
  color: #cbd5e1;
  font-weight: 700;
}

.tracker-sub {
  font-size: 20rpx;
  color: #94a3b8;
}

.quest-dots-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.quest-dot {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  border: 3rpx solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.dot-pending {
  background: rgba(15, 23, 42, 0.8);
  color: #64748b;
  font-size: 28rpx;
}

.dot-success {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  border-color: #60a5fa;
  box-shadow: 0 0 20rpx rgba(56, 189, 248, 0.5);
  font-size: 36rpx;
}

.dot-fail {
  background: linear-gradient(135deg, #dc2626, #f87171);
  border-color: #f87171;
  box-shadow: 0 0 20rpx rgba(239, 68, 68, 0.5);
  font-size: 36rpx;
}

/* 通用暗黑板块 */
.glass-panel {
  background: rgba(18, 24, 38, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.5);
  width: 100%;
  box-sizing: border-box;
}

.center-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.panel-heading {
  font-size: 32rpx;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 20rpx;
  text-shadow: 0 0 20rpx rgba(56, 189, 248, 0.4);
}

.sub-title {
  font-size: 26rpx;
  color: #cbd5e1;
  font-weight: 700;
  text-align: center;
}

.desc {
  font-size: 24rpx;
  color: #94a3b8;
  text-align: center;
}

/* 翻牌区域 */
.flip-card-container {
  width: 300rpx;
  height: 420rpx;
  perspective: 1000px;
  margin-bottom: 24rpx;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
}

.flip-card.flipped {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.6);
  box-sizing: border-box;
}

.flip-card-front {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 3rpx solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
}

.card-prompt-text {
  color: #f8fafc;
  font-size: 30rpx;
  font-weight: 800;
}

.card-prompt-emoji {
  font-size: 80rpx;
  margin-top: 20rpx;
}

.flip-card-back {
  background: #0f172a;
  transform: rotateY(180deg);
  overflow: hidden;
}

.role-card-3d {
  width: 100%;
  height: 100%;
  position: relative;
}

.avalon-sprite {
  width: 100%;
  height: 100%;
  background-image: url('/static/avalon-sprite.jpg');
  background-size: 448.72% 386.72%;
  background-repeat: no-repeat;
}

.glow-good {
  box-shadow: inset 0 0 40rpx rgba(59, 130, 246, 0.6), 0 0 30rpx rgba(59, 130, 246, 0.4);
  border: 4rpx solid #60a5fa;
}

.glow-evil {
  box-shadow: inset 0 0 40rpx rgba(239, 68, 68, 0.6), 0 0 30rpx rgba(239, 68, 68, 0.4);
  border: 4rpx solid #f87171;
}

.card-name-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(transparent, rgba(0,0,0,0.9) 60%);
  padding: 30rpx 0 16rpx 0;
  text-align: center;
}

.card-overlay-title {
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
  text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.8);
}

/* 夜间情报面板 */
.vision-panel {
  background: rgba(10, 15, 26, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 24rpx;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24rpx;
}

.vision-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 12rpx;
  display: block;
}

.vision-text {
  font-size: 24rpx;
  color: #cbd5e1;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

.vision-players {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.vision-player {
  padding: 6rpx 18rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.evil-tag {
  background: rgba(220, 38, 38, 0.25);
  border: 1px solid rgba(220, 38, 38, 0.5);
  color: #f87171;
}

.suspect-tag {
  background: rgba(168, 85, 247, 0.25);
  border: 1px solid rgba(168, 85, 247, 0.5);
  color: #c084fc;
}

/* 按钮通用 */
.confirm-btn {
  width: 100%;
  height: 92rpx;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.4);
  transition: all 0.2s ease;
}

.confirm-btn::after { border: none; }
.confirm-btn:active { transform: scale(0.98); }
.confirm-btn[disabled] {
  background: rgba(100, 116, 139, 0.3) !important;
  color: #64748b !important;
  box-shadow: none !important;
}

/* 发车失败警戒条 */
.fail-alert-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 16rpx;
  padding: 14rpx 20rpx;
  box-sizing: border-box;
}

.fail-alert-bar.high-risk {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
  animation: pulse 1.5s infinite;
}

.alert-icon { font-size: 28rpx; }
.alert-text { font-size: 22rpx; color: #f8fafc; font-weight: 600; }

/* 组队玩家网格 */
.leader-title-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.leader-badge-pill {
  background: rgba(245, 158, 11, 0.25);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fbbf24;
  font-size: 24rpx;
  font-weight: 800;
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
}

.player-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  width: 100%;
}

.player-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 14rpx;
  border-radius: 20rpx;
  background: rgba(10, 15, 26, 0.65);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  width: 130rpx;
  box-sizing: border-box;
  cursor: pointer;
}

.player-item.selected {
  background: rgba(37, 99, 235, 0.25);
  border-color: #38bdf8;
  box-shadow: 0 0 20rpx rgba(56, 189, 248, 0.4);
  transform: translateY(-4rpx);
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #334155, #1e293b);
  color: white;
  border-radius: 50%;
  line-height: 72rpx;
  font-size: 32rpx;
  font-weight: 800;
  text-align: center;
}

.seat-badge {
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  width: 36rpx;
  height: 36rpx;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  font-size: 20rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #0f172a;
  z-index: 2;
}

.selected-check {
  position: absolute;
  bottom: -6rpx;
  right: -6rpx;
  width: 32rpx;
  height: 32rpx;
  background: #10b981;
  color: #fff;
  border-radius: 50%;
  font-size: 20rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #0f172a;
  z-index: 2;
}

.name {
  font-size: 22rpx;
  color: #e2e8f0;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: center;
  margin-top: 10rpx;
}

/* 等待队长提车队 */
.waiting-leader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 30rpx 0;
}

.waiting-icon { font-size: 64rpx; animation: pulse 2s infinite; }

.leader-display-card {
  background: rgba(10, 15, 26, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.leader-seat-tag { font-size: 22rpx; color: #fbbf24; font-weight: 800; }
.leader-name { font-size: 32rpx; color: #f8fafc; font-weight: 800; }
.leader-role-desc { font-size: 22rpx; color: #94a3b8; }

/* 提名的车队 */
.proposed-team {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(245, 158, 11, 0.2);
  border: 1.5px solid rgba(245, 158, 11, 0.5);
  padding: 14rpx 16rpx;
  border-radius: 20rpx;
  width: 130rpx;
  box-sizing: border-box;
}

.team-member .avatar {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.vote-prompt-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #f8fafc;
  text-align: center;
}

.vote-buttons {
  display: flex;
  gap: 20rpx;
  width: 100%;
  margin-top: 24rpx;
}

.vote-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border: none;
  transition: all 0.2s ease;
}

.vote-btn::after { border: none; }
.vote-btn:active { transform: scale(0.97); }

.vote-btn.approve {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(16, 185, 129, 0.4);
}

.vote-btn.reject {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(239, 68, 68, 0.4);
}

.vote-emoji { font-size: 34rpx; }

.voted-waiting-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 14rpx 24rpx;
  border-radius: 16rpx;
}

.voted-check-icon { font-size: 26rpx; color: #34d399; font-weight: 900; }
.voted-text { font-size: 26rpx; color: #34d399; font-weight: 700; }

/* 任务卡牌 */
.phase-title-badge {
  background: rgba(37, 99, 235, 0.25);
  border: 1px solid rgba(59, 130, 246, 0.5);
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 800;
  color: #60a5fa;
}

.quest-cards {
  display: flex;
  gap: 28rpx;
  justify-content: center;
  width: 100%;
  margin-top: 24rpx;
}

.quest-card {
  flex: 1;
  max-width: 280rpx;
  height: 320rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(0,0,0,0.4);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.quest-card:active { transform: scale(0.96); }

.success-card {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  border: 2px solid #34d399;
  box-shadow: 0 10rpx 30rpx rgba(16, 185, 129, 0.4);
}

.fail-card {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  border: 2px solid #f87171;
  box-shadow: 0 10rpx 30rpx rgba(239, 68, 68, 0.4);
}

.fail-card.disabled {
  filter: grayscale(1);
  opacity: 0.35;
  cursor: not-allowed;
}

.emoji { font-size: 72rpx; margin-bottom: 12rpx; }
.quest-card-text { font-size: 32rpx; font-weight: 900; color: #fff; }
.card-subtitle { font-size: 22rpx; color: rgba(255,255,255,0.7); margin-top: 6rpx; }
.role-tip { font-size: 20rpx; color: #ffd700; margin-top: 8rpx; font-weight: 700; }

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 0;
}
.loader-icon { font-size: 60rpx; animation: pulse 2s infinite; }
.loader-desc { font-size: 24rpx; color: #94a3b8; }

/* 任务结果展示动画 */
.revealed-cards {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.revealed-card {
  width: 140rpx;
  height: 200rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.4);
  opacity: 0;
  transform: rotateY(90deg);
}

.revealed-card.success {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 2rpx solid #34d399;
}

.revealed-card.fail {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border: 2rpx solid #f87171;
}

.reveal-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #ffffff;
}

.reveal-anim {
  animation: revealCard 0.6s forwards;
}

@keyframes revealCard {
  100% { opacity: 1; transform: rotateY(0deg); }
}

.quest-verdict-box {
  padding: 16rpx 28rpx;
  border-radius: 18rpx;
  text-align: center;
}

.verdict-good {
  background: rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.5);
}
.verdict-good .verdict-title { color: #34d399; font-size: 32rpx; font-weight: 900; }

.verdict-evil {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.5);
}
.verdict-evil .verdict-title { color: #f87171; font-size: 32rpx; font-weight: 900; }

/* 刺杀阶段 */
.assassination-alert {
  background: rgba(220, 38, 38, 0.25);
  border: 1.5px solid rgba(239, 68, 68, 0.6);
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  animation: pulse 1.5s infinite;
}

.assassination-alert .alert-icon { font-size: 36rpx; }
.assassination-alert .alert-title { font-size: 26rpx; color: #f87171; font-weight: 800; }

.danger-assassin-btn {
  background: linear-gradient(135deg, #dc2626, #991b1b) !important;
  box-shadow: 0 8rpx 24rpx rgba(220, 38, 38, 0.5) !important;
}

.assassin-loader-icon { font-size: 72rpx; margin-bottom: 12rpx; animation: pulse 2s infinite; }

/* 投票结果弹窗 */
.vote-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 30rpx;
  box-sizing: border-box;
}

.vote-result-panel {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 100%;
  max-width: 580rpx;
  max-height: 80vh;
  border-radius: 28rpx;
  padding: 36rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.7);
  box-sizing: border-box;
}

.vote-result-title {
  font-size: 40rpx;
  font-weight: 900;
}

.color-good { color: #38bdf8; }
.color-evil { color: #f87171; }

.vote-count-summary {
  color: #94a3b8;
  font-size: 24rpx;
  margin: 12rpx 0 24rpx 0;
}

.vote-list {
  width: 100%;
  max-height: 44vh;
  background: rgba(18, 24, 38, 0.7);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
}

.vote-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.vote-name { color: #e2e8f0; font-size: 26rpx; font-weight: 700; }
.vote-choice { font-weight: 800; font-size: 26rpx; }

.close-tip {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 20rpx;
}
</style>
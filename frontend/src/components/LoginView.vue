<template>
  <view class="login-wrapper">
    <!-- 阵营能量场（模糊光源） -->
    <view class="energy-field good-glow"></view>
    <view class="energy-field evil-glow"></view>

    <!-- 主卡片（暗黑毛玻璃） -->
    <view class="glass-card">
      <view class="title-container">
        <view class="title-icon-badge">🐺 ⚔️ 🗡️</view>
        <text class="gradient-title">聚会桌游终端</text>
        <text class="sub-title">一夜终极狼人 · 阿瓦隆 · 三国杀</text>
      </view>

      <view class="form-container">
        <!-- 昵称输入框 -->
        <view class="input-group">
          <text class="input-label">玩家昵称</text>
          <view class="input-control">
            <input 
              class="neumorphic-input" 
              :value="nickname" 
              @input="$emit('update:nickname', $event.detail.value)"
              placeholder="输入您的昵称" 
              placeholder-class="placeholder-text"
            />
            <view class="random-btn" :class="{ 'dice-roll': isRolling }" @click="generateRandomNickname">🎲</view>
          </view>
        </view>

        <!-- 房间号输入区 -->
        <view class="input-group">
          <text class="input-label">房间号</text>
          <view class="input-control">
            <input 
              class="neumorphic-input room-input" 
              :value="roomId" 
              @input="$emit('update:roomId', $event.detail.value)"
              placeholder="4 位房间号" 
              placeholder-class="placeholder-text"
              type="number" 
              maxlength="4" 
            />
          </view>
        </view>

        <!-- 按钮拆分 -->
        <view class="actions-container">
          <button 
            class="btn-primary" 
            :class="{ 'opacity-50': !isValidRoomId }" 
            @click="handleJoin"
          >
            加入房间
          </button>

          <button 
            class="btn-ghost" 
            @click="handleCreate"
          >
            房主入口：创建新房间
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  nickname: { type: String, default: '' },
  roomId: { type: String, default: '' }
});

const emit = defineEmits(['update:nickname', 'update:roomId', 'join']);

const isRolling = ref(false);

const NICKNAME_POOL = [
  "迷茫的预言家", "机智的村民", "背锅的强盗", "心虚的狼人", 
  "盲狙的刺客", "深情的梅林", "划水的爪牙", "暴躁的皮匠",
  "装死的猎人", "懵逼的捣蛋鬼", "失忆的酒鬼", "自信的平民"
];

const generateRandomNickname = () => {
  isRolling.value = true;
  setTimeout(() => { isRolling.value = false; }, 400);
  const randomName = NICKNAME_POOL[Math.floor(Math.random() * NICKNAME_POOL.length)];
  emit('update:nickname', randomName);
};

const isValidRoomId = computed(() => {
  return props.roomId && props.roomId.length === 4;
});

const handleJoin = () => {
  if (!isValidRoomId.value) {
    uni.showToast({ title: '请输入4位房间号', icon: 'none' });
    return;
  }
  if (!props.nickname) {
    generateRandomNickname(); // 没填昵称直接分配一个
    setTimeout(() => {
      emit('join');
    }, 50);
  } else {
    emit('join');
  }
};

const handleCreate = () => {
  if (!props.nickname) {
    generateRandomNickname();
  }
  // 随机生成 4 位房间号
  const newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
  emit('update:roomId', newRoomId);
  
  setTimeout(() => {
    emit('join');
  }, 50);
};
</script>

<style scoped>
/* 容器：深色红蓝渐变，支持移动端自适应与键盘滚动 */
.login-wrapper {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100vw;
  z-index: 100;
  background: radial-gradient(circle at 10% 20%, #1e1b4b 0%, #090d16 60%, #31101e 100%);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc(40rpx + var(--sat, 0px)) 36rpx calc(40rpx + var(--sab, 0px)) 36rpx;
  box-sizing: border-box;
}

/* 阵营能量场（模糊光源） */
.energy-field {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  border-radius: 50%;
  filter: blur(100px);
  -webkit-filter: blur(100px);
  z-index: 0;
  pointer-events: none;
  animation: pulse-glow 7s ease-in-out infinite alternate;
}

.good-glow {
  background: rgba(37, 99, 235, 0.35);
  top: -60rpx;
  left: -120rpx;
}

.evil-glow {
  background: rgba(220, 38, 38, 0.28);
  bottom: -60rpx;
  right: -120rpx;
  animation-delay: -3.5s;
}

@keyframes pulse-glow {
  0% { transform: scale(0.85) translate(0, 0); opacity: 0.6; }
  100% { transform: scale(1.15) translate(20rpx, 20rpx); opacity: 0.95; }
}

/* 主卡片（暗黑毛玻璃） */
.glass-card {
  position: relative;
  z-index: 10;
  background: rgba(18, 24, 38, 0.75);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-radius: 40rpx;
  box-shadow: 0 40rpx 80rpx -10rpx rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: 56rpx 40rpx;
  width: 100%;
  max-width: 680rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.title-container {
  text-align: center;
  margin-bottom: 50rpx;
}

.gradient-title {
  font-size: 58rpx;
  font-weight: 900;
  background-image: linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #f87171 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  letter-spacing: 4rpx;
  text-shadow: 0 10rpx 24rpx rgba(0,0,0,0.5);
}

.sub-title {
  font-size: 26rpx;
  color: #94a3b8;
  margin-top: 12rpx;
  display: block;
  letter-spacing: 3rpx;
}

/* 输入框组合 */
.input-group {
  margin-bottom: 34rpx;
}

.input-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.input-control {
  position: relative;
  display: flex;
  align-items: center;
}

.neumorphic-input {
  width: 100%;
  height: 96rpx;
  background: rgba(10, 15, 26, 0.65);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 20rpx;
  padding: 0 32rpx;
  color: #ffffff;
  font-size: 30rpx;
  box-sizing: border-box;
  transition: all 0.25s ease;
}

.neumorphic-input:focus {
  border-color: #60a5fa;
  background: rgba(15, 23, 42, 0.85);
  box-shadow: 0 0 0 6rpx rgba(96, 165, 250, 0.2);
}

.room-input {
  font-size: 40rpx;
  text-align: center;
  letter-spacing: 20rpx;
  font-weight: bold;
}

.placeholder-text {
  color: #64748b;
  font-size: 28rpx;
  letter-spacing: normal;
  font-weight: normal;
}

.random-btn {
  position: absolute;
  right: 16rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 42rpx;
  padding: 12rpx;
  z-index: 20;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.random-btn:active {
  transform: translateY(-50%) scale(0.85);
}

.dice-roll {
  animation: diceSpin 0.4s ease;
}

@keyframes diceSpin {
  0% { transform: translateY(-50%) rotate(0deg) scale(1); }
  50% { transform: translateY(-50%) rotate(180deg) scale(1.3); }
  100% { transform: translateY(-50%) rotate(360deg) scale(1); }
}

/* 按钮组 */
.actions-container {
  margin-top: 50rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.title-icon-badge {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  filter: drop-shadow(0 4rpx 10rpx rgba(0, 0, 0, 0.5));
}

.btn-primary {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%);
  border-radius: 24rpx;
  color: #451a03;
  font-size: 32rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 36rpx rgba(245, 158, 11, 0.4), inset 0 2rpx 0 rgba(255, 255, 255, 0.5);
  border: none;
  transition: all 0.2s ease;
  letter-spacing: 2rpx;
}

.btn-primary::after { border: none; }
.btn-primary:active {
  transform: translateY(2rpx) scale(0.98);
}

.btn-ghost {
  width: 100%;
  height: 96rpx;
  background: rgba(30, 41, 59, 0.65);
  border: 1.5px solid rgba(245, 158, 11, 0.4);
  border-radius: 24rpx;
  color: #fbbf24;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.4);
}

.btn-ghost::after { border: none; }
.btn-ghost:active {
  background: rgba(245, 158, 11, 0.15);
  transform: translateY(2rpx) scale(0.98);
}

.opacity-50 {
  opacity: 0.45 !important;
}
</style>

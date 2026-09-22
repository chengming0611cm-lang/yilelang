<template>
  <view class="login-wrapper">
    <!-- 阵营能量场（模糊光源） -->
    <view class="energy-field good-glow"></view>
    <view class="energy-field evil-glow"></view>

    <!-- 主卡片（暗黑毛玻璃） -->
    <view class="glass-card">
      <view class="title-container">
        <text class="gradient-title">阵营对抗</text>
        <text class="sub-title">桌游聚会辅助终端</text>
      </view>

      <view class="form-container">
        <!-- 昵称输入框 -->
        <view class="input-group">
          <input 
            class="neumorphic-input" 
            :value="nickname" 
            @input="$emit('update:nickname', $event.detail.value)"
            placeholder="输入您的昵称" 
            placeholder-class="placeholder-text"
          />
          <view class="random-btn" @click="generateRandomNickname">🎲</view>
        </view>

        <!-- 房间号输入区 -->
        <view class="input-group mt-4">
          <input 
            class="neumorphic-input room-input" 
            :value="roomId" 
            @input="$emit('update:roomId', $event.detail.value)"
            placeholder="输入 4 位房间号" 
            placeholder-class="placeholder-text"
            type="number" 
            maxlength="4" 
          />
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
import { computed } from 'vue';

const props = defineProps({
  nickname: { type: String, default: '' },
  roomId: { type: String, default: '' }
});

const emit = defineEmits(['update:nickname', 'update:roomId', 'join']);

const NICKNAME_POOL = [
  "迷茫的预言家", "机智的村民", "背锅的强盗", "心虚的狼人", 
  "盲狙的刺客", "深情的梅林", "划水的爪牙", "暴躁的皮匠",
  "装死的猎人", "懵逼的捣蛋鬼", "失忆的酒鬼", "自信的平民"
];

const generateRandomNickname = () => {
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
/* 容器：深色红蓝渐变 */
.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background: linear-gradient(135deg, #172554 0%, #0f172a 50%, #450a0a 100%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  box-sizing: border-box;
}

/* 阵营能量场（模糊光源） */
.energy-field {
  position: absolute;
  width: 700rpx;
  height: 700rpx;
  border-radius: 50%;
  filter: blur(120px);
  -webkit-filter: blur(120px);
  z-index: 0;
  animation: pulse-glow 6s ease-in-out infinite alternate;
}

.good-glow {
  background: rgba(37, 99, 235, 0.4);
  top: -100rpx;
  left: -200rpx;
}

.evil-glow {
  background: rgba(220, 38, 38, 0.3);
  bottom: -100rpx;
  right: -200rpx;
  animation-delay: -3s;
}

@keyframes pulse-glow {
  0% { transform: scale(0.8); opacity: 0.7; }
  100% { transform: scale(1.2); opacity: 1; }
}

/* 主卡片（暗黑毛玻璃） */
.glass-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 48rpx;
  box-shadow: 0 50rpx 100rpx rgba(0, 0, 0, 0.5);
  padding: 60rpx 40rpx;
  width: 100%;
  max-width: 800rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 2px solid rgba(59, 130, 246, 0.3);
  border-right: 2px solid rgba(239, 68, 68, 0.3);
}

.title-container {
  text-align: center;
  margin-bottom: 60rpx;
}

.gradient-title {
  font-size: 64rpx;
  font-weight: 900;
  background-image: linear-gradient(to right, #60a5fa, #f87171);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
  letter-spacing: 4rpx;
  text-shadow: 0 10rpx 20rpx rgba(0,0,0,0.3);
}

.sub-title {
  font-size: 28rpx;
  color: #94a3b8;
  margin-top: 10rpx;
  display: block;
  letter-spacing: 2rpx;
}

/* 输入框组合 */
.input-group {
  position: relative;
  margin-bottom: 40rpx;
}

.neumorphic-input {
  width: 100%;
  height: 100rpx;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 0 40rpx;
  color: #ffffff;
  font-size: 32rpx;
  box-sizing: border-box;
  transition: all 0.3s;
}

.neumorphic-input:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 4rpx rgba(96, 165, 250, 0.1);
}

.room-input {
  font-size: 44rpx;
  text-align: center;
  letter-spacing: 16rpx;
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
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 44rpx;
  padding: 10rpx;
  z-index: 20;
}

/* 按钮组 */
.actions-container {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.btn-primary {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 24rpx;
  color: white;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(59, 130, 246, 0.4);
  transition: opacity 0.3s;
}

.btn-primary::after { border: none; }
.btn-primary:active { opacity: 0.8; }

.btn-ghost {
  width: 100%;
  height: 100rpx;
  background: transparent;
  border: 2rpx solid rgba(239, 68, 68, 0.5);
  border-radius: 24rpx;
  color: #f87171;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-ghost::after { border: none; }
.btn-ghost:active {
  background: rgba(239, 68, 68, 0.1);
}

.opacity-50 {
  opacity: 0.5 !important;
}
</style>

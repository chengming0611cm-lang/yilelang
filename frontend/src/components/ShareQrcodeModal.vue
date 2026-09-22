<template>
  <view class="modal-mask" @click="close">
    <view class="modal-content" @click.stop="">
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="close">X</view>

      <!-- 游戏名称 -->
      <view class="game-name-wrapper">
        <text class="game-name-text">{{ gameName }}</text>
      </view>

      <!-- 巨大的房间号 -->
      <view class="room-code-section">
        <text class="room-code-title">邀请您加入房间</text>
        <text class="room-code-number">{{ roomId }}</text>
      </view>

      <!-- 扫码加入 -->
      <view class="qrcode-section">
        <text class="qrcode-tip">面对面聚会，请使用微信扫码加入房间</text>
        <view class="qrcode-container">
          <image v-if="qrcodeUrl" :src="qrcodeUrl" class="qrcode-img" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="action-section">
        <button class="copy-btn" @click="copyLink">
          <text class="copy-icon">🔗</text> 一键复制加入链接
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    default: '聚会大厅'
  }
});

const emit = defineEmits(['close']);

const qrcodeUrl = ref('');

onMounted(async () => {
  try {
    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}?roomId=${props.roomId}`;
    
    // 生成暗色的二维码
    qrcodeUrl.value = await QRCode.toDataURL(fullUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#1e3a8a',  
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('二维码生成失败', err);
  }
});

const close = () => {
  emit('close');
};

const copyLink = () => {
  const baseUrl = window.location.origin + window.location.pathname;
  const fullUrl = `${baseUrl}?roomId=${props.roomId}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullUrl).then(() => {
      uni.showToast({ title: '已复制链接', icon: 'success' });
    }).catch(() => {
      uni.showToast({ title: '复制失败，请重试', icon: 'none' });
    });
  } else {
    // 兼容性降级
    uni.setClipboardData({
      data: fullUrl,
      success: () => {
        uni.showToast({ title: '已复制链接', icon: 'success' });
      }
    });
  }
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 40rpx;
  box-sizing: border-box;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 48rpx;
  box-shadow: 0 40rpx 100rpx -10rpx rgba(0, 0, 0, 0.6), inset 0 2rpx 0 rgba(255, 255, 255, 0.1);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 32rpx;
  transition: background 0.2s;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.game-name-wrapper {
  margin-bottom: 20rpx;
}

.game-name-text {
  font-size: 36rpx;
  font-weight: 800;
  background-image: linear-gradient(135deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2rpx;
}

.room-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  width: 100%;
}

.room-code-title {
  font-size: 24rpx;
  color: #94a3b8;
  margin-bottom: 10rpx;
  text-transform: uppercase;
  letter-spacing: 4rpx;
}

.room-code-number {
  font-size: 96rpx;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 16rpx;
  text-shadow: 0 0 40rpx rgba(96, 165, 250, 0.5);
  line-height: 1;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qrcode-tip {
  font-size: 24rpx;
  color: #cbd5e1;
  margin-bottom: 20rpx;
  text-align: center;
}

.qrcode-container {
  background: #ffffff;
  padding: 24rpx;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.3);
  margin-bottom: 40rpx;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.qrcode-container:active {
  transform: scale(0.95);
}

.qrcode-img {
  width: 300rpx;
  height: 300rpx;
  display: block;
}

.action-section {
  width: 100%;
}

.copy-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(139, 92, 246, 0.4);
}
</style>
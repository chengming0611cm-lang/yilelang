<template>
  <view class="modal-mask" @click="close">
    <view class="modal-content" @click.stop="">
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="close">✕</view>

      <!-- 游戏名称 -->
      <view class="game-name-wrapper">
        <text class="game-name-text">{{ gameName }}</text>
      </view>

      <!-- 巨大的房间号 -->
      <view class="room-code-section" @click="copyRoomCode">
        <text class="room-code-title">邀请加入房间（点击复制）</text>
        <view class="room-code-badge">
          <text class="room-code-number">{{ roomId }}</text>
          <text class="copy-tag">📋 复制</text>
        </view>
      </view>

      <!-- 扫码加入 -->
      <view class="qrcode-section">
        <text class="qrcode-tip">手机扫码快速对局</text>
        <view class="qrcode-container">
          <image v-if="qrcodeUrl" :src="qrcodeUrl" class="qrcode-img" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="action-section">
        <button class="copy-btn" @click="copyLink">
          <text class="copy-icon">🔗</text> 复制网页邀请链接
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
    
    // 生成清晰的二维码
    qrcodeUrl.value = await QRCode.toDataURL(fullUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',  
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

const copyRoomCode = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.roomId).then(() => {
      uni.showToast({ title: `房间号 ${props.roomId} 已复制`, icon: 'success' });
    }).catch(() => {
      uni.setClipboardData({ data: props.roomId });
    });
  } else {
    uni.setClipboardData({ data: props.roomId });
  }
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
  height: 100dvh;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 30rpx;
  box-sizing: border-box;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 580rpx;
  max-height: 88vh;
  max-height: 88dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(18, 24, 38, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 40rpx;
  box-shadow: 0 40rpx 80rpx -10rpx rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  padding: 48rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 28rpx;
  transition: all 0.2s ease;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.92);
}

.game-name-wrapper {
  margin-bottom: 16rpx;
}

.game-name-text {
  font-size: 32rpx;
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
  margin-bottom: 30rpx;
  width: 100%;
  cursor: pointer;
}

.room-code-title {
  font-size: 22rpx;
  color: #94a3b8;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}

.room-code-badge {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  padding: 8rpx 28rpx;
  border-radius: 20rpx;
  border: 1px dashed rgba(96, 165, 250, 0.4);
}

.room-code-number {
  font-size: 72rpx;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 12rpx;
  text-shadow: 0 0 30rpx rgba(96, 165, 250, 0.6);
  line-height: 1.1;
}

.copy-tag {
  font-size: 22rpx;
  color: #60a5fa;
  font-weight: 600;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.qrcode-tip {
  font-size: 22rpx;
  color: #cbd5e1;
  margin-bottom: 16rpx;
  text-align: center;
}

.qrcode-container {
  background: #ffffff;
  padding: 16rpx;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.4);
  margin-bottom: 32rpx;
  transition: transform 0.2s ease;
}

.qrcode-container:active {
  transform: scale(0.97);
}

.qrcode-img {
  width: 250rpx;
  height: 250rpx;
  display: block;
}

.action-section {
  width: 100%;
}

.copy-btn {
  width: 100%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  border: none;
  border-radius: 20rpx;
  padding: 22rpx 0;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 10rpx 25rpx rgba(37, 99, 235, 0.4);
  transition: all 0.2s ease;
}

.copy-btn::after { border: none; }
.copy-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.copy-icon {
  font-size: 30rpx;
}
</style>
<template>
  <view class="avatar-wrapper" :class="{ 'is-offline': offline }">
    <!-- 头像圆圈 -->
    <view class="avatar-circle">
      <text class="avatar-initial">{{ displayNameInitial }}</text>
      
      <!-- 数字小圆标 -->
      <view class="seat-badge">
        <text class="seat-number">{{ seatNumber }}</text>
      </view>
    </view>
    
    <!-- 统一展示格式 -->
    <view class="avatar-info">
      <text class="player-name">[{{ seatNumber }}号] {{ nickname }}</text>
      <text v-if="offline" class="offline-tag">(离线)</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nickname: { type: String, required: true },
  seatNumber: { type: [Number, String], required: true },
  offline: { type: Boolean, default: false }
});

const displayNameInitial = computed(() => {
  return props.nickname ? props.nickname.charAt(0).toUpperCase() : '?';
});
</script>

<style scoped>
.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.avatar-wrapper.is-offline {
  opacity: 0.45;
  filter: grayscale(1);
}

.avatar-circle {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 3rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.4);
}

.avatar-initial {
  font-size: 38rpx;
  color: #f8fafc;
  font-weight: 800;
  text-transform: uppercase;
}

.seat-badge {
  position: absolute;
  bottom: -6rpx;
  right: -6rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  border: 3rpx solid #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.5);
}

.seat-number {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 900;
}

.avatar-info {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-name {
  font-size: 24rpx;
  color: #cbd5e1;
  font-weight: 500;
  max-width: 140rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.offline-tag {
  font-size: 20rpx;
  color: #f87171;
  margin-top: 4rpx;
}
</style>

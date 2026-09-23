<template>
  <view v-if="visible" class="custom-modal-mask" @click.stop="onMaskClick">
    <view class="custom-modal-content" @click.stop>
      <view class="modal-header" v-if="title">
        <text class="modal-title">{{ title }}</text>
      </view>
      
      <view class="modal-body" :class="{'no-padding-bottom': type === 'select'}">
        <text v-if="content && type !== 'select'" class="modal-text">{{ content }}</text>
        
        <scroll-view v-if="type === 'select'" scroll-y class="select-list">
          <view 
            v-for="(opt, idx) in options" 
            :key="idx"
            class="select-item"
            hover-class="select-item-hover"
            @click="onSelect(opt)">
            <text class="select-item-text">{{ opt.label || opt }}</text>
          </view>
        </scroll-view>
      </view>

      <view class="modal-footer" v-if="type !== 'select' || showCancel">
        <button v-if="showCancel" class="modal-btn cancel-btn" hover-class="cancel-btn-hover" @click="onCancel">{{ cancelText }}</button>
        <button v-if="type !== 'select'" class="modal-btn confirm-btn" hover-class="confirm-btn-hover" @click="onConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const title = ref('');
const content = ref('');
const type = ref('alert'); // 'alert', 'confirm', 'select'
const options = ref([]);
const showCancel = ref(false);
const confirmText = ref('确定');
const cancelText = ref('取消');

let resolvePromise = null;

const show = (opts) => {
  title.value = opts.title || '提示';
  content.value = opts.content || '';
  type.value = opts.type || 'alert';
  options.value = opts.options || [];
  showCancel.value = opts.showCancel ?? (type.value === 'confirm' || type.value === 'select');
  confirmText.value = opts.confirmText || '确定';
  cancelText.value = opts.cancelText || '取消';
  visible.value = true;
  
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const onConfirm = () => {
  visible.value = false;
  if (resolvePromise) {
    resolvePromise({ confirm: true, cancel: false });
    resolvePromise = null;
  }
};

const onCancel = () => {
  visible.value = false;
  if (resolvePromise) {
    resolvePromise({ confirm: false, cancel: true });
    resolvePromise = null;
  }
};

const onSelect = (opt) => {
  visible.value = false;
  if (resolvePromise) {
    resolvePromise({ confirm: true, value: opt.value !== undefined ? opt.value : opt });
    resolvePromise = null;
  }
};

const onMaskClick = () => {
  if (showCancel.value) onCancel();
};

defineExpose({
  show
});
</script>

<style scoped>
.custom-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-modal-content {
  width: 600rpx;
  background: #1E293B; /* Deep dark blue */
  border-radius: 24rpx;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 30rpx rgba(59, 130, 246, 0.5); /* Blue glow */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 40rpx 40rpx 10rpx;
  text-align: center;
}

.modal-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 2rpx;
}

.modal-body {
  padding: 30rpx 40rpx 40rpx;
  text-align: center;
  min-height: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-padding-bottom {
  padding-bottom: 20rpx;
}

.modal-text {
  font-size: 30rpx;
  color: #cbd5e1;
  line-height: 1.6;
}

.select-list {
  width: 100%;
  max-height: 400rpx;
  margin-top: 20rpx;
}

.select-item {
  width: 100%;
  padding: 24rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.select-item:last-child {
  border-bottom: none;
}

.select-item-text {
  font-size: 30rpx;
  color: #38bdf8;
  font-weight: 600;
}

.select-item-hover {
  background: rgba(56, 189, 248, 0.15);
}

.modal-footer {
  display: flex;
  padding: 0 30rpx 30rpx;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  transition: all 0.2s ease;
}

.modal-btn::after {
  border: none;
}

.cancel-btn {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn-hover {
  background: rgba(100, 116, 139, 0.35);
  transform: scale(0.96);
}

.confirm-btn {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.4);
}

.confirm-btn-hover {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(37, 99, 235, 0.6);
}
</style>

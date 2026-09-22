<template>
  <view class="flex flex-col items-center justify-center relative" :class="{ 'opacity-50 grayscale': offline }">
    <!-- 头像圆圈 -->
    <view class="w-12 h-12 rounded-full bg-slate-700 border-2 border-white/20 flex items-center justify-center relative shadow-md">
      <text class="text-lg text-white font-bold">{{ displayNameInitial }}</text>
      
      <!-- 数字小圆标 -->
      <view class="absolute -bottom-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm">
        <text class="text-xs text-white font-bold">{{ seatNumber }}</text>
      </view>
    </view>
    
    <!-- 统一展示格式 -->
    <view class="mt-3 flex flex-col items-center">
      <text class="text-sm text-slate-200 font-medium line-clamp-1 max-w-[100px]">[{{ seatNumber }}号] {{ nickname }}</text>
      <text v-if="offline" class="text-xs text-red-400 mt-1">(离线)</text>
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

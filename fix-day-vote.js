const fs = require('fs');

// 1. Update backend/onuwEngine.js
let engineCode = fs.readFileSync('backend/onuwEngine.js', 'utf8');
engineCode = engineCode.replace(/this\.game\.dayTimer = setTimeout\(\(\) => \{[\s\S]*?\}, \(this\.room\.settings\.discussTime \|\| 300\) \* 1000\);/, 
`// 移除自动跳转，完全由房主手动触发 voting
    // this.game.dayTimer = setTimeout(() => { ... });`);

fs.writeFileSync('backend/onuwEngine.js', engineCode, 'utf8');


// 2. Update frontend/src/pages/index/index.vue
let vueCode = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

const oldDayBlock = `<text class="day-heading">太阳升起 · 自由发言讨论</text>
            <text class="day-sub-desc">请通过线下沟通、盘问逻辑与信息差寻找狼人！</text>
            
            <view class="glass-section mt-4 day-guide-card">
              <text class="guide-tip-title">🗣️发言提示</text>
              <text class="guide-tip-text">注意强盗和捣蛋鬼调牌可能导致身份反转。讨论充分后房主可开启投票。</text>
            </view>
  
            <view class="bottom-action-container" v-if="isHost">
              <button class="confirm-btn danger-btn" @click="forceVote">房主提前开启全员投票</button>
            </view>`;

const newDayBlock = `<text class="day-heading">自由讨论中，等待房主开启投票...</text>
            <text class="day-sub-desc">请通过线下沟通、盘问逻辑与信息差寻找狼人！</text>
            
            <view class="glass-section mt-4 day-guide-card">
              <text class="guide-tip-title">🗣️发言提示</text>
              <text class="guide-tip-text">注意强盗和捣蛋鬼调牌可能导致身份反转。</text>
            </view>
  
            <view class="bottom-action-container" v-if="isHost" style="margin-top: 40rpx;">
              <button class="confirm-btn danger-btn" @click="forceVote">发起投票</button>
            </view>`;

if (vueCode.includes('太阳升起 · 自由发言讨论')) {
    vueCode = vueCode.replace(oldDayBlock, newDayBlock);
    fs.writeFileSync('frontend/src/pages/index/index.vue', vueCode, 'utf8');
    console.log("Vue updated successfully.");
} else {
    console.log("Failed to match Vue block.");
}

const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Replace the SGS template
const oldSgsTemplate = `      <!-- SGS 游戏视图 -->
      <template v-else-if="gameType === 'sgs'">
        <view v-if="appState === 'PLAYING'" class="section center-layout night-section">
          <text class="night-title" style="margin-bottom: 40rpx; color: #fff;">三国杀身份确认</text>
          
          <view class="flip-container mt">
            <view class="flipper" :class="{ 'is-flipped': nightPanelOpen }">
              <view class="front" @click.stop="nightPanelOpen = true">
                <image :src="'/static/cards/back' + randomBackIndex + '.png'" style="width: 100%; height: 100%; border-radius: 20rpx; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);" />
              </view>
              
              <view class="back role-card-3d" style="background: linear-gradient(135deg, #8b0000, #4a0000); justify-content: center;">
                <text v-if="myInitialRole === 'lord'" style="position: absolute; top: 20rpx; color: #ffd700; font-weight: bold; font-size: 32rpx; border: 2rpx solid #ffd700; padding: 4rpx 16rpx; border-radius: 8rpx; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.8);">身份全场公开</text>
                <text style="color: #fff; font-size: 80rpx; font-weight: bold; text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.8);">{{ ROLE_NAMES[myInitialRole] }}</text>
                <text style="color: #f1c40f; font-size: 28rpx; margin-top: 40rpx; padding: 0 30rpx; text-align: center; text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.8);">{{ ROLES_DICTIONARY[myInitialRole]?.description }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="nightPanelOpen" class="role-info-side" style="margin-top: 40rpx; align-items: center; width: 100%;">
            <button class="hide-panel-btn" size="mini" @click.stop="nightPanelOpen = false">🙈 收起（防窥）</button>
          </view>
        </view>
      </template>`;

const newSgsTemplate = `      <!-- SGS 游戏视图 -->
      <template v-else-if="gameType === 'sgs'">
        <view v-if="appState === 'PLAYING'" class="section center-layout night-section">
          <text class="night-title" style="margin-bottom: 40rpx; color: #38bdf8;">三国杀身份确认</text>
          <text v-if="nightPanelOpen && myInitialRole === 'lord'" style="color: #ffd700; font-weight: bold; font-size: 36rpx; text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.8); margin-bottom: 20rpx; padding: 10rpx 30rpx; background: rgba(0,0,0,0.6); border-radius: 20rpx; border: 2px solid #ffd700;">⚠️ 您的身份需要向全场公开</text>
          
          <view class="flip-container mt">
            <view class="flipper" :class="{ 'is-flipped': nightPanelOpen }">
              <view class="front" @click.stop="nightPanelOpen = true">
                <view class="sgs-back"></view>
              </view>
              
              <view class="back role-card-3d" style="border: none; background: #000; padding: 0;">
                <view class="role-sprite-large sgs-sprite" :style="{'background-position': ROLES_DICTIONARY[myInitialRole]?.spritePosition}"></view>
              </view>
            </view>
          </view>
          
          <view v-if="nightPanelOpen" class="role-info-side" style="margin-top: 40rpx; align-items: center; width: 100%;">
            <button class="hide-panel-btn" size="mini" @click.stop="nightPanelOpen = false">🙈 收起（防窥）</button>
          </view>
        </view>
      </template>`;

// Try multiple regex replacements to handle spacing differences
if (code.includes('三国杀身份确认')) {
  // Use a regex to replace the entire block
  code = code.replace(/<!-- SGS 游戏视图 -->[\s\S]*?<\/template>/, newSgsTemplate);
}

// 2. Add CSS
const sgsCSS = `
.sgs-sprite {
  background-image: url('/static/sgs-sprite.png');
  background-size: 200% 200%;
}
.sgs-back {
  background-image: url('/static/sgs-back.png');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);
}
`;

if (!code.includes('.sgs-sprite {')) {
  code = code.replace(/\.avalon-sprite\s*\{[\s\S]*?\}/, `$&${sgsCSS}`);
}

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('index.vue updated with SGS UI');

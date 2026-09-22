const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// The replacement:
const newNightUI = `<view class="flex items-center justify-center mt" style="display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin-top: 40rpx;">
        <view class="role-card-3d" style="margin: 0; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);">
          <view class="role-sprite-large onuw-sprite" :style="{'background-position': ROLES_DICTIONARY[myInitialRole]?.spritePosition}"></view>
        </view>
        <view style="display: flex; flex-direction: column; align-items: flex-start; margin-left: 40rpx;">
          <text class="card-name" style="color: #2c3e50; font-size: 56rpx; font-weight: bold; margin-bottom: 10rpx;">{{ ROLE_NAMES[myInitialRole] }}</text>
          <text style="color: #666; font-size: 32rpx; margin-bottom: 10rpx; font-weight: bold;">[ {{ mySeatNumber }}号 ] {{ players.find(p => p.sessionId === sessionId)?.nickname || '' }}</text>
          <text class="card-label" style="font-size: 28rpx; color: #888; margin-bottom: 30rpx;">您的初始底牌</text>
          <button class="hide-panel-btn" size="mini" @click.stop="nightPanelOpen = false" style="margin: 0;">🙈 收起（防窥）</button>
        </view>
      </view>`;

const regex = /<view class="role-card-3d mt">[\s\S]*?<button class="hide-panel-btn" size="mini" @click\.stop="nightPanelOpen = false">🙈 收起（防窥）<\/button>/;

code = code.replace(regex, newNightUI);

code = code.replace(/socket\.on\('game_started', \(data\) => \{\s*appState\.value = 'NIGHT';/, "socket.on('game_started', (data) => {\n    appState.value = 'NIGHT';\n    myInitialRole.value = data.initialRole;");

code = code.replace(/socket\.on\('your_role'[\s\S]*?\}\);/g, '');

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Fixed properly');

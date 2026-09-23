const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Add SGS to gameType radio-group
code = code.replace(
  /<label><radio value="avalon" :checked="gameType === 'avalon'" \/> 阿瓦?<\/label>/,
  `<label><radio value="avalon" :checked="gameType === 'avalon'" /> 阿瓦隆</label>
            <label><radio value="sgs" :checked="gameType === 'sgs'" /> 三国杀</label>`
);

// 2. Add SGS roles to SGS_ROLE_NAMES
const sgsRoleNamesStr = `
  const SGS_ROLE_NAMES = {
    lord: '主公', loyalist: '忠臣', rebel: '反贼', renegade: '内奸'
  };`;
code = code.replace(/const ONUW_ROLE_NAMES = \{/, sgsRoleNamesStr + '\n  const ONUW_ROLE_NAMES = {');

// 3. Update ROLE_NAMES
code = code.replace(/const ROLE_NAMES = \{[\s\S]*?minion_avalon:\s*'莫德雷德的爪?\n\s*\};/,
  `const ROLE_NAMES = {
    ...ONUW_ROLE_NAMES,
    ...SGS_ROLE_NAMES,
    merlin: '梅林', percival: '派西维尔', loyal: '亚瑟的忠臣',
    morgana: '莫甘娜', assassin: '刺客', oberon: '奥伯伦',
    mordred: '莫德雷德', minion_avalon: '莫德雷德的爪牙'
  };`);

// 4. Update RECOMMENDED_BOARDS logic
const recommendLogic = `
  const SGS_RECOMMENDED_BOARDS = {
    4: ['lord', 'loyalist', 'rebel', 'renegade'],
    5: ['lord', 'loyalist', 'rebel', 'rebel', 'renegade'],
    6: ['lord', 'loyalist', 'rebel', 'rebel', 'rebel', 'renegade'],
    7: ['lord', 'loyalist', 'loyalist', 'rebel', 'rebel', 'rebel', 'renegade'],
    8: ['lord', 'loyalist', 'loyalist', 'rebel', 'rebel', 'rebel', 'rebel', 'renegade'],
    9: ['lord', 'loyalist', 'loyalist', 'loyalist', 'rebel', 'rebel', 'rebel', 'rebel', 'renegade'],
    10: ['lord', 'loyalist', 'loyalist', 'loyalist', 'rebel', 'rebel', 'rebel', 'rebel', 'renegade', 'renegade']
  };

  const applyRecommend = (n) => {
    if (gameType.value === 'sgs' && SGS_RECOMMENDED_BOARDS[n]) {
      selectedRoles.value = [...SGS_RECOMMENDED_BOARDS[n]];
      socket.emit('update_settings', { sessionId: sessionId.value, roomId: roomId.value, settings: { selectedRoles: selectedRoles.value } });
      uni.showToast({ title: \`已应用 \${n} 人局智能推荐\`, icon: 'success' });
    } else if (gameType.value === 'onuw' && RECOMMENDED_BOARDS[n]) {
      selectedRoles.value = [...RECOMMENDED_BOARDS[n]];
      socket.emit('update_settings', { sessionId: sessionId.value, roomId: roomId.value, settings: { selectedRoles: selectedRoles.value } });
      uni.showToast({ title: \`已应用 \${n} 人局智能推荐\`, icon: 'success' });
    }
  };
`;
code = code.replace(/const applyRecommend = \(n\) => \{[\s\S]*?uni\.showToast[^;]*;\s*\}\s*\};\s*/, recommendLogic);

// 5. Update settings panel
code = code.replace(/<view v-if="gameType === 'onuw'">/, `<view v-if="gameType === 'onuw' || gameType === 'sgs'">`);
code = code.replace(/当前已有 \{\{ players\.length \}\} 人，实际需 \{\{ players\.length \+ 3 \}\} 张牌\)/, 
  `当前已有 {{ players.length }} 人，实际需 {{ gameType === 'sgs' ? players.length : players.length + 3 }} 张牌)`);
  
code = code.replace(/<view class="role-counter-item" v-for="\(name, roleId\) in ONUW_ROLE_NAMES" :key="roleId">/,
  `<view class="role-counter-item" v-for="(name, roleId) in (gameType === 'sgs' ? SGS_ROLE_NAMES : ONUW_ROLE_NAMES)" :key="roleId">`);

// 6. Update startGame logic
code = code.replace(/const startGame = \(\) => \{[\s\S]*?if \(selectedRoles\.value\.length !== targetCount\) \{[\s\S]*?return uni\.showToast[^;]*;\s*\}/, 
  `const startGame = () => {
    if (gameType.value === 'onuw') {
      const targetCount = players.value.length + 3;
      if (selectedRoles.value.length !== targetCount) {
        return uni.showToast({ title: \`牌数必须为 \${targetCount} 张！(当前 \${selectedRoles.value.length} 张)\`, icon: 'none' });
      }
    } else if (gameType.value === 'sgs') {
      const targetCount = players.value.length;
      if (selectedRoles.value.length !== targetCount) {
        return uni.showToast({ title: \`牌数必须为 \${targetCount} 张！(当前 \${selectedRoles.value.length} 张)\`, icon: 'none' });
      }`);

// 7. Update Game View
const sgsTemplate = `
      <!-- SGS 游戏视图 -->
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
      </template>
`;
code = code.replace(/<!-- Avalon 游戏视图 -->/, sgsTemplate + '\n      <!-- Avalon 游戏视图 -->');

// Update myInitialRole fallback for ShareQrcodeModal
code = code.replace(/:gameName="gameType === 'onuw' \? '一夜终极狼?' : '阿瓦?'"/, `:gameName="gameType === 'onuw' ? '一夜终极狼人' : gameType === 'avalon' ? '阿瓦隆' : '三国杀'"`);
code = code.replace(/当前游戏：\{\{ gameType === 'onuw' \? '一夜终极狼?' : '阿瓦?' \}\}/, `当前游戏：{{ gameType === 'onuw' ? '一夜终极狼人' : gameType === 'avalon' ? '阿瓦隆' : '三国杀' }}`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('index.vue updated for SGS mode');

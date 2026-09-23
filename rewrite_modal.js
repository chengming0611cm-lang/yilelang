const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// Import CustomModal
if (!code.includes('import CustomModal')) {
  code = code.replace(/import ShareQrcodeModal from '\.\.\/\.\.\/components\/ShareQrcodeModal\.vue';/,
    "import ShareQrcodeModal from '../../components/ShareQrcodeModal.vue';\n  import CustomModal from '../../components/CustomModal.vue';");
}

// Add CustomModal to template
if (!code.includes('<CustomModal ref="globalModal" />')) {
  code = code.replace(/<view class="app-container">/,
    '<view class="app-container">\n    <CustomModal ref="globalModal" />');
}

// Add globalModal ref
if (!code.includes('const globalModal = ref(null);')) {
  code = code.replace(/const isDisconnected = ref\(false\);/,
    "const isDisconnected = ref(false);\n  const globalModal = ref(null);");
}

// Function to handle open picker
if (!code.includes('openPlayerPicker')) {
  code = code.replace(/const onSeerPlayerChange = \(e\) => \{/, `
  const openPlayerPicker = (title, onSelectCb) => {
    const opts = otherPlayers.value.map(p => ({ label: \`[\${p.seatNumber}号] \${p.nickname}\`, value: p }));
    globalModal.value.show({
      title,
      type: 'select',
      options: opts
    }).then(res => {
      if (res.confirm) {
        onSelectCb(res.value);
      }
    });
  };

  const onSeerPlayerChange = (e) => {`);
}

// Rewrite pickers in template
code = code.replace(/<picker class="picker-box" mode="selector" :range="otherPlayers" range-key="displayName" @change="onSeerPlayerChange">[\s\S]*?<\/picker>/,
  `<view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择目标玩家', (p) => submitNightAction({ type: 'SEER_PLAYER', targetSeat: p.seatNumber }))">
                    <view class="picker-inner">🔍 点击选择目标玩家</view>
                  </view>`);

code = code.replace(/<picker class="picker-box" mode="selector" :range="otherPlayers" range-key="displayName" @change="onRobPlayerChange">[\s\S]*?<\/picker>/,
  `<view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择抢夺目标', (p) => submitNightAction({ type: 'ROB_PLAYER', targetSeat: p.seatNumber }))">
                    <view class="picker-inner">🗡️ 点击选择抢夺目标</view>
                  </view>`);

code = code.replace(/<picker class="picker-box" mode="selector" :range="otherPlayers" range-key="displayName" @change="\(e\) => tmP1 = otherPlayers\[e\.detail\.value\]">[\s\S]*?<\/picker>/,
  `<view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择玩家1', (p) => { tmP1 = p })">
                      <view class="picker-inner">玩家 1: {{ tmP1 ? tmP1.displayName : '未选择' }}</view>
                    </view>`);

code = code.replace(/<picker class="picker-box mt-2" mode="selector" :range="otherPlayers" range-key="displayName" @change="\(e\) => tmP2 = otherPlayers\[e\.detail\.value\]">[\s\S]*?<\/picker>/,
  `<view class="picker-box mt-2" hover-class="action-btn-hover" @click="openPlayerPicker('选择玩家2', (p) => { tmP2 = p })">
                      <view class="picker-inner">玩家 2: {{ tmP2 ? tmP2.displayName : '未选择' }}</view>
                    </view>`);


// 1. game_aborted
code = code.replace(/uni\.showModal\(\{\s*title: '游戏已中[^\n]*?,\s*content: data\.reason,\s*showCancel: false\s*\}\);/,
  "globalModal.value.show({ title: '游戏已中断', content: data.reason, type: 'alert' });");

// 2. leaveRoom
code = code.replace(/uni\.showModal\(\{[\s\S]*?success: \(res\) => \{[\s\S]*?if \(res\.confirm\) \{([\s\S]*?)\}\s*\}\s*\}\);/,
  `globalModal.value.show({
      title: '退出房间',
      content: '中途退出将导致当前游戏异常，确认退出吗?',
      type: 'confirm'
    }).then(res => {
      if (res.confirm) {
$1}
    });`);

// 3. forceReturnLobby
code = code.replace(/uni\.showModal\(\{[\s\S]*?success: \(res\) => \{[\s\S]*?if \(res\.confirm\) \{([\s\S]*?)\}\s*\}\s*\}\);/,
  `globalModal.value.show({
      title: '强制重开',
      content: '确认强制结束当前对局，带领全员返回大厅吗?',
      type: 'confirm'
    }).then(res => {
      if (res.confirm) {
$1}
    });`);

// 4. action_result calls
code = code.replace(/uni\.showModal\(\{ title: '查看结果', content: `你看到的底牌是：\$\{ROLE_NAMES\[res\.seenRole\]\}`\, showCancel: false \}\);/g,
  "globalModal.value.show({ title: '查看结果', content: `你看到的底牌是：${ROLE_NAMES[res.seenRole]}`, type: 'alert' });");

code = code.replace(/uni\.showModal\(\{ title: '查看结果', content: `你看到中央的两张牌是：\$\{ROLE_NAMES\[res\.seenRoles\[0\]\]\} 和 \$\{ROLE_NAMES\[res\.seenRoles\[1\]\]\}`\, showCancel: false \}\);/g,
  "globalModal.value.show({ title: '查看结果', content: `你看到中央的两张牌是：${ROLE_NAMES[res.seenRoles[0]]} 和 ${ROLE_NAMES[res.seenRoles[1]]}`, type: 'alert' });");

code = code.replace(/uni\.showModal\(\{ title: '抢夺成功', content: `你换回的新底牌是：\$\{ROLE_NAMES\[res\.newRole\] \|\| '未知'\}\}`\, showCancel: false \}\);/g,
  "globalModal.value.show({ title: '抢夺成功', content: `你换回的新底牌是：${ROLE_NAMES[res.newRole] || '未知'}`, type: 'alert' });");

// Fix any missing showModal calls in index.vue just in case:
// Replace any left uni.showModal
code = code.replace(/uni\.showModal\(\{([^}]+)\}\)/g, (match, p1) => {
  // A naive fallback
  if (match.includes('success:')) return match; 
  let title = p1.match(/title:\s*'([^']+)'/);
  let content = p1.match(/content:\s*`([^`]+)`/);
  if(!content) content = p1.match(/content:\s*'([^']+)'/);
  if (title && content) {
    return `globalModal.value.show({ title: '${title[1]}', content: \`${content[1]}\`, type: 'alert' })`;
  }
  return match;
});

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Rewrote uni.showModal to CustomModal in index.vue');

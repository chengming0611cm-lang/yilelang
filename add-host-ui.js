const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

if (!code.includes('onSeatPodiumClick')) {
  // Update template to add click handler
  code = code.replace(/class="seat-podium"/, `class="seat-podium" @click="onSeatPodiumClick(p)"`);

  // Add function to handle click
  const scriptToAdd = `
  const onSeatPodiumClick = (p) => {
    if (appState.value !== 'WAITING') return;
    if (!isHost.value) return; // Only host can click
    if (p.sessionId === sessionId.value) return; // Can't click self

    const opts = [
      { label: '👑 移交房主', value: 'transfer_host' }
    ];
    
    if (!p.isReady) {
      opts.push({ label: '🥾 踢出房间', value: 'kick_player' });
    } else {
      opts.push({ label: '🚫 (已准备，无法踢出)', value: 'disabled' });
    }

    globalModal.value.show({
      title: \`对 [\${p.seatNumber}号] \${p.nickname} 的操作\`,
      type: 'select',
      options: opts
    }).then(res => {
      if (res.confirm) {
        if (res.value === 'transfer_host') {
          socket.emit('transfer_host', { sessionId: sessionId.value, roomId: roomId.value, targetId: p.sessionId });
        } else if (res.value === 'kick_player') {
          socket.emit('kick_player', { sessionId: sessionId.value, roomId: roomId.value, targetId: p.sessionId });
        }
      }
    });
  };`;

  code = code.replace(/const leaveRoom = \(\) => \{/, scriptToAdd + '\n\n  const leaveRoom = () => {');

  // Add kicked_from_room listener
  const kickListener = `
    socket.on('kicked_from_room', () => {
      appState.value = 'LOBBY';
      roomId.value = '';
      uni.removeStorageSync('werewolf_roomId');
      globalModal.value.show({ title: '您已被移出房间', content: '房主已将您移出房间。', type: 'alert' });
    });`;
  
  code = code.replace(/socket\.on\('game_aborted'/, kickListener + '\n\n    socket.on(\'game_aborted\'');

  fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
  console.log('Updated index.vue with host privileges');
}

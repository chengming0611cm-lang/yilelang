const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

const newSubmit = `const submitNightAction = (actionData) => {
    socket.emit('night_action', { 
      sessionId: sessionId.value, 
      roomId: roomId.value, 
      actionData 
    }, (res) => {
      if (res && res.success !== false) {
        
        if (res.allowSecondView) {
          nightViewData.value.werewolfFirstPick = actionData.centerIndex;
          uni.showToast({ title: '第一张是狼人！你可以再查看一张', icon: 'none' });
          return;
        }

        isMyTurn.value = false;
        
        if (res.seenRole) {`;

code = code.replace(/const submitNightAction = \(actionData\) => \{[\s\S]*?if \(res && res\.success !== false\) \{[\s\S]*?isMyTurn\.value = false;\s*if \(res\.seenRole\) \{/, newSubmit);

const oldLoneWolf = `<view v-else class="lone-wolf-box">
                    <text class="intel-label">你是场上唯一的孤狼，可查看一张中央底牌：</text>
                    <view class="center-cards-row">
                      <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 0 })">查看左侧牌</button>
                      <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 1 })">查看中间牌</button>
                      <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 2 })">查看右侧牌</button>
                    </view>
                  </view>`;

const newLoneWolf = `<view v-else class="lone-wolf-box">
                    <text class="intel-label" v-if="nightViewData.werewolfFirstPick !== undefined">第一张是狼人！你可以再查看一张：</text>
                    <text class="intel-label" v-else>你是场上唯一的孤狼，可查看一张中央底牌：</text>
                    <view class="center-cards-row">
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 0" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 0, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看左侧牌</button>
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 1" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 1, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看中间牌</button>
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 2" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 2, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看右侧牌</button>
                    </view>
                  </view>`;

code = code.replace(oldLoneWolf, newLoneWolf);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

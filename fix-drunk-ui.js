const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

const oldFooter = `<view class="action-footer-btns">
                  <view v-if="['werewolf', 'minion', 'mason', 'insomniac'].includes(myInitialRole) || (myInitialRole==='werewolf' && nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0)">
                    <button class="confirm-btn" hover-class="confirm-btn-hover" @click.stop="submitNightAction({ type: 'CONFIRM' })">确认完毕</button>
                  </view>
                  <view v-else>
                    <button class="pass-btn" hover-class="pass-btn-hover" @click.stop="submitNightAction({ type: 'NONE' })">不发动技能 (跳过)</button>
                  </view>
                </view>`;

const newFooter = `<view class="action-footer-btns">
                  <view v-if="['werewolf', 'minion', 'mason', 'insomniac'].includes(myInitialRole) || (myInitialRole==='werewolf' && nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0)">
                    <button class="confirm-btn" hover-class="confirm-btn-hover" @click.stop="submitNightAction({ type: 'CONFIRM' })">确认完毕</button>
                  </view>
                  <view v-else-if="myInitialRole === 'drunk'" style="text-align: center; padding: 20rpx 0;">
                    <text style="color: #ef4444; font-size: 26rpx; font-weight: bold;">(酒鬼必须盲换一张牌，不可跳过)</text>
                  </view>
                  <view v-else>
                    <button class="pass-btn" hover-class="pass-btn-hover" @click.stop="submitNightAction({ type: 'NONE' })">不发动技能 (跳过)</button>
                  </view>
                </view>`;

if(code.includes(oldFooter)) {
    code = code.replace(oldFooter, newFooter);
    fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
    console.log("Successfully patched index.vue");
} else {
    console.log("Failed to find the target string in index.vue");
}

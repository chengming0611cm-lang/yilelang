const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

const newLoneWolf = `<view v-else class="lone-wolf-box">
                    <text class="intel-label" v-if="nightViewData.werewolfFirstPick !== undefined">第一张是狼人！你可以再查看一张：</text>
                    <text class="intel-label" v-else>你是场上唯一的孤狼，可查看一张中央底牌：</text>
                    <view class="center-cards-row">
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 0" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 0, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看左侧牌</button>
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 1" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 1, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看中间牌</button>
                      <button class="action-btn" v-if="nightViewData.werewolfFirstPick !== 2" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 2, isSecondView: nightViewData.werewolfFirstPick !== undefined })">查看右侧牌</button>
                    </view>
                  </view>`;

code = code.replace(/<view v-else class="lone-wolf-box">[\s\S]*?<\/view>\s*<\/view>\s*<\/view>\s*<!-- 预言家 -->/, newLoneWolf + '\n                </view>\n\n                <!-- 预言家 -->');

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

<template>
  <view class="container">
    <!-- 全局断网重连遮罩 -->
    <view v-if="isDisconnected" class="disconnect-mask">
      <view class="disconnect-panel">
        <text style="font-size: 80rpx;">⚠️</text>
        <text style="font-size: 36rpx; font-weight: bold; margin-top: 20rpx;">网络断开，正在尝试重连...</text>
      </view>
    </view>

    <!-- 顶部状态栏：显示自己的玩家座号 -->
    <view class="w-full flex justify-center mt-4" v-if="appState === 'PLAYING' || appState === 'NIGHT' || appState === 'DAY' || appState === 'VOTING'">
      <view class="bg-blue-600/30 border border-blue-500/50 rounded-full px-6 py-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] backdrop-blur-sm">
        <text class="text-white text-sm font-bold tracking-wide">🎯 你是 {{ mySeatNumber }} 号玩家</text>
      </view>
    </view>
    
    <view class="header" v-if="appState !== 'LOBBY'">
      <!-- 房间内状态：左右结构 -->
      <view class="header-inner">
        <!-- 左侧/居中：唤醒房间号分享 -->
        <view class="room-pill-btn pulse-animation" @click="showShareModal = true">
          <text class="room-pill-text">房间号: {{ roomId }} (点击邀请)</text>
        </view>

        <!-- 右侧：控制与退出 -->
        <view class="header-actions">
          <text v-if="appState !== 'WAITING' && isHost" class="header-btn danger-text" @click="forceReturnLobby">强制重开</text>
          <text class="header-btn ghost-btn" @click="leaveRoom">退出房间</text>
        </view>
      </view>
    </view>

    <!-- 角色图鉴悬浮按钮 -->
    <view
      v-if="appState === 'NIGHT' || appState === 'DAY' || appState === 'VOTING'"
      class="guide-float-btn"
      @click="showRoleGuide = true">
      <text class="guide-icon">📖</text>
    </view>

    <!-- 音效测试按钮（WAITING/NIGHT/DAY/VOTING 状态显示） -->
    <view
      v-if="appState === 'WAITING' || appState === 'NIGHT' || appState === 'DAY' || appState === 'VOTING'"
      class="audio-test-btn"
      @click="testAudio">
      <text class="audio-icon">🔊</text>
    </view>

    <!-- 角色图鉴弹窗 -->
    <view v-if="showRoleGuide" class="guide-modal" @click="showRoleGuide = false">
      <view class="guide-panel" @click.stop="">
        <view class="guide-header">
          <text class="guide-title">📖 角色图鉴</text>
          <text class="guide-close" @click="showRoleGuide = false">✕</text>
        </view>

        <!-- 我的角色（固定在顶部，不参与滚动） -->
        <view style="padding: 24rpx 24rpx 0 24rpx; flex-shrink: 0; box-sizing: border-box; width: 100%;">
          <view v-if="activeMyRole && activeDictionary[activeMyRole]" class="role-card my-role">
            <view class="role-header">
              <view :class="['role-sprite', gameType === 'avalon' ? 'avalon-sprite' : 'onuw-sprite']" :style="{'background-position': activeDictionary[activeMyRole].spritePosition}"></view>
              <view class="role-info">
                <text class="role-name">{{ activeDictionary[activeMyRole].name }}</text>
                <text class="role-camp" :style="{color: CAMP_COLORS[activeDictionary[activeMyRole].camp]}">
                  {{ activeDictionary[activeMyRole].camp }}
                </text>
              </view>
              <view class="my-role-badge">你的身份</view>
            </view>
            <text class="role-desc">{{ activeDictionary[activeMyRole].description }}</text>
            <view class="role-tip">
              <text class="tip-label">💡 高阶提示</text>
              <text class="tip-content">{{ activeDictionary[activeMyRole].advancedTip }}</text>
            </view>
          </view>
        </view>

        <scroll-view scroll-y class="guide-content">
          <!-- 本局所有角色 -->
          <view class="roles-section">
            <text class="section-title">本局所有角色 (共 {{ selectedRoles.length }} 张)</text>
            <view
              v-for="(roleId, index) in selectedRoles"
              :key="index"
              class="role-card">
              <view class="role-header">
                <view :class="['role-sprite', gameType === 'avalon' ? 'avalon-sprite' : 'onuw-sprite']" :style="{'background-position': activeDictionary[roleId]?.spritePosition}"></view>
                <view class="role-info">
                  <text class="role-name">{{ activeDictionary[roleId]?.name }}</text>
                  <text class="role-camp" :style="{color: CAMP_COLORS[activeDictionary[roleId]?.camp]}">
                    {{ activeDictionary[roleId]?.camp }}
                  </text>
                </view>
              </view>
              <text class="role-desc">{{ activeDictionary[roleId]?.description }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- ==================== LOBBY (大厅阶段) ==================== -->
    <LoginView 
      v-if="appState === 'LOBBY'"
      :nickname="nickname"
      :roomId="roomId"
      @update:nickname="val => nickname = val"
      @update:roomId="val => roomId = val"
      @join="joinRoom(false)"
    />

    <!-- ==================== WAITING (准备阶段) ==================== -->
    <view v-else-if="appState === 'WAITING'" class="section">
      <text class="room-title">房间号: {{ roomId }}</text>
      
      <view class="player-list">
        <text class="sub-title">玩家列表 ({{ players.length }}/10)</text>
        <view class="player-item" :class="{ 'offline-player': p.offline }" v-for="p in sortedPlayers" :key="p.sessionId" style="display: flex; align-items: center; justify-content: flex-start;">
          <text class="font-bold text-slate-700" style="font-size: 32rpx; margin-right: 16rpx;">[{{ p.seatNumber }}号] {{ p.nickname }}</text> 
          <text v-if="p.isHost" class="host-tag">(房主)</text>
          <text v-else-if="p.isReady" style="color: #27ae60; font-size: 24rpx; margin-left: 10rpx; font-weight: bold;">(已准备)</text>
          <text v-else style="color: #7f8c8d; font-size: 24rpx; margin-left: 10rpx;">(未准备)</text>
          <text v-if="p.offline" style="color: #e74c3c; font-size: 24rpx; margin-left: 10rpx; font-weight: bold;">(离线)</text>
        </view>
      </view>

      <view class="settings" v-if="isHost">
        <view class="game-selector mt" style="margin-bottom: 30rpx;">
          <text class="sub-title">当前游戏模式</text>
          <radio-group @change="onGameTypeChange" style="display: flex; gap: 20rpx; margin-top: 10rpx;">
            <label><radio value="onuw" :checked="gameType === 'onuw'" /> 一夜终极狼人</label>
            <label><radio value="avalon" :checked="gameType === 'avalon'" /> 阿瓦隆</label>
          </radio-group>
        </view>

        <!-- 一夜狼配置 -->
        <view v-if="gameType === 'onuw'">
          <text class="sub-title">设置板子 (当前已有 {{ players.length }} 人，实际需 {{ players.length + 3 }} 张牌)</text>
          <text style="font-size: 28rpx; color: #e74c3c; font-weight: bold;">当前已选: {{ selectedRoles.length }} 张</text>
          
          <view class="recommend-box mt">
            <text class="sub-title" style="margin-bottom: 10rpx;">智能板子推荐:</text>
            <view style="display: flex; flex-wrap: wrap; gap: 10rpx;">
              <button size="mini" type="default" v-for="n in 8" :key="n" @click="applyRecommend(n+2)">{{ n+2 }} 人局</button>
            </view>
          </view>

          <view class="roles-grid mt">
            <!-- 这里使用过滤后的 ONUW_ROLE_NAMES 避免混入阿瓦隆角色 -->
            <view class="role-counter-item" v-for="(name, roleId) in ONUW_ROLE_NAMES" :key="roleId">
              <text class="role-name">{{ name }}</text>
              <view class="stepper">
                <text class="step-btn" @click="changeRoleCount(roleId, -1)">-</text>
                <text class="step-val">{{ getRoleCount(roleId) }}</text>
                <text class="step-btn" @click="changeRoleCount(roleId, 1)">+</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 阿瓦隆配置占位 -->
        <view v-else-if="gameType === 'avalon'">
          <text class="sub-title">阿瓦隆板子配置</text>
          <view style="padding: 20rpx; background: #f9f9f9; border-radius: 10rpx;">
            <label style="display: block; margin-bottom: 10rpx;"><checkbox checked disabled /> 梅林 & 派西维尔</label>
            <label style="display: block; margin-bottom: 10rpx;"><checkbox checked disabled /> 莫甘娜 & 刺客</label>
            <label style="display: block; margin-bottom: 10rpx;"><checkbox disabled /> 奥伯伦</label>
            <label style="display: block; margin-bottom: 10rpx;"><checkbox disabled /> 莫德雷德</label>
            <text style="font-size: 24rpx; color: #888; margin-top: 10rpx; display: block;">系统将根据人数（5-10人）自动计算好人和坏人阵营的牌数及任务所需的组队人数</text>
          </view>
        </view>

        <button class="btn mt" type="primary" @click="startGame" :disabled="!allReady">
          {{ allReady ? '开始游戏' : '等待其他玩家准备...' }}
        </button>
      </view>
      
      <view class="settings" v-else>
        <text class="sub-title" style="font-weight: bold; color: #e67e22;">当前游戏：{{ gameType === 'onuw' ? '一夜终极狼人' : '阿瓦隆' }}</text>
        
        <button class="btn mt" :type="myReadyStatus ? 'default' : 'primary'" @click="toggleReady">
          {{ myReadyStatus ? '取消准备' : '准备' }}
        </button>
      </view>
    </view>

    <!-- ==================== GAME PHASE (游戏进行阶段) ==================== -->
    <template v-else-if="['NIGHT', 'DAY', 'VOTING', 'END', 'PLAYING'].includes(appState)">
      <!-- ==================== END (结算复盘) ==================== -->
      <view v-if="appState === 'END'" class="section center-layout">
        <text class="night-title" style="color: #e74c3c;">🏆 游戏结束</text>
        <text style="font-size: 40rpx; font-weight: bold; margin: 20rpx 0;">{{ gameResult?.winner === 'good' ? '正义阵营' : (gameResult?.winner === 'evil' ? '邪恶阵营' : gameResult?.winner) }} 获胜</text>
        <text style="color: #666; margin-bottom: 40rpx;">{{ gameResult?.summary }}</text>
        
        <view v-if="gameResult?.exiledPlayers?.length > 0" style="width: 100%; text-align: left; margin-bottom: 40rpx;">
          <text style="font-weight: bold; display: block; margin-bottom: 20rpx;">被放逐玩家:</text>
          <text style="color: #c0392b;">{{ gameResult?.exiledPlayers.join(', ') }}</text>
        </view>

        <view v-if="gameResult?.finalRoles?.length > 0" style="width: 100%; text-align: left; margin-bottom: 40rpx;">
          <text style="font-weight: bold; display: block; margin-bottom: 20rpx;">🎭 玩家最终底牌:</text>
          <view v-for="p in gameResult?.finalRoles" :key="p.nickname" style="margin-bottom: 10rpx; font-size: 28rpx;">
            <text>{{ p.nickname }} : </text>
            <text v-if="p.initialRole !== p.currentRole" style="color: #888; text-decoration: line-through;">{{ ROLE_NAMES[p.initialRole] || p.initialRole }}</text>
            <text v-if="p.initialRole !== p.currentRole"> ➡️ </text>
            <text style="color: #e67e22; font-weight: bold;">{{ ROLE_NAMES[p.currentRole] || p.currentRole }}</text>
          </view>
        </view>

        <view v-if="gameResult?.timeline?.length > 0" style="width: 100%; text-align: left; margin-bottom: 40rpx;">
          <text style="font-weight: bold; display: block; margin-bottom: 20rpx;">📜 全局夜间时间线复盘:</text>
          <scroll-view scroll-y style="max-height: 400rpx; background: #f8f9f9; padding: 20rpx; border-radius: 12rpx;">
            <view v-for="(log, idx) in gameResult?.timeline" :key="idx" style="margin-bottom: 16rpx; font-size: 26rpx; color: #34495e;">
              {{ log }}
            </view>
          </scroll-view>
        </view>

        <button v-if="isHost" class="btn mt confirm-btn" type="primary" @click="forceReturnLobby">返回大厅并开启下一局</button>
        <button v-else class="btn mt confirm-btn" type="default" @click="appState = 'WAITING'">返回大厅准备下一局</button>
      </view>

      <!-- ONUW 游戏视图 -->
      <template v-else-if="gameType === 'onuw'">
        
        <!-- ==================== NIGHT (夜间阶段) ==================== -->
        <view v-if="appState === 'NIGHT'" class="section center-layout night-section">
      
      <view class="night-header">
        <text class="night-title">🌙 夜幕降临</text>
        <text class="night-info">当前行动: {{ ROLE_NAMES[currentNightRole] || '...' }}</text>
      </view>

      
      <view class="flip-container mt">
        <view class="flipper" :class="{ 'is-flipped': nightPanelOpen }">
          <!-- 卡牌背面 (默认状态) -->
          <view class="front" @click.stop="nightPanelOpen = true">
            <image :src="'/static/cards/back' + randomBackIndex + '.png'" style="width: 100%; height: 100%; border-radius: 20rpx; box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);" />
          </view>
          
          <!-- 卡牌正面 -->
          <view class="back role-card-3d">
            <view class="role-sprite-large onuw-sprite" :style="{'background-position': ROLES_DICTIONARY[myInitialRole]?.spritePosition}"></view>
          </view>
        </view>

        <!-- 右侧信息（只在正面朝上时显示） -->
        <view v-if="nightPanelOpen" class="role-info-side">
          <text class="card-name">{{ ROLE_NAMES[myInitialRole] }}</text>
          <text class="player-info">[ {{ mySeatNumber }}号 ] {{ players.find(p => p.sessionId === sessionId)?.nickname || '' }}</text>
          <text class="card-label" style="font-size: 28rpx; color: #888; margin-bottom: 30rpx;">您的初始底牌</text>
          <button class="hide-panel-btn" size="mini" @click.stop="nightPanelOpen = false">🙈 收起（防窥）</button>
        </view>
      </view>

      <view v-if="nightPanelOpen" class="night-content-wrapper" style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 40rpx;">
        <!-- 属于我的回合 -->
        <view v-if="isMyTurn" class="action-panel active-turn">
          <text class="action-title">请执行行动</text>
          
          <!-- 狼人 -->
          <view v-if="myInitialRole === 'werewolf'">
            <view v-if="nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0">
              <text>你的狼队友是:</text>
              <text v-for="w in nightViewData.werewolfMates" :key="w" style="font-weight: bold; margin-left: 10rpx;">[ {{ w }}号 ]</text>
            </view>
            <view v-else>
              <text>你是孤狼。你可以查看中央的牌:</text>
              <view class="center-cards mt">
                <button size="mini" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 0 })">查看左侧</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 1 })">查看中间</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 2 })">查看右侧</button>
              </view>
            </view>
          </view>

          <!-- 预言家 -->
          <view v-else-if="myInitialRole === 'seer'">
            <view v-if="nightViewData.seenRole">
              <text>你看到的牌是: <text style="color: #e74c3c; font-weight: bold;">{{ ROLE_NAMES[nightViewData.seenRole] }}</text></text>
            </view>
            <view v-else-if="nightViewData.seenRoles">
              <text>你看到的中央牌是:</text>
              <text style="color: #e74c3c; font-weight: bold; display: block; margin-top: 10rpx;">{{ ROLE_NAMES[nightViewData.seenRoles[0]] }} & {{ ROLE_NAMES[nightViewData.seenRoles[1]] }}</text>
            </view>
            <view v-else>
              <text>查看一名其他玩家:</text>
              <picker class="picker-box mt" mode="selector" :range="otherPlayers" range-key="nickname" @change="onSeerPlayerChange">
                <view>请选择玩家</view>
              </picker>
              <text style="margin: 20rpx 0; display: block;">或者</text>
              <view class="center-cards mt">
                <button size="mini" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [0, 1] })">看左+中</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [1, 2] })">看中+右</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [0, 2] })">看左+右</button>
              </view>
            </view>
          </view>

          <!-- 强盗 -->
          <view v-else-if="myInitialRole === 'robber'">
            <view v-if="nightViewData.robbedRole">
              <text>你抢到了: <text style="color: #e74c3c; font-weight: bold;">{{ ROLE_NAMES[nightViewData.robbedRole] }}</text></text>
            </view>
            <view v-else>
              <text>选择一名玩家进行抢夺:</text>
              <picker class="picker-box mt" mode="selector" :range="otherPlayers" range-key="nickname" @change="onRobPlayerChange">
                <view>请选择玩家</view>
              </picker>
            </view>
          </view>

          <!-- 捣蛋鬼 -->
          <view v-else-if="myInitialRole === 'troublemaker'">
            <view v-if="nightViewData.swapped">
              <text>交换成功！</text>
            </view>
            <view v-else>
              <text>选择两名玩家交换身份:</text>
              <picker class="picker-box mt" mode="selector" :range="otherPlayers" range-key="nickname" @change="(e) => tmP1 = otherPlayers[e.detail.value]">
                <view>玩家1: {{ tmP1 ? tmP1.nickname : '未选择' }}</view>
              </picker>
              <picker class="picker-box mt" mode="selector" :range="otherPlayers" range-key="nickname" @change="(e) => tmP2 = otherPlayers[e.detail.value]">
                <view>玩家2: {{ tmP2 ? tmP2.nickname : '未选择' }}</view>
              </picker>
              <button class="btn mt" type="primary" size="mini" @click="doTroublemaker">确认交换</button>
            </view>
          </view>

          <!-- 酒鬼 -->
          <view v-else-if="myInitialRole === 'drunk'">
            <view v-if="nightViewData.swapped">
              <text>已盲换！</text>
            </view>
            <view v-else>
              <text>盲换中央的牌:</text>
              <view class="center-cards mt">
                <button size="mini" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 0 })">换左侧</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 1 })">换中间</button>
                <button size="mini" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 2 })">换右侧</button>
              </view>
            </view>
          </view>

          <!-- 爪牙 -->
          <view v-else-if="myInitialRole === 'minion'">
            <text v-if="nightViewData.werewolves && nightViewData.werewolves.length > 0">
              狼人是: 
              <text v-for="w in nightViewData.werewolves" :key="w" style="font-weight: bold; margin-left: 10rpx;">[ {{ w }}号 ]</text>
            </text>
            <text v-else>场上没有狼人！</text>
          </view>
          
          <!-- 守夜人 -->
          <view v-else-if="myInitialRole === 'mason'">
            <text v-if="nightViewData.masonMates && nightViewData.masonMates.length > 0">
              另一个守夜人是: 
              <text v-for="m in nightViewData.masonMates" :key="m" style="font-weight: bold; margin-left: 10rpx;">[ {{ m }}号 ]</text>
            </text>
            <text v-else>你是唯一的守夜人！</text>
          </view>

          <!-- 失眠者 -->
          <view v-else-if="myInitialRole === 'insomniac'">
            <text v-if="nightViewData.currentRole">
              你现在的牌是: <text style="color: #e74c3c; font-weight: bold;">{{ ROLE_NAMES[nightViewData.currentRole] }}</text>
            </text>
          </view>

          <view style="margin-top: 40rpx;" v-if="['werewolf', 'minion', 'mason', 'insomniac'].includes(myInitialRole) || (myInitialRole==='werewolf' && nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0)">
             <button class="btn" type="default" @click.stop="submitNightAction({ type: 'CONFIRM' })">确认完毕</button>
          </view>
          <view style="margin-top: 20rpx;" v-else>
             <button class="btn" type="default" @click.stop="submitNightAction({ type: 'NONE' })">放弃行动</button>
          </view>
        </view>
        
        <view v-else class="action-panel blind-turn">
          <text class="action-title">请等待其他人行动...</text>
        </view>
      </view>

    </view>

    <!-- ==================== DAY (白天讨论) ==================== -->
    <view v-else-if="appState === 'DAY'" class="section center-layout">
      <text class="day-title">☀️ 太阳升起，请自由讨论</text>
      <text class="sub-title">请通过线下交流，寻找狼人！</text>
      <text class="temp-text" style="margin-top: 40rpx;">(讨论结束后由房主开启投票)</text>
      <button class="btn mt" type="warn" v-if="isHost" @click="forceVote">房主提前进入投票</button>
    </view>

    <!-- ==================== VOTING (投票阶段) ==================== -->
    <view v-else-if="appState === 'VOTING'" class="section center-layout">
      <text class="night-title">🗳️ 投票阶段</text>
      <text class="sub-title">请选择一名玩家进行放逐 (可弃权)</text>
      
      <view class="player-list" style="width: 100%; margin-top: 30rpx;">
        <view 
          class="player-item" 
          v-for="p in sortedPlayers" 
          :key="p.sessionId"
          style="display: flex; justify-content: space-between; align-items: center;">
          <text class="font-bold text-slate-700" style="font-size: 32rpx; margin-right: 16rpx;">[{{ p.seatNumber }}号] {{ p.nickname }}</text>
          <button size="mini" type="primary" @click="submitVote(p.seatNumber)">投票</button>
        </view>
        <button class="btn mt" type="default" @click="submitVote(-1)">弃权</button>
      </view>
    </view>
      </template>

      <!-- Avalon 游戏视图 -->
      <template v-else-if="gameType === 'avalon'">
        <AvalonGameView 
          :avalonState="avalonState" 
          :players="players" 
          :sessionId="sessionId" 
          :roomId="roomId" 
          @action="onAvalonAction"
        />
      </template>
    </template>

    <transition name="fade">
      <ShareQrcodeModal
        v-if="showShareModal"
        :roomId="roomId"
        :gameName="gameType === 'onuw' ? '一夜终极狼人' : '阿瓦隆'"
        @close="showShareModal = false"
      />
    </transition>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import io from '@hyoga/uni-socket.io';
import { ROLES_DICTIONARY, CAMP_COLORS, AVALON_ROLES_DICTIONARY } from '../../rolesDictionary.js';
import AvalonGameView from '../../components/AvalonGameView.vue';
import ShareQrcodeModal from '../../components/ShareQrcodeModal.vue';
import LoginView from '../../components/LoginView.vue';
import PlayerAvatar from '../../components/PlayerAvatar.vue';

// 角色字典映射 (一夜狼和阿瓦隆彻底分离防止覆盖)
const ONUW_ROLE_NAMES = {
  werewolf: '狼人', minion: '爪牙', mason: '守夜人',
  seer: '预言家', robber: '强盗', troublemaker: '捣蛋鬼',
  drunk: '酒鬼', insomniac: '失眠者', villager: '平民',
  hunter: '猎人', tanner: '皮匠', doppelganger: '化身幽灵'
};

const ROLE_NAMES = {
  ...ONUW_ROLE_NAMES,
  // Avalon
  merlin: '梅林', percival: '派西维尔', loyal: '亚瑟的忠臣',
  morgana: '莫甘娜', assassin: '刺客', oberon: '奥伯伦',
  mordred: '莫德雷德', minion_avalon: '莫德雷德的爪牙'
};

const appState = ref('LOBBY');
const gameType = ref('onuw'); // 当前房间选定的游戏类型
const nickname = ref('');
const roomId = ref('');
const sessionId = ref('');
const isHost = ref(false);
const players = ref([]);
const sortedPlayers = computed(() => [...players.value].sort((a, b) => a.seatNumber - b.seatNumber));
const selectedRoles = ref([]);

const activeDictionary = computed(() => gameType.value === 'avalon' ? AVALON_ROLES_DICTIONARY : ROLES_DICTIONARY);
const activeMyRole = computed(() => gameType.value === 'avalon' ? avalonState.value?.role : myInitialRole.value);

const showShareModal = ref(false);

const mySeatNumber = computed(() => {
  const me = players.value.find(p => p.sessionId === sessionId.value);
  return me ? me.seatNumber : 0;
});

const myReadyStatus = computed(() => {
  const me = players.value.find(p => p.sessionId === sessionId.value);
  return me ? me.isReady : false;
});

const allReady = computed(() => {
  return players.value.every(p => p.isHost || p.isReady || p.offline);
});

const toggleReady = () => {
  if (socket) {
    socket.emit('toggle_ready', {
      sessionId: sessionId.value,
      roomId: roomId.value,
      isReady: !myReadyStatus.value
    });
  }
};

// 房主切换游戏类型
const onGameTypeChange = (e) => {
  if (!isHost.value) return;
  gameType.value = e.detail.value;
  if (socket) {
    socket.emit('change_game_type', {
      sessionId: sessionId.value,
      roomId: roomId.value,
      gameType: gameType.value
    });
  }
};

const onAvalonAction = (actionData) => {
  if (socket) {
    socket.emit('game_action', {
      sessionId: sessionId.value,
      roomId: roomId.value,
      actionData
    });
  }
};

// 角色图鉴相关
const showRoleGuide = ref(false);
const nightPanelOpen = ref(false);
const randomBackIndex = ref(1);

// 夜间状态
const myInitialRole = ref('');
const currentNightRole = ref('');
const isMyTurn = ref(false);
const nightViewData = ref({});
const gameResult = ref(null);
const isDisconnected = ref(false);

const avalonState = ref({
  phase: 'waiting',
  role: '',
  vision: {},
  leaderSeat: 0,
  currentQuestSize: 0,
  failedVotes: 0,
  proposedTeam: [],
  voteResult: null,
  questResults: [],
  questDisplayCards: [],
  isQuestSuccess: null,
  failCount: 0
});

// 捣蛋鬼选择
const tmP1 = ref(null);
const tmP2 = ref(null);

// ============ 音效系统 ============
let audioCtx = null;
const audioReady = ref(false);

const initAudio = () => {
  if (audioCtx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioReady.value = true;
  } catch (e) {
    console.warn('音频初始化失败', e);
  }
};

const playTone = (freq, startTime, duration, volume = 0.3, type = 'sine') => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(volume * 0.8, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
};

const playSound = (name) => {
  if (!audioCtx) {
    initAudio();
    if (!audioCtx) return;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const t = audioCtx.currentTime;

  switch (name) {
    case 'night':
      playTone(392, t, 0.35, 0.35, 'sine');
      playTone(311, t + 0.3, 0.35, 0.35, 'sine');
      playTone(261, t + 0.6, 0.6, 0.35, 'sine');
      break;
    case 'roleTurn':
      playTone(659, t, 0.15, 0.25, 'triangle');
      playTone(880, t + 0.15, 0.2, 0.25, 'triangle');
      break;
    case 'myTurn':
      playTone(880, t, 0.12, 0.4, 'square');
      playTone(1108, t + 0.14, 0.12, 0.4, 'square');
      playTone(1318, t + 0.28, 0.25, 0.4, 'square');
      break;
    case 'day':
      playTone(523, t, 0.18, 0.35, 'sine');
      playTone(659, t + 0.16, 0.18, 0.35, 'sine');
      playTone(784, t + 0.32, 0.18, 0.35, 'sine');
      playTone(1046, t + 0.48, 0.5, 0.35, 'sine');
      break;
    case 'vote':
      playTone(740, t, 0.2, 0.35, 'triangle');
      playTone(554, t + 0.22, 0.2, 0.35, 'triangle');
      playTone(740, t + 0.48, 0.2, 0.35, 'triangle');
      playTone(554, t + 0.7, 0.35, 0.35, 'triangle');
      break;
    case 'confirm':
      playTone(1046, t, 0.1, 0.25, 'sine');
      break;
    case 'end':
      playTone(523, t, 0.25, 0.35, 'sine');
      playTone(784, t + 0.25, 0.25, 0.35, 'sine');
      playTone(1046, t + 0.5, 0.8, 0.35, 'sine');
      break;
  }
};

const testAudio = () => {
  initAudio();
  if (!audioCtx) {
    uni.showToast({ title: '此浏览器不支持音效', icon: 'none', duration: 2500 });
    return;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  playSound('myTurn');
  uni.vibrateShort();
  const hasTTS = typeof window !== 'undefined' && !!window.speechSynthesis;
  if (isHost.value && hasTTS) {
    speak('语音播报正常');
  }
  uni.showToast({
    title: audioCtx.state === 'running' ? '音效已开启' : '请调高手机音量',
    icon: 'none',
    duration: 2000
  });
};

const speak = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    msg.rate = 0.75; 
    msg.pitch = 0.8;
    msg.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      let selectedVoice = voices.find(v => v.name.includes('Yunye') || v.name.includes('云野'));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('zh') && (v.name.includes('Yun') || v.name.includes('Yun') || v.name.includes('Male')));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('zh'));
      }
      if (selectedVoice) {
        msg.voice = selectedVoice;
      }
    }
    window.speechSynthesis.speak(msg);
  } catch (e) {
    console.warn('语音播报失败', e);
  }
};

let socket = null;

const otherPlayers = computed(() => {
  return players.value
    .filter(p => p.sessionId !== sessionId.value)
    .sort((a,b) => a.seatNumber - b.seatNumber)
    .map(p => ({...p, displayName: `[${p.seatNumber}号] ${p.nickname}` }));
});

onMounted(() => {
  let sid = uni.getStorageSync('werewolf_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15);
    uni.setStorageSync('werewolf_session_id', sid);
  }
  sessionId.value = sid;

  const savedNickname = uni.getStorageSync('werewolf_nickname');
  const savedRoomId = uni.getStorageSync('werewolf_roomId');
  
  if (savedNickname && savedRoomId) {
    nickname.value = savedNickname;
    roomId.value = savedRoomId;
    joinRoom(true);
  }
});

const joinRoom = (isAuto = false) => {
  if (!nickname.value || !roomId.value) {
    if (isAuto) return;
    return uni.showToast({ title: '请输入完整信息', icon: 'none' });
  }

  uni.setStorageSync('werewolf_nickname', nickname.value);
  uni.setStorageSync('werewolf_roomId', roomId.value);

  if (!isAuto) {
    initAudio();
    playSound('confirm');
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const warm = new SpeechSynthesisUtterance(' ');
        warm.volume = 0;
        window.speechSynthesis.speak(warm);
      } catch (e) { }
    }
  }

  const socketUrl = window.location.port === '5173' ? 'http://localhost:3000' : window.location.origin;
  socket = io(socketUrl, { query: {}, transports: ['polling'], extraHeaders: { 'Bypass-Tunnel-Reminder': 'true' } });

  socket.on('connect', () => {
    if (isDisconnected.value) {
      socket.emit('sync_state', { sessionId: sessionId.value, roomId: roomId.value }, (res) => {
        if (res.success) {
          isDisconnected.value = false;
          appState.value = res.roomStatus;
          gameType.value = res.gameType;
          isHost.value = res.isHost;
          if (res.settings) {
             if (res.settings.selectedRoles) {
               selectedRoles.value = res.settings.selectedRoles;
             }
          }
          if (res.playerState) myInitialRole.value = res.playerState.initialRole;
          
          if (gameType.value === 'avalon' && res.gameState) {
             avalonState.value.role = res.playerState.initialRole;
             avalonState.value.phase = res.gameState.phase;
             avalonState.value.vision = res.gameState.vision || {};
             avalonState.value.leaderSeat = res.gameState.leaderSeat;
             avalonState.value.currentQuestSize = res.gameState.currentQuestSize;
             avalonState.value.failedVotes = res.gameState.failedVotes;
             avalonState.value.proposedTeam = res.gameState.proposedTeam || [];
             avalonState.value.questResults = res.gameState.questResults || [];
          } else if (gameType.value === 'onuw' && res.gameState) {
             if (res.roomStatus === 'NIGHT') {
                currentNightRole.value = res.gameState.currentNightRole;
                nightViewData.value = res.gameState.nightViewData;
             }
          }
        } else {
           socket.emit('join_room', { roomId: roomId.value, nickname: nickname.value, sessionId: sessionId.value }, () => {
               isDisconnected.value = false;
           });
        }
      });
    } else {
      socket.emit('join_room', { 
        roomId: roomId.value, 
        nickname: nickname.value, 
        sessionId: sessionId.value 
      }, (res) => {
        if (res.success) {
          appState.value = res.roomStatus || res.status;
          isHost.value = res.isHost;
          if (res.gameType) {
            gameType.value = res.gameType;
          }
          if (res.playerState && res.playerState.initialRole) {
            myInitialRole.value = res.playerState.initialRole;
          }
          if (res.settings && res.settings.selectedRoles) {
            selectedRoles.value = res.settings.selectedRoles;
          }
        } else {
          uni.showToast({ title: res.msg, icon: 'none' });
        }
      });
    }
  });

  socket.on('disconnect', () => {
    isDisconnected.value = true;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (socket && !socket.connected) {
        socket.connect();
      }
    }
  });

  socket.on('room_update', (data) => {
    players.value = data.players;
    if (data.settings && data.settings.selectedRoles) {
      selectedRoles.value = data.settings.selectedRoles;
    }
    if (data.gameType) {
      gameType.value = data.gameType;
    }
    if (data.status !== appState.value && data.status !== 'PLAYING') {
      appState.value = data.status;
    }
  });

  socket.on('avalon_game_started', (data) => {
    appState.value = 'PLAYING';
    avalonState.value = {
      role: data.role,
      phase: data.phase,
      vision: data.vision,
      leaderSeat: 0,
      currentQuestSize: 0,
      failedVotes: 0,
      proposedTeam: [],
      voteResult: null,
      questResults: [],
      questDisplayCards: [],
      isQuestSuccess: null,
      failCount: 0
    };
  });

  socket.on('avalon_phase_change', (data) => {
    avalonState.value.phase = data.phase;
    avalonState.value.leaderSeat = data.leaderSeat;
    avalonState.value.currentQuestSize = data.currentQuestSize;
    avalonState.value.failedVotes = data.failedVotes;
    if (data.proposedTeam) {
      avalonState.value.proposedTeam = data.proposedTeam;
    } else if (data.phase === 'team_building') {
      avalonState.value.proposedTeam = []; 
    }
  });

  socket.on('avalon_team_vote_result', (data) => {
    avalonState.value.voteResult = data;
  });

  socket.on('avalon_quest_result', (data) => {
    avalonState.value.questDisplayCards = data.cards;
    avalonState.value.questResults = data.questResults;
    avalonState.value.isQuestSuccess = data.isQuestSuccess;
    avalonState.value.failCount = data.failCount;
  });

  socket.on('avalon_game_end', (data) => {
    appState.value = 'END';
    avalonState.value.phase = 'end';
    gameResult.value = { winner: data.winner, summary: data.reason, exiledPlayers: [], finalRoles: data.finalRoles || [], timeline: [] };
  });

  
  socket.on('game_started', (data) => {
    appState.value = 'NIGHT';
    myInitialRole.value = data.initialRole;
    nightPanelOpen.value = false;
    randomBackIndex.value = Math.floor(Math.random() * 8) + 1;
    
    isMyTurn.value = false;

    playSound('night');
    if (isHost.value) {
      speak("天黑请闭眼，大家请确认自己的底牌。");
    }
  });

  socket.on('night_action_update', (data) => {
    currentNightRole.value = data.activeRole;
    isMyTurn.value = false;
    tmP1.value = null;
    tmP2.value = null;

    playSound('roleTurn');
    if (isHost.value) {
      const roleName = ROLE_NAMES[data.activeRole];
      if (roleName) {
        speak(`${roleName}，请睁眼，并执行您的操作。`);
      }
    }
  });

  socket.on('night_action_close', (data) => {
    isMyTurn.value = false;
    currentNightRole.value = 'transition'; 
    
    if (isHost.value) {
      const roleName = ROLE_NAMES[data.closedRole];
      if (roleName) {
        speak(`${roleName}，请闭眼。`);
      }
    }
  });

  socket.on('your_turn', (data) => {
    isMyTurn.value = true;
    nightViewData.value = data; 
    playSound('myTurn');        
    uni.vibrateShort();         
  });

  socket.on('day_started', (data) => {
    appState.value = 'DAY';
    playSound('day');
    if (isHost.value) {
      speak("天亮了，请大家睁眼，开始自由讨论。");
    }
  });

  socket.on('voting_started', () => {
    appState.value = 'VOTING';
    playSound('vote');
    if (isHost.value) {
      speak("讨论时间结束，请所有人在手机上投票。");
    }
  });

  socket.on('game_ended', (result) => {
    appState.value = 'END';
    gameResult.value = result;
    playSound('end');
  });

  socket.on('game_aborted', (data) => {
    uni.showModal({
      title: '游戏已中止',
      content: data.reason,
      showCancel: false
    });
    appState.value = 'WAITING';
  });

  socket.on('return_to_lobby', (data) => {
    uni.showToast({ title: data.reason, icon: 'none' });
    appState.value = 'WAITING';
  });

  socket.on('error_msg', (msg) => {
    uni.showToast({ title: msg, icon: 'none' });
  });
};

const RECOMMENDED_BOARDS = {
  3: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'villager'],
  4: ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'villager', 'villager'],
  5: ['werewolf', 'werewolf', 'minion', 'seer', 'robber', 'troublemaker', 'villager', 'villager'],
  6: ['werewolf', 'werewolf', 'minion', 'mason', 'mason', 'seer', 'robber', 'troublemaker', 'villager'],
  7: ['werewolf', 'werewolf', 'minion', 'mason', 'mason', 'seer', 'robber', 'troublemaker', 'villager', 'villager'],
  8: ['werewolf', 'werewolf', 'minion', 'mason', 'mason', 'seer', 'robber', 'troublemaker', 'insomniac', 'villager', 'villager'],
  9: ['werewolf', 'werewolf', 'minion', 'mason', 'mason', 'seer', 'robber', 'troublemaker', 'insomniac', 'drunk', 'villager', 'villager'],
  10: ['werewolf', 'werewolf', 'minion', 'mason', 'mason', 'seer', 'robber', 'troublemaker', 'insomniac', 'drunk', 'hunter', 'villager', 'villager']
};

const applyRecommend = (n) => {
  if (RECOMMENDED_BOARDS[n]) {
    selectedRoles.value = [...RECOMMENDED_BOARDS[n]];
    socket.emit('update_settings', { sessionId: sessionId.value, roomId: roomId.value, settings: { selectedRoles: selectedRoles.value } });
    uni.showToast({ title: `已应用 ${n} 人局智能推荐`, icon: 'success' });
  }
};

const getRoleCount = (roleId) => {
  return selectedRoles.value.filter(r => r === roleId).length;
};

const changeRoleCount = (roleId, delta) => {
  if (roleId === 'mason') {
    if (delta === 1) {
      selectedRoles.value.push(roleId);
      selectedRoles.value.push(roleId);
    } else if (delta === -1) {
      let idx1 = selectedRoles.value.indexOf(roleId);
      if (idx1 !== -1) selectedRoles.value.splice(idx1, 1);
      let idx2 = selectedRoles.value.indexOf(roleId);
      if (idx2 !== -1) selectedRoles.value.splice(idx2, 1);
    }
  } else {
    if (delta === 1) {
      selectedRoles.value.push(roleId);
    } else if (delta === -1) {
      const idx = selectedRoles.value.indexOf(roleId);
      if (idx !== -1) {
        selectedRoles.value.splice(idx, 1);
      }
    }
  }
  socket.emit('update_settings', { sessionId: sessionId.value, roomId: roomId.value, settings: { selectedRoles: selectedRoles.value } });
};

const startGame = () => {
  if (gameType.value === 'onuw') {
    const targetCount = players.value.length + 3;
    if (selectedRoles.value.length !== targetCount) {
      return uni.showToast({ title: `牌数必须为 ${targetCount} 张！(当前 ${selectedRoles.value.length} 张)`, icon: 'none' });
    }
  }
  socket.emit('start_game', { sessionId: sessionId.value, roomId: roomId.value });
};

const leaveRoom = () => {
  uni.showModal({
    title: '退出房间',
    content: '中途退出将导致当前游戏异常，确认退出吗?',
    success: (res) => {
      if (res.confirm) {
        socket.emit('leave_room', { sessionId: sessionId.value, roomId: roomId.value });
        appState.value = 'LOBBY';
        roomId.value = '';
        uni.removeStorageSync('werewolf_roomId');
      }
    }
  });
};

const forceReturnLobby = () => {
  uni.showModal({
    title: '强制重开',
    content: '确认强制结束当前对局，带领全员返回大厅吗?',
    success: (res) => {
      if (res.confirm) {
        socket.emit('force_return_lobby', { sessionId: sessionId.value, roomId: roomId.value });
      }
    }
  });
};

// --- 夜间行动具体逻辑 ---

const onSeerPlayerChange = (e) => {
  const target = otherPlayers.value[e.detail.value];
  submitNightAction({ type: 'SEER_PLAYER', targetSeat: target.seatNumber });
};

const onRobPlayerChange = (e) => {
  const target = otherPlayers.value[e.detail.value];
  submitNightAction({ type: 'ROB_PLAYER', targetSeat: target.seatNumber });
};

const onTroublemakerP1Change = (e) => {
  tmP1.value = otherPlayers.value[e.detail.value];
};

const onTroublemakerP2Change = (e) => {
  tmP2.value = otherPlayers.value[e.detail.value];
};

const doTroublemaker = () => {
  if (tmP1.value && tmP2.value && tmP1.value.seatNumber !== tmP2.value.seatNumber) {
    submitNightAction({ type: 'SWAP_PLAYERS', targetSeats: [tmP1.value.seatNumber, tmP2.value.seatNumber] });
  } else {
    uni.showToast({ title: '请选择两名不同的玩家', icon: 'none' });
  }
};

const submitNightAction = (actionData) => {
  socket.emit('night_action', { 
    sessionId: sessionId.value, 
    roomId: roomId.value, 
    actionData 
  }, (res) => {
    if (res && res.success !== false) {
      isMyTurn.value = false;
      
      if (res.seenRole) {
        uni.showModal({ title: '查看结果', content: `你看到的底牌是：${ROLE_NAMES[res.seenRole]}`, showCancel: false });
      } else if (res.seenRoles) {
        uni.showModal({ title: '查看结果', content: `你看到中央的两张牌是：${ROLE_NAMES[res.seenRoles[0]]} 和 ${ROLE_NAMES[res.seenRoles[1]]}`, showCancel: false });
      } else if (res.newRole) {
        uni.showModal({ title: '抢夺成功', content: `你换回的新底牌是：${ROLE_NAMES[res.newRole] || '未知'}`, showCancel: false });
      } else {
        uni.showToast({ title: '操作已提交', icon: 'success' });
      }
    } else {
      uni.showToast({ title: res.error || '操作失败', icon: 'none' });
    }
  });
};

const forceVote = () => {
  socket.emit('force_vote', { sessionId: sessionId.value, roomId: roomId.value });
};

const submitVote = (targetseatNumber) => {
  socket.emit('submit_vote', { 
    sessionId: sessionId.value, 
    roomId: roomId.value, 
    voteTarget: targetseatNumber 
  });
  uni.showToast({ title: '投票已提交', icon: 'success' });
};
</script>

<style scoped>
.container { padding: 40rpx; min-height: 100vh; background-color: #f5f5f5; }
.header { width: 100%; margin-bottom: 40rpx; display: flex; flex-direction: column; }
.header-lobby { text-align: center; }
.title { font-size: 48rpx; font-weight: bold; color: #2c3e50; }

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.room-pill-btn {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-pill-text {
  font-size: 26rpx;
  color: #2563eb;
  font-weight: bold;
}

.pulse-animation {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.98); }
}

.header-actions {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.header-btn {
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
}

.ghost-btn {
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
}

.danger-text {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.section { background: #fff; padding: 30rpx; border-radius: 16rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }

/* Vue Transition Fade for Modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.input { border: 1px solid #ddd; padding: 20rpx; margin-bottom: 30rpx; border-radius: 8rpx; }
.btn { width: 100%; }
.mt { margin-top: 30rpx; }

.room-title { font-size: 36rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.sub-title { font-size: 28rpx; color: #666; margin-bottom: 20rpx; display: block; }

.player-list { margin-bottom: 40rpx; }
.player-item { padding: 16rpx 0; border-bottom: 1px solid #eee; font-size: 32rpx; }
.host-tag { color: #f29c1f; font-size: 24rpx; }

.roles-grid { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 20rpx; }
.role-tag { 
  padding: 10rpx 20rpx; 
  background: #eee; 
  border-radius: 8rpx; 
  font-size: 28rpx; 
  border: 1px solid transparent; 
}
.role-tag.active { background: #e6f7ff; border-color: #1890ff; color: #1890ff; }

/* 夜间面板特有样式 */
.recommend-box { background: #fdf2e9; padding: 20rpx; border-radius: 12rpx; border: 1px solid #fae5d3; }
.roles-grid { display: flex; flex-direction: column; gap: 16rpx; margin-top: 20rpx; }
.role-counter-item { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 16rpx 24rpx; background: #fff; border-radius: 12rpx; border: 1px solid #eee;
}
.role-name { font-size: 30rpx; color: #333; }
.stepper { display: flex; align-items: center; gap: 20rpx; }
.step-btn { 
  width: 50rpx; height: 50rpx; background: #f0f0f0; border-radius: 8rpx; 
  text-align: center; line-height: 50rpx; font-size: 36rpx; font-weight: bold; color: #555;
}
.step-val { font-size: 32rpx; width: 40rpx; text-align: center; }

.center-layout { display: flex; flex-direction: column; align-items: center; }
.night-header { text-align: center; margin-bottom: 60rpx; }
.night-title { font-size: 44rpx; color: #2c3e50; display: block; font-weight: bold; }
.night-info { font-size: 32rpx; color: #e74c3c; display: block; margin-top: 10rpx; }

.role-card-3d { 
  width: 320rpx; 
  height: 448rpx;
  background: #2c3e50; 
  border-radius: 20rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  box-shadow: inset 0 0 30rpx rgba(0,0,0,0.6), 0 16rpx 40rpx rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  border: 4rpx solid #34495e;
}
.role-sprite-large {
  width: 100%;
  height: 100%;
  opacity: 0.95;
}
.card-name-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  font-size: 44rpx;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.9);
  letter-spacing: 4rpx;
  background: linear-gradient(transparent, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.95));
  padding-top: 50rpx;
  padding-bottom: 20rpx;
}
.card-label { color: #bdc3c7; font-size: 24rpx; margin-bottom: 20rpx; }
.card-name { color: #fff; font-size: 48rpx; font-weight: bold; }

.action-panel { width: 100%; padding: 40rpx; border-radius: 16rpx; text-align: center; }
.active-turn { background: #e8f8f5; border: 2px solid #1abc9c; }
.blind-turn { background: #f9ebea; border: 2px dashed #e74c3c; opacity: 0.8; }
.action-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.temp-text { color: #7f8c8d; font-size: 28rpx; }

.night-mask { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60rpx 40rpx; background: #f8f9fa; border-radius: 16rpx; border: 2px dashed #ced4da; margin-top: 40rpx; }
.mask-title { font-size: 40rpx; font-weight: bold; margin-bottom: 20rpx; color: #2c3e50; }
.mask-sub { font-size: 28rpx; color: #7f8c8d; text-align: center; line-height: 1.5; }

.show-panel-btn {
  width: 100%;
  background: #2c3e50;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  padding: 28rpx 0;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  border: none;
}

.hide-panel-btn {
  background: #7f8c8d;
  color: #fff;
  font-size: 24rpx;
  margin-bottom: 30rpx;
  border: none;
}

.guide-float-btn {
  position: fixed;
  top: 40rpx;
  right: 40rpx;
  width: 88rpx;
  height: 88rpx;
  background: rgba(52, 152, 219, 0.9);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(52, 152, 219, 0.4);
  z-index: 999;
}

.guide-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.audio-test-btn {
  position: fixed;
  top: 40rpx;
  right: 148rpx;
  width: 88rpx;
  height: 88rpx;
  background: rgba(241, 196, 15, 0.9);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(241, 196, 15, 0.4);
  z-index: 999;
}

.audio-icon {
  font-size: 44rpx;
}

.guide-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.guide-panel {
  background: #0F131C;
  border-radius: 24rpx;
  width: 100%;
  max-width: 680rpx;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.4);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 36rpx;
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.guide-title {
  font-size: 40rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #38BDF8 0%, #6EE7B7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guide-close {
  font-size: 48rpx;
  color: #9CA3AF;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
  min-height: 0;
  box-sizing: border-box;
  width: 100%;
}

.role-sprite {
  width: 96rpx;
  height: 96rpx;
  border-radius: 12rpx;
  background-size: 400% 400%;
  flex-shrink: 0;
}

.onuw-sprite {
  background-image: url('/static/roles-sprite.jpg');
  background-size: 400% 400%;
}

.avalon-sprite {
  background-image: url('/static/avalon-sprite.jpg');
  background-size: 400% 365.5%;
  flex-shrink: 0;
}

.role-card {
  background: #161D2B;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  border: 1px solid rgba(229, 231, 235, 0.1);
  box-sizing: border-box;
}

.my-role {
  background: #1E2636;
  border: 2px solid #38BDF8;
  box-shadow: 0 0 24rpx rgba(56, 189, 248, 0.3);
  margin-bottom: 12rpx;
}

.role-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.role-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.role-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #E5E7EB;
}

.role-camp {
  font-size: 24rpx;
  font-weight: 500;
}

.my-role-badge {
  background: #38BDF8;
  color: #0F131C;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.role-desc {
  font-size: 28rpx;
  color: #9CA3AF;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: block;
}

.role-tip {
  background: rgba(56, 189, 248, 0.1);
  border-left: 3px solid #38BDF8;
  padding: 20rpx;
  border-radius: 8rpx;
}

.tip-label {
  font-size: 26rpx;
  color: #38BDF8;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
}

.tip-content {
  font-size: 26rpx;
  color: #E5E7EB;
  line-height: 1.7;
  display: block;
}

.roles-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #E5E7EB;
  margin-bottom: 24rpx;
  display: block;
  padding-left: 8rpx;
}

.disconnect-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.disconnect-panel {
  background: #fff;
  padding: 60rpx 40rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.9; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.9; }
}

.flip-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  width: 100%;
  margin-top: 20rpx;
  min-height: 450rpx;
}
.flipper {
  width: 320rpx;
  height: 448rpx;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
  margin: 0;
}
.flipper.is-flipped {
  transform: rotateY(180deg);
}
.front, .back {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5);
}
.front {
  z-index: 2;
  transform: rotateY(0deg);
  cursor: pointer;
}
.back {
  transform: rotateY(180deg);
}
.card-back-design {
  background: radial-gradient(circle at center, #2c3e50 0%, #1a252f 100%);
  border: 12rpx solid #34495e;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 20rpx rgba(0,0,0,0.8), 0 10rpx 30rpx rgba(0,0,0,0.5);
}
.card-back-inner {
  width: 70%;
  height: 70%;
  border: 4rpx solid #5d6d7e;
  border-radius: 12rpx;
  background: repeating-linear-gradient(
    45deg,
    #2c3e50,
    #2c3e50 10px,
    #34495e 10px,
    #34495e 20px
  );
  opacity: 0.8;
  animation: pulse 3s infinite ease-in-out;
}
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
}
.role-info-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 40rpx;
  animation: fadeIn 0.6s ease forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: translateX(-20rpx); }
  100% { opacity: 1; transform: translateX(0); }
}
.card-name { color: #2c3e50; font-size: 56rpx; font-weight: bold; margin-bottom: 10rpx; }
.player-info { color: #666; font-size: 32rpx; margin-bottom: 30rpx; font-weight: bold; }

</style>
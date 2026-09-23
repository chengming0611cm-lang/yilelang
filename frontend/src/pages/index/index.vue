<template>
  <view class="container">
    <CustomModal ref="globalModal" />
    <!-- 全局断网重连遮罩 -->
    <view v-if="isDisconnected" class="disconnect-mask">
      <view class="disconnect-panel">
        <text class="disconnect-icon">⚠️</text>
        <text class="disconnect-title">网络连接已断开</text>
        <text class="disconnect-sub">正在尝试自动重连服务器...</text>
      </view>
    </view>

    <!-- 顶部状态栏与操作栏（一体化游戏顶栏：酒馆房间铭牌 + 功能区） -->
    <view class="app-topbar" v-if="appState !== 'LOBBY'">
      <view class="topbar-left">
        <!-- 退出房间 -->
        <view class="topbar-btn action-pill ghost-pill" @click="leaveRoom">
          <text class="pill-text">退出</text>
        </view>
      </view>

      <view class="topbar-center">
        <!-- 酒馆房间金饰铭牌：点击可直接打开分享/复制弹窗 -->
        <view class="tavern-room-crest" @click="showShareModal = true">
          <view class="crest-frame">
            <text class="crest-label">房间</text>
            <text class="crest-id">{{ roomId }}</text>
            <view class="crest-invite-chip">
              <text class="invite-icon">📲</text>
              <text class="invite-title">邀请</text>
            </view>
          </view>
        </view>

        <!-- 游戏阶段座位标 -->
        <view v-if="['PLAYING', 'NIGHT', 'DAY', 'VOTING'].includes(appState)" class="seat-badge-chip">
          <text class="seat-badge-text">🎯 {{ mySeatNumber }}号</text>
        </view>
      </view>

      <view class="topbar-right">
        <!-- 音效测试 -->
        <view
          v-if="['WAITING', 'NIGHT', 'DAY', 'VOTING'].includes(appState)"
          class="topbar-btn icon-btn"
          @click="testAudio"
          title="音效测试">
          <text class="btn-emoji">🔊</text>
        </view>

        <!-- 角色图鉴 -->
        <view
          v-if="['WAITING', 'NIGHT', 'DAY', 'VOTING'].includes(appState)"
          class="topbar-btn icon-btn"
          @click="showRoleGuide = true"
          title="角色图鉴">
          <text class="btn-emoji">📖</text>
        </view>

        <!-- 房主强制重开 -->
        <view
          v-if="appState !== 'WAITING' && isHost"
          class="topbar-btn action-pill danger-pill"
          @click="forceReturnLobby">
          <text class="pill-text">重开</text>
        </view>
      </view>
    </view>

    <!-- 角色图鉴弹窗 (抽屉式暗黑面板) -->
    <view v-if="showRoleGuide" class="guide-modal" @click="showRoleGuide = false">
      <view class="guide-panel" @click.stop="">
        <view class="guide-header">
          <text class="guide-title">📖 角色图鉴</text>
          <view class="guide-close" @click="showRoleGuide = false">✕</view>
        </view>

        <!-- 我的角色（固定在顶部，不参与滚动） -->
        <view class="my-role-container" v-if="activeMyRole && activeDictionary[activeMyRole]">
          <view class="role-card my-role">
            <view class="role-header">
              <view :class="['role-sprite', gameType === 'avalon' ? 'avalon-sprite' : 'onuw-sprite']" :style="{'background-position': activeDictionary[activeMyRole].spritePosition}"></view>
              <view class="role-info">
                <view class="role-name-row">
                  <text class="role-name">{{ activeDictionary[activeMyRole].name }}</text>
                  <text class="my-role-badge">你的身份</text>
                </view>
                <text class="role-camp" :style="{color: CAMP_COLORS[activeDictionary[activeMyRole].camp]}">
                  {{ activeDictionary[activeMyRole].camp }}
                </text>
              </view>
            </view>
            <text class="role-desc">{{ activeDictionary[activeMyRole].description }}</text>
            <view class="role-tip" v-if="activeDictionary[activeMyRole].advancedTip">
              <text class="tip-label">💡 高阶战术提示</text>
              <text class="tip-content">{{ activeDictionary[activeMyRole].advancedTip }}</text>
            </view>
          </view>
        </view>

        <scroll-view scroll-y class="guide-content">
          <!-- 本局所有角色 -->
          <view class="roles-section">
            <text class="section-title">本局配置角色 (共 {{ selectedRoles.length }} 张)</text>
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
    <view v-else-if="appState === 'WAITING'" class="waiting-wrapper">

      <!-- 桌游聚会席位台板块 -->
      <view class="game-plate table-seating-section">
        <view class="plate-header">
          <view class="plate-title-group">
            <text class="plate-icon">⚔️</text>
            <text class="plate-title">席位围桌</text>
            <view class="player-count-pill">
              <text class="count-num">{{ players.length }}</text>
              <text class="count-max">/10</text>
            </view>
          </view>
          <text class="plate-status-tip">{{ isHost ? '全员就绪后房主开局' : (myReadyStatus ? '已就绪 · 等待房主开局' : '请点击下方「立即就绪」') }}</text>
        </view>

        <!-- 席位卡牌网格 (自适应桌游席位台) -->
        <view class="table-seats-grid">
          <view 
            v-for="p in sortedPlayers" 
            :key="p.sessionId"
            class="seat-podium" 
            :class="{ 
              'is-me': p.sessionId === sessionId, 
              'is-offline': p.offline,
              'is-ready': p.isReady && !p.isHost,
              'is-host': p.isHost
            }"
          >
            <!-- 房主三维金冠 -->
            <view v-if="p.isHost" class="host-floating-crown">👑</view>
            
            <!-- 头像框底座与发光光环 -->
            <view class="podium-avatar-wrapper">
              <view class="avatar-aura-ring"></view>
              <view class="podium-avatar">
                <text class="avatar-char">{{ p.nickname.charAt(0).toUpperCase() }}</text>
              </view>
              <view class="seat-index-badge">{{ p.seatNumber }}</view>
            </view>

            <!-- 玩家名字与自我标签 -->
            <view class="podium-name-tag">
              <text class="podium-nickname">{{ p.nickname }}</text>
              <text v-if="p.sessionId === sessionId" class="self-jewel-tag">我</text>
            </view>

            <!-- 就绪状态胶囊 -->
            <view class="podium-status">
              <text v-if="p.isHost" class="badge-host">房主</text>
              <text v-else-if="p.isReady" class="badge-ready">已就绪</text>
              <text v-else-if="p.offline" class="badge-offline">离线</text>
              <text v-else class="badge-waiting">未就绪</text>
            </view>
          </view>

          <!-- 空席位等待加入槽位 (智能填充保持桌面饱满) -->
          <view 
            v-for="idx in emptySeatsCount" 
            :key="'empty-' + idx"
            class="seat-podium empty-slot"
            @click="showShareModal = true"
          >
            <view class="empty-podium-avatar">
              <text class="empty-plus">+</text>
            </view>
            <text class="empty-slot-text">虚位以待</text>
            <text class="empty-invite-hint">邀请好友</text>
          </view>
        </view>
      </view>

      <!-- 游戏设置板块 (房主控制台) -->
      <view class="game-plate mt-3" v-if="isHost">
        <view class="plate-header">
          <view class="plate-title-group">
            <text class="plate-icon">🎮</text>
            <text class="plate-title">对战模式</text>
          </view>
          <text class="plate-status-tip">房主实时切换</text>
        </view>

        <!-- 阵营艺术选择卡 (横向三格) -->
        <view class="game-mode-deck">
          <view 
            class="mode-banner mode-banner-onuw" 
            :class="{ active: gameType === 'onuw' }" 
            @click="onGameTypeChange({ detail: { value: 'onuw' } })">
            <view class="banner-crest">🐺</view>
            <view class="banner-meta">
              <text class="banner-title">一夜狼人</text>
              <text class="banner-desc">单夜决胜</text>
            </view>
            <view v-if="gameType === 'onuw'" class="banner-active-check">✓</view>
          </view>
          
          <view 
            class="mode-banner mode-banner-avalon" 
            :class="{ active: gameType === 'avalon' }" 
            @click="onGameTypeChange({ detail: { value: 'avalon' } })">
            <view class="banner-crest">⚔️</view>
            <view class="banner-meta">
              <text class="banner-title">阿瓦隆</text>
              <text class="banner-desc">圣杯远征</text>
            </view>
            <view v-if="gameType === 'avalon'" class="banner-active-check">✓</view>
          </view>

          <view 
            class="mode-banner mode-banner-sgs" 
            :class="{ active: gameType === 'sgs' }" 
            @click="onGameTypeChange({ detail: { value: 'sgs' } })">
            <view class="banner-crest">🗡️</view>
            <view class="banner-meta">
              <text class="banner-title">三国杀</text>
              <text class="banner-desc">身份暗战</text>
            </view>
            <view v-if="gameType === 'sgs'" class="banner-active-check">✓</view>
          </view>
        </view>

        <!-- 一夜狼 / 三国杀 配置 -->
        <view v-if="gameType === 'onuw' || gameType === 'sgs'" class="deck-config-section">
          
          <!-- 角色底牌平衡卡 -->
          <view class="board-balance-card" :class="{ 'is-balanced': selectedRoles.length === (gameType === 'sgs' ? players.length : players.length + 3) }">
            <view class="balance-left">
              <text class="balance-title">⚖️ 角色牌库配比</text>
              <text class="balance-subtitle">{{ gameType === 'sgs' ? '需等于玩家人数' : '需等于玩家数 + 3张底牌' }}</text>
            </view>
            <view class="balance-right">
              <view class="balance-badge">
                <text class="balance-current">{{ selectedRoles.length }}</text>
                <text class="balance-divider">/</text>
                <text class="balance-total">{{ gameType === 'sgs' ? players.length : players.length + 3 }}</text>
                <text class="balance-unit">张</text>
              </view>
              <text class="balance-tag">{{ selectedRoles.length === (gameType === 'sgs' ? players.length : players.length + 3) ? '✓ 刚好配平' : '需调整张数' }}</text>
            </view>
          </view>

          <!-- 快速推荐配置横滑条 -->
          <view class="quick-preset-bar">
            <view class="preset-label-row">
              <text class="preset-title">⚡ 经典配板一键注入</text>
            </view>
            <scroll-view scroll-x class="preset-scroll" :show-scrollbar="false">
              <view class="preset-chips-track">
                <view 
                  class="preset-chip" 
                  :class="{ 'is-matching-players': players.length === (n + 2) }"
                  v-for="n in 8" 
                  :key="n" 
                  @click="applyRecommend(n+2)">
                  <text v-if="players.length === (n + 2)" class="chip-fire">🔥</text>
                  <text class="chip-name">{{ n+2 }}人阵容</text>
                  <text v-if="players.length === (n + 2)" class="chip-tag">推荐</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <!-- 角色卡牌图鉴网格 (3列精美小立绘卡牌) -->
          <view class="card-deck-grid">
            <view 
              class="tarot-card"
              :class="{ 
                'is-active': getRoleCount(roleId) > 0,
                'camp-wolf': activeDictionary[roleId]?.camp === '狼人阵营',
                'camp-good': activeDictionary[roleId]?.camp === '好人阵营' || activeDictionary[roleId]?.camp === '村民阵营',
                'camp-tanner': activeDictionary[roleId]?.camp === '独赢阵营'
              }"
              v-for="(name, roleId) in (gameType === 'sgs' ? SGS_ROLE_NAMES : ONUW_ROLE_NAMES)" 
              :key="roleId"
              @click="onCardTap(roleId)">
              
              <!-- 数量火漆印章角标 -->
              <view v-if="getRoleCount(roleId) > 0" class="wax-seal-badge">
                <text class="seal-text">×{{ getRoleCount(roleId) }}</text>
              </view>

              <!-- 卡牌画框与立绘 -->
              <view class="card-portrait-box">
                <view 
                  :class="['tarot-sprite', gameType === 'sgs' ? 'sgs-sprite' : 'onuw-sprite']" 
                  :style="{'background-position': activeDictionary[roleId]?.spritePosition || '0% 0%'}">
                </view>
              </view>

              <!-- 卡牌铭牌 -->
              <view class="card-caption">
                <text class="card-name">{{ name }}</text>
                
                <!-- 微型步进调节器 -->
                <view class="card-micro-stepper" @click.stop="">
                  <view class="stepper-btn btn-minus" :class="{ disabled: getRoleCount(roleId) <= 0 }" @click="changeRoleCount(roleId, -1)">-</view>
                  <text class="stepper-count">{{ getRoleCount(roleId) }}</text>
                  <view class="stepper-btn btn-plus" @click="changeRoleCount(roleId, 1)">+</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 阿瓦隆配置说明 -->
        <view v-else-if="gameType === 'avalon'" class="avalon-config-box">
          <text class="sub-title">阿瓦隆角色分配规则</text>
          <view class="avalon-rules-card">
            <view class="rule-item">
              <text class="rule-icon">🛡️</text>
              <text class="rule-text">正义阵营：梅林、派西维尔、亚瑟忠臣</text>
            </view>
            <view class="rule-item">
              <text class="rule-icon">🗡️</text>
              <text class="rule-text">邪恶阵营：莫甘娜、刺客、奥伯伦、莫德雷德</text>
            </view>
            <text class="rule-hint">系统已锁定黄金规则：根据入场玩家人数（5~10人）自动在开局时均衡发放身份与各轮远征席位。</text>
          </view>
        </view>

        <!-- 房主开始游戏按钮 -->
        <view class="epic-dock-container">
          <button 
            class="epic-start-btn" 
            :class="{ 'is-clickable': allReady }"
            :disabled="!allReady" 
            @click="startGame">
            <view class="btn-sheen-sweep"></view>
            <text class="epic-icon">{{ allReady ? '⚔️' : '⏳' }}</text>
            <text class="epic-label">{{ allReady ? '全员就绪 · 开启对局' : '等待全员准备就绪...' }}</text>
          </button>
        </view>
      </view>

      <!-- 普通玩家控制台 -->
      <view class="game-plate mt-3" v-else>
        <view class="guest-banner">
          <view class="guest-mode-info">
            <text class="guest-mode-hint">当前游玩模式</text>
            <text class="guest-mode-title">{{ gameType === 'onuw' ? '🐺 一夜终极狼人' : gameType === 'avalon' ? '⚔️ 阿瓦隆之战' : '🗡️ 三国杀身份局' }}</text>
          </view>
          <view class="guest-ready-status" :class="{ 'ready-done': myReadyStatus }">
            <text class="status-indicator-dot"></text>
            <text class="status-indicator-text">{{ myReadyStatus ? '你已准备就绪' : '等待就绪' }}</text>
          </view>
        </view>

        <view class="epic-dock-container">
          <button 
            class="epic-ready-btn" 
            :class="{ 'is-ready-active': myReadyStatus }" 
            @click="toggleReady">
            <view class="btn-sheen-sweep"></view>
            <text class="epic-icon">{{ myReadyStatus ? '✕' : '🛡️' }}</text>
            <text class="epic-label">{{ myReadyStatus ? '取消就绪' : '立即就绪' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- ==================== GAME PHASE (游戏进行阶段) ==================== -->
    <template v-else-if="['NIGHT', 'DAY', 'VOTING', 'END', 'PLAYING'].includes(appState)">
      <!-- ==================== END (结算复盘) ==================== -->
      <view v-if="appState === 'END'" class="end-section-container">
        
        <!-- 胜利阵营发光大横幅 -->
        <view class="victory-banner" :class="gameResult?.winner === 'good' ? 'banner-good' : 'banner-evil'">
          <text class="trophy-icon">🏆</text>
          <text class="winner-title">{{ gameResult?.winner === 'good' ? '正义阵营获胜' : (gameResult?.winner === 'evil' ? '邪恶阵营获胜' : gameResult?.winner + ' 获胜') }}</text>
          <text class="winner-summary">{{ gameResult?.summary }}</text>
        </view>

        <!-- 放逐玩家板块 -->
        <view v-if="gameResult?.exiledPlayers?.length > 0" class="glass-section mt-4">
          <text class="section-heading">☠️ 被放逐玩家</text>
          <view class="exiled-tags-row">
            <text class="exiled-tag" v-for="(name, idx) in gameResult.exiledPlayers" :key="idx">{{ name }}</text>
          </view>
        </view>

        <!-- 最终底牌复盘 -->
        <view v-if="gameResult?.finalRoles?.length > 0" class="glass-section mt-4">
          <text class="section-heading">🎭 玩家底牌揭晓</text>
          <view class="final-roles-grid">
            <view class="final-role-card" v-for="p in gameResult.finalRoles" :key="p.nickname">
              <text class="final-player-name">{{ p.nickname }}</text>
              <view class="role-shift-row">
                <text v-if="p.initialRole !== p.currentRole" class="old-role">{{ ROLE_NAMES[p.initialRole] || p.initialRole }}</text>
                <text v-if="p.initialRole !== p.currentRole" class="shift-arrow">➡️</text>
                <text class="new-role">{{ ROLE_NAMES[p.currentRole] || p.currentRole }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 夜间时间线复盘 -->
        <view v-if="gameResult?.timeline?.length > 0" class="glass-section mt-4">
          <text class="section-heading">📜 夜间行动时间线</text>
          <scroll-view scroll-y class="timeline-scroll">
            <view v-for="(log, idx) in gameResult.timeline" :key="idx" class="timeline-item">
              <text class="timeline-dot">•</text>
              <text class="timeline-text">{{ log }}</text>
            </view>
          </scroll-view>
        </view>

        <!-- 返回大厅按钮 -->
        <view class="mt-4 mb-6">
          <button v-if="isHost" class="confirm-btn" @click="forceReturnLobby">返回大厅并开启下一局</button>
          <button v-else class="confirm-btn" @click="appState = 'WAITING'">返回大厅准备下一局</button>
        </view>
      </view>

      <!-- ONUW 游戏视图 -->
      <template v-else-if="gameType === 'onuw'">
        
        <!-- ==================== NIGHT (夜间阶段) ==================== -->
        <view v-if="appState === 'NIGHT'" class="night-container">
          
          <view class="night-header-box">
            <text class="night-moon-title">🌙 夜幕降临</text>
            <view class="action-turn-pill">
              <text class="turn-label">当前行动环节：</text>
              <text class="turn-role-name">{{ ROLE_NAMES[currentNightRole] || '...' }}</text>
            </view>
          </view>

          <!-- 3D 翻转卡牌区 (居中自适应) -->
          <view class="flip-card-wrapper">
            <view class="flipper" :class="{ 'is-flipped': nightPanelOpen }">
              <!-- 卡牌背面 (默认状态) -->
              <view class="front" @click.stop="nightPanelOpen = true">
                <image :src="'/static/cards/back' + randomBackIndex + '.png'" class="card-img-surface" mode="aspectFill" />
                <view class="tap-hint-mask">
                  <text class="tap-hint-text">👆 点击翻开底牌</text>
                </view>
              </view>
              
              <!-- 卡牌正面 -->
              <view class="back role-card-3d">
                <view class="role-sprite-large onuw-sprite" :style="{'background-position': ROLES_DICTIONARY[myInitialRole]?.spritePosition}"></view>
                <view class="card-name-overlay">
                  <text class="overlay-role-name">{{ ROLE_NAMES[myInitialRole] }}</text>
                </view>
              </view>
            </view>

            <!-- 防窥与卡牌信息栏 -->
            <view v-if="nightPanelOpen" class="role-reveal-bar">
              <view class="reveal-meta">
                <text class="reveal-role-title">{{ ROLE_NAMES[myInitialRole] }}</text>
                <text class="reveal-seat-desc">[{{ mySeatNumber }}号] {{ players.find(p => p.sessionId === sessionId)?.nickname || '' }} · 初始底牌</text>
              </view>
              <button class="anti-peep-btn" @click.stop="nightPanelOpen = false">
                <text>🙈 点击收起防窥</text>
              </button>
            </view>
          </view>

          <!-- 夜间行动具体控制面板 -->
          <view v-if="nightPanelOpen" class="night-action-wrapper">
            
            <!-- 属于我的行动回合 -->
            <view v-if="isMyTurn" class="action-panel active-turn">
              <view class="action-panel-header">
                <text class="action-panel-title">⚡ 请执行你的专属技能</text>
              </view>
              
              <!-- 狼人 -->
              <view v-if="myInitialRole === 'werewolf'" class="role-action-content">
                <view v-if="nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0" class="intel-box">
                  <text class="intel-label">你的狼同伴：</text>
                  <view class="mate-badges">
                    <text v-for="w in nightViewData.werewolfMates" :key="w" class="mate-badge">[ {{ w }}号 ]</text>
                  </view>
                </view>
                <view v-else class="lone-wolf-box">
                  <text class="intel-label">你是场上唯一的孤狼，可查看一张中央底牌：</text>
                  <view class="center-cards-row">
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 0 })">查看左侧牌</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 1 })">查看中间牌</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'WEREWOLF_VIEW', centerIndex: 2 })">查看右侧牌</button>
                  </view>
                </view>
              </view>

              <!-- 预言家 -->
              <view v-else-if="myInitialRole === 'seer'" class="role-action-content">
                <view v-if="nightViewData.seenRole" class="intel-box result-highlight">
                  <text class="intel-label">你查看到的玩家底牌是：</text>
                  <text class="highlight-value">{{ ROLE_NAMES[nightViewData.seenRole] }}</text>
                </view>
                <view v-else-if="nightViewData.seenRoles" class="intel-box result-highlight">
                  <text class="intel-label">你查看到的中央底牌是：</text>
                  <text class="highlight-value">{{ ROLE_NAMES[nightViewData.seenRoles[0]] }} 与 {{ ROLE_NAMES[nightViewData.seenRoles[1]] }}</text>
                </view>
                <view v-else>
                  <text class="action-instruction">选择查看一名玩家底牌：</text>
                  <view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择目标玩家', (p) => submitNightAction({ type: 'SEER_PLAYER', targetSeat: p.seatNumber }))">
                    <view class="picker-inner">🔍 点击选择目标玩家</view>
                  </view>
                  
                  <text class="divider-text">— 或者选择查看中央两张底牌 —</text>
                  <view class="center-cards-row">
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [0, 1] })">看 左+中</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [1, 2] })">看 中+右</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'SEER_CENTER', centerIndices: [0, 2] })">看 左+右</button>
                  </view>
                </view>
              </view>

              <!-- 强盗 -->
              <view v-else-if="myInitialRole === 'robber'" class="role-action-content">
                <view v-if="nightViewData.robbedRole" class="intel-box result-highlight">
                  <text class="intel-label">抢夺成功！你的新身份是：</text>
                  <text class="highlight-value">{{ ROLE_NAMES[nightViewData.robbedRole] }}</text>
                </view>
                <view v-else>
                  <text class="action-instruction">选择一名玩家抢夺底牌：</text>
                  <view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择抢夺目标', (p) => submitNightAction({ type: 'ROB_PLAYER', targetSeat: p.seatNumber }))">
                    <view class="picker-inner">🗡️ 点击选择抢夺目标</view>
                  </view>
                </view>
              </view>

              <!-- 捣蛋鬼 -->
              <view v-else-if="myInitialRole === 'troublemaker'" class="role-action-content">
                <view v-if="nightViewData.swapped" class="intel-box result-highlight">
                  <text class="highlight-value">✓ 两名玩家身份已调换成功！</text>
                </view>
                <view v-else>
                  <text class="action-instruction">选择两名其他玩家交换身份：</text>
                  <view class="picker-box" hover-class="action-btn-hover" @click="openPlayerPicker('选择玩家1', (p) => { tmP1 = p })">
                      <view class="picker-inner">玩家 1: {{ tmP1 ? tmP1.displayName : '未选择' }}</view>
                    </view>
                  <view class="picker-box mt-2" hover-class="action-btn-hover" @click="openPlayerPicker('选择玩家2', (p) => { tmP2 = p })">
                      <view class="picker-inner">玩家 2: {{ tmP2 ? tmP2.displayName : '未选择' }}</view>
                    </view>
                  <button class="confirm-btn mt-3" hover-class="confirm-btn-hover" @click="doTroublemaker">确认调换身份</button>
                </view>
              </view>

              <!-- 酒鬼 -->
              <view v-else-if="myInitialRole === 'drunk'" class="role-action-content">
                <view v-if="nightViewData.swapped" class="intel-box result-highlight">
                  <text class="highlight-value">✓ 已盲换中央底牌，天亮请开始表演！</text>
                </view>
                <view v-else>
                  <text class="action-instruction">盲换中央的一张牌：</text>
                  <view class="center-cards-row">
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 0 })">盲换左侧牌</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 1 })">盲换中间牌</button>
                    <button class="action-btn" hover-class="action-btn-hover" @click.stop="submitNightAction({ type: 'DRUNK_SWAP', centerIndex: 2 })">盲换右侧牌</button>
                  </view>
                </view>
              </view>

              <!-- 爪牙 -->
              <view v-else-if="myInitialRole === 'minion'" class="role-action-content">
                <view class="intel-box">
                  <template v-if="nightViewData.werewolves && nightViewData.werewolves.length > 0">
                    <text class="intel-label">场上的狼人是：</text>
                    <view class="mate-badges">
                      <text v-for="w in nightViewData.werewolves" :key="w" class="mate-badge">[ {{ w }}号 ]</text>
                    </view>
                  </template>
                  <text v-else class="intel-label">场上没有狼人！（狼人牌全在中央）</text>
                </view>
              </view>
              
              <!-- 守夜人 -->
              <view v-else-if="myInitialRole === 'mason'" class="role-action-content">
                <view class="intel-box">
                  <template v-if="nightViewData.masonMates && nightViewData.masonMates.length > 0">
                    <text class="intel-label">另一个守夜人同伴是：</text>
                    <view class="mate-badges">
                      <text v-for="m in nightViewData.masonMates" :key="m" class="mate-badge">[ {{ m }}号 ]</text>
                    </view>
                  </template>
                  <text v-else class="intel-label">你是场上唯一的守夜人（同伴在中央底牌）</text>
                </view>
              </view>

              <!-- 失眠者 -->
              <view v-else-if="myInitialRole === 'insomniac'" class="role-action-content">
                <view class="intel-box result-highlight">
                  <text class="intel-label">你被换牌后的最终底牌是：</text>
                  <text class="highlight-value">{{ ROLE_NAMES[nightViewData.currentRole] }}</text>
                </view>
              </view>

              <!-- 确认操作与放弃行动按钮 -->
              <view class="action-footer-btns">
                <view v-if="['werewolf', 'minion', 'mason', 'insomniac'].includes(myInitialRole) || (myInitialRole==='werewolf' && nightViewData.werewolfMates && nightViewData.werewolfMates.length > 0)">
                  <button class="confirm-btn" hover-class="confirm-btn-hover" @click.stop="submitNightAction({ type: 'CONFIRM' })">确认完毕</button>
                </view>
                <view v-else>
                  <button class="pass-btn" hover-class="pass-btn-hover" @click.stop="submitNightAction({ type: 'NONE' })">放弃行动</button>
                </view>
              </view>
            </view>
            
            <!-- 等待他人行动状态 -->
            <view v-else class="action-panel blind-turn">
              <view class="waiting-turn-icon">⏳</view>
              <text class="action-title">夜深人静，请闭眼等待...</text>
              <text class="waiting-sub">轮到你的角色时将发出提示音与震动</text>
            </view>
          </view>
        </view>

        <!-- ==================== DAY (白天讨论) ==================== -->
        <view v-else-if="appState === 'DAY'" class="day-wrapper">
          <view class="day-sun-aura">☀️</view>
          <text class="day-heading">太阳升起 · 自由发言讨论</text>
          <text class="day-sub-desc">请通过线下沟通、盘问逻辑与信息差寻找狼人！</text>
          
          <view class="glass-section mt-4 day-guide-card">
            <text class="guide-tip-title">🗣️ 发言提示</text>
            <text class="guide-tip-text">注意强盗和捣蛋鬼调牌可能导致身份反转。讨论充分后房主可开启投票。</text>
          </view>

          <view class="bottom-action-container" v-if="isHost">
            <button class="confirm-btn danger-btn" @click="forceVote">房主提前开启全员投票</button>
          </view>
        </view>

                <!-- ==================== VOTING (投票阶段) ==================== -->
        <view v-else-if="appState === 'VOTING'" class="voting-wrapper">
          <view class="voting-header">
            <text class="voting-title">🗳️ 全员投票放逐</text>
            <text class="voting-sub">选择你认为最可疑的玩家进行放逐，也可弃权</text>
          </view>
          
          <view v-if="votingCountdown === null && isHost" style="margin-bottom: 30rpx; width: 100%;">
            <button class="confirm-btn" @click="startVotingCountdown" style="width: 100%; border-radius: 12rpx; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: bold; border: none;">▶️ 房主开启投票 (30s倒计时)</button>
          </view>
          <view v-else-if="votingCountdown !== null" style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 40rpx; color: #ef4444; font-weight: 900;">⏳ 距离投票结束还有：{{ votingCountdown }}s</text>
          </view>
          <view v-else style="margin-bottom: 30rpx; text-align: center;">
            <text style="font-size: 30rpx; color: #94a3b8;">等待房主开启投票...</text>
          </view>

          <view class="voting-grid">
            <view 
              class="vote-player-item" 
              v-for="p in sortedPlayers" 
              :key="p.sessionId">
              <view class="vote-player-info">
                <view class="vote-seat-badge">{{ p.seatNumber }}</view>
                <text class="vote-player-name">{{ p.nickname }}</text>
              </view>
              <button 
                class="vote-action-btn" 
                :class="{'voted-active': selectedVote === p.seatNumber}"
                hover-class="action-btn-hover" 
                @click="submitVote(p.seatNumber)"
                :disabled="votingCountdown === null">
                {{ selectedVote === p.seatNumber ? '已投TA' : '投TA' }}
              </button>
            </view>
          </view>

          <view class="bottom-action-container" style="margin-top: 40rpx; width: 100%; position: relative;">
            <button 
              class="abstain-btn" 
              :class="{'abstain-active': selectedVote === -1}"
              @click="submitVote(-1)"
              :disabled="votingCountdown === null">
              🏳️ {{ selectedVote === -1 ? '已选弃权' : '放弃本次投票（弃权）' }}
            </button>
          </view>
        </view>
        </template>

      <!-- SGS 游戏视图 -->
      <template v-else-if="gameType === 'sgs'">
        <view v-if="appState === 'PLAYING'" class="night-container">
          <view class="night-header-box">
            <text class="night-moon-title" style="color: #38bdf8;">🗡️ 三国杀身份确认</text>
          </view>
          
          <view v-if="nightPanelOpen && myInitialRole === 'lord'" class="lord-public-alert">
            <text>👑 您的身份是主公，需向全场公开！</text>
          </view>
          
          <view class="flip-card-wrapper">
            <view class="flipper" :class="{ 'is-flipped': nightPanelOpen }">
              <view class="front" @click.stop="nightPanelOpen = true">
                <view class="sgs-back"></view>
                <view class="tap-hint-mask">
                  <text class="tap-hint-text">👆 点击确认身份</text>
                </view>
              </view>
              
              <view class="back role-card-3d" style="border: none; background: #000; padding: 0;">
                <view class="role-sprite-large sgs-sprite" :style="{'background-position': ROLES_DICTIONARY[myInitialRole]?.spritePosition}"></view>
              </view>
            </view>

            <view v-if="nightPanelOpen" class="role-reveal-bar">
              <button class="anti-peep-btn" @click.stop="nightPanelOpen = false">
                <text>🙈 点击收起防窥</text>
              </button>
            </view>
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
        :gameName="gameType === 'onuw' ? '一夜终极狼人' : gameType === 'avalon' ? '阿瓦隆' : '三国杀'"
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
  import CustomModal from '../../components/CustomModal.vue';
import LoginView from '../../components/LoginView.vue';
import PlayerAvatar from '../../components/PlayerAvatar.vue';

// 角色字典映射 (一夜狼和阿瓦隆彻底分离防止覆盖)

  const SGS_ROLE_NAMES = {
    lord: '主公', loyalist: '忠臣', rebel: '反贼', renegade: '内奸'
  };
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
  const selectedVote = ref(null);
  const votingCountdown = ref(null);

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
  const globalModal = ref(null);

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
      votingCountdown.value = null;
      selectedVote.value = null;
    avalonState.value.phase = 'end';
    gameResult.value = { winner: data.winner, summary: data.reason, exiledPlayers: [], finalRoles: data.finalRoles || [], timeline: [] };
  });

  
  socket.on('game_started', (data) => {
    appState.value = 'NIGHT';
    myInitialRole.value = data.initialRole;
    nightPanelOpen.value = false;
    randomBackIndex.value = Math.floor(Math.random() * 5) + 1;
    
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

  socket.on('voting_countdown', (timeLeft) => {
      votingCountdown.value = timeLeft;
    });
    
    socket.on('game_ended', (result) => {
    appState.value = 'END';
    gameResult.value = result;
    playSound('end');
  });

  socket.on('game_aborted', (data) => {
    globalModal.value.show({ title: '游戏已中断', content: data.reason, type: 'alert' });
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
      uni.showToast({ title: `已应用 ${n} 人局智能推荐`, icon: 'success' });
    } else if (gameType.value === 'onuw' && RECOMMENDED_BOARDS[n]) {
      selectedRoles.value = [...RECOMMENDED_BOARDS[n]];
      socket.emit('update_settings', { sessionId: sessionId.value, roomId: roomId.value, settings: { selectedRoles: selectedRoles.value } });
      uni.showToast({ title: `已应用 ${n} 人局智能推荐`, icon: 'success' });
    }
  };
const getRoleCount = (roleId) => {
  return selectedRoles.value.filter(r => r === roleId).length;
};

const onCardTap = (roleId) => {
  if (getRoleCount(roleId) === 0) {
    changeRoleCount(roleId, 1);
  }
};

const emptySeatsCount = computed(() => {
  const targetTotal = players.value.length < 6 ? 6 : (players.value.length < 8 ? 8 : 10);
  return Math.max(0, targetTotal - players.value.length);
});

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
    } else if (gameType.value === 'sgs') {
      const targetCount = players.value.length;
      if (selectedRoles.value.length !== targetCount) {
        return uni.showToast({ title: `牌数必须为 ${targetCount} 张！(当前 ${selectedRoles.value.length} 张)`, icon: 'none' });
      }
  }
  socket.emit('start_game', { sessionId: sessionId.value, roomId: roomId.value });
};

const leaveRoom = () => {
  globalModal.value.show({
      title: '退出房间',
      content: '中途退出将导致当前游戏异常，确认退出吗?',
      type: 'confirm'
    }).then(res => {
      if (res.confirm) {

        socket.emit('leave_room', { sessionId: sessionId.value, roomId: roomId.value });
        appState.value = 'LOBBY';
          votingCountdown.value = null;
          selectedVote.value = null;
        roomId.value = '';
        uni.removeStorageSync('werewolf_roomId');
      }
    });
};

const forceReturnLobby = () => {
  globalModal.value.show({
      title: '强制重开',
      content: '确认强制结束当前对局，带领全员返回大厅吗?',
      type: 'confirm'
    }).then(res => {
      if (res.confirm) {

        socket.emit('force_return_lobby', { sessionId: sessionId.value, roomId: roomId.value });
      }
    });
};

// --- 夜间行动具体逻辑 ---


  const openPlayerPicker = (title, onSelectCb) => {
    const opts = otherPlayers.value.map(p => ({ label: `[${p.seatNumber}号] ${p.nickname}`, value: p }));
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
        globalModal.value.show({ title: '查看结果', content: `你看到的底牌是：${ROLE_NAMES[res.seenRole]}`, type: 'alert' });
      } else if (res.seenRoles) {
        globalModal.value.show({ title: '查看结果', content: `你看到中央的两张牌是：${ROLE_NAMES[res.seenRoles[0]]} 和 ${ROLE_NAMES[res.seenRoles[1]]}`, type: 'alert' });
      } else if (res.newRole) {
        globalModal.value.show({ title: '抢夺成功', content: `你换回的新底牌是：${ROLE_NAMES[res.newRole] || '未知'}`, type: 'alert' });
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

const startVotingCountdown = () => {
    socket.emit('start_voting_countdown', { sessionId: sessionId.value, roomId: roomId.value });
  };

  const submitVote = (targetseatNumber) => {
    if (votingCountdown.value === null) {
      return uni.showToast({ title: '投票尚未开始', icon: 'none' });
    }
    selectedVote.value = targetseatNumber;
    socket.emit('submit_vote', { 
      sessionId: sessionId.value, 
      roomId: roomId.value, 
      voteTarget: targetseatNumber 
    });
  };
</script>

<style scoped>
/* 全局页面容器：暗夜魔幻桌游聚会氛围 */
.container {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(circle at 50% 10%, #172554 0%, #090d16 45%, #050811 100%);
  padding: calc(16rpx + var(--sat, 0px)) 24rpx calc(48rpx + var(--sab, 0px)) 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ================== 一体化游戏顶栏：酒馆房间铭牌与功能区 ================== */
.app-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800rpx;
  padding: 10rpx 0 20rpx 0;
  z-index: 50;
  box-sizing: border-box;
}

.topbar-left, .topbar-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.topbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 酒馆金饰房间铭牌 */
.tavern-room-crest {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border: 1.5px solid rgba(245, 158, 11, 0.45);
  border-radius: 999rpx;
  padding: 8rpx 18rpx 8rpx 22rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 215, 0, 0.25);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.tavern-room-crest:active {
  transform: scale(0.95);
}

.crest-frame {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.crest-label {
  font-size: 20rpx;
  color: #fbbf24;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.crest-id {
  font-size: 32rpx;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 4rpx;
  text-shadow: 0 0 16rpx rgba(245, 158, 11, 0.4);
}

.crest-invite-chip {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 999rpx;
  padding: 2rpx 12rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-left: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.4);
}

.invite-icon { font-size: 18rpx; }
.invite-title { font-size: 18rpx; color: #1e1b4b; font-weight: 900; }

.seat-badge-chip {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(30, 58, 138, 0.4));
  border: 1.5px solid rgba(96, 165, 250, 0.5);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  box-shadow: 0 0 16rpx rgba(37, 99, 235, 0.35);
}

.seat-badge-text {
  font-size: 24rpx;
  font-weight: 800;
  color: #f8fafc;
}

.topbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.topbar-btn:active {
  transform: scale(0.92);
}

.icon-btn {
  width: 66rpx;
  height: 66rpx;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
}

.btn-emoji {
  font-size: 30rpx;
}

.action-pill {
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
}

.action-pill .pill-text {
  font-size: 24rpx;
  font-weight: 800;
}

.danger-pill {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.45);
}
.danger-pill .pill-text { color: #f87171; }

.ghost-pill {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.3);
}
.ghost-pill .pill-text { color: #cbd5e1; }

/* ================== 游戏级板块容器 (Game Plate) ================== */
.game-plate {
  background: rgba(15, 21, 35, 0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1.5px solid rgba(245, 158, 11, 0.18);
  border-radius: 28rpx;
  padding: 24rpx 20rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.plate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.plate-title-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.plate-icon {
  font-size: 30rpx;
}

.plate-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 1rpx;
}

.player-count-pill {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 999rpx;
  padding: 2rpx 14rpx;
  display: flex;
  align-items: baseline;
  margin-left: 6rpx;
}

.count-num {
  font-size: 24rpx;
  font-weight: 900;
  color: #fbbf24;
}

.count-max {
  font-size: 20rpx;
  font-weight: 600;
  color: #94a3b8;
}

.plate-status-tip {
  font-size: 20rpx;
  color: #94a3b8;
}

.mt-2 { margin-top: 16rpx; }
.mt-3 { margin-top: 24rpx; }
.mt-4 { margin-top: 32rpx; }
.mb-6 { margin-bottom: 48rpx; }

/* ================== WAITING (准备大厅) ================== */
.waiting-wrapper {
  width: 100%;
  max-width: 800rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-bottom: 30rpx;
}

/* 席位围桌网格 (5列双排自适应席位台) */
.table-seats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx 8rpx;
  padding: 8rpx 0;
}

.seat-podium {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.2s ease;
}

.host-floating-crown {
  position: absolute;
  top: -18rpx;
  font-size: 28rpx;
  z-index: 10;
  animation: crownFloat 2.5s ease-in-out infinite alternate;
}

@keyframes crownFloat {
  0% { transform: translateY(0); }
  100% { transform: translateY(-4rpx); }
}

.podium-avatar-wrapper {
  position: relative;
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-aura-ring {
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  right: -4rpx;
  bottom: -4rpx;
  border-radius: 50%;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.seat-podium.is-ready .avatar-aura-ring {
  border-color: #10b981;
  box-shadow: 0 0 16rpx rgba(16, 185, 129, 0.7);
  animation: auraPulse 2s infinite ease-in-out;
}

.seat-podium.is-me .avatar-aura-ring {
  border-color: #ffd700;
  box-shadow: 0 0 16rpx rgba(255, 215, 0, 0.6);
}

@keyframes auraPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}

.podium-avatar {
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2rpx solid rgba(255, 215, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.5), inset 0 2rpx 0 rgba(255, 255, 255, 0.15);
}

.avatar-char {
  font-size: 34rpx;
  color: #f8fafc;
  font-weight: 900;
}

.seat-index-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #1e3a8a;
  color: #93c5fd;
  font-size: 18rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #0f172a;
}

.podium-name-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  margin-top: 8rpx;
  width: 100%;
}

.podium-nickname {
  font-size: 20rpx;
  color: #cbd5e1;
  font-weight: 700;
  max-width: 104rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.self-jewel-tag {
  background: linear-gradient(135deg, #ffd700, #f59e0b);
  color: #451a03;
  font-size: 16rpx;
  font-weight: 900;
  padding: 0 6rpx;
  border-radius: 6rpx;
  line-height: 24rpx;
}

.podium-status {
  margin-top: 4rpx;
}

.badge-host {
  color: #fbbf24;
  font-size: 18rpx;
  font-weight: 800;
}

.badge-ready {
  color: #34d399;
  font-size: 18rpx;
  font-weight: 800;
}

.badge-waiting {
  color: #64748b;
  font-size: 18rpx;
  font-weight: 600;
}

.badge-offline {
  color: #f87171;
  font-size: 18rpx;
  font-weight: 600;
}

/* 空席位槽位 */
.seat-podium.empty-slot {
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.seat-podium.empty-slot:active {
  opacity: 0.85;
  transform: scale(0.95);
}

.empty-podium-avatar {
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-plus {
  font-size: 38rpx;
  color: #64748b;
  font-weight: 300;
}

.empty-slot-text {
  font-size: 18rpx;
  color: #64748b;
  margin-top: 8rpx;
}

.empty-invite-hint {
  font-size: 16rpx;
  color: #3b82f6;
  font-weight: 700;
  margin-top: 2rpx;
}

/* ================== 阵营艺术选择卡 (Game Mode Deck) ================== */
.game-mode-deck {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.mode-banner {
  flex: 1;
  border-radius: 20rpx;
  padding: 20rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: rgba(10, 15, 26, 0.7);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
  cursor: pointer;
}

.mode-banner:active {
  transform: scale(0.97);
}

.banner-crest {
  font-size: 40rpx;
  margin-bottom: 6rpx;
}

.banner-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-title {
  font-size: 24rpx;
  font-weight: 800;
  color: #cbd5e1;
  text-align: center;
}

.banner-desc {
  font-size: 18rpx;
  color: #64748b;
  margin-top: 2rpx;
  text-align: center;
}

.banner-active-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: #ffd700;
  color: #000;
  font-size: 16rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-banner.active {
  border-color: rgba(245, 158, 11, 0.85);
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 215, 0, 0.4);
}

.mode-banner.active .banner-title {
  color: #ffd700;
  text-shadow: 0 0 12rpx rgba(245, 158, 11, 0.5);
}

/* ================== 卡牌集换台配置 (Deck Config) ================== */
.deck-config-section {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 20rpx;
}

/* 角色底牌平衡卡 */
.board-balance-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 15, 26, 0.65);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 18rpx 24rpx;
  transition: all 0.3s ease;
}

.board-balance-card.is-balanced {
  border-color: rgba(16, 185, 129, 0.55);
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.12), rgba(10, 15, 26, 0.65));
}

.balance-left {
  display: flex;
  flex-direction: column;
}

.balance-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #f8fafc;
}

.balance-subtitle {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 4rpx;
}

.balance-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance-badge {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.balance-current {
  font-size: 38rpx;
  font-weight: 900;
  color: #f8fafc;
}

.board-balance-card.is-balanced .balance-current {
  color: #34d399;
}

.balance-divider {
  font-size: 24rpx;
  color: #64748b;
  margin: 0 4rpx;
}

.balance-total {
  font-size: 28rpx;
  font-weight: 700;
  color: #94a3b8;
}

.balance-unit {
  font-size: 20rpx;
  color: #94a3b8;
}

.balance-tag {
  font-size: 20rpx;
  font-weight: 800;
  color: #f87171;
  margin-top: 2rpx;
}

.board-balance-card.is-balanced .balance-tag {
  color: #34d399;
}

/* 快速推荐横滑条 */
.quick-preset-bar {
  background: rgba(10, 15, 26, 0.5);
  border-radius: 18rpx;
  padding: 16rpx 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preset-label-row {
  margin-bottom: 12rpx;
}

.preset-title {
  font-size: 22rpx;
  color: #94a3b8;
  font-weight: 700;
}

.preset-scroll {
  width: 100%;
  white-space: nowrap;
}

.preset-chips-track {
  display: inline-flex;
  gap: 12rpx;
  padding: 4rpx 2rpx;
}

.preset-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-chip:active {
  transform: scale(0.95);
}

.chip-name {
  font-size: 22rpx;
  color: #f1f5f9;
  font-weight: 700;
}

.preset-chip.is-matching-players {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(217, 119, 6, 0.2));
  border-color: rgba(245, 158, 11, 0.85);
  box-shadow: 0 0 16rpx rgba(245, 158, 11, 0.35);
}

.preset-chip.is-matching-players .chip-name {
  color: #ffd700;
}

.chip-fire { font-size: 20rpx; }

.chip-tag {
  background: #f59e0b;
  color: #000;
  font-size: 16rpx;
  font-weight: 900;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  margin-left: 2rpx;
}

/* ================== 集换式角色卡牌图鉴网格 ================== */
.card-deck-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.tarot-card {
  border-radius: 18rpx;
  padding: 16rpx 10rpx 14rpx 10rpx;
  background: rgba(10, 15, 26, 0.7);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  filter: grayscale(0.4);
  opacity: 0.78;
}

.tarot-card:active {
  transform: scale(0.96);
}

.tarot-card.is-active {
  filter: none;
  opacity: 1;
  border-color: rgba(245, 158, 11, 0.75);
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 215, 0, 0.35);
}

.wax-seal-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #e11d48, #be123c);
  border: 2rpx solid #ffd700;
  color: #fff;
  font-size: 20rpx;
  font-weight: 900;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  box-shadow: 0 4rpx 12rpx rgba(225, 29, 72, 0.5);
  z-index: 10;
  animation: sealPop 0.3s ease;
}

@keyframes sealPop {
  0% { transform: scale(0.5); }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.card-portrait-box {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(255, 215, 0, 0.3);
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.tarot-sprite {
  width: 96rpx;
  height: 96rpx;
  background-size: 400% 400%;
}

.card-caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.card-name {
  font-size: 24rpx;
  font-weight: 800;
  color: #f1f5f9;
  text-align: center;
  margin-bottom: 8rpx;
}

.tarot-card.is-active .card-name {
  color: #ffd700;
}

.card-micro-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 100%;
}

.stepper-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 900;
  color: #cbd5e1;
  transition: all 0.2s ease;
}

.stepper-btn:active {
  background: rgba(245, 158, 11, 0.4);
  transform: scale(0.9);
}

.stepper-btn.disabled {
  opacity: 0.25;
  pointer-events: none;
}

.stepper-count {
  font-size: 24rpx;
  font-weight: 800;
  color: #ffd700;
  width: 30rpx;
  text-align: center;
}

/* 阿瓦隆说明卡 */
.avalon-rules-card {
  background: rgba(10, 15, 26, 0.65);
  border-radius: 18rpx;
  padding: 20rpx;
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.rule-icon { font-size: 28rpx; }
.rule-text { font-size: 24rpx; color: #cbd5e1; font-weight: 600; }
.rule-hint { font-size: 22rpx; color: #94a3b8; line-height: 1.5; margin-top: 8rpx; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10rpx; }

/* ================== 传奇级游戏主操作栏 (Epic Action Dock) ================== */
.epic-dock-container {
  width: 100%;
  margin-top: 28rpx;
}

.epic-start-btn, .epic-ready-btn {
  width: 100%;
  height: 104rpx;
  border-radius: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  position: relative;
  overflow: hidden;
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.epic-start-btn::after, .epic-ready-btn::after { border: none; }

.epic-start-btn {
  background: rgba(100, 116, 139, 0.25);
  color: #64748b;
  box-shadow: none;
}

.epic-start-btn.is-clickable {
  background: linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%);
  color: #451a03;
  box-shadow: 0 12rpx 36rpx rgba(245, 158, 11, 0.45), inset 0 2rpx 0 rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.epic-start-btn.is-clickable:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 6rpx 18rpx rgba(245, 158, 11, 0.35);
}

.epic-ready-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 12rpx 36rpx rgba(37, 99, 235, 0.45), inset 0 2rpx 0 rgba(255, 255, 255, 0.4);
  cursor: pointer;
}

.epic-ready-btn:active {
  transform: translateY(2rpx) scale(0.98);
}

.epic-ready-btn.is-ready-active {
  background: rgba(239, 68, 68, 0.15);
  border: 2rpx solid rgba(239, 68, 68, 0.55);
  color: #f87171;
  box-shadow: none;
}

.epic-icon { font-size: 34rpx; }
.epic-label { font-size: 32rpx; font-weight: 900; letter-spacing: 1rpx; }

/* 扫光微动效 */
.btn-sheen-sweep {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  animation: sheenSweep 3.2s infinite ease-in-out;
  pointer-events: none;
}

@keyframes sheenSweep {
  0% { left: -100%; }
  35%, 100% { left: 200%; }
}

/* 普通玩家提示横幅 */
.guest-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 15, 26, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
}

.guest-mode-info {
  display: flex;
  flex-direction: column;
}

.guest-mode-hint { font-size: 20rpx; color: #94a3b8; }
.guest-mode-title { font-size: 28rpx; color: #f8fafc; font-weight: 800; margin-top: 4rpx; }

.guest-ready-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(100, 116, 139, 0.15);
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.status-indicator-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #64748b;
}

.status-indicator-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #94a3b8;
}

.guest-ready-status.ready-done {
  background: rgba(16, 185, 129, 0.2);
}

.guest-ready-status.ready-done .status-indicator-dot {
  background: #10b981;
  box-shadow: 0 0 10rpx #10b981;
}

.guest-ready-status.ready-done .status-indicator-text {
  color: #34d399;
}

/* ================== NIGHT (夜间阶段) ================== */
.night-container {
  width: 100%;
  max-width: 760rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.night-header-box {
  text-align: center;
  margin-bottom: 30rpx;
}

.night-moon-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #f8fafc;
  display: block;
  letter-spacing: 2rpx;
  text-shadow: 0 0 30rpx rgba(96, 165, 250, 0.6);
}

.action-turn-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  margin-top: 14rpx;
}

.turn-label { font-size: 24rpx; color: #94a3b8; }
.turn-role-name { font-size: 26rpx; color: #38bdf8; font-weight: 800; }

/* 3D 翻转卡牌 */
.flip-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 1000px;
  width: 100%;
}

.flipper {
  width: 320rpx;
  height: 448rpx;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-style: preserve-3d;
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
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.6);
}

.front {
  z-index: 2;
  transform: rotateY(0deg);
  cursor: pointer;
}

.card-img-surface {
  width: 100%;
  height: 100%;
  display: block;
}

.tap-hint-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  padding: 30rpx 0 20rpx 0;
  text-align: center;
}

.tap-hint-text {
  font-size: 24rpx;
  color: #f8fafc;
  font-weight: 700;
}

.back {
  transform: rotateY(180deg);
}

.role-card-3d {
  width: 100%;
  height: 100%;
  background: #0f172a;
  border: 4rpx solid #38bdf8;
  box-shadow: inset 0 0 30rpx rgba(0,0,0,0.6), 0 0 40rpx rgba(56, 189, 248, 0.4);
  position: relative;
  box-sizing: border-box;
}

.role-sprite-large {
  width: 100%;
  height: 100%;
}

.card-name-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  background: linear-gradient(transparent, rgba(0,0,0,0.9) 60%);
  padding: 40rpx 0 16rpx 0;
}

.overlay-role-name {
  font-size: 42rpx;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4rpx;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.9);
}

.role-reveal-bar {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  width: 100%;
}

.reveal-meta {
  text-align: center;
}

.reveal-role-title {
  font-size: 44rpx;
  font-weight: 900;
  color: #f8fafc;
  display: block;
}

.reveal-seat-desc {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 6rpx;
  display: block;
}

.anti-peep-btn {
  background: rgba(100, 116, 139, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  font-size: 26rpx;
  font-weight: 700;
  border-radius: 999rpx;
  padding: 12rpx 36rpx;
  transition: all 0.2s ease;
}

.anti-peep-btn:active {
  background: rgba(100, 116, 139, 0.4);
  transform: scale(0.95);
}

/* 夜间操作控制面板 */
.night-action-wrapper {
  width: 100%;
  margin-top: 30rpx;
}

.action-panel {
  width: 100%;
  border-radius: 28rpx;
  padding: 32rpx 24rpx;
  box-sizing: border-box;
}

.active-turn {
  background: rgba(18, 24, 38, 0.85);
  backdrop-filter: blur(24px);
  border: 1.5px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.6), 0 0 30rpx rgba(56, 189, 248, 0.15);
}

.blind-turn {
  background: rgba(15, 23, 42, 0.6);
  border: 1.5px dashed rgba(255, 255, 255, 0.15);
  text-align: center;
  padding: 48rpx 24rpx;
}

.waiting-turn-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  animation: pulse 2s infinite;
}

.action-panel-header {
  margin-bottom: 24rpx;
  text-align: center;
}

.action-panel-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 1rpx;
}

.waiting-sub {
  font-size: 24rpx;
  color: #64748b;
  margin-top: 10rpx;
  display: block;
}

.role-action-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.intel-box {
  background: rgba(10, 15, 26, 0.7);
  border-radius: 18rpx;
  padding: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.intel-label {
  font-size: 26rpx;
  color: #cbd5e1;
  display: block;
  margin-bottom: 12rpx;
}

.mate-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mate-badge {
  background: rgba(220, 38, 38, 0.25);
  border: 1px solid rgba(220, 38, 38, 0.5);
  color: #f87171;
  font-size: 26rpx;
  font-weight: 800;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
}

.result-highlight {
  border-color: rgba(56, 189, 248, 0.4);
}

.highlight-value {
  font-size: 36rpx;
  font-weight: 900;
  color: #38bdf8;
}

.center-cards-row {
  display: flex;
  gap: 14rpx;
  margin-top: 14rpx;
}

.action-btn {
  flex: 1;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  font-size: 26rpx;
  font-weight: 700;
  border-radius: 16rpx;
  padding: 16rpx 0;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.action-btn::after { border: none; }
.action-btn-hover {
  transform: scale(0.96);
  background: #2563eb;
}

.action-instruction {
  font-size: 26rpx;
  color: #cbd5e1;
  font-weight: 600;
  display: block;
}

.divider-text {
  font-size: 22rpx;
  color: #64748b;
  text-align: center;
  display: block;
  margin: 16rpx 0;
}

.picker-box {
  background: rgba(10, 15, 26, 0.8);
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-top: 12rpx;
}

.picker-inner {
  font-size: 28rpx;
  color: #f8fafc;
  font-weight: 600;
  text-align: center;
}

.action-footer-btns {
  margin-top: 30rpx;
  width: 100%;
}

.confirm-btn {
  width: 100%;
  height: 92rpx;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.4);
  border: none;
  transition: all 0.2s ease;
}

.confirm-btn::after { border: none; }
.confirm-btn:active { transform: scale(0.98); }

.pass-btn {
  width: 100%;
  height: 92rpx;
  background: rgba(239, 68, 68, 0.15);
  border: 1.5px solid rgba(239, 68, 68, 0.5);
  color: #f87171;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pass-btn::after { border: none; }
.pass-btn:active { transform: scale(0.98); background: rgba(239, 68, 68, 0.25); }

/* ================== DAY (白天自由讨论) ================== */
.day-wrapper {
  width: 100%;
  max-width: 760rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40rpx 0;
}

.day-sun-aura {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  filter: drop-shadow(0 0 30rpx #f59e0b);
  animation: pulse 3s infinite ease-in-out;
}

.day-heading {
  font-size: 42rpx;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: 2rpx;
}

.day-sub-desc {
  font-size: 26rpx;
  color: #94a3b8;
  margin-top: 12rpx;
}

.day-guide-card {
  text-align: left;
  margin-top: 40rpx;
}

.guide-tip-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #f59e0b;
  display: block;
  margin-bottom: 8rpx;
}

.guide-tip-text {
  font-size: 24rpx;
  color: #cbd5e1;
  line-height: 1.6;
}

.danger-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.4) !important;
}

/* ================== VOTING (投票阶段) ================== */
.voting-wrapper {
  width: 100%;
  max-width: 760rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.voting-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.voting-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #f8fafc;
  display: block;
}

.voting-sub {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
}

.voting-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.vote-player-item {
  background: rgba(18, 24, 38, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 18rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-player-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.vote-seat-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 26rpx;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vote-player-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #f8fafc;
}

.vote-action-btn {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 800;
  border-radius: 14rpx;
  padding: 10rpx 28rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.4);
  margin: 0; 
}
.voted-active {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.4) !important;
}
.abstain-active {
  background: rgba(16, 185, 129, 0.3) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
}

.vote-action-btn::after { border: none; }
.vote-action-btn:active { transform: scale(0.95); }

.abstain-btn {
  width: 100%;
  height: 88rpx;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.abstain-btn::after { border: none; }
.abstain-btn:active { background: rgba(100, 116, 139, 0.35); transform: scale(0.98); }

/* ================== END (复盘结算) ================== */
.end-section-container {
  width: 100%;
  max-width: 760rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.victory-banner {
  border-radius: 28rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.6);
}

.banner-good {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(15, 23, 42, 0.9));
  border: 2px solid #38bdf8;
  box-shadow: 0 0 40rpx rgba(56, 189, 248, 0.3);
}

.banner-evil {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.4), rgba(15, 23, 42, 0.9));
  border: 2px solid #f87171;
  box-shadow: 0 0 40rpx rgba(248, 113, 113, 0.3);
}

.trophy-icon { font-size: 80rpx; margin-bottom: 12rpx; }
.winner-title { font-size: 48rpx; font-weight: 900; color: #f8fafc; letter-spacing: 2rpx; }
.winner-summary { font-size: 26rpx; color: #cbd5e1; margin-top: 10rpx; }

.exiled-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}

.exiled-tag {
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: #f87171;
  font-size: 26rpx;
  font-weight: 700;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
}

.final-roles-grid {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 16rpx;
}

.final-role-card {
  background: rgba(10, 15, 26, 0.6);
  border-radius: 14rpx;
  padding: 14rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.final-player-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #f8fafc;
}

.role-shift-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.old-role {
  font-size: 24rpx;
  color: #64748b;
  text-decoration: line-through;
}

.shift-arrow { font-size: 22rpx; }

.new-role {
  font-size: 28rpx;
  color: #fbbf24;
  font-weight: 800;
}

.timeline-scroll {
  max-height: 360rpx;
  background: rgba(10, 15, 26, 0.6);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-top: 14rpx;
  box-sizing: border-box;
}

.timeline-item {
  display: flex;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.timeline-dot { color: #38bdf8; font-weight: bold; }
.timeline-text { font-size: 24rpx; color: #cbd5e1; line-height: 1.5; }

.secondary-btn {
  background: rgba(100, 116, 139, 0.3) !important;
  color: #f8fafc !important;
}

/* 三国杀特殊公开标识 */
.lord-public-alert {
  background: rgba(245, 158, 11, 0.2);
  border: 2px solid #f59e0b;
  border-radius: 16rpx;
  padding: 12rpx 24rpx;
  color: #fbbf24;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 24rpx;
  text-align: center;
  animation: pulse 2s infinite;
}

/* ================== 角色图鉴弹窗 (抽屉风格) ================== */
.guide-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.guide-panel {
  background: #0f172a;
  border-radius: 36rpx 36rpx 0 0;
  width: 100%;
  max-width: 800rpx;
  max-height: 82vh;
  max-height: 82dvh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-sizing: border-box;
  padding-bottom: calc(20rpx + var(--sab, 0px));
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 36rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.guide-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #f8fafc;
}

.guide-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 26rpx;
}

.my-role-container {
  padding: 20rpx 28rpx 0 28rpx;
  flex-shrink: 0;
  box-sizing: border-box;
}

.role-card {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.my-role {
  background: rgba(30, 58, 138, 0.25);
  border: 2px solid #38bdf8;
  box-shadow: 0 0 24rpx rgba(56, 189, 248, 0.25);
}

.role-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.role-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.role-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #f8fafc;
}

.role-camp {
  font-size: 22rpx;
  font-weight: 600;
}

.my-role-badge {
  background: #38bdf8;
  color: #0f172a;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 800;
}

.role-desc {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.5;
  display: block;
}

.role-tip {
  background: rgba(56, 189, 248, 0.1);
  border-left: 3px solid #38bdf8;
  padding: 14rpx;
  border-radius: 8rpx;
  margin-top: 12rpx;
}

.tip-label {
  font-size: 22rpx;
  color: #38bdf8;
  font-weight: 700;
  display: block;
  margin-bottom: 4rpx;
}

.tip-content {
  font-size: 22rpx;
  color: #e2e8f0;
  line-height: 1.5;
  display: block;
}

.guide-content {
  flex: 1;
  padding: 16rpx 28rpx;
  overflow-y: auto;
  min-height: 0;
  box-sizing: border-box;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 16rpx;
  display: block;
}

/* ================== 雪碧图通用样式 ================== */
.role-sprite {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.onuw-sprite {
  background-image: url('/static/roles-sprite.jpg');
  background-size: 400% 400%;
}

.avalon-sprite {
  background-image: url('/static/avalon-sprite.jpg');
  background-size: 448.72% 386.72%;
}

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
}

/* ================== 断网重连遮罩 ================== */
.disconnect-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.disconnect-panel {
  background: #1e293b;
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 50rpx 40rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.6);
  animation: pulse 2s infinite;
}

.disconnect-icon { font-size: 72rpx; }
.disconnect-title { font-size: 32rpx; font-weight: 800; color: #f87171; margin-top: 16rpx; }
.disconnect-sub { font-size: 24rpx; color: #94a3b8; margin-top: 8rpx; }

/* 关键帧动画 */
@keyframes pulse {
  0% { transform: scale(0.96); opacity: 0.85; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(0.96); opacity: 0.85; }
}

/* Vue Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
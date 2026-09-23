const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/AvalonGameView.vue', 'utf8');

// Add showRoleModal ref
if (!code.includes('const showRoleModal = ref(false);')) {
  code = code.replace(/import \{ ref, computed, watch \} from 'vue';/, "import { ref, computed, watch } from 'vue';\n  const showRoleModal = ref(false);");
}

// Modify header
code = code.replace(/<text class="phase-badge">\{\{ getPhaseName\(avalonState\.phase\) \}\}<\/text>/,
  `<view class="header-right-actions">
        <view class="view-role-btn" v-if="avalonState.role" @click="showRoleModal = true">
          <text class="eye-icon">👁️</text>
          <text>底牌</text>
        </view>
        <text class="phase-badge">{{ getPhaseName(avalonState.phase) }}</text>
      </view>`);

// Add modal at the end of template
const modalHtml = `
    <!-- 随时查看身份弹窗 -->
    <view v-if="showRoleModal" class="avalon-modal-mask" @click="showRoleModal = false">
      <view class="avalon-modal-content" @click.stop>
        <view class="avalon-modal-header">
          <text class="avalon-modal-title">你的底牌</text>
        </view>
        <view class="avalon-modal-body">
          <view class="role-card-3d" :class="isGoodRole ? 'glow-good' : 'glow-evil'" style="margin: 0 auto; transform: scale(1.1);">
            <view class="role-sprite-large avalon-sprite" :style="{'background-position': AVALON_ROLES_DICTIONARY[avalonState.role]?.spritePosition}"></view>
            <view class="card-name-overlay">
              <text class="card-overlay-title">{{ getRoleName(avalonState.role) }}</text>
            </view>
          </view>
        </view>
        <view class="avalon-modal-footer">
          <button class="avalon-modal-btn confirm-btn" hover-class="confirm-btn-hover" @click="showRoleModal = false">收起底牌</button>
        </view>
      </view>
    </view>
  </view>
</template>`;

code = code.replace(/<\/view>\s*<\/template>/, modalHtml);

// Add CSS
const cssToAdd = `
/* 查看底牌按钮 */
.header-right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.view-role-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #38bdf8;
  font-weight: 600;
  box-shadow: 0 0 10rpx rgba(56, 189, 248, 0.2);
  transition: all 0.2s;
}
.view-role-btn:active {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(0.95);
}

/* 阿瓦隆专属弹窗 */
.avalon-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}
.avalon-modal-content {
  width: 600rpx;
  background: #1E293B;
  border-radius: 24rpx;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 30rpx rgba(59, 130, 246, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.avalon-modal-header {
  padding: 40rpx 40rpx 10rpx;
  text-align: center;
}
.avalon-modal-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 2rpx;
}
.avalon-modal-body {
  padding: 40rpx;
  display: flex;
  justify-content: center;
}
.avalon-modal-footer {
  padding: 0 40rpx 40rpx;
}
.avalon-modal-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  border: none;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.4);
}
.avalon-modal-btn::after { border: none; }
.confirm-btn-hover {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(37, 99, 235, 0.6);
}
`;

code = code.replace(/<style scoped>/, '<style scoped>\n' + cssToAdd);

fs.writeFileSync('frontend/src/components/AvalonGameView.vue', code, 'utf8');

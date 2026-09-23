const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Add action-btn class to all <button size="mini" ...> inside center-cards
code = code.replace(/<button size="mini"/g, '<button class="action-btn" hover-class="action-btn-hover" size="mini"');

// 2. Add confirm-btn class to '确认完毕', '放弃行动', and '确认交换' buttons
code = code.replace(/<button class="btn" type="default" @click\.stop="submitNightAction\(\{\s*type:\s*'CONFIRM'\s*\}\)">确认完毕<\/button>/g, '<button class="confirm-btn" hover-class="confirm-btn-hover" @click.stop="submitNightAction({ type: \'CONFIRM\' })">确认完毕</button>');

code = code.replace(/<button class="btn" type="default" @click\.stop="submitNightAction\(\{\s*type:\s*'NONE'\s*\}\)">放弃行动<\/button>/g, '<button class="confirm-btn" hover-class="confirm-btn-hover" style="background: linear-gradient(135deg, #e11d48, #be123c) !important; box-shadow: 0 8rpx 20rpx rgba(225, 29, 72, 0.4), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3) !important;" @click.stop="submitNightAction({ type: \'NONE\' })">放弃行动</button>');

code = code.replace(/<button class="btn mt" type="primary" size="mini" @click="confirmTroublemaker">确认交换<\/button>/g, '<button class="confirm-btn mt" hover-class="confirm-btn-hover" @click="confirmTroublemaker">确认交换</button>');

// 3. Update active-turn styles
code = code.replace(/\.active-turn\s*\{\s*background:\s*#e8f8f5;\s*border:\s*2px\s+solid\s+#1abc9c;\s*\}/, `.active-turn { 
  background: linear-gradient(145deg, #1e293b, #0f172a); 
  border: 1px solid rgba(56, 189, 248, 0.3); 
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.5); 
  color: #f1f5f9; 
}`);

// 4. Update blind-turn styles
code = code.replace(/\.blind-turn\s*\{\s*background:\s*#f9ebea;\s*border:\s*2px\s+dashed\s+#e74c3c;\s*opacity:\s*0\.8;\s*\}/, `.blind-turn { 
  background: rgba(15, 23, 42, 0.8); 
  border: 2px dashed rgba(255, 255, 255, 0.2); 
  color: #94a3b8; 
  opacity: 0.9; 
}`);

// 5. Update action-title style
code = code.replace(/\.action-title\s*\{\s*font-size:\s*32rpx;\s*font-weight:\s*bold;\s*margin-bottom:\s*20rpx;\s*display:\s*block;\s*\}/, `.action-title { 
  font-size: 36rpx; 
  font-weight: 800; 
  margin-bottom: 24rpx; 
  display: block; 
  color: #38bdf8; 
  letter-spacing: 2rpx; 
}`);

// 6. Add new button styles
const newStyles = `
.action-btn {
  background: linear-gradient(145deg, #334155, #1e293b) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
  border-radius: 16rpx !important;
  padding: 10rpx 30rpx !important;
  font-size: 28rpx !important;
  font-weight: bold !important;
  box-shadow: inset 0 2rpx 4rpx rgba(255, 255, 255, 0.1), 0 4rpx 10rpx rgba(0,0,0,0.4) !important;
  transition: all 0.2s ease;
  margin: 0 10rpx;
}
.action-btn-hover {
  transform: scale(0.95);
  background: linear-gradient(145deg, #1e293b, #0f172a) !important;
  box-shadow: inset 0 4rpx 10rpx rgba(0,0,0,0.6) !important;
}
.confirm-btn {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #ffffff !important;
  font-size: 34rpx !important;
  font-weight: 900 !important;
  border-radius: 20rpx !important;
  padding: 20rpx 0 !important;
  width: 90%;
  margin: 20rpx auto 0 !important;
  box-shadow: 0 8rpx 20rpx rgba(16, 185, 129, 0.4), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.3) !important;
  border: none !important;
  transition: all 0.2s ease;
  display: block;
}
.confirm-btn-hover {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(16, 185, 129, 0.3), inset 0 4rpx 12rpx rgba(0, 0, 0, 0.2) !important;
}
.action-panel text {
  line-height: 1.6;
}
`;

if (!code.includes('.action-btn {')) {
  code = code.replace(/\.temp-text\s*\{\s*color:\s*#7f8c8d;\s*font-size:\s*28rpx;\s*\}/, '.temp-text { color: #7f8c8d; font-size: 28rpx; }\n' + newStyles);
}

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Successfully updated index.vue with new UI styles!');

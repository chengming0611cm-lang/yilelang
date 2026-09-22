const fs = require('fs');
let content = fs.readFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'utf8');

// Fix 1: line 234 missing quote
content = content.replace("avalonState.voteResult.isApproved ? '鍙戣溅鎴愬姛锛? : '琚鍚﹀喅锛'", "avalonState.voteResult.isApproved ? '发车成功' : '被否决'");

// Fix 2: '绛夊緟闃熼暱...
content = content.replace("绛夊緟闃熼暱", "等待队长");

fs.writeFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', content, 'utf8');

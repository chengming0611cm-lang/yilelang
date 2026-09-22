const fs = require('fs');
let content = fs.readFileSync('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'utf8');

content = content.replace("// 鍏煎鎬ч檷绾?    uni.setClipboardData({", "// 鍏煎鎬ч檷绾?\n    uni.setClipboardData({");

fs.writeFileSync('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', content, 'utf8');

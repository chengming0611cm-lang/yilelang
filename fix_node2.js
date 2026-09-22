const fs = require('fs');
let content = fs.readFileSync('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', 'utf8');

content = content.replace('@click="clos</view>', '@click="close">X</view>');

fs.writeFileSync('D:/AI/cunchu/za/one/frontend/src/components/ShareQrcodeModal.vue', content, 'utf8');

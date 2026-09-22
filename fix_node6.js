const fs = require('fs');
let content = fs.readFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'utf8');

content = content.replace("浜篳\\, icon:", "浜篳\, icon:");

fs.writeFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', content, 'utf8');

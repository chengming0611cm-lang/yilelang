const fs = require('fs');
let content = fs.readFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', 'utf8');

content = content.replace(/currentQuestSize\} .*?\)\;/g, "currentQuestSize} 人\, icon: 'none' });");

fs.writeFileSync('D:/AI/cunchu/za/one/frontend/src/components/AvalonGameView.vue', content, 'utf8');

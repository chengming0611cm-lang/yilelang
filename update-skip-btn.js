const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// Change "放弃行动" to "不发动技能 (跳过)"
code = code.replace(/<button class="pass-btn" hover-class="pass-btn-hover" @click\.stop="submitNightAction\(\{ type: 'NONE' \}\)">放弃行动<\/button>/g, 
  `<button class="pass-btn" hover-class="pass-btn-hover" @click.stop="submitNightAction({ type: 'NONE' })">不发动技能 (跳过)</button>`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

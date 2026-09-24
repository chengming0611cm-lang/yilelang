const fs = require('fs');

let vueCode = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

vueCode = vueCode.replace(/太阳升起 · 自由发言讨论/, '自由讨论中，等待房主开启投票...');
vueCode = vueCode.replace(/注意强盗和捣蛋鬼调牌可能导致身份反转。讨论充分后房主可开启投票。/, '注意强盗和捣蛋鬼调牌可能导致身份反转。');
vueCode = vueCode.replace(/房主提前开启全员投票/, '发起投票');

fs.writeFileSync('frontend/src/pages/index/index.vue', vueCode, 'utf8');
console.log("Vue updated successfully.");

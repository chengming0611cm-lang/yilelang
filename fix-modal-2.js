const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/uni\.showModal\(\{\s*title: '抢夺成功'[\s\S]*?\}\);/,
  "globalModal.value.show({ title: '抢夺成功', content: `你换回的新底牌是：${ROLE_NAMES[res.newRole] || '未知'}`, type: 'alert' });");

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

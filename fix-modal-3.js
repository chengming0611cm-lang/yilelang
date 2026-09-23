const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

if (!code.includes('<CustomModal ref="globalModal" />')) {
  code = code.replace(/<view class="container">/, '<view class="container">\n    <CustomModal ref="globalModal" />');
}

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

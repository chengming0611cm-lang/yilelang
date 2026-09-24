const fs = require('fs');

let vueCode = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

vueCode = vueCode.replace(/const playSound = \(name\) => \{/, "const playSound = (name) => {\n  if (!isHost.value) return; // 只有房主能播放声音");

fs.writeFileSync('frontend/src/pages/index/index.vue', vueCode, 'utf8');
console.log("Vue updated successfully.");

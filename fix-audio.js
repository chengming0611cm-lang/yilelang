const fs = require('fs');

let vueCode = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Remove vibrate
vueCode = vueCode.replace(/uni\.vibrateShort\(\);/g, '// uni.vibrateShort();');

// 2. Mute non-hosts
const oldPlaySound = `const playSound = (name) => {
    if (!audioCtx) {`;
const newPlaySound = `const playSound = (name) => {
    if (!isHost.value) return; // 只有房主能播放声音
    if (!audioCtx) {`;
vueCode = vueCode.replace(oldPlaySound, newPlaySound);

// 3. Update UI text
vueCode = vueCode.replace(/轮到你的角色时将发出提示音与震动/g, '请闭眼等待，听从房主设备的统一语音提示行动');

fs.writeFileSync('frontend/src/pages/index/index.vue', vueCode, 'utf8');
console.log("Vue updated successfully.");

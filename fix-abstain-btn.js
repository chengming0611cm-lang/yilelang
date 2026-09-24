const fs = require('fs');

let vueCode = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// 1. Replace Template
const oldTemplateStr = /<button[\s\n]*class="abstain-btn"[\s\n]*:class="\{'abstain-active': selectedVote === -1\}"[\s\n]*@click="submitVote\(-1\)"[\s\n]*:disabled="votingCountdown === null">[\s\n]*🏳️\{\{ selectedVote === -1 \? '已选弃票' : '放弃本次投票（弃权）' \}\}[\s\n]*<\/button>/;

const newTemplateStr = `<button 
                class="abstain-btn" 
                :class="{'abstain-active': selectedVote === -1}"
                hover-class="abstain-hover"
                @click="submitVote(-1)"
                :disabled="votingCountdown === null">
                🏳️ {{ selectedVote === -1 ? '已弃权' : '放弃本次投票 (弃权)' }}
              </button>`;

if (vueCode.match(oldTemplateStr)) {
    vueCode = vueCode.replace(oldTemplateStr, newTemplateStr);
    console.log("Template matched and replaced.");
} else {
    // try looser match
    const altRegex = /<button\s*class="abstain-btn"[\s\S]*?<\/button>/;
    const match = vueCode.match(altRegex);
    if(match) {
        vueCode = vueCode.replace(altRegex, newTemplateStr);
        console.log("Template matched with loose regex.");
    } else {
        console.log("Template not found!");
    }
}

// 2. Replace CSS for abstain-active
const oldActiveCss = /\.abstain-active\s*\{[\s\S]*?\}/;
const newActiveCss = `.abstain-active {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #ffffff !important;
  border: 2px solid #34d399 !important;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.5) !important;
}`;
vueCode = vueCode.replace(oldActiveCss, newActiveCss);

// 3. Replace CSS for abstain-btn
const oldBtnCss = /\.abstain-btn\s*\{[\s\S]*?\}/;
const newBtnCss = `.abstain-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  border: 2px solid #64748b;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}`;
vueCode = vueCode.replace(oldBtnCss, newBtnCss);

// 4. Add hover class and remove old active
const oldActivePseudo = /\.abstain-btn:active\s*\{[\s\S]*?\}/;
const newHoverClass = `.abstain-hover {
  background: rgba(100, 116, 139, 0.3) !important;
  border-color: #94a3b8 !important;
  transform: scale(0.98);
}`;
if (vueCode.match(oldActivePseudo)) {
    vueCode = vueCode.replace(oldActivePseudo, newHoverClass);
} else {
    vueCode += `\n${newHoverClass}\n`;
}

fs.writeFileSync('frontend/src/pages/index/index.vue', vueCode, 'utf8');
console.log("CSS updated successfully.");

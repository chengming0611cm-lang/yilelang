const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/<button class="btn mt" type="primary" size="mini" @click="doTroublemaker">确认交换<\/button>/g, '<button class="confirm-btn mt" hover-class="confirm-btn-hover" @click="doTroublemaker">确认交换</button>');

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Fixed doTroublemaker button');

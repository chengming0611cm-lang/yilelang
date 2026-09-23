const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/<radio value="avalon" :checked="gameType === 'avalon'" \/>[^<]*<\/label>/, 
  `$&
            <label><radio value="sgs" :checked="gameType === 'sgs'" /> 三国杀</label>`);

// Fix Share Modal fallback
code = code.replace(/:gameName="gameType === 'onuw' \? '一夜终极狼人' : '阿瓦隆'"/, 
  `:gameName="gameType === 'onuw' ? '一夜终极狼人' : gameType === 'avalon' ? '阿瓦隆' : '三国杀'"`);
code = code.replace(/当前游戏：\{\{ gameType === 'onuw' \? '一夜终极狼人' : '阿瓦隆' \}\}/, 
  `当前游戏：{{ gameType === 'onuw' ? '一夜终极狼人' : gameType === 'avalon' ? '阿瓦隆' : '三国杀' }}`);

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');
console.log('Fixed radio-group');

const fs = require('fs');
let code = fs.readFileSync('frontend/src/rolesDictionary.js', 'utf8');

code = code.replace(/lord:\s*\{[\s\S]*?spritePosition:\s*'[^']*'/, `lord: {
    name: '主公',
    color: '#f1c40f',
    camp: '主公阵营',
    description: '消灭所有反贼和内奸，平定天下。主公身份开局全场公开。',
    spritePosition: '0% 0%'`);

code = code.replace(/loyalist:\s*\{[\s\S]*?spritePosition:\s*'[^']*'/, `loyalist: {
    name: '忠臣',
    color: '#2ecc71',
    camp: '主公阵营',
    description: '保护主公，协助主公消灭反贼和内奸。',
    spritePosition: '100% 0%'`);

code = code.replace(/rebel:\s*\{[\s\S]*?spritePosition:\s*'[^']*'/, `rebel: {
    name: '反贼',
    color: '#e74c3c',
    camp: '反贼阵营',
    description: '推翻主公统治，击败主公即获得胜利。',
    spritePosition: '0% 100%'`);

code = code.replace(/renegade:\s*\{[\s\S]*?spritePosition:\s*'[^']*'/, `renegade: {
    name: '内奸',
    color: '#9b59b6',
    camp: '内奸阵营',
    description: '消灭除自己外所有人，最后击败主公。',
    spritePosition: '100% 100%'`);

fs.writeFileSync('frontend/src/rolesDictionary.js', code, 'utf8');
console.log('rolesDictionary.js updated');

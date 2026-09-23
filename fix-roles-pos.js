const fs = require('fs');
let code = fs.readFileSync('frontend/src/rolesDictionary.js', 'utf8');

const replacements = {
  'merlin': '4.04% 20.98%',
  'percival': '34.74% 20.84%',
  'loyal': '65.81% 20.84%',
  'morgana': '4.23% 96.96%',
  'assassin': '35.11% 96.96%',
  'oberon': '65.99% 96.82%',
  'mordred': '96.69% 96.82%',
  'minion_avalon': '35.11% 96.96%'
};

for (const [key, pos] of Object.entries(replacements)) {
  const regex = new RegExp(key + ':\\s*\\{\\s*name:[^,]+,\\s*spritePosition:\\s*\\\'[^\\\']+\\\'', 'g');
  code = code.replace(regex, (match) => {
    return match.replace(/spritePosition:\s*'[^']+'/, `spritePosition: '${pos}'`);
  });
}

fs.writeFileSync('frontend/src/rolesDictionary.js', code, 'utf8');
console.log('Updated rolesDictionary.js');

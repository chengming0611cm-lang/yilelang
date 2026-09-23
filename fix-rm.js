const fs = require('fs');
let code = fs.readFileSync('backend/roomManager.js', 'utf8');

if (!code.includes('import { SgsEngine }')) {
  code = code.replace(/import \{ AvalonEngine \} from '\.\/avalonEngine\.js';/, 
    "import { AvalonEngine } from './avalonEngine.js';\nimport { SgsEngine } from './sgsEngine.js';");
}

if (!code.includes("this.gameType === 'sgs'")) {
  code = code.replace(/\} else if \(this\.gameType === 'avalon'\) \{/,
    `} else if (this.gameType === 'sgs') {
      this.engine = new SgsEngine(this);
      this.engine.startGame(io);
    } else if (this.gameType === 'avalon') {`);
}

fs.writeFileSync('backend/roomManager.js', code, 'utf8');
console.log('Fixed roomManager.js');

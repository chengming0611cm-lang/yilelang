const fs = require('fs');
let code = fs.readFileSync('backend/roomManager.js', 'utf8');

if (!code.includes('SgsEngine')) {
  code = code.replace(/const AvalonEngine = require\('\.\/avalonEngine'\);/, 
    "const AvalonEngine = require('./avalonEngine');\nconst SgsEngine = require('./sgsEngine');");
  
  code = code.replace(/\} else if \(this\.gameType === 'avalon'\) \{/,
    `} else if (this.gameType === 'sgs') {
      this.engine = new SgsEngine(this);
      this.engine.startGame(io);
    } else if (this.gameType === 'avalon') {`);
    
  fs.writeFileSync('backend/roomManager.js', code, 'utf8');
  console.log('Updated roomManager.js for SGS');
}

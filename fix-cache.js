const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

if (!code.includes('setHeaders: (res, path)')) {
  code = code.replace(
    /app\.use\(express\.static\(path\.join\(__dirname, 'public'\)\)\);/,
    `app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));`
  );
  fs.writeFileSync('backend/server.js', code, 'utf8');
  console.log('Added Cache-Control to server.js');
}

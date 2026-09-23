const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

code = code.replace(/\{\{ selectedVote === p.seatNumber \? '已投TA' : '投TA' \}\}/g, 
  "{{ selectedVote === p.seatNumber ? (p.seatNumber === mySeatNumber ? '已选自己' : '已投TA') : (p.seatNumber === mySeatNumber ? '投自己' : '投TA') }}");

fs.writeFileSync('frontend/src/pages/index/index.vue', code, 'utf8');

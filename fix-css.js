const fs = require('fs');

// 1. Update AvalonGameView.vue
let avalonVue = fs.readFileSync('frontend/src/components/AvalonGameView.vue', 'utf8');

// Update background-size
avalonVue = avalonVue.replace(
  /background-size:\s*400%\s*365\.5%;/g,
  'background-size: 448.72% 386.72%;'
);

// Remove card-name-overlay text element
avalonVue = avalonVue.replace(
  /<text\s+class="card-name-overlay"[\s\S]*?<\/text>/g,
  ''
);

fs.writeFileSync('frontend/src/components/AvalonGameView.vue', avalonVue, 'utf8');
console.log('Updated AvalonGameView.vue');

// 2. Update index.vue
let indexVue = fs.readFileSync('frontend/src/pages/index/index.vue', 'utf8');

// Update background-size
indexVue = indexVue.replace(
  /\.avalon-sprite\s*\{\s*background-image:\s*url\('\/static\/avalon-sprite\.jpg'\);\s*background-size:\s*400%\s*365\.5%;/g,
  '.avalon-sprite {\n  background-image: url(\'/static/avalon-sprite.jpg\');\n  background-size: 448.72% 386.72%;'
);

fs.writeFileSync('frontend/src/pages/index/index.vue', indexVue, 'utf8');
console.log('Updated index.vue');

// Auto-reload script for development
// This script automatically refreshes the extension when files change

const fs = require('fs');
const path = require('path');

// Watch the dist folder for changes
const distPath = path.join(__dirname, 'dist');
const manifestPath = path.join(distPath, 'manifest.json');

console.log('🔄 Auto-reload watcher started...');
console.log('📁 Watching:', distPath);
console.log('💡 When files change, refresh the extension in Chrome:');
console.log('   1. Go to chrome://extensions/');
console.log('   2. Click the refresh button next to "Apply Anywhere"');
console.log('   3. Or refresh the page you\'re testing on\n');

fs.watch(distPath, (eventType, filename) => {
  if (filename && (filename.endsWith('.js') || filename.endsWith('.html'))) {
    console.log(`📝 File changed: ${filename}`);
    console.log('🔄 Please refresh the extension in Chrome now!\n');
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Auto-reload watcher stopped');
  process.exit(0);
});

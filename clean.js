const fs = require('fs');
const path = require('path');

function cleanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanDir(fullPath);
    } else {
      if (file.endsWith('.js') || file.endsWith('.js.map') || file.endsWith('.d.ts') || file.endsWith('.d.ts.map')) {
        fs.unlinkSync(fullPath);
        console.log('Deleted:', fullPath);
      }
    }
  }
}

cleanDir(path.join(__dirname, 'packages/shared/src'));
console.log('Clean complete.');

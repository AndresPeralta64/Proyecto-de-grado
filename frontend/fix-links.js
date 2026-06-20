const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/funcionalidades', (filePath) => {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('routerLink="/microcredenciales-publicas"')) {
      let newContent = content.replace(/routerLink="\/microcredenciales-publicas"/g, 'routerLink="/microcredenciales-registradas"');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated routerLink in: ' + filePath);
    }
  }
});

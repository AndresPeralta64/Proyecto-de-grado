const fs = require('fs');

let emisorHtml = fs.readFileSync('src/funcionalidades/emisor/emisor.componente.html', 'utf8');
emisorHtml = emisorHtml.replace('routerLink="/microcredenciales-registradas"', 'routerLink="/emisor/microcredenciales-registradas"');
fs.writeFileSync('src/funcionalidades/emisor/emisor.componente.html', emisorHtml, 'utf8');

let receptorHtml = fs.readFileSync('src/funcionalidades/receptor/receptor.componente.html', 'utf8');
receptorHtml = receptorHtml.replace('routerLink="/microcredenciales-registradas"', 'routerLink="/receptor/microcredenciales-registradas"');
fs.writeFileSync('src/funcionalidades/receptor/receptor.componente.html', receptorHtml, 'utf8');

console.log('Done');

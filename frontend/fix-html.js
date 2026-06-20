const fs = require('fs');
let html = fs.readFileSync('src/funcionalidades/publico/microcredenciales-registradas/microcredenciales-registradas.componente.html', 'utf8');

const start = html.indexOf('<!-- Contenido Principal -->');
if (start !== -1) {
    let mainContent = html.slice(start);
    // Remove the trailing </div> of the main wrapper
    mainContent = mainContent.replace(/<\/div>\s*$/, '');
    // Replace <main> attributes to make it full width
    mainContent = mainContent.replace(/<main[^>]*>/, '<main class=\"flex-1 h-full min-h-0 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center transition-all duration-250 w-full\">');
    fs.writeFileSync('src/funcionalidades/publico/microcredenciales-registradas/microcredenciales-registradas.componente.html', mainContent, 'utf8');
    console.log('HTML updated.');
} else {
    console.log('Not found');
}

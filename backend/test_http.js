const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({
    id: 2,
    correo: 'emisor@ejemplo.com',
    nombre_rol: 'Emisor',
    roles: ['Emisor']
}, process.env.JWT_SECRET, { expiresIn: '1h' });

const http = require('http');

const data = JSON.stringify({
    idMicrocredencial: 5,
    receptoresIds: [1]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/insignias/emitir',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let responseData = '';
    res.on('data', d => {
        responseData += d;
    });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${responseData}`);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();

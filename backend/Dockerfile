# Imagen base oficial de Node.js en Alpine Linux (versión LTS liviana y segura)
FROM node:22-alpine

# Definir directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar el código fuente del backend
COPY . .

# Asegurar que las carpetas de recursos físicos existan
RUN mkdir -p recursos/perfiles recursos/insignias recursos/insignias_metadatos

# Exponer el puerto de la API de Node.js
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]


# ==============================================================================
# Etapa 1: Compilación de la aplicación Angular 20
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copiar descriptores de paquetes
COPY package*.json ./

# Instalar dependencias necesarias para la construcción
RUN npm install

# Copiar el código fuente completo del frontend
COPY . .

# Compilar la aplicación optimizada para producción (reemplaza variables por environment.prod.ts)
RUN npm run build -- --configuration production

# ==============================================================================
# Etapa 2: Servidor Web Nginx para distribución en producción con HTTPS (HT-008)
# ==============================================================================
FROM nginx:alpine

# Instalar OpenSSL y generar certificado SSL autofirmado para despliegues reproducibles
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/C=EC/ST=Chimborazo/L=Riobamba/O=ESPOCH/OU=FIE/CN=localhost"

# Copiar los artefactos estáticos generados por el builder de Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx (manejo de SPA, HTTPS y Proxy API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puertos HTTP (80) y HTTPS (443)
EXPOSE 80 443

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]

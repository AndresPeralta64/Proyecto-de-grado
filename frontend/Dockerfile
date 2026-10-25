# ==============================================================================
# Etapa 1: Compilación de la aplicación Angular 20
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copiar descriptores de paquetes
COPY package*.json ./

# Instalar dependencias necesarias para la construcción (incluye devDependencies)
RUN npm install

# Copiar el código fuente completo del frontend
COPY . .

# Compilar la aplicación optimizada para producción
RUN npm run build -- --configuration production

# ==============================================================================
# Etapa 2: Servidor Web Nginx para distribución en producción
# ==============================================================================
FROM nginx:alpine

# Copiar los artefactos estáticos generados por el builder de Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx (manejo de SPA y Proxy API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]


# Plataforma de gestión de perfiles académicos mediante microcredenciales e insignias digitales

Este repositorio contiene el software integral desarrollado para la Escuela Superior Politécnica de Chimborazo (ESPOCH) como Trabajo de Titulación de la Carrera de Software Facultad de Informática y Electrónica.

La plataforma permite diseñar, aprobar, emitir, almacenar, compartir y validar microcredenciales académicas e insignias digitales bajo el estándar internacional Open Badges 3.0, garantizando autenticidad e integridad mediante firmas criptográficas asimétricas y metadatos incrustados.

---

## Características principales

* **Estándar Open Badges 3.0 & W3C:** Emisión de credenciales con sintaxis JSON-LD, identificadores universales persistentes (UUID v4) y prueba criptográfica con cryptosuite `eddsa-rdfc-2022`.
* **Firma criptográfica asimétrica EdDSA (Ed25519):** Generación y gestión de claves institucionales en formato JWK (`JsonWebKey2020`).
* **Incrustación de metadatos en PNG:** Inyección de aserciones JSON-LD directamente en el chunk `tEXt` de las imágenes de insignias para portabilidad fuera de la plataforma.
* **Cifrado en reposo (AES-256-CBC):** La clave privada institucional se almacena cifrada en la base de datos y se descifra únicamente en la memoria del servidor al firmar.
* **Control de acceso basado en roles (RBAC):**
  * **Administrador:** Aprobación de microcredenciales, gestión de usuarios, auditoría de emisiones y métricas globales.
  * **Emisor:** Creación de microcredenciales, emisión masiva asíncrona de insignias a estudiantes y revocación justificada.
  * **Receptor (Estudiante/Docente):** Gestión de perfil académico público, descarga de insignias horneadas y exportación de perfil en PDF.
  * **Público:** Verificación instantánea de autenticidad y estado de insignias sin requerir inicio de sesión.

---

## Pila tecnológica

| Capa | Tecnología | Versión | Propósito |
| :--- | :--- | :--- | :--- |
| **Frontend** | Angular | `20.3.0` | Arquitectura moderna de *Standalone Components*, carga diferida (*lazy loading*) y *Guards* de seguridad. |
| **Estilos Frontend** | Tailwind CSS | `4.3.3` | Diseño responsivo e interfaz institucional moderna sin dependencias pesadas. |
| **Exportación PDF** | jsPDF / html2canvas | `4.2.1` / `1.4.1` | Generación en el cliente del documento de perfil académico en PDF A4. |
| **Backend** | Node.js / Express | `22.x` / `4.16.1` | API REST modular, gestión de identidades y controladores de emisión. |
| **Base de Datos** | PostgreSQL | `16.x` | Persistencia relacional, consultas SQL parametrizadas y almacenamiento JSONB. |
| **Driver BD** | `pg` (node-postgres) | `8.20.0` | Pool de conexiones directas sin sobrecarga de ORM. |
| **Seguridad Token** | JSON Web Tokens (`jsonwebtoken`) | `9.0.3` | Autenticación *stateless* (HS256) con expiración de 12 horas. |
| **Hash de Contraseñas**| `bcryptjs` | `3.0.3` | Hashing unidireccional con 10 rondas de salt. |
| **Carga de Archivos**| Multer | `2.1.1` | Almacenamiento validado de fotos de perfil e imágenes de insignias. |
| **Manipulación PNG** | `png-chunk-text` / `png-chunks-*` | `1.0.0` | Inyección y lectura de chunks PNG para el proceso de *baking*. |
| **Servidor Web / Proxy**| Nginx | `Alpine` | Servidor estático para la SPA y proxy inverso hacia la API Node.js. |
| **Contenedores** | Docker & Docker Compose | `24+` / `v2+` | Entorno reproducible y despliegue automatizado en un solo paso. |

---

## Estructura del repositorio

```text
Proyecto-de-grado/
├── backend/                        # API REST en Node.js y Express
│   ├── bin/                        # Punto de entrada (www) y script de claves Ed25519
│   ├── controladores/              # Lógica de negocio (auth, insignias, microcredenciales, usuarios)
│   ├── intermediarios/             # Middlewares (autenticación JWT, RBAC, subida Multer)
│   ├── recursos/                   # Almacenamiento persistente de insignias y fotos
│   ├── rutas/                      # Definición de endpoints de la API
│   ├── servicios/                  # Conexión a BD, criptografía, servicio de insignias y correo
│   ├── utilidades/                 # Carga y descifrado de llaves en memoria
│   ├── Dockerfile                  # Contenedor de producción para el Backend
│   ├── .env.example                # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/                       # Aplicación web cliente en Angular 20
│   ├── src/
│   │   ├── app/                    # Configuración de rutas y arquitectura base
│   │   ├── core/                   # Guards, interceptores HTTP, modelos y servicios
│   │   ├── funcionalidades/        # Módulos por rol (admin, emisor, receptor, auth, publico)
│   │   └── environments/           # Variables de entorno (desarrollo y producción)
│   ├── nginx.conf                  # Configuración de Nginx (SPA + Proxy API + Gzip)
│   ├── Dockerfile                  # Multi-stage build (Angular Build + Nginx Alpine)
│   └── package.json
│
├── documentación/                  # Manuales, requerimientos y scripts de base de datos
│   ├── query base de datos.sql     # DDL completo, tablas, relaciones y datos iniciales
│   └── Historias de usuario...     # Especificación de requisitos y criterios de aceptación
│
├── docker-compose.yml              # Orquestador multi-contenedor (Postgres + Backend + Frontend)
└── README.md                       # Documentación principal del proyecto
```

---

## Despliegue con docker compose (Recomendado - Entornos limpios)

Este método es el estándar de despliegue y permite levantar todo el sistema en cualquier servidor Linux, macOS o Windows sin instalar Node.js ni PostgreSQL en el sistema anfitrión.

### Prerrequisitos
* Tener instalado Docker Engine (v24.0+) y Docker Compose (v2.0+).

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Proyecto-de-grado.git
cd Proyecto-de-grado
```

### Paso 2: Configurar las variables de entorno del backend
Copie la plantilla `.env.example` para generar el archivo `.env`:
```bash
cp backend/.env.example backend/.env
```
*(Opcional: Si está en un servidor de producción con dominio propio, edite `backend/.env` para colocar contraseñas seguras y sus URLs finales).*

### Paso 3: Construir y levantar los contenedores
Ejecute el siguiente comando en la raíz del proyecto:
```bash
docker compose up -d --build
```
> **¿Qué ocurre automáticamente en este paso?**
> 1. Se crea la red interna aislada `espoch_network`.
> 2. Se levanta el contenedor `espoch_postgres` y se ejecuta automáticamente el script `query base de datos.sql`, creando todas las tablas, relaciones y catálogos.
> 3. El contenedor `espoch_backend` espera a que PostgreSQL pase su verificación de salud (*healthcheck*) y arranca en el puerto 3000.
> 4. El contenedor `espoch_frontend` compila el código Angular en producción y lo sirve a través de Nginx en los puertos 80 y 443 (HTTPS), con redirección automática de HTTP a HTTPS y enlazando el proxy a la API.

### Paso 4: Inicializar el par de claves criptográficas institucionales (Solo primera vez)
Una vez que los contenedores estén corriendo, ejecute el script para generar el par de claves Ed25519 de la ESPOCH y almacenarlas cifradas en la base de datos:
```bash
docker compose exec backend node ./bin/configurar_claves.js
```
Deberá ver la confirmación:
`"Proceso finalizado con éxito: Clave pública (JWK) y privada cifrada almacenadas correctamente."`

### Paso 5: Ingresar a la Plataforma
Abra su navegador web y navegue:
* **Aplicación Web:** `https://localhost` (o si accede por `http://localhost`, será redirigido automáticamente a HTTPS).
* **API REST:** `https://localhost/api`
* **Perfil Público del Emisor (JWK):** `https://localhost/api/public/issuer`

> **Nota sobre certificados:** Para despliegues reproducibles en entornos limpios con Docker, Nginx genera automáticamente un certificado SSL autofirmado para `localhost`. Al ingresar por primera vez, el navegador mostrará una advertencia de seguridad habitual; simplemente seleccione "Avanzado" y "Continuar a localhost". En producción institucional, los certificados emitidos por la ESPOCH pueden montarse en `/etc/nginx/ssl/`.

---

## Despliegue local para desarrollo (Sin Docker)

Si desea modificar código en tiempo real con recarga activa (*hot-reload*):

### Prerrequisitos
* **Node.js:** Versión 20.x o 22.x LTS instalada.
* **PostgreSQL:** Versión 14 o superior en ejecución en el puerto 5432.
* **Angular CLI:** `npm install -g @angular/cli@20`

### 1. Preparar la Base de Datos
1. Inicie sesión en PostgreSQL y cree la base de datos:
   ```sql
   CREATE DATABASE "Microcredenciales_ESPOCH";
   ```
2. Ejecute el script DDL completo ubicado en:
   `documentación/query base de datos.sql`

### 2. Configurar y Arrancar el Backend
1. Ingrese a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Cree y verifique su archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Asegúraese de que `DATABASE_URL` contenga el usuario y contraseña de su PostgreSQL local).*
4. Inicialice las claves criptográficas (solo una vez):
   ```bash
   node ./bin/configurar_claves.js
   ```
5. Inicie el servidor de desarrollo:
   ```bash
   npm start
   ```
   El backend quedará escuchando en `http://localhost:3000`.

### 3. Configurar y arrancar el frontend
1. Abra una nueva terminal e ingrese a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo de Angular:
   ```bash
   npm start
   ```
   La aplicación se abrirá en `http://localhost:4200`.

---

## Credenciales iniciales de acceso

El script de la base de datos precarga una cuenta de superadministrador con todos los roles asignados:

* **Correo institucional:** `admin@espoch.edu.ec`
* **Contraseña inicial:** `1234567890`
* **Roles disponibles:** Administrador, Emisor y Receptor (puede alternar entre ellos desde la opción *Cambiar Rol* en el perfil).

> **Importante:** Por seguridad, tras el primer inicio de sesión se recomienda actualizar esta contraseña desde la sección de configuración de perfil.

---

## Variables de entorno (`.env`)

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha del servidor Express | `3000` |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` / `production` |
| `DATABASE_URL` | Cadena de conexión JDBC/PostgreSQL | `postgresql://user:pass@host:5432/Microcredenciales_ESPOCH?schema=public` |
| `JWT_SECRET` | Clave secreta para firmar tokens de sesión y recuperación | Cadena aleatoria de alta entropía |
| `AES_SECRET_KEY` | Clave simétrica de 256 bits para cifrar la clave privada Ed25519 | Cadena de 32 bytes o más |
| `URL_BACKEND` | URL base accesible del backend | `http://localhost:3000` o `https://api.espoch.edu.ec` |
| `URL_FRONTEND` | URL base del cliente para enlaces enviados por correo | `http://localhost:4200` o `https://microcredenciales.espoch.edu.ec` |

---

## Mecanismos de seguridad implementados

1. **Protección de secretos criptográficos:** La clave `AES_SECRET_KEY` y `JWT_SECRET` residen exclusivamente en las variables de entorno del servidor. Si la base de datos llega a sufrir un volcado no autorizado, el atacante no puede extraer la clave privada institucional porque está cifrada con AES-256 en reposo.
2. **Redirección forzada a HTTPS:** Cuando `NODE_ENV=production`, el middleware de Express y Nginx fuerzan la redirección automática de tráfico no cifrado HTTP (código 301) hacia HTTPS, preservando la confidencialidad de credenciales en tránsito.
3. **Encabezados de seguridad:** Helmet configura cabeceras de protección contra ataques XSS, Clickjacking y MIME-sniffing, permitiendo la carga cruzada de imágenes institucionales con `crossOriginResourcePolicy: "cross-origin"`.
4. **Prevención de inyección SQL:** Todas las consultas en `servicios/base_datos.js` se ejecutan mediante consultas preparadas parametrizadas en `pg`.
5. **Aislamiento de carga multipart:** Multer restringe el tamaño máximo (2MB en perfiles, 5MB en insignias) y valida que el tipo MIME pertenezca a la familia `image/*`.

---

## Política y sistema de respaldos automáticos

Para garantizar la integridad y persistencia histórica de las credenciales e insignias emitidas, el sistema implementa una política de respaldos automáticos diarios:

1. **Ejecución diaria desatendida (docker compose):**  
   El contenedor `espoch_postgres_backup` ejecuta automáticamente un volcado comprimido (`.sql.gz`) cada noche a las 00:00 (`@daily`) utilizando `pg_dump`. Los archivos se conservan en el volumen persistente `postgres_backups` con una política de retención de 7 días.

2. **Ejecutar un respaldo manual inmediato:**  
   Si desea forzar un respaldo antes de un mantenimiento o actualización:
   * **Con Docker:**
     ```bash
     docker compose exec postgres_backup /backup.sh
     ```
   * **Con Scripts dedicados:**
     * En Linux/macOS: `./documentación/respaldo_bd.sh`
     * En Windows: `.\documentación\respaldo_bd.bat`

3. **Restaurar la base de datos:**  
   Para restaurar un respaldo previo en un entorno recuperado:
   ```bash
   gunzip -c ./respaldos/archivo.sql.gz | docker compose exec -T postgres_db psql -U postgres -d Microcredenciales_ESPOCH
   ```

---

## Verificación de insignias externas (Open Badges 3.0)

Cualquier insignia descargada en formato PNG puede ser verificada independientemente por plataformas de terceros compatibles con Open Badges 3.0 (o verificadores oficiales de 1EdTech / IMS Global):
1. El archivo PNG contiene un chunk `tEXt` con la etiqueta `openbadges`.
2. El verificador extrae el documento JSON-LD y resuelve la clave pública del emisor en la URL persistente:
   `https://<dominio>/api/public/issuer`
3. Se recalcula el hash canónico del documento (URDNA2015) y se comprueba la firma Ed25519 (`DataIntegrityProof`).

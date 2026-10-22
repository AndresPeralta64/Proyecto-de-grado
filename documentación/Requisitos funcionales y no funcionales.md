# Requisitos de la Aplicación Web

## Requisitos Funcionales

Los requisitos funcionales describen las acciones y los servicios que el sistema debe ofrecer a cada rol.

| ID | Nombre | Descripción |
| :--- | :--- | :--- |
| **RF-001** | Inicio de sesión seguro | El sistema debe permitir a los usuarios autenticarse con correo y contraseña, redirigiendo al panel correspondiente según su rol. |
| **RF-002** | Restablecimiento de contraseña | El sistema debe permitir al usuario restablecer su contraseña mediante un proceso de verificación. |
| **RF-003** | Edición del perfil personal | El sistema debe permitir al usuario editar su información de perfil personal. |
| **RF-004** | Gestión de usuarios | El sistema debe permitir al Administrador crear, editar, buscar y eliminar usuarios. |
| **RF-005** | Administración de roles y permisos | El sistema debe permitir al Administrador asignar, agregar y editar roles y permisos a los usuarios registrados. |
| **RF-006** | Gestión de microcredenciales | El sistema debe permitir al Administrador y al Emisor buscar, eliminar y modificar el estado de microcredenciales (activa o inactiva). Una vez que un Emisor inactive una microcredencial, no podrá reactivarla a menos que lo haga un Administrador. |
| **RF-007** | Aprobación de microcredenciales | El sistema debe permitir al Administrador aprobar o rechazar microcredenciales pendientes, con justificación obligatoria en caso de rechazo. |
| **RF-008** | Registro de microcredenciales | El sistema debe permitir al Emisor registrar una nueva microcredencial, incluyendo la configuración de metadatos académicos bajo el estándar Open Badges 3.0 y el diseño o carga de la insignia digital asociada. |
| **RF-009** | Asociación de insignia digital a microcredencial | El sistema debe permitir al Emisor diseñar una insignia digital mediante plantillas o cargar una insignia digital en varios formatos. |
| **RF-010** | Visualización de insignias emitidas | El sistema debe permitir al Administrador ver y buscar las insignias emitidas por los Emisores. |
| **RF-011** | Gestión de insignias digitales | El sistema debe permitir al Emisor emitir y revocar insignias digitales, además de buscar las insignias emitidas por él. |
| **RF-012** | Gestión de insignias adquiridas | El sistema debe permitir al Receptor buscar y exportar las insignias obtenidas. |
| **RF-013** | Verificación pública por terceros | El sistema debe permitir a cualquier usuario no registrado acceder a la URL pública de una insignia y obtener su *assertion* JSON-LD completo, incluyendo el *proof* criptográfico, para su verificación externa. |
| **RF-014** | Visualización del perfil académico | El sistema debe permitir al Receptor agrupar insignias por categoría y agregar o quitar insignias de su perfil académico. |
| **RF-015** | Exportación del perfil académico | El sistema debe permitir al Receptor exportar su perfil académico completo en formato PDF. |
| **RF-016** | Visualización pública de perfiles | El sistema debe permitir a cualquier usuario, registrado o no, buscar y visualizar perfiles académicos de otros usuarios. |
| **RF-017** | Visualización pública de microcredenciales | El sistema debe permitir a cualquier usuario, registrado o no, buscar y visualizar microcredenciales dentro del sistema, así como los Receptores acreedores de ellas. |
| **RF-018** | Dashboard personalizado por rol | El sistema debe mostrar un dashboard adaptado al perfil del usuario autenticado donde se muestre métricas globales y solicitudes pendientes para el Administrador; estadísticas de microcredenciales creadas e insignias emitidas para el Emisor; y resumen de insignias obtenidas y estado de logros para el Receptor. |
| **RF-019** | Verificación del perfil público institucional | El sistema debe exponer una URL pública institucional única que retorne el nombre de la institución, el correo institucional y la clave pública Ed25519 del sistema en formato JWK, permitiendo que terceros verifiquen criptográficamente cualquier insignia emitida por la plataforma. |

---

## Requisitos No Funcionales

Los requisitos no funcionales establecen las condiciones de calidad, seguridad y compatibilidad con las que el sistema debe operar.

| ID | Nombre | Descripción |
| :--- | :--- | :--- |
| **RNF-001** | Seguridad de la insignia digital | El sistema debe implementar el algoritmo EdDSA (Ed25519) para la firma criptográfica de las insignias. |
| **RNF-002** | Seguridad de datos sensibles | Los datos sensibles de los usuarios deben cifrarse con el estándar AES-256 antes de almacenarse en la base de datos. |
| **RNF-003** | Respaldo de datos almacenados | El sistema debe ejecutar respaldos automáticos diarios de la base de datos PostgreSQL para prevenir la pérdida de registros históricos de emisión. |
| **RNF-004** | Compatibilidad del sistema | La capa de usuario debe ser totalmente compatible y funcional en las versiones actuales de Google Chrome, Mozilla Firefox y Microsoft Edge. |
| **RNF-005** | Gestión del par de claves Ed25519 del sistema | El sistema debe disponer de un único par de claves Ed25519 a nivel institucional. La clave privada debe almacenarse cifrada en el servidor y nunca exponerse públicamente, y la clave pública debe estar disponible en el perfil público institucional definido en RF-019. |
| **RNF-006** | Identificación externa del receptor | El sistema debe utilizar el correo institucional del Receptor, en formato `mailto:`, como su identificador externo dentro del *assertion* JSON-LD de cada insignia emitida. |
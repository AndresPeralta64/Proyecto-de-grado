# Historias de Usuario e Historias Técnicas

## 1. Historias de Usuario (HU)

### HU-001: Inicio de sesión seguro
- **Referencia:** RF-001
- **Como:** Emisor / Receptor / Administrador
- **Quiero:** Iniciar sesión ingresando mi correo institucional y contraseña
- **Para:** Acceder al sistema con los privilegios correspondientes a mi rol y gestionar las funcionalidades que me corresponden
- **Criterios de aceptación:**
  - Dado que el usuario ingresa correo y contraseña válidos, cuando hace clic en “Iniciar sesión”, entonces el sistema valida las credenciales y redirige al panel correspondiente según el rol.
  - Dado que el usuario ingresa credenciales incorrectas, cuando hace clic en “Iniciar sesión”, entonces el sistema muestra el mensaje “Credenciales inválidas” y permite reintentar el inicio.
  - Dado que el usuario deja campos vacíos, cuando intenta iniciar sesión, entonces el sistema muestra advertencias indicando que los campos son obligatorios.
- **Prioridad:** Alta

### HU-002: Restablecimiento de contraseña
- **Referencia:** RF-002
- **Como:** Emisor / Receptor / Administrador
- **Quiero:** Restablecer mi contraseña mediante un proceso de verificación
- **Para:** Recuperar el acceso al sistema en caso de olvidar mis credenciales
- **Criterios de aceptación:**
  - Dado que el usuario solicita restablecer su contraseña, cuando ingresa su correo institucional, entonces el sistema genera un token de verificación y simula el envío de un enlace de recuperación mediante la consola del backend.
  - Dado que el usuario accede al enlace de verificación, cuando ingresa y confirma la nueva contraseña, entonces el sistema actualiza las credenciales y redirige al inicio de sesión.
  - Dado que el enlace de verificación ha expirado (posterior a 1 hora), cuando el usuario intenta usarlo, entonces el sistema muestra un mensaje de error y ofrece solicitar uno nuevo.
- **Prioridad:** Media

### HU-003: Edición del perfil personal
- **Referencia:** RF-003
- **Como:** Emisor / Receptor / Administrador
- **Quiero:** Editar mi información de perfil personal
- **Para:** Mantener actualizada mi información dentro del sistema
- **Criterios de aceptación:**
  - Dado que el usuario accede a su perfil, cuando edita sus datos personales y guarda, entonces el sistema actualiza la información y muestra confirmación.
  - Dado que el usuario deja campos obligatorios vacíos, cuando intenta guardar, entonces el sistema resalta los campos faltantes y no permite continuar.
- **Prioridad:** Baja

### HU-004: Gestión de usuarios
- **Referencia:** RF-004
- **Como:** Administrador
- **Quiero:** Crear, buscar, editar y eliminar cuentas de usuario
- **Para:** Mantener actualizado el registro de usuarios y controlar quién tiene acceso a la plataforma
- **Criterios de aceptación:**
  - Dado que el Administrador accede al módulo de usuarios, entonces el sistema muestra todos los usuarios registrados con su estado actual.
  - Dado que el Administrador ingresa los datos de un nuevo usuario, cuando guarda el registro, entonces el sistema valida duplicados de correo y crea la cuenta exitosamente.
  - Dado que el Administrador modifica información de un usuario existente, cuando confirma los cambios, entonces el sistema actualiza el registro y muestra confirmación.
  - Dado que el Administrador deja campos obligatorios vacíos al modificar, el sistema notifica los campos faltantes y cancela la actualización de datos.
  - Dado que el Administrador selecciona eliminar un usuario, cuando confirma la acción, entonces el sistema solicita confirmación de seguridad y elimina el registro.
  - Dado que el correo ya existe, cuando se intenta registrar, entonces el sistema notifica “Usuario ya registrado” y solicita un correo diferente.
- **Prioridad:** Alta

### HU-005: Administración de roles y permisos
- **Referencia:** RF-005
- **Como:** Administrador
- **Quiero:** Asignar, agregar y editar roles y permisos a los usuarios registrados, incluyendo mi propia cuenta
- **Para:** Controlar el nivel de acceso de cada usuario a los módulos y funcionalidades del sistema según su perfil
- **Criterios de aceptación:**
  - Dado que el Administrador selecciona un usuario, cuando accede a “Editar”, entonces el sistema, adicional a los datos del usuario, muestra la configuración actual de roles y permisos.
  - Dado que el Administrador modifica el rol de un usuario, cuando confirma los cambios, entonces el sistema aplica los nuevos permisos de forma inmediata.
  - Dado que el Administrador asigna un único rol, cuando el usuario inicia sesión, entonces el sistema accederá directamente a las funcionalidades del rol asignado, además de bloquear el acceso al resto de roles no correspondientes.
  - Dado que el Administrador asigna varios roles, cuando el usuario inicia sesión, entonces accederá a las funcionalidades del rol más pesado (primero Administrador, segundo Emisor y tercero Receptor), además, se habilitará la posibilidad de cambiar de rol de acuerdo a los roles que se le asignó.
- **Prioridad:** Alta

### HU-015: Dashboard personalizado por rol
- **Referencia:** RF-018
- **Como:** Emisor / Receptor / Administrador
- **Quiero:** Visualizar un panel de control con el resumen de métricas e información correspondiente a mi rol activo
- **Para:** Monitorear de forma rápida mi actividad, progreso o tareas pendientes dentro de la plataforma
- **Criterios de aceptación:**
  - Dado que el usuario inicia sesión, cuando accede a su panel, entonces el sistema muestra los indicadores y gráficos correspondientes a su rol.
  - Dado que el usuario tenga el rol de Administrador y consulte su dashboard, entonces el sistema muestra el total de usuarios, microcredenciales e insignias; su distribución por estado y por rol en el caso de los usuarios; y las últimas microcredenciales pendientes de aprobación o, en caso de no haber insignias por aprobar, el sistema mostrará el mensaje “No hay microcredenciales pendientes por aprobar”.
  - Dado que el usuario tenga el rol de Emisor, cuando consulta su panel, entonces el sistema muestra el total de microcredenciales creadas e insignias emitidas por él, su distribución por estado y las microcredenciales más emitidas con la fecha de su última emisión.
  - Dado que el usuario tenga el rol de Receptor, cuando consulta su panel, entonces el sistema muestra el total de insignias obtenidas y mostradas en su perfil, su distribución por estado (activas o revocadas) y sus últimas insignias obtenidas con su imagen y estado.
- **Prioridad:** Baja

### HU-006: Gestión de microcredenciales
- **Referencia:** RF-006
- **Como:** Administrador / Emisor
- **Quiero:** Buscar, eliminar y modificar el estado de microcredenciales
- **Para:** Controlar la disponibilidad de las microcredenciales en el sistema
- **Criterios de aceptación:**
  - Dado que el usuario accede al módulo de microcredenciales, cuando aplica filtros de búsqueda, entonces el sistema muestra solo las microcredenciales que coinciden con los criterios.
  - Dado que el usuario selecciona una microcredencial aprobada y elige modificar estado (activa o inactiva), cuando confirma el nuevo estado, entonces el sistema actualiza el registro y refresca el listado.
  - Dado que un Emisor inactive una microcredencial, no podrá cambiar el estado de esta a menos que lo haga un Administrador, además de esto, habilita la posibilidad de eliminar la microcredencial.
  - Dado que la microcredencial tiene insignias emitidas, cuando el usuario intenta cambiar el estado, entonces el sistema muestra una advertencia sobre la posibilidad de emitir nuevas insignias a partir de ese punto.
  - Dado que el usuario selecciona eliminar una microcredencial, cuando confirma la acción, entonces el sistema la oculta del listado principal preservando el historial de insignias emitidas.
  - Dado que la microcredencial está en estado “Pendiente de aprobación”, cuando el Emisor intenta modificar su estado, entonces el sistema bloquea la acción y muestra un aviso.
  - Dado que la microcredencial está en estado “Pendiente de aprobación”, cuando el Emisor intenta eliminarla, entonces el sistema muestra una advertencia de que esa acción no se puede deshacer.
- **Prioridad:** Alta

### HU-007: Aprobación de microcredenciales
- **Referencia:** RF-007
- **Como:** Administrador
- **Quiero:** Revisar las microcredenciales pendientes y aprobarlas o rechazarlas con una justificación
- **Para:** Garantizar que únicamente las microcredenciales que cumplen los estándares institucionales queden disponibles para emisión
- **Criterios de aceptación:**
  - Dado que existen microcredenciales en estado “Pendiente de aprobación”, cuando el Administrador accede al módulo, entonces el sistema muestra la lista de pendientes con sus detalles completos.
  - Dado que el Administrador selecciona “Aprobar”, cuando confirma la acción, entonces el sistema cambia el estado a “Aprobada”.
  - Dado que el Administrador selecciona “Rechazar”, cuando ingresa la justificación obligatoria y confirma, entonces el sistema cambia el estado a “Rechazada”.
  - Dado que no existen microcredenciales pendientes, cuando el Administrador accede al módulo, entonces el sistema muestra “No se encontraron microcredenciales con los parámetros establecidos”.
- **Prioridad:** Alta

### HU-008: Registro de microcredencial con metadatos e insignia digital
- **Referencia:** RF-008 / RF-009
- **Como:** Emisor
- **Quiero:** Registrar una nueva microcredencial definiendo sus metadatos académicos bajo el estándar Open Badges 3.0 y diseñando o cargando la insignia digital asociada
- **Para:** Crear una oferta de certificación académica verificable que pueda ser emitida a los estudiantes que cumplan los requisitos
- **Criterios de aceptación:**
  - Dado que el Emisor completa el formulario con todos los campos obligatorios, cuando guarda la microcredencial, entonces el sistema la almacena en estado “Pendiente de aprobación” y muestra confirmación.
  - Dado que el Emisor carga una imagen de insignia, cuando el sistema la valida, entonces verifica formato, tamaño y resolución antes de asociarla.
  - Dado que el Emisor selecciona la opción de “Diseñar insignia digital”, el sistema abrirá una sección con herramientas de diseño, un formato y tamaño predefinidos para asociarla a la microcredencial.
  - Dado que el Emisor deja campos obligatorios vacíos, cuando intenta guardar, entonces el sistema resalta los campos faltantes y no permite continuar.
  - Dado que el Emisor configura los datos de la microcredencial, cuando el sistema los procesa, entonces estructura los metadatos internamente conforme al estándar Open Badges 3.0.
  - Dado que el Emisor intenta registrar una microcredencial con el mismo nombre que una existente, cuando intenta guardar, entonces el sistema notifica “El nombre de la microcredencial ya está registrado”.
- **Prioridad:** Alta

### HU-009: Visualización de insignias emitidas
- **Referencia:** RF-010
- **Como:** Administrador
- **Quiero:** Ver y buscar todas las insignias digitales emitidas por los Emisores
- **Para:** Tener visibilidad global del sistema con fines de auditoría y supervisión institucional
- **Criterios de aceptación:**
  - Dado que el Administrador accede al módulo de insignias, cuando el sistema carga el listado, entonces muestra todas las insignias emitidas con información resumida.
  - Dado que el Administrador aplica filtros de búsqueda, cuando el sistema procesa la consulta, entonces muestra solo las insignias que coinciden con los criterios.
  - Dado que el Administrador selecciona una insignia, cuando solicita ver los detalles, entonces el sistema presenta información completa incluyendo Receptor, Emisor, fecha y estado.
- **Prioridad:** Media

### HU-010: Gestión de insignias digitales
- **Referencia:** RF-011
- **Como:** Emisor
- **Quiero:** Emitir, buscar en mi historial y revocar insignias digitales
- **Para:** Certificar y mantener trazabilidad de los logros académicos otorgados a los Receptores
- **Criterios de aceptación:**
  - Dado que el Emisor selecciona una microcredencial aprobada y uno o varios Receptores, cuando confirma la emisión, entonces el sistema aplica la firma criptográfica EdDSA (Ed25519) y registra la emisión con fecha, hora y metadatos completos.
  - Dado que el sistema completa la firma, cuando la emisión finaliza, entonces el sistema refleja la insignia en el apartado de “Últimas insignias obtenidas” del receptor.
  - Dado que el Receptor ya posee esa insignia, cuando el Emisor intenta emitirla nuevamente, entonces el sistema no muestra los usuarios que ya poseen la insignia mencionada ni permite seleccionarlos.
  - Dado que el Emisor consulta su historial, cuando aplica filtros, entonces el sistema muestra solo las emisiones que coinciden con los criterios seleccionados.
  - Dado que el Emisor selecciona una insignia activa y elige revocarla, cuando ingresa la justificación y confirma, entonces el sistema cambia el estado a “Revocada”.
  - Dado que el Emisor deja vacía la justificación de revocación, el botón de “Aceptar” no se habilita.
- **Prioridad:** Alta

### HU-011: Gestión de insignias adquiridas
- **Referencia:** RF-012
- **Como:** Receptor
- **Quiero:** Buscar, filtrar y exportar mis insignias digitales obtenidas
- **Para:** Gestionar y compartir mis certificaciones académicas verificables
- **Criterios de aceptación:**
  - Dado que el Receptor accede al módulo de insignias, cuando el sistema carga el contenido, entonces muestra todas las insignias organizadas por fecha de emisión.
  - Dado que el Receptor aplica filtros de búsqueda, cuando el sistema procesa la consulta, entonces muestra solo las insignias que coinciden con los criterios.
  - Dado que el Receptor selecciona una insignia y elige exportar, cuando el sistema genera el archivo, entonces produce el archivo en formato PNG con metadatos Open Badges 3.0 incrustados o en formato JSON-LD de acuerdo a la selección del usuario.
  - Dado que una insignia fue revocada, cuando el Receptor la visualiza, entonces el sistema muestra una advertencia indicando que la certificación ya no es válida por los motivos redactados por el usuario que la revocó.
- **Prioridad:** Alta

### HU-012: Verificación por terceros
- **Referencia:** RF-013
- **Como:** Receptor
- **Quiero:** Compartir una URL pública única de cada insignia
- **Para:** Permitir que empleadores u otras instituciones verifiquen la autenticidad de mis certificaciones sin necesidad de acceder al sistema
- **Criterios de aceptación:**
  - Dado que el Receptor selecciona una insignia y elige compartir URL, cuando el sistema genera el enlace, entonces produce una URL pública única y persistente de la insignia.
  - Dado que un tercero accede a la URL pública, cuando el sistema carga la página, entonces muestra el estado actual de la insignia (activa o revocada) con sus metadatos sin requerir inicio de sesión.
  - Dado que un tercero accede al enlace de “Verificación pública”, el sistema muestra el assertion JSON-LD completo de la insignia digital.
- **Prioridad:** Alta

### HU-013: Visualización y gestión del perfil académico
- **Referencia:** RF-014 / RF-015
- **Como:** Receptor
- **Quiero:** Visualizar mi perfil académico, agrupar mis insignias por categorías, agregar o quitar insignias de mi vista pública y exportar mi perfil en PDF
- **Para:** Presentar de forma profesional y personalizada mis logros académicos digitales
- **Criterios de aceptación:**
  - Dado que el Receptor accede a su perfil académico, cuando el sistema lo carga, entonces muestra todas las insignias obtenidas con opciones de organización.
  - Dado que el Receptor agrupa insignias por categorías definidas, cuando guarda los cambios, entonces el sistema refleja la nueva organización.
  - Dado que el Receptor agrega una insignia a su vista pública, cuando guarda la configuración, entonces la insignia aparece en su perfil público.
  - Dado que el Receptor elimina una insignia de su vista pública, cuando guarda la configuración, entonces la insignia desaparece del perfil público, pero permanece en el registro del sistema y de su cuenta.
  - Dado que el Receptor solicita exportar su perfil en PDF, cuando el sistema genera el archivo, entonces produce un PDF con sus datos personales e insignias organizadas incrustada su URL pública.
- **Prioridad:** Media

### HU-014: Visualización pública de perfiles y microcredenciales
- **Referencia:** RF-016 / RF-017
- **Como:** Emisor / Receptor / Administrador / Usuario no registrado
- **Quiero:** Visualizar el perfil académico de los usuarios del sistema y los usuarios acreedores de insignias digitales de determinada microcredencial
- **Para:** Visualizar públicamente los méritos académicos obtenidos por estudiantes y docentes de la ESPOCH
- **Criterios de aceptación:**
  - Dado que el usuario accede al catálogo, cuando realiza una búsqueda de microcredenciales, entonces el sistema muestra el listado de acuerdo a los parámetros de su búsqueda.
  - Dado que el usuario visualiza una microcredencial específica, cuando da clic en “Ver microcredencial” entonces el sistema despliega la lista de Receptores que han obtenido dicha certificación.
  - Dado que el usuario busca un perfil por nombre, cédula u otros datos personales, cuando el sistema lo localiza, entonces muestra el perfil público del Receptor con sus insignias obtenidas, marcadas para mostrar, sin requerir inicio de sesión.
  - Dado que se busca un perfil inexistente, cuando el sistema procesa la consulta, entonces muestra el mensaje "No se encontraron perfiles académicos con los parámetros establecidos".
- **Prioridad:** Media

### HU-016: Acceso al perfil público institucional
- **Referencia:** RF-019
- **Como:** Emisor / Receptor / Administrador / Usuario no registrado
- **Quiero:** Acceder a la URL pública institucional del emisor
- **Para:** Obtener la clave pública Ed25519 del sistema y verificar criptográficamente la autenticidad de cualquier insignia emitida por la plataforma
- **Criterios de aceptación:**
  - Dado que un tercero accede a la URL pública institucional, cuando el sistema procesa la solicitud, entonces retorna un documento JSON con el nombre de la institución, correo institucional y clave pública Ed25519 en formato JWK.
  - Dado que la URL pública institucional es referenciada desde el campo `issuer.id` del assertion, cuando un verificador externo la consulta, entonces obtiene la clave pública necesaria para validar la firma EdDSA (Ed25519).
- **Prioridad:** Media

---

## 2. Historias Técnicas (HT)

### HT-001: Definición de la arquitectura de la aplicación web
- **Referencia:** Prerrequisito al desarrollo de la aplicación
- **Como:** Equipo de desarrollo
- **Necesito:** Definir la arquitectura de la aplicación web estableciendo las tres capas del sistema, sus responsabilidades e interfaces de comunicación
- **Para:** Garantizar un desarrollo escalable y mantenible, asegurando la modularidad del código fuente y facilitando la documentación técnica del sistema
- **Tareas técnicas:**
  - Definir y documentar el diagrama de arquitectura cliente-servidor en tres capas.
  - Especificar las responsabilidades de cada capa.
  - Definir los protocolos de comunicación entre capas.
- **Criterios de aceptación:**
  - El diagrama de arquitectura describe las tres capas y sus interfaces de comunicación.
  - Revisión y aprobación por parte del Product owner.
- **Prioridad:** Alta

### HT-002: Configuración del proyecto Angular
- **Referencia:** RNF-004
- **Como:** Equipo de desarrollo
- **Necesito:** Inicializar el proyecto Angular con una arquitectura modular, rutas con protección por rol y variables de entorno para desarrollo y producción
- **Para:** Contar con una base de interfaz web organizada, segura y compatible con navegadores actuales que permita integrar los módulos funcionales del sistema
- **Tareas técnicas:**
  - Inicializar el proyecto Angular y configurar la estructura de carpetas y módulos principales.
  - Definir las rutas base de la aplicación y aplicar restricciones de acceso según el rol.
  - Configurar la gestión de sesiones y tokens para mantener la autenticación entre peticiones.
  - Preparar los archivos de entorno para diferenciar configuración de desarrollo y producción.
  - Verificar la compatibilidad básica en Google Chrome, Mozilla Firefox y Microsoft Edge.
- **Criterios de aceptación:**
  - El proyecto Angular se ejecuta correctamente en entorno de desarrollo y producción.
  - Las rutas protegen los módulos según el rol identificado y redirigen al login si no hay sesión activa.
  - La aplicación se visualiza sin errores críticos en los navegadores especificados.
- **Prioridad:** Alta

### HT-003: Configuración del servidor con arquitectura en capas y autenticación segura
- **Referencia:** RNF-001 / RNF-002
- **Como:** Equipo de desarrollo
- **Necesito:** Inicializar el servidor Express, estructurar los endpoints base e implementar el flujo de validación de credenciales con encriptación hash para la contraseña y verificación de roles
- **Para:** Establecer una API funcional y segura que gestione el inicio de sesión, valide permisos según el rol y garantice la protección de datos sensibles
- **Tareas técnicas:**
  - Inicializar el proyecto Node.js con Express y configurar los parámetros básicos del servidor.
  - Estructurar los directorios por capa.
  - Integrar encriptación con bcrypt para la encriptación de la contraseña.
  - Aplicar validación de roles en las rutas principales para restringir el acceso según el perfil.
  - Configurar manejo básico de errores y respuestas estandarizadas.
- **Criterios de aceptación:**
  - El servidor responde correctamente a peticiones básicas y gestiona errores sin exponer información sensible.
  - El inicio de sesión valida credenciales, devuelve un token válido y bloquea accesos con datos incorrectos.
  - La contraseña se almacena hasheada en la base de datos y nunca en texto plano.
  - Un usuario sin el rol adecuado recibe denegación de acceso al intentar usar endpoints restringidos.
- **Prioridad:** Alta

### HT-004: Diseño e implementación del esquema relacional
- **Referencia:** RNF-003
- **Como:** Equipo de desarrollo
- **Necesito:** Diseñar e implementar el esquema relacional en PostgreSQL con todas las tablas, relaciones, restricciones de integridad referencial e índices requeridos por el sistema
- **Para:** Garantizar la integridad, consistencia y persistencia de todos los datos del sistema, soportando las operaciones de emisión y revocación de insignias sin pérdida de información
- **Tareas técnicas:**
  - Diseñar el modelo entidad-relación (MER) cubriendo los requisitos establecidos.
  - Implementar las tablas resultantes del diseño en PostgreSQL.
  - Definir claves primarias, foráneas y restricciones de integridad referencial.
  - Configurar respaldos automáticos diarios de la base de datos.
  - Utilizar tipo JSONB para los metadatos Open Badges 3.0.
- **Criterios de aceptación:**
  - Todas las claves foráneas tienen restricciones ON DELETE apropiadas.
  - El campo de metadatos utiliza tipo JSONB de PostgreSQL.
  - El sistema de respaldo automático diario está configurado y funcional.
- **Prioridad:** Alta

### HT-005: Implementación del servicio de firma criptográfica EdDSA (Ed25519)
- **Referencia:** RNF-001
- **Como:** Equipo de desarrollo
- **Necesito:** Implementar el servicio de firma digital de insignias conforme al estándar Open Badges 3.0 usando el algoritmo EdDSA (Ed25519), generando credenciales verificables estructura JSON-LD
- **Para:** Garantizar la autenticidad, integridad e interoperabilidad de cada insignia emitida conforme al estándar
- **Tareas técnicas:**
  - Implementar la generación del documento JSON-LD de la insignia con los campos requeridos por Open Badges 3.0.
  - Implementar la función de firma digital EdDSA (Ed25519) sobre el contenido del documento JSON-LD.
  - Incrustar la firma y el certificado público en la estructura de la credencial generada.
  - Almacenar la clave privada de forma segura mediante variable de entorno.
  - Generar el par de claves Ed25519 del sistema y almacenar la clave privada cifrada con AES-256 en la configuración del sistema.
- **Criterios de aceptación:**
  - Cada insignia emitida contiene un campo prueba con tipo EdDSA (Ed25519), presenta un valor de firma válido.
  - La clave privada no está presente en el repositorio de código fuente.
  - El documento JSON-LD generado contiene los campos obligatorios del estándar Open Badges 3.0.
  - La clave privada se almacena cifrada y nunca es expuesta en ningún endpoint público.
- **Prioridad:** Alta

### HT-006: Validación de metadatos Open Badges 3.0 y verificación pública
- **Referencia:** RNF-001
- **Como:** Equipo de desarrollo
- **Necesito:** Implementar la validación de metadatos y el endpoint público de verificación de insignias
- **Para:** Prevenir la generación de credenciales con estructura inválida y permitir a terceros verificar públicamente la autenticidad de las insignias emitidas
- **Tareas técnicas:**
  - Definir el esquema de validación basado en los campos requeridos por Open Badges 3.0.
  - Implementar la validación de metadatos como paso previo obligatorio a la firma en el flujo de emisión.
  - Implementar el endpoint público que retorne el estado y metadatos de la insignia sin requerir autenticación.
  - Generar y almacenar la URL pública única y persistente de cada insignia al momento de su emisión.
- **Criterios de aceptación:**
  - Una insignia con todos los campos correctamente completos pasa la validación sin errores.
  - Si la validación falla, el sistema muestra los campos inválidos y no procede con la firma.
  - El endpoint público retorna el estado actual de la insignia sin requerir inicio de sesión.
  - Cada insignia emitida tiene una URL pública única y accesible.
- **Prioridad:** Media

### HT-007: Implementación del PNG con metadatos incrustados
- **Referencia:** RNF-001
- **Como:** Equipo de desarrollo
- **Necesito:** Implementar el proceso de badge baking que incrusta los metadatos JSON-LD de Open Badges 3.0 directamente dentro de los chunks del archivo PNG de la insignia
- **Para:** Permitir que las insignias exportadas en formato PNG sean portables y verificables por plataformas externas sin depender del sistema
- **Tareas técnicas:**
  - Implementar la función de badge baking que incrusta el JSON-LD en los metadatos del PNG.
  - Verificar que el PNG "bakeado" supera la validación de al menos un verificador Open Badges externo.
  - Implementar la exportación del archivo JSON-LD como formato alternativo de descarga.
- **Criterios de aceptación:**
  - El PNG exportado contiene los metadatos Open Badges 3.0 correctamente incrustados.
  - El PNG "bakeado" es verificado exitosamente por un verificador Open Badges externo.
  - El archivo JSON-LD exportado contiene la estructura completa conforme al estándar.
- **Prioridad:** Media

### HT-008: Configuración de entornos y despliegue del sistema
- **Referencia:** RNF-004
- **Como:** Equipo de desarrollo
- **Necesito:** Configurar los entornos de desarrollo y producción, habilitar HTTPS como canal exclusivo y preparar el procedimiento de despliegue del sistema
- **Para:** Garantizar que el sistema puede ser desplegado de forma reproducible y que todas las comunicaciones están protegidas
- **Tareas técnicas:**
  - Configurar el entorno de desarrollo con variables de entorno separadas del entorno de producción.
  - Habilitar el protocolo HTTPS y configurar redirección automática de HTTP a HTTPS.
  - Preparar los scripts de despliegue del backend y el build de producción del frontend Angular.
  - Documentar el procedimiento completo de despliegue en el README del proyecto.
- **Criterios de aceptación:**
  - El sistema se puede desplegar en un entorno limpio siguiendo los pasos documentados.
  - Todas las comunicaciones entre cliente y servidor utilizan HTTPS por defecto.
  - Las variables sensibles se gestionan mediante variables de entorno y no están en el código fuente.
- **Prioridad:** Media

### HT-009: Identificación externa del receptor
- **Referencia:** RNF-006
- **Como:** Equipo de desarrollo
- **Necesito:** Establecer el correo institucional del Receptor, en formato `mailto:`, como su identificador externo dentro del assertion JSON-LD de cada insignia emitida, conforme al estándar Open Badges 3.0
- **Para:** Garantizar que cada insignia emitida identifique al receptor con un valor verificable por terceros dentro del assertion JSON-LD
- **Tareas técnicas:**
  - Definir el correo institucional como dato obligatorio del Receptor en el esquema de la base de datos.
  - Implementar en la generación del assertion JSON-LD la asignación del campo `credentialSubject.id` con el correo en formato `mailto:`.
  - Implementar la validación previa a la emisión, que comprueba que el Receptor tenga correo registrado y bloquea la emisión con un mensaje de error en caso contrario.
  - Validar el assertion generado con la herramienta de validación de 1EdTech.
- **Criterios de aceptación:**
  - Dado que el sistema emite una insignia, cuando genera el assertion JSON-LD, entonces el campo `credentialSubject.id` contiene el correo del receptor en formato `mailto:correo@espoch.edu.ec`.
  - Dado que el correo del receptor no está registrado, cuando el sistema intenta emitir la insignia, entonces bloquea la emisión y notifica el error.
- **Prioridad:** Baja


<!-- Start of picture text -->
S Zqv03Tiiog ><br>Fyz/ Of G-,aa aQ<br>g gle \*<br>5<br>g AO 2<br>eeTermo asines<br><!-- End of picture text -->



<!-- Start of picture text -->
1<br>iff,<br><!-- End of picture text -->

## **ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO** 

## **FACULTAD DE INFORMÁTICA Y ELÉCTRONICA** 

## **CARRERA DE SOFTWARE** 

**Asignatura:** Aplicaciones Informáticas II 

**Tema:** Historias de Usuario, Historias Técnicas y Pila del Producto V5 

**Proyecto:** Desarrollo de una aplicación web para la gestión de perfiles académicos mediante microcredenciales e insignias digitales en la ESPOCH 

**Fecha de última actualización:** 03 – 05 – 2026 

## **Nombre:** 

Andrés Sebastián Peralta Ramos (7356) 

**Período académico:** 

Marzo 2026 – Julio 2026 

2 

# **Contenido** 

|1.<br>His|torias de usuario ................................................................................................................. 3|
|---|---|
|1.1.|Módulo de autenticación y gestión de usuarios .............................................................. 3|
|1.2.|Módulo de gestión de microcredenciales ........................................................................ 6|
|1.3.|Módulo de emisión y validación de insignias digitales .................................................. 8|
|1.4.|Módulo del perfil académico .......................................................................................... 9|
|2.<br>His|torias técnicas ................................................................................................................... 13|
|3.<br>Pil|a del producto .................................................................................................................... 19|



3 

## **1. Historias de usuario** 

## **1.1. Módulo de autenticación y gestión de usuarios** 

||**HU-001 Inicio de sesión seguro**|
|---|---|
|**Referencia**|RF-001|
|**Como**|Emisor / Receptor / Administrador|
|**Quiero**|Iniciar sesión ingresando mi correo institucional y contraseña|
|**Para**|Acceder al sistema con los privilegios correspondientes a mi rol y<br>gestionar las funcionalidades que me corresponden|
|**Criterios de**<br>**aceptación**|• Dado que el usuario ingresa correo y contraseña válidos,<br>cuando hace clic en "Iniciar sesión", entonces el sistema valida<br>las credenciales y redirige al panel correspondiente según el rol.<br>• Dado que el usuario ingresa credenciales incorrectas, cuando<br>hace clic en "Iniciar sesión", entonces el sistema muestra el<br>mensaje "Credenciales inválidas" y permite reintentar hasta 3<br>veces.<br>• Dado que el usuario deja campos vacíos, cuando intenta iniciar<br>sesión, entonces el sistema muestra advertencias indicando que<br>los campos son obligatorios.<br>• Dado que el usuario supera el número máximo de intentos<br>fallidos, cuando intenta nuevamente, entonces el sistema<br>bloquea temporalmente la cuenta.|
|**Prioridad**|Alta|
|**Notas**|Pre-requisito para cualquier otra funcionalidad del sistema.|



||**HU-002 Simulación de restablecimiento de contraseña**|
|---|---|
|**Referencia**|RF-002|
|**Como**|Emisor / Receptor / Administrador|
|**Quiero**|Restablecer mi contraseña mediante un proceso simulado de verificación por correo|
|**Para**|Demostrar el flujo de recuperación de acceso al sistema, considerando que el inicio de sesión simula la autenticación institucional|
|**Criterios de**<br>**aceptación**|• Dado que el usuario solicita restablecer su contraseña, cuando<br>ingresa su correo institucional registrado, entonces el sistema<br>genera un token de verificación y simula el envío de un enlace<br>de recuperación (el enlace se registra en la consola del servidor<br>en lugar de enviarse por correo electrónico real).|



4 

||• Dado que el usuario accede al enlace de recuperación generado,|
|---|---|
||cuando ingresa y confirma la nueva contraseña, entonces el|
||sistema actualiza las credenciales y redirige al inicio de sesión.|
||• Dado que el enlace de verificación ha expirado (después de 1|
||hora) o ya fue utilizado, cuando el usuario intenta usarlo,|
||entonces el sistema muestra un mensaje de error indicando que el|
||enlace es inválido o ha expirado.|
|**Prioridad**|Alta|
|**Notas**|Esta funcionalidad opera como una simulación del flujo de<br>recuperación de contraseña institucional. El servicio de correo<br>no envía mensajes reales; en su lugar, imprime el enlace de<br>recuperación en la consola del servidor para fines de<br>demostración y pruebas.|



||**HU-003 Edición del perfil personal**|
|---|---|
|**Referencia**|RF-003|
|**Como**|Emisor / Receptor / Administrador|
|**Quiero**|Editar mi información de perfil personal|
|**Para**|Mantener actualizada mi información dentro del sistema|
|**Criterios de**<br>**aceptación**|• Dado que el usuario accede a su perfil, cuando edita sus datos<br>personales y guarda, entonces el sistema actualiza la<br>información y muestra confirmación.<br>• Dado que el usuario deja campos obligatorios vacíos, cuando<br>intenta guardar, entonces el sistema resalta los campos faltantes<br>y no permite continuar.|
|**Prioridad**|Alta|



||**HU-004 Gestión de usuarios**|
|---|---|
|**Referencia**|RF-004|
|**Como**|Administrador|
|**Quiero**|Crear, buscar, editar y eliminar cuentas de usuario|
|**Para**|Mantener actualizado el registro de usuarios y controlar quién tiene<br>acceso a la plataforma|
|**Criterios de**|• Dado que el Administrador accede al módulo de usuarios,<br>cuando solicita la lista, entonces el sistema muestra todos los<br>usuarios registrados con su estado actual.|
|**aceptación**|• Dado que el Administrador ingresa los datos de un nuevo<br>usuario, cuando guarda el registro, entonces el sistema valida<br>duplicados de correo y crea la cuenta exitosamente.|



5 

   - Dado que el Administrador modifica información de un usuario existente, cuando confirma los cambios, entonces el sistema actualiza el registro y muestra confirmación. 

   - Dado que el Administrador deja campos obligatorios vacíos al modificar, el sistema notifica los campos faltantes y cancela la actualización de datos. 

- Dado que el Administrador selecciona eliminar un usuario, cuando confirma la acción, entonces el sistema solicita confirmación de seguridad y elimina el registro. 

- • Dado que el correo ya existe, cuando se intenta registrar, entonces el sistema notifica "Usuario ya registrado" y solicita un correo diferente. 

- **Prioridad** Alta 

||**HU-005 Administración de roles y permisos**|
|---|---|
|**Referencia**|RF-005|
|**Como**|Administrador|
|**Quiero**|Asignar, agregar y editar roles y permisos a los usuarios registrados,<br>incluyendo mi propia cuenta|
|**Para**|Controlar el nivel de acceso de cada usuario a los módulos y<br>funcionalidades del sistema según su perfil|
|**Criterios de**<br>**aceptación**|• Dado que el Administrador selecciona un usuario, cuando<br>accede a "Administrar roles y permisos", entonces el sistema<br>muestra la configuración actual de roles y permisos.<br>• Dado que el Administrador modifica el rol de un usuario,<br>cuando confirma los cambios, entonces el sistema aplica los<br>nuevos permisos de forma inmediata.<br>• Dado que el Administrador asigna el rol de Emisor, cuando el<br>usuario inicia sesión, entonces solo puede acceder a las<br>funcionalidades de gestión de microcredenciales e insignias.<br>• Dado que el Administrador asigna el rol de Receptor, cuando el<br>usuario inicia sesión, entonces solo puede acceder a la gestión<br>de insignias obtenidas y perfil académico.<br>• Dado que el Administrador asigna el rol de Emisor y Receptor,<br>cuando el usuario inicia sesión, entonces puede acceder a las<br>funcionalidades de ambas partes.|



6 

Alta 

||**HU-017 Panel de estadísticas por rol (Dashboard)**|
|---|---|
|**Referencia**|Complemento a RF-001|
|**Como**|Administrador / Emisor / Receptor|
|**Quiero**|Visualizar un panel de estadísticas personalizado según mi rol al acceder al sistema|
|**Para**|Obtener una vista general del estado de los recursos que gestiono o que me conciernen dentro de la plataforma|
|**Criterios de**<br>**aceptación**|• Dado que el Administrador accede al sistema, cuando se carga<br>el dashboard, entonces se muestran tarjetas con el total de<br>usuarios registrados, microcredenciales registradas e insignias<br>emitidas en el sistema, gráficos circulares del estado de usuarios<br>(activos/inactivos), estado de microcredenciales (aprobadas,<br>pendientes, rechazadas, inactivas), distribución de usuarios por<br>rol (Administrador, Emisor, Receptor) y estado de insignias<br>(activas/revocadas), además de un listado de las últimas<br>microcredenciales pendientes por aprobar.<br>• Dado que el Emisor accede al sistema, cuando se carga el<br>dashboard, entonces se muestran tarjetas con el total de<br>microcredenciales creadas por él y el total de insignias emitidas<br>por él, gráficos circulares del estado de sus microcredenciales<br>y del estado de sus insignias, además de un listado de sus<br>microcredenciales más emitidas (Top 5).<br>• Dado que el Receptor accede al sistema, cuando se carga el<br>dashboard, entonces se muestran tarjetas con el total de<br>insignias obtenidas y el total de insignias mostradas en su perfil<br>público, un gráfico circular del estado de sus insignias<br>(activas/revocadas) y una galería de sus insignias obtenidas<br>más recientes con imagen, nombre y fecha de emisión.<br>• Dado que ocurre un error al cargar las estadísticas, cuando el<br>sistema no puede obtener los datos, entonces se muestra un<br>mensaje de error informativo.|
|**Prioridad**|Media|
|**Notas**|Cada rol visualiza únicamente los datos que le corresponden.<br>Los datos se obtienen de endpoints protegidos por rol en el<br>backend (/estadisticas/administrador, /estadisticas/emisor,<br>/estadisticas/receptor).|



## **1.2. Módulo de gestión de microcredenciales** 

||**HU-006 Gestión de microcredenciales**|
|---|---|
|**Referencia**|RF-006|
|**Como**|Administrador / Emisor|
|**Quiero**|Buscar, eliminar lógicamente y modificar el estado de<br>microcredenciales|
|**Para**|Controlar la disponibilidad de las microcredenciales en el sistema|
|**Criterios de**<br>**aceptación**|• Dado que el usuario accede al módulo de microcredenciales,<br>cuando aplica filtros de búsqueda, entonces el sistema muestra<br>solo las microcredenciales que coinciden con los criterios.<br>• Dado que el usuario selecciona una microcredencial aprobada y<br>elige modificar estado (activa o inactiva), cuando confirma el<br>nuevo estado, entonces el sistema actualiza el registro y<br>refresca el listado.<br>• Dado que un Emisor inactive una microcredencial, no podrá<br>cambiar el estado de esta a menos que lo haga un<br>Administrador.<br>• Dado que la microcredencial tiene insignias emitidas, cuando el<br>usuario intenta cambiar el estado, entonces el sistema muestra<br>una advertencia sobre el impacto en las insignias existentes.<br>• Dado que el usuario selecciona eliminar una microcredencial,<br>cuando confirma la acción, entonces el sistema la oculta del<br>listado principal preservando el historial de insignias emitidas.<br>• Dado que la microcredencial está en estado "Pendiente de<br>aprobación", cuando el Emisor intenta modificar su estado,<br>entonces el sistema bloquea la acción y muestra un aviso.|
|**Prioridad**|Alta|



||**HU-007 Aprobación de microcredenciales**|
|---|---|
|**Referencia**|RF-007|
|**Como**|Administrador|



7 

|**Quiero**|Revisar las microcredenciales pendientes y aprobarlas o rechazarlas<br>con una justificación|
|---|---|
|**Para**|Garantizar que únicamente las microcredenciales que cumplen los<br>estándares institucionales queden disponibles para emisión|
|**Criterios de**<br>**aceptación**|• Dado que existen microcredenciales en estado "Pendiente de<br>aprobación", cuando el Administrador accede al módulo,<br>entonces el sistema muestra la lista de pendientes con sus<br>detalles completos.<br>• Dado que el Administrador selecciona "Aprobar", cuando<br>confirma la acción, entonces el sistema cambia el estado a<br>"Aprobada" y notifica al Emisor.<br>• Dado que el Administrador selecciona "Rechazar", cuando<br>ingresa la justificación obligatoria y confirma, entonces el<br>sistema cambia el estado a "Rechazada" y notifica al Emisor<br>por correo los motivos.<br>• Dado que no existen microcredenciales pendientes, cuando el<br>Administrador accede al módulo, entonces el sistema muestra<br>"No hay microcredenciales para aprobar".|
|**Prioridad**|Alta|



|**HU-00**|**8 Registro de microcredencial con metadatos e insignia digital**|
|---|---|
|**Referencia**|RF-008 / RF-009|
|**Como**|Emisor|
|**Quiero**|Registrar una nueva microcredencial definiendo sus metadatos<br>académicos bajo el estándar Open Badges 3.0 y diseñando o cargando<br>la insignia digital asociada|
|**Para**|Crear una oferta de certificación académica verificable que pueda ser<br>emitida a los estudiantes que cumplan los requisitos|
|**Criterios de**<br>**aceptación**|• Dado que el Emisor completa el formulario con todos los<br>campos obligatorios, cuando guarda la microcredencial,<br>entonces el sistema la almacena en estado "Pendiente de<br>aprobación" y muestra confirmación.<br>• Dado que el Emisor carga una imagen de insignia, cuando el<br>sistema la valida, entonces verifica formato, tamaño y<br>resolución antes de asociarla.|



8 

- Dado que el Emisor seleccione la opción de “Diseñar insignia digital”, el sistema abrirá una sección con herramientas de diseño, un formato y tamaño predefinidos para asociarla a la microcredencial. 

- • Dado que el Emisor deja campos obligatorios vacíos, cuando intenta guardar, entonces el sistema resalta los campos faltantes y no permite continuar. 

- • Dado que el Emisor configura los metadatos, cuando el sistema los procesa, entonces los estructura internamente conforme al estándar Open Badges 3.0. 

- • Dado que el Emisor intenta registrar una microcredencial con el mismo nombre que una existente, cuando intenta guardar, entonces el sistema notifica "Microcredencial ya existe". 

- **Prioridad** Alta 

## **1.3. Módulo de emisión y emisión de insignias digitales** 

||**HU-009 Visualización de insignias emitidas**|
|---|---|
|**Referencia**|RF-010|
|**Como**|Administrador|
|**Quiero**|Ver y buscar todas las insignias digitales emitidas por los Emisores|
|**Para**|Tener visibilidad global del sistema con fines de auditoría y<br>supervisión institucional|
|**Criterios de**<br>**aceptación**|• Dado que el Administrador accede al módulo de insignias,<br>cuando el sistema carga el listado, entonces muestra todas las<br>insignias emitidas con información resumida.<br>• Dado que el Administrador aplica filtros de búsqueda, cuando<br>el sistema procesa la consulta, entonces muestra solo las<br>insignias que coinciden con los criterios.<br>• Dado que el Administrador selecciona una insignia, cuando<br>solicita ver los detalles, entonces el sistema presenta<br>información completa incluyendo Receptor, Emisor, fecha y<br>estado.|
|**Prioridad**|Media|



9 

||**HU-010 Gestión de insignias digitales**|
|---|---|
|**Referencia**|RF-011|
|**Como**|Emisor|
|**Quiero**|Emitir, buscar en mi historial y revocar insignias digitales|
|**Para**|Certificar y mantener trazabilidad de los logros académicos otorgados<br>a los Receptores|
||• Dado que el Emisor selecciona una microcredencial aprobada y<br>uno o varios Receptores, cuando confirma la emisión, entonces<br>el sistema aplica la firma criptográfica EdDSA (Ed25519) y registra la<br>emisión con fecha, hora y metadatos completos.<br>• Dado que el sistema completa la firma, cuando la emisión<br>finaliza, entonces el Receptor recibe una notificación por<br>correo.<br>• Dado que el Receptor ya posee esa insignia, cuando el Emisor<br>intenta emitirla nuevamente, entonces el sistema muestra "El|
|**Criterios de**<br>**aceptación**|Receptor ya tiene esta insignia".<br>• Dado que el Emisor consulta su historial, cuando aplica filtros,<br>entonces el sistema muestra solo las emisiones que coinciden<br>con los criterios seleccionados.<br>• Dado que el Emisor selecciona una insignia activa y elige<br>revocarla, cuando ingresa la justificación y confirma, entonces<br>el sistema cambia el estado a "Revocada" y notifica al Receptor<br>por correo.<br>• Dado que el Emisor deja vacía la justificación de revocación,<br>cuando intenta confirmar, entonces el sistema muestra "La<br>justificación es obligatoria" y no permite continuar.|
|**Prioridad**|Alta|



## **1.4. Módulo de perfil académico** 

||**HU-011 Gestión de insignias adquiridas**|
|---|---|
|**Referencia**|RF-012|
|**Como**|Receptor|



10 

|**Quiero**|Buscar, filtrar y exportar mis insignias digitales obtenidas|
|---|---|
|**Para**|Gestionar y compartir mis certificaciones académicas verificables|
||• Dado que el Receptor accede a su perfil, cuando el sistema<br>carga el contenido, entonces muestra todas las insignias<br>organizadas por fecha de emisión.<br>• Dado que el Receptor aplica filtros de búsqueda, cuando el<br>sistema procesa la consulta, entonces muestra solo las insignias<br>que coinciden con los criterios.|
|**Criterios de**<br>**aceptación**|• Dado que el Receptor selecciona una insignia y elige exportar,<br>cuando el sistema genera el archivo, entonces produce el<br>archivo en formato PNG con metadatos Open Badges 3.0<br>incrustados o en formato JSON-LD de acuerdo a la selección<br>del usuario.|
||• Dado que una insignia fue revocada, cuando el Receptor la<br>visualiza, entonces el sistema muestra una advertencia<br>indicando que la certificación ya no es válida.|
|**Prioridad**|Alta|



||**HU-012 Verificación por terceros**|
|---|---|
|**Referencia**|RF-013|
|**Como**|Receptor|
|**Quiero**|Compartir una URL pública única de cada insignia|
|**Para**|Permitir que empleadores u otras instituciones verifiquen la<br>autenticidad de mis certificaciones sin necesidad de acceder al sistema|
|**Criterios de**<br>**aceptación**|• Dado que el Receptor selecciona una insignia y elige compartir<br>URL, cuando el sistema genera el enlace, entonces produce una<br>URL pública única y persistente de la insignia.<br>• Dado que un tercero accede a la URL pública, cuando el<br>sistema carga la página, entonces muestra el estado actual de la<br>insignia (activa o revocada) con sus metadatos sin requerir<br>inicio de sesión.<br>• Dado que un tercero accede a “Prueba criptográfica”, el sistema<br>muestra el assertion JSON-LD completo de la insignia digital.|
|**Prioridad**|Alta|



11 

||**HU-013 Visualización y gestión del perfil académico**|
|---|---|
|**Referencia**|RF-014 / RF-015|
|**Como**|Receptor|
|**Quiero**|Visualizar mi perfil académico, agrupar mis insignias por categorías,<br>agregar o quitar insignias de mi vista pública y exportar mi perfil en<br>PDF|
|**Para**|Presentar de forma profesional y personalizada mis logros académicos<br>digitales|
|**Criterios de**<br>**aceptación**|• Dado que el Receptor accede a su perfil académico, cuando el<br>sistema lo carga, entonces muestra todas las insignias obtenidas<br>con opciones de organización.<br>• Dado que el Receptor agrupa insignias por categorías definidas,<br>cuando guarda los cambios, entonces el sistema refleja la nueva<br>organización.<br>• Dado que el Receptor agrega una insignia a su vista pública,<br>cuando guarda la configuración, entonces la insignia aparece en<br>su perfil público.<br>• Dado que el Receptor elimina una insignia de su vista pública,<br>cuando guarda la configuración, entonces la insignia<br>desaparece del perfil público, pero permanece en el registro del<br>sistema y de su cuenta.<br>• Dado que el Receptor solicita exportar su perfil en PDF, cuando<br>el sistema genera el archivo, entonces produce un PDF con sus<br>datos personales e insignias organizadas como hoja de vida<br>digital.|
|**Prioridad**|Media|



|**H**|**U-014 Visualización pública de perfiles y microcredenciales**|
|---|---|
|**Referencia**|RF-016 / RF-017|
|**Como**|Emisor / Receptor / Administrador / Usuario no registrado|
|**Quiero**|Visualizar el perfil académico de los usuarios del sistema y los usuarios<br>acreedores de insignias digitales de determinada microcredencial|
|**Para**|Visualizar públicamente los méritos académicos obtenidos por<br>estudiantes y docentes de la ESPOCH|



12 

||• Dado que el usuario accede al catálogo, cuando realiza una<br>búsqueda de microcredenciales, entonces el sistema muestra el<br>listado de acuerdo a los parámetros de su búsqueda.<br>• Dado que el usuario visualiza una microcredencial específica,<br>cuando da clic en “Ver acreedores” entonces el sistema<br>despliega la lista de Receptores que han obtenido dicha|
|---|---|
|**Criterios de**|certificación.|
|**aceptación**|• Dado que un tercero busca un perfil por nombre o cédula,<br>cuando el sistema lo localiza, entonces muestra el perfil público<br>del Receptor con sus insignias obtenidas, marcadas para<br>mostrar, sin requerir inicio de sesión.|
||• Dado que se busca un perfil inexistente, cuando el sistema<br>procesa la consulta, entonces muestra el mensaje "Perfil no<br>encontrado".|
|**Prioridad**|Media|



||**HU-015 Identificación externa del receptor**|
|---|---|
|**Referencia**|RF-018|
|**Como**|Sistema|
|**Quiero**|Usar el correo institucional del receptor en formato mailto: como su<br>identificador externo (conforme al estándar Open Badges 3.0)|
|**Para**|Garantizar que cada insignia emitida identifique al receptor con un<br>valor verificable por terceros dentro del assertion JSON-LD|
|**Criterios de**<br>**aceptación**|• Dado que el sistema emite una insignia, cuando genera el<br>assertion JSON-LD, entonces el campo credentialSubject.id<br>contiene el correo del receptor en formato<br>mailto:correo@espoch.edu.ec.<br>• Dado que el correo del receptor no está registrado, cuando el<br>sistema intenta emitir la insignia, entonces bloquea la emisión y<br>notifica el error.|
|**Prioridad**|Alta|



||**HU-016 Acceso al perfil público institucional**|
|---|---|
|**Referencia**|RF-019|



13 

|**Como**|Emisor / Receptor / Administrador / Usuario no registrado|
|---|---|
|**Quiero**|Acceder a la URL pública institucional del emisor|
|**Para**|Obtener la clave pública Ed25519 del sistema y verificar<br>criptográficamente la autenticidad de cualquier insignia emitida por la<br>plataforma|
|**Criterios de**<br>**aceptación**|• Dado que un tercero accede a la URL pública institucional,<br>cuando el sistema procesa la solicitud, entonces retorna un<br>documento JSON con el nombre de la institución, correo<br>institucional y clave pública Ed25519 en formato JWK.<br>• Dado que la URL pública institucional es referenciada desde el<br>campo issuer.id del assertion, cuando un verificador externo la<br>consulta, entonces obtiene la clave pública necesaria para<br>validar la firma EdDSA (Ed25519).|
|**Prioridad**|Alta|



## **2. Historias técnicas** 

|**HT**|**-001 Definición de la arquitectura de la aplicación web**|
|---|---|
|**Referencia**|Prerequisito al desarrollo de la aplicación|
|**Como**|Equipo de desarrollo|
|**Necesito**|Definir la arquitectura de la aplicación web estableciendo las tres capas<br>del sistema, sus responsabilidades e interfaces de comunicación|
|**Para**|Garantizar un desarrollo escalable y mantenible, asegurando la<br>modularidad del código fuente y facilitando la documentación técnica<br>del sistema|
|**Tareas técnicas**|• Definir y documentar el diagrama de arquitectura cliente-<br>servidor en tres capas.<br>• Especificar las responsabilidades de cada capa.<br>• Definir los protocolos de comunicación entre capas.|
|**Criterios de**<br>**aceptación**|• El diagrama de arquitectura describe las tres capas y sus<br>interfaces de comunicación.<br>• Revisión y aprobación por parte del Product Owner.|
|**Prioridad**|Alta|



14 

||**HT-002 Configuración del proyecto Angular**|
|---|---|
|**Referencia**|RNF-004|
|**Como**|Equipo de desarrollo|
|**Necesito**|Inicializar el proyecto Angular con una arquitectura modular, rutas con<br>protección por rol y variables de entorno para desarrollo y producción|
|**Para**|Contar con una base de interfaz web organizada, segura y compatible<br>con navegadores actuales que permita integrar los módulos funcionales<br>del sistema|
|**Tareas técnicas**|• Inicializar el proyecto Angular y configurar la estructura de<br>carpetas y módulos principales.<br>• Definir las rutas base de la aplicación y aplicar restricciones de<br>acceso según el rol.<br>• Configurar la gestión de sesiones y tokens para mantener la<br>autenticación entre peticiones.<br>• Preparar los archivos de entorno para diferenciar configuración<br>de desarrollo y producción.<br>• Verificar la compatibilidad básica en Google Chrome, Mozilla<br>Firefox y Microsoft Edge.|
|**Criterios de**<br>**aceptación**|• El proyecto Angular se ejecuta correctamente en entorno de<br>desarrollo y producción.<br>• Las rutas protegen los módulos según el rol identificado y<br>redirigen al login si no hay sesión activa.<br>• La aplicación se visualiza sin errores críticos en los<br>navegadores especificados.|
|**Prioridad**|Alta|



|**HT-003 Confi**|**guración del servidor con arquitectura en capas y autenticación segura**|
|---|---|
|**Referencia**|RNF-001 / RNF-002|
|**Como**|Equipo de desarrollo|
||Inicializar el servidor Express, estructurar los endpoints base e|
|**Necesito**|implementar el flujo de validación de credenciales con encriptación<br>hash para la contraseña y verificación de roles|



15 

|**Para**|Establecer una API funcional y segura que gestione el inicio de sesión,<br>valide permisos según el rol y garantice la protección de datos<br>sensibles|
|---|---|
|**Tareas técnicas**|• Inicializar el proyecto Node.js con Express y configurar los<br>parámetros básicos del servidor.<br>• Estructurar los directorios por capa.<br>• Integrar encriptación con bcrypt para la encriptación de la<br>contraseña.<br>• Aplicar validación de roles en las rutas principales para<br>restringir el acceso según el perfil.<br>• Configurar manejo básico de errores y respuestas<br>estandarizadas.|
|**Criterios de**<br>**aceptación**|• El servidor responde correctamente a peticiones básicas y<br>gestiona errores sin exponer información sensible.<br>• El inicio de sesión valida credenciales, devuelve un token<br>válido y bloquea accesos con datos incorrectos.<br>• La contraseña se almacena hasheada en la base de datos y<br>nunca en texto plano.<br>• Un usuario sin el rol adecuado recibe denegación de acceso al<br>intentar usar endpoints restringidos.|
|**Prioridad**|Alta|



|**H**|**T-004 Diseño e implementación del esquema relacional**|
|---|---|
|**Referencia**|RNF-003|
|**Como**|Equipo de desarrollo|
|**Necesito**|Diseñar e implementar el esquema relacional en PostgreSQL con todas<br>las tablas, relaciones, restricciones de integridad referencial e índices<br>requeridos por el sistema|
|**Para**|Garantizar la integridad, consistencia y persistencia de todos los datos<br>del sistema, soportando las operaciones de emisión y revocación de<br>insignias sin pérdida de información|
|**Tareas técnicas**|• Diseñar el modelo entidad-relación (MER) cubriendo los<br>requisitos establecidos.<br>• Implementar las tablas resultantes del diseño en PostgreSQL.|



16 

||• Definir claves primarias, foráneas y restricciones de integridad<br>referencial.<br>• Configurar respaldos automáticos diarios de la base de datos.<br>• Utilizar tipo JSONB para los metadatos Open Badges 3.0.|
|---|---|
|**Criterios de**<br>**aceptación**|• Todas las claves foráneas tienen restricciones ON DELETE<br>apropiadas.<br>• El campo de metadatos utiliza tipo JSONB de PostgreSQL.<br>• El sistema de respaldo automático diario está configurado y<br>funcional.|
|**Prioridad**|Alta|



|**HT-005**|**Implementación del servicio de firma criptográfica EdDSA (Ed25519)**|
|---|---|
|**Referencia**|RNF-001|
|**Como**|Equipo de desarrollo|
|**Necesito**|Implementar el servicio de firma digital de insignias conforme al<br>estándar Open Badges 3.0 usando el algoritmo EdDSA (Ed25519), generando<br>credenciales verificables con estructura JSON-LD|
|**Para**|Garantizar la autenticidad, integridad e interoperabilidad de cada<br>insignia emitida conforme al estándar|
|**Tareas técnicas**|• Implementar la generación del documento JSON-LD de la<br>insignia con los campos requeridos por Open Badges 3.0.<br>• Implementar la función de firma digital EdDSA (Ed25519) sobre el<br>contenido del documento JSON-LD.<br>• Incrustar la firma y el certificado público en la estructura de la<br>credencial generada.<br>• Almacenar la clave privada de forma segura mediante variable<br>de entorno.<br>• Generar el par de claves Ed25519 del sistema y<br>almacenar la clave privada cifrada con AES-256 en la<br>configuracion_sistema.|
|**Criterios de**<br>**aceptación**|• Cada insignia emitida contiene un campo proof con tipo<br>EdDSA (Ed25519), fecha y valor de firma válido.<br>• La clave privada no está presente en el repositorio de código<br>fuente.|



17 

||• El documento JSON-LD generado contiene los campos|
|---|---|
||obligatorios del estándar Open Badges 3.0.|
||• La clave privada se almacena cifrada y nunca es expuesta en|
||ningún endpoint público.|
|**Prioridad**|Alta|



|**HT-006 V**|**alidación de metadatos Open Badges 3.0 y verificación pública**|
|---|---|
|**Referencia**|RNF-001|
|**Como**|Equipo de desarrollo|
|**Necesito**|Implementar la validación de metadatos y el endpoint público de<br>verificación de insignias|
|**Para**|Prevenir la generación de credenciales con estructura inválida y<br>permitir a terceros verificar públicamente la autenticidad de las<br>insignias emitidas|
|**Tareas técnicas**|• Definir el esquema de validación basado en los campos<br>requeridos por Open Badges 3.0.<br>• Implementar la validación de metadatos como paso previo<br>obligatorio a la firma en el flujo de emisión.<br>• Implementar el endpoint público que retorne el estado y<br>metadatos de la insignia sin requerir autenticación.<br>• Generar y almacenar la URL pública única y persistente de<br>cada insignia al momento de su emisión.|
|**Criterios de**<br>**aceptación**|• Una insignia con todos los campos correctamente completos<br>pasa la validación sin errores.<br>• Si la validación falla, el sistema muestra los campos inválidos y<br>no procede con la firma.<br>• El endpoint público retorna el estado actual de la insignia sin<br>requerir inicio de sesión.<br>• Cada insignia emitida tiene una URL pública única y accesible.|
|**Prioridad**|Alta|



||**HT-007 Implementación del PNG con metadatos incrustados**|
|---|---|
|**Referencia**|RNF-001|



18 

|**Como**|Equipo de desarrollo|
|---|---|
|**Necesito**|Implementar el proceso de badge baking que incrusta los metadatos<br>JSON-LD de Open Badges 3.0 directamente dentro de los chunks del<br>archivo PNG de la insignia|
|**Para**|Permitir que las insignias exportadas en formato PNG sean portables y<br>verificables por plataformas externas como LinkedIn sin depender del<br>sistema|
|**Tareas técnicas**|• Implementar la función de badge baking que incrusta el JSON-<br>LD en los metadatos del PNG.<br>• Verificar que el PNG bakeado supera la validación de al menos<br>un verificador Open Badges externo.<br>• Implementar la exportación del archivo JSON-LD como<br>formato alternativo de descarga.|
||• El PNG exportado contiene los metadatos Open Badges 3.0<br>correctamente incrustados.|
|**Criterios de**<br>**aceptación**|• El PNG bakeado es verificado exitosamente por un verificador<br>Open Badges externo.<br>• El archivo JSON-LD exportado contiene la estructura completa<br>conforme al estándar.|
|**Prioridad**|Alta|



|**HT-**|**008 Configuración de entornos y despliegue del sistema**|
|---|---|
|**Referencia**|RNF-004|
|**Como**|Equipo de desarrollo|
|**Necesito**|Configurar los entornos de desarrollo y producción, habilitar HTTPS<br>como canal exclusivo y preparar el procedimiento de despliegue del<br>sistema|
|**Para**|Garantizar que el sistema puede ser desplegado de forma reproducible<br>y que todas las comunicaciones están protegidas|
|**Tareas técnicas**|• Configurar el entorno de desarrollo con variables de entorno<br>separadas del entorno de producción.<br>• Habilitar el protocolo HTTPS y configurar redirección<br>automática de HTTP a HTTPS.|



19 

||• Preparar los scripts de despliegue del backend y el build de<br>producción del frontend Angular.<br>• Documentar el procedimiento completo de despliegue en el<br>README del proyecto.|
|---|---|
||• El sistema se puede desplegar en un entorno limpio siguiendo<br>los pasos documentados.|
|**Criterios de**<br>**aceptación**|• Todas las comunicaciones entre cliente y servidor utilizan<br>HTTPS por defecto.|
||• Las variables sensibles se gestionan mediante variables de<br>entorno y no están en el código fuente.|
|**Prioridad**|Media|



## **3. Pila del producto** 

|**ID**|**Descripción**|**Prioridad**|**Sprint**|**Est.(días)**|
|---|---|---|---|---|
|HT-001|Definición de la arquitectura de la aplicación<br>web|Alta|Sprint 1|1|
|HT-002|Configuración delproyecto Angular|Alta|Sprint 1|1|
|HT-003|Configuración del servidor con<br>autenticación segura|Alta|Sprint 1|1|
|HT-004|Diseño e implementación del esquema<br>relacional|Alta|Sprint 1|2|
||**TOTAL SPRINT 1**|06/04/26 –|10/04/26|5|
|HT-005|Implementación del servicio de firma<br>criptográfica RS256|Alta|Sprint 2|2|
|HU-001|Inicio de sesión seguro|Alta|Sprint 2|2|
|HU-002|Restablecimiento de contraseña|Alta|Sprint 2|1|
||**TOTAL SPRINT 2**|13/04/26 –|17/04/26|5|
|HU-003|Edición delperfilpersonal|Media|Sprint 3|1|
|HU-004|Gestión de usuarios|Alta|Sprint 3|3|
|HU-005|Administración de rolesy permisos|Alta|Sprint 3|2|
||**TOTAL SPRINT 3**|20/04/26 –|25/04/26|6|
|HU-008|Registro de microcredencial con metadatos e<br>insignia|Alta|Sprint 4|4|
|HU-007|Aprobación de microcredenciales|Alta|Sprint 4|2|
||**TOTAL SPRINT 4**|27/04/26 –|02/05/26|6|
|HU-006|Gestión de microcredenciales|Alta|Sprint 5|3|



20 

|HT-006|Validación de metadatos Open Badges 3.0 y<br>verificaciónpública|Alta|Sprint 5|3|
|---|---|---|---|---|
||**TOTAL SPRINT 5**|04/05/26 –|09/05/26|6|
|HU-010|Gestión de insignias digitales|Alta|Sprint 6|4|
||**TOTAL SPRINT 6**|11/05/26 –|14/05/26|4|
|HU-009|Visualización de insignias emitidas|Media|Sprint 7|2|
|HU-011|Gestión de insignias adquiridas|Alta|Sprint 7|3|
||**TOTAL SPRINT 7**|18/05/26 –|22/05/26|5|
|HU-012|Verificaciónpor terceros|Alta|Sprint 8|3|
|HU-015|Identificación externa del receptor|Alta|Sprint 8|2|
||**TOTAL SPRINT 8**|25/05/26 –|29/05/26|5|
|HU-013|Visualizacióny gestión delperfil académico|Media|Sprint 9|3|
||**TOTAL SPRINT 9**|25/05/26 –|28/05/26|4|
|HU-014|Visualización pública de perfiles y<br>microcredenciales|Media|Sprint 10|4|
|HU-016|Acceso alperfilpúblico institucional|Alta|Sprint 10|1|
||**TOTAL SPRINT 10**|01/06/26 –|05/05/26|5|
|HT-007|Implementación del PNG con metadatos<br>incrustados|Alta|Sprint 11|2|
|HT-008|Configuración de entornos y despliegue del<br>sistema|Media|Sprint 11|4|
||**TOTAL SPRINT 11**|08/06/26 –|13/06/26|6|




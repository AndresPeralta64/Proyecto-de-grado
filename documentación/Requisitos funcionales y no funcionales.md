## Page 1

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>RF-001</td>
      <td>Inicio de sesión seguro</td>
      <td>El sistema debe permitir a los usuarios autenticarse con correo y contraseña, redirigiendo al panel correspondiente según su rol.</td>
    </tr>
    <tr>
      <td>RF-002</td>
      <td>Restablecimiento de contraseña</td>
      <td>El sistema debe permitir al usuario restablecer su contraseña mediante un proceso de verificación.</td>
    </tr>
    <tr>
      <td>RF-003</td>
      <td>Edición del perfil personal</td>
      <td>El sistema debe permitir al usuario editar su información de perfil personal.</td>
    </tr>
    <tr>
      <td>RF-004</td>
      <td>Gestión de usuarios</td>
      <td>El sistema debe permitir al Administrador crear, editar, buscar y eliminar usuarios</td>
    </tr>
    <tr>
      <td>RF-005</td>
      <td>Administración de roles y permisos</td>
      <td>El sistema debe permitir al Administrador asignar, agregar y editar roles y permisos a los usuarios registrados.</td>
    </tr>
    <tr>
      <td>RF-006</td>
      <td>Gestión de microcredenciales</td>
      <td>El sistema debe permitir al Administrador y Emisor buscar, eliminar y modificar el estado de microcredenciales (activa o inactiva). Una vez un Emisor inactive la microcredencial no podrá reactivarla a menos que lo haga un Administrador.</td>
    </tr>
    <tr>
      <td>RF-007</td>
      <td>Aprobación de microcredenciales</td>
      <td>El sistema debe permitir al Administrador aprobar o rechazar microcredenciales pendientes con justificación obligatoria en caso de rechazo</td>
    </tr>
    <tr>
      <td>RF-008</td>
      <td>Registro de microcredenciales</td>
      <td>El sistema debe permitir al Emisor registrar una nueva microcredencial incluyendo la configuración de metadatos académicos bajo el estándar Open Badges 3.0 y el diseño o carga de la insignia digital asociada.</td>
    </tr>
    <tr>
      <td>RF-009</td>
      <td>Asociación de insignia digital a microcredencial</td>
      <td>El sistema debe permitir al Emisor diseñar una insignia digital mediante plantillas o cargar una insignia digital en varios formatos.</td>
    </tr>
    <tr>
      <td>RF-010</td>
      <td>Visualización de insignias emitidas</td>
      <td>El sistema debe permitir al Administrador ver y buscar las insignias emitidas por Emisores.</td>
    </tr>
    <tr>
      <td>RF-011</td>
      <td>Gestión de insignias digitales</td>
      <td>El sistema debe permitir al Emisor emitir y revocar insignias digitales, además de buscar insignias emitidas por ellos.</td>
    </tr>
    <tr>
      <td>RF-012</td>
      <td>Gestión de insignias adquiridas</td>
      <td>El sistema debe permitir al Receptor buscar y exportar insignias obtenidas.</td>
    </tr>
    <tr>
      <td>RF-013</td>
      <td>Verificación pública por terceros</td>
      <td>El sistema debe permitir a cualquier usuario no registrado acceder a la URL pública de una insignia y obtener su assertion JSON-LD completo, incluyendo el proof criptográfico, para su verificación externa.</td>
    </tr>
    <tr>
      <td>RF-014</td>
      <td>Visualización del perfil académico</td>
      <td>El sistema debe permitir al Receptor agrupar insignias por categoría y agregar/quitar insignias de su perfil académico.</td>
    </tr>
    <tr>
      <td>RF-015</td>
      <td>Exportación del perfil académico</td>
      <td>El sistema debe permitir al Receptor exportar su perfil académico completo en formato PDF como hoja de vida digital.</td>
    </tr>
  </tbody>
</table>

---


## Page 2

<table>
  <thead>
    <tr>
      <th>RF-016</th>
      <th>Visualización pública de perfiles</th>
      <th>El sistema debe permitir a cualquier usuario (registrado o no registrado) buscar y visualizar perfiles académicos de otros usuarios.</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>RF-017</td>
      <td>Visualización pública de microcredenciales</td>
      <td>El sistema debe permitir a cualquier usuario (registrado o no registrado) buscar y visualizar microcredenciales dentro del sistema, así como los Receptores acreedores de la misma.</td>
    </tr>
    <tr>
      <td>RF-018</td>
      <td>Identificación externa del receptor</td>
      <td>El sistema debe utilizar el correo institucional del receptor en formato mailto: como su identificador externo dentro del assertion JSON-LD de cada insignia emitida.</td>
    </tr>
    <tr>
      <td>RF-019</td>
      <td>Verificación del perfil público institucional</td>
      <td>El sistema debe exponer una URL pública institucional única que retorne el nombre de la institución, el correo institucional y la clave pública RSA del sistema en formato JWK, permitiendo que terceros verifiquen criptográficamente cualquier insignia emitida por la plataforma.</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>RNF-001</td>
      <td>Seguridad de la insignia digital</td>
      <td>El sistema debe implementar el algoritmo RS256 para la firma criptográfica de las insignias.</td>
    </tr>
    <tr>
      <td>RNF-002</td>
      <td>Seguridad de datos sensibles</td>
      <td>Los datos sensibles de los usuarios deben ser encriptados mediante el estándar AES-256 antes de ser almacenados en la base de datos.</td>
    </tr>
    <tr>
      <td>RNF-003</td>
      <td>Respaldo de datos almacenados</td>
      <td>El sistema debe ejecutar respaldos automáticos diarios de la base de datos PostgreSQL para prevenir la pérdida de registros históricos de emisión.</td>
    </tr>
    <tr>
      <td>RNF-004</td>
      <td>Compatibilidad del sistema</td>
      <td>La capa de usuario debe ser totalmente compatible y funcional en las versiones actuales de Google Chrome, Mozilla Firefox y Microsoft Edge.</td>
    </tr>
    <tr>
      <td>RNF-005</td>
      <td>Gestión del par de claves RSA del sistema</td>
      <td>El sistema debe disponer de un único par de claves RSA de mínimo 2048 bits a nivel institucional. La clave privada debe almacenarse cifrada en el servidor y nunca exponerse públicamente; la clave pública debe estar disponible en el perfil público institucional definido en RF-019.</td>
    </tr>
  </tbody>
</table>
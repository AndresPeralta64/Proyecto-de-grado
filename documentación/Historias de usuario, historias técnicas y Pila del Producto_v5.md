## Page 1

&lt;img&gt;ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO logo&lt;/img&gt; &lt;img&gt;FIE FACULTAD DE INFORMÁTICA Y ELECTRÓNICA logo&lt;/img&gt;

ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO

FACULTAD DE INFORMÁTICA Y ELÉCTRONICA
CARRERA DE SOFTWARE

Asignatura: Aplicaciones Informáticas II

Tema: Historias de Usuario, Historias Técnicas y Pila del Producto V5
Proyecto: Desarrollo de una aplicación web para la gestión de perfiles académicos mediante microcredenciales e insignias digitales en la ESPOCH

Fecha de última actualización: 03 – 05 – 2026

Nombre:
Andrés Sebastián Peralta Ramos (7356)

Período académico:
Marzo 2026 – Julio 2026

---


## Page 2

&lt;page_number&gt;2&lt;/page_number&gt;

# Contenido

1.  **Historias de usuario**................................................................................... 3
    1.1. **Módulo de autenticación y gestión de usuarios**........................................... 3
    1.2. **Módulo de gestión de microcredenciales**.................................................. 6
    1.3. **Módulo de emisión y validación de insignias digitales**.............................. 8
    1.4. **Módulo del perfil académico**................................................................. 9
2.  **Historias técnicas**...................................................................................... 13
3.  **Pila del producto**...................................................................................... 19

---


## Page 3

&lt;page_number&gt;3&lt;/page_number&gt;

1. Historias de usuario
1.1. Módulo de autenticación y gestión de usuarios

<table>
  <thead>
    <tr>
      <th colspan="2">HU-001 Inicio de sesión seguro</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-001</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Emisor / Receptor / Administrador</td>
    </tr>
    <tr>
      <td><b>Quiero</b></td>
      <td>Iniciar sesión ingresando mi correo institucional y contraseña</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Acceder al sistema con los privilegios correspondientes a mi rol y gestionar las funcionalidades que me corresponden</td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>Dado que el usuario ingresa correo y contraseña válidos, cuando hace clic en "Iniciar sesión", entonces el sistema valida las credenciales y redirige al panel correspondiente según el rol.</li>
          <li>Dado que el usuario ingresa credenciales incorrectas, cuando hace clic en "Iniciar sesión", entonces el sistema muestra el mensaje "Credenciales inválidas" y permite reintentar hasta 3 veces.</li>
          <li>Dado que el usuario deja campos vacíos, cuando intenta iniciar sesión, entonces el sistema muestra advertencias indicando que los campos son obligatorios.</li>
          <li>Dado que el usuario supera el número máximo de intentos fallidos, cuando intenta nuevamente, entonces el sistema bloquea temporalmente la cuenta.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Prioridad</b></td>
      <td>Alta</td>
    </tr>
    <tr>
      <td><b>Notas</b></td>
      <td>Pre-requisito para cualquier otra funcionalidad del sistema.</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-002 Restablecimiento de contraseña</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-002</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Emisor / Receptor / Administrador</td>
    </tr>
    <tr>
      <td><b>Quiero</b></td>
      <td>Restablecer mi contraseña mediante un proceso de verificación</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Recuperar el acceso al sistema en caso de olvidar mis credenciales</td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>Dado que el usuario solicita restablecer su contraseña, cuando ingresa su correo institucional, entonces el sistema envía un enlace de verificación al correo registrado.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---


## Page 4

&lt;page_number&gt;4&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>Dado que el usuario accede al enlace de verificación, cuando ingresa y confirma la nueva contraseña, entonces el sistema actualiza las credenciales y redirige al inicio de sesión.</li>
        <li>Dado que el enlace de verificación ha expirado, cuando el usuario intenta usarlo, entonces el sistema muestra un mensaje de error y ofrece solicitar uno nuevo.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HU-003 Edición del perfil personal</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-003</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Emisor / Receptor / Administrador</td>
  </tr>
  <tr>
    <td>Quiero</td>
    <td>Editar mi información de perfil personal</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Mantener actualizada mi información dentro del sistema</td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Dado que el usuario accede a su perfil, cuando edita sus datos personales y guarda, entonces el sistema actualiza la información y muestra confirmación.</li>
        <li>Dado que el usuario deja campos obligatorios vacíos, cuando intenta guardar, entonces el sistema resalta los campos faltantes y no permite continuar.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HU-004 Gestión de usuarios</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-004</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Administrador</td>
  </tr>
  <tr>
    <td>Quiero</td>
    <td>Crear, buscar, editar y eliminar cuentas de usuario</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Mantener actualizado el registro de usuarios y controlar quién tiene acceso a la plataforma</td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Dado que el Administrador accede al módulo de usuarios, cuando solicita la lista, entonces el sistema muestra todos los usuarios registrados con su estado actual.</li>
        <li>Dado que el Administrador ingresa los datos de un nuevo usuario, cuando guarda el registro, entonces el sistema valida duplicados de correo y crea la cuenta exitosamente.</li>
      </ul>
    </td>
  </tr>
</table>

---


## Page 5

&lt;page_number&gt;5&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>Dado que el Administrador modifica información de un usuario existente, cuando confirma los cambios, entonces el sistema actualiza el registro y muestra confirmación.</li>
        <li>Dado que el Administrador deja campos obligatorios vacíos al modificar, el sistema notifica los campos faltantes y cancela la actualización de datos.</li>
        <li>Dado que el Administrador selecciona eliminar un usuario, cuando confirma la acción, entonces el sistema solicita confirmación de seguridad y elimina el registro.</li>
        <li>Dado que el correo ya existe, cuando se intenta registrar, entonces el sistema notifica "Usuario ya registrado" y solicita un correo diferente.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HU-005 Administración de roles y permisos</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-005</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Administrador</td>
  </tr>
  <tr>
    <td>Quiero</td>
    <td>Asignar, agregar y editar roles y permisos a los usuarios registrados, incluyendo mi propia cuenta</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Controlar el nivel de acceso de cada usuario a los módulos y funcionalidades del sistema según su perfil</td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Dado que el Administrador selecciona un usuario, cuando accede a "Administrar roles y permisos", entonces el sistema muestra la configuración actual de roles y permisos.</li>
        <li>Dado que el Administrador modifica el rol de un usuario, cuando confirma los cambios, entonces el sistema aplica los nuevos permisos de forma inmediata.</li>
        <li>Dado que el Administrador asigna el rol de Emisor, cuando el usuario inicia sesión, entonces solo puede acceder a las funcionalidades de gestión de microcredenciales e insignias.</li>
        <li>Dado que el Administrador asigna el rol de Receptor, cuando el usuario inicia sesión, entonces solo puede acceder a la gestión de insignias obtenidas y perfil académico.</li>
        <li>Dado que el Administrador asigna el rol de Emisor y Receptor, cuando el usuario inicia sesión, entonces puede acceder a las funcionalidades de ambas partes.</li>
      </ul>
    </td>
  </tr>
</table>

---


## Page 6

&lt;page_number&gt;6&lt;/page_number&gt;

<table>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

1.2. Módulo de gestión de microcredenciales

<table>
  <tr>
    <th colspan="2">HU-006 Gestión de microcredenciales</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-006</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Administrador / Emisor</td>
  </tr>
  <tr>
    <td>Quiero</td>
    <td>Buscar, eliminar lógicamente y modificar el estado de microcredenciales</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Controlar la disponibilidad de las microcredenciales en el sistema</td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Dado que el usuario accede al módulo de microcredenciales, cuando aplica filtros de búsqueda, entonces el sistema muestra solo las microcredenciales que coinciden con los criterios.</li>
        <li>Dado que el usuario selecciona una microcredencial aprobada y elige modificar estado (activa o inactiva), cuando confirma el nuevo estado, entonces el sistema actualiza el registro y refresca el listado.</li>
        <li>Dado que un Emisor inactive una microcredencial, no podrá cambiar el estado de esta a menos que lo haga un Administrador.</li>
        <li>Dado que la microcredencial tiene insignias emitidas, cuando el usuario intenta cambiar el estado, entonces el sistema muestra una advertencia sobre el impacto en las insignias existentes.</li>
        <li>Dado que el usuario selecciona eliminar una microcredencial, cuando confirma la acción, entonces el sistema la oculta del listado principal preservando el historial de insignias emitidas.</li>
        <li>Dado que la microcredencial está en estado "Pendiente de aprobación", cuando el Emisor intenta modificar su estado, entonces el sistema bloquea la acción y muestra un aviso.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HU-007 Aprobación de microcredenciales</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-007</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Administrador</td>
  </tr>
</table>

---


## Page 7

&lt;page_number&gt;7&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Quiero</th>
      <th>Revisar las microcredenciales pendientes y aprobarlas o rechazarlas con una justificación</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Para</td>
      <td>Garantizar que únicamente las microcredenciales que cumplen los estándares institucionales queden disponibles para emisión</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que existen microcredenciales en estado "Pendiente de aprobación", cuando el Administrador accede al módulo, entonces el sistema muestra la lista de pendientes con sus detalles completos.</li>
          <li>Dado que el Administrador selecciona "Aprobar", cuando confirma la acción, entonces el sistema cambia el estado a "Aprobada" y notifica al Emisor.</li>
          <li>Dado que el Administrador selecciona "Rechazar", cuando ingresa la justificación obligatoria y confirma, entonces el sistema cambia el estado a "Rechazada" y notifica al Emisor por correo los motivos.</li>
          <li>Dado que no existen microcredenciales pendientes, cuando el Administrador accede al módulo, entonces el sistema muestra "No hay microcredenciales para aprobar".</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-008 Registro de microcredencial con metadatos e insignia digital</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>RF-008 / RF-009</td>
    </tr>
    <tr>
      <td>Como</td>
      <td>Emisor</td>
    </tr>
    <tr>
      <td>Quiero</td>
      <td>Registrar una nueva microcredencial definiendo sus metadatos académicos bajo el estándar Open Badges 3.0 y diseñando o cargando la insignia digital asociada</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Crear una oferta de certificación académica verificable que pueda ser emitida a los estudiantes que cumplan los requisitos</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que el Emisor completa el formulario con todos los campos obligatorios, cuando guarda la microcredencial, entonces el sistema la almacena en estado "Pendiente de aprobación" y muestra confirmación.</li>
          <li>Dado que el Emisor carga una imagen de insignia, cuando el sistema la valida, entonces verifica formato, tamaño y resolución antes de asociarla.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---


## Page 8

&lt;page_number&gt;8&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>Dado que el Emisor seleccione la opción de “Diseñar insignia digital”, el sistema abrirá una sección con herramientas de diseño, un formato y tamaño predefinidos para asociarla a la microcredencial.</li>
        <li>Dado que el Emisor deja campos obligatorios vacíos, cuando intenta guardar, entonces el sistema resalta los campos faltantes y no permite continuar.</li>
        <li>Dado que el Emisor configura los metadatos, cuando el sistema los procesa, entonces los estructura internamente conforme al estándar Open Badges 3.0.</li>
        <li>Dado que el Emisor intenta registrar una microcredencial con el mismo nombre que una existente, cuando intenta guardar, entonces el sistema notifica "Microcredencial ya existe".</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

1.3. Módulo de emisión y emisión de insignias digitales

<table>
  <tr>
    <th colspan="2">HU-009 Visualización de insignias emitidas</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RF-010</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Administrador</td>
  </tr>
  <tr>
    <td>Quiero</td>
    <td>Ver y buscar todas las insignias digitales emitidas por los Emisores</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Tener visibilidad global del sistema con fines de auditoría y supervisión institucional</td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Dado que el Administrador accede al módulo de insignias, cuando el sistema carga el listado, entonces muestra todas las insignias emitidas con información resumida.</li>
        <li>Dado que el Administrador aplica filtros de búsqueda, cuando el sistema procesa la consulta, entonces muestra solo las insignias que coinciden con los criterios.</li>
        <li>Dado que el Administrador selecciona una insignia, cuando solicita ver los detalles, entonces el sistema presenta información completa incluyendo Receptor, Emisor, fecha y estado.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Media</td>
  </tr>
</table>

---


## Page 9

&lt;page_number&gt;9&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th colspan="2">HU-010 Gestión de insignias digitales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-011</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Emisor</td>
    </tr>
    <tr>
      <td><b>Quiero</b></td>
      <td>Emitir, buscar en mi historial y revocar insignias digitales</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Certificar y mantener trazabilidad de los logros académicos otorgados a los Receptores</td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>Dado que el Emisor selecciona una microcredencial aprobada y uno o varios Receptores, cuando confirma la emisión, entonces el sistema aplica la firma criptográfica RS256 y registra la emisión con fecha, hora y metadatos completos.</li>
          <li>Dado que el sistema completa la firma, cuando la emisión finaliza, entonces el Receptor recibe una notificación por correo.</li>
          <li>Dado que el Receptor ya posee esa insignia, cuando el Emisor intenta emitirla nuevamente, entonces el sistema muestra "El Receptor ya tiene esta insignia".</li>
          <li>Dado que el Emisor consulta su historial, cuando aplica filtros, entonces el sistema muestra solo las emisiones que coinciden con los criterios seleccionados.</li>
          <li>Dado que el Emisor selecciona una insignia activa y elige revocarla, cuando ingresa la justificación y confirma, entonces el sistema cambia el estado a "Revocada" y notifica al Receptor por correo.</li>
          <li>Dado que el Emisor deja vacía la justificación de revocación, cuando intenta confirmar, entonces el sistema muestra "La justificación es obligatoria" y no permite continuar.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Prioridad</b></td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

1.4. Módulo de perfil académico

<table>
  <thead>
    <tr>
      <th colspan="2">HU-011 Gestión de insignias adquiridas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-012</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Receptor</td>
    </tr>
  </tbody>
</table>

---


## Page 10

&lt;page_number&gt;10&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Quiero</th>
      <th>Buscar, filtrar y exportar mis insignias digitales obtenidas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Para</td>
      <td>Gestionar y compartir mis certificaciones académicas verificables</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que el Receptor accede a su perfil, cuando el sistema carga el contenido, entonces muestra todas las insignias organizadas por fecha de emisión.</li>
          <li>Dado que el Receptor aplica filtros de búsqueda, cuando el sistema procesa la consulta, entonces muestra solo las insignias que coinciden con los criterios.</li>
          <li>Dado que el Receptor selecciona una insignia y elige exportar, cuando el sistema genera el archivo, entonces produce el archivo en formato PNG con metadatos Open Badges 3.0 incrustados o en formato JSON-LD de acuerdo a la selección del usuario.</li>
          <li>Dado que una insignia fue revocada, cuando el Receptor la visualiza, entonces el sistema muestra una advertencia indicando que la certificación ya no es válida.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-012 Verificación por terceros</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>RF-013</td>
    </tr>
    <tr>
      <td>Como</td>
      <td>Receptor</td>
    </tr>
    <tr>
      <td>Quiero</td>
      <td>Compartir una URL pública única de cada insignia</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Permitir que empleadores u otras instituciones verifiquen la autenticidad de mis certificaciones sin necesidad de acceder al sistema</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que el Receptor selecciona una insignia y elige compartir URL, cuando el sistema genera el enlace, entonces produce una URL pública única y persistente de la insignia.</li>
          <li>Dado que un tercero accede a la URL pública, cuando el sistema carga la página, entonces muestra el estado actual de la insignia (activa o revocada) con sus metadatos sin requerir inicio de sesión.</li>
          <li>Dado que un tercero accede a “Prueba criptográfica”, el sistema muestra el assertion JSON-LD completo de la insignia digital.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

---


## Page 11

&lt;page_number&gt;11&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th colspan="2">HU-013 Visualización y gestión del perfil académico</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-014 / RF-015</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Receptor</td>
    </tr>
    <tr>
      <td><b>Quiero</b></td>
      <td>Visualizar mi perfil académico, agrupar mis insignias por categorías, agregar o quitar insignias de mi vista pública y exportar mi perfil en PDF</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Presentar de forma profesional y personalizada mis logros académicos digitales</td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>Dado que el Receptor accede a su perfil académico, cuando el sistema lo carga, entonces muestra todas las insignias obtenidas con opciones de organización.</li>
          <li>Dado que el Receptor agrupa insignias por categorías definidas, cuando guarda los cambios, entonces el sistema refleja la nueva organización.</li>
          <li>Dado que el Receptor agrega una insignia a su vista pública, cuando guarda la configuración, entonces la insignia aparece en su perfil público.</li>
          <li>Dado que el Receptor elimina una insignia de su vista pública, cuando guarda la configuración, entonces la insignia desaparece del perfil público, pero permanece en el registro del sistema y de su cuenta.</li>
          <li>Dado que el Receptor solicita exportar su perfil en PDF, cuando el sistema genera el archivo, entonces produce un PDF con sus datos personales e insignias organizadas como hoja de vida digital.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Prioridad</b></td>
      <td>Media</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-014 Visualización pública de perfiles y microcredenciales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RF-016 / RF-017</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Emisor / Receptor / Administrador / Usuario no registrado</td>
    </tr>
    <tr>
      <td><b>Quiero</b></td>
      <td>Visualizar el perfil académico de los usuarios del sistema y los usuarios acreedores de insignias digitales de determinada microcredencial</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Visualizar públicamente los méritos académicos obtenidos por estudiantes y docentes de la ESPOCH</td>
    </tr>
  </tbody>
</table>

---


## Page 12

&lt;page_number&gt;12&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Criterios de aceptación</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td></td>
      <td>
        <ul>
          <li>Dado que el usuario accede al catálogo, cuando realiza una búsqueda de microcredenciales, entonces el sistema muestra el listado de acuerdo a los parámetros de su búsqueda.</li>
          <li>Dado que el usuario visualiza una microcredencial específica, cuando da clic en "Ver acreedores" entonces el sistema despliega la lista de Receptores que han obtenido dicha certificación.</li>
          <li>Dado que un tercero busca un perfil por nombre o cédula, cuando el sistema lo localiza, entonces muestra el perfil público del Receptor con sus insignias obtenidas, marcadas para mostrar, sin requerir inicio de sesión.</li>
          <li>Dado que se busca un perfil inexistente, cuando el sistema procesa la consulta, entonces muestra el mensaje "Perfil no encontrado".</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Media</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-015 Identificación externa del receptor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>RF-018</td>
    </tr>
    <tr>
      <td>Como</td>
      <td>Sistema</td>
    </tr>
    <tr>
      <td>Quiero</td>
      <td>Usar el correo institucional del receptor en formato mailto: como su identificador externo (conforme al estándar Open Badges 3.0)</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Garantizar que cada insignia emitida identifique al receptor con un valor verificable por terceros dentro del assertion JSON-LD</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que el sistema emite una insignia, cuando genera el assertion JSON-LD, entonces el campo credentialSubject.id contiene el correo del receptor en formato mailto:correo@espoch.edu.ec.</li>
          <li>Dado que el correo del receptor no está registrado, cuando el sistema intenta emitir la insignia, entonces bloquea la emisión y notifica el error.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HU-016 Acceso al perfil público institucional</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>RF-019</td>
    </tr>
  </tbody>
</table>

---


## Page 13

&lt;page_number&gt;13&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Como</th>
      <th>Emisor / Receptor / Administrador / Usuario no registrado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Quiero</td>
      <td>Acceder a la URL pública institucional del emisor</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Obtener la clave pública RSA del sistema y verificar criptográficamente la autenticidad de cualquier insignia emitida por la plataforma</td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>Dado que un tercero accede a la URL pública institucional, cuando el sistema procesa la solicitud, entonces retorna un documento JSON con el nombre de la institución, correo institucional y clave pública RSA en formato JWK.</li>
          <li>Dado que la URL pública institucional es referenciada desde el campo issuer.id del assertion, cuando un verificador externo la consulta, entonces obtiene la clave pública necesaria para validar la firma RS256.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

2. Historias técnicas

<table>
  <thead>
    <tr>
      <th colspan="2">HT-001 Definición de la arquitectura de la aplicación web</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>Prerequisito al desarrollo de la aplicación</td>
    </tr>
    <tr>
      <td>Como</td>
      <td>Equipo de desarrollo</td>
    </tr>
    <tr>
      <td>Necesito</td>
      <td>Definir la arquitectura de la aplicación web estableciendo las tres capas del sistema, sus responsabilidades e interfaces de comunicación</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Garantizar un desarrollo escalable y mantenible, asegurando la modularidad del código fuente y facilitando la documentación técnica del sistema</td>
    </tr>
    <tr>
      <td>Tareas técnicas</td>
      <td>
        <ul>
          <li>Definir y documentar el diagrama de arquitectura cliente-servidor en tres capas.</li>
          <li>Especificar las responsabilidades de cada capa.</li>
          <li>Definir los protocolos de comunicación entre capas.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>El diagrama de arquitectura describe las tres capas y sus interfaces de comunicación.</li>
          <li>Revisión y aprobación por parte del Product Owner.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

---


## Page 14

&lt;page_number&gt;14&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th colspan="2">HT-002 Configuración del proyecto Angular</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RNF-004</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Equipo de desarrollo</td>
    </tr>
    <tr>
      <td><b>Necesito</b></td>
      <td>Inicializar el proyecto Angular con una arquitectura modular, rutas con protección por rol y variables de entorno para desarrollo y producción</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Contar con una base de interfaz web organizada, segura y compatible con navegadores actuales que permita integrar los módulos funcionales del sistema</td>
    </tr>
    <tr>
      <td><b>Tareas técnicas</b></td>
      <td>
        <ul>
          <li>Inicializar el proyecto Angular y configurar la estructura de carpetas y módulos principales.</li>
          <li>Definir las rutas base de la aplicación y aplicar restricciones de acceso según el rol.</li>
          <li>Configurar la gestión de sesiones y tokens para mantener la autenticación entre peticiones.</li>
          <li>Preparar los archivos de entorno para diferenciar configuración de desarrollo y producción.</li>
          <li>Verificar la compatibilidad básica en Google Chrome, Mozilla Firefox y Microsoft Edge.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>El proyecto Angular se ejecuta correctamente en entorno de desarrollo y producción.</li>
          <li>Las rutas protegen los módulos según el rol identificado y redirigen al login si no hay sesión activa.</li>
          <li>La aplicación se visualiza sin errores críticos en los navegadores especificados.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Prioridad</b></td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HT-003 Configuración del servidor con arquitectura en capas y autenticación segura</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RNF-001 / RNF-002</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Equipo de desarrollo</td>
    </tr>
    <tr>
      <td><b>Necesito</b></td>
      <td>Inicializar el servidor Express, estructurar los endpoints base e implementar el flujo de validación de credenciales con encriptación AES-256 para datos sensibles y verificación de roles</td>
    </tr>
  </tbody>
</table>

---


## Page 15

&lt;page_number&gt;15&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Para</th>
      <th>Establecer una API funcional y segura que gestione el inicio de sesión, valide permisos según el rol y garantice la protección de datos sensibles</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tareas técnicas</td>
      <td>
        <ul>
          <li>Inicializar el proyecto Node.js con Express y configurar los parámetros básicos del servidor.</li>
          <li>Estructurar los directorios por capa.</li>
          <li>Integrar encriptación AES-256 para datos sensibles de usuarios conforme a RNF-002.</li>
          <li>Aplicar validación de roles en las rutas principales para restringir el acceso según el perfil.</li>
          <li>Configurar manejo básico de errores y respuestas estandarizadas.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Criterios de aceptación</td>
      <td>
        <ul>
          <li>El servidor responde correctamente a peticiones básicas y gestiona errores sin exponer información sensible.</li>
          <li>El inicio de sesión valida credenciales, devuelve un token válido y bloquea accesos con datos incorrectos.</li>
          <li>Los datos sensibles se almacenan encriptados con AES-256 y nunca en texto plano.</li>
          <li>Un usuario sin el rol adecuado recibe denegación de acceso al intentar usar endpoints restringidos.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Prioridad</td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HT-004 Diseño e implementación del esquema relacional</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Referencia</td>
      <td>RNF-003</td>
    </tr>
    <tr>
      <td>Como</td>
      <td>Equipo de desarrollo</td>
    </tr>
    <tr>
      <td>Necesito</td>
      <td>Diseñar e implementar el esquema relacional en PostgreSQL con todas las tablas, relaciones, restricciones de integridad referencial e índices requeridos por el sistema</td>
    </tr>
    <tr>
      <td>Para</td>
      <td>Garantizar la integridad, consistencia y persistencia de todos los datos del sistema, soportando las operaciones de emisión y revocación de insignias sin pérdida de información</td>
    </tr>
    <tr>
      <td>Tareas técnicas</td>
      <td>
        <ul>
          <li>Diseñar el modelo entidad-relación (MER) cubriendo los requisitos establecidos.</li>
          <li>Implementar las tablas resultantes del diseño en PostgreSQL.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---


## Page 16

&lt;page_number&gt;16&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>Definir claves primarias, foráneas y restricciones de integridad referencial.</li>
        <li>Configurar respaldos automáticos diarios de la base de datos.</li>
        <li>Utilizar tipo JSONB para los metadatos Open Badges 3.0.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Todas las claves foráneas tienen restricciones ON DELETE apropiadas.</li>
        <li>El campo de metadatos utiliza tipo JSONB de PostgreSQL.</li>
        <li>El sistema de respaldo automático diario está configurado y funcional.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HT-005 Implementación del servicio de firma criptográfica RS256</th>
  </tr>
  <tr>
    <td>Referencia</td>
    <td>RNF-001</td>
  </tr>
  <tr>
    <td>Como</td>
    <td>Equipo de desarrollo</td>
  </tr>
  <tr>
    <td>Necesito</td>
    <td>Implementar el servicio de firma digital de insignias conforme al estándar Open Badges 3.0 usando el algoritmo RS256, generando credenciales verificables con estructura JSON-LD</td>
  </tr>
  <tr>
    <td>Para</td>
    <td>Garantizar la autenticidad, integridad e interoperabilidad de cada insignia emitida conforme al estándar</td>
  </tr>
  <tr>
    <td>Tareas técnicas</td>
    <td>
      <ul>
        <li>Implementar la generación del documento JSON-LD de la insignia con los campos requeridos por Open Badges 3.0.</li>
        <li>Implementar la función de firma digital RS256 sobre el contenido del documento JSON-LD.</li>
        <li>Incrustar la firma y el certificado público en la estructura de la credencial generada.</li>
        <li>Almacenar la clave privada de forma segura mediante variable de entorno.</li>
        <li>Generar el par de claves RSA de 2048 bits del sistema y almacenar la clave privada cifrada con AES-256 en la configuracion_sistema.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>Cada insignia emitida contiene un campo proof con tipo RS256, fecha y valor de firma válido.</li>
        <li>La clave privada no está presente en el repositorio de código fuente.</li>
      </ul>
    </td>
  </tr>
</table>

---


## Page 17

&lt;page_number&gt;17&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>El documento JSON-LD generado contiene los campos obligatorios del estándar Open Badges 3.0.</li>
        <li>La clave privada se almacena cifrada y nunca es expuesta en ningún endpoint público.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><b>Prioridad</b></td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HT-006 Validación de metadatos Open Badges 3.0 y verificación pública</th>
  </tr>
  <tr>
    <td><b>Referencia</b></td>
    <td>RNF-001</td>
  </tr>
  <tr>
    <td><b>Como</b></td>
    <td>Equipo de desarrollo</td>
  </tr>
  <tr>
    <td><b>Necesito</b></td>
    <td>Implementar la validación de metadatos y el endpoint público de verificación de insignias</td>
  </tr>
  <tr>
    <td><b>Para</b></td>
    <td>Prevenir la generación de credenciales con estructura inválida y permitir a terceros verificar públicamente la autenticidad de las insignias emitidas</td>
  </tr>
  <tr>
    <td><b>Tareas técnicas</b></td>
    <td>
      <ul>
        <li>Definir el esquema de validación basado en los campos requeridos por Open Badges 3.0.</li>
        <li>Implementar la validación de metadatos como paso previo obligatorio a la firma en el flujo de emisión.</li>
        <li>Implementar el endpoint público que retorne el estado y metadatos de la insignia sin requerir autenticación.</li>
        <li>Generar y almacenar la URL pública única y persistente de cada insignia al momento de su emisión.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><b>Criterios de aceptación</b></td>
    <td>
      <ul>
        <li>Una insignia con todos los campos correctamente completos pasa la validación sin errores.</li>
        <li>Si la validación falla, el sistema muestra los campos inválidos y no procede con la firma.</li>
        <li>El endpoint público retorna el estado actual de la insignia sin requerir inicio de sesión.</li>
        <li>Cada insignia emitida tiene una URL pública única y accesible.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><b>Prioridad</b></td>
    <td>Alta</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="2">HT-007 Implementación del PNG con metadatos incrustados</th>
  </tr>
  <tr>
    <td><b>Referencia</b></td>
    <td>RNF-001</td>
  </tr>
</table>

---


## Page 18

&lt;page_number&gt;18&lt;/page_number&gt;

<table>
  <thead>
    <tr>
      <th>Como</th>
      <th>Equipo de desarrollo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Necesito</b></td>
      <td>Implementar el proceso de badge baking que incrusta los metadatos JSON-LD de Open Badges 3.0 directamente dentro de los chunks del archivo PNG de la insignia</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Permitir que las insignias exportadas en formato PNG sean portables y verificables por plataformas externas como LinkedIn sin depender del sistema</td>
    </tr>
    <tr>
      <td><b>Tareas técnicas</b></td>
      <td>
        <ul>
          <li>Implementar la función de badge baking que incrusta el JSON-LD en los metadatos del PNG.</li>
          <li>Verificar que el PNG bakeado supera la validación de al menos un verificador Open Badges externo.</li>
          <li>Implementar la exportación del archivo JSON-LD como formato alternativo de descarga.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Criterios de aceptación</b></td>
      <td>
        <ul>
          <li>El PNG exportado contiene los metadatos Open Badges 3.0 correctamente incrustados.</li>
          <li>El PNG bakeado es verificado exitosamente por un verificador Open Badges externo.</li>
          <li>El archivo JSON-LD exportado contiene la estructura completa conforme al estándar.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Prioridad</b></td>
      <td>Alta</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="2">HT-008 Configuración de entornos y despliegue del sistema</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Referencia</b></td>
      <td>RNF-004</td>
    </tr>
    <tr>
      <td><b>Como</b></td>
      <td>Equipo de desarrollo</td>
    </tr>
    <tr>
      <td><b>Necesito</b></td>
      <td>Configurar los entornos de desarrollo y producción, habilitar HTTPS como canal exclusivo y preparar el procedimiento de despliegue del sistema</td>
    </tr>
    <tr>
      <td><b>Para</b></td>
      <td>Garantizar que el sistema puede ser desplegado de forma reproducible y que todas las comunicaciones están protegidas</td>
    </tr>
    <tr>
      <td><b>Tareas técnicas</b></td>
      <td>
        <ul>
          <li>Configurar el entorno de desarrollo con variables de entorno separadas del entorno de producción.</li>
          <li>Habilitar el protocolo HTTPS y configurar redirección automática de HTTP a HTTPS.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---


## Page 19

&lt;page_number&gt;19&lt;/page_number&gt;

<table>
  <tr>
    <td></td>
    <td>
      <ul>
        <li>Preparar los scripts de despliegue del backend y el build de producción del frontend Angular.</li>
        <li>Documentar el procedimiento completo de despliegue en el README del proyecto.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Criterios de aceptación</td>
    <td>
      <ul>
        <li>El sistema se puede desplegar en un entorno limpio siguiendo los pasos documentados.</li>
        <li>Todas las comunicaciones entre cliente y servidor utilizan HTTPS por defecto.</li>
        <li>Las variables sensibles se gestionan mediante variables de entorno y no están en el código fuente.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Prioridad</td>
    <td>Media</td>
  </tr>
</table>

3. Pila del producto

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Descripción</th>
      <th>Prioridad</th>
      <th>Sprint</th>
      <th>Est. (días)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>HT-001</td>
      <td>Definición de la arquitectura de la aplicación web</td>
      <td>Alta</td>
      <td>Sprint 1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>HT-002</td>
      <td>Configuración del proyecto Angular</td>
      <td>Alta</td>
      <td>Sprint 1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>HT-003</td>
      <td>Configuración del servidor con autenticación segura</td>
      <td>Alta</td>
      <td>Sprint 1</td>
      <td>1</td>
    </tr>
    <tr>
      <td>HT-004</td>
      <td>Diseño e implementación del esquema relacional</td>
      <td>Alta</td>
      <td>Sprint 1</td>
      <td>2</td>
    </tr>
    <tr>
      <td colspan="3">TOTAL SPRINT 1</td>
      <td>06/04/26 – 10/04/26</td>
      <td>5</td>
    </tr>
    <tr>
      <td>HT-005</td>
      <td>Implementación del servicio de firma criptográfica RS256</td>
      <td>Alta</td>
      <td>Sprint 2</td>
      <td>2</td>
    </tr>
    <tr>
      <td>HU-001</td>
      <td>Inicio de sesión seguro</td>
      <td>Alta</td>
      <td>Sprint 2</td>
      <td>2</td>
    </tr>
    <tr>
      <td>HU-002</td>
      <td>Restablecimiento de contraseña</td>
      <td>Alta</td>
      <td>Sprint 2</td>
      <td>1</td>
    </tr>
    <tr>
      <td>HU-003</td>
      <td>Edición del perfil personal</td>
      <td>Media</td>
      <td>Sprint 2</td>
      <td>1</td>
    </tr>
    <tr>
      <td colspan="3">TOTAL SPRINT 2</td>
      <td>13/04/26 – 18/04/26</td>
      <td>6</td>
    </tr>
    <tr>
      <td>HU-004</td>
      <td>Gestión de usuarios</td>
      <td>Alta</td>
      <td>Sprint 3</td>
      <td>2</td>
    </tr>
    <tr>
      <td>HU-005</td>
      <td>Administración de roles y permisos</td>
      <td>Alta</td>
      <td>Sprint 3</td>
      <td>1</td>
    </tr>
    <tr>
      <td>HU-008</td>
      <td>Registro de microcredencial con metadatos e insignia</td>
      <td>Alta</td>
      <td>Sprint 3</td>
      <td>3</td>
    </tr>
    <tr>
      <td colspan="3">TOTAL SPRINT 3</td>
      <td>20/04/26 – 25/04/26</td>
      <td>6</td>
    </tr>
    <tr>
      <td>HT-006</td>
      <td>Validación de metadatos Open Badges 3.0 y verificación pública</td>
      <td>Alta</td>
      <td>Sprint 4</td>
      <td>2</td>
    </tr>
    <tr>
      <td>HU-007</td>
      <td>Aprobación de microcredenciales</td>
      <td>Alta</td>
      <td>Sprint 4</td>
      <td>2</td>
    </tr>
  </tbody>
</table>

---


## Page 20

&lt;page_number&gt;20&lt;/page_number&gt;
<table>
  <tr>
    <td>HU-006</td>
    <td>Gestión de microcredenciales (Administrador y Emisor)</td>
    <td>Alta</td>
    <td>Sprint 4</td>
    <td>2</td>
  </tr>
  <tr>
    <td colspan="2">TOTAL SPRINT 4</td>
    <td colspan="2">27/04/26 – 02/05/26</td>
    <td>6</td>
  </tr>
  <tr>
    <td>HU-010</td>
    <td>Gestión de insignias digitales (Emisor)</td>
    <td>Alta</td>
    <td>Sprint 5</td>
    <td>3</td>
  </tr>
  <tr>
    <td>HU-009</td>
    <td>Visualización de insignias emitidas (Administrador)</td>
    <td>Media</td>
    <td>Sprint 5</td>
    <td>2</td>
  </tr>
  <tr>
    <td colspan="2">TOTAL SPRINT 5</td>
    <td colspan="2">04/05/26 – 08/05/26</td>
    <td>5</td>
  </tr>
  <tr>
    <td>HT-007</td>
    <td>Implementación del badge baking (PNG con metadatos incrustados)</td>
    <td>Alta</td>
    <td>Sprint 6</td>
    <td>3</td>
  </tr>
  <tr>
    <td>HU-011</td>
    <td>Gestión de insignias adquiridas (Receptor)</td>
    <td>Alta</td>
    <td>Sprint 6</td>
    <td>2</td>
  </tr>
  <tr>
    <td>HU-012</td>
    <td>Verificación por terceros</td>
    <td>Alta</td>
    <td>Sprint 6</td>
    <td>1</td>
  </tr>
  <tr>
    <td>HU-015</td>
    <td>Identificación externa del receptor</td>
    <td>Alta</td>
    <td>Sprint 6</td>
    <td>1</td>
  </tr>
  <tr>
    <td colspan="2">TOTAL SPRINT 6</td>
    <td colspan="2">11/05/26 – 17/05/26</td>
    <td>7</td>
  </tr>
  <tr>
    <td>HU-013</td>
    <td>Visualización y gestión del perfil académico</td>
    <td>Alta</td>
    <td>Sprint 7</td>
    <td>3</td>
  </tr>
  <tr>
    <td>HU-014</td>
    <td>Visualización pública de perfiles y microcredenciales</td>
    <td>Media</td>
    <td>Sprint 7</td>
    <td>2</td>
  </tr>
  <tr>
    <td>HU-016</td>
    <td>Acceso al perfil público institucional</td>
    <td>Alta</td>
    <td>Sprint 7</td>
    <td>1</td>
  </tr>
  <tr>
    <td colspan="2">TOTAL SPRINT 7</td>
    <td colspan="2">18/05/26 – 23/05/26</td>
    <td>6</td>
  </tr>
  <tr>
    <td>HT-008</td>
    <td>Configuración de entornos y despliegue del sistema</td>
    <td>Media</td>
    <td>Sprint 8</td>
    <td>4</td>
  </tr>
  <tr>
    <td colspan="2">TOTAL SPRINT 8</td>
    <td colspan="2">25/05/26 – 28/05/26</td>
    <td>4</td>
  </tr>
</table>
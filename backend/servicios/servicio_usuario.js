const { consultar } = require('./base_datos');
const bcrypt = require('bcryptjs');
const { cifrarAES, descifrarAES } = require('./servicio_criptografia');

/**
 * Busca un usuario por su correo institucional, incluyendo la información de su rol
 * Ajustado a la estructura real de la base de datos (tabla usuario_rol)
 * @param {string} correo - Correo institucional a buscar
 * @returns {Promise<Object|null>} Datos del usuario o null si no existe
 */
const buscarPorCorreo = async (correo) => {
  const consulta = `
    SELECT u.*, ARRAY_AGG(r.nombre ORDER BY r.nombre) as roles
    FROM usuario u 
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.usuario 
    LEFT JOIN rol r ON ur.rol = r.id_rol 
    WHERE u.correo = $1 AND u.activo = true
    GROUP BY u.id_usuario
  `;
  const resultado = await consultar(consulta, [correo]);
  const usuario = resultado.rows[0] || null;
  if (usuario && usuario.roles) {
    // nombre_rol queda como el primer rol asignado (compatibilidad)
    usuario.nombre_rol = usuario.roles[0] || null;
  }
  return usuario;
};

/**
 * Compara una contraseña en texto plano con el hash almacenado en la base de datos
 * @param {string} contrasena - Contraseña ingresada por el usuario
 * @param {string} hash - Hash guardado en la base de datos (columna contrasenia)
 * @returns {Promise<boolean>} Verdadero si coinciden
 */
const verificarContrasena = async (contrasena, hash) => {
  return await bcrypt.compare(contrasena, hash);
};

/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} datosUsuario - Datos del usuario (cedula, nombres, apellidos, correo, contrasenia, rol, etc.)
 * @returns {Promise<Object>} Usuario creado
 */
const crearUsuario = async (datosUsuario) => {
  // Solo la contraseña se considera dato sensible para encriptar (hashing con bcrypt)
  const salt = await bcrypt.genSalt(10);
  const contrasenaHash = await bcrypt.hash(datosUsuario.contrasenia, salt);

  const consultaUsuario = `
    INSERT INTO usuario (cedula, nombres, apellidos, correo, contrasenia, carrera)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id_usuario, correo
  `;

  const valoresUsuario = [
    datosUsuario.cedula,
    datosUsuario.nombres, // Ahora en texto plano
    datosUsuario.apellidos, // Ahora en texto plano
    datosUsuario.correo,
    contrasenaHash,
    datosUsuario.carrera || null
  ];

  const resultadoUsuario = await consultar(consultaUsuario, valoresUsuario);
  const nuevoUsuario = resultadoUsuario.rows[0];

  // Asignar el rol en la tabla intermedia usuario_rol
  if (datosUsuario.id_rol) {
    await consultar(
      'INSERT INTO usuario_rol (usuario, rol) VALUES ($1, $2)',
      [nuevoUsuario.id_usuario, datosUsuario.id_rol]
    );
  }

  return nuevoUsuario;
};

const descifrarDatosUsuario = (usuario) => {
  return usuario;
};

module.exports = {
  buscarPorCorreo,
  verificarContrasena,
  crearUsuario,
  descifrarDatosUsuario
};

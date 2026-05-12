const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { buscarPorCorreo, verificarContrasena, descifrarDatosUsuario } = require('../servicios/servicio_usuario');
const { enviarCorreoRecuperacion } = require('../servicios/servicio_correo');
const { consultar } = require('../servicios/base_datos');
require('dotenv').config();

/**
 * Procesa la solicitud de inicio de sesión
 */
const iniciarSesion = async (req, res) => {
  const { correo, contrasenia } = req.body;

  try {
    if (!correo || !contrasenia) {
      return res.status(400).json({ exito: false, mensaje: 'Por favor, ingrese su correo y contraseña.' });
    }

    const usuario = await buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ exito: false, mensaje: 'Las credenciales ingresadas son incorrectas.' });
    }

    const esContrasenaCorrecta = await verificarContrasena(contrasenia, usuario.contrasenia);
    if (!esContrasenaCorrecta) {
      return res.status(401).json({ exito: false, mensaje: 'Las credenciales ingresadas son incorrectas.' });
    }

    // Incluimos nombres y apellidos en el token para que el frontend los use en el Header
    const datosParaToken = {
      id: usuario.id_usuario,
      correo: usuario.correo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      nombre_rol: usuario.nombre_rol
    };

    const token = jwt.sign(datosParaToken, process.env.JWT_SECRET, { expiresIn: '12h' });

    const usuarioParaRespuesta = descifrarDatosUsuario(usuario);
    delete usuarioParaRespuesta.contrasenia;

    return res.status(200).json({
      exito: true,
      mensaje: 'Bienvenido al sistema de microcredenciales.',
      token,
      usuario: {
        id: usuarioParaRespuesta.id_usuario,
        nombres: usuarioParaRespuesta.nombres,
        apellidos: usuarioParaRespuesta.apellidos,
        correo: usuarioParaRespuesta.correo,
        rol: usuarioParaRespuesta.nombre_rol
      }
    });

  } catch (error) {
    console.error('Error en iniciarSesion:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Ocurrió un error inesperado en el servidor.' });
  }
};

/**
 * Verifica si un correo institucional ya está registrado
 */
const verificarCorreo = async (req, res) => {
  const { correo } = req.body;
  try {
    if (!correo) return res.status(400).json({ exito: false, mensaje: 'El correo es obligatorio.' });
    const usuario = await buscarPorCorreo(correo);
    if (usuario) {
      return res.status(200).json({ exito: true, mensaje: 'Correo verificado.' });
    } else {
      return res.status(404).json({ exito: false, mensaje: 'Este correo no está registrado en el sistema.' });
    }
  } catch (error) {
    console.error('Error en verificarCorreo:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al verificar el correo.' });
  }
};

/**
 * [HU-002] SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
 */
const solicitarRestablecimiento = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(404).json({ exito: false, mensaje: 'El correo no está registrado.' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const expiraEn = new Date(Date.now() + 3600000);
    const consultaToken = `
      INSERT INTO token_verificacion (usuario, token, expira_en) 
      VALUES ($1, $2, $3)
    `;
    await consultar(consultaToken, [usuario.id_usuario, token, expiraEn]);

    await enviarCorreoRecuperacion(usuario.correo, token);

    return res.status(200).json({
      exito: true,
      mensaje: 'Se ha enviado un enlace de recuperación a su correo institucional.'
    });
  } catch (error) {
    console.error('Error en solicitarRestablecimiento:', error);
    return res.status(500).json({ exito: false, mensaje: 'No se pudo procesar la solicitud de recuperación.' });
  }
};

/**
 * [HU-002] CONFIRMAR RESTABLECIMIENTO DE CONTRASEÑA
 */
const confirmarRestablecimiento = async (req, res) => {
  const { token, nuevaContrasenia } = req.body;

  try {
    if (!token || !nuevaContrasenia) {
      return res.status(400).json({ exito: false, mensaje: 'Token y nueva contraseña son obligatorios.' });
    }

    const consultaVerificar = 'SELECT * FROM token_verificacion WHERE token = $1 AND usado = false AND expira_en > NOW()';
    const resultado = await consultar(consultaVerificar, [token]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ exito: false, mensaje: 'El enlace es inválido o ha expirado.' });
    }

    const registroToken = resultado.rows[0];

    let decodificado;
    try {
      decodificado = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ exito: false, mensaje: 'Token corrupto o expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(nuevaContrasenia, salt);

    await consultar('BEGIN');
    await consultar('UPDATE usuario SET contrasenia = $1 WHERE id_usuario = $2', [contrasenaHash, decodificado.id]);
    await consultar('UPDATE token_verificacion SET usado = true WHERE id_token = $1', [registroToken.id_token]);
    await consultar('COMMIT');

    return res.status(200).json({
      exito: true,
      mensaje: 'Su contraseña ha sido actualizada exitosamente.'
    });

  } catch (error) {
    await consultar('ROLLBACK');
    console.error('Error en confirmarRestablecimiento:', error.message);
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar la contraseña.' });
  }
};

module.exports = {
  iniciarSesion,
  verificarCorreo,
  solicitarRestablecimiento,
  confirmarRestablecimiento
};

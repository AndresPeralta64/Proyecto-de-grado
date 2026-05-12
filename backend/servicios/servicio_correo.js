/**
 * Servicio de Correo Simulado para Desarrollo
 * En lugar de enviar un correo real, imprime el enlace en la consola del servidor.
 */

const enviarCorreoRecuperacion = async (destinatario, token) => {
  const enlaceRecuperacion = `${process.env.URL_FRONTEND}/autenticacion/nueva-contrasenia/${token}`;

  console.log('\n' + '='.repeat(60));
  console.log('📧 SIMULACIÓN DE ENVÍO DE CORREO');
  console.log('PARA:', destinatario);
  console.log('ASUNTO: Restablecimiento de Contraseña');
  console.log('ENLACE:', enlaceRecuperacion);
  console.log('='.repeat(60) + '\n');

  return true;
};

module.exports = {
  enviarCorreoRecuperacion
};

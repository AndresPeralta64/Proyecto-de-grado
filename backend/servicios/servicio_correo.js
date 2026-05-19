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

const enviarNotificacionEmision = async (correoReceptor, nombreReceptor, nombreMicrocredencial, urlVerificacion) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 SIMULACIÓN DE ENVÍO DE CORREO');
  console.log('PARA:', correoReceptor);
  console.log('ASUNTO: Nueva Insignia Digital Emitida');
  console.log(`HOLA: ${nombreReceptor}`);
  console.log(`Logro Académico: Se ha emitido la insignia de "${nombreMicrocredencial}" a tu nombre.`);
  console.log('ENLACE DE VERIFICACIÓN:', urlVerificacion);
  console.log('='.repeat(60) + '\n');

  return true;
};

const enviarNotificacionRevocacion = async (correoReceptor, nombreReceptor, nombreMicrocredencial, justificacion) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 SIMULACIÓN DE ENVÍO DE CORREO (ALERTA)');
  console.log('PARA:', correoReceptor);
  console.log('ASUNTO: Insignia Digital Revocada');
  console.log(`HOLA: ${nombreReceptor}`);
  console.log(`Logro Académico: Tu insignia de "${nombreMicrocredencial}" ha sido REVOCADA.`);
  console.log('CAUSA DE REVOCACIÓN:', justificacion);
  console.log('='.repeat(60) + '\n');

  return true;
};

module.exports = {
  enviarCorreoRecuperacion,
  enviarNotificacionEmision,
  enviarNotificacionRevocacion
};

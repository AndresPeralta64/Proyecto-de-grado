export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export interface CredencialesInicioSesion {
  correo: string;
  contrasenia: string;
}

export interface RespuestaInicioSesion {
  exito: boolean;
  mensaje: string;
  token: string;
  usuario: Usuario;
}

export interface SolicitudRestablecerContrasenia {
  correo: string;
}

export interface ConfirmarRestablecerContrasenia {
  token: string;
  nuevaContrasenia: string;
}


export interface Usuario {
  idUsuario: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  carrera?: string;
  fotoUrl?: string;
  activo: boolean;
  intentosFallidos: number;
  tiempoBloqueo?: Date;
  creadoEn: Date;
}

export interface Rol {
  idRol: number;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioRol {
  usuario: number;
  rol: number;
  asignadoPor?: number;
}

export interface CredencialesInicioSesion {
  correo: string;
  contrasenia: string;
}

export interface RespuestaInicioSesion {
  token: string;
  usuario: Usuario;
  roles: Rol[];
  expiraEn: Date;
}

export interface SolicitudRestablecerContrasenia {
  correo: string;
}

export interface ConfirmarRestablecerContrasenia {
  token: string;
  nuevaContrasenia: string;
}

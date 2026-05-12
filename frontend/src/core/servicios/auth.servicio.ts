import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CredencialesInicioSesion,
  RespuestaInicioSesion,
  SolicitudRestablecerContrasenia,
  ConfirmarRestablecerContrasenia
} from '../modelos/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioAutenticacion {

  private readonly urlBase = `${environment.urlBackend}/autenticacion`;

  constructor(private http: HttpClient) {}

  iniciarSesion(credenciales: CredencialesInicioSesion): Observable<RespuestaInicioSesion> {
    return this.http.post<RespuestaInicioSesion>(`${this.urlBase}/login`, credenciales);
  }

  verificarCorreo(correo: string): Observable<any> {
    return this.http.post(`${this.urlBase}/verificar-correo`, { correo });
  }

  /**
   * [HU-002] Solicitar el envío del correo de recuperación
   */
  solicitarRestablecimiento(correo: string): Observable<any> {
    return this.http.post(`${this.urlBase}/solicitar-restablecimiento`, { correo });
  }

  /**
   * [HU-002] Confirmar el cambio de contraseña con el token
   */
  confirmarRestablecimiento(datos: { token: string, nuevaContrasenia: string }): Observable<any> {
    return this.http.post(`${this.urlBase}/confirmar-restablecimiento`, datos);
  }

  cerrarSesion(): Observable<any> {
    return this.http.post(`${this.urlBase}/logout`, {});
  }
}

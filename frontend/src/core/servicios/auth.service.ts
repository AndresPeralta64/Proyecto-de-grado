import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CredencialesInicioSesion,
  RespuestaInicioSesion,
  SolicitudRestablecerContrasenia,
  ConfirmarRestablecerContrasenia
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioAutenticacion {

  private readonly urlBase = `${environment.urlBackend}/auth`;

  constructor(private http: HttpClient) {}

  iniciarSesion(credenciales: CredencialesInicioSesion): Observable<RespuestaInicioSesion> {
    return this.http.post<RespuestaInicioSesion>(`${this.urlBase}/login`, credenciales);
  }

  restablecerContrasenia(solicitud: SolicitudRestablecerContrasenia): Observable<any> {
    return this.http.post(`${this.urlBase}/restablecer-contrasenia`, solicitud);
  }

  confirmarRestablecerContrasenia(confirmacion: ConfirmarRestablecerContrasenia): Observable<any> {
    return this.http.post(`${this.urlBase}/confirmar-restablecer-contrasenia`, confirmacion);
  }

  cerrarSesion(): Observable<any> {
    return this.http.post(`${this.urlBase}/logout`, {});
  }
}

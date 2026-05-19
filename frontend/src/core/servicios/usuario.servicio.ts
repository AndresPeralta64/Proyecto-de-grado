import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioServicio {
  private apiUrl = `${environment.urlBackend}/usuarios`;

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  obtenerReceptores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/receptores`);
  }

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, datos);
  }

  subirFoto(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post(`${this.apiUrl}/subir-foto`, formData);
  }

  cambiarContrasenia(nuevaContrasenia: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-contrasenia`, { nuevaContrasenia });
  }

  obtenerCarreras(): Observable<any> {
    return this.http.get(`${this.apiUrl}/carreras`);
  }

  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datos);
  }

  actualizarUsuario(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }


  eliminarFotoPerfil(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/perfil/foto`);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activarUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activar`, {});
  }


}

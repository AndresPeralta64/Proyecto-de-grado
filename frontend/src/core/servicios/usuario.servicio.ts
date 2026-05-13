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

  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, datos);
  }

  // Futura implementación para subir foto
  subirFoto(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', archivo);
    return this.http.post(`${this.apiUrl}/subir-foto`, formData);
  }
}

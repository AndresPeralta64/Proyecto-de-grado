import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MicrocredencialServicio {
  private apiUrl = `${environment.urlBackend}/microcredenciales`;

  constructor(private http: HttpClient) { }

  obtenerMicrocredenciales(soloPropias: boolean = false): Observable<any> {
    const url = soloPropias ? `${this.apiUrl}?soloPropias=true` : `${this.apiUrl}`;
    return this.http.get(url);
  }

  aprobarMicrocredencial(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/aprobar`, {});
  }

  cambiarEstado(id: number, idEstado: number, justificacionRechazo?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, {
      id_estado: idEstado,
      justificacion_rechazo: justificacionRechazo
    });
  }

  eliminarMicrocredencial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerCatalogos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalogos`);
  }

  crearMicrocredencial(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }
}

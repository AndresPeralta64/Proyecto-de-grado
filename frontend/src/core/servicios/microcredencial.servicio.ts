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

  obtenerMicrocredenciales(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
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

  obtenerNiveles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/niveles`);
  }

  obtenerAreasConocimiento(): Observable<any> {
    return this.http.get(`${this.apiUrl}/areas`);
  }
}

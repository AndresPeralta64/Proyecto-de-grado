import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsigniaServicio {

  private readonly urlBase = `${environment.urlBackend}/insignias`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el historial de emisiones con filtros opcionales.
   */
  obtenerHistorial(filtros?: { search?: string, microcredencialId?: number, estado?: number, soloPropias?: boolean }): Observable<any> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.search) {
        params = params.set('search', filtros.search);
      }
      if (filtros.microcredencialId) {
        params = params.set('microcredencialId', filtros.microcredencialId.toString());
      }
      if (filtros.estado) {
        params = params.set('estado', filtros.estado.toString());
      }
      if (filtros.soloPropias !== undefined) {
        params = params.set('soloPropias', filtros.soloPropias.toString());
      }
    }
    return this.http.get<any>(`${this.urlBase}/historial`, { params });
  }

  /**
   * Emite insignias digitales para una microcredencial y receptores específicos.
   */
  emitirInsignia(datos: { id_microcredencial: number, receptores: number[] }): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/emitir`, datos);
  }

  /**
   * Revoca una insignia digital emitida.
   */
  revocarInsignia(idInsignia: number, justificacion: string): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/revocar`, {
      id_insignia: idInsignia,
      justificacion: justificacion
    });
  }
}

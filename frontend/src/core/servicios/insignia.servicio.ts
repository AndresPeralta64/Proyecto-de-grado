import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InsigniaServicio {
  private apiUrl = `${environment.urlBackend}/insignias`;

  constructor(private http: HttpClient) {}

  emitirInsignias(idMicrocredencial: number, receptoresIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/emitir`, {
      idMicrocredencial,
      receptoresIds
    });
  }

  obtenerHistorial(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial`);
  }

  obtenerHistorialReceptor(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial-receptor`);
  }

  obtenerHistorialGeneral(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial-general`);
  }

  revocarInsignia(idInsignia: number, justificacion: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/revocar/${idInsignia}`, { justificacion });
  }

  obtenerReceptoresConInsignia(idMicrocredencial: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/receptores-con-insignia/${idMicrocredencial}`);
  }

  obtenerInsigniaPublica(idGlobal: string): Observable<any> {
    return this.http.get<any>(`${environment.urlBackend}/public/insignia/${idGlobal}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerificacionServicio {

  private readonly urlBase = `${environment.urlBackend}/verificar`;

  constructor(private http: HttpClient) {}

  /**
   * Consulta pública para verificar una insignia digital mediante su UUID.
   * No requiere token de autenticación.
   */
  verificarInsignia(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.urlBase}/${uuid}`);
  }
}

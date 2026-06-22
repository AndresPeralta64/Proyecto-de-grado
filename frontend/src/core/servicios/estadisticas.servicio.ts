import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasServicio {
  private urlAPI = `${environment.urlBackend}/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerEstadisticasAdministrador(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/administrador`).pipe(
      catchError(this.manejarError)
    );
  }

  obtenerEstadisticasEmisor(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/emisor`).pipe(
      catchError(this.manejarError)
    );
  }

  obtenerEstadisticasReceptor(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/receptor`).pipe(
      catchError(this.manejarError)
    );
  }

  private manejarError(error: any) {
    console.error('Ocurrió un error en el servicio de estadísticas', error);
    let mensaje = 'Error desconocido al obtener las estadísticas';
    if (error.error && error.error.mensaje) {
      mensaje = error.error.mensaje;
    }
    return throwError(() => new Error(mensaje));
  }
}

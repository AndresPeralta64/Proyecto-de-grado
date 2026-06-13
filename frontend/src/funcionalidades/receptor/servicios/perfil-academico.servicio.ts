import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InsigniaPerfil {
  id: number;
  microcredencial: string;
  microcredencial_descripcion: string;
  duracion: number;
  png_baked_url: string;
  nivel: string;
  area_conocimiento: string;
  url_externo: string;
  fecha_completa: string;
  fecha: string;
  visible: boolean;
  orden: number;
}

export interface PerfilAcademicoResponse {
  exito: boolean;
  datos: {
    usuario: any;
    descripcion: string;
    agrupar_insignias: boolean;
    insignias: InsigniaPerfil[];
  };
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilAcademicoServicio {
  private urlBase = environment.urlBackend + '/perfil';

  constructor(private http: HttpClient) {}

  obtenerMiPerfil(): Observable<PerfilAcademicoResponse> {
    return this.http.get<PerfilAcademicoResponse>(`${this.urlBase}/mi-perfil`);
  }

  guardarConfiguracionPerfil(descripcion: string, agrupar_insignias: boolean, insignias_visibles: any[]): Observable<any> {
    return this.http.post<any>(`${this.urlBase}/guardar`, {
      descripcion,
      agrupar_insignias,
      insignias_visibles
    });
  }
}

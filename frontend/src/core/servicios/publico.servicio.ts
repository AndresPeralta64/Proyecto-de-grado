import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Microcredencial {
  id_microcredencial: number;
  nombre: string;
  descripcion: string;
  criterios_evaluacion: string;
  duracion_horas: number;
  competencias: string[];
  imagen_url: string;
  nivel_nombre: string;
  area_nombre: string;
  emisor_nombres: string;
  emisor_apellidos: string;
  creado_en: string;
}
export interface AcreedorPublico {
  cedula: string;
  nombres: string;
  apellidos: string;
  foto_url: string;
  fecha_emision: string;
  id_global: string;
  url_externo: string;
}

export interface PerfilBuscado {
  cedula: string;
  nombres: string;
  apellidos: string;
  foto_url: string;
  descripcion: string;
}

export interface PerfilPublico {
  perfil: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    foto_url: string;
    descripcion: string;
    agrupar_insignias: boolean;
  };
  insignias: any[]; // Las insignias de la vista pública
}

@Injectable({
  providedIn: 'root'
})
export class PublicoServicio {
  private http = inject(HttpClient);
  private apiUrl = `${environment.urlBackend}/public`;

  // Obtener catálogo de microcredenciales
  obtenerCatalogoMicrocredenciales(): Observable<Microcredencial[]> {
    return this.http.get<Microcredencial[]>(`${this.apiUrl}/microcredenciales`);
  }

  // Obtener acreedores de una microcredencial
  obtenerAcreedoresMicrocredencial(idMicrocredencial: number): Observable<AcreedorPublico[]> {
    return this.http.get<AcreedorPublico[]>(`${this.apiUrl}/microcredencial/${idMicrocredencial}/acreedores`);
  }

  // Buscar perfiles de usuarios
  buscarPerfiles(busqueda: string): Observable<PerfilBuscado[]> {
    let params = new HttpParams();
    if (busqueda && busqueda.trim() !== '') {
      params = params.set('q', busqueda);
    }
    return this.http.get<PerfilBuscado[]>(`${this.apiUrl}/perfiles`, { params });
  }

  // Obtener el perfil público de un usuario
  obtenerPerfilPublico(cedula: string): Observable<PerfilPublico> {
    return this.http.get<PerfilPublico>(`${this.apiUrl}/perfil/${cedula}`);
  }
}

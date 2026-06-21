import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface MicrocredencialPublica {
  id_microcredencial: number;
  nombre: string;
  descripcion: string;
  criterios_evaluacion: string;
  duracion_horas: number;
  competencias: string;
  imagen_url: string;
  aprobado_en: string;
  creado_en: string;
  ultima_actualizacion: string;
  emisor: string;
  emisor_correo: string;
  nivel: string;
  area_conocimiento: string;
  estado: string;
  num_emisiones: number;
}

@Component({
  selector: 'app-microcredenciales-registradas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './microcredenciales-registradas.componente.html'
})
export class MicrocredencialesRegistradasComponente implements OnInit {
  microcredenciales: MicrocredencialPublica[] = [];
  microcredencialesFiltradas: MicrocredencialPublica[] = [];
  
  terminoBusqueda: string = '';
  cargando: boolean = true;
  error: boolean = false;
  menuOrdenarAbierto = false;
  opcionesExpandidas = true;

  ordenarPor = {
    fecha: true,
    nombre: false,
    emisor: false,
    area: false,
    emisiones: false,
    duracion: false
  };

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.obtenerMicrocredenciales();
  }

  obtenerMicrocredenciales(): void {
    this.cargando = true;
    this.error = false;
    this.http.get<{exito: boolean, datos: MicrocredencialPublica[]}>(`${environment.urlBackend}/public/microcredenciales`)
      .subscribe({
        next: (response) => {
          if (response.exito) {
            this.microcredenciales = response.datos.map((m: any, index: number) => ({ ...m, _index: index }));
            this.microcredencialesFiltradas = [...this.microcredenciales];
            this.aplicarOrden();
          } else {
            this.error = true;
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al obtener microcredenciales:', err);
          this.error = true;
          this.cargando = false;
        }
      });
  }

  filtrarMicrocredenciales(): void {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.microcredencialesFiltradas = [...this.microcredenciales];
    } else {
      const cleanString = (str: string) =>
        (str || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const cleanQuery = cleanString(this.terminoBusqueda);
      const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);

      this.microcredencialesFiltradas = this.microcredenciales.filter(m => {
        const cleanItem = cleanString(
          (m.nombre || '') + ' ' +
          (m.area_conocimiento || '') + ' ' +
          (m.emisor || '') + ' ' +
          (m.emisor_correo || '') + ' ' +
          (m.competencias || '')
        );
        return queryWords.every(word => cleanItem.includes(word));
      });
    }
    this.aplicarOrden();
  }

  get mostrarTextoOrdenamiento(): boolean {
    const activeFilters = Object.keys(this.ordenarPor).filter(k => (this.ordenarPor as any)[k]);
    if (activeFilters.length === 1 && activeFilters[0] === 'fecha') return true;
    return false;
  }

  toggleMenuOrdenar(): void {
    this.menuOrdenarAbierto = !this.menuOrdenarAbierto;
  }

  toggleOpciones(): void {
    this.menuOrdenarAbierto = false;
    this.opcionesExpandidas = !this.opcionesExpandidas;
    this.aplicarOrden();
  }

  toggleFecha(): void {
    this.ordenarPor.fecha = !this.ordenarPor.fecha;
    this.aplicarOrden();
  }

  toggleNombre(): void {
    this.ordenarPor.nombre = !this.ordenarPor.nombre;
    this.aplicarOrden();
  }

  toggleEmisor(): void {
    this.ordenarPor.emisor = !this.ordenarPor.emisor;
    this.aplicarOrden();
  }

  toggleArea(): void {
    this.ordenarPor.area = !this.ordenarPor.area;
    this.aplicarOrden();
  }

  toggleEmisiones(): void {
    this.ordenarPor.emisiones = !this.ordenarPor.emisiones;
    this.aplicarOrden();
  }

  toggleDuracion(): void {
    this.ordenarPor.duracion = !this.ordenarPor.duracion;
    this.aplicarOrden();
  }

  aplicarOrden(): void {
    const direction = this.opcionesExpandidas ? 1 : -1;
    this.microcredencialesFiltradas.sort((a, b) => {
      
      if (this.ordenarPor.fecha) {
        const fechaA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
        const fechaB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
        const diff = fechaA - fechaB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.nombre) {
        const comp = (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.emisor) {
        const comp = (a.emisor || '').localeCompare(b.emisor || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.area) {
        const comp = (a.area_conocimiento || '').localeCompare(b.area_conocimiento || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.emisiones) {
        const emiA = a.num_emisiones || 0;
        const emiB = b.num_emisiones || 0;
        const diff = emiA - emiB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.duracion) {
        const durA = a.duracion_horas || 0;
        const durB = b.duracion_horas || 0;
        const diff = durA - durB;
        if (diff !== 0) return diff * direction;
      }

      return ((a as any)._index - (b as any)._index) * direction;
    });
  }

  verMicrocredencial(id: number): void {
    window.open(`/microcredenciales/${id}`, '_blank');
  }
}

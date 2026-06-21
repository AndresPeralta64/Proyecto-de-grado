import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';

interface DetalleMicrocredencial {
  id_microcredencial: number;
  nombre: string;
  descripcion: string;
  criterios_evaluacion: string;
  duracion_horas: number;
  competencias: any; // Can be string or array
  imagen_url: string;
  emisor: string;
  emisor_correo: string;
  nivel: string;
  area_conocimiento: string;
  estado: string;
  num_emisiones: number;
}

interface EmisionInsignia {
  id_global: string;
  fecha_emision: string;
  nombres: string;
  apellidos: string;
  estado: string; // 'ACTIVA' | 'REVOCADA'
}

@Component({
  selector: 'app-detalle-microcredencial',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavegacionComponente, SidebarComponent],
  templateUrl: './detalle-microcredencial.componente.html'
})
export class DetalleMicrocredencialComponente implements OnInit {
  idMicrocredencial: string | null = null;
  microcredencial: DetalleMicrocredencial | null = null;
  insigniasEmitidas: EmisionInsignia[] = [];
  insigniasFiltradas: EmisionInsignia[] = [];
  
  terminoBusqueda: string = '';
  cargando: boolean = true;
  error: boolean = false;
  mensajeError: string = '';
  rolActual: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    public sidebarServicio: SidebarServicio,
    private servicioToken: ServicioToken
  ) {}

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }

  ngOnInit(): void {
    this.obtenerRolActual();
    this.route.paramMap.subscribe(params => {
      this.idMicrocredencial = params.get('id');
      if (this.idMicrocredencial) {
        this.cargarDatos();
      } else {
        this.error = true;
        this.mensajeError = 'ID de microcredencial no proporcionado.';
        this.cargando = false;
      }
    });
  }

  obtenerRolActual(): void {
    const usuario = this.servicioToken.obtenerDatosUsuario();
    this.rolActual = usuario?.nombre_rol || '';
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = false;
    
    // Cargar detalles de la microcredencial
    this.http.get<{exito: boolean, datos: DetalleMicrocredencial, mensaje?: string}>(`${environment.urlBackend}/public/microcredenciales/${this.idMicrocredencial}`)
      .subscribe({
        next: (res) => {
          if (res.exito && res.datos) {
            this.microcredencial = res.datos;
            this.cargarEmisiones();
          } else {
            this.error = true;
            this.mensajeError = res.mensaje || 'Error al cargar los detalles.';
            this.cargando = false;
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.error = true;
          this.mensajeError = 'Error de conexión al cargar los detalles.';
          this.cargando = false;
        }
      });
  }

  cargarEmisiones(): void {
    this.http.get<{exito: boolean, datos: EmisionInsignia[]}>(`${environment.urlBackend}/public/microcredenciales/${this.idMicrocredencial}/insignias`)
      .subscribe({
        next: (res) => {
          if (res.exito) {
            this.insigniasEmitidas = res.datos;
            this.insigniasFiltradas = [...this.insigniasEmitidas];
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar emisiones:', err);
          // Aún mostramos la microcredencial aunque fallen las emisiones
          this.cargando = false;
        }
      });
  }

  filtrarInsignias(): void {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.insigniasFiltradas = [...this.insigniasEmitidas];
      return;
    }

    const cleanString = (str: string) =>
      (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const cleanQuery = cleanString(this.terminoBusqueda);
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);

    this.insigniasFiltradas = this.insigniasEmitidas.filter(ins => {
      const cleanUser = cleanString(`${ins.nombres} ${ins.apellidos}`);
      return queryWords.every(word => cleanUser.includes(word));
    });
  }

  obtenerIniciales(nombres: string, apellidos: string): string {
    const primerNombre = nombres ? nombres.trim().split(' ')[0] : '';
    const primerApellido = apellidos ? apellidos.trim().split(' ')[0] : '';
    const n = primerNombre ? primerNombre.charAt(0).toUpperCase() : '';
    const a = primerApellido ? primerApellido.charAt(0).toUpperCase() : '';
    return (n + a) || 'NA';
  }

  obtenerNombreFormateado(nombres: string, apellidos: string): string {
    return `${nombres} ${apellidos}`;
  }

  get competenciasArray(): string[] {
    if (!this.microcredencial) return [];
    
    const comp = this.microcredencial.competencias;
    if (Array.isArray(comp)) {
      return comp;
    }
    
    if (typeof comp === 'string') {
      try {
        const parsed = JSON.parse(comp);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return comp.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    
    return [];
  }

  volver(): void {
    this.location.back();
  }
}

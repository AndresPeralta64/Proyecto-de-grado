import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';

@Component({
  selector: 'app-receptor-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.componente.html',
  styleUrls: ['./perfil.componente.css']
})
export class PerfilReceptorComponente implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  // Estado de Búsqueda
  terminoBusquedaInsignia = '';

  // Insignias
  insigniasObtenidas: any[] = [];
  insigniasSeleccionadas = new Set<number>();

  // Áreas
  areas: any[] = [];
  areasSeleccionadas = new Set<number>();

  // Filtros UI
  dropdownAreaAbierto = false;
  opcionesExpandidas = true; // For sorting direction

  // Datos Perfil (Derecha)
  datosReceptor: any = null;
  nombreCompletoReceptor = '';
  descripcionPerfil = '';

  constructor(
    private insigniaServicio: InsigniaServicio,
    private microcredencialServicio: MicrocredencialServicio,
    private usuarioServicio: UsuarioServicio
  ) { }

  ngOnInit(): void {
    this.cargarInsigniasAdquiridas();
    this.cargarAreas();
    this.cargarDatosReceptor();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarInsigniasAdquiridas() {
    this.subscription.add(
      this.insigniaServicio.obtenerHistorialReceptor().subscribe({
        next: (res: any) => {
          if (res && res.exito) {
            // Filtrar solo las activas
            this.insigniasObtenidas = (res.datos || []).filter((item: any) => item.estado === 'ACTIVA');
          }
        },
        error: (err: any) => {
          console.error('Error al cargar historial de insignias:', err);
        }
      })
    );
  }

  cargarDatosReceptor() {
    this.subscription.add(
      this.usuarioServicio.obtenerPerfil().subscribe({
        next: (res: any) => {
          if (res && res.exito) {
            this.datosReceptor = res.datos;
            const nombres = this.datosReceptor.nombres || '';
            const apellidos = this.datosReceptor.apellidos || '';
            this.nombreCompletoReceptor = `${nombres} ${apellidos}`.trim();
          }
        },
        error: (err: any) => console.error('Error al cargar perfil:', err)
      })
    );
  }

  cargarAreas() {
    this.subscription.add(
      this.microcredencialServicio.obtenerAreasConocimiento().subscribe({
        next: (res: any) => {
          if (res && res.exito) {
            this.areas = res.datos || [];
          }
        },
        error: (err: any) => console.error('Error al cargar áreas de conocimiento:', err)
      })
    );
  }

  toggleDropdownArea() {
    this.dropdownAreaAbierto = !this.dropdownAreaAbierto;
  }

  toggleArea(idArea: number) {
    if (this.areasSeleccionadas.has(idArea)) {
      this.areasSeleccionadas.delete(idArea);
    } else {
      this.areasSeleccionadas.add(idArea);
    }
  }

  estaAreaSeleccionada(idArea: number): boolean {
    return this.areasSeleccionadas.has(idArea);
  }

  todasAreasSeleccionadas(): boolean {
    return this.areas.length > 0 && this.areasSeleccionadas.size === this.areas.length;
  }

  toggleSeleccionarTodasAreas() {
    if (this.todasAreasSeleccionadas()) {
      this.areasSeleccionadas.clear();
    } else {
      this.areas.forEach(area => this.areasSeleccionadas.add(area.id_area));
    }
  }

  toggleOrdenamiento() {
    this.opcionesExpandidas = !this.opcionesExpandidas;
  }

  toggleInsignia(id: number) {
    if (this.insigniasSeleccionadas.has(id)) {
      this.insigniasSeleccionadas.delete(id);
    } else {
      this.insigniasSeleccionadas.add(id);
    }
  }

  estaSeleccionada(id: number): boolean {
    return this.insigniasSeleccionadas.has(id);
  }

  obtenerInsigniaPorId(id: number): any {
    return this.insigniasObtenidas.find(ins => ins.id === id);
  }

  get insigniasFiltradas(): any[] {
    const buscar = (this.terminoBusquedaInsignia || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    let lista = this.insigniasObtenidas;

    // Filter by Area
    if (this.areasSeleccionadas.size > 0) {
      const nombresSeleccionados = new Set(
        this.areas.filter(a => this.areasSeleccionadas.has(a.id_area)).map(a => a.nombre)
      );
      lista = lista.filter(ins => nombresSeleccionados.has(ins.area_conocimiento));
    }

    if (buscar) {
      const queryWords = buscar.split(/\s+/).filter(w => w.length > 0);
      lista = lista.filter(ins => {
        const clean = (
          (ins.microcredencial || '') + ' ' +
          (ins.area_conocimiento || '')
        )
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return queryWords.every(word => clean.includes(word));
      });
    }

    // Sort by fecha_emision
    lista.sort((a, b) => {
      const timeA = new Date(a.fecha_completa).getTime();
      const timeB = new Date(b.fecha_completa).getTime();
      // Si apunta hacia arriba (true) -> Ascendente (1,2,3 / más antiguo primero)
      // Si apunta hacia abajo (false) -> Descendente (3,2,1 / más reciente primero)
      if (this.opcionesExpandidas) {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });

    return lista;
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}

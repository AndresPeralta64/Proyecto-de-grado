import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EstadisticasServicio } from '../../../core/servicios/estadisticas.servicio';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.componente.html'
})
export class DashboardComponente implements OnInit {
  estadisticas: any = null;
  cargando = true;
  error = '';

  constructor(private estadisticasServicio: EstadisticasServicio) {}

  ngOnInit(): void {
    this.obtenerEstadisticas();
  }

  obtenerEstadisticas() {
    this.cargando = true;
    this.estadisticasServicio.obtenerEstadisticasAdministrador().subscribe({
      next: (res) => {
        if (res.exito) {
          this.estadisticas = res.datos;
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las estadísticas.';
        this.cargando = false;
      }
    });
  }

  obtenerCantidadPorEstado(estadoNombre: string): number {
    if (!this.estadisticas || !this.estadisticas.microcredencialesPorEstado) return 0;
    const item = this.estadisticas.microcredencialesPorEstado.find((e: any) => e.estado === estadoNombre);
    return item ? item.count : 0;
  }

  obtenerCantidadUsuariosPorEstado(estadoNombre: string): number {
    if (!this.estadisticas || !this.estadisticas.usuariosPorEstado) return 0;
    const item = this.estadisticas.usuariosPorEstado.find((e: any) => e.estado === estadoNombre);
    return item ? item.count : 0;
  }

  getUsuariosPieChart(): string {
    const activos = this.obtenerCantidadUsuariosPorEstado('Activo');
    const inactivos = this.obtenerCantidadUsuariosPorEstado('Inactivo');
    const total = activos + inactivos;
    if (total === 0) return 'conic-gradient(#E2E8F0 0% 100%)';

    const pActivos = (activos / total) * 100;
    return `conic-gradient(#0067B8 0% ${pActivos}%, #8B8B8B ${pActivos}% 100%)`;
  }

  getMicrocredencialesPieChart(): string {
    const aprobadas = this.obtenerCantidadPorEstado('Aprobada');
    const pendientes = this.obtenerCantidadPorEstado('Pendiente');
    const rechazadas = this.obtenerCantidadPorEstado('Rechazada');
    const inactivas = this.obtenerCantidadPorEstado('Inactiva');
    const total = aprobadas + pendientes + rechazadas + inactivas;
    
    if (total === 0) return 'conic-gradient(#E2E8F0 0% 100%)';

    const pAprobadas = (aprobadas / total) * 100;
    const pPendientes = pAprobadas + ((pendientes / total) * 100);
    const pRechazadas = pPendientes + ((rechazadas / total) * 100);

    return `conic-gradient(
      #30A32C 0% ${pAprobadas}%, 
      #A3872C ${pAprobadas}% ${pPendientes}%, 
      #A32C2E ${pPendientes}% ${pRechazadas}%, 
      #8B8B8B ${pRechazadas}% 100%
    )`;
  }
}

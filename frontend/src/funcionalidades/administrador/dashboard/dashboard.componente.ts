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

  constructor(private estadisticasServicio: EstadisticasServicio) { }

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
    return `conic-gradient(#27AE60 0% ${pActivos}%, #C0392B ${pActivos}% 100%)`;
  }

  obtenerCantidadUsuariosPorRol(rolNombre: string): number {
    if (!this.estadisticas || !this.estadisticas.usuariosPorRol) return 0;
    const item = this.estadisticas.usuariosPorRol.find((e: any) => e.rol === rolNombre);
    return item ? item.count : 0;
  }

  getRolesPieChart(): string {
    const admin = this.obtenerCantidadUsuariosPorRol('Administrador');
    const emisor = this.obtenerCantidadUsuariosPorRol('Emisor');
    const receptor = this.obtenerCantidadUsuariosPorRol('Receptor');
    const total = admin + emisor + receptor;
    if (total === 0) return 'conic-gradient(#E2E8F0 0% 100%)';

    const pAdmin = (admin / total) * 100;
    const pEmisor = pAdmin + ((emisor / total) * 100);

    return `conic-gradient(
      #6C3483 0% ${pAdmin}%, 
      #1D659F ${pAdmin}% ${pEmisor}%, 
      #F1C40F ${pEmisor}% 100%
    )`;
  }

  obtenerCantidadInsigniasPorEstado(estadoNombre: string): number {
    if (!this.estadisticas || !this.estadisticas.insigniasPorEstado) return 0;
    const item = this.estadisticas.insigniasPorEstado.find((e: any) => e.estado === estadoNombre);
    return item ? item.count : 0;
  }

  getInsigniasPieChart(): string {
    const activas = this.obtenerCantidadInsigniasPorEstado('Activa');
    const revocadas = this.obtenerCantidadInsigniasPorEstado('Revocada');
    const total = activas + revocadas;
    if (total === 0) return 'conic-gradient(#E2E8F0 0% 100%)';

    const pActivas = (activas / total) * 100;

    return `conic-gradient(
      #27AE60 0% ${pActivas}%, 
      #C0392B ${pActivas}% 100%
    )`;
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
      #27AE60 0% ${pAprobadas}%, 
      #F1C40F ${pAprobadas}% ${pPendientes}%, 
      #C0392B ${pPendientes}% ${pRechazadas}%, 
      #717B81 ${pRechazadas}% 100%
    )`;
  }
}

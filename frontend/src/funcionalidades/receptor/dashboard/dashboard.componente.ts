import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EstadisticasServicio } from '../../../core/servicios/estadisticas.servicio';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard-receptor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.componente.html'
})
export class DashboardReceptorComponente implements OnInit {
  estadisticas: any = null;
  cargando = true;
  error = '';
  apiUrl = environment.urlBackend;

  constructor(private estadisticasServicio: EstadisticasServicio) {}

  ngOnInit(): void {
    this.obtenerEstadisticas();
  }

  obtenerEstadisticas() {
    this.cargando = true;
    this.estadisticasServicio.obtenerEstadisticasReceptor().subscribe({
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
    if (!this.estadisticas || !this.estadisticas.insigniasPorEstado) return 0;
    const item = this.estadisticas.insigniasPorEstado.find((e: any) => e.estado === estadoNombre);
    return item ? item.count : 0;
  }

  getInsigniasPieChart(): string {
    const activas = this.obtenerCantidadPorEstado('Activa');
    const revocadas = this.obtenerCantidadPorEstado('Revocada');
    const total = activas + revocadas;
    
    if (total === 0) return 'conic-gradient(#E2E8F0 0% 100%)';

    const pActivas = (activas / total) * 100;
    return `conic-gradient(#27AE60 0% ${pActivas}%, #C0392B ${pActivas}% 100%)`;
  }
}

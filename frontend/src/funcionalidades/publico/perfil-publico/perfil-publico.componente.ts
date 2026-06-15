import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicoServicio, PerfilPublico } from '../../../core/servicios/publico.servicio';

@Component({
  selector: 'app-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-publico.componente.html',
  styleUrls: ['./perfil-publico.componente.css']
})
export class PerfilPublicoComponente implements OnInit {
  private route = inject(ActivatedRoute);
  private publicoServicio = inject(PublicoServicio);

  perfilData: PerfilPublico | null = null;
  cargando = true;
  error = false;
  cedula = '';

  // Para agrupamiento
  insigniasAgrupadas: { [key: string]: any[] } = {};

  ngOnInit(): void {
    const cedula = this.route.snapshot.paramMap.get('cedula');
    if (cedula) {
      this.cedula = cedula;
      this.cargarPerfil();
    }
  }

  cargarPerfil(): void {
    this.publicoServicio.obtenerPerfilPublico(this.cedula).subscribe({
      next: (data) => {
        this.perfilData = data;
        if (data.perfil.agrupar_insignias) {
          this.agruparInsignias();
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil público', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  agruparInsignias(): void {
    if (!this.perfilData) return;
    
    this.insigniasAgrupadas = {};
    this.perfilData.insignias.forEach(insignia => {
      const area = insignia.area_nombre || 'Otras';
      if (!this.insigniasAgrupadas[area]) {
        this.insigniasAgrupadas[area] = [];
      }
      this.insigniasAgrupadas[area].push(insignia);
    });
  }

  get keysAgrupadas(): string[] {
    return Object.keys(this.insigniasAgrupadas);
  }
}

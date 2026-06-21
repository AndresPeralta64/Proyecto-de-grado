import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';

@Component({
  selector: 'app-detalle-microcredencial',
  standalone: true,
  imports: [CommonModule, RouterModule, NavegacionComponente, SidebarComponent],
  templateUrl: './detalle-microcredencial.componente.html'
})
export class DetalleMicrocredencialComponente implements OnInit {
  idMicrocredencial: string = '';
  microcredencial: any = null;
  emisiones: any[] = [];
  cargando: boolean = true;
  error: boolean = false;
  rolActual: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private microcredencialServicio: MicrocredencialServicio,
    public sidebarServicio: SidebarServicio,
    private servicioToken: ServicioToken
  ) {}

  ngOnInit(): void {
    this.obtenerRolActual();
    this.route.paramMap.subscribe(params => {
      this.idMicrocredencial = params.get('id') || '';
      if (this.idMicrocredencial) {
        this.cargarDatos();
      } else {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }

  obtenerRolActual(): void {
    const token = this.servicioToken.obtenerToken();
    if (token && this.servicioToken.estaAutenticado()) {
      const usuario = this.servicioToken.obtenerDatosUsuario();
      this.rolActual = usuario?.nombre_rol || '';
    } else {
      this.rolActual = '';
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = false;

    // Primero la microcredencial
    this.microcredencialServicio.obtenerMicrocredencialPublicaPorId(this.idMicrocredencial).subscribe({
      next: (res) => {
        if (res.exito && res.datos) {
          this.microcredencial = res.datos;
          this.cargarEmisiones();
        } else {
          this.error = true;
          this.cargando = false;
        }
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  cargarEmisiones(): void {
    this.microcredencialServicio.obtenerEmisionesPublicas(this.idMicrocredencial).subscribe({
      next: (res) => {
        if (res.exito) {
          this.emisiones = res.datos || [];
        }
        this.cargando = false;
      },
      error: () => {
        // Aún si fallan las emisiones mostramos la microcredencial
        this.cargando = false;
      }
    });
  }

  formatearCompetencias(competencias: string | string[]): string {
    if (!competencias) return 'Sin especificar';
    if (Array.isArray(competencias)) return competencias.join(', ');
    try {
      const arr = JSON.parse(competencias);
      if (Array.isArray(arr)) return arr.join(', ');
    } catch (e) {
      // Ignorar si no es JSON válido
    }
    return competencias as string;
  }

  volver(): void {
    const rol = this.rolActual.toUpperCase();
    if (rol === 'ADMINISTRADOR' || rol === 'ADMIN') {
      this.router.navigate(['/administrador/microcredenciales-registradas']);
    } else {
      this.router.navigate(['/microcredenciales-registradas']);
    }
  }

  obtenerIniciales(nombres: string, apellidos: string): string {
    const n = nombres ? nombres.charAt(0).toUpperCase() : '';
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return `${n}${a}`;
  }
}

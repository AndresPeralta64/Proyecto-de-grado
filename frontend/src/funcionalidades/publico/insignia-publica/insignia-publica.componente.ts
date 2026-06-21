import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';

@Component({
  selector: 'app-insignia-publica',
  standalone: true,
  imports: [CommonModule, RouterModule, NavegacionComponente, SidebarComponent],
  templateUrl: './insignia-publica.componente.html'
})
export class InsigniaPublicaComponente implements OnInit {
  idGlobal: string = '';
  insignia: any = null;
  cargando: boolean = true;
  error: boolean = false;
  
  formatoDescarga: 'PNG' | 'JSON' = 'PNG';
  dropdownFormatoAbierto: boolean = false;
  rolActual: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private insigniaServicio: InsigniaServicio,
    public sidebarServicio: SidebarServicio,
    private servicioToken: ServicioToken
  ) {}

  ngOnInit(): void {
    this.obtenerRolActual();
    this.route.paramMap.subscribe(params => {
      this.idGlobal = params.get('id') || '';
      if (this.idGlobal) {
        this.cargarInsignia();
      } else {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  obtenerRolActual(): void {
    const usuario = this.servicioToken.obtenerDatosUsuario();
    this.rolActual = usuario?.nombre_rol || '';
  }

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }

  cargarInsignia(): void {
    this.insigniaServicio.obtenerInsigniaPublica(this.idGlobal).subscribe({
      next: (res) => {
        if (res.exito && res.datos) {
          this.insignia = res.datos;
        } else {
          this.error = true;
        }
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  toggleFormato() {
    this.dropdownFormatoAbierto = !this.dropdownFormatoAbierto;
  }

  seleccionarFormato(formato: 'PNG' | 'JSON') {
    this.formatoDescarga = formato;
    this.dropdownFormatoAbierto = false;
  }

  cerrarDropdownFormato() {
    setTimeout(() => {
      this.dropdownFormatoAbierto = false;
    }, 200);
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

  obtenerArrayCompetencias(competencias: string | string[]): string[] {
    if (!competencias) return [];
    if (Array.isArray(competencias)) return competencias;
    try {
      const arr = JSON.parse(competencias);
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      // Ignorar
    }
    if (typeof competencias === 'string') {
      return competencias.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
    return [];
  }


  descargarInsignia() {
    if (!this.insignia) return;
    
    if (this.formatoDescarga === 'PNG') {
      if (!this.insignia.png_baked_url) return;
      fetch(this.insignia.png_baked_url)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `insignia-${this.insignia.microcredencial.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        })
        .catch(err => {
          console.error('Error al descargar la insignia:', err);
        });
    } else if (this.formatoDescarga === 'JSON') {
      if (!this.insignia.url_externo) return;
      fetch(this.insignia.url_externo)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `insignia-${this.insignia.microcredencial.replace(/\s+/g, '-').toLowerCase()}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        })
        .catch(err => {
          console.error('Error al descargar JSON:', err);
        });
    }
  }

  volverAlInicio() {
    const rol = this.rolActual.toUpperCase();
    if (rol === 'ADMINISTRADOR' || rol === 'ADMIN') {
      this.router.navigate(['/administrador']);
    } else if (rol === 'EMISOR') {
      this.router.navigate(['/emisor']);
    } else if (rol === 'RECEPTOR') {
      this.router.navigate(['/receptor']);
    } else {
      this.router.navigate(['/']);
    }
  }

  copiarUrlVerificacion() {
    if (this.insignia?.url_externo) {
      navigator.clipboard.writeText(this.insignia.url_externo).then(() => {
        // URL copiada al portapapeles
      });
    }
  }
}


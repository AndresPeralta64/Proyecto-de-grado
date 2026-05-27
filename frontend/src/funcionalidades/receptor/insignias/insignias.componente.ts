import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-receptor-insignias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insignias.componente.html'
})
export class ReceptorInsigniasComponente implements OnInit, OnDestroy {
  insignias: any[] = [];
  insigniasFiltradas: any[] = [];
  terminoBusqueda: string = '';
  
  // Paginación
  paginaActual: number = 1;
  limiteRegistros: number = 10;
  totalPaginas: number = 1;

  // Filtros
  menuMostrarAbierto: boolean = false;
  filtros = {
    estados: {
      activa: true,
      revocada: true
    }
  };

  // Modal Info
  mostrarModalInfo: boolean = false;
  insigniaSeleccionada: any = null;

  private destruir$ = new Subject<void>();

  constructor(private insigniaServicio: InsigniaServicio) {}

  ngOnInit(): void {
    this.cargarMisInsignias();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  cargarMisInsignias(): void {
    this.insigniaServicio.obtenerMisInsignias()
      .pipe(takeUntil(this.destruir$))
      .subscribe({
        next: (respuesta: any) => {
          if (respuesta.exito) {
            this.insignias = respuesta.datos;
            this.aplicarFiltros();
          }
        },
        error: (err: any) => {
          console.error('Error al cargar mis insignias:', err);
        }
      });
  }

  toggleMostrar(): void {
    this.menuMostrarAbierto = !this.menuMostrarAbierto;
  }

  aplicarFiltros(): void {
    let filtradas = [...this.insignias];

    // Filtro de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      filtradas = filtradas.filter(item => 
        item.microcredencial.toLowerCase().includes(termino) ||
        item.emisor.toLowerCase().includes(termino) ||
        item.nivel.toLowerCase().includes(termino)
      );
    }

    // Filtro de estados
    filtradas = filtradas.filter(item => {
      if (item.estado === 'ACTIVA' && this.filtros.estados.activa) return true;
      if (item.estado === 'REVOCADA' && this.filtros.estados.revocada) return true;
      return false;
    });

    this.insigniasFiltradas = filtradas;
    this.totalPaginas = Math.ceil(this.insigniasFiltradas.length / this.limiteRegistros) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  get insigniasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.limiteRegistros;
    const fin = inicio + this.limiteRegistros;
    return this.insigniasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(direccion: number): void {
    const nuevaPagina = this.paginaActual + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  abrirModalInfo(insignia: any): void {
    this.insigniaSeleccionada = insignia;
    this.mostrarModalInfo = true;
  }

  cerrarModalInfo(): void {
    this.mostrarModalInfo = false;
    this.insigniaSeleccionada = null;
  }

  async descargarInsigniaPNG(insignia: any): Promise<void> {
    if (insignia.png_baked_url) {
      try {
        const response = await fetch(insignia.png_baked_url);
        if (!response.ok) throw new Error('Error en la respuesta de la imagen');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreLimpio = insignia.microcredencial.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        a.download = `insignia-${nombreLimpio}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al descargar PNG, abriendo en nueva pestaña:', error);
        window.open(insignia.png_baked_url, '_blank');
      }
    }
  }

  async descargarInsigniaJSON(insignia: any): Promise<void> {
    if (insignia.url_externo) {
      try {
        const response = await fetch(insignia.url_externo);
        if (!response.ok) throw new Error('Error en la respuesta del JSON');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreLimpio = insignia.microcredencial.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        a.download = `insignia-${nombreLimpio}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al descargar JSON, abriendo en nueva pestaña:', error);
        window.open(insignia.url_externo, '_blank');
      }
    }
  }

  trackByInsigniaId(index: number, insignia: any): number {
    return insignia.id;
  }
}

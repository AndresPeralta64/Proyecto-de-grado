import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';

@Component({
  selector: 'app-receptor-insignias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './insignias.componente.html',
  styleUrls: ['./insignias.componente.css']
})
export class InsigniasReceptorComponente implements OnInit, OnDestroy {
  opcionesExpandidas = true;
  menuMostrarAbierto = false;
  menuOrdenarAbierto = false;
  dropdownLimiteAbierto = false;
  private subscription: Subscription = new Subscription();

  terminoBusqueda = '';

  paginaActual = 1;
  limiteRegistros = 10;
  limiteOpciones = [10, 25, 50, 100];

  filtros = {
    estados: {
      aprobada: true,
      revocada: true
    }
  };

  ordenarPor = {
    fecha: true,
    emisor: false,
    microcredencial: false,
    duracion: false,
    estado: false
  };
  mostrarTextoOrdenamiento = false;

  insignias: any[] = [];

  mostrarModalInfo = false;
  insigniaSeleccionada: any = null;

  formatoDescarga: string = 'PNG';
  dropdownFormatoAbierto: boolean = false;

  constructor(
    private insigniaServicio: InsigniaServicio
  ) { }

  ngOnInit(): void {
    this.cargarInsigniasAdquiridas();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleFormato() {
    this.dropdownFormatoAbierto = !this.dropdownFormatoAbierto;
  }

  seleccionarFormato(formato: string) {
    this.formatoDescarga = formato;
    this.dropdownFormatoAbierto = false;
  }

  cerrarDropdownFormato() {
    setTimeout(() => {
      this.dropdownFormatoAbierto = false;
    }, 200);
  }

  get insigniasFiltradas() {
    let filtradas = this.insignias.filter(ins => {
      const buscar = this.terminoBusqueda.toLowerCase();
      const cumpleBusqueda = ins.emisor.toLowerCase().includes(buscar) ||
        ins.microcredencial.toLowerCase().includes(buscar);

      let cumpleEstado = false;
      if (ins.estado === 'ACTIVA' && this.filtros.estados.aprobada) cumpleEstado = true;
      if (ins.estado === 'REVOCADA' && this.filtros.estados.revocada) cumpleEstado = true;

      return cumpleBusqueda && cumpleEstado;
    });

    filtradas.sort((a, b) => {
      const activeSorts = Object.keys(this.ordenarPor).filter(key => this.ordenarPor[key as keyof typeof this.ordenarPor]);

      for (const sortKey of activeSorts) {
        let cmp = 0;
        switch (sortKey) {
          case 'fecha':
            const timeA = new Date(a.fecha_completa).getTime();
            const timeB = new Date(b.fecha_completa).getTime();
            cmp = timeA - timeB;
            break;
          case 'emisor':
            cmp = (a.emisor || '').localeCompare(b.emisor || '');
            break;
          case 'microcredencial':
            cmp = (a.microcredencial || '').localeCompare(b.microcredencial || '');
            break;
          case 'duracion':
            cmp = (parseInt(String(a.duracion), 10) || 0) - (parseInt(String(b.duracion), 10) || 0);
            break;
          case 'estado':
            const valA = a.estado === 'ACTIVA' ? 1 : 2;
            const valB = b.estado === 'ACTIVA' ? 1 : 2;
            cmp = valA - valB;
            break;
        }
        if (cmp !== 0) {
          return cmp;
        }
      }
      return 0;
    });

    if (!this.opcionesExpandidas) {
      filtradas = filtradas.reverse();
    }

    return filtradas;
  }

  get insigniasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.limiteRegistros;
    return this.insigniasFiltradas.slice(inicio, inicio + this.limiteRegistros);
  }

  get totalPaginas() {
    return Math.ceil(this.insigniasFiltradas.length / this.limiteRegistros) || 1;
  }

  get soloFecha(): boolean {
    const activeSorts = Object.keys(this.ordenarPor).filter(key => this.ordenarPor[key as keyof typeof this.ordenarPor]);
    return activeSorts.length === 1 && activeSorts[0] === 'fecha';
  }

  toggleMostrar() {
    this.menuMostrarAbierto = !this.menuMostrarAbierto;
    this.menuOrdenarAbierto = false;
  }

  toggleOrdenar() {
    this.menuOrdenarAbierto = !this.menuOrdenarAbierto;
    this.menuMostrarAbierto = false;
  }

  toggleOpciones() {
    this.opcionesExpandidas = !this.opcionesExpandidas;
    this.actualizarTextoOrdenamiento();
  }

  toggleLimite() {
    this.dropdownLimiteAbierto = !this.dropdownLimiteAbierto;
  }

  cambiarLimite(limite: number) {
    this.limiteRegistros = limite;
    this.paginaActual = 1;
    this.dropdownLimiteAbierto = false;
  }

  private actualizarTextoOrdenamiento() {
    const algunOrdenActivo = Object.values(this.ordenarPor).some(val => val);
    this.mostrarTextoOrdenamiento = !algunOrdenActivo;
  }

  irAPrimeraPagina() {
    this.paginaActual = 1;
  }

  irAPaginaAnterior() {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  irAPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  irAUltimaPagina() {
    this.paginaActual = this.totalPaginas;
  }

  mostrarToast = false;
  mensajeToast = '';
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  lanzarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
    }, 4500);
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

  abrirModalInfo(item: any) {
    this.insigniaSeleccionada = item;
    this.formatoDescarga = 'PNG';
    this.dropdownFormatoAbierto = false;
    this.mostrarModalInfo = true;
  }

  cerrarModalInfo() {
    this.mostrarModalInfo = false;
    this.insigniaSeleccionada = null;
    this.formatoDescarga = 'PNG';
    this.dropdownFormatoAbierto = false;
  }

  get urlCompartir(): string {
    if (!this.insigniaSeleccionada || !this.insigniaSeleccionada.id_global) return '';
    return `${window.location.origin}/insignia/${this.insigniaSeleccionada.id_global}`;
  }

  copiarUrlVerificacion() {
    const url = this.urlCompartir;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.lanzarNotificacion('URL copiada al portapapeles', 'exito');
    }).catch(err => {
      console.error('Error al copiar URL:', err);
      this.lanzarNotificacion('Error al copiar la URL', 'error');
    });
  }

  descargarInsignia(insignia: any) {
    if (!insignia) return;
    
    if (this.formatoDescarga === 'PNG') {
      if (!insignia.png_baked_url) return;
      fetch(insignia.png_baked_url)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `insignia-${insignia.microcredencial.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        })
        .catch(err => {
          console.error('Error al descargar la insignia:', err);
          this.lanzarNotificacion('Error al intentar descargar la insignia', 'error');
        });
    } else if (this.formatoDescarga === 'JSON') {
      if (!insignia.url_externo) return;
      fetch(insignia.url_externo)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `insignia-${insignia.microcredencial.replace(/\s+/g, '-').toLowerCase()}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        })
        .catch(err => {
          console.error('Error al descargar la insignia:', err);
          this.lanzarNotificacion('Error al intentar descargar la insignia', 'error');
        });
    }
  }

  cargarInsigniasAdquiridas() {
    this.subscription.add(
      this.insigniaServicio.obtenerHistorialReceptor().subscribe({
        next: (res: any) => {
          if (res && res.exito) {
            this.insignias = (res.datos || []).map((item: any) => ({
              ...item,
              duracion: `${item.duracion} H`
            }));
          }
        },
        error: (err: any) => {
          console.error('Error al cargar historial de insignias:', err);
        }
      })
    );
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}

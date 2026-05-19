import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';

@Component({
  selector: 'app-insignias-emisor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './insignias.componente.html',
  styleUrls: ['./insignias.componente.css']
})
export class InsigniasEmisorComponente implements OnInit {
  pestaniaActiva: 'historial' | 'emitir' = 'historial';
  
  // Datos
  historial: any[] = [];
  microcredenciales: any[] = [];
  receptores: any[] = [];
  receptoresFiltrados: any[] = [];
  
  // Filtros del historial
  filtroTexto: string = '';
  filtroMicrocredencial: number | '' = '';
  filtroEstado: number | '' = '';
  
  // Buscador de receptores en emisión
  buscarReceptorEmision: string = '';

  // Cargando states
  cargandoHistorial: boolean = false;
  cargandoMicrocredenciales: boolean = false;
  cargandoReceptores: boolean = false;
  cargandoAccion: boolean = false;

  // Formulario Emisión
  emisionMicroId: number | '' = '';
  emisionReceptoresSeleccionados: number[] = [];

  // Modal Revocación
  modalRevocacionAbierto: boolean = false;
  revocarInsigniaId: number | null = null;
  revocarJustificacion: string = '';
  mensajeErrorRevocacion: string | null = null;

  // Toast
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  constructor(
    private servicioInsignia: InsigniaServicio,
    private servicioUsuario: UsuarioServicio,
    private servicioMicro: MicrocredencialServicio
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarMicrocredenciales();
    this.cargarReceptores();
  }

  cambiarPestania(pestania: 'historial' | 'emitir'): void {
    this.pestaniaActiva = pestania;
    if (pestania === 'historial') {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    const filtros = {
      search: this.filtroTexto || undefined,
      microcredencialId: this.filtroMicrocredencial || undefined,
      estado: this.filtroEstado || undefined,
      soloPropias: true
    };

    this.servicioInsignia.obtenerHistorial(filtros).subscribe({
      next: (res) => {
        this.historial = (res.datos || []).map((h: any) => ({
          ...h,
          microcredencial_imagen: this.obtenerImagenUrl(h.microcredencial_imagen)
        }));
        this.cargandoHistorial = false;
      },
      error: (err) => {
        this.cargandoHistorial = false;
        this.lanzarToast(err.error?.mensaje || 'Error al cargar el historial.', 'error');
      }
    });
  }

  cargarMicrocredenciales(): void {
    this.cargandoMicrocredenciales = true;
    this.servicioMicro.obtenerMicrocredenciales(true).subscribe({
      next: (res) => {
        // Filtrar solo las aprobadas (estado 'Aprobada')
        this.microcredenciales = (res.datos || [])
          .filter((m: any) => m.estado === 'Aprobada')
          .map((m: any) => ({
            ...m,
            imagen_url: this.obtenerImagenUrl(m.imagen_url)
          }));
        this.cargandoMicrocredenciales = false;
      },
      error: (err) => {
        this.cargandoMicrocredenciales = false;
        console.error(err);
      }
    });
  }

  obtenerMicroSeleccionada(): any {
    return this.microcredenciales.find(m => m.id_microcredencial === Number(this.emisionMicroId));
  }

  obtenerImagenUrl(url: string): string {
    if (!url || url === 'a') {
      return 'logo-espoch.png';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:3000${url}`;
  }

  cargarReceptores(): void {
    this.cargandoReceptores = true;
    this.servicioUsuario.obtenerReceptores().subscribe({
      next: (res) => {
        this.receptores = res.datos || [];
        this.receptoresFiltrados = [...this.receptores];
        this.cargandoReceptores = false;
      },
      error: (err) => {
        this.cargandoReceptores = false;
        console.error(err);
      }
    });
  }

  filtrarReceptores(): void {
    const busqueda = this.buscarReceptorEmision.toLowerCase().trim();
    if (!busqueda) {
      this.receptoresFiltrados = [...this.receptores];
    } else {
      this.receptoresFiltrados = this.receptores.filter(r => 
        r.nombres.toLowerCase().includes(busqueda) ||
        r.apellidos.toLowerCase().includes(busqueda) ||
        r.cedula.includes(busqueda) ||
        r.correo.toLowerCase().includes(busqueda)
      );
    }
  }

  onReceptorToggle(idUsuario: number): void {
    const idx = this.emisionReceptoresSeleccionados.indexOf(idUsuario);
    if (idx > -1) {
      this.emisionReceptoresSeleccionados.splice(idx, 1);
    } else {
      this.emisionReceptoresSeleccionados.push(idUsuario);
    }
  }

  seleccionarTodosReceptores(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.emisionReceptoresSeleccionados = this.receptoresFiltrados.map(r => r.id_usuario);
    } else {
      this.emisionReceptoresSeleccionados = [];
    }
  }

  estaSeleccionado(idUsuario: number): boolean {
    return this.emisionReceptoresSeleccionados.includes(idUsuario);
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroMicrocredencial = '';
    this.filtroEstado = '';
    this.cargarHistorial();
  }

  emitirInsignias(): void {
    if (!this.emisionMicroId) {
      this.lanzarToast('Debe seleccionar una microcredencial.', 'advertencia');
      return;
    }
    if (this.emisionReceptoresSeleccionados.length === 0) {
      this.lanzarToast('Debe seleccionar al menos un receptor.', 'advertencia');
      return;
    }

    this.cargandoAccion = true;
    const datos = {
      id_microcredencial: Number(this.emisionMicroId),
      receptores: this.emisionReceptoresSeleccionados
    };

    this.servicioInsignia.emitirInsignia(datos).subscribe({
      next: (res) => {
        this.cargandoAccion = false;
        this.lanzarToast('¡Insignias emitidas con éxito y firmadas criptográficamente!', 'exito');
        this.emisionMicroId = '';
        this.emisionReceptoresSeleccionados = [];
        this.buscarReceptorEmision = '';
        this.filtrarReceptores();
        this.cambiarPestania('historial');
      },
      error: (err) => {
        this.cargandoAccion = false;
        this.lanzarToast(err.error?.mensaje || 'Error al emitir las insignias.', 'error');
      }
    });
  }

  abrirModalRevocacion(idInsignia: number): void {
    this.revocarInsigniaId = idInsignia;
    this.revocarJustificacion = '';
    this.mensajeErrorRevocacion = null;
    this.modalRevocacionAbierto = true;
  }

  cerrarModalRevocacion(): void {
    this.modalRevocacionAbierto = false;
    this.revocarInsigniaId = null;
    this.revocarJustificacion = '';
    this.mensajeErrorRevocacion = null;
  }

  confirmarRevocacion(): void {
    if (!this.revocarJustificacion || this.revocarJustificacion.trim() === '') {
      this.mensajeErrorRevocacion = 'La justificación es obligatoria.';
      return;
    }

    if (!this.revocarInsigniaId) return;

    this.cargandoAccion = true;
    this.mensajeErrorRevocacion = null;

    this.servicioInsignia.revocarInsignia(this.revocarInsigniaId, this.revocarJustificacion).subscribe({
      next: (res) => {
        this.cargandoAccion = false;
        this.cerrarModalRevocacion();
        this.lanzarToast('La insignia ha sido revocada con éxito y se notificó al receptor.', 'exito');
        this.cargarHistorial();
      },
      error: (err) => {
        this.cargandoAccion = false;
        this.mensajeErrorRevocacion = err.error?.mensaje || 'Error al revocar la insignia.';
        this.lanzarToast(this.mensajeErrorRevocacion || '', 'error');
      }
    });
  }

  lanzarToast(mensaje: string, tipo: 'exito' | 'error' | 'advertencia'): void {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
    }, 4500);
  }
}

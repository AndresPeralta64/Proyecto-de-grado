import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emisor-microcredenciales',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './microcredenciales.componente.html',
  styleUrls: ['./microcredenciales.componente.css']
})
export class MicrocredencialesEmisorComponente implements OnInit, OnDestroy {
  opcionesExpandidas = true;
  menuMostrarAbierto = false;
  menuOrdenarAbierto = false;
  dropdownLimiteAbierto = false;
  private subscription: Subscription = new Subscription();

  // Estado de Búsqueda
  terminoBusqueda = '';

  // Estado de Paginación
  paginaActual = 1;
  limiteRegistros = 10;
  limiteOpciones = [10, 25, 50, 100];

  // Filtros
  filtros = {
    estados: {
      pendiente: true,
      aprobada: true,
      rechazada: true,
      inactiva: true
    }
  };

  // Ordenamiento
  ordenarPor = {
    microcredencial: false,
    nivel: false,
    duracion: false,
    area_conocimiento: false,
    estado: false,
    fecha_creacion: false,
    ultima_actualizacion: false
  };

  // Listado de microcredenciales reales obtenidas de la base de datos
  microcredenciales: any[] = [];

  // Estado del modal de eliminar
  modalEliminarAbierto = false;
  microcredencialAEliminar: any = null;
  mensajeEliminar = '';

  // Toast de notificación (backend)
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  // Estado del modal de evaluar
  modalEvaluarAbierto = false;
  microcredencialAEvaluar: any = null;

  // Estado del modal de rechazar
  modalRechazarAbierto = false;
  justificacionRechazo = '';

  // Estado del modal de cambio de estado
  modalEstadoAbierto = false;
  microcredencialAEditarEstado: any = null;
  nuevoEstado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO';

  constructor(
    private sidebarServicio: SidebarServicio,
    private microcredencialServicio: MicrocredencialServicio,
    private tokenServicio: ServicioToken
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarServicio.cerrarMenusContenido$.subscribe(() => {
        this.menuMostrarAbierto = false;
        this.menuOrdenarAbierto = false;
        this.dropdownLimiteAbierto = false;
      })
    );

    this.cargarMicrocredenciales();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Cargar microcredenciales desde el backend
  cargarMicrocredenciales() {
    this.microcredencialServicio.obtenerMicrocredenciales().subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          const usuarioLogeado = this.tokenServicio.obtenerDatosUsuario();
          const idUsuarioLogeado = usuarioLogeado ? usuarioLogeado.id : null;
          const creadasPorMi = res.datos.filter((item: any) => item.id_emisor === idUsuarioLogeado);

          this.microcredenciales = creadasPorMi.map((item: any) => ({
            id: item.id_microcredencial,
            nombre: item.nombre,
            descripcion: item.descripcion,
            criterios_evaluacion: item.criterios_evaluacion,
            duracion_horas: item.duracion_horas,
            competencias: item.competencias,
            imagen_url: item.imagen_url,
            emisor: item.emisor,
            nivel: item.nivel,
            area_conocimiento: item.area_conocimiento,
            duracion: `${item.duracion_horas}H`,
            estado: item.estado.toUpperCase(),
            aprobado_por: item.aprobado_por,
            aprobado_en: item.aprobado_en,
            justificacion_rechazo: item.justificacion_rechazo,
            ultima_actualizacion: item.ultima_actualizacion,
            creado_en: item.creado_en
          }));
        }
      },
      error: (err) => {
        console.error('Ha ocurrido un error al cargar microcredenciales:', err);
      }
    });
  }

  // Filtrado, búsqueda y ordenamiento de microcredenciales
  get microcredencialesFiltradas(): any[] {
    const filtrados = this.microcredenciales.filter(item => {
      // Filtro de Estado
      const estadoUpper = item.estado.toUpperCase();
      let matchesEstado = false;
      if (estadoUpper === 'PENDIENTE' && this.filtros.estados.pendiente) matchesEstado = true;
      if (estadoUpper === 'APROBADA' && this.filtros.estados.aprobada) matchesEstado = true;
      if (estadoUpper === 'RECHAZADA' && this.filtros.estados.rechazada) matchesEstado = true;
      if (estadoUpper === 'INACTIVA' && this.filtros.estados.inactiva) matchesEstado = true;

      // Filtro de Búsqueda
      let matchesSearch = true;
      if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
        const cleanString = (str: string) =>
          (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const cleanQuery = cleanString(this.terminoBusqueda);
        const cleanItem = cleanString(
          (item.id || '') + ' ' +
          (item.nombre || '') + ' ' +
          (item.area_conocimiento || '') + ' ' +
          (item.nivel || '') + ' ' +
          (item.duracion || '') + ' ' +
          (item.estado || '')
        );
        matchesSearch = cleanItem.includes(cleanQuery);
      }

      return matchesEstado && matchesSearch;
    });

    const baseList = filtrados.map((item, index) => ({ ...item, _index: index }));
    const direction = this.opcionesExpandidas ? 1 : -1;

    baseList.sort((a, b) => {
      if (this.ordenarPor.microcredencial) {
        const comp = (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }
      if (this.ordenarPor.nivel) {
        const comp = (a.nivel || '').localeCompare(b.nivel || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }
      if (this.ordenarPor.duracion) {
        const numA = parseInt(a.duracion) || 0;
        const numB = parseInt(b.duracion) || 0;
        const diff = numA - numB;
        if (diff !== 0) return diff * direction;
      }
      if (this.ordenarPor.area_conocimiento) {
        const comp = (a.area_conocimiento || '').localeCompare(b.area_conocimiento || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }
      if (this.ordenarPor.estado) {
        const getEstadoValue = (estado: string): number => {
          const est = (estado || '').toUpperCase();
          if (est === 'PENDIENTE') return 1;
          if (est === 'APROBADA') return 2;
          if (est === 'RECHAZADA') return 3;
          if (est === 'INACTIVA') return 4;
          return 99;
        };
        const valA = getEstadoValue(a.estado);
        const valB = getEstadoValue(b.estado);
        const diff = valA - valB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.fecha_creacion) {
        const fechaA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
        const fechaB = b.creado_en ? new Date(b.creado_en).getTime() : 0;
        const diff = fechaA - fechaB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.ultima_actualizacion) {
        const fechaA = a.ultima_actualizacion ? new Date(a.ultima_actualizacion).getTime() : 0;
        const fechaB = b.ultima_actualizacion ? new Date(b.ultima_actualizacion).getTime() : 0;
        const diff = fechaA - fechaB;
        if (diff !== 0) return diff * direction;
      }

      return (a._index - b._index) * direction;
    });

    return baseList;
  }

  get totalPaginas(): number {
    return Math.ceil(this.microcredencialesFiltradas.length / this.limiteRegistros) || 1;
  }

  get microcredencialesPaginadas(): any[] {
    const total = this.totalPaginas;
    const paginaActual = Math.min(this.paginaActual, total);
    const inicio = (paginaActual - 1) * this.limiteRegistros;
    const fin = inicio + this.limiteRegistros;
    return this.microcredencialesFiltradas.slice(inicio, fin);
  }

  trackByMicrocredencialId(index: number, item: any): any {
    return item.id || index;
  }

  cambiarLimite(limite: number) {
    this.limiteRegistros = limite;
    this.paginaActual = 1;
    this.dropdownLimiteAbierto = false;
  }

  irAPrimeraPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual = 1;
    }
  }

  irAPaginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  irAPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  irAUltimaPagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }
  }

  toggleOpciones() {
    this.menuMostrarAbierto = false;
    this.menuOrdenarAbierto = false;
    this.opcionesExpandidas = !this.opcionesExpandidas;
  }

  toggleMostrar() {
    this.menuOrdenarAbierto = false;
    this.menuMostrarAbierto = !this.menuMostrarAbierto;
  }

  toggleOrdenar() {
    this.menuMostrarAbierto = false;
    this.menuOrdenarAbierto = !this.menuOrdenarAbierto;
  }

  toggleLimiteDropdown() {
    this.dropdownLimiteAbierto = !this.dropdownLimiteAbierto;
  }

  nuevaMicrocredencial() {
    // Botón visual únicamente. No abre nada por ahora.
  }

  abrirModalEstado(item: any) {
    this.microcredencialAEditarEstado = item;
    this.nuevoEstado = (item.estado === 'APROBADA') ? 'ACTIVO' : 'INACTIVO';
    this.modalEstadoAbierto = true;
  }

  accionBotonEstado(item: any) {
    if (item.estado === 'APROBADA') {
      this.abrirModalEstado(item);
    }
    // Para RECHAZADA el botón permanece activo solo como estilo visual.
    // No se ejecuta la lógica del modal ni se cambia el estado en backend.
  }

  cerrarModalEstado() {
    this.modalEstadoAbierto = false;
    this.microcredencialAEditarEstado = null;
  }

  seleccionarNuevoEstado(estado: 'ACTIVO' | 'INACTIVO') {
    this.nuevoEstado = estado;
  }

  actualizarEstadoMicrocredencial() {
    if (!this.microcredencialAEditarEstado) return;
    const estadoId = (this.nuevoEstado === 'ACTIVO') ? 2 : 4;
    this.microcredencialServicio.cambiarEstado(this.microcredencialAEditarEstado.id, estadoId).subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.lanzarNotificacion('Estado de la microcredencial actualizado correctamente', 'exito');
          this.cargarMicrocredenciales();
        } else {
          this.lanzarNotificacion(res.mensaje || 'Ha ocurrido un error al cambiar el estado de la microcredencial', 'error');
        }
        this.cerrarModalEstado();
      },
      error: (err: any) => {
        console.error('Ha ocurrido un error al cambiar el estado de la microcredencial:', err);
        this.lanzarNotificacion('Ha ocurrido un error al cambiar el estado de la microcredencial', 'error');
        this.cerrarModalEstado();
      }
    });
  }

  abrirModalInfo(item: any) {
    this.microcredencialAEvaluar = item;
    this.modalEvaluarAbierto = true;
  }

  aprobarMicrocredencial(item: any) {
    this.microcredencialAEvaluar = item;
    this.modalEvaluarAbierto = true;
  }

  cerrarModalEvaluar() {
    this.modalEvaluarAbierto = false;
    this.microcredencialAEvaluar = null;
  }

  confirmarAprobarMicrocredencial() {
    if (!this.microcredencialAEvaluar) return;
    this.microcredencialServicio.aprobarMicrocredencial(this.microcredencialAEvaluar.id).subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.lanzarNotificacion('Microcredencial aprobada correctamente', 'exito');
          this.cargarMicrocredenciales();
        } else {
          this.lanzarNotificacion(res.mensaje || 'Ha ocurrido un error al aprobar la microcredencial', 'error');
        }
        this.cerrarModalEvaluar();
      },
      error: (err: any) => {
        console.error('Ha ocurrido un error al aprobar microcredencial:', err);
        this.lanzarNotificacion('Ha ocurrido un error al aprobar la microcredencial', 'error');
        this.cerrarModalEvaluar();
      }
    });
  }

  confirmarRechazarMicrocredencial() {
    if (!this.microcredencialAEvaluar) return;
    if (!this.justificacionRechazo || !this.justificacionRechazo.trim()) {
      this.lanzarNotificacion('Debe ingresar una justificación para rechazar la microcredencial', 'error');
      return;
    }

    this.microcredencialServicio.cambiarEstado(this.microcredencialAEvaluar.id, 3, this.justificacionRechazo).subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.lanzarNotificacion('Microcredencial rechazada correctamente', 'exito');
          this.cargarMicrocredenciales();
        } else {
          this.lanzarNotificacion(res.mensaje || 'Ha ocurrido un error al rechazar la microcredencial', 'error');
        }
        this.modalRechazarAbierto = false;
        this.microcredencialAEvaluar = null;
        this.justificacionRechazo = '';
      },
      error: (err: any) => {
        console.error('Ha ocurrido un error al rechazar la microcredencial:', err);
        this.lanzarNotificacion('Ha ocurrido un error al rechazar la microcredencial', 'error');
        this.modalRechazarAbierto = false;
        this.microcredencialAEvaluar = null;
        this.justificacionRechazo = '';
      }
    });
  }

  abrirModalRechazar() {
    this.modalEvaluarAbierto = false;
    this.justificacionRechazo = '';
    this.modalRechazarAbierto = true;
  }

  cerrarModalRechazar() {
    this.modalRechazarAbierto = false;
    this.justificacionRechazo = '';
    this.modalEvaluarAbierto = true;
  }

  abrirModalEliminar(item: any) {
    this.microcredencialAEliminar = item;
    this.modalEliminarAbierto = true;
  }

  esAprobadaOInactiva(item: any): boolean {
    if (!item) return false;
    const estado = (item.estado || '').toUpperCase();
    return estado === 'APROBADA' || estado === 'INACTIVA';
  }

  cerrarModalEliminar() {
    this.modalEliminarAbierto = false;
    this.microcredencialAEliminar = null;
    this.mensajeEliminar = '';
  }

  confirmarEliminarMicrocredencial() {
    if (!this.microcredencialAEliminar) return;

    this.microcredencialServicio.eliminarMicrocredencial(this.microcredencialAEliminar.id).subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.lanzarNotificacion('Microcredencial eliminada correctamente', 'exito');
          this.cargarMicrocredenciales();
        } else {
          this.lanzarNotificacion(res.mensaje || 'Ha ocurrido un error al eliminar la microcredencial', 'error');
        }
        this.cerrarModalEliminar();
      },
      error: (err: any) => {
        console.error('Ha ocurrido un error al eliminar la microcredencial:', err);
        this.lanzarNotificacion('Ha ocurrido un error al eliminar la microcredencial', 'error');
        this.cerrarModalEliminar();
      }
    });
  }

  lanzarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => { this.mostrarToast = false; }, 3500);
  }
}

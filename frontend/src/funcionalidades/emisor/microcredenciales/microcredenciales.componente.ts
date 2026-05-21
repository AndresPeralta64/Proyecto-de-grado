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

  // Estado del modal de registro de microcredenciales
  modalRegistroAbierto = false;
  dropdownAreaAbierto = false;
  dropdownNivelAbierto = false;

  areasConocimiento: any[] = [];
  areasFiltradas: any[] = [];
  niveles: any[] = [];
  nivelesFiltrados: any[] = [];

  // Datos del formulario de registro
  nuevaMicrocredencialDatos = {
    nombre: '',
    descripcion: '',
    nivelId: null as number | null,
    nivelNombre: '',
    areaId: null as number | null,
    areaNombre: '',
    duracionHoras: 0,
    criteriosEvaluacion: '',
    competenciasInput: ''
  };

  // Errores de campo
  errores: { [key: string]: string } = {};

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
    this.abrirModalRegistro();
  }

  abrirModalRegistro() {
    this.modalRegistroAbierto = true;
    this.dropdownAreaAbierto = false;
    this.dropdownNivelAbierto = false;
    this.errores = {};
    this.resetFormularioRegistro();

    // Cargar niveles
    if (this.niveles.length === 0) {
      this.subscription.add(
        this.microcredencialServicio.obtenerNiveles().subscribe({
          next: (res: any) => {
            this.niveles = res.datos || [];
            this.nivelesFiltrados = [...this.niveles];
          },
          error: () => {
            this.niveles = [];
            this.nivelesFiltrados = [];
          }
        })
      );
    } else {
      this.nivelesFiltrados = [...this.niveles];
    }

    // Cargar áreas
    if (this.areasConocimiento.length === 0) {
      this.subscription.add(
        this.microcredencialServicio.obtenerAreasConocimiento().subscribe({
          next: (res: any) => {
            this.areasConocimiento = res.datos || [];
            this.areasFiltradas = [...this.areasConocimiento];
          },
          error: () => {
            this.areasConocimiento = [];
            this.areasFiltradas = [];
          }
        })
      );
    } else {
      this.areasFiltradas = [...this.areasConocimiento];
    }
  }

  cerrarModalRegistro() {
    this.modalRegistroAbierto = false;
    this.dropdownAreaAbierto = false;
    this.dropdownNivelAbierto = false;
    this.errores = {};
    this.resetFormularioRegistro();
  }

  resetFormularioRegistro() {
    this.nuevaMicrocredencialDatos = {
      nombre: '',
      descripcion: '',
      nivelId: null,
      nivelNombre: '',
      areaId: null,
      areaNombre: '',
      duracionHoras: 0,
      criteriosEvaluacion: '',
      competenciasInput: ''
    };
  }

  // Helper: elimina tildes para búsqueda sin acentos
  private sinTildes(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Filtrado y Selección de Área
  filtrarAreas(forceAll: boolean = false) {
    const termino = forceAll ? '' : this.sinTildes(this.nuevaMicrocredencialDatos.areaNombre?.toLowerCase().trim() || '');
    if (!termino) {
      this.areasFiltradas = [...this.areasConocimiento];
      this.dropdownAreaAbierto = true;
      return;
    }
    this.areasFiltradas = this.areasConocimiento.filter(a =>
      this.sinTildes(a.nombre.toLowerCase()).includes(termino)
    );
    this.dropdownAreaAbierto = true;
  }

  seleccionarArea(id: number, nombre: string) {
    this.nuevaMicrocredencialDatos.areaId = id;
    this.nuevaMicrocredencialDatos.areaNombre = nombre;
    this.dropdownAreaAbierto = false;
    this.areasFiltradas = [...this.areasConocimiento];
    this.errores['area'] = '';
  }

  validarArea() {
    setTimeout(() => {
      const termino = this.nuevaMicrocredencialDatos.areaNombre?.toLowerCase().trim() || '';
      const coincidencia = this.areasConocimiento.find(a => a.nombre.toLowerCase() === termino);
      if (coincidencia) {
        this.nuevaMicrocredencialDatos.areaId = coincidencia.id_area;
        this.nuevaMicrocredencialDatos.areaNombre = coincidencia.nombre;
      } else {
        this.nuevaMicrocredencialDatos.areaId = null;
        this.nuevaMicrocredencialDatos.areaNombre = '';
      }
      this.dropdownAreaAbierto = false;
    }, 200);
  }

  // Filtrado y Selección de Nivel
  filtrarNiveles(forceAll: boolean = false) {
    const termino = forceAll ? '' : this.sinTildes(this.nuevaMicrocredencialDatos.nivelNombre?.toLowerCase().trim() || '');
    if (!termino) {
      this.nivelesFiltrados = [...this.niveles];
      this.dropdownNivelAbierto = true;
      return;
    }
    this.nivelesFiltrados = this.niveles.filter(n =>
      this.sinTildes(n.nombre.toLowerCase()).includes(termino)
    );
    this.dropdownNivelAbierto = true;
  }

  seleccionarNivel(id: number, nombre: string) {
    this.nuevaMicrocredencialDatos.nivelId = id;
    this.nuevaMicrocredencialDatos.nivelNombre = nombre;
    this.dropdownNivelAbierto = false;
    this.nivelesFiltrados = [...this.niveles];
    this.errores['nivel'] = '';
  }

  validarNivel() {
    setTimeout(() => {
      const termino = this.nuevaMicrocredencialDatos.nivelNombre?.toLowerCase().trim() || '';
      const coincidencia = this.niveles.find(n => n.nombre.toLowerCase() === termino);
      if (coincidencia) {
        this.nuevaMicrocredencialDatos.nivelId = coincidencia.id_nivel;
        this.nuevaMicrocredencialDatos.nivelNombre = coincidencia.nombre;
      } else {
        this.nuevaMicrocredencialDatos.nivelId = null;
        this.nuevaMicrocredencialDatos.nivelNombre = '';
      }
      this.dropdownNivelAbierto = false;
    }, 200);
  }

  // Duración Horas (Counter logic)
  incrementarHoras() {
    if (this.nuevaMicrocredencialDatos.duracionHoras < 500) {
      this.nuevaMicrocredencialDatos.duracionHoras++;
      this.errores['duracionHoras'] = '';
    }
  }

  decrementarHoras() {
    if (this.nuevaMicrocredencialDatos.duracionHoras > 1) {
      this.nuevaMicrocredencialDatos.duracionHoras--;
      this.errores['duracionHoras'] = '';
    }
  }

  onDuracionClick() {
    if (!this.nuevaMicrocredencialDatos.duracionHoras || this.nuevaMicrocredencialDatos.duracionHoras < 1) {
      this.nuevaMicrocredencialDatos.duracionHoras = 1;
      this.errores['duracionHoras'] = '';
    }
  }

  validarDuracionInput(event: any) {
    const input = event.target as HTMLInputElement;
    let valorLimpio = input.value.replace(/[^0-9]/g, '');
    if (valorLimpio.length > 3) {
      valorLimpio = valorLimpio.slice(0, 3);
    }
    const num = valorLimpio ? parseInt(valorLimpio, 10) : 0;
    this.nuevaMicrocredencialDatos.duracionHoras = num;
    input.value = valorLimpio;
    this.errores['duracionHoras'] = '';
  }

  registrarMicrocredencial() {
    this.errores = {};

    const { nombre, descripcion, nivelId, areaId, duracionHoras, criteriosEvaluacion, competenciasInput } = this.nuevaMicrocredencialDatos;

    if (!nombre.trim()) this.errores['nombre'] = 'Campo obligatorio';
    if (!descripcion.trim()) this.errores['descripcion'] = 'Campo obligatorio';
    if (!nivelId) this.errores['nivel'] = 'Campo obligatorio';
    if (!areaId) this.errores['area'] = 'Campo obligatorio';
    if (!criteriosEvaluacion.trim()) this.errores['criteriosEvaluacion'] = 'Campo obligatorio';
    if (!competenciasInput.trim()) this.errores['competencias'] = 'Campo obligatorio';

    if (!duracionHoras || duracionHoras < 1) {
      this.errores['duracionHoras'] = 'La duración debe ser de al menos 1 hora';
    } else if (duracionHoras > 500) {
      this.errores['duracionHoras'] = 'Supera el máximo de horas establecidas';
    }

    if (Object.keys(this.errores).length > 0) {
      return;
    }

    this.lanzarNotificacion('Formulario válido (Lógica de guardado se implementará después)', 'exito');
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

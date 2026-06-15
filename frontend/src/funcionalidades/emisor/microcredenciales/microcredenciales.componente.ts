import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-emisor-microcredenciales',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './microcredenciales.componente.html',
  styleUrls: ['./microcredenciales.componente.css']
})
export class MicrocredencialesEmisorComponente implements OnInit, OnDestroy {
  @ViewChildren('contenedorInsigniaDesign') contenedorInsigniaDesign!: QueryList<ElementRef>;

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
    ultima_actualizacion: true
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

  // Set para habilitar edición tras ver info
  microcredencialesRechazadasVistas: Set<number> = new Set();

  // Estado del modal de registro de microcredenciales
  modalRegistroAbierto = false;
  dropdownAreaAbierto = false;
  dropdownNivelAbierto = false;
  dropdownTipoLineaAbierto = false;

  areasConocimiento: any[] = [];
  areasFiltradas: any[] = [];
  niveles: any[] = [];
  nivelesFiltrados: any[] = [];

  // Pestaña activa en Modal de Registro
  opcionInsignia: 'cargar' | 'disenar' = 'cargar';
  imagenCargadaURL: string | null = null;
  modoDisenoGuardado: boolean = false;
  modoEdicion: boolean = false;
  idMicrocredencialEditar: number | null = null;

  // Diseño de insignia
  disenoInsignia = {
    forma: 'hex-shield',
    colorFondo: '#10B981',
    icono: 'ingenieria',
    colorIcono: '#FFFFFF',
    tamanoIcono: 100,
    textoSuperior: 'NUEVA',
    textoInferior: 'INSIGNIA',
    colorTexto: '#FFFFFF',
    cinta: 'basica',
    colorCinta: '#E53935',
    colorBorde: '#047857',
    colorLinea: '#FFFFFF',
    tipoLinea: 'ninguna',
    transparenciaLinea: 40,
    largoCintaSuperior: 110,
    largoCintaInferior: 100
  };

  // Getters para el tamaño dinámico de las cintas
  get strokeDasharray(): string | null {
    if (this.disenoInsignia.tipoLinea === 'punteada') return '2,4';
    if (this.disenoInsignia.tipoLinea === 'lineas') return '6,4';
    return null;
  }

  get topRibbonPath(): string {
    const halfWidth = 90 * (this.disenoInsignia.largoCintaSuperior / 100);
    const l = 100 - halfWidth;
    const r = 100 + halfWidth;
    return `M${l} 40 L${r} 40 L${r} 65 L${l} 65 Z`;
  }

  get topRibbonFoldLeft(): string {
    const l = 100 - 90 * (this.disenoInsignia.largoCintaSuperior / 100);
    return `M${l} 65 L${l + 10} 75 L${l + 10} 65 Z`;
  }

  get topRibbonFoldRight(): string {
    const r = 100 + 90 * (this.disenoInsignia.largoCintaSuperior / 100);
    return `M${r} 65 L${r - 10} 75 L${r - 10} 65 Z`;
  }

  get bottomRibbonPath(): string {
    const halfWidth = 75 * (this.disenoInsignia.largoCintaInferior / 100);
    const l = 100 - halfWidth;
    const r = 100 + halfWidth;
    return `M${l} 135 L${r} 135 L${r} 160 L${l} 160 Z`;
  }

  get bottomRibbonFoldLeft(): string {
    const l = 100 - 75 * (this.disenoInsignia.largoCintaInferior / 100);
    return `M${l} 160 L${l + 10} 170 L${l + 10} 160 Z`;
  }

  get bottomRibbonFoldRight(): string {
    const r = 100 + 75 * (this.disenoInsignia.largoCintaInferior / 100);
    return `M${r} 160 L${r - 10} 170 L${r - 10} 160 Z`;
  }

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
    competenciasInput: '',
    competenciasLista: [] as string[]
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

    // Precargar áreas y niveles
    if (this.niveles.length === 0) {
      this.subscription.add(
        this.microcredencialServicio.obtenerNiveles().subscribe({
          next: (res: any) => {
            this.niveles = res.datos || [];
            this.nivelesFiltrados = [...this.niveles];
          }
        })
      );
    }
    if (this.areasConocimiento.length === 0) {
      this.subscription.add(
        this.microcredencialServicio.obtenerAreasConocimiento().subscribe({
          next: (res: any) => {
            this.areasConocimiento = res.datos || [];
            this.areasFiltradas = [...this.areasConocimiento];
          }
        })
      );
    }
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
            duracion: `${item.duracion_horas} H`,
            estado: item.estado.toUpperCase(),
            evaluado_por: item.evaluado_por,
            inactivado_por: item.inactivado_por,
            aprobado_en: item.aprobado_en,
            justificacion_rechazo: item.justificacion_rechazo,
            ultima_actualizacion: item.ultima_actualizacion,
            creado_en: item.creado_en,
            num_emisiones: item.num_emisiones
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
        const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);
        const cleanItem = cleanString(
          (item.id || '') + ' ' +
          (item.nombre || '') + ' ' +
          (item.area_conocimiento || '') + ' ' +
          (item.nivel || '') + ' ' +
          (item.duracion || '') + ' ' +
          (item.estado || '')
        );
        matchesSearch = queryWords.every(word => cleanItem.includes(word));
      }

      return matchesEstado && matchesSearch;
    });

    const baseList = filtrados.map((item, index) => ({ ...item, _index: index }));
    const direction = this.opcionesExpandidas ? 1 : -1;

    baseList.sort((a, b) => {
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

  get mostrarTextoOrdenamiento(): boolean {
    const activeFilters = Object.keys(this.ordenarPor).filter(k => (this.ordenarPor as any)[k]);
    if (activeFilters.length === 1 && (activeFilters[0] === 'fecha_creacion' || activeFilters[0] === 'ultima_actualizacion')) return true;
    return false;
  }

  toggleFechaCreacion() {
    this.ordenarPor.fecha_creacion = !this.ordenarPor.fecha_creacion;
    if (this.ordenarPor.fecha_creacion) {
      this.ordenarPor.ultima_actualizacion = false;
    }
  }

  toggleUltimaActualizacion() {
    this.ordenarPor.ultima_actualizacion = !this.ordenarPor.ultima_actualizacion;
    if (this.ordenarPor.ultima_actualizacion) {
      this.ordenarPor.fecha_creacion = false;
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
    this.modoDisenoGuardado = false;
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
      competenciasInput: '',
      competenciasLista: []
    };

    // Restablecer el estado de la insignia cargada y del diseño
    this.opcionInsignia = 'cargar';
    this.imagenCargadaURL = null;
    (this as any).archivoInsigniaCargada = null;
    this.modoDisenoGuardado = false;
    this.modoEdicion = false;
    this.idMicrocredencialEditar = null;
    this.disenoInsignia = {
      forma: 'hex-shield',
      colorFondo: '#10B981',
      icono: 'ingenieria',
      colorIcono: '#FFFFFF',
      tamanoIcono: 100,
      textoSuperior: 'NUEVA',
      textoInferior: 'INSIGNIA',
      colorTexto: '#FFFFFF',
      cinta: 'basica',
      colorCinta: '#E53935',
      colorBorde: '#047857',
      colorLinea: '#FFFFFF',
      tipoLinea: 'ninguna',
      transparenciaLinea: 40,
      largoCintaSuperior: 110,
      largoCintaInferior: 100
    };
  }

  // Competencias
  agregarCompetencia(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const val = this.nuevaMicrocredencialDatos.competenciasInput.trim();
    if (val) {
      const isDuplicate = this.nuevaMicrocredencialDatos.competenciasLista.some(
        c => c.toLowerCase() === val.toLowerCase()
      );
      if (!isDuplicate) {
        this.nuevaMicrocredencialDatos.competenciasLista.push(val);
      }
    }
    this.nuevaMicrocredencialDatos.competenciasInput = '';
    this.errores['competencias'] = '';
  }

  eliminarCompetencia(index: number) {
    this.nuevaMicrocredencialDatos.competenciasLista.splice(index, 1);
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

  onDuracionFocus() {
    if (this.nuevaMicrocredencialDatos.duracionHoras === 0) {
      this.nuevaMicrocredencialDatos.duracionHoras = null as any;
    }
  }

  onDuracionBlur() {
    if (this.nuevaMicrocredencialDatos.duracionHoras === null || this.nuevaMicrocredencialDatos.duracionHoras === undefined || this.nuevaMicrocredencialDatos.duracionHoras.toString().trim() === '') {
      this.nuevaMicrocredencialDatos.duracionHoras = 0;
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

  async registrarMicrocredencial() {
    this.errores = {};

    const { nombre, descripcion, nivelId, areaId, duracionHoras, criteriosEvaluacion, competenciasLista } = this.nuevaMicrocredencialDatos;

    if (!nombre.trim()) {
      this.errores['nombre'] = 'Campo obligatorio';
    }
    if (!descripcion.trim()) this.errores['descripcion'] = 'Campo obligatorio';
    if (!nivelId) this.errores['nivel'] = 'Campo obligatorio';
    if (!areaId) this.errores['area'] = 'Campo obligatorio';
    if (!criteriosEvaluacion.trim()) this.errores['criteriosEvaluacion'] = 'Campo obligatorio';
    if (competenciasLista.length === 0) this.errores['competencias'] = 'Campo obligatorio';

    if (!duracionHoras || duracionHoras < 1) {
      this.errores['duracionHoras'] = 'La duración debe ser de al menos 1 hora';
    } else if (duracionHoras > 500) {
      this.errores['duracionHoras'] = 'Supera el máximo de horas establecidas';
    }

    if (this.opcionInsignia === 'cargar' && !this.archivoInsigniaCargada && !this.modoEdicion) {
      this.errores['insignia'] = 'Campo obligatorio';
    }
    if (this.opcionInsignia === 'disenar' && !this.modoDisenoGuardado) {
      this.lanzarNotificacion('Debe guardar el diseño de la insignia antes de registrar', 'advertencia');
      return;
    }

    if (Object.keys(this.errores).length > 0) {
      return;
    }

    const nombreEnUso = this.microcredenciales.some(
      m => m.nombre.toLowerCase() === nombre.trim().toLowerCase() && m.id !== this.idMicrocredencialEditar
    );
    if (nombreEnUso) {
      this.lanzarNotificacion('El nombre de la microcredencial ya está registrado', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('nivel', nivelId!.toString());
    formData.append('area_conocimiento', areaId!.toString());
    formData.append('duracion_horas', duracionHoras.toString());
    formData.append('criterios_evaluacion', criteriosEvaluacion.trim());
    formData.append('competencias', JSON.stringify(competenciasLista));

    if (this.opcionInsignia === 'cargar') {
      if (this.archivoInsigniaCargada) {
        formData.append('insignia', this.archivoInsigniaCargada);
      }
    } else if (this.opcionInsignia === 'disenar') {
      try {
        const contenedor = this.contenedorInsigniaDesign.first;
        if (!contenedor) {
          this.lanzarNotificacion('No se encontró el contenedor de la insignia en el DOM', 'error');
          return;
        }

        const svgElement = contenedor.nativeElement.querySelector('svg');
        if (!svgElement) {
          this.lanzarNotificacion('No se encontró el diseño de la insignia', 'error');
          return;
        }

        // Clonar el SVG
        const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

        // Ajustar tamaño fijo para la exportación (512x512 para buena calidad)
        const exportSize = 512;
        svgClone.setAttribute('width', exportSize.toString());
        svgClone.setAttribute('height', exportSize.toString());

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const image = new Image();

        const blobGenerado = await new Promise<Blob | null>((resolve, reject) => {
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = exportSize;
            canvas.height = exportSize;
            const ctx = canvas.getContext('2d');
            // ctx es transparente por defecto
            if (ctx) {
              ctx.drawImage(image, 0, 0, exportSize, exportSize);
            }

            canvas.toBlob((b) => {
              resolve(b);
            }, 'image/png');
          };
          image.onerror = () => reject(new Error('Error al cargar SVG en la imagen'));
          image.src = blobURL;
        });

        if (blobGenerado) {
          const file = new File([blobGenerado], 'insignia-diseno.png', { type: 'image/png' });
          formData.append('insignia', file);
        } else {
          this.lanzarNotificacion('Error al generar la imagen del diseño', 'error');
          return;
        }
      } catch (error) {
        console.error('Error capturando el canvas:', error);
        this.lanzarNotificacion('Error al capturar el diseño de la insignia', 'error');
        return;
      }
    }

    if (this.modoEdicion && this.idMicrocredencialEditar) {
      this.microcredencialServicio.actualizarMicrocredencial(this.idMicrocredencialEditar, formData).subscribe({
        next: (res) => {
          if (res && res.exito) {
            this.lanzarNotificacion('Microcredencial actualizada correctamente. Un administrador la revisará en breve para su aprobación', 'exito');
            this.cerrarModalRegistro();
            this.cargarMicrocredenciales();
          } else {
            this.lanzarNotificacion(res.mensaje || 'Error al actualizar microcredencial', 'error');
          }
        },
        error: (err) => {
          console.error('Error al actualizar microcredencial:', err);
          this.lanzarNotificacion(err.error?.mensaje || 'Ha ocurrido un error al actualizar la microcredencial', 'error');
        }
      });
    } else {
      this.microcredencialServicio.registrarMicrocredencial(formData).subscribe({
        next: (res) => {
          if (res && res.exito) {
            this.lanzarNotificacion('Microcredencial registrada correctamente. Un administrador la revisará en breve para su aprobación', 'exito');
            this.cerrarModalRegistro();
            this.cargarMicrocredenciales();
          } else {
            this.lanzarNotificacion(res.mensaje || 'Error al registrar microcredencial', 'error');
          }
        },
        error: (err) => {
          console.error('Error al registrar microcredencial:', err);
          this.lanzarNotificacion(err.error?.mensaje || 'Ha ocurrido un error al registrar la microcredencial', 'error');
        }
      });
    }
  }

  abrirModalEstado(item: any) {
    this.microcredencialAEditarEstado = item;
    this.nuevoEstado = (item.estado === 'APROBADA') ? 'ACTIVO' : 'INACTIVO';
    this.modalEstadoAbierto = true;
  }

  accionBotonEstado(item: any) {
    if (item.estado === 'APROBADA') {
      this.abrirModalEstado(item);
    } else if (item.estado === 'RECHAZADA') {
      if (!this.microcredencialesRechazadasVistas.has(item.id)) {
        this.lanzarNotificacion('Debe revisar primero los motivos del rechazo en Información para realizar esta acción', 'advertencia');
      } else {
        // Lógica de edición
        this.modoEdicion = true;
        this.idMicrocredencialEditar = item.id;

        let comps = [];
        if (item.competencias) {
          try {
            comps = Array.isArray(item.competencias) ? item.competencias : JSON.parse(item.competencias);
          } catch (e) {
            comps = item.competencias.split(',').map((c: string) => c.trim());
          }
        }

        this.nuevaMicrocredencialDatos = {
          nombre: item.nombre,
          descripcion: item.descripcion,
          nivelId: this.niveles.find(n => n.nombre === item.nivel)?.id_nivel || null,
          nivelNombre: item.nivel,
          areaId: this.areasConocimiento.find(a => a.nombre === item.area_conocimiento)?.id_area || null,
          areaNombre: item.area_conocimiento,
          duracionHoras: parseInt(item.duracion_horas, 10) || 0,
          criteriosEvaluacion: item.criterios_evaluacion,
          competenciasInput: '',
          competenciasLista: comps
        };

        this.opcionInsignia = 'cargar';
        this.imagenCargadaURL = item.imagen_url;
        (this as any).archivoInsigniaCargada = null;
        this.modoDisenoGuardado = false;

        // Abrir el modal sin llamar a resetFormularioRegistro
        this.errores = {};
        this.dropdownAreaAbierto = false;
        this.dropdownNivelAbierto = false;

        if (this.nivelesFiltrados.length === 0) this.nivelesFiltrados = [...this.niveles];
        if (this.areasFiltradas.length === 0) this.areasFiltradas = [...this.areasConocimiento];

        this.modalRegistroAbierto = true;
      }
    }
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
    if (item.estado === 'RECHAZADA') {
      this.microcredencialesRechazadasVistas.add(item.id);
    }
    this.modalEvaluarAbierto = true;
  }

  puedeEditarOEstado(item: any): boolean {
    if (item.estado === 'APROBADA') return true;
    if (item.estado === 'RECHAZADA' && this.microcredencialesRechazadasVistas.has(item.id)) return true;
    return false;
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

  accionBotonEliminar(item: any) {
    if (item.estado === 'APROBADA') {
      this.lanzarNotificacion('Debe inactivar la microcredencial para realizar esta acción', 'advertencia');
    } else {
      this.abrirModalEliminar(item);
    }
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

  archivoInsigniaCargada: File | null = null;

  // --- Subida de imagen para insignia digital (1:1) ---
  subirImagenInsignia(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errores['insignia'] = 'El archivo seleccionado debe ser una imagen.';
      event.target.value = '';
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      img.onload = () => {
        // Validar proporción 1:1
        if (img.width !== img.height) {
          this.errores['insignia'] = 'La imagen debe tener una proporción exactamente cuadrada (1:1), por ejemplo 512x512.';
          this.archivoInsigniaCargada = null;
        } else {
          this.errores['insignia'] = '';
          this.imagenCargadaURL = e.target.result;
          this.archivoInsigniaCargada = file;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Limpiar input
    event.target.value = '';
  }

  guardarDiseno() {
    this.modoDisenoGuardado = true;
  }

  editarDiseno() {
    this.modoDisenoGuardado = false;
  }

  formatearCompetencias(competencias: any): string {
    if (!competencias) return '';
    if (Array.isArray(competencias)) {
      return competencias.join(', ');
    }
    if (typeof competencias === 'string') {
      try {
        const parsed = JSON.parse(competencias);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch (e) {
        return competencias.split(',').map(c => c.trim()).join(', ');
      }
    }
    return String(competencias);
  }
}

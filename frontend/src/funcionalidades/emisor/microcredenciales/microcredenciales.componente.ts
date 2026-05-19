import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
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
    microcredencial: true,
    nivel: false,
    duracion: false,
    area_conocimiento: false,
    estado: false
  };

  // Listado de microcredenciales reales obtenidas de la base de datos
  microcredenciales: any[] = [];

  // Estado del modal de eliminar
  modalEliminarAbierto = false;
  microcredencialAEliminar: any = null;
  mensajeEliminar = '';

  // Toast de notificación
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  // Estado del modal de información (reutiliza propiedades del administrador para consistencia)
  modalEvaluarAbierto = false;
  microcredencialAEvaluar: any = null;

  // Estado del modal de cambio de estado
  modalEstadoAbierto = false;
  microcredencialAEditarEstado: any = null;
  nuevoEstado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO';

  // Estado del modal de creación (HU-008)
  modalCrearAbierto = false;
  guardandoMC = false;

  // Catálogos
  nivelesMC: any[] = [];
  areasMC: any[] = [];

  // Formulario
  nombreMC = '';
  descripcionMC = '';
  criteriosMC = '';
  nivelMC: number | null = null;
  duracionMC: number | null = null;
  areaMC: number | null = null;
  competenciasMC: string[] = [];
  inputCompetencia = '';

  // Archivo e Insignia
  insigniaMetodo: 'cargar' | 'disenar' = 'cargar';
  imagenFile: File | null = null;
  imagenPreviewUrl: string | null = null;
  imagenError = '';

  // Diseñador de insignias
  designerForma: 'circle' | 'hexagon' | 'shield' | 'square' = 'circle';
  designerColorBg = '#1e3a8a';
  designerBordeEstilo: 'none' | 'solid' | 'double' = 'solid';
  designerColorBorde = '#eab308';
  designerIcono = 'academic';
  designerColorIcono = '#ffffff';
  designerTexto = '';
  designerColorTexto = '#ffffff';

  constructor(
    private sidebarServicio: SidebarServicio,
    private microcredencialServicio: MicrocredencialServicio
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

  // Cargar microcredenciales del Emisor (el backend filtrará por req.usuario.id)
  cargarMicrocredenciales() {
    this.microcredencialServicio.obtenerMicrocredenciales(true).subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.microcredenciales = res.datos.map((item: any) => ({
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
            ultima_actualizacion: item.ultima_actualizacion
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
          (item.nivel || '') + ' ' +
          (item.duracion || '') + ' ' +
          (item.area_conocimiento || '') + ' ' +
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
      return (a._index - b._index) * direction;
    });

    return baseList;
  }

  get totalPaginas(): number {
    return Math.ceil(this.microcredencialesFiltradas.length / this.limiteRegistros) || 1;
  }

  get microcredencialesPaginadas(): any[] {
    const total = this.totalPaginas;
    if (this.paginaActual > total) {
      this.paginaActual = 1;
    }
    const inicio = (this.paginaActual - 1) * this.limiteRegistros;
    const fin = inicio + this.limiteRegistros;
    return this.microcredencialesFiltradas.slice(inicio, fin);
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

  abrirModalEstado(item: any) {
    this.microcredencialAEditarEstado = item;
    this.nuevoEstado = (item.estado === 'APROBADA') ? 'ACTIVO' : 'INACTIVO';
    this.modalEstadoAbierto = true;
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

  cerrarModalEvaluar() {
    this.modalEvaluarAbierto = false;
    this.microcredencialAEvaluar = null;
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

  abrirModalCrear() {
    this.modalCrearAbierto = true;
    this.guardandoMC = false;
    
    // Resetear formulario
    this.nombreMC = '';
    this.descripcionMC = '';
    this.criteriosMC = '';
    this.nivelMC = null;
    this.duracionMC = null;
    this.areaMC = null;
    this.competenciasMC = [];
    this.inputCompetencia = '';
    this.insigniaMetodo = 'cargar';
    this.imagenFile = null;
    this.imagenPreviewUrl = null;
    this.imagenError = '';
    
    // Resetear designer
    this.designerForma = 'circle';
    this.designerColorBg = '#1e3a8a';
    this.designerBordeEstilo = 'solid';
    this.designerColorBorde = '#eab308';
    this.designerIcono = 'academic';
    this.designerColorIcono = '#ffffff';
    this.designerTexto = '';
    this.designerColorTexto = '#ffffff';
    
    // Cargar catálogos
    this.microcredencialServicio.obtenerCatalogos().subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          this.nivelesMC = res.datos.niveles;
          this.areasMC = res.datos.areas;
        }
      },
      error: (err) => {
        console.error('Error al obtener catálogos:', err);
      }
    });
  }

  cerrarModalCrear() {
    this.modalCrearAbierto = false;
  }

  agregarCompetencia(event?: any) {
    if (event) {
      event.preventDefault();
    }
    const valor = this.inputCompetencia.trim();
    if (valor && !this.competenciasMC.includes(valor)) {
      this.competenciasMC.push(valor);
      this.inputCompetencia = '';
    }
  }

  eliminarCompetencia(index: number) {
    this.competenciasMC.splice(index, 1);
  }

  onArchivoSeleccionado(event: any) {
    this.imagenError = '';
    this.imagenFile = null;
    this.imagenPreviewUrl = null;
    
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo MIME / extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    const tiposValidos = ['png', 'jpg', 'jpeg', 'svg'];
    if (!tiposValidos.includes(extension || '') || !file.type.startsWith('image/')) {
      this.imagenError = 'Formato inválido. Solo se admiten PNG, JPG y SVG.';
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.imagenError = 'La imagen excede el límite de 2MB.';
      return;
    }

    // Validar dimensiones en el navegador (debe ser >= 400x400)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          this.imagenError = 'Resolución mínima requerida es 400x400 píxeles.';
        } else {
          this.imagenFile = file;
          this.imagenPreviewUrl = e.target.result;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async svgToBlob(svgId: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const svg = document.getElementById(svgId);
      if (!svg) {
        reject(new Error('No se encontró el elemento SVG del diseñador'));
        return;
      }
      // Asegurarse de que el SVG tenga las dimensiones correctas de render
      const svgClone = svg.cloneNode(true) as SVGElement;
      svgClone.setAttribute('width', '400');
      svgClone.setAttribute('height', '400');
      
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(image, 0, 0, 400, 400);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al generar blob'));
            }
          }, 'image/png');
        } else {
          reject(new Error('No se pudo obtener contexto 2D del canvas'));
        }
      };
      image.onerror = (err) => reject(err);
      image.src = blobURL;
    });
  }

  async guardarMicrocredencial() {
    this.imagenError = '';
    
    // Validar campos del formulario
    if (!this.nombreMC || !this.nombreMC.trim() || 
        !this.descripcionMC || !this.descripcionMC.trim() || 
        !this.criteriosMC || !this.criteriosMC.trim() || 
        !this.nivelMC || !this.duracionMC || !this.areaMC || 
        this.competenciasMC.length === 0) {
      this.lanzarNotificacion('Por favor, complete todos los campos obligatorios.', 'error');
      return;
    }

    if (this.insigniaMetodo === 'cargar' && !this.imagenFile) {
      this.imagenError = 'Debe cargar una imagen válida para la insignia.';
      return;
    }

    this.guardandoMC = true;
    const formData = new FormData();
    formData.append('nombre', this.nombreMC.trim());
    formData.append('descripcion', this.descripcionMC.trim());
    formData.append('criterios_evaluacion', this.criteriosMC.trim());
    formData.append('nivel', String(this.nivelMC));
    formData.append('duracion_horas', String(this.duracionMC));
    formData.append('area_conocimiento', String(this.areaMC));
    formData.append('competencias', JSON.stringify(this.competenciasMC));

    try {
      if (this.insigniaMetodo === 'cargar') {
        formData.append('imagen', this.imagenFile!);
      } else {
        // Diseñar insignia: convertir el SVG actual a PNG
        const blob = await this.svgToBlob('badge-svg-designer');
        const file = new File([blob], 'insignia_disenada.png', { type: 'image/png' });
        formData.append('imagen', file);
      }

      this.microcredencialServicio.crearMicrocredencial(formData).subscribe({
        next: (res: any) => {
          if (res && res.exito) {
            this.lanzarNotificacion(res.mensaje || 'Microcredencial registrada con éxito. Pendiente de aprobación.', 'exito');
            this.cerrarModalCrear();
            this.cargarMicrocredenciales();
          } else {
            this.lanzarNotificacion(res.mensaje || 'Ha ocurrido un error al guardar la microcredencial.', 'error');
          }
          this.guardandoMC = false;
        },
        error: (err: any) => {
          console.error('Error al guardar microcredencial:', err);
          const msg = err.error?.mensaje || 'Ha ocurrido un error al registrar la microcredencial.';
          this.lanzarNotificacion(msg, 'error');
          this.guardandoMC = false;
        }
      });
    } catch (err: any) {
      console.error('Error en proceso de conversión o subida:', err);
      this.lanzarNotificacion('Error al procesar la insignia diseñada.', 'error');
      this.guardandoMC = false;
    }
  }

  lanzarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => { this.mostrarToast = false; }, 3500);
  }
}

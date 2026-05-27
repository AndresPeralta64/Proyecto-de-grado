import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MicrocredencialServicio } from '../../../core/servicios/microcredencial.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';
import { InsigniaServicio } from '../../../core/servicios/insignia.servicio';

@Component({
  selector: 'app-emisor-insignias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './insignias.componente.html',
  styleUrls: ['./insignias.componente.css']
})
export class InsigniasEmisorComponente implements OnInit, OnDestroy {
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

  // Estado de Filtros
  filtros = {
    estados: {
      aprobada: true,
      revocada: true
    }
  };

  // Estado de Ordenamiento
  ordenarPor = {
    fecha: true,
    receptor: false,
    microcredencial: false,
    duracion: false,
    estado: false
  };
  mostrarTextoOrdenamiento = false;

  // Arreglo de insignias (esperando la API)
  insignias: any[] = [];

  // Estado para emisión de insignias (modal)
  mostrarModalEmitirInsignia = false;
  
  // Estado para revocación de insignias (modal)
  mostrarModalRevocar = false;
  insigniaARevocar: any = null;
  justificacionRevocacion = '';
  errorRevocacion = false;

  // Estado para información de insignia (modal)
  mostrarModalInfo = false;
  insigniaSeleccionada: any = null;
  microcredencialesAprobadas: any[] = [];
  microcredencialesAprobadasFiltradas: any[] = [];
  microcredencialSeleccionada: any = null;
  terminoBusquedaMicrocredencial = '';
  dropdownMicrocredencialAbierto = false;
  terminoBusquedaReceptor = '';
  receptores: any[] = [];
  receptoresSeleccionados = new Set<number>();

  // Facultades
  facultades: any[] = [];
  facultadesSeleccionadas = new Set<number>();
  dropdownFacultadAbierto = false;

  // Carreras
  carreras: any[] = [];
  carrerasSeleccionadas = new Set<number>();
  dropdownCarreraAbierto = false;

  toggleReceptor(id: number) {
    this.erroresEmitir['receptores'] = false;
    if (this.receptoresSeleccionados.has(id)) {
      this.receptoresSeleccionados.delete(id);
    } else {
      this.receptoresSeleccionados.add(id);
    }
  }

  todosSeleccionados(): boolean {
    const filtrados = this.receptoresFiltrados;
    if (filtrados.length === 0) return false;
    return filtrados.every(u => this.receptoresSeleccionados.has(u.id_usuario));
  }

  toggleSeleccionarTodos() {
    this.erroresEmitir['receptores'] = false;
    const filtrados = this.receptoresFiltrados;
    if (this.todosSeleccionados()) {
      filtrados.forEach(u => this.receptoresSeleccionados.delete(u.id_usuario));
    } else {
      filtrados.forEach(u => this.receptoresSeleccionados.add(u.id_usuario));
    }
  }

  estaSeleccionado(id: number): boolean {
    return this.receptoresSeleccionados.has(id);
  }

  toggleFacultad(id: number) {
    if (this.facultadesSeleccionadas.has(id)) {
      this.facultadesSeleccionadas.delete(id);
    } else {
      this.facultadesSeleccionadas.add(id);
    }
    this.sincronizarCarrerasSeleccionadas();
  }

  private sincronizarCarrerasSeleccionadas() {
    if (this.facultadesSeleccionadas.size > 0) {
      const carrerasValidas = new Set(
        this.carreras
          .filter(c => this.facultadesSeleccionadas.has(c.id_facultad))
          .map(c => c.id_carrera)
      );

      this.carrerasSeleccionadas.forEach(idCarrera => {
        if (!carrerasValidas.has(idCarrera)) {
          this.carrerasSeleccionadas.delete(idCarrera);
        }
      });
    }
  }

  get carrerasParaMostrar(): any[] {
    if (this.facultadesSeleccionadas.size === 0) {
      return this.carreras;
    }
    return this.carreras.filter(c => this.facultadesSeleccionadas.has(c.id_facultad));
  }


  estaFacultadSeleccionada(id: number): boolean {
    return this.facultadesSeleccionadas.has(id);
  }

  toggleDropdownFacultad() {
    this.dropdownFacultadAbierto = !this.dropdownFacultadAbierto;
    this.dropdownCarreraAbierto = false;
  }

  toggleCarrera(id: number) {
    if (this.carrerasSeleccionadas.has(id)) {
      this.carrerasSeleccionadas.delete(id);
    } else {
      this.carrerasSeleccionadas.add(id);
    }
  }

  estaCarreraSeleccionada(id: number): boolean {
    return this.carrerasSeleccionadas.has(id);
  }

  toggleDropdownCarrera() {
    this.dropdownCarreraAbierto = !this.dropdownCarreraAbierto;
    this.dropdownFacultadAbierto = false;
  }

  constructor(
    private microcredencialServicio: MicrocredencialServicio,
    private tokenServicio: ServicioToken,
    private usuarioServicio: UsuarioServicio,
    private insigniaServicio: InsigniaServicio
  ) { }

  ngOnInit(): void {
    this.cargarMicrocredencialesAprobadas();
    this.cargarReceptores();
    this.cargarFacultades();
    this.cargarCarreras();
    this.cargarInsigniasEmitidas();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Getters para filtrado y paginación
  get insigniasFiltradas() {
    let filtradas = this.insignias.filter(ins => {
      // Búsqueda
      const buscar = this.terminoBusqueda.toLowerCase();
      const cumpleBusqueda = ins.receptor.toLowerCase().includes(buscar) ||
        ins.microcredencial.toLowerCase().includes(buscar);

      // Filtros de estado
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
            cmp = timeB - timeA;
            break;
          case 'receptor':
            cmp = (a.receptor || '').localeCompare(b.receptor || '');
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

  // Métodos de UI
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

  // Paginación
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

  // Acciones
  modalEmitirInsigniaAbierto = false;
  erroresEmitir: { [key: string]: boolean } = {};
  receptoresConInsigniaIds = new Set<number>();

  emitirInsignia() {
    this.modalEmitirInsigniaAbierto = true;
  }

  confirmarEmision() {
    this.erroresEmitir['microcredencial'] = !this.microcredencialSeleccionada;
    this.erroresEmitir['receptores'] = this.receptoresSeleccionados.size === 0;

    if (this.erroresEmitir['microcredencial'] || this.erroresEmitir['receptores']) {
      return;
    }

    const idMicrocredencial = this.microcredencialSeleccionada.id;
    const receptoresIds = Array.from(this.receptoresSeleccionados);

    this.subscription.add(
      this.insigniaServicio.emitirInsignias(idMicrocredencial, receptoresIds).subscribe({
        next: (response) => {
          if (response.exito) {
            this.lanzarNotificacion('Insignias digitales emitidas correctamente', 'exito');
            this.cerrarModalEmitirInsignia();
            this.cargarInsigniasEmitidas(); // Refrescar tabla
          } else {
            this.lanzarNotificacion('Ha ocurrido un error al emitir las insignias digitales', 'error');
          }
        },
        error: (err) => {
          if (err.status === 409) {
            const mensaje = err.error?.mensaje || 'Los receptores seleccionados ya tienen esta insignia';
            this.lanzarNotificacion(mensaje, 'error');
          } else {
            const mensaje = err.error?.mensaje || 'Ha ocurrido un error al emitir las insignias digitales';
            this.lanzarNotificacion(mensaje, 'error');
          }
        }
      })
    );
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

  cerrarModalEmitirInsignia() {
    this.modalEmitirInsigniaAbierto = false;
    this.erroresEmitir = {};
    this.microcredencialSeleccionada = null;
    this.terminoBusquedaMicrocredencial = '';
    this.dropdownMicrocredencialAbierto = false;
    this.receptoresSeleccionados.clear();
    this.terminoBusquedaReceptor = '';
    this.facultadesSeleccionadas.clear();
    this.dropdownFacultadAbierto = false;
    this.carrerasSeleccionadas.clear();
    this.dropdownCarreraAbierto = false;
    this.receptoresConInsigniaIds.clear();
  }

  revocarInsignia(item: any) {
    this.insigniaARevocar = item;
    this.justificacionRevocacion = '';
    this.errorRevocacion = false;
    this.mostrarModalRevocar = true;
  }

  cerrarModalRevocar() {
    this.mostrarModalRevocar = false;
    this.insigniaARevocar = null;
    this.justificacionRevocacion = '';
    this.errorRevocacion = false;
  }

  confirmarRevocacion() {
    if (!this.justificacionRevocacion || !this.justificacionRevocacion.trim()) {
      this.errorRevocacion = true;
      return;
    }
    this.errorRevocacion = false;

    this.subscription.add(
      this.insigniaServicio.revocarInsignia(this.insigniaARevocar.id, this.justificacionRevocacion).subscribe({
        next: (res) => {
          if (res.exito) {
            this.lanzarNotificacion('Insignia revocada correctamente', 'exito');
            this.cerrarModalRevocar();
            this.cargarInsigniasEmitidas(); // Refrescar historial
          } else {
            this.lanzarNotificacion(res.mensaje || 'Error al revocar la insignia', 'error');
          }
        },
        error: (err) => {
          console.error('Error al revocar insignia:', err);
          this.lanzarNotificacion(err.error?.mensaje || 'Error al revocar la insignia', 'error');
        }
      })
    );
  }

  abrirModalInfo(item: any) {
    this.insigniaSeleccionada = item;
    this.mostrarModalInfo = true;
  }

  cerrarModalInfo() {
    this.mostrarModalInfo = false;
    this.insigniaSeleccionada = null;
  }

  descargarInsignia(insignia: any) {
    if (!insignia || !insignia.png_baked_url) return;
    
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
  }

  cargarMicrocredencialesAprobadas() {
    this.microcredencialServicio.obtenerMicrocredenciales().subscribe({
      next: (res: any) => {
        if (res && res.exito) {
          const usuarioLogeado = this.tokenServicio.obtenerDatosUsuario();
          const idUsuarioLogeado = usuarioLogeado ? usuarioLogeado.id : null;

          this.microcredencialesAprobadas = res.datos.filter((item: any) =>
            item.id_emisor === idUsuarioLogeado && item.estado.toUpperCase() === 'APROBADA'
          ).map((item: any) => ({
            id: item.id_microcredencial,
            nombre: item.nombre,
            descripcion: item.descripcion,
            duracion_horas: `${item.duracion_horas} H`,
            nivel: item.nivel,
            imagen_url: item.imagen_url
          }));

          this.microcredencialesAprobadasFiltradas = [...this.microcredencialesAprobadas];
        }
      },
      error: (err) => {
        console.error('Error al cargar microcredenciales aprobadas:', err);
      }
    });
  }

  cargarInsigniasEmitidas() {
    this.subscription.add(
      this.insigniaServicio.obtenerHistorial().subscribe({
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

  filtrarMicrocredenciales(forceAll: boolean = false) {
    this.erroresEmitir['microcredencial'] = false;
    const termino = forceAll ? '' : this.sinTildes(this.terminoBusquedaMicrocredencial?.toLowerCase().trim() || '');
    if (!termino) {
      this.microcredencialesAprobadasFiltradas = [...this.microcredencialesAprobadas];
      this.dropdownMicrocredencialAbierto = true;
      return;
    }
    this.microcredencialesAprobadasFiltradas = this.microcredencialesAprobadas.filter(m =>
      this.sinTildes(m.nombre.toLowerCase()).includes(termino)
    );
    this.dropdownMicrocredencialAbierto = true;
  }

  seleccionarMicrocredencial(mc: any) {
    this.erroresEmitir['microcredencial'] = false;
    this.microcredencialSeleccionada = mc;
    this.terminoBusquedaMicrocredencial = mc.nombre;
    this.dropdownMicrocredencialAbierto = false;
    this.cargarReceptoresExcluidos();
  }

  validarMicrocredencialInput() {
    // delay input validation slightly to allow mousedown to select from dropdown
    setTimeout(() => {
      const termino = this.terminoBusquedaMicrocredencial?.toLowerCase().trim() || '';
      const coincidencia = this.microcredencialesAprobadas.find(m => m.nombre.toLowerCase() === termino);
      if (coincidencia) {
        if (this.microcredencialSeleccionada?.id !== coincidencia.id) {
          this.microcredencialSeleccionada = coincidencia;
          this.terminoBusquedaMicrocredencial = coincidencia.nombre;
          this.cargarReceptoresExcluidos();
        }
      } else {
        this.microcredencialSeleccionada = null;
        this.terminoBusquedaMicrocredencial = '';
        this.receptoresConInsigniaIds.clear();
      }
      this.dropdownMicrocredencialAbierto = false;
    }, 200);
  }

  cargarReceptoresExcluidos() {
    if (!this.microcredencialSeleccionada) return;
    this.subscription.add(
      this.insigniaServicio.obtenerReceptoresConInsignia(this.microcredencialSeleccionada.id).subscribe({
        next: (res) => {
          if (res.exito) {
            this.receptoresConInsigniaIds = new Set(res.datos);
            // Desmarcar si estaban seleccionados
            res.datos.forEach((id: number) => this.receptoresSeleccionados.delete(id));
          }
        },
        error: (err) => console.error('Error al obtener receptores excluidos:', err)
      })
    );
  }

  private sinTildes(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  cargarReceptores() {
    this.subscription.add(
      this.usuarioServicio.obtenerUsuarios().subscribe({
        next: (res: any) => {
          const todosUsuarios = res.datos || [];
          this.receptores = todosUsuarios.filter((u: any) =>
            (u.roles || []).some((r: any) => r.nombre?.toLowerCase() === 'receptor')
          );
        },
        error: (err: any) => {
          console.error('Error al cargar receptores:', err);
        }
      })
    );
  }

  cargarFacultades() {
    this.subscription.add(
      this.usuarioServicio.obtenerFacultades().subscribe({
        next: (res: any) => {
          this.facultades = res.datos || [];
        },
        error: (err: any) => {
          console.error('Error al cargar facultades:', err);
        }
      })
    );
  }

  cargarCarreras() {
    this.subscription.add(
      this.usuarioServicio.obtenerCarreras().subscribe({
        next: (res: any) => {
          this.carreras = res.datos || [];
        },
        error: (err: any) => {
          console.error('Error al cargar carreras:', err);
        }
      })
    );
  }

  get receptoresFiltrados(): any[] {
    const buscar = (this.terminoBusquedaReceptor || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    let lista = this.receptores.filter(u => !this.receptoresConInsigniaIds.has(u.id_usuario));

    // Filtro por facultad
    if (this.facultadesSeleccionadas.size > 0) {
      lista = lista.filter(u => {
        if (!u.id_facultad) return false;
        return this.facultadesSeleccionadas.has(u.id_facultad);
      });
    }

    // Filtro por carrera
    if (this.carrerasSeleccionadas.size > 0) {
      lista = lista.filter(u => {
        if (!u.id_carrera) return false;
        return this.carrerasSeleccionadas.has(u.id_carrera);
      });
    }

    if (!buscar) {
      return lista;
    }

    const queryWords = buscar.split(/\s+/).filter((w: string) => w.length > 0);

    return lista.filter(u => {
      const cleanUser = (
        (u.nombres || '') + ' ' +
        (u.apellidos || '') + ' ' +
        (u.cedula || '') + ' ' +
        (u.correo || '') + ' ' +
        (u.carrera_nombre || '')
      )
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return queryWords.every((word: string) => cleanUser.includes(word));
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}

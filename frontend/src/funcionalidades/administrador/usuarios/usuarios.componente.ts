import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.componente.html',
  styleUrls: ['./usuarios.componente.css']
})
export class UsuariosComponente implements OnInit, OnDestroy {
  opcionesExpandidas = true;
  menuMostrarAbierto = false;
  menuOrdenarAbierto = false;
  modalRegistroAbierto = false;
  modalEliminarAbierto = false;
  usuarioAEliminar: any = null;
  dropdownCarreraAbierto = false;
  tooltipContraseniaVisible = false;
  mostrarContrasenia = false;
  esEdicion = false;
  idUsuarioEditando: number | null = null;
  private subscription: Subscription = new Subscription();


  // Estado de Búsqueda
  terminoBusqueda = '';

  // Estado de Paginación
  paginaActual = 1;
  limiteRegistros = 25;
  dropdownLimiteAbierto = false;
  limiteOpciones = [3, 25, 50, 100];

  get usuariosFiltrados(): any[] {
    // 1. Filtrar
    const filtrados = this.usuarios.filter(usuario => {
      // Filtro de Estado
      const matchesEstado = (usuario.activo && this.filtros.estados.activo) ||
                            (!usuario.activo && this.filtros.estados.inactivo);

      // Filtro de Roles
      const rolesUsuario = usuario.roles || [];
      const matchesRol = rolesUsuario.some((r: any) => {
        const nombreRol = r.nombre?.toLowerCase();
        if (nombreRol === 'administrador' && this.filtros.roles.administrador) return true;
        if (nombreRol === 'emisor' && this.filtros.roles.emisor) return true;
        if (nombreRol === 'receptor' && this.filtros.roles.receptor) return true;
        return false;
      });

      // Filtro de Búsqueda (ID, Usuario (nombres y apellidos por separado), Cédula, Correo)
      let matchesSearch = true;
      if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
        const cleanString = (str: string) =>
          (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const cleanQuery = cleanString(this.terminoBusqueda);
        const cleanUser = cleanString(
          (usuario.id_usuario || '') + ' ' +
          (usuario.nombres || '') + ' ' +
          (usuario.apellidos || '') + ' ' +
          (usuario.cedula || '') + ' ' +
          (usuario.correo || '')
        );
        matchesSearch = cleanUser.includes(cleanQuery);
      }

      return matchesEstado && matchesRol && matchesSearch;
    });

    // Mapear con su índice original de la base de datos para mantener el orden original estable
    const baseList = filtrados.map((u, index) => ({ ...u, _index: index }));

    // Helper para prioridad de roles (Administrador: 1, Emisor: 2, Receptor: 3)
    const getRolSortValue = (u: any): number => {
      const roles = u.roles || [];
      if (roles.length === 0) return 99;
      let minVal = 99;
      for (const r of roles) {
        const nombre = r.nombre?.toLowerCase();
        if (nombre === 'administrador') return 1;
        if (nombre === 'emisor') minVal = Math.min(minVal, 2);
        if (nombre === 'receptor') minVal = Math.min(minVal, 3);
      }
      return minVal;
    };

    // 2. Ordenar secuencialmente según las opciones del dropdown que estén marcadas
    const direction = this.opcionesExpandidas ? 1 : -1;

    baseList.sort((a, b) => {
      // Secuencia: ID -> Nombres -> Apellidos -> Correo -> Estado -> Rol

      if (this.ordenarPor.numero) {
        const diff = a.id_usuario - b.id_usuario;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.nombres) {
        const comp = (a.nombres || '').localeCompare(b.nombres || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.apellidos) {
        const comp = (a.apellidos || '').localeCompare(b.apellidos || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.correo) {
        const comp = (a.correo || '').localeCompare(b.correo || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.estado) {
        const valA = a.activo ? 1 : 2;
        const valB = b.activo ? 1 : 2;
        const diff = valA - valB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.rol) {
        const valA = getRolSortValue(a);
        const valB = getRolSortValue(b);
        const diff = valA - valB;
        if (diff !== 0) return diff * direction;
      }

      // Fallback: orden de inserción de la base de datos
      return (a._index - b._index) * direction;
    });

    return baseList;
  }

  get totalPaginas(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.limiteRegistros) || 1;
  }

  get usuariosPaginados(): any[] {
    // Si al filtrar la página actual queda fuera de rango, volver a la 1
    const total = this.totalPaginas;
    if (this.paginaActual > total) {
      this.paginaActual = 1;
    }
    const inicio = (this.paginaActual - 1) * this.limiteRegistros;
    const fin = inicio + this.limiteRegistros;
    return this.usuariosFiltrados.slice(inicio, fin);
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

  // Carreras cargadas del backend
  carreras: { id_carrera: number; nombre: string }[] = [];
  carrerasFiltradas: { id_carrera: number; nombre: string }[] = [];

  // Listado de usuarios
  usuarios: any[] = [];

  // Datos del formulario
  nuevoUsuario = {
    nombres: '',
    apellidos: '',
    cedula: '',
    correo: '',
    contrasenia: '',
    telefono: '',
    carreraId: null as number | null,
    carreraNombre: '',
    roles: {
      administrador: false,
      emisor: false,
      receptor: false
    }
  };

  // Vista previa de la foto
  fotoVistaPrevia: string | null = null;
  fotoArchivo: File | null = null;

  constructor(
    private sidebarServicio: SidebarServicio,
    private usuarioServicio: UsuarioServicio
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarServicio.cerrarMenusContenido$.subscribe(() => {
        this.menuMostrarAbierto = false;
        this.menuOrdenarAbierto = false;
      })
    );
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.subscription.add(
      this.usuarioServicio.obtenerUsuarios().subscribe({
        next: (res: any) => {
          this.usuarios = res.datos || [];
        },
        error: (err: any) => {
          console.error('Error al cargar usuarios:', err);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filtros = {
    estados: {
      activo: true,
      inactivo: false
    },
    roles: {
      administrador: true,
      emisor: true,
      receptor: true
    }
  };

  ordenarPor = {
    numero: true,
    nombres: true,
    apellidos: true,
    correo: true,
    estado: true,
    rol: true
  };

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

  abrirModalRegistro() {
    this.menuMostrarAbierto = false;
    this.menuOrdenarAbierto = false;
    this.esEdicion = false;
    this.idUsuarioEditando = null;
    this.modalRegistroAbierto = true;
    this.dropdownCarreraAbierto = false;
    // Cargar carreras si no están cargadas
    if (this.carreras.length === 0) {
      this.subscription.add(
        this.usuarioServicio.obtenerCarreras().subscribe({
          next: (res: any) => {
            this.carreras = res.datos || [];
            this.carrerasFiltradas = [...this.carreras];
          },
          error: () => {
            this.carreras = [];
            this.carrerasFiltradas = [];
          }
        })
      );
    } else {
      this.carrerasFiltradas = [...this.carreras];
    }
  }

  abrirModalEdicion(usuario: any) {
    this.menuMostrarAbierto = false;
    this.menuOrdenarAbierto = false;
    this.esEdicion = true;
    this.idUsuarioEditando = usuario.id_usuario;
    this.modalRegistroAbierto = true;
    this.dropdownCarreraAbierto = false;

    // Poblar formulario con los datos del usuario
    this.nuevoUsuario = {
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      cedula: usuario.cedula || '',
      correo: usuario.correo || '',
      contrasenia: '', // No debe cargarse de la base de datos
      telefono: usuario.telefono ? usuario.telefono.trim() : '',
      carreraId: usuario.id_carrera || null,
      carreraNombre: usuario.carrera_nombre || 'Sin especificar',
      roles: {
        administrador: (usuario.roles || []).some((r: any) => r.nombre?.toLowerCase() === 'administrador'),
        emisor: (usuario.roles || []).some((r: any) => r.nombre?.toLowerCase() === 'emisor'),
        receptor: (usuario.roles || []).some((r: any) => r.nombre?.toLowerCase() === 'receptor')
      }
    };

    // Si tiene carrera asignada, que muestre el nombre. Si no, 'Sin especificar'
    if (!usuario.id_carrera) {
      this.nuevoUsuario.carreraNombre = 'Sin especificar';
    }

    // Cargar foto si existe
    this.fotoVistaPrevia = usuario.foto_url || null;
    this.fotoArchivo = null;

    // Cargar carreras si no están cargadas
    if (this.carreras.length === 0) {
      this.subscription.add(
        this.usuarioServicio.obtenerCarreras().subscribe({
          next: (res: any) => {
            this.carreras = res.datos || [];
            this.carrerasFiltradas = [...this.carreras];
          },
          error: () => {
            this.carreras = [];
            this.carrerasFiltradas = [];
          }
        })
      );
    } else {
      this.carrerasFiltradas = [...this.carreras];
    }
  }

  cerrarModalRegistro() {
    this.modalRegistroAbierto = false;
    this.dropdownCarreraAbierto = false;
    this.tooltipContraseniaVisible = false;
    this.mostrarContrasenia = false;
    this.errores = {};
    this.resetFormulario();
  }


  abrirModalEliminar(usuario: any) {
    this.usuarioAEliminar = usuario;
    this.modalEliminarAbierto = true;
  }

  cerrarModalEliminar() {
    this.usuarioAEliminar = null;
    this.modalEliminarAbierto = false;
  }

  confirmarEliminarUsuario() {
    if (!this.usuarioAEliminar) return;

    const esInactivo = !this.usuarioAEliminar.activo;
    const peticion = esInactivo
      ? this.usuarioServicio.eliminarUsuarioDefinitivo(this.usuarioAEliminar.id_usuario)
      : this.usuarioServicio.eliminarUsuario(this.usuarioAEliminar.id_usuario);

    this.subscription.add(
      peticion.subscribe({
        next: () => {
          this.cerrarModalEliminar();
          this.cargarUsuarios();
          const mensaje = esInactivo ? 'Usuario eliminado definitivamente' : 'Usuario eliminado correctamente';
          this.lanzarNotificacion(mensaje, 'exito');
        },
        error: (err: any) => {
          console.error('Error al eliminar usuario:', err);
          this.cerrarModalEliminar();
          const mensaje = esInactivo 
            ? 'Ocurrió un error al eliminar definitivamente al usuario' 
            : 'Ocurrió un error al eliminar el usuario';
          this.lanzarNotificacion(mensaje, 'error');
        }
      })
    );
  }

  activarUsuario(usuario: any) {
    if (!usuario) return;
    this.subscription.add(
      this.usuarioServicio.activarUsuario(usuario.id_usuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.lanzarNotificacion('Usuario activado correctamente', 'exito');
        },
        error: (err: any) => {
          console.error('Error al activar usuario:', err);
          this.lanzarNotificacion('Ocurrió un error al activar el usuario', 'error');
        }
      })
    );
  }

  resetFormulario() {
    this.esEdicion = false;
    this.idUsuarioEditando = null;
    this.nuevoUsuario = {
      nombres: '', apellidos: '', cedula: '', correo: '', contrasenia: '',
      telefono: '',
      carreraId: null, carreraNombre: '',
      roles: { administrador: false, emisor: false, receptor: false }
    };
    this.fotoVistaPrevia = null;
    this.fotoArchivo = null;
  }


  seleccionarCarrera(id: number | null, nombre: string) {
    this.nuevoUsuario.carreraId = id;
    this.nuevoUsuario.carreraNombre = nombre;
    this.dropdownCarreraAbierto = false;
    this.carrerasFiltradas = [...this.carreras];
  }

  filtrarCarreras() {
    const termino = this.nuevoUsuario.carreraNombre?.toLowerCase().trim() || '';
    if (!termino) {
      this.carrerasFiltradas = [...this.carreras];
      this.dropdownCarreraAbierto = true;
      return;
    }
    this.carrerasFiltradas = this.carreras.filter(c =>
      c.nombre.toLowerCase().includes(termino)
    );
    this.dropdownCarreraAbierto = true;
  }

  validarCarrera() {
    // Pequeño delay para permitir que el click en la lista se procese antes del blur
    setTimeout(() => {
      const termino = this.nuevoUsuario.carreraNombre.toLowerCase().trim();
      const coincidencia = this.carreras.find(c => c.nombre.toLowerCase() === termino);

      if (coincidencia) {
        this.nuevoUsuario.carreraId = coincidencia.id_carrera;
        this.nuevoUsuario.carreraNombre = coincidencia.nombre;
      } else {
        this.nuevoUsuario.carreraId = null;
        this.nuevoUsuario.carreraNombre = '';
      }
      this.dropdownCarreraAbierto = false;
    }, 200);
  }

  validarSoloNumeros(event: any, campo: 'cedula' | 'telefono') {
    const input = event.target as HTMLInputElement;
    // Eliminar cualquier caracter que no sea número
    const valorLimpio = input.value.replace(/[^0-9]/g, '');
    // Actualizar el modelo
    this.nuevoUsuario[campo] = valorLimpio;
    // Forzar el valor en el input por si acaso
    input.value = valorLimpio;
  }

  eliminarFotoRegistro() {
    this.fotoVistaPrevia = null;
    this.fotoArchivo = null;
  }

  seleccionarArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoArchivo = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.fotoVistaPrevia = e.target?.result as string; };
      reader.readAsDataURL(this.fotoArchivo);
    }
  }


  // Toast de notificación (backend)
  mensajeToast: string = '';
  mostrarToast: boolean = false;
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  // Errores de campo
  errores: { [key: string]: string } = {};

  lanzarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => { this.mostrarToast = false; }, 3500);
  }

  registrarUsuario() {
    this.errores = {};

    const { nombres, apellidos, cedula, correo, roles, telefono, contrasenia } = this.nuevoUsuario;
    const tieneRol = roles.administrador || roles.emisor || roles.receptor;

    // Validar campos obligatorios
    if (!nombres.trim()) this.errores['nombres'] = 'Campo obligatorio';
    if (!apellidos.trim()) this.errores['apellidos'] = 'Campo obligatorio';

    if (!cedula.trim()) {
      this.errores['cedula'] = 'Campo obligatorio';
    } else if (cedula.length < 10) {
      this.errores['cedula'] = 'La cédula debe tener como mínimo 10 dígitos';
    }

    if (!correo.trim()) {
      this.errores['correo'] = 'Campo obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        this.errores['correo'] = 'Ingrese un correo institucional válido';
      }
    }

    if (!this.esEdicion) {
      if (!contrasenia.trim()) {
        this.errores['contrasenia'] = 'Campo obligatorio';
      } else if (contrasenia.length < 10) {
        this.errores['contrasenia'] = 'La contraseña debe tener al menos 10 caracteres';
      }
    } else {
      // En edicion la contrasenia no es obligatoria, pero si se ingresa debe tener al menos 10 caracteres
      if (contrasenia.trim() && contrasenia.length < 10) {
        this.errores['contrasenia'] = 'La contraseña debe tener al menos 10 caracteres';
      }
    }

    if (!tieneRol) {
      this.errores['roles'] = 'Seleccione al menos un rol';
    }

    // Validar teléfono: opcional pero 10 dígitos si se ingresa
    if (telefono.trim() && telefono.length !== 10) {
      this.errores['telefono'] = 'El teléfono debe tener 10 dígitos';
    }

    // Si hay algún error, no procedemos
    if (Object.keys(this.errores).length > 0) {
      return;
    }

    const rolesIds: number[] = [];
    if (roles.administrador) rolesIds.push(1);
    if (roles.emisor) rolesIds.push(2);
    if (roles.receptor) rolesIds.push(3);

    const formData = new FormData();
    formData.append('nombres', this.nuevoUsuario.nombres);
    formData.append('apellidos', this.nuevoUsuario.apellidos);
    formData.append('cedula', this.nuevoUsuario.cedula);
    formData.append('correo', this.nuevoUsuario.correo);
    
    if (this.nuevoUsuario.contrasenia) {
      formData.append('contrasenia', this.nuevoUsuario.contrasenia);
    }
    if (this.nuevoUsuario.telefono) {
      formData.append('telefono', this.nuevoUsuario.telefono);
    }
    if (this.nuevoUsuario.carreraId) {
      formData.append('carrera', this.nuevoUsuario.carreraId.toString());
    }
    formData.append('roles', JSON.stringify(rolesIds));

    if (this.fotoArchivo) {
      formData.append('foto', this.fotoArchivo);
    } else if (this.esEdicion && !this.fotoVistaPrevia) {
      formData.append('fotoEliminada', 'true');
    }

    if (this.esEdicion && this.idUsuarioEditando !== null) {
      this.subscription.add(
        this.usuarioServicio.actualizarUsuario(this.idUsuarioEditando, formData).subscribe({
          next: () => {
            this.cerrarModalRegistro();
            this.cargarUsuarios();
            this.lanzarNotificacion('Usuario actualizado correctamente', 'exito');
          },
          error: (err: any) => {
            if (err.status === 409) {
              this.lanzarNotificacion(err?.error?.mensaje || 'La cédula, correo o teléfono ya están registrados', 'error');
            } else {
              this.lanzarNotificacion('Ha ocurrido un error al actualizar el usuario', 'error');
            }
          }
        })
      );
    } else {
      this.subscription.add(
        this.usuarioServicio.registrarUsuario(formData).subscribe({
          next: () => {
            this.cerrarModalRegistro();
            this.cargarUsuarios();
            this.lanzarNotificacion('Usuario registrado correctamente', 'exito');
          },
          error: (err: any) => {
            if (err.status === 409) {
              this.lanzarNotificacion(err?.error?.mensaje || 'La cédula, correo o teléfono ya están registrados', 'error');
            } else {
              this.lanzarNotificacion('Ha ocurrido un error al registrar el usuario', 'error');
            }
          }
        })
      );
    }
  }

}

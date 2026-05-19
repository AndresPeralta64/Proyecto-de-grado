import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavegacionComponente],
  templateUrl: './perfil.componente.html',
  styleUrls: ['./perfil.componente.css']
})
export class PerfilComponente implements OnInit {
  formulario: FormGroup;
  usuario: any;
  fotoVistaPrevia: string | null = null;
  archivoFoto: File | null = null;
  cargando: boolean = false;

  carreraId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private servicioToken: ServicioToken,
    private usuarioServicio: UsuarioServicio,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      cedula: [{ value: '', disabled: true }],
      correo: [{ value: '', disabled: true }],
      nombres: [{ value: '', disabled: true }],
      apellidos: [{ value: '', disabled: true }],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      carrera: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.cargarDatosPerfil();
  }

  cargarDatosPerfil(): void {
    this.cargando = true;
    this.usuarioServicio.obtenerPerfil().subscribe({
      next: (res) => {
        if (res.exito) {
          const datos = res.datos;
          this.formulario.patchValue({
            cedula: datos.cedula,
            correo: datos.correo,
            nombres: datos.nombres,
            apellidos: datos.apellidos,
            telefono: datos.telefono,
            carrera: datos.carrera || ''
          });
          this.carreraId = datos.id_carrera || null;

          if (datos.foto_url) {
            this.fotoVistaPrevia = datos.foto_url;
          }
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoFoto = archivo;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoVistaPrevia = reader.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarFoto(): void {
    this.usuarioServicio.eliminarFotoPerfil().subscribe({
      next: (res) => {
        if (res.exito) {
          this.fotoVistaPrevia = null;
          this.archivoFoto = null;
          this.lanzarNotificacion('Foto de perfil eliminada', 'exito');
        }
      },
      error: () => {
        this.lanzarNotificacion('Error al eliminar la foto', 'error');
      }
    });
  }

  mensajeToast: string = '';
  mostrarToast: boolean = false;
  tipoToast: 'exito' | 'error' = 'exito';

  actualizar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const formData = new FormData();
    formData.append('telefono', this.formulario.get('telefono')?.value || '');
    formData.append('id_carrera', this.carreraId ? this.carreraId.toString() : '');

    if (this.archivoFoto) {
      formData.append('foto', this.archivoFoto);
    }

    this.usuarioServicio.actualizarPerfil(formData).subscribe({
      next: (res) => {
        if (res.exito) {
          this.lanzarNotificacion('Se ha actualizado su perfil', 'exito');
          this.archivoFoto = null;

          setTimeout(() => {
            this.cancelar(); // Usamos la misma redirección que cancelar
          }, 2000);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.lanzarNotificacion('Ha ocurrido un error', 'error');
        this.cargando = false;
      }
    });
  }

  validarNumeros(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  lanzarNotificacion(mensaje: string, tipo: 'exito' | 'error'): void {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
    }, 3000);
  }

  cambiarContrasenia(): void {
    this.router.navigate(['/autenticacion/recuperar-contrasenia'], { state: { desdePerfil: true } });
  }

  cancelar(): void {
    const usuario = this.servicioToken.obtenerDatosUsuario();
    const rol = usuario?.nombre_rol;
    if (rol === 'Administrador') {
      this.router.navigate(['/administrador']);
    } else if (rol === 'Emisor') {
      this.router.navigate(['/emisor']);
    } else if (rol === 'Receptor') {
      this.router.navigate(['/receptor']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServicioAutenticacion } from '../../../core/servicios/auth.servicio';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { CredencialesInicioSesion } from '../../../core/modelos/auth.model';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.componente.html',
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)', position: 'absolute', width: '100%' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)', position: 'absolute', width: '100%' }))
      ]),
      transition(':leave', [
        style({ position: 'absolute', width: '100%' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateX(-30px)', position: 'absolute', width: '100%' }))
      ])
    ])
  ]
})
export class LoginComponente {

  formulario: FormGroup;
  paso = 1; // 1: Correo, 2: Contraseña
  cargando = false;
  mensajeError = '';
  mostrarErrorCorreo = false;
  mostrarErrorContrasenia = false;

  constructor(
    private fb: FormBuilder,
    private servicioAutenticacion: ServicioAutenticacion,
    private servicioToken: ServicioToken,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  avanzar(): void {
    this.mensajeError = '';

    if (this.paso === 1) {
      this.mostrarErrorCorreo = true;
      if (this.formulario.get('correo')?.valid) {
        this.verificarCorreo();
      }
      return;
    }

    this.mostrarErrorContrasenia = true;
    if (this.formulario.get('contrasenia')?.valid) {
      this.iniciarSesion();
    }
  }

  /**
   * Verifica si el correo existe en la BD
   */
  private verificarCorreo(): void {
    this.cargando = true;
    const correoControl = this.formulario.get('correo');
    const correo = correoControl?.value;

    this.servicioAutenticacion.verificarCorreo(correo).subscribe({
      next: (respuesta) => {
        this.paso = 2;
        this.mostrarErrorContrasenia = false;
        this.cargando = false;
      },
      error: (error) => {
        correoControl?.setErrors({ noRegistrado: true });
        this.cargando = false;
      }
    });
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    const contraseniaControl = this.formulario.get('contrasenia');

    const credenciales: CredencialesInicioSesion = {
      correo: this.formulario.get('correo')?.value,
      contrasenia: contraseniaControl?.value
    };

    this.servicioAutenticacion.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.servicioToken.guardarToken(respuesta.token);
          this.redirigirSegunRol(respuesta.usuario.rol);
        } else {
          contraseniaControl?.setErrors({ incorrectas: true });
        }
        this.cargando = false;
      },
      error: (error) => {
        // Manejamos el error 401 como credenciales incorrectas bajo el input
        contraseniaControl?.setErrors({ incorrectas: true });
        this.cargando = false;
      }
    });
  }

  retroceder(): void {
    this.paso = 1;
    this.mensajeError = '';
    this.mostrarErrorCorreo = false;
    this.mostrarErrorContrasenia = false;
    this.formulario.get('correo')?.setErrors(null);
    this.formulario.get('contrasenia')?.reset();
  }

  get correoIngresado(): string {
    return this.formulario.get('correo')?.value || 'correo@espoch.edu.ec';
  }

  get errorCorreo(): string {
    const control = this.formulario.get('correo');
    if (!control || !this.mostrarErrorCorreo || !control.invalid) {
      return '';
    }
    if (control.errors?.['required']) {
      return 'Ingrese su correo institucional.';
    }
    if (control.errors?.['email']) {
      return 'Ingrese un correo institucional válido.';
    }
    if (control.errors?.['noRegistrado']) {
      return 'Este correo no está registrado en el sistema.';
    }
    return '';
  }

  get errorContrasenia(): string {
    const control = this.formulario.get('contrasenia');
    if (!control || !this.mostrarErrorContrasenia || !control.invalid) {
      return '';
    }
    if (control.errors?.['required']) {
      return 'Ingrese su contraseña.';
    }
    if (control.errors?.['incorrectas']) {
      return 'Las credenciales ingresadas son incorrectas.';
    }
    return '';
  }

  private redirigirSegunRol(rol: string): void {
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

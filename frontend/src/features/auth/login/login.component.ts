import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { ServicioAutenticacion } from '../../../core/servicios/auth.service';
import { ServicioToken } from '../../../core/servicios/token.service';
import { CredencialesInicioSesion } from '../../../core/models/auth.model';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateX(-30px)', position: 'absolute', width: '100%' }))
      ])
    ])
  ]
})
export class IniciarSesionComponent {

  formulario: FormGroup;
  paso = 1;
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
        this.paso = 2;
        this.mostrarErrorContrasenia = false;
      }
      return;
    }

    this.mostrarErrorContrasenia = true;
    if (this.formulario.get('contrasenia')?.valid) {
      this.iniciarSesion();
    }
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const credenciales: CredencialesInicioSesion = {
      correo: this.formulario.get('correo')?.value,
      contrasenia: this.formulario.get('contrasenia')?.value
    };

    this.servicioAutenticacion.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        this.servicioToken.guardarToken(respuesta.token);
        this.redirigirSegunRol(respuesta.roles);
        this.cargando = false;
      },
      error: (error) => {
        this.mensajeError = error.error?.mensaje || 'Error al iniciar sesión';
        this.cargando = false;
      }
    });
  }

  retroceder(): void {
    this.paso = 1;
    this.mensajeError = '';
    this.mostrarErrorCorreo = false;
    this.mostrarErrorContrasenia = false;
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
      return 'Ingresa tu correo institucional.';
    }
    return 'Ingresa un correo institucional válido.';
  }

  get errorContrasenia(): string {
    const control = this.formulario.get('contrasenia');
    if (!control || !this.mostrarErrorContrasenia || !control.invalid) {
      return '';
    }
    if (control.errors?.['required']) {
      return 'Ingresa tu contraseña.';
    }
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  private redirigirSegunRol(roles: any[]): void {
    const nombresRoles = roles.map(rol => rol.nombre);

    if (nombresRoles.includes('Administrador')) {
      this.router.navigate(['/administrador']);
    } else if (nombresRoles.includes('Emisor')) {
      this.router.navigate(['/emisor']);
    } else if (nombresRoles.includes('Receptor')) {
      this.router.navigate(['/receptor']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

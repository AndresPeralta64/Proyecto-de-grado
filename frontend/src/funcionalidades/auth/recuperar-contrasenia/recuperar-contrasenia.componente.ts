import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServicioAutenticacion } from '../../../core/servicios/auth.servicio';

@Component({
  selector: 'app-recuperar-contrasenia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recuperar-contrasenia.componente.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RecuperarContraseniaComponente {
  formulario: FormGroup;
  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  enviado = false;

  constructor(
    private fb: FormBuilder,
    private servicioAutenticacion: ServicioAutenticacion,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  solicitar(): void {
    if (this.formulario.invalid) return;

    this.cargando = true;
    this.mensajeError = '';
    const correo = this.formulario.get('correo')?.value;

    this.servicioAutenticacion.solicitarRestablecimiento(correo).subscribe({
      next: (res) => {
        this.enviado = true;
        this.mensajeExito = res.mensaje;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'No se pudo enviar el correo.';
        this.cargando = false;
      }
    });
  }

  get errorCorreo(): string {
    const control = this.formulario.get('correo');
    if (!control || !control.touched || !control.invalid) return '';
    if (control.errors?.['required']) return 'Ingrese su correo institucional.';
    return 'Ingrese un correo válido.';
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServicioAutenticacion } from '../../../core/servicios/auth.servicio';

@Component({
  selector: 'app-nueva-contrasenia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nueva-contrasenia.componente.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NuevaContraseniaComponente implements OnInit {
  formulario: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  token: string | null = null;
  exito = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private servicioAutenticacion: ServicioAutenticacion
  ) {
    this.formulario = this.fb.group({
      nuevaContrasenia: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasenia: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.mensajeError = 'Enlace de recuperación inválido.';
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('nuevaContrasenia')?.value === g.get('confirmarContrasenia')?.value
      ? null : { mismatch: true };
  }

  restablecer(): void {
    if (this.formulario.invalid || !this.token) return;

    this.cargando = true;
    this.mensajeError = '';

    const datos = {
      token: this.token,
      nuevaContrasenia: this.formulario.get('nuevaContrasenia')?.value
    };

    this.servicioAutenticacion.confirmarRestablecimiento(datos).subscribe({
      next: (res) => {
        this.exito = true;
        this.mensajeExito = res.mensaje;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error al actualizar la contraseña.';
        this.cargando = false;
      }
    });
  }

  get errorNueva(): string {
    const control = this.formulario.get('nuevaContrasenia');
    if (!control || !control.touched || !control.invalid) return '';
    if (control.errors?.['required']) return 'La contraseña es obligatoria.';
    return 'Mínimo 6 caracteres.';
  }

  get errorConfirmar(): string {
    const control = this.formulario.get('confirmarContrasenia');
    if (!control || !control.touched) return '';
    if (this.formulario.errors?.['mismatch']) return 'Las contraseñas no coinciden.';
    return '';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
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

  constructor(
    private fb: FormBuilder,
    private servicioToken: ServicioToken,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      cedula: [{ value: '', disabled: true }],
      correo: [{ value: '', disabled: true }],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      carrera: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.usuario = this.servicioToken.obtenerDatosUsuario();
    if (this.usuario) {
      this.formulario.patchValue({
        cedula: '060XXXXXXX', // Esto vendría de una API de perfil completo
        correo: this.usuario.correo,
        nombres: this.usuario.nombres,
        apellidos: this.usuario.apellidos,
        telefono: '09XXXXXXXX',
        carrera: 'Ingeniería en Software'
      });
      // Simulación de foto si existiera
      // this.fotoVistaPrevia = this.usuario.foto_url;
    }
  }

  alSeleccionarArchivo(event: any): void {
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

  actualizar(): void {
    if (this.formulario.invalid) return;
    console.log('Actualizando datos...', this.formulario.getRawValue());
    // Aquí irá la llamada al backend con FormData para la imagen
  }

  irACambiarContrasenia(): void {
    this.router.navigate(['/autenticacion/recuperar-contrasenia']);
  }

  cancelar(): void {
    // Redirige a la misma ruta que la opción "Cambiar rol" (asumimos administrador por ahora)
    this.router.navigate(['/administrador']);
  }
}

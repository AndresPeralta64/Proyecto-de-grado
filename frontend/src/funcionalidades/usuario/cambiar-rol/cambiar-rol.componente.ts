import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';

@Component({
  selector: 'app-cambiar-rol',
  standalone: true,
  imports: [CommonModule, NavegacionComponente],
  templateUrl: './cambiar-rol.componente.html'
})
export class CambiarRolComponente implements OnInit {
  rolActivo: string = '';
  rolesUsuario: string[] = [];

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.servicioToken.obtenerDatosUsuario();
    if (usuario) {
      this.rolActivo = usuario.nombre_rol || '';
      // Usamos el array de roles del JWT; si no existe, fallback al rol activo
      this.rolesUsuario = (usuario.roles || [usuario.nombre_rol]).filter(Boolean);
    }
  }

  tieneRol(rol: string): boolean {
    return this.rolesUsuario.some(r => r === rol);
  }

  esRolActivo(rol: string): boolean {
    return this.rolActivo === rol;
  }

  cambiar(nuevoRol: string): void {
    if (!this.tieneRol(nuevoRol) || this.esRolActivo(nuevoRol)) return;
    localStorage.setItem('rol_activo', nuevoRol);
    this.navegarARol(nuevoRol);
  }

  cancelar(): void {
    this.navegarARol(this.rolActivo);
  }

  private navegarARol(rol: string): void {
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

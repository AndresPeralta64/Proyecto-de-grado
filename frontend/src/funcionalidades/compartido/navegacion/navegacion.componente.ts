import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ServicioToken } from '../../../core/servicios/token.servicio';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navegacion.componente.html',
  styleUrls: ['./navegacion.componente.css']
})
export class NavegacionComponente implements OnInit {
  nombreUsuario: string = 'NOMBRE DE USUARIO';
  menuPerfilAbierto: boolean = false;

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Corregimos el nombre de la función a 'obtenerDatosUsuario'
    const usuario = this.servicioToken.obtenerDatosUsuario();
    if (usuario && usuario.nombres && usuario.apellidos) {
      this.nombreUsuario = `${usuario.nombres} ${usuario.apellidos}`.toUpperCase();
    }
  }

  toggleMenuPerfil(): void {
    this.menuPerfilAbierto = !this.menuPerfilAbierto;
  }

  cerrarSesion(): void {
    this.servicioToken.eliminarToken();
    this.router.navigate(['/autenticacion/iniciar-sesion']);
  }
}

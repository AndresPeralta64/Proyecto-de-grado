import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ServicioToken } from '../../../core/servicios/token.servicio';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';

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
    private router: Router,
    public sidebarServicio: SidebarServicio
  ) {}

  ngOnInit(): void {
    // Corregimos el nombre de la función a 'obtenerDatosUsuario'
    const usuario = this.servicioToken.obtenerDatosUsuario();
    if (usuario && usuario.nombres && usuario.apellidos) {
      this.nombreUsuario = `${usuario.nombres} ${usuario.apellidos}`.toUpperCase();
    }
  }

  toggleMenuPerfil(): void {
    if (!this.menuPerfilAbierto) {
      this.sidebarServicio.cerrarMenusContenido();
    }
    this.menuPerfilAbierto = !this.menuPerfilAbierto;
  }

  toggleSidebar(): void {
    this.sidebarServicio.toggle();
  }

  cerrarSesion(): void {
    this.servicioToken.eliminarToken();
    this.router.navigate(['/autenticacion/iniciar-sesion']);
  }

  redirigirAlDashboard(): void {
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

  get esPaginaPerfil(): boolean {
    return this.router.url.includes('/perfil');
  }
}

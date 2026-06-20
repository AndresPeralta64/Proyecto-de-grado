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
  estaLogeado: boolean = false;

  constructor(
    private servicioToken: ServicioToken,
    private router: Router,
    public sidebarServicio: SidebarServicio
  ) {}

  ngOnInit(): void {
    // Verificar que el token sea válido y no haya expirado
    if (this.servicioToken.estaAutenticado()) {
      const usuario = this.servicioToken.obtenerDatosUsuario();
      if (usuario && usuario.nombres && usuario.apellidos) {
        this.nombreUsuario = `${usuario.nombres} ${usuario.apellidos}`.toUpperCase();
        this.estaLogeado = true;
      } else {
        this.estaLogeado = false;
      }
    } else {
      this.estaLogeado = false;
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
    return this.router.url === '/perfil';
  }

  get esPaginaCambiarRol(): boolean {
    return this.router.url.includes('/cambiar-rol');
  }

  get rolActual(): string {
    // Leemos el rol directamente del JWT (sin sobreescritura de rol_activo)
    // para mostrar el rol con el que se ingresó a esta pantalla
    const token = this.servicioToken.obtenerToken();
    if (!token) return '';
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(
        window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      const rolActivo = localStorage.getItem('rol_activo');
      return rolActivo || payload.nombre_rol || '';
    } catch {
      return '';
    }
  }
}

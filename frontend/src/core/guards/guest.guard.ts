import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioToken } from '../servicios/token.servicio';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.servicioToken.estaAutenticado()) {
      const usuario = this.servicioToken.obtenerDatosUsuario();
      if (usuario) {
        // Evaluamos primero el rol ACTIVO del usuario
        const rolActivo = usuario.nombre_rol ? usuario.nombre_rol.toUpperCase() : '';

        if (rolActivo === 'ADMINISTRADOR' || rolActivo === 'ADMIN') {
          this.router.navigate(['/administrador']);
        } else if (rolActivo === 'EMISOR') {
          this.router.navigate(['/emisor']);
        } else if (rolActivo === 'RECEPTOR') {
          this.router.navigate(['/receptor']);
        } else {
          // Fallback a jerarquía si no hay rol activo o es inválido
          const roles: string[] = usuario.roles || [];
          if (roles.includes('Administrador') || roles.includes('ADMIN')) {
            this.router.navigate(['/administrador']);
          } else if (roles.includes('Emisor') || roles.includes('EMISOR')) {
            this.router.navigate(['/emisor']);
          } else if (roles.includes('Receptor') || roles.includes('RECEPTOR')) {
            this.router.navigate(['/receptor']);
          } else {
            this.router.navigate(['/perfil']); // Fallback por si acaso
          }
        }
      } else {
        this.router.navigate(['/autenticacion/iniciar-sesion']);
      }
      return false;
    }
    
    // Si no está autenticado, permitimos el acceso a la ruta (inicio público)
    return true; 
  }
}

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
        // Obtenemos los roles del usuario. Si no existe el array roles, intentamos con nombre_rol
        const roles: string[] = usuario.roles || [usuario.nombre_rol].filter(Boolean);
        
        // Evaluamos jerarquía: Administrador > Emisor > Receptor
        if (roles.includes('Administrador') || roles.includes('ADMIN')) {
          // Si el usuario cambia el rol activo manualmente, respetamos ese rol si decide ir a la ruta raíz?
          // Según lo pedido: "se redirigirá a su pantalla principal, es decir, del rol que mayor peso tenga"
          this.router.navigate(['/administrador']);
        } else if (roles.includes('Emisor') || roles.includes('EMISOR')) {
          this.router.navigate(['/emisor']);
        } else if (roles.includes('Receptor') || roles.includes('RECEPTOR')) {
          this.router.navigate(['/receptor']);
        } else {
          this.router.navigate(['/perfil']); // Fallback por si acaso
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

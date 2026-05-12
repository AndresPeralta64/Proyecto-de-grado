import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ServicioToken } from '../servicios/token.servicio';

@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate {

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesRequeridos = route.data['roles'] as string[];

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const datosUsuario = this.servicioToken.obtenerDatosUsuario();
    if (!datosUsuario) {
      this.router.navigate(['/no-autorizado']);
      return false;
    }

    // El backend envía nombre_rol (un solo rol por ahora) o un array si se escala
    const rolUsuario = datosUsuario.nombre_rol;
    const tieneRol = rolesRequeridos.includes(rolUsuario);

    if (tieneRol) {
      return true;
    } else {
      this.router.navigate(['/no-autorizado']);
      return false;
    }
  }
}


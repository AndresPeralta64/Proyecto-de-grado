import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ServicioToken } from '../servicios/token.service';

@Injectable({
  providedIn: 'root'
})
export class GuardiaRol implements CanActivate {

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesRequeridos = route.data['roles'] as string[];

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const datosUsuario = this.servicioToken.obtenerDatosUsuario();
    if (!datosUsuario || !datosUsuario.roles) {
      this.router.navigate(['/no-autorizado']);
      return false;
    }

    const rolesUsuario = datosUsuario.roles.map((rol: any) => rol.nombre);
    const tieneRol = rolesRequeridos.some(rol => rolesUsuario.includes(rol));

    if (tieneRol) {
      return true;
    } else {
      this.router.navigate(['/no-autorizado']);
      return false;
    }
  }
}

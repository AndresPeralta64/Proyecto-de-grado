import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioToken } from '../servicios/token.servicio';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private servicioToken: ServicioToken,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.servicioToken.estaAutenticado()) {
      return true;
    } else {
      this.router.navigate(['/autenticacion/iniciar-sesion']);
      return false;
    }
  }
}


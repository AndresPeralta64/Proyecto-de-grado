import { Routes } from '@angular/router';
import { IniciarSesionComponent } from './login/login.component';

export const rutasAutenticacion: Routes = [
  {
    path: 'iniciar-sesion',
    component: IniciarSesionComponent
  },
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full'
  }
];

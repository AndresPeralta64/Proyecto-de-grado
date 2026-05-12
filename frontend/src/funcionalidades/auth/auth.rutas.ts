import { Routes } from '@angular/router';
import { LoginComponente } from './login/login.componente';

export const rutasAutenticacion: Routes = [
  {
    path: 'iniciar-sesion',
    component: LoginComponente
  },
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full'
  }
];


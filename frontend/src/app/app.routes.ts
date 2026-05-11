import { Routes } from '@angular/router';
import { GuardiaAutenticacion } from '../core/guards/auth.guard';
import { GuardiaRol } from '../core/guards/rol.guard';
import { rutasAutenticacion } from '../features/auth/auth.routes';
import { rutasAdministrador } from '../features/admin/admin.routes';
import { rutasEmisor } from '../features/emisor/emisor.routes';
import { rutasReceptor } from '../features/receptor/receptor.routes';
import { NoAutorizadoComponent } from '../compartidos/components/no-autorizado/no-autorizado.component';

export const routes: Routes = [
  {
    path: 'autenticacion',
    children: rutasAutenticacion
  },
  {
    path: 'administrador',
    canActivate: [GuardiaAutenticacion, GuardiaRol],
    data: { roles: ['Administrador'] },
    children: rutasAdministrador
  },
  {
    path: 'emisor',
    canActivate: [GuardiaAutenticacion, GuardiaRol],
    data: { roles: ['Emisor', 'Administrador'] },
    children: rutasEmisor
  },
  {
    path: 'receptor',
    canActivate: [GuardiaAutenticacion, GuardiaRol],
    data: { roles: ['Receptor', 'Emisor', 'Administrador'] },
    children: rutasReceptor
  },
  {
    path: 'no-autorizado',
    component: NoAutorizadoComponent
  },
  {
    path: '',
    redirectTo: '/autenticacion/iniciar-sesion',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/autenticacion/iniciar-sesion'
  }
];

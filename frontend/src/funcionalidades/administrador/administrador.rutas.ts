import { Routes } from '@angular/router';
import { AdministradorComponente } from './administrador.componente';
import { DashboardComponente } from './dashboard/dashboard.componente';
import { UsuariosComponente } from './usuarios/usuarios.componente';

export const rutasAdministrador: Routes = [
  {
    path: '',
    component: AdministradorComponente,
    children: [
      { path: 'dashboard', component: DashboardComponente },
      { path: 'usuarios', component: UsuariosComponente },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


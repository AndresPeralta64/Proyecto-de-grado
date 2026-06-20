import { Routes } from '@angular/router';
import { AdministradorComponente } from './administrador.componente';
import { DashboardComponente } from './dashboard/dashboard.componente';
import { UsuariosComponente } from './usuarios/usuarios.componente';
import { MicrocredencialesComponente } from './microcredenciales/microcredenciales.componente';

export const rutasAdministrador: Routes = [
  {
    path: '',
    component: AdministradorComponente,
    children: [
      { path: 'dashboard', component: DashboardComponente },
      { path: 'usuarios', component: UsuariosComponente },
      { path: 'microcredenciales', component: MicrocredencialesComponente },
      { path: 'insignias', loadComponent: () => import('./insignias/insignias.componente').then(m => m.InsigniasAdminComponente) },
      { path: 'perfiles-academicos', loadComponent: () => import('../publico/perfiles-academicos/perfiles-academicos.componente').then(m => m.PerfilesAcademicosComponente) },
      { path: 'microcredenciales-registradas', loadComponent: () => import('../publico/microcredenciales-registradas/microcredenciales-registradas.componente').then(m => m.MicrocredencialesRegistradasComponente) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


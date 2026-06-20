import { Routes } from '@angular/router';
import { ReceptorComponente } from './receptor.componente';
import { DashboardReceptorComponente } from './dashboard/dashboard.componente';

import { InsigniasReceptorComponente } from './insignias/insignias.componente';
import { PerfilReceptorComponente } from './perfil/perfil.componente';
export const rutasReceptor: Routes = [
  {
    path: '',
    component: ReceptorComponente,
    children: [
      { path: 'dashboard', component: DashboardReceptorComponente },
      { path: 'insignias', component: InsigniasReceptorComponente },
      { path: 'perfil', component: PerfilReceptorComponente },
      { path: 'perfiles-academicos', loadComponent: () => import('../publico/perfiles-academicos/perfiles-academicos.componente').then(m => m.PerfilesAcademicosComponente) },
      { path: 'microcredenciales-registradas', loadComponent: () => import('../publico/microcredenciales-registradas/microcredenciales-registradas.componente').then(m => m.MicrocredencialesRegistradasComponente) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


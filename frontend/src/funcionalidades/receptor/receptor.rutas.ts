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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


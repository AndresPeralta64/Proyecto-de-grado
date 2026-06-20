import { Routes } from '@angular/router';
import { EmisorComponente } from './emisor.componente';
import { DashboardComponente } from './dashboard/dashboard.componente';
import { MicrocredencialesEmisorComponente } from './microcredenciales/microcredenciales.componente';
import { InsigniasEmisorComponente } from './insignias/insignias.componente';

export const rutasEmisor: Routes = [
  {
    path: '',
    component: EmisorComponente,
    children: [
      { path: 'dashboard', component: DashboardComponente },
      { path: 'microcredenciales', component: MicrocredencialesEmisorComponente },
      { path: 'insignias', component: InsigniasEmisorComponente },
      { path: 'perfiles-academicos', loadComponent: () => import('../publico/perfiles-academicos/perfiles-academicos.componente').then(m => m.PerfilesAcademicosComponente) },
      { path: 'microcredenciales-registradas', loadComponent: () => import('../publico/microcredenciales-registradas/microcredenciales-registradas.componente').then(m => m.MicrocredencialesRegistradasComponente) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

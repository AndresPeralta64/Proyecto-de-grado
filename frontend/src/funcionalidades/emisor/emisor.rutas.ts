import { Routes } from '@angular/router';
import { EmisorComponente } from './emisor.componente';
import { DashboardComponente } from './dashboard/dashboard.componente';

export const rutasEmisor: Routes = [
  {
    path: '',
    component: EmisorComponente,
    children: [
      { path: 'dashboard', component: DashboardComponente },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

import { Routes } from '@angular/router';
import { ReceptorComponente } from './receptor.componente';

export const rutasReceptor: Routes = [
  {
    path: '',
    component: ReceptorComponente,
    children: [
      {
        path: 'insignias',
        loadComponent: () => import('./insignias/insignias.componente').then(m => m.ReceptorInsigniasComponente)
      },
      {
        path: '',
        redirectTo: 'insignias',
        pathMatch: 'full'
      }
    ]
  }
];

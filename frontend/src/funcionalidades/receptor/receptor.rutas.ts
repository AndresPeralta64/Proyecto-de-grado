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
        path: 'perfil-academico',
        loadComponent: () => import('./perfil-academico/perfil-academico.componente').then(m => m.PerfilAcademicoComponente)
      },
      {
        path: '',
        redirectTo: 'insignias',
        pathMatch: 'full'
      }
    ]
  }
];

import { Routes } from '@angular/router';
import { LoginComponente } from '../funcionalidades/auth/login/login.componente';
import { RecuperarContraseniaComponente } from '../funcionalidades/auth/recuperar-contrasenia/recuperar-contrasenia.componente';
import { NuevaContraseniaComponente } from '../funcionalidades/auth/nueva-contrasenia/nueva-contrasenia.componente';
import { AdministradorComponente } from '../funcionalidades/administrador/administrador.componente';
import { AuthGuard } from '../core/guards/auth.guard';
import { RolGuard } from '../core/guards/rol.guard';
import { GuestGuard } from '../core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../funcionalidades/publico/inicio-publico/inicio-publico.componente').then(m => m.InicioPublicoComponente),
    canActivate: [GuestGuard]
  }, // Trigger rebuild
  
  // Módulo de Autenticación
  { 
    path: 'autenticacion',
    children: [
      { path: 'iniciar-sesion', component: LoginComponente },
      { path: 'recuperar-contrasenia', component: RecuperarContraseniaComponente },
      { path: 'nueva-contrasenia/:token', component: NuevaContraseniaComponente }
    ]
  },

  // Módulo Administrador
  { 
    path: 'administrador', 
    loadChildren: () => import('../funcionalidades/administrador/administrador.rutas').then(m => m.rutasAdministrador),
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['ADMIN', 'Administrador'] } // Aceptamos ambos para evitar bloqueos
  },

  // Módulo Emisor
  { 
    path: 'emisor', 
    loadChildren: () => import('../funcionalidades/emisor/emisor.rutas').then(m => m.rutasEmisor),
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['EMISOR', 'Emisor'] }
  },

  // Módulo Receptor
  { 
    path: 'receptor', 
    loadChildren: () => import('../funcionalidades/receptor/receptor.rutas').then(m => m.rutasReceptor),
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['RECEPTOR', 'Receptor'] }
  },

  // Perfil de Usuario
  {
    path: 'perfil',
    loadComponent: () => import('../funcionalidades/usuario/perfil/perfil.componente').then(m => m.PerfilComponente),
    canActivate: [AuthGuard]
  },

  // Cambiar Rol
  {
    path: 'cambiar-rol',
    loadComponent: () => import('../funcionalidades/usuario/cambiar-rol/cambiar-rol.componente').then(m => m.CambiarRolComponente),
    canActivate: [AuthGuard]
  },

  // Insignia Pública (Compartir)
  {
    path: 'insignia/:id',
    loadComponent: () => import('../funcionalidades/publico/insignia-publica/insignia-publica.componente').then(m => m.InsigniaPublicaComponente)
  },

  // No Autorizado
  {
    path: 'no-autorizado',
    loadComponent: () => import('../compartidos/componentes/no-autorizado/no_autorizado.componente').then(m => m.NoAutorizadoComponente)
  },

  { path: '**', redirectTo: 'autenticacion/iniciar-sesion' }
];

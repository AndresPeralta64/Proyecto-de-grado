import { Routes } from '@angular/router';
import { LoginComponente } from '../funcionalidades/auth/login/login.componente';
import { RecuperarContraseniaComponente } from '../funcionalidades/auth/recuperar-contrasenia/recuperar-contrasenia.componente';
import { NuevaContraseniaComponente } from '../funcionalidades/auth/nueva-contrasenia/nueva-contrasenia.componente';
import { AdministradorComponente } from '../funcionalidades/administrador/administrador.componente';
import { AuthGuard } from '../core/guards/auth.guard';
import { RolGuard } from '../core/guards/rol.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'autenticacion/iniciar-sesion', pathMatch: 'full' },
  
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

  // Catálogo Público
  {
    path: 'catalogo',
    loadComponent: () => import('../funcionalidades/publico/catalogo/catalogo.componente').then(m => m.CatalogoComponente)
  },

  // Acreedores de Microcredencial
  {
    path: 'microcredencial/:id/acreedores',
    loadComponent: () => import('../funcionalidades/publico/acreedores/acreedores.componente').then(m => m.AcreedoresComponente)
  },

  // Búsqueda de Perfiles
  {
    path: 'buscar-perfiles',
    loadComponent: () => import('../funcionalidades/publico/busqueda-perfiles/busqueda-perfiles.componente').then(m => m.BusquedaPerfilesComponente)
  },

  // Perfil Público
  {
    path: 'perfil/:cedula',
    loadComponent: () => import('../funcionalidades/publico/perfil-publico/perfil-publico.componente').then(m => m.PerfilPublicoComponente)
  },

  // No Autorizado
  {
    path: 'no-autorizado',
    loadComponent: () => import('../compartidos/componentes/no-autorizado/no_autorizado.componente').then(m => m.NoAutorizadoComponente)
  },

  { path: '**', redirectTo: 'autenticacion/iniciar-sesion' }
];

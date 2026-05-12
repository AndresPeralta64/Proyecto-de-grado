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
    component: AdministradorComponente,
    canActivate: [AuthGuard, RolGuard],
    data: { roles: ['Administrador'] }
  },

  // Comodín para rutas no encontradas
  { path: '**', redirectTo: 'autenticacion/iniciar-sesion' }
];

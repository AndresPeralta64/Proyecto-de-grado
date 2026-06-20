import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { PerfilesAcademicosComponente } from '../perfiles-academicos/perfiles-academicos.componente';

@Component({
  selector: 'app-perfiles-academicos-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, NavegacionComponente, SidebarComponent, PerfilesAcademicosComponente],
  templateUrl: './perfiles-academicos-publico.componente.html'
})
export class PerfilesAcademicosPublicoComponente {
  constructor(public sidebarServicio: SidebarServicio) {}

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }
}

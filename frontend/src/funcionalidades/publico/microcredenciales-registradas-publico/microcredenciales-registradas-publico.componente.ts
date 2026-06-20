import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';
import { MicrocredencialesRegistradasComponente } from '../microcredenciales-registradas/microcredenciales-registradas.componente';

@Component({
  selector: 'app-microcredenciales-registradas-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, NavegacionComponente, SidebarComponent, MicrocredencialesRegistradasComponente],
  templateUrl: './microcredenciales-registradas-publico.componente.html'
})
export class MicrocredencialesRegistradasPublicoComponente {
  constructor(public sidebarServicio: SidebarServicio) {}

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }
}

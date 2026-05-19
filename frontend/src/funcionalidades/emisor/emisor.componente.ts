import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavegacionComponente } from '../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../core/servicios/sidebar.servicio';

@Component({
  selector: 'app-emisor',
  standalone: true,
  imports: [CommonModule, NavegacionComponente, SidebarComponent, RouterModule],
  templateUrl: './emisor.componente.html'
})
export class EmisorComponente {
  constructor(public sidebarServicio: SidebarServicio) { }

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }
}

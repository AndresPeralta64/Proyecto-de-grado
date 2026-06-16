import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavegacionComponente } from '../../compartido/navegacion/navegacion.componente';
import { SidebarComponent } from '../../compartido/sidebar/sidebar.componente';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';

@Component({
  selector: 'app-inicio-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, NavegacionComponente, SidebarComponent],
  templateUrl: './inicio-publico.componente.html'
})
export class InicioPublicoComponente implements OnInit {
  
  constructor(public sidebarServicio: SidebarServicio) {}

  ngOnInit(): void {
  }

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }
}

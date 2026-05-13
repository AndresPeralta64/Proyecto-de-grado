import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarServicio } from '../../../core/servicios/sidebar.servicio';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.componente.html',
  styleUrls: ['./sidebar.componente.css'],
  animations: [
    trigger('expandCollapse', [
      state('contracted', style({ width: '64px' })),
      state('expanded', style({ width: '280px' })),
      transition('contracted <=> expanded', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class SidebarComponent {
  constructor(public sidebarServicio: SidebarServicio) { }

  @HostBinding('@expandCollapse')
  get animState(): string {
    return this.sidebarServicio.expandido() ? 'expanded' : 'contracted';
  }

  get expandido(): boolean {
    return this.sidebarServicio.expandido();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavegacionComponente } from '../compartido/navegacion/navegacion.componente';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, NavegacionComponente],
  templateUrl: './administrador.componente.html'
})
export class AdministradorComponente {
  constructor() { }
}

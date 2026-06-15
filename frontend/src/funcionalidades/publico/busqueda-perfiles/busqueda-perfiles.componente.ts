import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicoServicio, PerfilBuscado } from '../../../core/servicios/publico.servicio';

@Component({
  selector: 'app-busqueda-perfiles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './busqueda-perfiles.componente.html',
  styleUrls: ['./busqueda-perfiles.componente.css']
})
export class BusquedaPerfilesComponente implements OnInit {
  private publicoServicio = inject(PublicoServicio);
  
  perfiles: PerfilBuscado[] = [];
  cargando = false;
  busqueda = '';
  busquedaRealizada = false;

  ngOnInit(): void {
    // Podríamos cargar todos al inicio o esperar a que busquen
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.publicoServicio.buscarPerfiles(this.busqueda).subscribe({
      next: (data) => {
        this.perfiles = data;
        this.cargando = false;
        this.busquedaRealizada = true;
      },
      error: (err) => {
        console.error('Error al buscar perfiles', err);
        this.cargando = false;
        this.busquedaRealizada = true;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.buscar();
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicoServicio, Microcredencial } from '../../../core/servicios/publico.servicio';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalogo.componente.html',
  styleUrls: ['./catalogo.componente.css']
})
export class CatalogoComponente implements OnInit {
  private publicoServicio = inject(PublicoServicio);
  
  microcredenciales: Microcredencial[] = [];
  microcredencialesFiltradas: Microcredencial[] = [];
  cargando = true;
  busqueda = '';

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.publicoServicio.obtenerCatalogoMicrocredenciales().subscribe({
      next: (data) => {
        this.microcredenciales = data;
        this.microcredencialesFiltradas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando catálogo:', err);
        this.cargando = false;
      }
    });
  }

  filtrarCatalogo(): void {
    const termino = this.busqueda.toLowerCase();
    this.microcredencialesFiltradas = this.microcredenciales.filter(m => 
      m.nombre.toLowerCase().includes(termino) || 
      (m.area_nombre && m.area_nombre.toLowerCase().includes(termino))
    );
  }
}

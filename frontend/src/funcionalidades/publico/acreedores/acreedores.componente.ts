import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicoServicio, AcreedorPublico } from '../../../core/servicios/publico.servicio';

@Component({
  selector: 'app-acreedores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './acreedores.componente.html',
  styleUrls: ['./acreedores.componente.css']
})
export class AcreedoresComponente implements OnInit {
  private route = inject(ActivatedRoute);
  private publicoServicio = inject(PublicoServicio);

  acreedores: AcreedorPublico[] = [];
  cargando = true;
  idMicrocredencial!: number;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idMicrocredencial = +id;
      this.cargarAcreedores();
    }
  }

  cargarAcreedores(): void {
    this.publicoServicio.obtenerAcreedoresMicrocredencial(this.idMicrocredencial).subscribe({
      next: (data) => {
        this.acreedores = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar acreedores', err);
        this.cargando = false;
      }
    });
  }
}

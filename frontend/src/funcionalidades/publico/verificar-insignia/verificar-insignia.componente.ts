import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VerificacionServicio } from '../../../core/servicios/verificacion.servicio';

@Component({
  selector: 'app-verificar-insignia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verificar-insignia.componente.html',
  styleUrls: ['./verificar-insignia.componente.css']
})
export class VerificarInsigniaComponente implements OnInit {
  uuid: string | null = null;
  cargando = true;
  errorMensaje: string | null = null;
  datosVerificacion: any = null;
  inspectorAbierto = false;
  jsonLdFormateado = '';

  constructor(
    private route: ActivatedRoute,
    private servicioVerificacion: VerificacionServicio
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.uuid = params.get('uuid');
      if (this.uuid) {
        this.cargarDatosVerificacion(this.uuid);
      } else {
        this.cargando = false;
        this.errorMensaje = 'No se proporcionó un identificador de insignia válido.';
      }
    });
  }

  cargarDatosVerificacion(uuid: string): void {
    this.cargando = true;
    this.errorMensaje = null;
    this.servicioVerificacion.verificarInsignia(uuid).subscribe({
      next: (res) => {
        this.datosVerificacion = res;
        this.cargando = false;
        if (res.assertion) {
          this.jsonLdFormateado = JSON.stringify(res.assertion, null, 2);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.mensaje || 'Ocurrió un error al intentar verificar la insignia digital.';
        console.error(err);
      }
    });
  }

  toggleInspector(): void {
    this.inspectorAbierto = !this.inspectorAbierto;
  }

  copiarJson(): void {
    if (this.jsonLdFormateado) {
      navigator.clipboard.writeText(this.jsonLdFormateado).then(() => {
        // Alerta simple
      }).catch(err => {
        console.error('Error al copiar:', err);
      });
    }
  }
}

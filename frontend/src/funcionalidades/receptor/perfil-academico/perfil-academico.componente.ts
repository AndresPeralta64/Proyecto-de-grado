import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilAcademicoServicio, InsigniaPerfil } from '../servicios/perfil-academico.servicio';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-perfil-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-academico.componente.html',
  styleUrls: ['./perfil-academico.componente.css']
})
export class PerfilAcademicoComponente implements OnInit {
  usuario: any = null;
  descripcion: string = '';
  agrupar_insignias: boolean = false;
  insignias: InsigniaPerfil[] = [];
  cargando: boolean = true;
  mensaje: string = '';

  constructor(private perfilServicio: PerfilAcademicoServicio) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.perfilServicio.obtenerMiPerfil().subscribe({
      next: (res) => {
        if (res.exito) {
          this.usuario = res.datos.usuario;
          this.descripcion = res.datos.descripcion || '';
          this.agrupar_insignias = res.datos.agrupar_insignias;
          this.insignias = res.datos.insignias || [];
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil', err);
        this.mensaje = 'Error al cargar el perfil.';
        this.cargando = false;
      }
    });
  }

  get insigniasAgrupadas(): { [key: string]: InsigniaPerfil[] } {
    if (!this.agrupar_insignias) return { 'Todas': this.insignias };
    
    return this.insignias.reduce((acc, insignia) => {
      const area = insignia.area_conocimiento || 'Sin Área';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(insignia);
      return acc;
    }, {} as { [key: string]: InsigniaPerfil[] });
  }

  get areas(): string[] {
    return Object.keys(this.insigniasAgrupadas);
  }

  guardarConfiguracion(): void {
    const insigniasVisibles = this.insignias
      .filter(i => i.visible)
      .map(i => ({ id: i.id, orden: i.orden }));

    this.perfilServicio.guardarConfiguracionPerfil(this.descripcion, this.agrupar_insignias, insigniasVisibles)
      .subscribe({
        next: (res) => {
          if (res.exito) {
            this.mensaje = 'Configuración guardada correctamente.';
            setTimeout(() => this.mensaje = '', 3000);
          }
        },
        error: (err) => {
          console.error('Error al guardar', err);
          this.mensaje = 'Error al guardar la configuración.';
        }
      });
  }

  moverOrden(insignia: InsigniaPerfil, direccion: number): void {
    const currentIndex = this.insignias.indexOf(insignia);
    if (currentIndex < 0) return;
    
    // Find next/prev visible badge to swap order with
    let targetIndex = currentIndex + direccion;
    if (targetIndex >= 0 && targetIndex < this.insignias.length) {
      // Basic order swap
      const tempOrden = this.insignias[currentIndex].orden;
      this.insignias[currentIndex].orden = this.insignias[targetIndex].orden;
      this.insignias[targetIndex].orden = tempOrden;

      // Swap in array for UI update
      const temp = this.insignias[currentIndex];
      this.insignias[currentIndex] = this.insignias[targetIndex];
      this.insignias[targetIndex] = temp;
    }
  }

  exportarPDF(): void {
    const elemento = document.getElementById('perfil-exportar');
    if (!elemento) return;

    html2canvas(elemento, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Perfil_Academico.pdf');
    });
  }
}

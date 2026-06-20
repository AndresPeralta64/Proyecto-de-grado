import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioServicio } from '../../../core/servicios/usuario.servicio';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-perfiles-academicos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfiles-academicos.componente.html',
  styleUrl: './perfiles-academicos.componente.css'
})
export class PerfilesAcademicosComponente implements OnInit {
  terminoBusqueda: string = '';
  menuOrdenarAbierto: boolean = false;
  opcionesExpandidas: boolean = true;

  perfiles: any[] = [];
  perfilesFiltrados: any[] = [];

  modalPerfilAbierto: boolean = false;
  cargandoPerfil: boolean = false;
  perfilSeleccionadoDetalle: any = null;

  constructor(private usuarioServicio: UsuarioServicio) {}

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  cargarPerfiles(): void {
    this.usuarioServicio.obtenerPerfilesAcademicosPublicos().subscribe({
      next: (res) => {
        if (res.exito) {
          this.perfiles = res.datos.map((p: any, index: number) => ({ ...p, _index: index }));
          this.perfilesFiltrados = [...this.perfiles];
          this.ordenarPerfilesArray();
        }
      },
      error: (err) => {
        console.error('Error al cargar perfiles académicos', err);
      }
    });
  }

  filtrarPerfiles(): void {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.perfilesFiltrados = [...this.perfiles];
    } else {
      const cleanString = (str: string) =>
        (str || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const cleanQuery = cleanString(this.terminoBusqueda);
      const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 0);

      this.perfilesFiltrados = this.perfiles.filter(perfil => {
        const cleanItem = cleanString(
          (perfil.nombres || '') + ' ' +
          (perfil.apellidos || '') + ' ' +
          (perfil.carrera || '') + ' ' +
          (perfil.correo || '') + ' ' +
          (perfil.cedula || '')
        );
        return queryWords.every(word => cleanItem.includes(word));
      });
    }
    this.ordenarPerfilesArray();
  }

  ordenarPor = {
    fecha: true,
    nombres: false,
    apellidos: false,
    insignias: false
  };

  get mostrarTextoOrdenamiento(): boolean {
    const activeFilters = Object.keys(this.ordenarPor).filter(k => (this.ordenarPor as any)[k]);
    if (activeFilters.length === 1 && activeFilters[0] === 'fecha') return true;
    return false;
  }

  toggleOrdenar(): void {
    this.menuOrdenarAbierto = !this.menuOrdenarAbierto;
  }

  toggleOpciones(): void {
    this.menuOrdenarAbierto = false;
    this.opcionesExpandidas = !this.opcionesExpandidas;
    this.ordenarPerfilesArray();
  }

  toggleFecha(): void {
    this.ordenarPor.fecha = !this.ordenarPor.fecha;
    this.ordenarPerfilesArray();
  }

  toggleNombres(): void {
    this.ordenarPor.nombres = !this.ordenarPor.nombres;
    this.ordenarPerfilesArray();
  }

  toggleApellidos(): void {
    this.ordenarPor.apellidos = !this.ordenarPor.apellidos;
    this.ordenarPerfilesArray();
  }

  toggleInsignias(): void {
    this.ordenarPor.insignias = !this.ordenarPor.insignias;
    this.ordenarPerfilesArray();
  }

  ordenarPerfilesArray(): void {
    const direction = this.opcionesExpandidas ? 1 : -1;
    this.perfilesFiltrados.sort((a, b) => {
      
      if (this.ordenarPor.fecha) {
        const fechaA = a.ultima_actualizacion_perfil ? new Date(a.ultima_actualizacion_perfil).getTime() : 0;
        const fechaB = b.ultima_actualizacion_perfil ? new Date(b.ultima_actualizacion_perfil).getTime() : 0;
        const diff = fechaA - fechaB;
        if (diff !== 0) return diff * direction;
      }

      if (this.ordenarPor.nombres) {
        const comp = (a.nombres || '').localeCompare(b.nombres || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.apellidos) {
        const comp = (a.apellidos || '').localeCompare(b.apellidos || '', 'es', { sensitivity: 'base' });
        if (comp !== 0) return comp * direction;
      }

      if (this.ordenarPor.insignias) {
        const insA = a.n_insignias || 0;
        const insB = b.n_insignias || 0;
        const diff = insA - insB;
        if (diff !== 0) return diff * direction;
      }

      // Fallback: orden de inserción de la base de datos
      return (a._index - b._index) * direction;
    });
  }

  // ── Modal Perfil Detallado ──

  abrirModalPerfil(id: number): void {
    this.cargandoPerfil = true;
    this.modalPerfilAbierto = true;
    this.perfilSeleccionadoDetalle = null;

    this.usuarioServicio.obtenerPerfilAcademicoPublicoPorId(id).subscribe({
      next: (res) => {
        if (res.exito) {
          this.perfilSeleccionadoDetalle = res.datos;
        }
        this.cargandoPerfil = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle del perfil:', err);
        this.cargandoPerfil = false;
        // Podríamos cerrar la modal o mostrar un error
      }
    });
  }

  cerrarModalPerfil(): void {
    this.modalPerfilAbierto = false;
    this.perfilSeleccionadoDetalle = null;
  }

  get insigniasSeleccionadasPorArea(): { area: string, insignias: any[] }[] {
    if (!this.perfilSeleccionadoDetalle || !this.perfilSeleccionadoDetalle.insignias) return [];
    
    const agrupado = new Map<string, any[]>();
    for (const ins of this.perfilSeleccionadoDetalle.insignias) {
      const area = ins.area || 'Sin área';
      if (!agrupado.has(area)) {
        agrupado.set(area, []);
      }
      agrupado.get(area)!.push(ins);
    }
    return Array.from(agrupado.entries()).map(([area, insignias]) => ({ area, insignias }));
  }

  // ── Descarga del perfil académico en PDF ──

  async descargarPerfilAcademico() {
    if (!this.perfilSeleccionadoDetalle) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margenIzq = 20;
    const margenDer = 20;
    const margenInf = 25;
    const anchoUtil = pageWidth - margenIzq - margenDer;
    let y = 0;

    // Colores ESPOCH
    const colorPrimario: [number, number, number] = [139, 0, 0];
    const colorTexto: [number, number, number] = [40, 40, 40];
    const colorTextoClaro: [number, number, number] = [100, 100, 100];
    const colorFondoHeader: [number, number, number] = [255, 255, 255];
    const colorLinea: [number, number, number] = [220, 220, 220];
    const colorVacio: [number, number, number] = [148, 163, 184];

    // ── 1. Banner Superior ──
    const altoHeader = 55;
    doc.setFillColor(...colorFondoHeader);
    doc.rect(0, 0, pageWidth, altoHeader, 'F');

    // Borde inferior rojo para el banner
    doc.setFillColor(...colorPrimario);
    doc.rect(0, altoHeader - 6, pageWidth, 6, 'F');

    // Foto
    const anchoFoto = 38;
    const altoFoto = anchoFoto * (53 / 44);
    const yFoto = (altoHeader - 6 - altoFoto) / 2;
    let imgData: string | null = null;
    let isDefaultIcon = false;

    if (this.perfilSeleccionadoDetalle?.foto_url) {
      try {
        imgData = await this.cargarImagenRecortada(this.perfilSeleccionadoDetalle.foto_url, 44, 53);
      } catch (e) { /* ignorar */ }
    }

    if (!imgData) {
      const svgDefaultPath = 'M11.967 1.752c-2.15.01-4.244.695-5.984 1.957a10.234 10.234 0 0 0-.126 16.493q.075.074.17.12a10.23 10.23 0 0 0 11.95 0a.8.8 0 0 0 .18-.13a10.235 10.235 0 0 0-.172-16.506a10.28 10.28 0 0 0-5.998-1.934zm0 3.76a4.16 4.16 0 0 1 3.878 2.534a4.14 4.14 0 0 1-.882 4.543A4.158 4.158 0 0 1 7.86 9.632a4.15 4.15 0 0 1 1.21-2.898a4.16 4.16 0 0 1 2.897-1.222m4.627 13.92a8.75 8.75 0 0 1-9.245 0a8 8 0 0 1-1.212-.9a7.1 7.1 0 0 1 2.144-2a7.23 7.23 0 0 1 7.382 0a7.1 7.1 0 0 1 2.143 2q-.563.506-1.212.9';
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><path fill="#CBD5E1" d="${svgDefaultPath}"/></svg>`;
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
      imgData = await this.cargarImagenBase64(dataUri);
      isDefaultIcon = true;
    }

    if (isDefaultIcon) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margenIzq, yFoto, anchoFoto, altoFoto, 'FD');
      const iconSize = 20;
      const xIcon = margenIzq + (anchoFoto - iconSize) / 2;
      const yIcon = yFoto + (altoFoto - iconSize) / 2;
      if (imgData) doc.addImage(imgData, 'PNG', xIcon, yIcon, iconSize, iconSize);
    } else if (imgData) {
      doc.addImage(imgData, 'PNG', margenIzq, yFoto, anchoFoto, altoFoto);
    }

    // Nombre
    const nombreCompleto = `${this.perfilSeleccionadoDetalle.nombres || ''} ${this.perfilSeleccionadoDetalle.apellidos || ''}`.trim();
    let fontSizeNombre = 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSizeNombre);
    doc.setTextColor(...colorPrimario);

    const xNombre = margenIzq + anchoFoto + 10;
    const anchoMaximoNombre = pageWidth - xNombre - margenDer;
    let lineasNombre = doc.splitTextToSize(nombreCompleto || 'Sin nombre', anchoMaximoNombre);

    while (lineasNombre.length > 2 && fontSizeNombre > 16) {
      fontSizeNombre -= 2;
      doc.setFontSize(fontSizeNombre);
      lineasNombre = doc.splitTextToSize(nombreCompleto || 'Sin nombre', anchoMaximoNombre);
    }

    const altoLinea = fontSizeNombre * 0.3527;
    const espaciado = altoLinea * 1.2;
    const altoBloque = lineasNombre.length * espaciado;
    let yNombre = (altoHeader - altoBloque) / 2 + altoLinea;

    for (const linea of lineasNombre) {
      doc.text(linea, xNombre, yNombre);
      yNombre += espaciado;
    }

    y = altoHeader + 15;

    // ── 2. Columnas: Sobre mí / Datos personales ──
    let yLeft = y;
    let yRight = y;

    // Columna Izquierda: Sobre mí
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimario);
    doc.text('Descripción', margenIzq, yLeft);
    yLeft += 8;

    if (this.perfilSeleccionadoDetalle?.descripcion && this.perfilSeleccionadoDetalle.descripcion.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colorTexto);
      const lineasDesc = doc.splitTextToSize(this.perfilSeleccionadoDetalle.descripcion.trim(), 90);
      for (const linea of lineasDesc) {
        doc.text(linea, margenIzq, yLeft);
        yLeft += 5;
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colorVacio);
      const lineasDesc = doc.splitTextToSize('El usuario aún no ha redactado su presentación académica.', 90);
      for (const linea of lineasDesc) {
        doc.text(linea, margenIzq, yLeft);
        yLeft += 5;
      }
    }

    // Columna Derecha: Datos personales
    const xRight = 120;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimario);
    doc.text('Datos personales', xRight, yRight);
    yRight += 8;

    const colorPrimarioHex = '#8b0000';
    const obtenerIconoDataURI = (svgPath: string) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24"><path fill="${colorPrimarioHex}" d="${svgPath}"/></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };

    const iconCarrera = 'M12 2L0 9l12 7l10-5.833V17.5h2V9zM3.999 13.49V18a9.99 9.99 0 0 0 8 4A9.99 9.99 0 0 0 20 18v-4.509l-8 4.667z';
    const iconCorreo = 'M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8.263-7.212q.137-.038.262-.113L19.6 8.25q.2-.125.3-.312t.1-.413q0-.5-.425-.75T18.7 6.8L12 11L5.3 6.8q-.45-.275-.875-.012T4 7.525q0 .25.1.438t.3.287l7.075 4.425q.125.075.263.113t.262.037t.263-.037';
    const iconCedula = 'M14 13h5v-2h-5zm0-3h5V8h-5zm-9 6h8v-.55q0-1.125-1.1-1.787T9 13t-2.9.663T5 15.45zm5.413-4.587Q11 10.825 11 10t-.587-1.412T9 8t-1.412.588T7 10t.588 1.413T9 12t1.413-.587M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20z';
    const iconTelefono = 'M21.963 18.855a2.74 2.74 0 0 1-.898 1.47a5.36 5.36 0 0 1-3.848 1.602h-.358a11.4 11.4 0 0 1-4.287-1.082c-.326-.153-.643-.296-1.02-.47A19.8 19.8 0 0 1 7.253 17.1a18.6 18.6 0 0 1-4.012-5.451A11.9 11.9 0 0 1 2.15 8.106a6.5 6.5 0 0 1 .418-3.808a7 7 0 0 1 1.174-1.48a2.3 2.3 0 0 1 1.634-.745a2.54 2.54 0 0 1 1.725.95c.47.52 1.02 1.02 1.52 1.55l.644.634c.38.333.615.802.653 1.306c.001.464-.17.911-.48 1.256a9 9 0 0 1-.622.694l-.215.225a1.15 1.15 0 0 0-.286.418c-.052.154-.07.318-.05.48c.164.444.421.848.755 1.184c.52.704 1.02 1.317 1.582 2.042a13.3 13.3 0 0 0 3.4 2.807c.123.1.27.167.428.194c.14.021.281 0 .408-.062a3.5 3.5 0 0 0 1.021-.826c.36-.444.882-.726 1.45-.787a2.04 2.04 0 0 1 1.46.623q.35.302.663.643l.306.327l.317.306c.193.194.377.368.56.572q.5.43.93.929c.293.374.441.842.418 1.317';

    const datosPerfil: { etiqueta: string, valor: string, iconUrl: string }[] = [];
    if (this.perfilSeleccionadoDetalle?.carrera) datosPerfil.push({ etiqueta: 'Carrera:', valor: this.perfilSeleccionadoDetalle.carrera, iconUrl: obtenerIconoDataURI(iconCarrera) });
    if (this.perfilSeleccionadoDetalle?.correo) datosPerfil.push({ etiqueta: 'Correo:', valor: this.perfilSeleccionadoDetalle.correo, iconUrl: obtenerIconoDataURI(iconCorreo) });
    if (this.perfilSeleccionadoDetalle?.cedula) datosPerfil.push({ etiqueta: 'Cédula:', valor: this.perfilSeleccionadoDetalle.cedula, iconUrl: obtenerIconoDataURI(iconCedula) });
    if (this.perfilSeleccionadoDetalle?.telefono) datosPerfil.push({ etiqueta: 'Teléfono:', valor: this.perfilSeleccionadoDetalle.telefono, iconUrl: obtenerIconoDataURI(iconTelefono) });

    const iconBase64s = await Promise.all(datosPerfil.map(d => this.cargarImagenBase64(d.iconUrl)));

    for (let idx = 0; idx < datosPerfil.length; idx++) {
      const dato = datosPerfil[idx];
      const iconPng = iconBase64s[idx];

      if (iconPng) {
        doc.addImage(iconPng, 'PNG', xRight, yRight - 3.5, 4, 4);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colorTexto);
      doc.text(dato.etiqueta, xRight + 7, yRight);
      const anchoEtiqueta = doc.getTextWidth(dato.etiqueta);

      doc.setFont('helvetica', 'normal');
      doc.text(dato.valor, xRight + 7 + anchoEtiqueta + 2, yRight);
      yRight += 8;
    }

    y = Math.max(yLeft, yRight) + 5;

    // Línea separadora horizontal tipo trapecio
    const h = 3; 
    const slant = 5; 
    doc.setFillColor(...colorPrimario);

    doc.rect(margenIzq + slant, y, pageWidth - margenIzq - margenDer - 2 * slant, h, 'F');
    doc.triangle(margenIzq, y, margenIzq + slant, y, margenIzq + slant, y + h, 'F');
    doc.triangle(pageWidth - margenDer, y, pageWidth - margenDer - slant, y, pageWidth - margenDer - slant, y + h, 'F');

    y += 20;

    // ── 3. Competencias obtenidas ──
    if (y + 20 > pageHeight - margenInf) { doc.addPage(); y = 25; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimario);
    doc.text('Competencias obtenidas', margenIzq, y);
    y += 14;

    const insignias = this.perfilSeleccionadoDetalle.insignias || [];

    if (insignias.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colorVacio);
      doc.text('El usuario aún no ha seleccionado insignias para mostrar.', margenIzq, y);
    } else if (!this.perfilSeleccionadoDetalle.agrupar_insignias) {
      y = await this.dibujarInsigniasEnPDF(doc, insignias, margenIzq, margenDer, margenInf, anchoUtil, y, 'Competencias obtenidas', undefined, colorPrimario);
    } else {
      const grupos = this.insigniasSeleccionadasPorArea;
      for (const grupo of grupos) {
        const altoItemEstimado = 37;
        if (y + 18 + altoItemEstimado > pageHeight - margenInf) {
          doc.addPage();
          y = 25;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(...colorPrimario);
          doc.text('Competencias obtenidas', margenIzq, y);
          y += 14;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...colorTexto);
        doc.text(grupo.area, margenIzq, y);
        y += 3;
        doc.setDrawColor(...colorLinea);
        doc.setLineWidth(0.3);
        doc.line(margenIzq, y, margenIzq + anchoUtil, y);
        y += 8;

        y = await this.dibujarInsigniasEnPDF(
          doc, grupo.insignias, margenIzq, margenDer, margenInf, anchoUtil, y,
          'Competencias obtenidas', grupo.area, colorPrimario
        );
        y += 10;
      }
    }

    // ── 4. Franja inferior (Footer) ──
    const paginas = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFillColor(...colorFondoHeader);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      doc.setFillColor(...colorPrimario);
      doc.rect(0, pageHeight - 15, pageWidth, 2, 'F');
    }

    // Descargar
    doc.save(`Perfil_Academico_${nombreCompleto.replace(/\s+/g, '_') || 'usuario'}.pdf`);
  }

  private async dibujarInsigniasEnPDF(
    doc: jsPDF,
    insignias: any[],
    margenIzq: number,
    margenDer: number,
    margenInf: number,
    anchoUtil: number,
    yInicial: number,
    tituloSeccion: string,
    subtitulo?: string,
    colorPrimario: [number, number, number] = [180, 0, 0]
  ): Promise<number> {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const tamImg = 22;
    const altoTexto = 10;
    const altoItem = tamImg + altoTexto + 5;
    const anchoItem = 38;
    const cols = Math.floor(anchoUtil / anchoItem);
    const espHorizontal = cols > 1 ? (anchoUtil - cols * anchoItem) / (cols - 1) : 0;

    let y = yInicial;
    let col = 0;

    for (const insignia of insignias) {
      if (y + altoItem > pageHeight - margenInf) {
        doc.addPage();
        y = 25;
        col = 0;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...colorPrimario);
        doc.text(tituloSeccion, margenIzq, y);
        y += 14; 

        if (subtitulo) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(subtitulo, margenIzq, y);
          y += 3;
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.line(margenIzq, y, margenIzq + anchoUtil, y);
          y += 8;
        }
      }

      const xItem = margenIzq + col * (anchoItem + espHorizontal);

      try {
        const imgData = await this.cargarImagenBase64(insignia.png_baked_url);
        if (imgData) {
          const xImg = xItem + (anchoItem - tamImg) / 2;
          doc.addImage(imgData, 'PNG', xImg, y, tamImg, tamImg);
        }
      } catch (e) {
        const xImg = xItem + (anchoItem - tamImg) / 2;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.rect(xImg, y, tamImg, tamImg);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      const nombreInsignia = insignia.microcredencial || 'Sin nombre';
      const lineasNombre = doc.splitTextToSize(nombreInsignia, anchoItem - 2);
      const yTexto = y + tamImg + 3;

      const urlPublica = `${window.location.origin}/insignia/${insignia.id_global}`;
      const altoAreaLink = tamImg + 3 + (Math.min(lineasNombre.length, 2) * 3.5);
      doc.link(xItem, y, anchoItem, altoAreaLink, { url: urlPublica });

      for (let i = 0; i < Math.min(lineasNombre.length, 2); i++) {
        doc.text(lineasNombre[i], xItem + anchoItem / 2, yTexto + i * 3.5, { align: 'center' });
      }

      col++;
      if (col >= cols) {
        col = 0;
        y += altoItem;
      }
    }

    if (col > 0) {
      y += altoItem;
    }

    return y;
  }

  private cargarImagenBase64(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      if (!url) { resolve(null); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private cargarImagenRecortada(url: string, ratioAncho: number, ratioAlto: number): Promise<string | null> {
    return new Promise((resolve) => {
      if (!url) { resolve(null); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const targetRatio = ratioAncho / ratioAlto;
          const imgRatio = img.naturalWidth / img.naturalHeight;

          let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

          if (imgRatio > targetRatio) {
            sw = img.naturalHeight * targetRatio;
            sx = (img.naturalWidth - sw) / 2;
          } else {
            sh = img.naturalWidth / targetRatio;
            sy = (img.naturalHeight - sh) / 2;
          }

          const canvas = document.createElement('canvas');
          canvas.width = sw;
          canvas.height = sh;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

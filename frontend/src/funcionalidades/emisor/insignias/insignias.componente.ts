import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emisor-insignias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './insignias.componente.html',
  styleUrls: ['./insignias.componente.css']
})
export class InsigniasEmisorComponente implements OnInit, OnDestroy {
  opcionesExpandidas = true;
  menuMostrarAbierto = false;
  menuOrdenarAbierto = false;
  dropdownLimiteAbierto = false;
  private subscription: Subscription = new Subscription();

  // Estado de Búsqueda
  terminoBusqueda = '';

  // Estado de Paginación
  paginaActual = 1;
  limiteRegistros = 25;

  // Estado de Filtros
  filtros = {
    estados: {
      aprobada: true,
      revocada: true
    }
  };

  // Estado de Ordenamiento
  ordenarPor = {
    receptor: false,
    microcredencial: false,
    duracion: false,
    estado: false,
    fecha: false
  };
  mostrarTextoOrdenamiento = false;

  // Datos mockeados iniciales (esperando la API)
  insignias = [
    { id: 1, receptor: 'NOMBRES APELLIDOS', microcredencial: 'NOMBRE MICROCREDENCIAL', duracion: '64H', estado: 'ACTIVA', fecha: 'DD/MM/AAAA hora' },
    { id: 2, receptor: 'NOMBRES APELLIDOS', microcredencial: 'NOMBRE MICROCREDENCIAL', duracion: '23H', estado: 'REVOCADA', fecha: 'DD/MM/AAAA hora' },
    { id: 3, receptor: 'NOMBRES APELLIDOS', microcredencial: 'NOMBRE MICROCREDENCIAL', duracion: '64H', estado: 'ACTIVA', fecha: 'DD/MM/AAAA hora' },
    { id: 4, receptor: 'NOMBRES APELLIDOS', microcredencial: 'NOMBRE MICROCREDENCIAL', duracion: '23H', estado: 'REVOCADA', fecha: 'DD/MM/AAAA hora' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Getters para filtrado y paginación
  get insigniasFiltradas() {
    let filtradas = this.insignias.filter(ins => {
      // Búsqueda
      const buscar = this.terminoBusqueda.toLowerCase();
      const cumpleBusqueda = ins.receptor.toLowerCase().includes(buscar) || 
                             ins.microcredencial.toLowerCase().includes(buscar);

      // Filtros de estado
      let cumpleEstado = false;
      if (ins.estado === 'ACTIVA' && this.filtros.estados.aprobada) cumpleEstado = true;
      if (ins.estado === 'REVOCADA' && this.filtros.estados.revocada) cumpleEstado = true;

      return cumpleBusqueda && cumpleEstado;
    });

    if (!this.opcionesExpandidas) {
        filtradas = filtradas.reverse();
    }

    return filtradas;
  }

  get insigniasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.limiteRegistros;
    return this.insigniasFiltradas.slice(inicio, inicio + this.limiteRegistros);
  }

  get totalPaginas() {
    return Math.ceil(this.insigniasFiltradas.length / this.limiteRegistros) || 1;
  }

  // Métodos de UI
  toggleMostrar() {
    this.menuMostrarAbierto = !this.menuMostrarAbierto;
    this.menuOrdenarAbierto = false;
  }

  toggleOrdenar() {
    this.menuOrdenarAbierto = !this.menuOrdenarAbierto;
    this.menuMostrarAbierto = false;
  }

  toggleOpciones() {
    this.opcionesExpandidas = !this.opcionesExpandidas;
    this.actualizarTextoOrdenamiento();
  }

  toggleLimite() {
    this.dropdownLimiteAbierto = !this.dropdownLimiteAbierto;
  }

  cambiarLimite(limite: number) {
    this.limiteRegistros = limite;
    this.paginaActual = 1;
    this.dropdownLimiteAbierto = false;
  }

  private actualizarTextoOrdenamiento() {
    const algunOrdenActivo = Object.values(this.ordenarPor).some(val => val);
    this.mostrarTextoOrdenamiento = !algunOrdenActivo;
  }

  // Paginación
  irAPrimeraPagina() {
    this.paginaActual = 1;
  }

  irAPaginaAnterior() {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  irAPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  irAUltimaPagina() {
    this.paginaActual = this.totalPaginas;
  }

  // Acciones (vacías)
  emitirInsignia() {}
  revocarInsignia(item: any) {}
  abrirModalInfo(item: any) {}
  
  trackById(index: number, item: any) {
    return item.id;
  }
}

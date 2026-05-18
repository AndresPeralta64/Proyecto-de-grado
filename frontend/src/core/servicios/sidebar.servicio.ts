import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarServicio {
  readonly expandido = signal(false);
  private cerrarMenusContenidoSource = new Subject<void>();
  cerrarMenusContenido$ = this.cerrarMenusContenidoSource.asObservable();

  toggle(): void {
    this.expandido.update(v => !v);
  }

  cerrarMenusContenido(): void {
    this.cerrarMenusContenidoSource.next();
  }
}

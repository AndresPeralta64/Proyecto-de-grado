import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarServicio {
  readonly expandido = signal(false);

  toggle(): void {
    this.expandido.update(v => !v);
  }
}

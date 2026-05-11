import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServicioToken {

  private readonly claveToken = 'token_autenticacion';

  guardarToken(token: string): void {
    localStorage.setItem(this.claveToken, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.claveToken);
  }

  eliminarToken(): void {
    localStorage.removeItem(this.claveToken);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiraEn = payload.exp * 1000;
      return Date.now() < expiraEn;
    } catch {
      return false;
    }
  }

  obtenerDatosUsuario(): any {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}

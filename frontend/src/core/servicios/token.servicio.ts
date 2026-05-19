import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServicioToken {

  private readonly claveToken = 'token_autenticacion';

  guardarToken(token: string): void {
    localStorage.removeItem('rol_activo');
    localStorage.setItem(this.claveToken, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.claveToken);
  }

  eliminarToken(): void {
    localStorage.removeItem('rol_activo');
    localStorage.removeItem(this.claveToken);
  }

  private decodificarBase64Url(str: string): string {
    try {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      try {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return window.atob(base64);
      } catch {
        return '';
      }
    }
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(this.decodificarBase64Url(token.split('.')[1]));
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
      const payload = JSON.parse(this.decodificarBase64Url(token.split('.')[1]));
      // Si el usuario cambió de rol manualmente, lo sobreescribimos
      const rolActivo = localStorage.getItem('rol_activo');
      if (rolActivo) payload.nombre_rol = rolActivo;
      return payload;
    } catch {
      return null;
    }
  }
}


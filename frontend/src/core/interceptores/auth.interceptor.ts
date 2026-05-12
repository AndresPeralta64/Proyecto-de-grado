import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ServicioToken } from '../servicios/token.servicio';

export const interceptorAutenticacion: HttpInterceptorFn = (req, next) => {
  const servicioToken = inject(ServicioToken);
  const token = servicioToken.obtenerToken();

  if (token) {
    const reqClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqClonada);
  }

  return next(req);
};


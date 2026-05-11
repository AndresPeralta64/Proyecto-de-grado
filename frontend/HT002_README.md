# HT-002: Configuración del proyecto Angular

## Resumen
Se ha configurado el proyecto Angular con arquitectura modular, rutas protegidas por roles, gestión de sesiones con JWT y variables de entorno para desarrollo y producción.

## Estructura implementada

### Variables de entorno
- `environment.ts`: Configuración para desarrollo (localhost:3000)
- `environment.prod.ts`: Configuración para producción (api.espoch.edu.ec)

### Núcleo (core/)
- **Modelos**: Interfaces TypeScript para autenticación (Usuario, Rol, Credenciales, etc.)
- **Servicios**:
  - `ServicioToken`: Gestión de JWT en localStorage
  - `ServicioAutenticacion`: Llamadas HTTP para login, logout, restablecer contraseña
- **Guards**:
  - `GuardiaAutenticacion`: Verifica token válido
  - `GuardiaRol`: Verifica roles del usuario
- **Interceptors**:
  - `InterceptorAutenticacion`: Agrega token Bearer a requests HTTP

### Características (features/)
- **Autenticación**: Componente de login con formulario reactivo
- **Administrador**: Panel básico con placeholder
- **Emisor**: Panel básico con placeholder
- **Receptor**: Panel básico con placeholder

### Compartido (shared/)
- **Componentes**: Página de "No autorizado" (403)

## Rutas configuradas
- `/autenticacion/iniciar-sesion`: Login público
- `/administrador`: Protegido para rol Administrador
- `/emisor`: Protegido para roles Emisor/Administrador
- `/receptor`: Protegido para roles Receptor/Emisor/Administrador
- `/no-autorizado`: Página de error de permisos

## Compatibilidad de navegadores
El proyecto utiliza Angular 17+ que es compatible con:
- Google Chrome (últimas versiones)
- Mozilla Firefox (últimas versiones)
- Microsoft Edge (últimas versiones)

## Próximos pasos
- Implementar backend para endpoints de autenticación
- Agregar funcionalidades específicas por rol
- Implementar manejo de errores global
- Agregar estilos consistentes con Tailwind CSS

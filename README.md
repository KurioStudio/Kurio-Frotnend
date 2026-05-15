# Kurio Frontend

Interfaz del proyecto de fin de grado Kurio, una plataforma para descubrir, publicar y gestionar modelos 3D. Esta aplicación permite navegar por un feed de publicaciones, ver el detalle de cada modelo, interactuar con otros usuarios y autenticarse mediante Firebase.

## Funcionalidades principales

- Inicio con feed de modelos y filtros por destacados, recientes, seguidos y guardados.
- Búsqueda de publicaciones por título.
- Vista de detalle de modelo con galería de imágenes, comentarios, likes, seguimiento de autores y guardado de publicaciones.
- Visor 3D para archivos STL.
- Registro, inicio de sesión y recuperación de contraseña.
- Perfil de usuario con datos y actividad asociada.
- Soporte multilenguaje mediante i18next.

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- Material UI
- Firebase Authentication
- i18next
- Three.js

## Requisitos previos

- Node.js 20 o superior
- npm
- Un proyecto de Firebase configurado
- Un backend compatible con la API usada por la aplicación

## Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto con las variables necesarias.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=
VITE_AUTH_IDLE_HOURS=8
```

3. Inicia el entorno de desarrollo:

```bash
npm run dev
```

## Scripts disponibles

- `npm run dev`: arranca Vite en modo desarrollo.
- `npm run build`: compila el proyecto para producción.
- `npm run lint`: ejecuta ESLint sobre el código.
- `npm run preview`: sirve la versión de producción localmente.

## Rutas principales

- `/`: feed principal de publicaciones.
- `/detalle-modelo/:postId`: detalle de un modelo.
- `/profile` y `/profile/:userId`: perfil propio o de otro usuario.
- `/subir-modelo`: formulario de subida de modelos.
- `/auth/login`: inicio de sesión.
- `/auth/register`: registro de usuario.
- `/auth/forgot-password`: recuperación de contraseña.

## Estructura del proyecto  

- `src/components`: componentes reutilizables de UI.
- `src/features`: pantallas y páginas organizadas por dominio.
- `src/lib`: configuración de servicios externos como Firebase.
- `src/styles`: hojas de estilo globales y por pantalla.
- `src/utils`: utilidades y llamadas a la API.
- `src/i18n`: configuración y traducciones.

## Interfaz
A continuación vamos a enseñar algunas capturas de la interfaz gráfica.

### Login
<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/8f4460f8-868a-4914-b708-bad9acd782ad" />

### Home: 
<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/34627c7a-31ed-4b74-aa09-e526efef56ff" />

### Creación de una publicación:
<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/fff192c9-1c32-4b03-a714-afb2737cede6" />

### Detalles de una publicación:
<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/82925281-d9a1-4dd3-ace5-d41cd3e576cf" />

#### Previsualización de un modelo 3D
<img width="1363" height="934" alt="image" src="https://github.com/user-attachments/assets/00cf8e7f-94d9-4b5b-b84f-f2d39b319e09" />

### Perfil
<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/5b496574-aeef-48ef-bd8e-bd036c247232" />

## Video
Haz click ([en este video](https://1drv.ms/v/c/5e56e3b942125eb5/IQBmFDd6JTaWRpjqTk5UaFNsAdSJLcEA9eWVfdtlF-f5yhU?e=dgL0OJ)) para ver la aplicación funcionando.

## Notas de configuración

- La autenticación depende de Firebase y de la validación de sesión con el backend cuando `VITE_API_BASE_URL` está configurada.
- Si cambias los idiomas o las traducciones, revisa los archivos de `src/i18n/locales`.
- Las vistas de detalle y subida de modelos dependen de datos reales de la API para mostrar publicaciones, comentarios y archivos asociados.

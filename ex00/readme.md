# Unsplash Image Gallery

Este proyecto es una galería de imágenes que utiliza la API de Unsplash para buscar y mostrar fotos. Los usuarios pueden iniciar sesión, dar "like" a las fotos y ver detalles adicionales.

## Requisitos

- Node.js (para ejecutar un servidor local si es necesario)
- Navegador web moderno

## Configuración

1. Clona el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```
2. Abre el archivo script.js y reemplaza las variables CLIENT_SECRET y ACCESS_KEY con tus propias claves de la API de Unsplash:
	```js
	const CLIENT_SECRET = "TU_CLIENT_SECRET";
	const ACCESS_KEY = "TU_ACCESS_KEY";
	```
3. Construye y ejecuta el contenedor Docker:
	```bash
	docker build -t unsplash-gallery .
	docker run -p 5500:5500 unsplash-gallery
	```
4. Abre tu navegador y navega a http://localhost:5500/index.html.
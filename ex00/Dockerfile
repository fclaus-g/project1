# Usar una imagen base oficial de Node.js
FROM python:3.9-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 5500

# Comando para ejecutar la aplicación
CMD ["python3", "-m", "http.server", "5500"]
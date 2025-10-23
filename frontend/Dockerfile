FROM node:22-alpine

WORKDIR /app

# Copiar archivos de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 5173

# Ejecutar el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host"]


# Build stage
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Argumentos en tiempo de construcción para la URL de la API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve stage
FROM nginx:alpine
# Copiamos la build de Vite al directorio público de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 dentro del contenedor
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

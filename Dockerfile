FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Копируем статические файлы
COPY --from=build /app/build /usr/share/nginx/html
# Копируем наш конфиг
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
# Полностью обходим entrypoint скрипты
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
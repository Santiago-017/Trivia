FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ CLAVE para @angular/build:application
COPY --from=build /app/dist/TriviaQuiz/browser /usr/share/nginx/html

EXPOSE 80

# BUILD - Compila la aplicacion de React/Vite
FROM node:20-slim AS build

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci

COPY . /app

ARG FRONTEND_URL
ARG API_BASE_URL
ARG AUTH0_DOMAIN
ARG AUTH0_CLIENT_ID
ARG AUTH0_AUDIENCE
ARG AUTH0_SCOPE

RUN FRONTEND_URL=$FRONTEND_URL \
    API_BASE_URL=$API_BASE_URL \
    AUTH0_DOMAIN=$AUTH0_DOMAIN \
    AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID \
    AUTH0_AUDIENCE=$AUTH0_AUDIENCE \
    AUTH0_SCOPE=$AUTH0_SCOPE \
    npm run build

# Nginx
FROM nginx:alpine

COPY server.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
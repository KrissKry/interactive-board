#stage 1 node build to pack it all up
FROM node:14.17.2 AS nodebuilder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

ARG API_HTTP=https://localhost:1337
ARG API_WSS=wss://localhost:1337

ENV REACT_APP_API_HTTP=$API_HTTP
ENV REACT_APP_API_WEBSOCKET=$API_WSS

COPY . ./
RUN npm run build


#stage 2 use that npm boi and display stuff with nginx
FROM nginx:1.21.4

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=nodebuilder /app/build .

EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
#stage 1 node build to pack it all up
FROM node:14.17.2 AS nodebuilder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --silent

COPY . ./
RUN npm run build:prod

#stage 2 use that npm boi to extract built static files and make em ready to be served with nginx
FROM nginx:1.21.4-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=nodebuilder /app/build .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
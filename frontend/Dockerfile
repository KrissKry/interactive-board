#stage 1 node build to pack it all up
FROM node:14.17.2 AS nodebuilder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --silent

COPY . ./
RUN npm run build


#stage 2 use that npm boi to extract built static files and make em ready to be served with nginx
FROM nginx:1.21.4-alpine

WORKDIR /usr/share/nginx/html

RUN apk add --no-cache jq
RUN rm -rf ./*

COPY --from=nodebuilder /app/build .
COPY docker_entrypoint.sh /
COPY gen_config.sh /

RUN chmod +x /docker_entrypoint.sh /gen_config.sh

EXPOSE 80
ENTRYPOINT ["/docker_entrypoint.sh"]
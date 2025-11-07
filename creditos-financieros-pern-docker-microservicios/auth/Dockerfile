FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# netcat will be used to wait for postgres to be ready before running migrations
RUN apk add --no-cache netcat-openbsd
COPY . .
EXPOSE 4000
CMD sh -c 'until nc -z ${DB_HOST:-db_auth} ${DB_PORT:-5432}; do echo "Esperando a la BD ${DB_HOST:-db_auth}:${DB_PORT:-5432}..."; sleep 2; done; echo "BD disponible, ejecutando migraciones..."; npm run migrate && npm start'

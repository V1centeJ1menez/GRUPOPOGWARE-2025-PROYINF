FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD sh -c 'npm run wait-for-db && npm run migrate && npm start'

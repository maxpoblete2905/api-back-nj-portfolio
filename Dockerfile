FROM node:18.16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=8080
EXPOSE $PORT

CMD ["node", "dist/main"]
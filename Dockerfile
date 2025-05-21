FROM node:18.16-alpine as builder

RUN apk upgrade --update \
  && apk add --no-cache git \
  && mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install \
  && npm run build

FROM node:18.16-alpine

ENV TZ='America/Santiago'
RUN apk upgrade --update \
  && apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone \
  && apk del tzdata

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENV PORT=3000
EXPOSE $PORT

CMD ["node", "dist/main"]
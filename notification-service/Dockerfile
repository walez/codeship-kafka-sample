FROM node:slim

# File Author / Maintainer
MAINTAINER martinsadewalehakeem@gmail.com

ENV WITH_SASL 0

COPY package.json .

RUN apt-get update \
    && apt-get install -y build-essential \
    python \
    libssl-dev \
    && npm install

WORKDIR /usr/src/app

COPY . .

CMD node index.js
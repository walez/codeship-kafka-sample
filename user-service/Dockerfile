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
    # && apt-get purge -y build-essential python \
    # && apt-get autoremove -y && apt-get autoclean -y \
    # && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . .

CMD node index.js
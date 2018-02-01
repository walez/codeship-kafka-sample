FROM node:slim

# File Author / Maintainer
MAINTAINER martinsadewalehakeem@gmail.com

COPY package.json .

RUN npm install

WORKDIR /usr/src/app

COPY . .

CMD node index.js
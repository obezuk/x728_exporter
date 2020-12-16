FROM node:14-alpine

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python2 && \
    npm install --quiet node-gyp -g

COPY package.json ./
COPY package-lock.json ./

RUN npm ci && \
    apk del native-deps

WORKDIR /usr/src/app

RUN npm install

COPY . .

EXPOSE 9827

CMD [ "node", "index.js" ]
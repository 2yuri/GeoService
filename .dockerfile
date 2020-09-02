FROM node:12
WORKDIR /usr/src/app

COPY . . 
RUN npm install

EXPOSE 3008

CMD [ "node", "server.js" ]
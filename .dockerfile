FROM node:12.18.3
WORKDIR /usr/src/app

COPY . . 
RUN npm install

EXPOSE 3008

CMD [ "npm run dev" ]
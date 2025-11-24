FROM node:18.18-alpine
WORKDIR /bookstore-app
COPY package.json .
RUN npm install
COPY . .
CMD npm start
FROM node:16.5.0-alpine

# Create app directory
WORKDIR /usr/src/app
EXPOSE 3000
COPY . /usr/src/app/
RUN npm install -g npm@8.7.0
RUN npm install && npm run build
CMD [ "npm","run","start"]

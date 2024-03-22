# build stage
FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist

COPY package*.json ./

# Copy the wait-for-it.sh and startup.sh scripts
# COPY wait-for-it.sh startup.sh ./
# Make sure startup.sh is executable
# RUN chmod +x ./startup.sh

RUN npm install --only=production

RUN rm package*.json

EXPOSE 3333

CMD ["node", "dist/main"]
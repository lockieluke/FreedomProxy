FROM node:20

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN cd /app && echo 'YARN VERSION IN BUILDER: ' && yarn --version

RUN corepack enable
RUN corepack install --global yarn@canary

ENV NODE_ENV=production

ARG VITE_ENDPOINT="http://googleos-services.webhop.me:8080"
ARG VITE_WS_ENDPOINT="ws://googleos-services.webhop.me:8080"

RUN yarn install

COPY . ./
RUN yarn build:server
RUN yarn build:runtime
RUN yarn build:web

EXPOSE 8080
CMD ["yarn", "start"]

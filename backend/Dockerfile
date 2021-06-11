FROM node:16.3.0
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY . .
CMD ["node", "index.js"]

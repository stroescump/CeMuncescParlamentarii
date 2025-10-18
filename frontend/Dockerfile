FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
CMD ["npm", "run", "dev"]
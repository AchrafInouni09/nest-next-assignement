FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --include=dev
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3001
CMD ["node", "dist/main.js"]

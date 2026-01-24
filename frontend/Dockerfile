FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
# install dev deps so prisma CLI is available to generate client during build
RUN npm install --include=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]

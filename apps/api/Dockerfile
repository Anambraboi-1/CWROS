FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/cwros.db
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
VOLUME ["/app/data"]
EXPOSE 4000
CMD ["node", "dist/server.js"]

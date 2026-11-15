# Stage 1: production build (minified, tree-shaken, hashed file names)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build

# Stage 2: only the built app + the SSR server (also proxies /api to the backend)
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4200
COPY --from=build /app/dist/frontend-TerraBeegle ./dist/frontend-TerraBeegle
EXPOSE 4200
CMD ["node", "dist/frontend-TerraBeegle/server/server.mjs"]

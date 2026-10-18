FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json bun.lock* .npmrc* ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy application source code
COPY . .

# Build frontend production bundle
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors and install production dependencies
COPY package*.json .npmrc* ./
RUN npm install --omit=dev && npm install -g tsx

# Copy built frontend assets and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/data ./data
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Run server with tsx
CMD ["tsx", "server.ts"]

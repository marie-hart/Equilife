# Build stage
FROM node:20-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN yarn install --frozen-lockfile 2>/dev/null || npm ci

COPY . .
RUN yarn build 2>/dev/null || npm run build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

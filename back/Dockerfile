FROM node:20-alpine

# Enable corepack for yarn support (yarn is available via corepack in Node.js 20+)
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]

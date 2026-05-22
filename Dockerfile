# Stage 1: Build the module
FROM node:22-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 4 support
RUN corepack enable

# Copy dependency manifests first for better layer caching
COPY package.json .yarnrc.yml yarn.lock ./

# Install all dependencies
RUN yarn install --immutable

# Copy source code and companion metadata
COPY src/ ./src/
COPY companion/ ./companion/

# Package the module — produces <module-id>-<version>.tgz + pkg/ directory
RUN yarn package

# Stage 2: Export only the build artifacts
FROM scratch AS export
COPY --from=builder /app/*.tgz /

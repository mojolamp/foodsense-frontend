# FoodSense Frontend - Production Dockerfile
# Optimized for AWS ECS/App Runner deployment

# Stage 1: Dependencies (including devDependencies for build)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# Install all dependencies including devDependencies for build
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_V1_BASE
ARG NEXT_PUBLIC_API_V2_BASE
ARG NEXT_PUBLIC_LAWCORE_BASE
ARG NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=true
ARG NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS=false

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_V1_BASE=$NEXT_PUBLIC_API_V1_BASE
ENV NEXT_PUBLIC_API_V2_BASE=$NEXT_PUBLIC_API_V2_BASE
ENV NEXT_PUBLIC_LAWCORE_BASE=$NEXT_PUBLIC_LAWCORE_BASE
ENV NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED=$NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED
ENV NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS=$NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS

# Build the application (skip prebuild/scope-guard in Docker)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
# Note: public directory may be empty but must exist for COPY
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

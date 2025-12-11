FROM oven/bun:1.2-debian AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Use Node.js for build (Bun has compatibility issues with Next.js 16 Turbopack)
FROM node:20-slim AS build
WORKDIR /app
COPY --from=prerelease /app ./
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npm run build

FROM base AS release
WORKDIR /app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static/
COPY --from=build /app/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="localhost"
ENV NETWORK="0.0.0.0"
CMD ["bun", "server.js"]


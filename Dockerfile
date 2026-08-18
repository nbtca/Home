FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store HUSKY=0 pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN grep -q 'bg-content1' dist/_astro/*.css \
  || { echo "ERROR: no HeroUI utility classes in the CSS bundle; check .npmrc hoisting"; exit 1; }

FROM nginx:alpine AS deploy
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

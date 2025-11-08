FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash libc6-compat

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --filter @fontbox/web... --recursive
RUN pnpm --filter @fontbox/web build

COPY docker/entrypoints/web.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]

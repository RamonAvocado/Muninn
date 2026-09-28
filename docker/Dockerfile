FROM oven/bun:1 AS deps
WORKDIR /home/bun/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /home/bun/app
COPY --from=deps /home/bun/app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /home/bun/app
ENV NODE_ENV=production

COPY --chown=bun:bun --from=builder /home/bun/app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /home/bun/app/.next ./.next
COPY --chown=bun:bun --from=builder /home/bun/app/public ./public
COPY --chown=bun:bun --from=builder /home/bun/app/package.json ./package.json
COPY --chown=bun:bun --from=builder /home/bun/app/next.config.ts ./next.config.ts
COPY --chown=bun:bun --from=builder /home/bun/app/drizzle ./drizzle
COPY --chown=bun:bun --from=builder /home/bun/app/scripts ./scripts
COPY --chown=bun:bun --from=builder /home/bun/app/db ./db

RUN chown bun:bun /home/bun/app

USER bun
EXPOSE 3000
CMD ["sh", "-c", "bun run db:migrate && bun run start"]

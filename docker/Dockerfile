FROM oven/bun:1 AS deps
WORKDIR /home/bun/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /home/bun/app
COPY --from=deps /home/bun/app/node_modules ./node_modules
COPY . .
# bun run build (not next build directly): some pages query the DB at build
# time for static generation, so the prebuild hook's db:migrate must run
# first. The sqlite.db this creates stays in this builder stage only.
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

# WORKDIR creates /home/bun/app as root before the COPY --chown lines above
# run, and --chown only applies to the files/dirs it copies in — the
# directory entry itself stays root-owned, which blocks the bun user from
# writing sqlite.db's journal/WAL sidecar files. Fix that explicitly.
RUN chown bun:bun /home/bun/app

USER bun
EXPOSE 3000
CMD ["sh", "-c", "bun run db:migrate && bun run start"]

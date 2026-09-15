# ---- Build stage ----
FROM node:20 AS builder

WORKDIR /app

# Ativa suporte ao pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia manifestos primeiro para otimizar cache
COPY pnpm-lock.yaml package.json ./

# Instala dependências completas (dev + prod)
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Compila a aplicação Strapi (admin build)
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-slim

WORKDIR /app

# Habilita pnpm também na imagem final
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia artefatos compilados e node_modules do estágio builder
COPY --from=builder /app ./

# Instala apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

EXPOSE 1337

CMD ["pnpm", "start"]

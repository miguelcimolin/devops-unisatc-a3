# Etapa 1: build da aplicação
FROM node:20 AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala todas as dependências (incluindo dev)
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Compila a aplicação (Strapi build, por exemplo)
RUN npm run build

# Etapa 2: imagem final de produção
FROM node:20-slim

WORKDIR /app

# Copia arquivos da etapa de build
COPY --from=builder /app ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Expõe a porta da aplicação
EXPOSE 1337

# Comando para iniciar o Strapi
CMD ["npm", "run", "start"]

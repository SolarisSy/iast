# ===========================================
# DOCKERFILE - BACKEND NODE.JS
# ===========================================

# Usar imagem oficial do Node.js (Alpine para menor tamanho)
FROM node:20-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    wget

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm install; \
    fi

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads logs

# Expor porta
EXPOSE 4000

# Definir variável de ambiente
ENV PORT=4000

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

# Comando para iniciar o servidor
CMD ["npm", "start"]


# 🏗️ Arquitetura Docker - Projeto IAST

Visão geral da arquitetura de containers do projeto.

---

## 📊 **Diagrama de Arquitetura**

```
┌─────────────────────────────────────────────────────────────┐
│                         DOCKER HOST                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              REDE: iast-network (bridge)              │ │
│  │                                                       │ │
│  │  ┌─────────────────────┐   ┌─────────────────────┐  │ │
│  │  │   FRONTEND          │   │   BACKEND           │  │ │
│  │  │   (Next.js)         │   │   (Node.js/Express) │  │ │
│  │  │                     │   │                     │  │ │
│  │  │  Container:         │   │  Container:         │  │ │
│  │  │  iast-frontend      │   │  iast-backend       │  │ │
│  │  │                     │   │                     │  │ │
│  │  │  Port: 3001         │───▶  Port: 4000        │  │ │
│  │  │  Node: 20-alpine    │   │  Node: 20-alpine   │  │ │
│  │  │                     │   │                     │  │ │
│  │  │  Volumes:           │   │  Volumes:           │  │ │
│  │  │  • ./src            │   │  • ./backend        │  │ │
│  │  │  • ./public         │   │  • ./src/corpus     │  │ │
│  │  │  • node_modules     │   │  • node_modules     │  │ │
│  │  │  • .next/           │   │  • uploads/         │  │ │
│  │  └─────────────────────┘   └─────────────────────┘  │ │
│  │           │                          │               │ │
│  └───────────┼──────────────────────────┼───────────────┘ │
│              │                          │                 │
└──────────────┼──────────────────────────┼─────────────────┘
               │                          │
        ┌──────▼────────┐         ┌──────▼────────┐
        │   Browser     │         │  OpenAI API   │
        │ localhost:3001│         │  (External)   │
        └───────────────┘         └───────────────┘
```

---

## 🔄 **Fluxo de Comunicação**

### **1. Requisição do Usuário:**
```
User Browser → http://localhost:3001 (Frontend)
```

### **2. API Request:**
```
Frontend → http://backend:4000/api/* (Interno - Docker Network)
```

### **3. Backend Processing:**
```
Backend → OpenAI API (Externo)
Backend → Vector Store (Local)
Backend → Corpus Files (Volume montado)
```

### **4. Resposta:**
```
Backend → Frontend → User Browser
```

---

## 📦 **Estrutura de Containers**

### **Frontend Container (iast-frontend)**

| Componente | Detalhes |
|------------|----------|
| **Imagem Base** | `node:20-alpine` |
| **Build Stage** | Multi-stage (deps → builder → dev/prod) |
| **Porta Exposta** | 3001 |
| **Volumes** | `./src`, `./public`, `node_modules`, `.next` |
| **Comando Dev** | `npm run dev` |
| **Comando Prod** | `node server.js` |
| **Hot Reload** | ✅ Sim (dev) |
| **Health Check** | HTTP GET localhost:3001 |

### **Backend Container (iast-backend)**

| Componente | Detalhes |
|------------|----------|
| **Imagem Base** | `node:20-alpine` |
| **Dependências** | Python3, Make, G++, Cairo |
| **Porta Exposta** | 4000 |
| **Volumes** | `./backend`, `./src/corpus`, `uploads`, `node_modules` |
| **Comando** | `npm start` |
| **Health Check** | HTTP GET localhost:4000/health |
| **API Endpoint** | `/health`, `/api/chat`, `/api/audio/*` |

---

## 💾 **Volumes e Persistência**

### **Volumes Nomeados (Desenvolvimento):**

| Volume | Propósito | Tamanho Típico |
|--------|-----------|----------------|
| `frontend-node-modules` | Dependências npm do frontend | ~200MB |
| `frontend-next` | Cache e build do Next.js | ~50MB |
| `backend-node-modules` | Dependências npm do backend | ~150MB |
| `backend-uploads` | Arquivos de áudio temporários | Variável |

### **Bind Mounts (Desenvolvimento):**

| Host | Container | Modo |
|------|-----------|------|
| `./src` | `/app/src` | RW |
| `./backend` | `/app` | RW |
| `./src/corpus` | `/app/corpus` | RO |
| `./public` | `/app/public` | RW |

---

## 🌐 **Configuração de Rede**

### **Rede: iast-network (bridge)**

```yaml
Driver: bridge
Subnet: Auto (172.x.x.x/16)
Gateway: Auto

Containers conectados:
├── iast-frontend (IP dinâmico)
└── iast-backend (IP dinâmico)

DNS interno:
├── frontend → resolvido para container IP
└── backend → resolvido para container IP
```

**Benefícios:**
- ✅ Isolamento de rede
- ✅ DNS automático entre containers
- ✅ Comunicação interna rápida
- ✅ Não expõe portas desnecessárias

---

## 🔐 **Variáveis de Ambiente**

### **Frontend (.env.docker):**
```bash
NEXT_PUBLIC_API_URL=http://backend:4000  # Interno
PORT=3001
NODE_ENV=development
```

### **Backend (.env.docker):**
```bash
OPENAI_API_KEY=sk-proj-***
PORT=4000
NODE_ENV=development
```

---

## 🚀 **Modos de Execução**

### **Desenvolvimento (`docker-compose.yml`):**
```yaml
Características:
✅ Hot-reload ativado
✅ Source code mapeado (volumes)
✅ Logs detalhados
✅ Comando: npm run dev (frontend) / npm start (backend)
✅ Rebuild rápido
```

### **Produção (`docker-compose.prod.yml`):**
```yaml
Características:
✅ Build otimizado (standalone)
✅ Sem hot-reload
✅ Tamanho reduzido
✅ Health checks ativos
✅ Restart automático (always)
✅ Usuário não-root (nextjs)
```

---

## 📈 **Performance e Otimização**

### **Build Multi-Stage (Frontend):**
```
Stage 1: base        → Node.js Alpine base
Stage 2: deps        → Instala dependências
Stage 3: builder     → Build de produção
Stage 4: development → Runtime dev
Stage 5: production  → Runtime prod (otimizado)
```

**Benefícios:**
- 🚀 Imagens finais menores (< 200MB)
- 🚀 Cache de layers eficiente
- 🚀 Separação de dependências dev/prod

### **Cache de Dependências:**
```dockerfile
# Copia apenas package.json primeiro
COPY package.json package-lock.json* ./
RUN npm ci

# Depois copia o código (evita reinstalar deps)
COPY . .
```

---

## 🛠️ **Health Checks**

### **Backend Health Endpoint:**
```bash
GET http://localhost:4000/health

Response:
{
  "status": "ok",
  "timestamp": "2025-10-21T12:00:00.000Z",
  "service": "iast-backend",
  "version": "1.0.0"
}
```

### **Docker Health Check:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🔍 **Monitoramento**

### **Comandos Úteis:**

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Uso de recursos
docker stats

# Inspecionar container
docker inspect iast-frontend
docker inspect iast-backend

# Rede
docker network inspect iast-network
```

---

## 🎯 **Comparação: Docker vs Local**

| Aspecto | Docker | Local |
|---------|--------|-------|
| **Setup** | Automatizado | Manual |
| **Dependências** | Isoladas | Sistema global |
| **Portabilidade** | Alta | Baixa |
| **Consistência** | Garantida | Variável |
| **Performance** | ~95% nativa | 100% nativa |
| **Hot Reload** | ✅ Sim | ✅ Sim |
| **Cleanup** | Fácil (`down -v`) | Manual |

---

## 🌍 **Deploy Recomendado**

### **Desenvolvimento Local:**
```bash
docker-compose up
```

### **Staging/Testing:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### **Produção:**
- **Opção 1**: Docker Swarm / Kubernetes
- **Opção 2**: AWS ECS + ECR
- **Opção 3**: Google Cloud Run
- **Opção 4**: Azure Container Instances
- **Opção 5**: DigitalOcean App Platform

---

## 📚 **Referências**

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Projeto IAST - Arquitetura Docker Completa** 🐳


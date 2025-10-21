# 🐳 Guia Docker - Projeto IAST

Este guia explica como usar Docker e Docker Compose para executar o projeto IAST.

---

## 📋 **Pré-requisitos**

1. **Docker Desktop** instalado:
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: https://docs.docker.com/engine/install/

2. **Docker Compose** (já incluído no Docker Desktop)

3. **Chave API da OpenAI**

---

## 🚀 **Início Rápido**

### **Opção 1: Script Automatizado (Recomendado)**

#### **Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

#### **Linux/Mac (Bash):**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### **Opção 2: Manual**

#### **1. Configurar variáveis de ambiente:**
```bash
# Copiar arquivo de exemplo
cp env.docker.example .env.docker

# Editar e adicionar sua OPENAI_API_KEY
# Abra .env.docker e adicione:
OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

#### **2. Iniciar em modo desenvolvimento:**
```bash
docker-compose up --build
```

#### **3. Iniciar em modo produção:**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

---

## 📦 **Estrutura de Containers**

O projeto utiliza 2 containers:

| Container | Porta | Descrição |
|-----------|-------|-----------|
| `iast-frontend` | 3001 | Next.js (Frontend) |
| `iast-backend` | 4000 | Node.js + Express (Backend) |

---

## 🔧 **Comandos Úteis**

### **Iniciar containers:**
```bash
docker-compose up
```

### **Iniciar em background (detached):**
```bash
docker-compose up -d
```

### **Parar containers:**
```bash
docker-compose down
```

### **Rebuild completo (após mudanças):**
```bash
docker-compose up --build
```

### **Ver logs:**
```bash
# Todos os containers
docker-compose logs -f

# Container específico
docker-compose logs -f frontend
docker-compose logs -f backend
```

### **Verificar status:**
```bash
docker-compose ps
```

### **Executar comandos dentro do container:**
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### **Limpar tudo (containers, volumes, imagens):**
```bash
docker-compose down -v --rmi all
```

---

## 🌐 **Acessando a Aplicação**

Após iniciar os containers:

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## 📂 **Volumes e Persistência**

### **Volumes Criados:**

| Volume | Propósito |
|--------|-----------|
| `frontend-node-modules` | Dependências do frontend |
| `frontend-next` | Cache do Next.js |
| `backend-node-modules` | Dependências do backend |
| `backend-uploads` | Arquivos de áudio enviados |

### **Mapeamentos de Diretórios:**

Em **desenvolvimento**, os seguintes diretórios são mapeados para hot-reload:
- `./src` → `/app/src` (frontend)
- `./backend` → `/app` (backend)
- `./src/corpus` → `/app/corpus` (backend, read-only)

---

## 🔄 **Diferenças entre Desenvolvimento e Produção**

### **Desenvolvimento (`docker-compose.yml`):**
- ✅ Hot-reload habilitado
- ✅ Código-fonte mapeado (volumes)
- ✅ Logs detalhados
- ✅ Ideal para desenvolvimento local

### **Produção (`docker-compose.prod.yml`):**
- ✅ Build otimizado
- ✅ Sem hot-reload
- ✅ Imagens menores
- ✅ Health checks configurados
- ✅ Restart automático

---

## 🐛 **Troubleshooting**

### **1. Erro: "Cannot connect to Docker daemon"**
**Solução:**
- Verifique se o Docker Desktop está rodando
- Windows: Inicie o Docker Desktop
- Linux: `sudo systemctl start docker`

### **2. Erro: "Port already in use"**
**Solução:**
```bash
# Parar containers conflitantes
docker-compose down

# Ou mudar as portas no docker-compose.yml:
ports:
  - "3002:3001"  # Frontend na porta 3002
  - "4001:4000"  # Backend na porta 4001
```

### **3. Erro: "OPENAI_API_KEY not found"**
**Solução:**
- Verifique se `.env.docker` existe
- Confirme que `OPENAI_API_KEY` está preenchida
- Reinicie os containers: `docker-compose restart`

### **4. Containers não param:**
```bash
docker-compose down --remove-orphans
```

### **5. Rebuild completo (limpar cache):**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### **6. Ver logs de erros:**
```bash
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
```

---

## 🔐 **Segurança**

### **Arquivos que NÃO devem ser commitados:**
- `.env.docker` (contém chaves API)
- `backend/.env`
- `.env.local`

### **Arquivos que DEVEM ser commitados:**
- `env.docker.example` (template)
- `docker-compose.yml`
- `Dockerfile.frontend`
- `backend/Dockerfile`

---

## 🚢 **Deploy em Produção**

### **Opção 1: Docker Compose (VPS/Servidor)**
1. Copie os arquivos para o servidor
2. Configure `.env.docker` com variáveis de produção
3. Execute: `docker-compose -f docker-compose.prod.yml up -d`

### **Opção 2: Plataformas Cloud**
- **AWS**: ECS + ECR
- **Google Cloud**: Cloud Run
- **Azure**: Container Instances
- **DigitalOcean**: App Platform

### **Opção 3: Kubernetes**
- Use os Dockerfiles como base
- Crie manifests K8s (Deployment, Service, Ingress)

---

## 📊 **Monitoramento**

### **Health Checks:**
```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3001
```

### **Status dos containers:**
```bash
docker-compose ps
```

### **Uso de recursos:**
```bash
docker stats
```

---

## 🎯 **Melhores Práticas**

1. ✅ Use `.env.docker` para variáveis de ambiente
2. ✅ Sempre execute `docker-compose down` antes de fazer pull de código
3. ✅ Use volumes nomeados para persistência
4. ✅ Faça rebuild após mudanças em dependências:
   ```bash
   docker-compose up --build
   ```
5. ✅ Monitore logs regularmente:
   ```bash
   docker-compose logs -f
   ```
6. ✅ Limpe recursos não utilizados periodicamente:
   ```bash
   docker system prune -a
   ```

---

## 📚 **Recursos Adicionais**

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Next.js Docker Docs](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 🆘 **Suporte**

Problemas com Docker? Verifique:
1. Logs dos containers: `docker-compose logs`
2. Status: `docker-compose ps`
3. Variáveis de ambiente: `.env.docker`
4. Portas disponíveis: `netstat -ano | findstr :3001` (Windows)

---

**Projeto IAST - Sistema de IA com Audio e Chat** 🚀


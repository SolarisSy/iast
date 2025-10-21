# 🚀 Quick Start - Docker

Guia rápido para iniciar o projeto IAST com Docker em 3 passos!

---

## ⚡ **3 Passos Simples**

### **1️⃣ Configure a API Key**

```bash
# Copie o arquivo de exemplo
cp env.docker.example .env.docker

# Edite e adicione sua chave da OpenAI
# OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

### **2️⃣ Inicie o Docker**

**Windows:**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Ou com Make:**
```bash
make dev
```

### **3️⃣ Acesse a Aplicação**

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

---

## 🎯 **Comandos Essenciais**

```bash
# Iniciar (desenvolvimento)
docker-compose up

# Iniciar em background
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

---

## 🆘 **Problemas Comuns**

### **❌ "Cannot connect to Docker daemon"**
➜ Inicie o Docker Desktop

### **❌ "Port already in use"**
➜ Execute: `docker-compose down`

### **❌ "OPENAI_API_KEY not found"**
➜ Verifique o arquivo `.env.docker`

---

## 📚 **Documentação Completa**

Para mais detalhes, veja: **[DOCKER.md](./DOCKER.md)**

---

**Pronto! Seu projeto está rodando! 🎉**


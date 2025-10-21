# 🔧 Docker Troubleshooting - Projeto IAST

Guia de resolução de problemas comuns do Docker.

---

## ⚠️ **Problemas Resolvidos**

### **1. Warning: "version is obsolete"**

**Problema:**
```
level=warning msg="the attribute `version` is obsolete"
```

**Solução:**
✅ **Removido** a linha `version: '3.8'` dos arquivos Docker Compose.

O Docker Compose v2+ não requer mais a declaração de versão.

---

### **2. Warning: "OPENAI_API_KEY variable is not set"**

**Problema:**
```
level=warning msg="The \"OPENAI_API_KEY\" variable is not set. Defaulting to a blank string."
```

**Solução:**
✅ **Configurado** validação obrigatória no `docker-compose.yml`:
```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY:?OPENAI_API_KEY is required}
```

**Como corrigir:**

1. **Criar arquivo `.env.docker`:**
   ```bash
   cp env.docker.example .env.docker
   ```

2. **Editar e adicionar sua chave:**
   ```bash
   OPENAI_API_KEY=sk-proj-sua-chave-real-aqui
   ```

3. **Iniciar com o arquivo de ambiente:**
   ```bash
   docker-compose --env-file .env.docker up
   ```

---

### **3. Warning: "container_name might cause conflicts"**

**Problema:**
```
container_name is used in backend. It might cause conflicts with other services.
container_name is used in frontend. It might cause conflicts with other services.
```

**Solução:**
✅ **Removido** `container_name` de ambos os arquivos Docker Compose.

**Antes:**
```yaml
services:
  frontend:
    container_name: iast-frontend  # ❌ Pode causar conflitos
```

**Depois:**
```yaml
services:
  frontend:
    # Container name será gerado automaticamente: iast-frontend-1
```

**Benefícios:**
- ✅ Permite múltiplas instâncias do mesmo projeto
- ✅ Evita conflitos de nome
- ✅ Facilita escalonamento

---

### **4. Warning: "ports might cause conflicts"**

**Problema:**
```
ports is used in backend. It might cause conflicts with other services.
ports is used in frontend. It might cause conflicts with other services.
```

**Solução:**
✅ **Portas configuráveis** via variáveis de ambiente:

**Antes:**
```yaml
ports:
  - "3001:3001"  # ❌ Porta fixa
```

**Depois:**
```yaml
ports:
  - "${FRONTEND_PORT:-3001}:3001"  # ✅ Porta configurável
```

**Como usar portas customizadas:**

Edite `.env.docker`:
```bash
FRONTEND_PORT=3002  # Muda frontend para porta 3002
BACKEND_PORT=4001   # Muda backend para porta 4001
```

---

## 🛠️ **Outros Problemas Comuns**

### **5. "Cannot connect to Docker daemon"**

**Problema:**
```
Error response from daemon: Cannot connect to the Docker daemon
```

**Soluções:**

**Windows:**
1. Abra o Docker Desktop
2. Aguarde até o ícone ficar verde
3. Tente novamente

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

**Verificar status:**
```bash
docker info
```

---

### **6. "Port already in use"**

**Problema:**
```
Error: bind: address already in use
```

**Soluções:**

**Opção 1: Parar containers conflitantes**
```bash
docker-compose down
```

**Opção 2: Usar portas diferentes**

Edite `.env.docker`:
```bash
FRONTEND_PORT=3002
BACKEND_PORT=4001
```

**Opção 3: Identificar processo usando a porta**

**Windows:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :3001
kill -9 <PID>
```

---

### **7. "Build context is too large"**

**Problema:**
```
Sending build context to Docker daemon...
```

**Solução:**
✅ Verificar se `.dockerignore` está presente e configurado corretamente.

**Adicione ao `.dockerignore`:**
```
node_modules
.next
.git
*.log
```

---

### **8. "Network not found"**

**Problema:**
```
Error: network iast-network not found
```

**Solução:**
```bash
# Recriar rede
docker-compose down
docker-compose up
```

---

### **9. "Volume mount failed"**

**Problema:**
```
Error: invalid mount config
```

**Solução (Windows):**

1. Abra Docker Desktop Settings
2. Vá em **Resources** > **File Sharing**
3. Adicione o diretório do projeto
4. Clique em **Apply & Restart**

---

### **10. "EACCES: permission denied"**

**Problema (Linux):**
```
Error: EACCES: permission denied
```

**Solução:**
```bash
# Ajustar permissões
sudo chown -R $USER:$USER .

# Ou executar com sudo (não recomendado)
sudo docker-compose up
```

**Melhor solução (adicionar usuário ao grupo docker):**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

### **11. "Module not found" após rebuild**

**Problema:**
```
Error: Cannot find module 'express'
```

**Solução:**
```bash
# Limpar volumes e rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

### **12. "Health check failed"**

**Problema:**
```
unhealthy
```

**Diagnóstico:**
```bash
# Ver logs do container
docker-compose logs backend

# Testar health endpoint manualmente
curl http://localhost:4000/health
```

**Soluções possíveis:**
- Aguardar o `start_period` (40s)
- Verificar se o backend está iniciando corretamente
- Verificar variáveis de ambiente

---

### **13. "Frontend não conecta ao Backend"**

**Problema:**
Frontend retorna erro 404 ou Connection Refused ao chamar API.

**Solução:**

**Dentro dos containers:**
```yaml
# Frontend deve usar o nome do serviço
NEXT_PUBLIC_API_URL=http://backend:4000  # ✅ Correto
```

**Do navegador (localhost):**
```bash
# Frontend deve usar localhost
NEXT_PUBLIC_API_URL=http://localhost:4000  # ✅ Correto
```

**Configuração recomendada no `.env.docker`:**
```bash
# Para acesso via navegador local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### **14. "Hot reload não funciona"**

**Problema:**
Mudanças no código não refletem automaticamente.

**Soluções:**

1. **Verificar volumes:**
   ```yaml
   volumes:
     - ./src:/app/src  # ✅ Deve estar presente
   ```

2. **Reiniciar containers:**
   ```bash
   docker-compose restart
   ```

3. **Rebuild (se mudou dependências):**
   ```bash
   docker-compose up --build
   ```

---

### **15. "Out of memory"**

**Problema:**
```
Error: JavaScript heap out of memory
```

**Solução (Docker Desktop):**

1. Abra **Settings** > **Resources**
2. Aumente **Memory** para 4GB ou mais
3. Clique em **Apply & Restart**

---

## 🧹 **Comandos de Limpeza**

### **Limpar containers parados:**
```bash
docker container prune
```

### **Limpar volumes não utilizados:**
```bash
docker volume prune
```

### **Limpar imagens não utilizadas:**
```bash
docker image prune -a
```

### **Limpar tudo (cuidado!):**
```bash
docker system prune -a --volumes
```

### **Limpar apenas este projeto:**
```bash
docker-compose down -v --rmi all
```

---

## 📊 **Diagnóstico**

### **Verificar status:**
```bash
docker-compose ps
```

### **Ver logs:**
```bash
# Todos os containers
docker-compose logs -f

# Container específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Inspecionar container:**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

### **Verificar variáveis de ambiente:**
```bash
docker-compose exec backend env | grep OPENAI
```

### **Verificar rede:**
```bash
docker network inspect iast-network
```

### **Ver uso de recursos:**
```bash
docker stats
```

---

## 🎯 **Checklist de Resolução**

Quando algo der errado, siga este checklist:

- [ ] Docker está rodando?
  ```bash
  docker info
  ```

- [ ] `.env.docker` existe e tem `OPENAI_API_KEY`?
  ```bash
  cat .env.docker | grep OPENAI
  ```

- [ ] Portas estão livres?
  ```bash
  netstat -ano | findstr :3001  # Windows
  lsof -i :3001                 # Linux/Mac
  ```

- [ ] Containers estão rodando?
  ```bash
  docker-compose ps
  ```

- [ ] Logs mostram erros?
  ```bash
  docker-compose logs
  ```

- [ ] Health check está OK?
  ```bash
  curl http://localhost:4000/health
  ```

- [ ] Tentou rebuild?
  ```bash
  docker-compose up --build
  ```

- [ ] Tentou limpar e reiniciar?
  ```bash
  docker-compose down -v
  docker-compose up
  ```

---

## 🆘 **Ainda com problemas?**

1. **Ver logs completos:**
   ```bash
   docker-compose logs --tail=100
   ```

2. **Verificar documentação:**
   - [DOCKER.md](./DOCKER.md)
   - [QUICK-START-DOCKER.md](./QUICK-START-DOCKER.md)

3. **Reiniciar tudo:**
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up
   ```

---

**Projeto IAST - Troubleshooting Docker** 🔧


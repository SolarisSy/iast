# 🚀 Guia: Hospedar IAST com Ngrok

## 📝 Pré-requisitos

1. Ngrok instalado e configurado
2. Frontend rodando na porta 3001
3. Backend rodando na porta 4000

## 🔧 Passo a Passo

### 1. Instalar Ngrok

```bash
# Via NPM
npm install -g ngrok

# Ou baixar: https://ngrok.com/download
```

### 2. Criar Conta e Autenticar

1. Acesse: https://dashboard.ngrok.com/signup
2. Copie seu authtoken
3. Execute:
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

### 3. Iniciar Aplicação

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Expor com Ngrok

**Terminal 3 - Backend Ngrok:**
```bash
ngrok http 4000
```

Copie a URL pública (ex: `https://abc123.ngrok-free.app`)

**Terminal 4 - Frontend Ngrok:**
```bash
ngrok http 3001
```

Copie a URL pública (ex: `https://xyz789.ngrok-free.app`)

### 5. Atualizar URLs no Código

**Opção A: Variável de Ambiente (Recomendado)**

Crie `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

Atualize o código para usar:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

**Opção B: Substituição Manual**

Substitua em todos os arquivos:
- `src/components/chat/Chat.tsx`
- `src/components/audio/AudioControls.tsx`

De:
```typescript
fetch('http://localhost:4000/api/chat', ...)
```

Para:
```typescript
fetch('https://abc123.ngrok-free.app/api/chat', ...)
```

### 6. Atualizar CORS no Backend

Em `backend/server.js`, atualize o CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://xyz789.ngrok-free.app' // Adicione sua URL do Ngrok
  ]
}));
```

### 7. Reiniciar e Testar

1. Reinicie o backend
2. Reinicie o frontend
3. Acesse a URL do frontend Ngrok
4. Compartilhe com seus testadores!

## 📱 Compartilhar com Testadores

Envie para seus testadores:
```
🌐 Acesse a aplicação IAST:
https://xyz789.ngrok-free.app

⚠️ Notas:
- Pode aparecer um aviso do Ngrok, clique em "Visit Site"
- A URL é temporária (válida enquanto o Ngrok estiver rodando)
```

## ⚡ Script de Automação (Opcional)

Crie `start-ngrok.ps1`:
```powershell
# Iniciar Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Iniciar Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Iniciar Ngrok para Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 4000"

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Iniciar Ngrok para Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3001"

Write-Host "✅ Todos os serviços iniciados!"
Write-Host "📋 Copie as URLs do Ngrok e atualize o código"
```

Executar:
```bash
.\start-ngrok.ps1
```

## 🔒 Segurança

### Proteções Recomendadas:

1. **Autenticação:**
   - Adicione senha/token de acesso
   - Use Ngrok Basic Auth (plano pago)

2. **Rate Limiting:**
   ```javascript
   // backend/server.js
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // limite de 100 requests
   });
   
   app.use('/api/', limiter);
   ```

3. **Variáveis de Ambiente:**
   - NUNCA commite `.env` com `OPENAI_API_KEY`
   - Use `.env.example` como template

## 💰 Custos

### Ngrok Grátis:
- ✅ 1 túnel simultâneo por conta
- ✅ 40 conexões/minuto
- ❌ URL muda ao reiniciar
- ❌ Sessão expira em 2 horas

### Ngrok Pago ($8/mês):
- ✅ URLs fixas
- ✅ Sem limite de tempo
- ✅ Domínio customizado
- ✅ Mais túneis simultâneos

## 🆘 Problemas Comuns

### "ERR_NGROK_3200"
- Solução: Seu authtoken não está configurado
- Execute: `ngrok config add-authtoken SEU_TOKEN`

### CORS Error
- Solução: Adicione a URL do Ngrok no CORS do backend
- Reinicie o servidor backend

### "Invalid Host Header"
- Solução: Atualize `next.config.mjs`:
  ```javascript
  const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' }
          ]
        }
      ];
    }
  };
  ```

## 📊 Monitoramento

Dashboard do Ngrok: http://127.0.0.1:4040
- Veja todas as requisições
- Inspecione payloads
- Debug em tempo real

## 🎯 Próximos Passos

Para produção real:
1. Deploy no Vercel (frontend)
2. Deploy no Railway (backend)
3. Domínio customizado
4. SSL/HTTPS automático
5. CI/CD automatizado


# 🌐 Como Hospedar o IAST para Testes

## 🎯 Objetivo
Permitir que pessoas da internet testem sua aplicação diretamente do seu PC.

---

## ⚡ OPÇÃO 1: Ngrok (Recomendado para Testes)

### ✅ Vantagens
- Setup em 5 minutos
- Completamente grátis
- Funciona em qualquer rede
- HTTPS automático
- Não precisa mexer no router

### 📦 Instalação

1. **Instalar Ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Criar conta grátis:**
   - Acesse: https://dashboard.ngrok.com/signup
   - Anote seu authtoken

3. **Autenticar:**
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

### 🚀 Uso Rápido

#### **Método Automático (Fácil):**

Execute o script:
```bash
.\start-ngrok.ps1
```

Siga as instruções na tela!

#### **Método Manual:**

**1. Iniciar Backend:**
```bash
cd backend
npm start
```

**2. Iniciar Frontend (nova janela):**
```bash
npm run dev
```

**3. Expor Backend com Ngrok (nova janela):**
```bash
ngrok http 4000
```
📋 Copie a URL (ex: `https://abc123.ngrok-free.app`)

**4. Expor Frontend com Ngrok (nova janela):**
```bash
ngrok http 3001
```
📋 Copie a URL (ex: `https://xyz789.ngrok-free.app`)

**5. Atualizar Backend:**

Edite `backend/server.js`, encontre o CORS e adicione:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://xyz789.ngrok-free.app' // SUA URL DO FRONTEND AQUI
  ]
}));
```

Reinicie o backend (Ctrl+C e `npm start`)

**6. Atualizar Frontend:**

Crie o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```
(Use a URL do BACKEND)

Reinicie o frontend (Ctrl+C e `npm run dev`)

**7. Compartilhar:**

Envie para seus testadores:
```
🎓 Teste o IAST - Mentor Anderson Silva I.A
https://xyz789.ngrok-free.app

⚠️ Se aparecer aviso do Ngrok, clique em "Visit Site"
```

### 🎮 Dashboard

Acesse: http://127.0.0.1:4040
- Veja todas as requisições em tempo real
- Debug de erros
- Inspeção de payloads

---

## 🚀 OPÇÃO 2: Deploy em Produção (Permanente)

Para algo mais profissional e 24/7:

### Frontend: Vercel (Grátis)

1. **Instalar CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configurar:**
   - No dashboard, adicione a variável:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
   ```

### Backend: Railway (Grátis)

1. **Criar conta:** https://railway.app

2. **Novo projeto:**
   - "New Project" → "Deploy from GitHub"
   - Ou upload manual da pasta `backend`

3. **Configurar:**
   - Adicione variável `OPENAI_API_KEY`
   - Copie a URL pública

4. **Atualizar CORS:**
   ```javascript
   app.use(cors({
     origin: ['https://seu-app.vercel.app']
   }));
   ```

**Resultado:** Aplicação rodando 24/7 na nuvem!

---

## 📊 Comparação

| Critério | Ngrok | Vercel + Railway |
|----------|-------|------------------|
| **Setup** | 5 min | 20 min |
| **Custo** | Grátis | Grátis (limitado) |
| **Uptime** | Quando seu PC está ligado | 24/7 |
| **URL** | Muda ao reiniciar | Fixa |
| **Performance** | Depende do seu PC | Servidores cloud |
| **Ideal para** | Testes rápidos | Produção |

---

## 🔒 Segurança

### ⚠️ IMPORTANTE:

1. **API Key da OpenAI:**
   - NUNCA commite `.env` no GitHub
   - Use `.env.example` como template
   - Adicione `.env` no `.gitignore`

2. **Rate Limiting:**
   Proteja sua API de abuso:
   ```bash
   cd backend
   npm install express-rate-limit
   ```

   Em `backend/server.js`:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // 100 requisições
   });
   
   app.use('/api/', limiter);
   ```

3. **Monitoramento:**
   - Use o dashboard do Ngrok
   - Monitore uso da API OpenAI
   - Defina limites de gasto

---

## 🆘 Problemas Comuns

### "ERR_NGROK_3200"
```bash
# Solução: Configurar authtoken
ngrok config add-authtoken SEU_TOKEN
```

### CORS Error
```bash
# Solução: Adicionar URL no backend/server.js
# Reiniciar backend
```

### "Invalid Host Header"
```bash
# Solução: Adicionar no next.config.mjs
async headers() {
  return [{
    source: '/:path*',
    headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
  }];
}
```

### Ngrok muito lento
```bash
# Solução: Usar servidor mais próximo
ngrok http 4000 --region=sa  # América do Sul
```

---

## 📝 Checklist Antes de Compartilhar

- [ ] Backend rodando sem erros
- [ ] Frontend rodando sem erros
- [ ] Ngrok expondo ambos os serviços
- [ ] CORS atualizado no backend
- [ ] `.env.local` atualizado no frontend
- [ ] Testado abrindo a URL do Ngrok
- [ ] Chat funcionando
- [ ] Áudio funcionando
- [ ] Vídeos carregando

---

## 💡 Dicas

1. **Teste primeiro localmente:**
   - http://localhost:3001 (frontend)
   - http://localhost:4000 (backend)

2. **Use o dashboard do Ngrok:**
   - http://127.0.0.1:4040
   - Inspecione requisições

3. **Limite de tempo do Ngrok grátis:**
   - Sessão expira em 2 horas
   - Pode reiniciar quantas vezes quiser

4. **Compartilhe com cuidado:**
   - Ngrok grátis: 40 conexões/minuto
   - Perfeito para 5-10 testadores simultâneos

5. **Custos da OpenAI:**
   - Monitore uso em: https://platform.openai.com/usage
   - Defina limites de gasto
   - ~$0.002 por mensagem (GPT-4o-mini)

---

## 🎓 Recursos

- **Ngrok Docs:** https://ngrok.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Next.js Deploy:** https://nextjs.org/docs/deployment

---

## 📞 Suporte

Problemas? Crie uma issue ou consulte:
- [Documentação do Ngrok](https://ngrok.com/docs)
- [Status do Ngrok](https://status.ngrok.com)


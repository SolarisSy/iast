# Guia Manual - Expor com Ngrok

## Passo 1: Iniciar Backend

Abra um terminal PowerShell e execute:

```bash
cd backend
npm start
```

Deixe este terminal aberto.

---

## Passo 2: Iniciar Frontend

Abra OUTRO terminal PowerShell e execute:

```bash
npm run dev
```

Deixe este terminal aberto.

Aguarde até ver a mensagem: "Ready in XXXXms"

---

## Passo 3: Expor Backend com Ngrok

Abra OUTRO terminal PowerShell e execute:

```bash
ngrok http 4000
```

Você verá algo assim:
```
Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:4000
```

**COPIE** a URL (https://abc123xyz.ngrok-free.app) - Esta é a URL do BACKEND

Deixe este terminal aberto.

---

## Passo 4: Expor Frontend com Ngrok

Abra OUTRO terminal PowerShell e execute:

```bash
ngrok http 3001
```

Você verá algo assim:
```
Forwarding  https://def456ghi.ngrok-free.app -> http://localhost:3001
```

**COPIE** a URL (https://def456ghi.ngrok-free.app) - Esta é a URL do FRONTEND

Deixe este terminal aberto.

---

## Passo 5: Criar arquivo .env.local

Na pasta raiz do projeto (iast), crie um arquivo chamado `.env.local` com:

```env
NEXT_PUBLIC_API_URL=https://abc123xyz.ngrok-free.app
```

(Use a URL do BACKEND que você copiou no Passo 3)

---

## Passo 6: Atualizar CORS no Backend

Edite o arquivo `backend/server.js`

Encontre esta linha (por volta da linha 27):

```javascript
app.use(cors());
```

Substitua por:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://def456ghi.ngrok-free.app'  // URL do FRONTEND do Passo 4
  ]
}));
```

Salve o arquivo.

---

## Passo 7: Reiniciar Backend

No terminal do Backend (Passo 1):
- Pressione `Ctrl+C` para parar
- Execute novamente: `npm start`

---

## Passo 8: Reiniciar Frontend

No terminal do Frontend (Passo 2):
- Pressione `Ctrl+C` para parar
- Execute novamente: `npm run dev`

---

## Passo 9: Testar

Abra o navegador e acesse a URL do FRONTEND:

```
https://def456ghi.ngrok-free.app
```

Se aparecer um aviso do Ngrok, clique em "Visit Site".

---

## Passo 10: Compartilhar

Envie para seus testadores a URL do FRONTEND:

```
Teste a aplicação IAST:
https://def456ghi.ngrok-free.app
```

---

## Dashboard Ngrok

Para ver todas as requisições em tempo real:

http://127.0.0.1:4040

---

## Problemas Comuns

### CORS Error

Se aparecer erro de CORS no navegador:
1. Verifique se adicionou a URL correta no Passo 6
2. Reiniciou o backend no Passo 7

### Backend não responde

1. Verifique se a URL em `.env.local` está correta
2. Reinicie o frontend

### Ngrok expired

O Ngrok grátis expira em 2 horas. Basta:
1. Fechar os terminais do Ngrok (Passos 3 e 4)
2. Executar novamente (as URLs mudarão)
3. Repetir Passos 5 a 8

---

## Resumo dos 4 Terminais

1. **Backend**: `cd backend && npm start`
2. **Frontend**: `npm run dev`
3. **Ngrok Backend**: `ngrok http 4000`
4. **Ngrok Frontend**: `ngrok http 3001`

Todos devem estar rodando ao mesmo tempo!


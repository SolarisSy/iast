# 🔧 WhatsApp Chat - Solução de Problemas

## ❌ Erro 404: Chat não encontrado

### Sintomas
```
Failed to load resource: the server responded with a status of 404
❌ Erro ao buscar chats: Error: Erro ao buscar chats: 404
```

### Causas Principais

1. **Instância não existe ou nome incorreto**
   - Verifique se o nome da instância está correto
   - Exemplo: `atendimento` (letras minúsculas, sem espaços)

2. **Instância desconectada**
   - A instância precisa estar com status "✅ Conectado"
   - Verifique no WhatsApp Manager

3. **Endpoint da API incorreto**
   - A Evolution API mudou de GET para POST
   - Agora corrigido para `POST /chat/findChats/{instance}`

4. **Versão da API incompatível**
   - Certifique-se de usar Evolution API v2+
   - Alguns endpoints mudaram entre versões

---

## 🔍 Como Diagnosticar

### 1️⃣ Usar o Debug Integrado

1. Acesse **WhatsApp Chat** no painel admin
2. Clique no botão **"🔧 Debug API"** no canto superior direito
3. Digite o nome da instância (ex: `atendimento`)
4. Clique em **"🔍 Testar"**

**O que verificar:**
- ✅ Status 200 = Funcionando
- ❌ Status 404 = Instância não encontrada ou desconectada
- ❌ Status 401 = Problema com API Key

### 2️⃣ Verificar Console do Navegador

Pressione **F12** e vá na aba **Console**. Procure por:

```javascript
🔍 Buscando chats da instância: atendimento
📱 Resposta completa: {...}
📱 Chats encontrados: 0 ou N
```

Se ver erro `404`, a instância não está disponível.

---

## ✅ Soluções Passo a Passo

### Solução 1: Verificar Instância

1. **Ir para WhatsApp Manager**
   - Aba: "📱 WhatsApp Manager"

2. **Verificar Status**
   - Procure a instância (ex: `atendimento`)
   - Status deve estar: **"✅ Conectado"**

3. **Se estiver desconectado:**
   - Clique em **"🔗 Conectar"**
   - Escaneie o QR Code
   - Aguarde conectar

4. **Voltar para WhatsApp Chat**
   - Aba: "💬 WhatsApp Chat"
   - Selecione a instância
   - Clique em **"🔄 Atualizar"**

---

### Solução 2: Recriar Instância

Se a instância não aparece ou está com problemas:

1. **WhatsApp Manager**
   - Deletar instância antiga
   - Aguardar 10 segundos

2. **Criar Nova Instância**
   - Clique em **"➕ Nova Instância"**
   - Use nome simples: `atendimento`, `vendas`, etc
   - Evite espaços, acentos, maiúsculas

3. **Conectar**
   - Escaneie QR Code **UMA VEZ**
   - **FECHE** o WhatsApp no celular
   - Aguarde até 2 minutos

4. **Testar no WhatsApp Chat**

---

### Solução 3: Verificar API Key

1. **Abrir arquivo de ambiente**
   - `front/.env.local`

2. **Verificar variáveis:**
   ```bash
   NEXT_PUBLIC_EVOLUTION_API_URL=https://list-2-evolution-api.zqprdy.easypanel.host
   NEXT_PUBLIC_EVOLUTION_API_KEY=SUA_API_KEY_AQUI
   ```

3. **Se API Key estiver incorreta:**
   - Obtenha a correta no painel da Evolution API
   - Substitua no `.env.local`
   - **Reinicie o servidor Next.js**

4. **Reiniciar:**
   ```bash
   # Parar servidor (Ctrl+C)
   cd front
   npm start
   # ou
   bun start
   ```

---

### Solução 4: Verificar URL da API

1. **Testar URL manualmente**
   - Abra o navegador
   - Acesse: `https://list-2-evolution-api.zqprdy.easypanel.host/manager/`
   - Deve abrir a interface da Evolution API

2. **Se não abrir:**
   - URL pode estar incorreta
   - Servidor pode estar offline
   - Entre em contato com administrador

3. **Atualizar URL:**
   - Edite `front/.env.local`
   - Ajuste `NEXT_PUBLIC_EVOLUTION_API_URL`
   - Reinicie o servidor

---

## 🎯 Checklist Rápido

Antes de reportar problema, verifique:

- [ ] Instância existe e está conectada (WhatsApp Manager)
- [ ] Nome da instância está correto (minúsculas, sem espaços)
- [ ] API Key está configurada em `.env.local`
- [ ] URL da API está correta
- [ ] Servidor Next.js foi reiniciado após alterar `.env.local`
- [ ] Console do navegador (F12) mostra logs detalhados
- [ ] Testou com o Debug integrado (🔧 Debug API)

---

## 📊 Códigos de Status HTTP

| Código | Significado | Solução |
|--------|-------------|---------|
| 200 | ✅ Sucesso | Tudo funcionando |
| 401 | 🔐 Não autorizado | API Key incorreta |
| 404 | ❌ Não encontrado | Instância não existe/desconectada |
| 500 | ⚠️ Erro no servidor | Problema na API Evolution |
| CORS | 🚫 Bloqueio CORS | Verificar configuração da API |

---

## 🔄 Mudanças Recentes

### v1.1.0 (2025-11-12)

**✅ Corrigido:**
- Endpoint alterado de `GET` para `POST /chat/findChats/{instance}`
- Adicionado body `{ where: {} }` na requisição
- Melhor tratamento de erro e logs
- Componente de debug integrado

**📝 Formato Antigo (INCORRETO):**
```javascript
// ❌ NÃO FUNCIONA MAIS
fetch('/chat/findChats/atendimento', {
  method: 'GET'
})
```

**📝 Formato Novo (CORRETO):**
```javascript
// ✅ FUNCIONA
fetch('/chat/findChats/atendimento', {
  method: 'POST',
  body: JSON.stringify({ where: {} })
})
```

---

## 💡 Dicas de Prevenção

1. **Nomes de Instância**
   - Use sempre minúsculas
   - Sem espaços ou caracteres especiais
   - Exemplo bom: `atendimento`, `vendas1`, `suporte-tech`
   - Exemplo ruim: `Atendimento`, `Vendas 1`, `Suporte/Tech`

2. **Manter Conectado**
   - Monitore status regularmente
   - WhatsApp pode desconectar se:
     - Celular ficar sem internet
     - App desinstalado
     - Número bloqueado/banido

3. **Logs no Console**
   - Mantenha console aberto (F12) durante testes
   - Facilita identificar problemas rapidamente

4. **Testar Após Mudanças**
   - Sempre teste após alterar `.env.local`
   - Reinicie servidor após mudanças

---

## 🆘 Ainda não Funciona?

### Passo Final: Logs Completos

1. **Abrir Console (F12)**
2. **Limpar console** (ícone 🚫)
3. **Tentar carregar chats novamente**
4. **Copiar TODOS os logs**
5. **Incluir:**
   - Mensagens de erro completas
   - Status HTTP
   - Resposta da API (se houver)
   - Screenshot da tela

### Informações Úteis para Suporte

```
Sistema: Windows / Mac / Linux
Navegador: Chrome / Firefox / Edge
Versão Next.js: 14.x
Versão Evolution API: 2.x
URL da API: https://...
Nome da Instância: atendimento
Status da Instância: Conectado / Desconectado
Erro Específico: [cole aqui]
```

---

## 📚 Recursos Adicionais

- **[WHATSAPP_CHAT.md](./WHATSAPP_CHAT.md)** - Documentação completa
- **[WHATSAPP_MANAGER.md](./WHATSAPP_MANAGER.md)** - Como conectar números
- **[Evolution API Docs](https://doc.evolution-api.com/v2)** - Documentação oficial

---

## 🎉 Funcionou?

Se conseguiu resolver:
1. Teste enviar algumas mensagens
2. Verifique se auto-atualização funciona (5s)
3. Tente com múltiplas instâncias

**Aproveite seu WhatsApp Web 2.0!** 💬✨

---

**Última atualização:** 2025-11-12  
**Versão:** 1.1.0


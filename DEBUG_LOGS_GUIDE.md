# 🔍 Guia Completo de Logs de Debug - WhatsApp Chat

## 📊 Visão Geral

O sistema agora possui **logs extremamente detalhados** em todas as operações. Isso facilita identificar qualquer problema na comunicação com a Evolution API.

---

## 🎯 Como Ativar os Logs

### Passo 1: Abrir Console do Navegador
1. Pressione **F12** no teclado
2. Ou clique com botão direito → **Inspecionar** → Aba **Console**

### Passo 2: Limpar Console (Opcional)
- Clique no ícone 🚫 ou Ctrl+L para limpar logs antigos

### Passo 3: Usar a Aplicação
- Navegue normalmente no WhatsApp Chat
- Todos os logs aparecerão automaticamente no console

---

## 📝 Tipos de Logs

### 🔌 FETCH INSTANCES
**Quando acontece:** Ao carregar a página ou atualizar instâncias

**O que mostra:**
```
🔌 FETCH INSTANCES - Início
🌐 API_URL: https://...
🎯 URL: https://.../instance/fetchInstances
⏳ Buscando instâncias...
📥 Status: 200 OK
✅ Instâncias recebidas: 3
✅ Dados: [...]
🟢 Instâncias conectadas: 2
📋 Lista de instâncias conectadas:
   1. atendimento (João Silva)
   2. vendas (Maria Santos)
🎯 Selecionando instância automaticamente: atendimento
```

**Se der erro:**
```
❌ ERRO FATAL ao buscar instâncias: Error: ...
❌ Stack: [stack trace completo]
```

---

### 🔍 FETCH CHATS
**Quando acontece:** Ao selecionar uma instância ou clicar em Atualizar

**O que mostra:**
```
🔍 FETCH CHATS - Início
📊 Instância: atendimento
🌐 API_URL: https://...
🔑 API_KEY: 429683C4C9...
🎯 URL completa: https://.../chat/findChats/atendimento
📤 Headers: {Content-Type: ..., apikey: ...}
📦 Body: {"where":{}}
⏳ Enviando requisição POST...
📥 Resposta recebida
   └─ Status: 200
   └─ Status Text: OK
   └─ OK: true
   └─ Headers: {...}
✅ Dados recebidos (tipo): object
✅ Dados recebidos (array?): true
✅ Dados recebidos (conteúdo): [...]
📱 Chats encontrados (quantidade): 15
📱 Chats encontrados (amostra): [...]
🔄 Processando chats...
   └─ Chat 1: João Silva (5511999999999@s.whatsapp.net)
   └─ Chat 2: Maria Santos (5511888888888@s.whatsapp.net)
   └─ Chat 3: Suporte Técnico (5511777777777@s.whatsapp.net)
✅ Total de chats processados: 15
```

**Se der erro 404:**
```
❌ ERRO - Corpo da resposta: Not Found
❌ ERRO - Status completo: {status: 404, statusText: "Not Found", url: "..."}

🔄 Tentando endpoint alternativo...
🔄 Tentando: GET https://.../chat/find/atendimento
   └─ Status: 404
   └─ Falhou: ...
🔄 Tentando: GET https://.../chat/fetchChats/atendimento
   └─ Status: 404
   └─ Falhou: ...
🔄 Tentando: POST https://.../message/findChats/atendimento
   └─ Status: 200
✅ SUCESSO com endpoint: /message/findChats/atendimento
✅ Dados: [...]
```

---

### 💬 FETCH MESSAGES
**Quando acontece:** Ao clicar em uma conversa

**O que mostra:**
```
💬 FETCH MESSAGES - Início
📊 Instância: atendimento
💬 Chat ID: 5511999999999@s.whatsapp.net
🎯 URL: https://.../chat/findMessages/atendimento
📦 Body: {
  "where": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    }
  },
  "limit": 100
}
⏳ Enviando requisição...
📥 Resposta: {status: 200, statusText: "OK", ok: true}
✅ Mensagens recebidas (quantidade): 45
✅ Mensagens recebidas (amostra): [...]
🔄 Ordenando mensagens...
✅ Mensagens ordenadas: 45
```

**Se der erro:**
```
❌ ERRO: Internal Server Error
❌ ERRO FATAL ao buscar mensagens: Error: Erro ao buscar mensagens: 500
❌ Stack: [stack trace completo]
```

---

### 📤 SEND MESSAGE
**Quando acontece:** Ao enviar uma mensagem

**O que mostra:**
```
📤 SEND MESSAGE - Início
📊 Instância: atendimento
💬 Chat: João Silva (5511999999999@s.whatsapp.net)
📝 Texto: Olá, tudo bem?
📎 Mídia: Não
🎯 Endpoint: https://.../message/sendText/atendimento
📦 Body: {
  "number": "5511999999999",
  "text": "Olá, tudo bem?"
}
⏳ Enviando...
📥 Status: 200 OK
✅ Resposta: {key: {...}, message: {...}}
✅ Mensagem enviada com sucesso!
🔄 Recarregando mensagens...
```

**Se der erro:**
```
❌ ERRO: Unauthorized
❌ ERRO FATAL ao enviar mensagem: Error: Erro ao enviar mensagem: 401
❌ Stack: [stack trace completo]
```

---

## 🔧 Como Interpretar os Logs

### ✅ Tudo OK
- Status **200** ou **201**
- `✅` (check verde) antes das mensagens
- Dados sendo processados corretamente

### ❌ Erro 404 - Not Found
**Significado:** Endpoint ou instância não encontrado

**O que verificar:**
1. Nome da instância está correto?
2. Instância está conectada?
3. URL da API está correta?

**Procure no log:**
```
🎯 URL completa: https://.../chat/findChats/atendimento
                                              ↑↑↑↑↑↑↑↑↑↑↑↑
                                        Nome da instância
```

**Solução:**
- Verifique se a instância existe no WhatsApp Manager
- Use o mesmo nome exatamente
- Teste endpoints alternativos (o sistema tenta automaticamente)

---

### ❌ Erro 401 - Unauthorized
**Significado:** API Key incorreta ou ausente

**O que verificar:**
1. API Key está configurada no `.env.local`?
2. API Key está correta?
3. Servidor Next.js foi reiniciado após alterar `.env.local`?

**Procure no log:**
```
🔑 API_KEY: 429683C4C9...
```

**Solução:**
1. Abrir `front/.env.local`
2. Verificar: `NEXT_PUBLIC_EVOLUTION_API_KEY=SUA_KEY_AQUI`
3. Reiniciar servidor Next.js (Ctrl+C e depois `npm start`)

---

### ❌ Erro 500 - Internal Server Error
**Significado:** Erro no servidor da Evolution API

**O que verificar:**
1. Servidor Evolution API está online?
2. Instância está funcionando corretamente?
3. Body da requisição está correto?

**Procure no log:**
```
❌ ERRO: Internal Server Error
📦 Body: {...}  ← Verifique se está correto
```

**Solução:**
- Aguardar alguns minutos
- Reconectar a instância
- Verificar logs do servidor Evolution API
- Contactar administrador da API

---

### ⚠️ Nenhum chat/mensagem encontrado
**Significado:** A instância não tem conversas ou mensagens

**O que mostra:**
```
⚠️ Nenhum chat encontrado ou formato inesperado
💡 Isso pode significar que não há conversas nesta instância ainda
```

**Isso é normal se:**
- Instância foi recém-criada
- Não enviou/recebeu mensagens ainda
- WhatsApp foi limpo recentemente

**Solução:**
- Envie uma mensagem pelo celular
- Aguarde alguns segundos
- Clique em 🔄 Atualizar

---

## 🎯 Cenários Comuns e Logs

### Cenário 1: Nenhuma instância aparece
**Logs esperados:**
```
🔌 FETCH INSTANCES - Início
✅ Instâncias recebidas: 3
✅ Dados: [...]
🟢 Instâncias conectadas: 0
⚠️ Nenhuma instância conectada encontrada
```

**Problema:** Instâncias existem mas não estão conectadas

**Solução:**
1. Ir para WhatsApp Manager
2. Conectar pelo menos uma instância
3. Aguardar status "✅ Conectado"
4. Voltar para WhatsApp Chat

---

### Cenário 2: Erro 404 ao buscar chats
**Logs esperados:**
```
🔍 FETCH CHATS - Início
❌ ERRO - Status completo: {status: 404, ...}
🔄 Tentando endpoint alternativo...
🔄 Tentando: GET https://.../chat/find/atendimento
   └─ Status: 404
[... tentativas ...]
```

**Problema:** Endpoint `/chat/findChats/` não existe na sua versão da API

**Solução Automática:** Sistema tenta endpoints alternativos
- Se algum funcionar, aparecerá: `✅ SUCESSO com endpoint: ...`
- Anote qual endpoint funcionou para reportar

**Solução Manual:**
1. Copie a URL completa do log
2. Teste no Postman ou navegador
3. Consulte documentação da sua versão da Evolution API
4. Ajuste endpoint se necessário

---

### Cenário 3: Dados recebidos mas não aparecem
**Logs esperados:**
```
✅ Dados recebidos (conteúdo): {...}  ← Copie isso!
📱 Chats encontrados (quantidade): 0
⚠️ Nenhum chat encontrado ou formato inesperado
```

**Problema:** API retorna dados em formato diferente do esperado

**Solução:**
1. Copie o conteúdo de `✅ Dados recebidos (conteúdo):`
2. Cole aqui ou no suporte
3. Estrutura de dados pode estar diferente
4. Código precisa ser ajustado para ler o formato correto

---

## 📋 Checklist de Debug

Quando algo não funcionar, verifique estes logs:

- [ ] **🔌 FETCH INSTANCES**
  - [ ] Status 200?
  - [ ] Instâncias recebidas > 0?
  - [ ] Instâncias conectadas > 0?
  
- [ ] **🔍 FETCH CHATS**
  - [ ] URL completa está correta?
  - [ ] API_KEY está presente?
  - [ ] Status 200?
  - [ ] Chats encontrados > 0?
  
- [ ] **💬 FETCH MESSAGES**
  - [ ] Chat ID está correto?
  - [ ] Status 200?
  - [ ] Mensagens recebidas > 0?
  
- [ ] **📤 SEND MESSAGE**
  - [ ] Endpoint correto?
  - [ ] Body tem "number" e "text"?
  - [ ] Status 200?

---

## 🆘 Reportar Problema

Se precisar de ajuda, **copie TODOS os logs** do console:

### Como copiar:
1. **F12** → Console
2. Clique com **botão direito** na área de logs
3. **"Save as..."** ou **"Copy all"**
4. Ou selecione tudo (Ctrl+A) e copie (Ctrl+C)

### O que incluir:
```
=== INFORMAÇÕES DO SISTEMA ===
Sistema: Windows / Mac / Linux
Navegador: Chrome / Firefox / Edge
URL da API: https://...
Instância testada: atendimento

=== LOGS COMPLETOS ===
[Cole aqui TODOS os logs do console]

=== ERRO ESPECÍFICO ===
❌ ERRO FATAL ao buscar chats: Error: ...
❌ Stack: [stack trace]

=== OBSERVAÇÕES ===
- O que você estava tentando fazer?
- O erro acontece sempre ou às vezes?
- Funcionava antes? Quando parou?
```

---

## 💡 Dicas Avançadas

### Desabilitar Logs Específicos
Se quiser silenciar algum tipo de log, comente no código:

**Exemplo:** Desabilitar logs de polling
```typescript
// Comentar esta linha em useEffect:
// console.log('🔄 Polling de mensagens...');
```

### Salvar Logs em Arquivo
1. **F12** → Console
2. Botão direito → **"Save as..."**
3. Salvar como `.log` ou `.txt`

### Filtrar Logs no Console
Use a barra de busca do console:
- `🔍` - Apenas logs de chats
- `💬` - Apenas logs de mensagens
- `❌` - Apenas erros
- `✅` - Apenas sucessos

---

## 📚 Recursos Adicionais

- **[WHATSAPP_CHAT_TROUBLESHOOTING.md](./WHATSAPP_CHAT_TROUBLESHOOTING.md)** - Soluções de problemas
- **[WHATSAPP_CHAT.md](./WHATSAPP_CHAT.md)** - Documentação completa
- **Evolution API Docs** - Documentação oficial

---

**🎉 Com esses logs detalhados, qualquer problema será fácil de identificar!**

**Última atualização:** 2025-11-12  
**Versão:** 2.0.0 - Logs Completos


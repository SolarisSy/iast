# 💬 WhatsApp Chat - Guia Completo

## 🎯 Visão Geral

O **WhatsApp Chat** é uma interface completa estilo WhatsApp Web 2.0 integrada ao seu sistema. Você pode gerenciar conversas de múltiplos números WhatsApp, visualizar mensagens, enviar respostas e tudo mais que você precisa - tudo dentro do seu painel admin!

## ⚡ Recursos

### ✅ Funcionalidades Disponíveis:

1. **Seletor de Instâncias** - Alterne entre múltiplos números conectados
2. **Lista de Conversas** - Veja todas as conversas (individuais e grupos)
3. **Visualização de Mensagens** - Interface limpa e organizada como WhatsApp Web
4. **Envio de Mensagens** - Digite e envie mensagens de texto
5. **Auto-atualização** - Polling automático de novas mensagens (5 segundos)
6. **Informações Completas** - Veja fotos de perfil, nomes, timestamps
7. **Scroll Automático** - Sempre na última mensagem
8. **Separadores de Data** - Organize mensagens por dia
9. **Status de Mensagens** - Veja se foi enviada, recebida ou lida (✓, ✓✓)
10. **Contador de Mensagens** - Quantas mensagens em cada conversa
11. **Mensagens não lidas** - Badge com contador
12. **Suporte a Grupos** - Veja quem enviou cada mensagem

## 🚀 Como Usar

### 1️⃣ Pré-requisitos

Antes de usar o WhatsApp Chat, você precisa:

1. **Ter instâncias conectadas** no WhatsApp Manager
2. **Status "Conectado" (✅)** - Pelo menos um número ativo
3. **Conversas existentes** - Ter conversado com alguns contatos

### 2️⃣ Acessar o Painel

1. Acesse o painel admin: `http://localhost:3000/admin`
2. Clique na aba **"💬 WhatsApp Chat"**

### 3️⃣ Selecionar Número

Na parte superior, selecione qual número WhatsApp você quer usar:

- **Dropdown de Instâncias** - Lista todos os números conectados
- **Nome ou Número** - Mostra identificação do número
- **Botão Atualizar** - Recarrega conversas manualmente

### 4️⃣ Selecionar Conversa

Na **sidebar esquerda**, você verá todas as conversas:

- **Foto de Perfil** - Avatar do contato/grupo
- **Nome** - Nome do contato ou grupo
- **Última Mensagem** - Preview da última mensagem
- **Timestamp** - Quanto tempo atrás
- **Badge Verde** - Contador de não lidas (se houver)
- **👥 Ícone** - Indica se é grupo

**Clique** em uma conversa para abrir.

### 5️⃣ Visualizar Mensagens

Na **área central/direita**, você verá:

**Header da Conversa:**
- Foto e nome do contato/grupo
- ID do número
- Contador de mensagens

**Área de Mensagens:**
- **Suas mensagens** - Roxo/azul à direita
- **Mensagens recebidas** - Cinza à esquerda
- **Hora** - Timestamp em cada mensagem
- **Status** - ✓ (enviada), ✓✓ (entregue/lida)
- **Separadores de Data** - Por dia
- **Nome do remetente** - Em grupos (apenas mensagens recebidas)

**Auto-scroll:** Sempre mostra a última mensagem automaticamente.

### 6️⃣ Enviar Mensagens

Na **parte inferior**:

1. Digite a mensagem no campo de texto
2. **Enter** para enviar
3. **Shift + Enter** para quebrar linha
4. Ou clique no botão **"📤 Enviar"**

**Atalhos:**
- `Enter` - Enviar mensagem
- `Shift + Enter` - Nova linha

**Botão 📎** - Anexar mídia (em breve)

---

## 📊 Interface Completa

### Layout Tipo WhatsApp Web

```
┌────────────────────────────────────────────────────┐
│  [Seletor de Número] [🔄 Atualizar]                │
├──────────────┬─────────────────────────────────────┤
│              │  Chat: João Silva           100 msgs│
│  CONVERSAS   │  +55 11 99999-9999                  │
│              ├─────────────────────────────────────┤
│ [Avatar] 👤  │                                     │
│ João Silva   │  ┌───── 12/11/2025 ─────┐          │
│ Oi, tudo?    │  │                       │          │
│ 2min         │  │  Olá!         10:30 ✓│ (você)   │
│              │  │                       │          │
│ [Avatar] 👥  │  │      Tudo bem?  10:31│          │
│ Grupo Dev    │  │                       │          │
│ Fulano: ok   │  │  Sim! E você?  10:32✓│ (você)   │
│ 1h      [3]  │  └───────────────────────┘          │
│              │                                     │
│ [Avatar]     │  ─────────────────────────────────  │
│ Maria        │  [📎] [Digite mensagem] [📤 Enviar] │
│ 👍           │                                     │
│ ontem        │                                     │
└──────────────┴─────────────────────────────────────┘
```

### Cores e Indicadores

**Status de Mensagem:**
- `✓` - Enviada
- `✓✓` - Entregue/Lida
- `🕐` - Enviando

**Badges:**
- 🟢 **Verde** - Mensagens não lidas (ex: [3])
- 👥 - Grupo
- 📎 - Anexo (em breve)

**Cores das Mensagens:**
- 🟣 **Roxo/Azul** - Suas mensagens (à direita)
- ⚪ **Cinza** - Mensagens recebidas (à esquerda)

---

## 🔄 Auto-atualização

### Polling Automático

O sistema atualiza automaticamente:

**Instâncias (30 segundos):**
- Verifica se há novas instâncias conectadas
- Atualiza lista de números disponíveis

**Conversas (ao selecionar número):**
- Carrega todas as conversas do número
- Atualiza ao trocar de número

**Mensagens (5 segundos):**
- Atualiza mensagens da conversa aberta
- Detecta novas mensagens automaticamente
- Sincroniza status (enviada, lida, etc)

**Botão Manual:**
- Clique em "🔄 Atualizar" para forçar reload

---

## 🎨 Recursos de Interface

### Fotos de Perfil

**Com Foto:**
- Exibe avatar real do contato/grupo

**Sem Foto:**
- Avatar com gradiente colorido
- Iniciais do nome (ex: "JS" para "João Silva")

### Timestamps

**Formato Inteligente:**
- "2min" - há 2 minutos
- "1h" - há 1 hora
- "ontem" - ontem
- "há 3 dias" - há 3 dias

**Hora nas Mensagens:**
- Formato 24h: "10:30", "14:45"

**Separadores de Data:**
- "12/11/2025" - Quando o dia muda

### Scroll e Navegação

**Auto-scroll:**
- Ao abrir conversa, vai para última mensagem
- Ao receber nova mensagem, scroll automático

**Scroll Manual:**
- Barra de rolagem customizada (estilo WhatsApp)
- Suave e responsiva

### Responsivo

**Desktop:**
- Grid de 2 colunas
- Sidebar + Área de mensagens

**Mobile:**
- Empilhado verticalmente
- Otimizado para toque

---

## 📱 Tipos de Mensagem

### Suportados Atualmente

1. **Texto Simples** ✅
   - Mensagens normais
   - Múltiplas linhas
   - Emojis

2. **Texto Estendido** ✅
   - Links
   - Formatação
   - Citações

### Em Desenvolvimento

3. **Imagens** 📷 (em breve)
   - Preview de imagens
   - Caption (legenda)

4. **Vídeos** 🎥 (em breve)
   - Preview de vídeos
   - Caption

5. **Áudios** 🎵 (em breve)
   - Player de áudio
   - Duração

6. **Documentos** 📄 (em breve)
   - Nome do arquivo
   - Tamanho
   - Download

---

## 🔧 Configurações Avançadas

### API Endpoints Utilizados

```javascript
// Buscar instâncias
GET /instance/fetchInstances

// Buscar conversas
GET /chat/findChats/:instanceName

// Buscar mensagens
POST /chat/findMessages/:instanceName
Body: {
  where: { key: { remoteJid: chatId } },
  limit: 100
}

// Enviar mensagem de texto
POST /message/sendText/:instanceName
Body: {
  number: "5511999999999",
  text: "Mensagem"
}

// Enviar mídia (em breve)
POST /message/sendMedia/:instanceName
Body: {
  number: "5511999999999",
  mediaMessage: {
    mediatype: "image",
    url: "...",
    caption: "..."
  }
}
```

### Headers

Todas as requisições incluem:
```javascript
{
  'Content-Type': 'application/json',
  'apikey': process.env.NEXT_PUBLIC_EVOLUTION_API_KEY
}
```

---

## 🛠️ Solução de Problemas

### Problema: "Nenhuma instância conectada"

**Sintomas:**
- Aviso amarelo no topo
- Nenhum número disponível

**Solução:**
1. Ir para aba "📱 WhatsApp Manager"
2. Conectar pelo menos um número
3. Aguardar status "✅ Conectado"
4. Voltar para "💬 WhatsApp Chat"

---

### Problema: "Nenhuma conversa ainda"

**Sintomas:**
- Sidebar vazia
- Mensagem "Nenhuma conversa ainda"

**Causa:** O número não tem conversas ativas ou a API não retornou dados

**Solução:**
1. Enviar uma mensagem pelo celular
2. Aguardar alguns segundos
3. Clicar em "🔄 Atualizar"
4. Verificar se há erro na API

---

### Problema: Mensagens não aparecem

**Sintomas:**
- Conversa abre mas está vazia
- "Nenhuma mensagem ainda"

**Solução:**
1. Verificar se conversa tem mensagens no celular
2. Clicar em "🔄 Atualizar"
3. Trocar de conversa e voltar
4. Verificar logs do console (F12)

---

### Problema: Mensagens não enviam

**Sintomas:**
- Botão fica "⏳ Enviando..."
- Erro aparece no console

**Possíveis Causas:**
1. Número desconectou
2. Número bloqueou você
3. Formato de número incorreto
4. Erro na API

**Solução:**
1. Verificar status da instância (deve estar ✅)
2. Verificar console (F12) para erro específico
3. Tentar enviar mensagem pelo celular
4. Reconectar número se necessário

---

### Problema: Polling muito lento

**Sintomas:**
- Mensagens demoram para aparecer
- Delay de vários segundos

**Ajustar:**
Os intervalos estão em `WhatsAppChat.tsx`:

```typescript
// Mensagens: 5 segundos (linha ~228)
const interval = setInterval(() => {
  fetchMessages(selectedInstance, selectedChat.id);
}, 5000); // Alterar para 3000 (3s) se quiser mais rápido

// Instâncias: 30 segundos (linha ~209)
const interval = setInterval(() => {
  fetchInstances();
}, 30000); // Pode deixar assim
```

**Atenção:** Intervalos muito curtos podem causar muitas requisições à API.

---

## 💡 Dicas e Boas Práticas

### ✅ Recomendações:

1. **Mantenha Instâncias Conectadas**
   - Monitore status regularmente
   - Reconecte se cair

2. **Organize Conversas**
   - Nomes são ordenados por última mensagem
   - Mais recente no topo

3. **Use Atalhos**
   - `Enter` para enviar rápido
   - `Shift + Enter` para quebra de linha

4. **Monitore Não Lidas**
   - Badge verde mostra quantas novas

5. **Grupos**
   - Ícone 👥 indica grupo
   - Mostra nome de quem enviou

### ⚠️ Cuidados:

1. **Não Feche Abruptamente**
   - Polling pode estar rodando
   - Deixe finalizar antes de sair

2. **API Limits**
   - Evolution API tem limites de requisições
   - Não abuse do polling muito rápido

3. **Mídia**
   - Anexos estão em desenvolvimento
   - Por enquanto, apenas texto

---

## 🔮 Próximas Funcionalidades

### Em Desenvolvimento:

- [ ] **Enviar Imagens** - Upload e envio de fotos
- [ ] **Enviar Vídeos** - Upload e envio de vídeos
- [ ] **Enviar Áudios** - Gravação e envio de áudio
- [ ] **Enviar Documentos** - Upload de PDFs, docs, etc
- [ ] **Preview de Mídia** - Visualizar imagens/vídeos inline
- [ ] **Download de Arquivos** - Baixar documentos recebidos
- [ ] **Buscar Mensagens** - Pesquisar em conversas
- [ ] **Filtrar Conversas** - Buscar contatos
- [ ] **Marcar como Lida** - Gerenciar não lidas
- [ ] **Arquivar Conversas** - Organizar chats
- [ ] **Respostas Rápidas** - Templates de mensagem
- [ ] **Indicador de Digitação** - "Fulano está digitando..."
- [ ] **Notificações Desktop** - Alerta de novas mensagens
- [ ] **Dark Mode** - Tema escuro
- [ ] **Exportar Conversa** - Backup de mensagens

---

## 📚 Recursos Adicionais

### Documentação Relacionada

- **[WHATSAPP_MANAGER.md](./WHATSAPP_MANAGER.md)** - Como conectar números
- **[README_WHATSAPP.md](./README_WHATSAPP.md)** - Documentação técnica do Manager
- **[Evolution API Docs](https://doc.evolution-api.com)** - Documentação oficial

### Tecnologias

- **Frontend**: Next.js 14+ (App Router)
- **UI**: React 18+ com TypeScript
- **Styling**: TailwindCSS
- **Date Formatting**: date-fns
- **API**: Evolution API v2.3.0

---

## 🎉 Começar Agora!

```
1. Conecte um número → WhatsApp Manager
2. Acesse WhatsApp Chat
3. Selecione o número
4. Escolha uma conversa
5. Comece a conversar!
```

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de WhatsApp**

**Versão**: 1.0.0  
**Evolution API**: v2.3.0  
**Data**: 2025-11-12  
**Status**: ✅ Produção

---

## 🙏 Feedback

Encontrou algum problema? Tem sugestões?
- Verifique logs do console (F12)
- Consulte a documentação da Evolution API
- Reporte issues com detalhes

---

**📖 Para desenvolvedores**: Ver código-fonte em `front/src/components/admin/`
- `WhatsAppChat.tsx` - Componente principal
- `ChatList.tsx` - Lista de conversas
- `MessageView.tsx` - Área de mensagens



# 📱 WhatsApp Manager - Guia Completo

## 🎯 Visão Geral

O **WhatsApp Manager** é um painel de gerenciamento completo de instâncias do WhatsApp integrado com a **Evolution API**. Ele permite que você conecte, gerencie e monitore múltiplos números de WhatsApp diretamente do painel administrativo do seu sistema.

## ⚡ Recursos Principais

### ✅ Funcionalidades Disponíveis:

1. **Criar Instâncias** - Adicione novos números WhatsApp com identificação opcional
2. **Conectar via QR Code** - Autentique números escaneando QR Code (com avisos inteligentes)
3. **Visualizar Status** - Monitore o status de conexão em tempo real (polling a cada 10s)
4. **Perfil Completo** - Veja foto, nome e status do perfil WhatsApp
5. **Desconectar** - Desconecte números quando necessário
6. **Deletar Instâncias** - Remova instâncias permanentemente (botão sempre visível)
7. **Auto-refresh QR Code** - QR Code atualiza automaticamente a cada 60 segundos
8. **Controle de Tamanho** - Ajuste o tamanho do QR Code (Pequeno, Médio, Grande)
9. **Limpar e Reconectar** - Resolução automática de conflitos (erro 401)
10. **Detecção de Problemas** - Avisos inteligentes para timeouts e erros
11. **Prevenção de Duplicatas** - Sistema verifica números já conectados
12. **Interface Intuitiva** - Design moderno e responsivo com React.memo

## 🚀 Como Usar

### 1️⃣ Configurar Variáveis de Ambiente

Primeiro, configure suas credenciais da Evolution API no arquivo `.env.local`:

```bash
# Evolution API - WhatsApp Manager
NEXT_PUBLIC_EVOLUTION_API_URL=https://list-2-evolution-api.zqprdy.easypanel.host
NEXT_PUBLIC_EVOLUTION_API_KEY=sua-api-key-aqui
```

**Como obter a API Key:**
1. Acesse o painel da Evolution API: https://list-2-evolution-api.zqprdy.easypanel.host/manager/
2. Navegue até as configurações
3. Copie sua API Key
4. Cole no arquivo `.env.local`

### 2️⃣ Acessar o Painel

1. Acesse o painel admin: `http://localhost:3000/admin`
2. Clique na aba **"📱 WhatsApp Manager"**

### 3️⃣ Criar uma Nova Instância

1. Clique no botão **"➕ Nova Instância"**
2. Preencha os campos do modal:
   
   **Nome da Instância** (obrigatório):
   - Use apenas letras minúsculas, números e hífens
   - Exemplo: `empresa-whatsapp-01`, `vendas-whatsapp`, `suporte-01`
   
   **Número do WhatsApp** (opcional mas recomendado):
   - Inclua o código do país (ex: `5511999999999` para Brasil)
   - Ajuda a identificar a instância facilmente
   - Previne conexões duplicadas do mesmo número
   - Sistema verifica se o número já está conectado em outra instância

3. Leia a dica informativa sobre os benefícios de informar o número
4. Clique em **"Criar"**

💡 **Dica**: Informar o número ajuda a:
- Identificar qual WhatsApp está conectado
- Evitar conectar o mesmo número em múltiplas instâncias
- Melhor organização e gerenciamento

### 4️⃣ Conectar WhatsApp

Após criar a instância, o sistema automaticamente:
1. Gerará um QR Code
2. Exibirá o QR Code na tela
3. Iniciará auto-refresh a cada 60 segundos

**Para conectar (PASSO A PASSO CORRETO):**

⚠️ **IMPORTANTE:** Leia TODOS os passos antes de começar!

1. Abra o WhatsApp no seu celular
2. Toque em **Menu (⋮)** ou **Configurações**
3. Toque em **"Aparelhos conectados"**
4. Toque em **"Conectar um aparelho"**
5. **Escaneie o QR Code UMA VEZ APENAS**
6. 🔴 **IMEDIATAMENTE após escanear, FECHE o WhatsApp** (aperte Home ou Voltar)
7. **NÃO fique na tela "Conectando..."** - isso pode causar timeout!
8. Aguarde até 2 minutos
9. Verifique o status no painel web

**💡 Por que fechar o WhatsApp?**
- Ficar na tela "Conectando..." pode causar conflito entre a API e o WhatsApp
- Ao fechar o app, a conexão finaliza corretamente em background
- Essa é a forma mais confiável de conectar sem erros

**🚫 O que NÃO fazer:**
- ❌ NÃO escaneie o QR Code múltiplas vezes
- ❌ NÃO fique na tela "Conectando..." no celular
- ❌ NÃO abra o WhatsApp no celular enquanto está conectando
- ❌ NÃO clique em "Atualizar QR Code" sem necessidade

### 5️⃣ Gerenciar Instâncias

#### 🔗 Conectar / Reconectar
- **Conectar**: Gera QR Code para instâncias desconectadas
- **Reconectar**: Gera novo QR Code para instâncias conectadas (se precisar trocar de dispositivo)
- Sistema exibe avisos importantes antes do escaneamento
- QR Code fecha automaticamente ao conectar

#### 🔄 Limpar e Reconectar (Erro 401)
- Botão especial para resolver conflitos de conexão
- Aparece quando há erro 401 (Conflito Detectado)
- **Processo automático**:
  1. Faz logout da sessão
  2. Deleta a instância antiga
  3. Aguarda limpeza completa (~5s)
  4. Cria nova instância com o mesmo nome
  5. Gera novo QR Code
  6. Total: ~15 segundos
- Use quando:
  - Aparecer "Conflito Detectado"
  - QR Code foi escaneado múltiplas vezes
  - Sessão antiga não limpa corretamente

#### 🔌 Desconectar
- Faz logout do WhatsApp sem deletar a instância
- Instância permanece criada para reconexão futura
- Requer confirmação

#### 🗑️ Deletar
- Remove permanentemente a instância
- Não pode ser desfeito
- Requer confirmação
- **Botão sempre visível** em qualquer estado da instância

## 📊 Status e Avisos das Instâncias

### Status Possíveis

| Ícone | Status | Descrição | Ações Disponíveis |
|-------|--------|-----------|-------------------|
| ✅ | Conectado (`open`) | WhatsApp está conectado e funcionando | Reconectar, Desconectar, Deletar |
| ⏳ | Conectando (`connecting`) | Aguardando escaneamento do QR Code | Conectar, Deletar |
| ❌ | Desconectado (`close`) | WhatsApp não está conectado | Conectar, Deletar |

### Avisos Inteligentes

#### ⚠️ Problema de Timeout (Status: Conectando)

Quando uma instância fica muito tempo em "Conectando...", o sistema exibe um **aviso amarelo** com:

**O que está acontecendo:**
- Conexão demorando muito (timeout)
- WhatsApp pode estar bloqueando temporariamente
- Possível problema de rede ou firewall

**O que NÃO fazer:**
- ❌ NÃO escaneie o QR Code várias vezes
- ❌ NÃO tente reconectar imediatamente
- ❌ NÃO use o mesmo número em outro lugar

**Solução Recomendada:**
1. Deletar esta instância
2. **Aguardar 5-10 minutos** (essencial!)
3. Criar nova instância
4. Escanear QR Code **UMA VEZ APENAS**
5. Aguardar até 2 minutos pela conexão

⏰ **IMPORTANTE**: Aguarde 5-10 minutos antes de tentar novamente!

#### 🔴 Conflito de Conexão (Erro 401)

Quando há erro 401, o sistema exibe um **aviso vermelho** com:

**Possíveis Causas:**
- QR Code escaneado múltiplas vezes
- Mesmo número em outro lugar
- Sessão antiga não limpa

**Como Resolver:**
1. Clique em "Limpar e Reconectar"
2. Aguarde ~15 segundos
3. Escaneie o QR **UMA VEZ**

⚡ **Se persistir**: Aguarde 5min antes de tentar

### Informações do Perfil

Quando conectado, o sistema exibe:
- 📸 **Foto de perfil** - Avatar do WhatsApp
- 👤 **Nome do perfil** - Nome exibido no WhatsApp
- 💬 **Status personalizado** - Recado/frase do WhatsApp
- 📱 **Número conectado** - ownerJid completo

## 🎨 Interface

### Painel Principal

**Header**:
- Título e descrição
- Botão "➕ Nova Instância"
- Status da API Evolution (URL)
- Botão "🔄 Atualizar" manual
- Aviso sobre conflitos (dica amarela)
- Mensagens de erro (se houver)

**Grid de Dois Painéis**:
- **Esquerda**: Lista de Instâncias
- **Direita**: QR Code Display (quando ativo)

### Lista de Instâncias

Cada instância mostra:
- Nome da instância
- Nome do perfil (se conectado)
- Status com ícone e cor
- Foto de perfil (se conectado)
- Status personalizado (se disponível)
- Avisos contextuais (se aplicável)
- Botões de ação

**Contador no header**: Mostra total de instâncias

### QR Code Display

**Recursos**:
- 📱 **QR Code responsivo** - Imagem base64 ou texto
- 📏 **Controle de tamanho** - 3 opções:
  - Pequeno (200px)
  - Médio (280px) - padrão
  - Grande (350px)
- ⏱️ **Contador regressivo** - 60 segundos até auto-refresh
- ☑️ **Toggle Auto-refresh** - Ativar/desativar atualização automática
- 🔄 **Botão Atualizar** - Refresh manual do QR Code
- ⚠️ **Avisos críticos** - Orientações em destaque sobre como escanear
- 📋 **Instruções passo a passo** - Como acessar "Aparelhos conectados"
- ✕ **Botão Fechar** - Fecha o QR Code

**Avisos exibidos**:
1. 🚫 O que NÃO fazer (vermelho)
2. ✅ Passo a passo correto (verde)
3. 💡 Dica importante sobre fechar WhatsApp (azul)
4. ⏰ Aviso sobre timeout (amarelo)

**Fechamento automático**: QR Code fecha sozinho quando `connectionStatus === 'open'`

### Recursos da Interface

- 🔄 **Polling automático** - Atualiza status a cada 10 segundos
- 📱 **QR Code ajustável** - Controle de tamanho em 3 níveis
- ⏱️ **Contador regressivo** - 60s até auto-refresh do QR
- 🎯 **Botões contextuais** - Ações mudam conforme status
- 💬 **Mensagens claras** - Erros e orientações detalhadas
- ⚠️ **Avisos inteligentes** - Detecção de timeout e erro 401
- 🎨 **Design moderno** - TailwindCSS com gradientes e animações
- ⚡ **Performance otimizada** - React.memo em componentes
- 📊 **Informações completas** - Perfil, status, número conectado

## 🔧 Configurações Avançadas

### API Endpoints Utilizados

O sistema utiliza os seguintes endpoints da Evolution API:

```javascript
// Listar instâncias
GET /instance/fetchInstances

// Criar instância
POST /instance/create

// Conectar (obter QR Code)
GET /instance/connect/:instanceName

// Desconectar
DELETE /instance/logout/:instanceName

// Deletar instância
DELETE /instance/delete/:instanceName
```

### Headers Necessários

Todas as requisições incluem:
```javascript
{
  'Content-Type': 'application/json',
  'apikey': 'sua-api-key'
}
```

## 🛠️ Solução de Problemas

### Problema: Timeout ao Conectar (⏳ Fica em "Conectando...")

**Sintomas**:
- Status permanece em "⏳ Conectando..."
- Aviso amarelo aparece
- Nos logs da API: `"error in sending keep alive"`

**Causa**: QR Code escaneado múltiplas vezes ou ficou na tela "Conectando..." no celular

**Solução**:
1. **Deletar** a instância
2. **Aguardar 10 minutos** ⏰ (essencial!)
3. Criar nova instância
4. Escanear QR Code **UMA VEZ**
5. **FECHAR WhatsApp** imediatamente
6. Aguardar até 2 minutos

📖 **Ver guia completo**: [TROUBLESHOOTING_TIMEOUT.md](./TROUBLESHOOTING_TIMEOUT.md)

---

### Problema: Erro 401 (❌ Conflito Detectado)

**Sintomas**:
- Status "❌ Desconectado"
- Aviso vermelho: "Conflito de Conexão (Erro 401)"

**Causa**: QR Code escaneado múltiplas vezes ou sessão antiga não limpa

**Solução**:
1. Clicar em "🔄 Limpar e Reconectar"
2. Aguardar ~15 segundos (automático)
3. Escanear novo QR Code **UMA VEZ**
4. **FECHAR WhatsApp**

📖 **Ver guia completo**: [TROUBLESHOOTING_ERRO_401.md](./TROUBLESHOOTING_ERRO_401.md)

---

### Problema: "Erro ao buscar instâncias"

**Sintomas**:
- Mensagem de erro vermelha no topo
- Lista vazia ou não carrega

**Solução**:
1. Verificar `.env.local`:
   ```bash
   NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-api.com
   NEXT_PUBLIC_EVOLUTION_API_KEY=sua-chave
   ```
2. **Reiniciar servidor Next.js** após alterar `.env.local`
3. Verificar se Evolution API está online
4. Testar API manualmente:
   ```bash
   curl -H "apikey: SUA_CHAVE" https://sua-api.com/instance/fetchInstances
   ```

---

### Problema: "QR Code não aparece"

**Solução**:
1. Verificar se instância já está conectada (✅)
2. Clicar em "🔄 Atualizar" no header
3. Recarregar página (F5)
4. Verificar console do navegador (F12) para erros
5. Tentar reconectar a instância

---

### Problema: "Instância não conecta"

**Verificar**:
- ✅ Escaneou apenas uma vez?
- ✅ Fechou WhatsApp após escanear?
- ✅ Internet estável?
- ✅ WhatsApp atualizado?

**Solução**:
1. Seguir procedimento correto (ver seção "Conectar WhatsApp")
2. Se falhar, deletar instância
3. Aguardar 5-10 minutos
4. Criar nova instância

---

### Problema: "Já existe uma instância conectada com este número"

**Causa**: Tentativa de criar instância com número já em uso

**Solução**:
1. Verificar lista de instâncias
2. Deletar instância antiga se não estiver em uso
3. Ou usar número diferente
4. Sistema impede duplicatas automaticamente

## 📱 Boas Práticas

### ✅ Recomendações:

1. **Nomeação**: Use nomes descritivos para suas instâncias
   - ✅ Bom: `vendas-whatsapp`, `suporte-01`
   - ❌ Ruim: `test`, `abc123`

2. **Segurança**: 
   - Nunca compartilhe sua API Key
   - Mantenha o `.env.local` fora do controle de versão
   - Use instâncias dedicadas para cada propósito

3. **Manutenção**:
   - Remova instâncias não utilizadas
   - Monitore o status regularmente
   - Reconecte se a conexão cair

4. **Performance**:
   - Não crie mais instâncias do que o necessário
   - Use nomes únicos e identificáveis
   - Mantenha apenas instâncias ativas

## 🔐 Segurança

### Variáveis de Ambiente
As credenciais da API são armazenadas de forma segura em variáveis de ambiente e nunca são expostas no código frontend.

### HTTPS
Certifique-se de usar HTTPS em produção para proteger as comunicações com a Evolution API.

### API Key
- Mantenha sua API Key privada
- Rotacione a chave periodicamente
- Use chaves diferentes para desenvolvimento e produção

## 📚 Recursos Adicionais

### Documentação do Projeto

1. **[WHATSAPP_MANAGER.md](./WHATSAPP_MANAGER.md)** (este arquivo)
   - Guia completo do usuário
   - Como usar todas as funcionalidades
   - Solução de problemas comuns

2. **[README_WHATSAPP.md](./README_WHATSAPP.md)**
   - Documentação técnica completa
   - Arquitetura e componentes
   - Detalhes de implementação
   - API Integration
   - Para desenvolvedores

3. **[TROUBLESHOOTING_ERRO_401.md](./TROUBLESHOOTING_ERRO_401.md)**
   - Guia específico para erro 401 (Conflito)
   - Causas detalhadas
   - Solução passo a passo
   - Prevenção

4. **[TROUBLESHOOTING_TIMEOUT.md](./TROUBLESHOOTING_TIMEOUT.md)**
   - Guia específico para timeouts
   - O que causa timeout/keep-alive
   - Solução completa
   - Dicas de prevenção

### Documentação da Evolution API

- **[Site Oficial](https://evolution-api.com)**
- **[Documentação Completa](https://doc.evolution-api.com)**
- **[GitHub](https://github.com/EvolutionAPI/evolution-api)**
- **Versão utilizada**: v2.3.0
- **Integração**: WHATSAPP-BAILEYS

### Tecnologias

- **Frontend**: Next.js 14+ (App Router)
- **UI**: React 18+ com TypeScript
- **Styling**: TailwindCSS
- **State**: React Hooks (useState, useEffect)
- **Otimização**: React.memo

### Suporte

Para problemas específicos da Evolution API, consulte:
- Documentação oficial
- Issues no GitHub
- Comunidade Discord

Para problemas com este painel:
- Verificar documentação técnica ([README_WHATSAPP.md](./README_WHATSAPP.md))
- Verificar logs do console (F12)
- Verificar guias de troubleshooting específicos

## 🎉 Próximos Passos

Após conectar suas instâncias, você pode:
1. **Integrar com webhooks** - Receber eventos em tempo real
2. **Enviar mensagens automáticas** - Via Evolution API
3. **Criar fluxos de atendimento** - Automação de respostas
4. **Implementar chatbots** - Integração com Typebot/Dify
5. **Integrar com CRM** - Chatwoot e outros sistemas
6. **Gerenciar múltiplos números** - Até o limite do seu plano

### Exemplo de Uso da API

Após conectar, você pode enviar mensagens via API:

```bash
curl -X POST https://sua-api.com/message/sendText/nome-instancia \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_CHAVE" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Mensagem enviada via API."
  }'
```

### Integração com Webhooks

Configure webhooks para receber eventos:
- Mensagens recebidas
- Status de mensagens
- Mudanças de conexão
- Eventos de grupos

Ver documentação da Evolution API para detalhes.

---

## 📊 Resumo de Funcionalidades

```
✅ Criar instâncias com número opcional
✅ Conectar via QR Code com avisos inteligentes
✅ Polling automático de status (10s)
✅ Detecção de timeouts e erro 401
✅ Botão "Limpar e Reconectar" para conflitos
✅ Controle de tamanho do QR Code
✅ Auto-refresh do QR Code (60s)
✅ Fechamento automático ao conectar
✅ Perfil completo (foto, nome, status)
✅ Prevenção de duplicatas
✅ Botão deletar sempre visível
✅ Mensagens de erro claras
✅ Documentação completa
✅ Performance otimizada (React.memo)
```

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de WhatsApp**

**Versão**: 2.0.0  
**Evolution API**: v2.3.0 (WHATSAPP-BAILEYS)  
**Última atualização**: 2025-11-12  
**Status**: ✅ Produção

---

## 🙏 Agradecimentos

- **Evolution API** - Pela excelente API WhatsApp
- **Baileys** - Pela biblioteca base
- **Next.js & React** - Pelo framework robusto
- **TailwindCSS** - Pelo design system

---

**📖 Documentação completa**: Ver [README_WHATSAPP.md](./README_WHATSAPP.md) para detalhes técnicos


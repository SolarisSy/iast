# 📱 Documentação Técnica - WhatsApp Manager

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Funcionalidades](#funcionalidades)
5. [API Integration](#api-integration)
6. [Estados e Fluxos](#estados-e-fluxos)
7. [Troubleshooting](#troubleshooting)
8. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O **WhatsApp Manager** é um sistema completo de gerenciamento de instâncias WhatsApp integrado com a Evolution API v2.3.0. Permite conectar, monitorar e gerenciar múltiplos números WhatsApp através de uma interface web moderna e intuitiva.

### Tecnologias Utilizadas

- **Frontend**: Next.js 14+ (App Router)
- **UI**: React 18+ com TypeScript
- **Styling**: TailwindCSS
- **API**: Evolution API v2.3.0 (Baileys)
- **State Management**: React Hooks (useState, useEffect)
- **Performance**: React.memo para otimização

### Características Principais

✅ **Gerenciamento Completo**
- Criar, conectar, desconectar e deletar instâncias
- Suporte a múltiplas instâncias simultâneas
- Identificação por número de telefone (opcional)
- Prevenção de duplicatas

✅ **Interface Inteligente**
- QR Code com controle de tamanho (Pequeno, Médio, Grande)
- Auto-refresh configurável (60 segundos)
- Polling automático de status (10 segundos)
- Fechamento automático do QR Code ao conectar
- Avisos contextuais e orientações

✅ **Detecção e Resolução de Problemas**
- Detecção automática de timeouts (status "connecting")
- Detecção de conflitos (erro 401)
- Botão especializado "Limpar e Reconectar" para erro 401
- Avisos preventivos contra erros comuns
- Logs detalhados no console

✅ **Perfil e Status**
- Exibição de foto de perfil
- Nome do perfil WhatsApp
- Status personalizado
- Número conectado (ownerJid)

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
front/src/components/admin/
├── WhatsAppManager.tsx       # Componente principal (orquestrador)
├── QRCodeDisplay.tsx         # Exibição e controle do QR Code
├── InstanceList.tsx          # Lista de instâncias com ações
└── [outros componentes admin]

front/
├── WHATSAPP_MANAGER.md       # Guia do usuário
├── TROUBLESHOOTING_ERRO_401.md  # Guia para erro 401
├── TROUBLESHOOTING_TIMEOUT.md   # Guia para timeouts
└── README_WHATSAPP.md        # Documentação técnica (este arquivo)
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────┐
│         WhatsAppManager (Container)         │
│  - Gerencia estado global                   │
│  - Orquestra API calls                      │
│  - Controla modals e QR Code                │
└──────┬─────────────────────┬────────────────┘
       │                     │
       ▼                     ▼
┌──────────────┐    ┌────────────────┐
│ InstanceList │    │ QRCodeDisplay  │
│  - Lista     │    │  - QR Code     │
│  - Ações     │    │  - Timer       │
│  - Avisos    │    │  - Avisos      │
└──────────────┘    └────────────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
         ┌──────────────────┐
         │  Evolution API    │
         │  (Baileys v2.3.0) │
         └──────────────────┘
```

---

## 🧩 Componentes

### 1. WhatsAppManager (Container)

**Arquivo**: `WhatsAppManager.tsx`

**Responsabilidades**:
- Gerenciar estado de todas as instâncias
- Orquestrar chamadas à Evolution API
- Controlar exibição de modals e QR Code
- Implementar polling de status
- Gerenciar ciclo de vida de instâncias

**Estados**:
```typescript
const [instances, setInstances] = useState<Instance[]>([]);
const [loading, setLoading] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);
const [newInstanceName, setNewInstanceName] = useState('');
const [newInstanceNumber, setNewInstanceNumber] = useState('');
const [qrCode, setQrCode] = useState<string | null>(null);
const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Interface Instance**:
```typescript
interface Instance {
  id: string;                           // ID único
  name: string;                         // Nome da instância
  connectionStatus: string;             // 'open' | 'connecting' | 'close'
  ownerJid?: string | null;            // Número WhatsApp (formato: 5511999999999@s.whatsapp.net)
  profileName?: string | null;         // Nome do perfil
  profilePicUrl?: string | null;       // URL da foto de perfil
  profileStatus?: string | null;       // Status personalizado
  number?: string | null;              // Número informado na criação
  token: string;                        // Token de autenticação
  disconnectionReasonCode?: number | null;  // Código de erro (ex: 401)
  disconnectionObject?: string | null;      // Objeto de desconexão
}
```

**Funções Principais**:

1. **fetchInstances()** - Busca todas as instâncias
   - Endpoint: `GET /instance/fetchInstances`
   - Polling automático a cada 10 segundos
   - Atualiza estado `instances`

2. **createInstance()** - Cria nova instância
   - Endpoint: `POST /instance/create`
   - Valida nome (obrigatório)
   - Valida número (opcional, verifica duplicatas)
   - Gera QR Code automaticamente após criação
   - Body: `{ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS', number? }`

3. **getQRCode(instanceName)** - Obtém QR Code
   - Endpoint: `GET /instance/connect/:instanceName`
   - Retorna base64 ou código de texto
   - Define `selectedInstance` e `qrCode`

4. **disconnectInstance(instanceName)** - Desconecta instância
   - Endpoint: `DELETE /instance/logout/:instanceName`
   - Requer confirmação do usuário
   - Mantém instância (apenas faz logout)

5. **deleteInstance(instanceName)** - Deleta instância
   - Endpoint: `DELETE /instance/delete/:instanceName`
   - Requer confirmação do usuário
   - Remove permanentemente

6. **reconnectInstance(instanceName)** - Limpeza completa e reconexão
   - Processo em 8 passos (ver seção [Fluxo de Reconexão](#fluxo-de-reconexão))
   - Usado especialmente para erro 401
   - Deleta e recria instância completamente

**useEffect Hooks**:

1. **Polling de Instâncias**:
```typescript
useEffect(() => {
  fetchInstances();
  const interval = setInterval(() => {
    fetchInstances();
  }, 10000); // 10 segundos
  return () => clearInterval(interval);
}, []);
```

2. **Fechamento Automático do QR Code**:
```typescript
useEffect(() => {
  if (selectedInstance && qrCode) {
    const instance = instances.find(i => i.name === selectedInstance);
    if (instance && instance.connectionStatus === 'open') {
      setQrCode(null);
      setSelectedInstance(null);
    }
  }
}, [instances, selectedInstance, qrCode]);
```

---

### 2. QRCodeDisplay

**Arquivo**: `QRCodeDisplay.tsx`

**Responsabilidades**:
- Exibir QR Code (imagem base64 ou texto)
- Controlar tamanho do QR Code
- Gerenciar auto-refresh com contador
- Exibir avisos e orientações
- Instruções passo a passo

**Props**:
```typescript
interface QRCodeDisplayProps {
  qrCode: string;
  instanceName: string;
  onClose: () => void;
  onRefresh: () => void;
}
```

**Estados**:
```typescript
const [timeLeft, setTimeLeft] = useState(60);
const [autoRefresh, setAutoRefresh] = useState(true);
const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');
```

**Recursos**:

1. **Controle de Tamanho**:
   - Pequeno: `max-w-[200px]`
   - Médio: `max-w-[280px]` (padrão)
   - Grande: `max-w-[350px]`
   - `imageRendering: 'pixelated'` para melhor qualidade

2. **Auto-refresh**:
   - Contador regressivo de 60 segundos
   - Pode ser ativado/desativado
   - Chama `onRefresh()` ao chegar em 0

3. **Avisos Críticos** (em destaque):
   - ⚠️ **NÃO escaneie múltiplas vezes**
   - ⚠️ **NÃO fique na tela "Conectando..."**
   - ✅ **FECHE o WhatsApp após escanear**
   - ⏰ Aviso sobre timeout

4. **Instruções**:
   - Passo a passo visual
   - Como acessar "Aparelhos conectados"
   - Como escanear corretamente

**Otimização**:
```typescript
export const QRCodeDisplay = memo(QRCodeDisplayComponent);
```

---

### 3. InstanceList

**Arquivo**: `InstanceList.tsx`

**Responsabilidades**:
- Exibir lista de instâncias
- Mostrar status com cores e ícones
- Exibir avisos contextuais
- Gerenciar ações (conectar, desconectar, deletar, reconectar)
- Exibir informações do perfil

**Props**:
```typescript
interface InstanceListProps {
  instances: Instance[];
  loading: boolean;
  onConnect: (instanceName: string) => void;
  onDisconnect: (instanceName: string) => void;
  onDelete: (instanceName: string) => void;
  onReconnect: (instanceName: string) => void;
}
```

**Funções Auxiliares**:

1. **getStatusColor(status)** - Retorna classes CSS para o status
   - `open/connected` → verde
   - `connecting` → amarelo
   - `close/closed` → vermelho
   - `null/undefined` → cinza

2. **getStatusIcon(status)** - Retorna emoji para o status
   - `open/connected` → ✅
   - `connecting` → ⏳
   - `close/closed` → ❌
   - `null/undefined` → ❓

3. **isConnected(status)** - Verifica se está conectado
   - Retorna `true` se `open` ou `connected`

**Avisos Contextuais**:

1. **Timeout Warning** (status === 'connecting'):
```typescript
{status === 'connecting' && (
  <div className="...">
    <p>⚠️ Problema de Conexão Detectado</p>
    // Explicação detalhada
    // O que não fazer
    // Solução passo a passo
  </div>
)}
```

2. **Erro 401** (disconnectionReasonCode === 401):
```typescript
{status === 'close' && instance.disconnectionReasonCode === 401 && (
  <div className="...">
    <p>⚠️ Conflito de Conexão (Erro 401)</p>
    // Causas possíveis
    // Como resolver
    // Botão "Limpar e Reconectar"
  </div>
)}
```

**Botões de Ação**:

1. **Se Erro 401**: Botão "Limpar e Reconectar" (laranja/vermelho)
2. **Se Desconectado/Conectando**: Botão "Conectar" (verde)
3. **Se Conectado**: Botões "Reconectar" (azul) e "Desconectar" (laranja)
4. **Sempre**: Botão "Deletar" (vermelho) 🗑️

**Informações Exibidas**:
- Nome da instância
- Nome do perfil (se disponível)
- Status com ícone e cor
- Foto de perfil (se disponível)
- Status personalizado (se disponível)
- Avisos contextuais (se aplicável)

**Otimização**:
```typescript
export const InstanceList = memo(InstanceListComponent);
```

---

## ⚙️ Funcionalidades

### Criar Instância

**Fluxo**:
1. Usuário clica em "➕ Nova Instância"
2. Modal aparece com 2 campos:
   - **Nome da Instância** (obrigatório)
   - **Número do WhatsApp** (opcional)
3. Sistema valida:
   - Nome não vazio
   - Número não duplicado (se fornecido)
4. Envia requisição POST para `/instance/create`
5. Obtém QR Code automaticamente
6. Exibe QR Code para escaneamento

**Validações**:
- Nome obrigatório (`.trim()`)
- Número opcional, mas verifica duplicatas se fornecido
- Compara `number` e `ownerJid` de instâncias existentes

**Código**:
```typescript
// Verificar duplicatas
if (newInstanceNumber.trim()) {
  const existingWithNumber = instances.find(inst => 
    inst.number === newInstanceNumber.trim() || 
    (inst.ownerJid && inst.ownerJid.includes(newInstanceNumber.trim().replace(/\D/g, '')))
  );
  
  if (existingWithNumber) {
    setError(`Já existe uma instância conectada com este número: ${existingWithNumber.name}`);
    return;
  }
}
```

---

### Conectar Instância

**Fluxo**:
1. Usuário clica em "🔗 Conectar" em instância desconectada
2. Sistema chama `getQRCode(instanceName)`
3. QR Code é exibido no lado direito
4. Avisos críticos são mostrados
5. Usuário escaneia QR Code UMA VEZ
6. **Usuário FECHA o WhatsApp imediatamente**
7. Sistema faz polling a cada 10s para verificar status
8. Quando `connectionStatus === 'open'`, QR Code fecha automaticamente

**Importante**:
- ⚠️ Escanear múltiplas vezes causa timeout
- ⚠️ Ficar na tela "Conectando..." causa timeout
- ✅ Fechar WhatsApp após escanear é **ESSENCIAL**

---

### Desconectar Instância

**Fluxo**:
1. Usuário clica em "🔌 Desconectar"
2. Confirmação é solicitada
3. Sistema chama `DELETE /instance/logout/:instanceName`
4. Instância permanece criada, mas logout é feito
5. Status muda para `close`

**Uso**: Quando precisa desconectar temporariamente sem deletar.

---

### Deletar Instância

**Fluxo**:
1. Usuário clica em "🗑️"
2. Confirmação é solicitada
3. Sistema chama `DELETE /instance/delete/:instanceName`
4. Instância é removida permanentemente
5. Se QR Code estava aberto, é fechado
6. Lista é atualizada

**Uso**: Remoção permanente da instância.

---

### Limpar e Reconectar (Erro 401)

**Fluxo Completo** (8 Passos):

```typescript
// PASSO 1: Tentar logout/disconnect
await fetch(`${API_URL}/instance/logout/${instanceName}`, { method: 'DELETE' });
await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar 3s

// PASSO 2: Deletar instância
await fetch(`${API_URL}/instance/delete/${instanceName}`, { method: 'DELETE' });

// PASSO 3: Aguardar limpeza completa
await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5s

// PASSO 4: Verificar se instância ainda existe
const instances = await fetch(`${API_URL}/instance/fetchInstances`).then(r => r.json());
const existingInstance = instances.find((inst: any) => inst.name === instanceName);
if (existingInstance) {
  await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar mais 3s
}

// PASSO 5: Criar nova instância
await fetch(`${API_URL}/instance/create`, {
  method: 'POST',
  body: JSON.stringify({
    instanceName: instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS'
  })
});

// PASSO 6: Aguardar antes de obter QR
await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s

// PASSO 7: Obter QR Code
setSelectedInstance(instanceName);
await getQRCode(instanceName);

// PASSO 8: Atualizar lista
await fetchInstances();
```

**Quando usar**: 
- Erro 401 (Conflito Detectado)
- Problema de sessão antiga
- QR Code escaneado múltiplas vezes

**Tempo total**: ~13-16 segundos

---

### Polling de Status

**Implementação**:
```typescript
useEffect(() => {
  fetchInstances(); // Inicial
  
  const interval = setInterval(() => {
    fetchInstances(); // A cada 10s
  }, 10000);
  
  return () => clearInterval(interval); // Cleanup
}, []);
```

**Finalidade**:
- Atualizar status em tempo real
- Detectar quando instância conecta
- Detectar desconexões
- Atualizar informações de perfil

---

## 🔌 API Integration

### Endpoints da Evolution API

#### 1. Buscar Instâncias
```http
GET /instance/fetchInstances
Headers:
  Content-Type: application/json
  apikey: {API_KEY}

Response: Instance[]
```

#### 2. Criar Instância
```http
POST /instance/create
Headers:
  Content-Type: application/json
  apikey: {API_KEY}
Body:
  {
    "instanceName": "string",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "number": "string?" (opcional)
  }

Response:
  {
    "instance": {...},
    "hash": "string",
    "webhook": {...},
    "websocket": {...},
    "rabbitmq": {...},
    "sqs": {...},
    "typebot": {...},
    "proxy": {...},
    "chatwoot_account_id": null,
    "chatwoot_token": null,
    "chatwoot_url": null,
    "chatwoot_sign_msg": null,
    "chatwoot_reopen_conversation": false,
    "chatwoot_conversation_pending": false
  }
```

#### 3. Conectar (Obter QR Code)
```http
GET /instance/connect/:instanceName
Headers:
  Content-Type: application/json
  apikey: {API_KEY}

Response:
  {
    "base64": "string", // ou
    "code": "string"
  }
```

#### 4. Desconectar (Logout)
```http
DELETE /instance/logout/:instanceName
Headers:
  Content-Type: application/json
  apikey: {API_KEY}

Response: { success: boolean }
```

#### 5. Deletar Instância
```http
DELETE /instance/delete/:instanceName
Headers:
  Content-Type: application/json
  apikey: {API_KEY}

Response: { success: boolean }
```

### Tratamento de Erros

**Padrão de tratamento**:
```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro:', response.status, errorText);
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  // Processar data
} catch (err) {
  console.error('❌ Erro:', err);
  setError(`Mensagem de erro para o usuário`);
}
```

**Códigos de status comuns**:
- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (API key inválida)
- `404` - Not Found (instância não existe)
- `409` - Conflict (instância já existe)

---

## 🔄 Estados e Fluxos

### Estados de Conexão

```
┌──────────────┐
│   INICIAL    │
│   (vazio)    │
└──────┬───────┘
       │ createInstance()
       ▼
┌──────────────┐
│  CONNECTING  │  ← Aguardando QR Code
│     ⏳       │
└──────┬───────┘
       │ Escanear QR + Fechar WhatsApp
       ▼
┌──────────────┐
│     OPEN     │  ← Conectado
│      ✅      │
└──────┬───────┘
       │ disconnectInstance()
       ▼
┌──────────────┐
│    CLOSE     │  ← Desconectado
│      ❌      │
└──────────────┘
```

### Fluxo de Criação e Conexão

```
Usuário          Sistema              Evolution API
  │                 │                       │
  ├─ Nova Instância →│                       │
  │                 ├─ Validação            │
  │                 ├─ POST /create ───────→│
  │                 │                       ├─ Cria instância
  │                 │←──── Response ────────┤
  │                 ├─ GET /connect ───────→│
  │                 │                       ├─ Gera QR Code
  │                 │←──── QR Code ─────────┤
  │←─ Exibe QR ─────┤                       │
  │                 │                       │
  ├─ Escaneia QR ─→│                       │
  ├─ FECHA WhatsApp │                       │
  │                 │                       │
  │                 ├─ Polling (10s) ──────→│
  │                 │←──── status: open ────┤
  │←─ Fecha QR ─────┤                       │
  │                 │                       │
```

### Fluxo de Erro 401

```
Estado: close + disconnectionReasonCode: 401
  │
  ├─ Exibe aviso detalhado
  │  • Causas possíveis
  │  • Como resolver
  │
  ├─ Usuário clica "Limpar e Reconectar"
  │
  ├─ reconnectInstance()
  │  ├─ Logout (3s)
  │  ├─ Delete (5s)
  │  ├─ Verificar duplicatas (0-3s)
  │  ├─ Create (2s)
  │  ├─ Get QR Code
  │  └─ Fetch instances
  │
  └─ Usuário escaneia QR Code CORRETAMENTE
     └─ Conexão estabelecida
```

---

## 🐛 Troubleshooting

### Problema: Erro "Erro ao buscar instâncias"

**Sintomas**:
- Mensagem de erro vermelha no topo
- Lista vazia ou não carrega

**Possíveis Causas**:
1. API_URL incorreta no `.env.local`
2. API_KEY incorreta ou expirada
3. Evolution API offline/inacessível
4. CORS bloqueando requisições

**Solução**:
1. Verificar `.env.local`:
   ```bash
   NEXT_PUBLIC_EVOLUTION_API_URL=https://sua-api.com
   NEXT_PUBLIC_EVOLUTION_API_KEY=sua-chave
   ```
2. Reiniciar servidor Next.js após alterar `.env.local`
3. Testar API manualmente:
   ```bash
   curl -H "apikey: SUA_CHAVE" https://sua-api.com/instance/fetchInstances
   ```
4. Verificar logs do console (F12)

---

### Problema: Timeout ao Conectar

**Sintomas**:
- Status fica em "Conectando..." (⏳)
- Aviso amarelo aparece
- Nos logs da API: `"error in sending keep alive"`
- `qrcodeCount` aumentando (2, 3, 4, 5...)

**Causas Comuns**:
1. QR Code escaneado múltiplas vezes
2. Ficou na tela "Conectando..." no celular
3. Tentativas rápidas de reconexão
4. WhatsApp bloqueou temporariamente

**Solução**:
1. **DELETAR** a instância problemática
2. **AGUARDAR 10 MINUTOS** ⏰ (essencial!)
3. Criar nova instância (pode usar nome diferente)
4. Escanear QR Code **UMA VEZ**
5. **FECHAR WhatsApp IMEDIATAMENTE**
6. Aguardar até 2 minutos
7. Se falhar, aguardar 5-10min antes de nova tentativa

**Ver**: `TROUBLESHOOTING_TIMEOUT.md` para guia completo

---

### Problema: Erro 401 (Conflito Detectado)

**Sintomas**:
- Status "Desconectado" (❌)
- Aviso vermelho: "Conflito de Conexão (Erro 401)"
- `disconnectionReasonCode: 401`

**Causas**:
- QR Code escaneado múltiplas vezes
- Mesmo número conectado em outro lugar
- Sessão antiga não limpa corretamente

**Solução**:
1. Clicar em "🔄 Limpar e Reconectar"
2. Aguardar ~15 segundos (processo automático)
3. Novo QR Code aparecerá
4. Escanear **UMA VEZ**
5. **FECHAR WhatsApp**
6. Aguardar conexão

**Se persistir**:
- Aguardar 5-10 minutos
- Tentar novamente
- Se continuar, aguardar 24h antes de usar esse número

**Ver**: `TROUBLESHOOTING_ERRO_401.md` para guia completo

---

### Problema: QR Code Não Aparece

**Sintomas**:
- Clica em "Conectar" mas nada acontece
- Lado direito permanece vazio

**Soluções**:
1. Verificar se instância já está conectada (status ✅)
2. Clicar em "🔄 Atualizar" no header
3. Recarregar página (F5)
4. Verificar console (F12) para erros
5. Tentar reconectar a instância

---

### Problema: Instância Não Conecta

**Sintomas**:
- QR Code escaneado mas status continua "Conectando..."
- Ou muda para "Desconectado" após alguns minutos

**Verificar**:
1. Escaneou **apenas uma vez**?
2. Fechou o WhatsApp após escanear?
3. Internet estável no celular e PC?
4. WhatsApp atualizado no celular?

**Solução**:
1. Verificar os passos acima
2. Deletar instância
3. Aguardar 5-10 minutos
4. Criar nova instância
5. Seguir procedimento correto

---

## 🔧 Manutenção

### Logs do Console

O sistema registra logs detalhados:

```javascript
// Criação
console.log('✅ Instância criada:', newInstanceName);
console.log('📱 Criando instância com número:', number);

// Reconexão
console.log('🔄 Iniciando limpeza completa da instância:', instanceName);
console.log('🔌 Tentando desconectar sessão do WhatsApp...');
console.log('✅ Logout realizado com sucesso');
console.log('🗑️ Deletando instância...');
console.log('✅ Instância deletada');
console.log('⏳ Aguardando 5 segundos para limpeza completa...');
console.log('➕ Criando nova instância...');
console.log('✅ Nova instância criada:', data);
console.log('📱 Obtendo QR Code...');
console.log('✅ Reconexão concluída com sucesso!');

// Erros
console.error('❌ Erro ao buscar instâncias:', status, errorText);
console.error('❌ Erro ao criar instância:', err);
console.error('❌ Erro ao obter QR Code:', err);
```

### Monitoramento

**Métricas importantes**:
1. Número de instâncias ativas
2. Taxa de sucesso de conexão
3. Frequência de erros 401
4. Tempo médio de conexão
5. Número de timeouts

**Como monitorar**:
- Console do navegador (F12)
- Logs da Evolution API
- Métricas do painel Evolution

### Limpeza

**Quando deletar instâncias**:
- Números não mais em uso
- Instâncias de teste
- Instâncias com erro persistente
- Duplicatas

**Como deletar**:
1. Clicar no botão 🗑️
2. Confirmar exclusão
3. Instância removida permanentemente

### Backup

**Não há backup automático**. Para preservar configurações:
1. Anotar nomes de instâncias
2. Anotar números conectados
3. Documentar propósito de cada instância

**Recriação**:
- Instâncias podem ser recriadas facilmente
- QR Code precisa ser escaneado novamente
- Histórico de mensagens não é afetado (está no WhatsApp)

### Atualizações

**Ao atualizar o código**:
1. Revisar interface `Instance` para mudanças na API
2. Verificar novos endpoints da Evolution API
3. Testar fluxo completo em desenvolvimento
4. Verificar logs no console
5. Testar erro 401 e timeout scenarios

### Performance

**Otimizações implementadas**:
1. `React.memo` em `QRCodeDisplay` e `InstanceList`
2. Polling de 10s (não mais rápido)
3. Fechamento automático de QR Code
4. Debounce implícito em auto-refresh

**Evitar**:
- Polling muito rápido (< 5s)
- Re-renderizações desnecessárias
- Múltiplas chamadas simultâneas à API

---

## 📚 Referências

### Documentos do Projeto

1. **WHATSAPP_MANAGER.md** - Guia do usuário
2. **TROUBLESHOOTING_ERRO_401.md** - Solução para erro 401
3. **TROUBLESHOOTING_TIMEOUT.md** - Solução para timeouts
4. **README_WHATSAPP.md** - Este documento (técnico)

### Evolution API

- [Site Oficial](https://evolution-api.com)
- [Documentação](https://doc.evolution-api.com)
- [GitHub](https://github.com/EvolutionAPI/evolution-api)
- Versão utilizada: **v2.3.0**
- Integração: **WHATSAPP-BAILEYS**

### Tecnologias

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## 🎯 Checklist de Implementação

Para implementar o WhatsApp Manager em um novo projeto:

- [ ] Instalar Next.js 14+ com App Router
- [ ] Configurar TypeScript
- [ ] Instalar TailwindCSS
- [ ] Ter instância Evolution API v2.3.0
- [ ] Obter API Key da Evolution API
- [ ] Criar `.env.local` com credenciais
- [ ] Copiar componentes (`WhatsAppManager.tsx`, `QRCodeDisplay.tsx`, `InstanceList.tsx`)
- [ ] Integrar no painel admin
- [ ] Testar criação de instância
- [ ] Testar conexão com QR Code
- [ ] Testar polling de status
- [ ] Testar erro 401
- [ ] Testar timeout
- [ ] Revisar avisos e orientações
- [ ] Testar em produção

---

**Última atualização**: 2025-11-12  
**Versão**: 2.0.0  
**Autor**: Sistema IA  
**Status**: ✅ Produção



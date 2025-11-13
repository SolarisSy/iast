# 📝 Changelog - WhatsApp Manager

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2025-11-12

### 🎉 Versão Completa com Todas as Funcionalidades

#### ✨ Adicionado

**Recursos Principais:**
- Sistema completo de gerenciamento de instâncias WhatsApp
- Integração com Evolution API v2.3.0 (Baileys)
- Criação de instâncias com número opcional
- Prevenção de duplicatas (verificação de número)
- Perfil completo do usuário (foto, nome, status, número)
- Botão "Deletar" sempre visível em todos os estados

**QR Code Avançado:**
- Controle de tamanho do QR Code (Pequeno, Médio, Grande)
- Auto-refresh configurável (60 segundos)
- Fechamento automático ao conectar
- Avisos críticos sobre procedimento correto
- Instruções passo a passo
- Contador regressivo visual

**Detecção e Resolução de Problemas:**
- Detecção automática de timeout (status "connecting" prolongado)
- Detecção de erro 401 (Conflito Detectado)
- Botão especializado "Limpar e Reconectar" para erro 401
- Avisos contextuais amarelos para timeout
- Avisos contextuais vermelhos para erro 401
- Orientações detalhadas de solução inline

**Interface e UX:**
- Polling automático de status (10 segundos)
- Modal de criação com 2 campos (nome + número opcional)
- Grid responsivo de 2 colunas (lista + QR Code)
- Status com ícones e cores (✅ ⏳ ❌)
- Mensagens de erro claras e acionáveis
- Design moderno com TailwindCSS
- Gradientes e animações sutis

**Performance:**
- React.memo em `QRCodeDisplay` e `InstanceList`
- Otimização de re-renderizações
- Polling controlado (10s, não mais rápido)

**Documentação:**
- `WHATSAPP_MANAGER.md` - Guia completo do usuário
- `README_WHATSAPP.md` - Documentação técnica detalhada
- `TROUBLESHOOTING_ERRO_401.md` - Guia específico erro 401
- `TROUBLESHOOTING_TIMEOUT.md` - Guia específico timeouts
- `CHANGELOG_WHATSAPP.md` - Este arquivo

#### 🔧 Corrigido

**Bugs Resolvidos:**
- Erro: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`
  - **Causa**: API retorna `name` e `connectionStatus`, não `instanceName` e `status`
  - **Solução**: Atualizada interface `Instance` e componentes

- Erro: `Warning: Each child in a list should have a unique "key" prop.`
  - **Causa**: Faltava key prop nos itens mapeados
  - **Solução**: Adicionado `key={instanceName || index}`

- Problema: Status não atualiza em tempo real
  - **Causa**: Faltava polling
  - **Solução**: Implementado `setInterval` de 10s

- Problema: QR Code não atualiza e fica "connecting" no celular
  - **Causa**: Escanear múltiplas vezes, ficar na tela "Conectando..."
  - **Solução**: Avisos detalhados, orientação para fechar WhatsApp

- Problema: Erro 401 persistente
  - **Causa**: Sessão antiga não limpa, múltiplos escaneamentos
  - **Solução**: Implementado processo de 8 passos "Limpar e Reconectar"

- Problema: Console "spamming" informações
  - **Causa**: Logs excessivos em cada chamada
  - **Solução**: Removidos logs desnecessários, mantidos apenas essenciais

- Problema: Tela "flickering" com perfil conectado
  - **Causa**: Re-renderizações excessivas
  - **Solução**: React.memo e aumento de intervalo de polling

- Problema: Botão deletar sumiu
  - **Causa**: Lógica condicional ocultava o botão em certos estados
  - **Solução**: Botão deletar sempre visível

- Problema: QR Code muito grande na tela
  - **Causa**: Tamanho fixo grande
  - **Solução**: Controle de tamanho com 3 opções, padrão médio (280px)

#### 🚀 Melhorado

**UX/UI:**
- Interface mais limpa e organizada
- Avisos mais destacados e informativos
- Cores e ícones melhor diferenciados
- Modal de criação com dicas contextuais
- Feedback visual em todas as ações

**Performance:**
- Polling otimizado de 5s para 10s
- Componentes memorizados
- Menos re-renderizações

**Documentação:**
- Documentação completa e detalhada
- Guias específicos para cada problema
- Exemplos de uso e código
- Troubleshooting passo a passo

#### 🔐 Segurança

- Variáveis de ambiente para credenciais
- API Key nunca exposta no código
- Headers corretos em todas as requisições
- Validação de dados antes de enviar

#### 📚 Documentação

Arquivos criados/atualizados:
- `WHATSAPP_MANAGER.md` - 560 linhas
- `README_WHATSAPP.md` - 1000+ linhas
- `TROUBLESHOOTING_ERRO_401.md` - 200+ linhas
- `TROUBLESHOOTING_TIMEOUT.md` - 220+ linhas
- `CHANGELOG_WHATSAPP.md` - Este arquivo
- `env.local.example` - Template atualizado

---

## [1.1.0] - 2025-11-11

### 🔧 Correções e Melhorias Intermediárias

#### Corrigido
- Estrutura de dados da API Evolution
- Campos `name` e `connectionStatus`
- Key prop warnings no React

#### Adicionado
- Polling básico (5 segundos)
- Logs de debug no console
- Documentação inicial

---

## [1.0.0] - 2025-11-10

### 🎉 Versão Inicial

#### Adicionado
- Estrutura básica do WhatsApp Manager
- Componentes principais:
  - `WhatsAppManager.tsx`
  - `QRCodeDisplay.tsx`
  - `InstanceList.tsx`
- Funcionalidades básicas:
  - Criar instância
  - Obter QR Code
  - Conectar via QR
  - Desconectar
  - Deletar
- Integração inicial com Evolution API
- Interface básica com TailwindCSS

---

## 📊 Estatísticas

### Linhas de Código

```
WhatsAppManager.tsx:  ~580 linhas
QRCodeDisplay.tsx:    ~210 linhas
InstanceList.tsx:     ~320 linhas
Total Componentes:    ~1110 linhas

Documentação:         ~2000+ linhas
Total Projeto:        ~3100+ linhas
```

### Commits Principais

- Implementação inicial
- Correção de bugs de estrutura de dados
- Adição de polling
- Implementação de detecção de problemas
- Adição de avisos e orientações
- Otimização de performance
- Documentação completa

---

## 🔮 Futuro

### Planejado (v2.1.0)

- [ ] Histórico de conexões
- [ ] Estatísticas de uso
- [ ] Exportar configurações
- [ ] Temas claro/escuro
- [ ] Notificações desktop
- [ ] Busca e filtro de instâncias
- [ ] Agrupamento por tags
- [ ] Backup automático de configurações

### Em Consideração (v3.0.0)

- [ ] Enviar mensagens pelo painel
- [ ] Visualizar conversas
- [ ] Integração com webhooks no painel
- [ ] Dashboard de métricas
- [ ] Multi-usuário com permissões
- [ ] API própria para automações
- [ ] Templates de mensagens
- [ ] Agendamento de mensagens

---

## 🙏 Contribuidores

- **Desenvolvedor Principal**: Sistema IA
- **Tester e Feedback**: Usuário (descobriu comportamento crítico de fechar WhatsApp)
- **API**: Evolution API Team
- **Framework**: Next.js & React Teams

---

## 📝 Notas de Versão

### Compatibilidade

- **Evolution API**: v2.3.0 ou superior
- **Next.js**: 14.0.0 ou superior
- **React**: 18.0.0 ou superior
- **Node.js**: 18.0.0 ou superior

### Breaking Changes

#### v2.0.0
- Interface `Instance` atualizada (campos renomeados)
- `instanceName` → `name`
- `status` → `connectionStatus`
- Componentes precisam ser atualizados se usados separadamente

#### v1.1.0
- Polling interval mudado de 5s para 10s

### Migrações

#### De v1.x para v2.0

1. Atualizar interface `Instance`:
```typescript
// Antes (v1.x)
interface Instance {
  instanceName: string;
  status: string;
}

// Depois (v2.0)
interface Instance {
  name: string;
  connectionStatus: string;
  ownerJid?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
  profileStatus?: string | null;
  number?: string | null;
  disconnectionReasonCode?: number | null;
  disconnectionObject?: string | null;
}
```

2. Atualizar referências:
```typescript
// Antes
instance.instanceName
instance.status

// Depois
instance.name
instance.connectionStatus
```

3. Adicionar React.memo para performance:
```typescript
export const MyComponent = memo(MyComponentFunction);
```

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar documentação: `README_WHATSAPP.md`
2. Verificar troubleshooting específico
3. Verificar logs do console (F12)
4. Verificar logs da Evolution API

---

**Última atualização**: 2025-11-12
**Versão atual**: 2.0.0
**Status**: ✅ Produção



# 🔧 Troubleshooting: Erro de Timeout/Keep-Alive

## 📋 Sintomas do Problema

Você está enfrentando esse problema se:

- ✅ O painel mostra status "Conectado"
- ❌ No celular fica "Conectando..." e depois desconecta
- ❌ Nos logs da API aparece: `"error in sending keep alive"` ou `"Error: Timed Out"`
- ❌ QR Code gerado múltiplas vezes (qrcodeCount: 1, 2, 3, 4, 5...)

## 🔍 O Que Está Acontecendo

O WhatsApp possui **proteções anti-spam** que detectam:

1. **Múltiplas tentativas de conexão** em curto período
2. **QR Codes escaneados várias vezes** seguidas
3. **Padrões suspeitos de comportamento**

Quando isso acontece, o WhatsApp **bloqueia temporariamente** novas tentativas de conexão do seu número, causando timeout no keep-alive (comunicação que mantém a conexão ativa).

## ⚠️ Causas Mais Comuns

### 1. Escanear QR Code Múltiplas Vezes
❌ **ERRADO:**
- Escanear o QR Code
- Ver que está demorando
- Escanear novamente
- Repetir várias vezes

✅ **CORRETO:**
- Escanear UMA VEZ APENAS
- **FECHAR o WhatsApp no celular imediatamente**
- Aguardar até 2 minutos
- Se não conectar, aguardar 5-10 minutos antes de tentar novamente

### 1.5. Ficar na Tela "Conectando..." (CRÍTICO! ⚠️)
❌ **ERRADO:**
- Escanear o QR Code
- Ficar olhando a tela "Conectando..." no celular
- Esperar o WhatsApp conectar na tela do celular

✅ **CORRETO:**
- Escanear o QR Code UMA VEZ
- **FECHAR o WhatsApp imediatamente** (ou apertar Home/Voltar)
- Deixar a conexão finalizar em background
- Verificar status no painel web

**POR QUÊ?** Ficar na tela "Conectando..." pode causar conflito entre a API e o WhatsApp, resultando em timeout. Ao fechar o app, o WhatsApp finaliza a conexão em background corretamente.

### 2. Reconectar Muito Rápido
❌ **ERRADO:**
- Tentar conectar
- Falhar
- Tentar novamente imediatamente
- Usar botão "Limpar e Reconectar" várias vezes seguidas

✅ **CORRETO:**
- Tentar conectar
- Se falhar, **AGUARDAR 5-10 MINUTOS**
- Então tentar novamente

### 3. Múltiplas Instâncias do Mesmo Número
❌ **ERRADO:**
- Criar várias instâncias para o mesmo número
- Tentar conectar o mesmo número em lugares diferentes
- Deixar WhatsApp Web aberto enquanto conecta na API

✅ **CORRETO:**
- Uma instância por número
- Desconectar de todos os outros lugares
- Fechar WhatsApp Web antes de conectar

## 🛠️ Solução Passo a Passo

### Opção 1: Aguardar e Tentar Novamente (Recomendado)

1. **Delete a instância atual**
   ```
   - Clique no botão 🗑️ na instância problemática
   - Confirme a exclusão
   ```

2. **AGUARDE 5-10 MINUTOS** ⏰
   - Isso é **ESSENCIAL**
   - O WhatsApp precisa desse tempo para "esquecer" as tentativas anteriores
   - Use um timer se necessário

3. **Feche todas as outras sessões**
   - Desconecte WhatsApp Web
   - Desconecte WhatsApp Desktop
   - Verifique em: WhatsApp > ⋮ > Aparelhos conectados

4. **Crie nova instância**
   - Use um nome diferente se possível
   - Informe o número do WhatsApp para melhor identificação

5. **Escaneie o QR Code UMA VEZ APENAS**
   - Aponte a câmera do celular
   - Escaneie o QR Code
   - **FECHE o WhatsApp imediatamente** (ou aperte Home/Voltar)
   - Não fique na tela "Conectando..."
   - Não atualize o QR
   - Não escaneie novamente

6. **Aguarde a conexão finalizar**
   - **Não abra o WhatsApp no celular**
   - Deixe a conexão finalizar em background
   - Aguarde até 2 minutos
   - Monitore o status no painel web

7. **Verifique a conexão**
   - Se em 2 minutos não conectar: **PARE**
   - Delete a instância
   - Aguarde mais 10 minutos
   - Tente novamente

### Opção 2: Usar Outro Número (Alternativa)

Se o problema persistir mesmo após aguardar:

1. O número pode estar **temporariamente bloqueado** pelo WhatsApp
2. Aguarde **24 horas** antes de tentar novamente com esse número
3. Se urgente, use outro número temporariamente

## 📊 Logs da API - O Que Observar

### ✅ Conexão Bem-Sucedida
```
[Evolution API] [instancia] INFO Browser: Evolution API,Chrome...
[Evolution API] [instancia] LOG { instance: instancia pairingCode: null, qrcodeCount: 1 }
[Evolution API] [instancia] INFO Connection opened
```

### ❌ Problema de Timeout
```
[Evolution API] [instancia] LOG { instance: instancia pairingCode: null, qrcodeCount: 5 }
{"level":50,"msg":"error in sending keep alive","trace":"Error: Timed Out"}
[Evolution API] [instancia] LOG { instance: instancia pairingCode: null, qrcodeCount: 6 }
```

Se você ver `qrcodeCount` aumentando muito (> 3), **PARE IMEDIATAMENTE** e siga a solução acima.

## 🚫 O Que NÃO Fazer

1. ❌ **NÃO** fique na tela "Conectando..." no celular após escanear
2. ❌ **NÃO** fique atualizando o QR Code repetidamente
3. ❌ **NÃO** escaneie o QR Code múltiplas vezes
4. ❌ **NÃO** use o botão "Reconectar" várias vezes seguidas
5. ❌ **NÃO** delete e recrie a instância imediatamente
6. ❌ **NÃO** tente forçar a conexão
7. ❌ **NÃO** use múltiplas instâncias com o mesmo número
8. ❌ **NÃO** abra o WhatsApp no celular enquanto está conectando

## 💡 Dicas de Prevenção

### Para Evitar o Problema

1. **Sempre aguarde entre tentativas**
   - Mínimo: 5 minutos
   - Recomendado: 10 minutos
   - Se bloqueado: 24 horas

2. **Escaneie o QR Code apenas uma vez**
   - Não fique testando
   - Tenha certeza antes de escanear

3. **Uma instância por número**
   - Não crie instâncias duplicadas
   - Delete as antigas antes de criar novas

4. **Monitore os logs**
   - Se ver `qrcodeCount` alto, pare
   - Se ver "Timed Out", aguarde

5. **Use números diferentes para testes**
   - Não use seu número principal para testar
   - Tenha um número de teste separado

## 🆘 Quando Procurar Ajuda

Procure suporte se:

1. Você seguiu TODOS os passos acima
2. Aguardou **24 horas** completas
3. O problema persiste com **números diferentes**
4. Os logs mostram erros diferentes de timeout

Ao solicitar ajuda, forneça:
- Logs completos da Evolution API
- Tempo aguardado entre tentativas
- Número de tentativas realizadas
- Se o problema ocorre com múltiplos números

## 📌 Resumo Rápido

```
┌──────────────────────────────────────────┐
│  🎯 REGRA DE OURO                        │
├──────────────────────────────────────────┤
│  1. Escaneie QR Code UMA VEZ             │
│  2. FECHE WhatsApp no celular            │
│  3. Aguarde 2 minutos                    │
│  4. Se falhar, AGUARDE 5-10 minutos      │
│  5. Delete e tente novamente             │
│  6. NUNCA tente várias vezes rápido      │
│  7. NUNCA fique na tela "Conectando..."  │
└──────────────────────────────────────────┘
```

## 🔗 Links Úteis

- [WHATSAPP_MANAGER.md](./WHATSAPP_MANAGER.md) - Documentação geral
- [TROUBLESHOOTING_ERRO_401.md](./TROUBLESHOOTING_ERRO_401.md) - Erro 401 específico

---

**Última atualização:** 2025-11-12
**Versão:** 1.0.0


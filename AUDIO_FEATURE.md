# Funcionalidade de Conversa por Áudio

## Visão Geral

A aplicação agora suporta conversa por áudio usando as APIs de Speech-to-Text e Text-to-Speech da OpenAI. Os usuários podem gravar mensagens de áudio e receber respostas também em áudio.

## Componentes Implementados

### Frontend

1. **AudioRecorder** (`src/components/audio/AudioRecorder.tsx`)
   - Componente para gravação de áudio usando MediaRecorder API
   - Suporte a permissões de microfone
   - Timer de gravação em tempo real
   - Controles de iniciar/parar gravação

2. **AudioPlayer** (`src/components/audio/AudioPlayer.tsx`)
   - Componente para reprodução de áudio
   - Controles de play/pause
   - Barra de progresso
   - Indicador de tempo

3. **AudioControls** (`src/components/audio/AudioControls.tsx`)
   - Componente principal que combina gravação e reprodução
   - Interface unificada para conversa por áudio
   - Indicadores de processamento

4. **Chat** (modificado)
   - Integração dos controles de áudio
   - Processamento de mensagens de áudio
   - Estados de loading para áudio

### Backend

1. **Endpoint `/api/audio/transcribe`**
   - Converte áudio em texto usando OpenAI Whisper
   - Suporte a arquivos de áudio até 25MB
   - Detecção automática de idioma português

2. **Endpoint `/api/audio/synthesize`**
   - Converte texto em áudio usando OpenAI TTS
   - Voz "nova" para melhor qualidade
   - Retorna áudio em formato MP3

3. **Endpoint `/api/audio/chat`**
   - Fluxo completo: áudio → texto → resposta → áudio
   - Integração com a lógica de chat existente
   - Processamento de histórico de conversa

## Como Usar

### 1. Gravação de Áudio
- Clique no botão "Gravar" para iniciar a gravação
- Fale sua pergunta ou mensagem
- Clique em "Parar" quando terminar
- O áudio será automaticamente processado

### 2. Reprodução de Resposta
- Após o processamento, a resposta em áudio aparecerá automaticamente
- Use os controles de play/pause para ouvir a resposta
- A transcrição da sua mensagem também será exibida no chat

### 3. Requisitos Técnicos
- Navegador com suporte a MediaRecorder API
- Permissão de microfone concedida
- Conexão com internet para APIs da OpenAI

## Fluxo Técnico

1. **Gravação**: Usuário grava áudio no navegador
2. **Upload**: Áudio é enviado para `/api/audio/chat`
3. **Transcrição**: OpenAI Whisper converte áudio em texto
4. **Processamento**: Texto é processado pela lógica de chat existente
5. **Síntese**: Resposta é convertida em áudio pela OpenAI TTS
6. **Reprodução**: Áudio de resposta é reproduzido no navegador

## Configuração

### Backend
- Certifique-se de que a `OPENAI_API_KEY` está configurada no arquivo `backend/.env`
- O servidor backend deve estar rodando na porta 4000

### Frontend
- O frontend deve estar rodando na porta 3000
- Certifique-se de que o CORS está configurado no backend

## Limitações

- Tamanho máximo de arquivo de áudio: 25MB
- Qualidade de áudio depende do microfone do usuário
- Requer conexão com internet para processamento
- Suporte limitado a navegadores modernos

## Troubleshooting

### Erro de Permissão de Microfone
- Verifique se o navegador tem permissão para acessar o microfone
- Recarregue a página e conceda permissão quando solicitado

### Erro de Processamento de Áudio
- Verifique se o backend está rodando
- Confirme se a API key da OpenAI está configurada
- Verifique os logs do backend para erros específicos

### Problemas de Qualidade de Áudio
- Use um microfone de boa qualidade
- Fale claramente e em ambiente silencioso
- Evite gravações muito longas (> 5 minutos)

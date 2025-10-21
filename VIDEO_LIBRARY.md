# 📚 Biblioteca de Vídeos - Aulas do Mentor

## 📁 Estrutura de Arquivos

```
public/video/
├── vd1.mp4 - Princípios do Direito Administrativo
└── vd2.mp4 - As normas que regulam a atividade administrativa
```

## 🎯 Funcionalidades

### ✅ Biblioteca de Vídeos
- **Localização**: Lado direito da tela principal
- **Nome**: "Aulas do Mentor"
- **Layout**: Grid responsivo com cards de vídeo
- **Sticky**: A biblioteca permanece visível ao rolar a página

### 🎬 Player de Vídeo
- **Modal em Tela Cheia**: Abre um modal elegante ao clicar em qualquer vídeo
- **Player Nativo HTML5**: Controles completos de vídeo (play, pause, volume, fullscreen)
- **Auto-play**: Vídeo inicia automaticamente ao abrir
- **Fechar Modal**:
  - Botão "X" no canto superior direito
  - Botão "Fechar" no rodapé
  - Tecla ESC do teclado

### 📱 Responsividade
- **Desktop**: 3 colunas (Avatar | Chat | Vídeos)
- **Tablet/Mobile**: Empilhamento vertical

## 🎨 Design

### Estilo Visual
- **Tema**: Apple Dark Business
- **Cores**: Gradientes sutis de azul/roxo
- **Animações**: Transições suaves em hover
- **Bordas**: Bordas finas com opacidade

### Cards de Vídeo
- Ícone de play com gradiente
- Título do vídeo
- Badge "Vídeo"
- Indicador de play ao hover

### Modal do Player
- Fundo escuro com blur
- Header com título e botão fechar
- Player de vídeo em aspect ratio 16:9
- Footer com instruções

## 🔧 Como Adicionar Novos Vídeos

### 1. Adicionar o arquivo de vídeo
```bash
# Coloque o arquivo .mp4 em:
public/video/novo-video.mp4
```

### 2. Atualizar o array de vídeos
```typescript
// src/components/video/VideoLibrary.tsx
const videos: Video[] = [
  {
    id: 'vd1',
    title: 'Princípios do Direito Administrativo',
    videoUrl: '/video/vd1.mp4',
  },
  {
    id: 'vd2',
    title: 'As normas que regulam a atividade administrativa',
    videoUrl: '/video/vd2.mp4',
  },
  // Adicione aqui:
  {
    id: 'vd3',
    title: 'Título do Novo Vídeo',
    videoUrl: '/video/novo-video.mp4',
  },
];
```

## 🎯 Componentes

### `VideoLibrary.tsx`
- **Localização**: `src/components/video/VideoLibrary.tsx`
- **Tipo**: Client Component (`'use client'`)
- **Estados**:
  - `selectedVideo`: Vídeo atualmente selecionado
  - `isPlayerOpen`: Controla abertura/fechamento do modal
- **Funções**:
  - `handleVideoClick`: Abre o modal com o vídeo selecionado
  - `handleClosePlayer`: Fecha o modal e limpa a seleção
  - `handleEsc`: Listener para tecla ESC

### Layout Principal
- **Arquivo**: `src/app/page.tsx`
- **Grid**: 12 colunas
  - Avatar: 2 colunas
  - Chat: 7 colunas
  - Vídeos: 3 colunas

## 🚀 Melhorias Futuras (Opcionais)

- [ ] Adicionar thumbnails customizadas para os vídeos
- [ ] Implementar progresso de visualização
- [ ] Adicionar categorias/tags
- [ ] Sistema de favoritos
- [ ] Busca/filtro de vídeos
- [ ] Playlist automática
- [ ] Marcadores de tempo (timestamps)
- [ ] Transcrição/legendas
- [ ] Download de vídeos
- [ ] Velocidade de reprodução

## 📝 Notas Técnicas

### Formatos Suportados
- `.mp4` (H.264)
- `.webm`
- `.ogg`

### Otimização
- Vídeos devem estar em resolução adequada (720p-1080p)
- Codec recomendado: H.264
- Taxa de bits: 2-5 Mbps para qualidade HD

### Acessibilidade
- Modal pode ser fechado com ESC
- Controles nativos do player
- Suporte a teclado completo


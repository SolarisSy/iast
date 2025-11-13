# 📖 Guia do Painel de Administração

## 🎯 O que é?

O **Painel de Administração** é uma interface web completa para gerenciar documentos PDF e treinar a IA sem necessidade de código ou linha de comando!

---

## 🚀 Como Acessar

### 1. Iniciar os Servidores

**Backend**:
```bash
cd backend
npm start
# Rodará em http://localhost:80
```

**Frontend**:
```bash
cd front
npm run dev
# Rodará em http://localhost:3000
```

### 2. Acessar o Painel

1. Abra o navegador em `http://localhost:3000`
2. Clique em **"⚙️ Painel Admin"** no canto superior direito
3. Ou acesse diretamente: `http://localhost:3000/admin`

---

## 🎨 Funcionalidades

### 📤 Upload de Documentos

**Recursos**:
- ✅ Upload de PDF único ou múltiplo
- ✅ Drag & Drop (arraste e solte)
- ✅ Validação automática (apenas PDFs)
- ✅ Limite de 50MB por arquivo
- ✅ Processamento automático
- ✅ Feedback em tempo real

**Como usar**:
1. Arraste PDFs para a área de upload **OU** clique para selecionar
2. Revise os arquivos selecionados
3. Clique em **"Enviar e Treinar IA"**
4. Aguarde o processamento (10-30 segundos por PDF)
5. Veja a confirmação de sucesso!

**O que acontece**:
```
Upload → Validação → Salvar em corpus/ → Processar PDF → 
Dividir em chunks → Gerar embeddings → Indexar no vector store → 
IA treinada! ✅
```

---

### 📚 Documentos Treinados

**Mostra**:
- 📄 Nome do arquivo
- 📦 Tamanho (formatado)
- 📅 Data de upload
- 🗑️ Botão de remoção

**Ações**:
- **Listar**: Veja todos os PDFs que a IA conhece
- **Remover**: Delete documentos (reindexação automática)
- **Atualizar**: Clique no ícone 🔄 para recarregar

**Remoção**:
1. Clique em **"🗑️ Remover"** no documento
2. Confirme a ação
3. Sistema remove o arquivo
4. Vector store é reindexado automaticamente
5. IA para de usar aquele documento

---

### 📊 Status do Treinamento

**Informações em tempo real**:

1. **Vector Store**:
   - ✅ Ativo / ❌ Inativo
   - Indica se a IA está operacional

2. **Cache**:
   - ⚡ Em Memória (rápido)
   - 💾 Em Disco (precisa carregar)

3. **Documentos Indexados**:
   - Quantos PDFs a IA conhece
   - Comparação com arquivos em corpus/

4. **Chunks Processados**:
   - Pedaços de texto indexados
   - Maior número = mais conteúdo

5. **Datas**:
   - Última atualização
   - Data de criação

**Alertas**:
- ⚠️ **Reindexação Necessária**: Aparece quando há PDFs não indexados
- 🔄 **Botão de Reindexar**: Processa todos os documentos novamente

---

## 🎭 Feedback Visual (Toasts)

**Tipos de notificação**:

- ✅ **Sucesso** (Verde): Upload ou remoção bem-sucedidos
- ❌ **Erro** (Vermelho): Falhas ou problemas
- ⚠️ **Aviso** (Amarelo): Atenções necessárias
- ℹ️ **Info** (Azul): Informações gerais

**Características**:
- Aparecem no canto superior direito
- Desaparecem automaticamente após 5 segundos
- Podem ser fechadas manualmente (botão ✕)
- Animação suave de entrada

---

## 🔄 Fluxo Completo de Uso

### Cenário 1: Adicionar Novo Material

```
1. Acesse /admin
2. Arraste PDF para área de upload
3. Clique "Enviar e Treinar IA"
4. Aguarde confirmação (toast verde)
5. Veja documento na lista
6. Verifique status atualizado
7. Volte ao chat e teste!
```

### Cenário 2: Atualizar Documento Existente

```
1. Acesse /admin
2. Encontre documento antigo na lista
3. Clique "🗑️ Remover"
4. Confirme remoção
5. Aguarde reindexação
6. Upload nova versão
7. IA agora usa versão atualizada!
```

### Cenário 3: Verificar Saúde do Sistema

```
1. Acesse /admin
2. Veja painel de status
3. Confira "Documentos Indexados" vs "Arquivos em corpus"
4. Se diferentes → alerta aparece
5. Clique "Reindexar" se necessário
6. Aguarde processamento
7. Sistema sincronizado!
```

---

## 🎨 Interface

### Design

- **Tema escuro** moderno e elegante
- **Glassmorphism** (efeito de vidro fosco)
- **Gradientes suaves**
- **Bordas sutis**
- **Ícones intuitivos**
- **Responsivo** (funciona em mobile)

### Cores

- **Fundo**: Gradiente preto (`#0a0a0a` → `#0f0f0f`)
- **Cartões**: Branco com 5% opacidade + blur
- **Bordas**: Branco com 10% opacidade
- **Sucesso**: Verde (`#10b981`)
- **Erro**: Vermelho (`#ef4444`)
- **Info**: Azul (`#3b82f6`)
- **Aviso**: Amarelo (`#f59e0b`)

### Layout

```
┌────────────────────────────────────────────┐
│  Header + Botão "Voltar ao Chat"           │
├────────────────────────────────────────────┤
│  Banner Informativo (Como funciona)        │
├─────────────────────────┬──────────────────┤
│  Upload de Documentos   │  Status do       │
│  (arraste PDFs aqui)    │  Treinamento     │
├─────────────────────────┤  (métricas)      │
│  Documentos Treinados   │                  │
│  (lista com ações)      │                  │
└─────────────────────────┴──────────────────┘
```

---

## ⚙️ Configuração

### Variável de Ambiente

Crie arquivo `.env.local` na pasta `front/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:80
```

**Ambientes**:
- **Local**: `http://localhost:80`
- **Produção**: `https://seu-backend.com`
- **Ngrok**: `https://xxxxx.ngrok-free.app`

### Porta do Backend

Certifique-se que o backend está rodando na porta configurada (padrão: 80).

---

## 🧪 Testando

### Teste 1: Upload Básico

1. Baixe um PDF qualquer (ex: apostila, lei, manual)
2. Acesse `/admin`
3. Arraste o PDF para a área de upload
4. Clique "Enviar e Treinar IA"
5. Deve aparecer toast verde
6. PDF deve aparecer na lista

### Teste 2: Upload Múltiplo

1. Selecione 3-5 PDFs ao mesmo tempo
2. Arraste todos de uma vez
3. Clique "Enviar e Treinar IA"
4. Aguarde processamento (pode demorar)
5. Todos devem aparecer na lista

### Teste 3: Remoção

1. Clique em "🗑️ Remover" em um documento
2. Confirme
3. Aguarde reindexação
4. Documento some da lista
5. Status mostra números atualizados

### Teste 4: Reindexação Manual

1. Vá até a seção de Status
2. Clique "🔄 Reprocessar Todos os Documentos"
3. Confirme
4. Aguarde (pode levar minutos)
5. Status é atualizado

### Teste 5: Chat com Novos Dados

1. Upload um PDF sobre tema específico
2. Aguarde processamento completo
3. Volte ao chat principal
4. Faça pergunta sobre conteúdo do PDF
5. IA deve responder com base no documento!

---

## 🚨 Troubleshooting

### Erro: "Erro ao conectar com o servidor"

**Causa**: Backend não está rodando ou URL errada

**Solução**:
1. Verifique se backend está ativo: `http://localhost:80`
2. Confira `.env.local` tem URL correta
3. Reinicie o frontend: `npm run dev`

### Erro: "Apenas arquivos PDF são permitidos"

**Causa**: Tentou fazer upload de arquivo não-PDF

**Solução**:
- Use apenas arquivos `.pdf`
- Verifique extensão do arquivo
- Converta outros formatos para PDF

### Aviso: "Reindexação Necessária"

**Causa**: PDFs em corpus/ não estão no vector store

**Solução**:
1. Clique no botão "🔄 Reindexar Agora"
2. Aguarde processamento
3. Alerta desaparece

### Upload Lento

**Causa**: PDFs muito grandes ou muitos arquivos

**Normal**: 
- 1 PDF pequeno (~1MB): 5-10 segundos
- 1 PDF grande (~20MB): 30-60 segundos
- 5 PDFs: 2-5 minutos

**Dica**: Faça upload de poucos arquivos por vez

### Documentos Não Aparecem

**Causa**: Erro no processamento ou API

**Solução**:
1. Abra Console do Navegador (F12)
2. Veja erros na aba Console
3. Confira logs do backend
4. Verifique variável `NEXT_PUBLIC_API_URL`

---

## 💡 Dicas de Uso

### Para Melhor Performance

1. **PDFs otimizados**: Use PDFs com OCR se forem escaneados
2. **Tamanho adequado**: Até 20MB por arquivo idealmente
3. **Poucos de cada vez**: 3-5 PDFs por upload
4. **Nome descritivo**: Use nomes claros para identificar

### Para Melhor Treinamento

1. **Documentos relevantes**: Apenas PDFs do tema da IA
2. **Texto limpo**: Evite PDFs com muitas imagens
3. **Estrutura clara**: PDFs bem formatados são melhores
4. **Atualização regular**: Remova documentos obsoletos

### Para Organização

1. **Convenção de nomes**: Use padrão (ex: `Lei-8112-2024.pdf`)
2. **Versionamento**: Inclua versão/data no nome
3. **Categorias**: Use prefixos (ex: `Apostila-Cap1.pdf`)
4. **Limpeza periódica**: Remova documentos não usados

---

## 🎓 Conceitos

### O que é "Treinar a IA"?

Quando você faz upload de um PDF:
1. Sistema extrai todo o texto
2. Divide em pedaços pequenos (chunks)
3. Converte cada chunk em números (embeddings)
4. Armazena em banco vetorial
5. IA pode buscar e usar esse conteúdo!

### O que são "Chunks"?

Pedaços de texto de ~1000 caracteres cada. Exemplo:

```
PDF de 100 páginas → ~450 chunks → 450 embeddings
```

### O que é "Vector Store"?

Banco de dados especializado que permite buscar texto por significado, não apenas palavras exatas.

---

## 📊 Métricas

### Custos (OpenAI)

- **1 PDF (100 páginas)**: ~$0.045
- **10 PDFs**: ~$0.45
- **Muito acessível!**

### Performance

- **Upload**: < 1 segundo
- **Processamento**: 10-30 segundos/PDF
- **Listagem**: < 100ms
- **Remoção**: < 2 segundos

### Limites

- **Tamanho máximo**: 50MB por PDF
- **Upload múltiplo**: Até 10 PDFs por vez
- **Sem limite** de documentos totais!

---

## 🌟 Benefícios

### Antes (sem painel)

- ❌ Modificar código manualmente
- ❌ Usar linha de comando
- ❌ Conhecimento técnico necessário
- ❌ Deploy após cada mudança

### Agora (com painel)

- ✅ Interface visual intuitiva
- ✅ Drag & drop simples
- ✅ Qualquer pessoa pode usar
- ✅ Mudanças instantâneas
- ✅ Feedback em tempo real
- ✅ Totalmente profissional

---

## 🎯 Próximos Passos

Após dominar o painel:

1. **Personalize**: Adicione seus PDFs específicos
2. **Teste**: Faça perguntas no chat
3. **Ajuste**: Remova documentos irrelevantes
4. **Monitore**: Acompanhe o status
5. **Compartilhe**: Ensine outros a usar!

---

## 📞 Suporte

### Dúvidas?

- Consulte este guia
- Veja logs do navegador (F12)
- Confira logs do backend
- Teste com PDF simples primeiro

### Problemas?

1. Reinicie frontend e backend
2. Limpe cache do navegador
3. Verifique variáveis de ambiente
4. Confira se PDFs são válidos

---

## ✨ Resumo

O Painel de Administração torna **treinar a IA** tão fácil quanto:

```
1. Arraste PDF
2. Clique "Enviar"
3. Pronto! IA treinada! 🎉
```

**Simples, rápido e profissional!**

---

*Criado em: 24/10/2025*  
*Versão: 1.0*  
*Sistema IAST - Assistente Virtual Inteligente*


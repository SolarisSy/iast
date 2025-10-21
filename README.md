# Chat com IA Especialista em Documentos (RAG)

Este projeto implementa um assistente de IA especialista, utilizando a técnica de **Retrieval-Augmented Generation (RAG)**. A aplicação permite que o usuário converse com uma IA cujo conhecimento é estritamente limitado ao conteúdo de documentos (`.pdf`, `.txt`) fornecidos em uma pasta local.

## Propósito

O objetivo é criar um assistente de IA focado e confiável, que possa responder perguntas sobre um corpo de conhecimento específico sem "alucinar" ou inventar informações. Todas as respostas são geradas com base nos trechos mais relevantes dos documentos fornecidos.

## Arquitetura

Após uma fase de desenvolvimento e depuração, o projeto evoluiu para uma arquitetura de **dois servidores desacoplados**, garantindo estabilidade e performance:

1.  **Frontend (Next.js):**
    *   Localizado na pasta raiz do projeto.
    *   Responsável por toda a interface do usuário (UI), construída com React e Next.js 14.
    *   Não contém nenhuma lógica de IA. Ele apenas exibe o chat e faz requisições HTTP para o backend.

2.  **Backend (Node.js/Express):**
    *   Localizado na pasta `/backend`.
    *   Um servidor dedicado que lida com toda a lógica de IA.
    *   Usa **LangChain.js** para orquestrar o processo de RAG.
    *   Usa **HNSWLib** para criar e gerenciar um banco de dados de vetores persistente (salvo em disco), que armazena o conhecimento extraído dos documentos.
    *   Expõe duas rotas principais: `/api/ingest` e `/api/chat`.

Esta separação resolveu incompatibilidades críticas entre as bibliotecas de IA (que requerem um ambiente Node.js puro) e o ambiente de execução moderno do Next.js.

## Tech Stack

-   **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
-   **Backend:** Node.js, Express.js, Cors
-   **IA & RAG:** LangChain.js, OpenAI (para embeddings e geração de texto), HNSWLib (vector store), PDF-Parse

## Começando

Siga estas instruções para configurar e rodar o projeto completo.

### Pré-requisitos
- Node.js (versão 20.x ou superior)
- npm

### 1. Configurar o Backend

Primeiro, configure o servidor de IA.

1.  **Crie o arquivo de ambiente:**
    *   Navegue até a pasta `backend`.
    *   Crie um arquivo chamado `.env`.
    *   Adicione sua chave da OpenAI a este arquivo:
      ```
      OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
      ```

2.  **Instale as dependências do backend:**
    *   No terminal, dentro da pasta `backend`, execute:
      ```bash
      npm install --legacy-peer-deps
      ```

### 2. Configurar o Frontend

Agora, configure a interface do usuário.

1.  **Instale as dependências do frontend:**
    *   No terminal, na **pasta raiz** do projeto, execute:
      ```bash
      npm install --legacy-peer-deps
      ```

### 3. Executando a Aplicação

Você precisará de **dois terminais** abertos simultaneamente.

**Terminal 1 - Iniciar o Backend:**
```bash
# Na pasta /backend
npm start
```
*Aguarde a mensagem `Servidor backend rodando em http://localhost:4000`.*

**Terminal 2 - Iniciar o Frontend:**
```bash
# Na pasta raiz do projeto
npm run dev
```
*Aguarde a aplicação compilar. Agora você pode acessar [http://localhost:3000](http://localhost:3000) no seu navegador.*

### 4. Ingestão de Dados (Treinamento)

Com os dois servidores rodando, você precisa "alimentar" a IA com os documentos.

1.  **Adicione seus arquivos:** Coloque os arquivos `.pdf` ou `.txt` que você quer usar como base de conhecimento dentro da pasta `src/corpus`.
2.  **Execute o comando de ingestão:**
    *   Abra um **terceiro terminal** (ou use um que não esteja ocupado).
    *   Execute o seguinte comando no PowerShell:
      ```powershell
      Invoke-WebRequest -Uri http://localhost:4000/api/ingest -Method POST
      ```
    *   Aguarde a confirmação de sucesso. Uma pasta `vector_store` será criada dentro de `/backend`.

Você só precisa executar a ingestão na primeira vez ou quando alterar os documentos na pasta `corpus`. O conhecimento fica salvo permanentemente.

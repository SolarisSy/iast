## Visão geral

- **Objetivo**: Criar um chat com avatar que responde exclusivamente com base em um livro específico, priorizando precisão, contexto e um tom humanizado.
- **Escopo (V1)**:
  - Chat texto → texto (sem voz obrigatória).
  - Especialista em 1 livro (fonte única).
  - Respostas com citações/trechos do livro e referências de página/capítulo.
  - Avatar “estilo Meta” com animações simples (olhar, microexpressões, idle).
- **Diferenciais**: Tom empático, citações verificáveis, feedback de usuário embutido, guardrails para evitar extrapolações fora do livro.

## Requisitos funcionais (V1)

- **Chat**: histórico por sessão, estado de carregamento, reenvio, copiar resposta.
- **Entrada**: apenas texto (sem voz e sem upload de arquivos na V1).
- **Fonte do conhecimento**: arquivos `.txt` e `.pdf` (V1; livro em texto puro e PDF).
- **RAG com 1 fonte**: ingestão do livro, chunking, embeddings, busca semântica, re-ranking, citações.
- **Avatar**: presença visual, expressões básicas reativas ao estado (pensando/falando/ocioso).
- **Citações**: cada resposta inclui trechos e metadados (no PDF: página/capítulo/posição; no TXT: capítulo/linhas/offset de caracteres).
- **Feedback**: “Foi útil?” + motivo; report de erros.
- **Admin (mínimo)**: reindexar livro, visualizar logs básicos, configurar provider de LLM.
- **Limites**: recusar perguntas fora do escopo (“apenas respondo com base neste livro”).

## Requisitos não funcionais

- **Precisão**: >= 85% de groundedness (respostas sustentadas por citações).
- **Latência**: P95 <= 3s (sem TTS) / <= 5s (com TTS futuro).
- **Disponibilidade**: 99%.
- **Segurança**: sem armazenar PII sem consentimento; chaves em cofres.
- **Custos**: otimização por cache e compressão de prompts.

## Arquitetura (proposta)

- **Frontend**: Next.js/React + Tailwind; componentes `Chat`, `Message`, `CitationChips`, `Avatar`.
- **Backend**: API Routes/Edge Functions para:
  - `/api/ingest` (admin): processar e indexar o livro.
  - `/api/chat`: fluxo RAG + LLM; retorna resposta e citações.
- **Vector DB**: Supabase Postgres + `pgvector` (ou Pinecone/Qdrant).
- **LLM provider**: OpenAI (fixo na V1), com adaptador para troca futura.
- **Embeddings**: modelo universal (ex.: OpenAI embeddings) ou local (ex.: bge).
- **Observabilidade**: logging estruturado, métricas (hit rate, latência, token usage).

### Decisões confirmadas (V1)

- **Provider**: OpenAI.
- **Modalidade de entrada**: apenas texto.
- **Fonte do livro**: `.txt` e `.pdf`.

### Fluxo de resposta (RAG)

1. Receber pergunta.
2. Reescrita/normalização (opcional) para melhor recall.
3. Busca semântica no vetor: top-k (ex.: 8–12).
4. Re-ranking (ex.: cross-encoder) e seleção final (ex.: 4–6 chunks).
5. Prompt com instruções e contexto selecionado (citável).
6. Geração no LLM com formato que exija citações.
7. Validação: checar presença de citações + score de similaridade médio.
8. Resposta: texto + lista de citações (página/capítulo/offsets).
9. Telemetria: salvar métricas e feedback.

## Ingestão do livro

- **Fontes**: TXT e PDF (V1). Se PDF imagem → OCR (Tesseract/Azure OCR).
- **Normalização**: remover notas de rodapé/artefatos, manter mapeamento página→texto.
- **Segmentação**: capítulos/seções.
- **Chunking**: 500–1200 tokens com overlap (10–20%).
- **Indexação**: gerar embeddings, salvar em vetor com metadados: `chapter`, `section`, `page` (PDF), `line_start/end` (TXT), `pos_in_page`, `char_start/end`, `checksum`.
- **Atualizações**: job idempotente; reindex total/parcial.
- **Particularidades do TXT**: sem páginas nativas; usar marcadores de capítulo/headers e/ou janelas de linhas para citações; preferir metadados de `line_start/end` e `char_start/end`.
- **Particularidades do PDF**: preservar mapeamento página→texto para citações precisas; para PDFs escaneados, garantir OCR de qualidade e revisão amostral.

## Design do prompt (V1)

- **Instruções principais**:
  - “Responda apenas com base no livro X.”
  - “Se faltar contexto, diga que não sabe e peça clarificação.”
  - “Inclua citações com página/capítulo em cada resposta.”
  - “Tom humanizado: empático, claro, não paternalista.”
- **Formato de saída (restrito)**:
  - Corpo da resposta (máx. N palavras).
  - Lista de citações: cada item com trecho curto + referência (cap/pág).
- **Guardrails**: negar temas fora do livro; evitar especulação.

## Avatar (V1 → simples)

- **Visual**: 2D/3D leve (Canvas/WebGL) com estados: idle, pensando, falando.
- **Trigger**: “pensando” durante busca/LLM; “falando” quando streaming de resposta.
- **Lip-sync (opcional V1)**: placeholder baseado em ritmo de texto; TTS pode ficar para V1.1.
- **Acessibilidade**: avatar desativável; contraste e foco no conteúdo.

### Viabilidade de avatar 100% em código

- **É possível**:
  - 2D completamente em código com Canvas/SVG/CSS (traços paramétricos, microexpressões por interpolação), sem dependência de assets binários.
  - 3D via WebGL/Three.js/React Three Fiber. Para qualidade “estilo Meta”, normalmente usa-se um arquivo `glTF`/rig (asset). 100% procedural é viável, porém mais estilizado/minimalista e trabalhoso.
- **Recomendação para a V1**:
  - Implementar um avatar 2D paramétrico (Canvas/SVG) com estados `idle/pensando/falando` e microexpressões; leve, acessível e 100% em código.
  - Opcional: usar Lottie apenas se aceitarmos um pequeno asset JSON (não 100% código).
  - V1.1: evoluir para 3D leve com Three.js + `glTF` otimizado e oclusão de custos.

## UX e humanização

- **Persona**: “Mentor(a) do livro X” — acolhedor(a), didático(a), direto(a) quando necessário.
- **Estrutura de resposta**: resumo curto + detalhamento + citações.
- **Interações**: sugestões de follow-ups, pedir confirmação de entendimento.
- **Acessibilidade**: navegação por teclado, ARIA labels, alto contraste.

## Segurança, ética e licenças

- **Direitos do livro**: confirmar licença/uso; exibir crédito e aviso.
- **Privacidade**: consentimento explícito se armazenar histórico; retention mínima.
- **Anti-abuso**: rate limiting, bloqueio de conteúdo proibido, auditoria de prompts.
- **Transparência**: “Como respondo” e “Limitações” na UI.

## Custos (estimativa inicial)

- **Ingestão**: embeddings do livro (ex.: 100k tokens) → baixo custo único.
- **Operação**: por sessão (pergunta × k tokens contexto × resposta).
- **Otimizações**: cache semântico, compressão de contexto, top-k adaptativo.

## Roadmap e marcos

- **Semana 1**: decisão de stack, setup do repositório, protótipo de chat.
- **Semana 2**: pipeline de ingestão + indexação + API `/api/chat`.
- **Semana 3**: avatar básico + UX de citações + guardrails + feedback.
- **Semana 4**: observabilidade, testes, hardening, deploy e revisão de custos.

## Critérios de aceite (V1)

- **Precisão**: >= 85% das respostas com citações relevantes verificáveis.
- **Latência**: P95 <= 3s (sem TTS).
- **Confiabilidade**: 0 alucinação flagrante em 50 prompts de teste.
- **UX**: todas as respostas exibem chips de citação clicáveis para expandir.
- **Admin**: reindexação do livro funcional e segura.

## Riscos e mitigação

- **OCR ruim**: usar OCR de alta qualidade + revisão amostral.
- **Alucinações**: prompt rígido, penalização sem contexto, fallback “não sei”.
- **Custos de LLM**: compressão e cache; opção de modelo menor off-peak.
- **Licenças**: validação legal antes do go-live.

## Entregáveis

- **App web**: chat, avatar, citações, feedback.
- **APIs**: `/api/ingest`, `/api/chat`, documentação curta.
- **Infra**: DB vetorial provisionado + dashboards básicos.
- **Docs**: README de operação, política de privacidade, limites do sistema.

## Backlog pós-V1 (opcional)

- **Voz**: TTS neural + visemes para lip-sync realista.
- **STT**: entrada por voz.
- **Memória**: curta duração por sessão com consentimento.
- **Explanações**: “mostrar como busquei” (explainability amigável).
- **Avaliação contínua**: dataset de avaliação e regressão de qualidade.

## Decisões necessárias para avançar

- **Livro**: título, formato (PDF/ePub/MD), licença/permite uso?
- **Provider**: preferência (OpenAI/Anthropic/Google/local) e orçamento mensal.
- **Avatar**: 2D estático animado vs. 3D leve; estilo visual.
- **Vector DB**: Supabase `pgvector` (default) vs. serviço dedicado.
- **Idiomas**: apenas PT-BR ou multilíngue com tradução?

—

Após a validação deste plano, posso entregar um esqueleto técnico com estrutura de pastas, contratos das rotas e um protótipo mínimo do chat (sem ingestão) para acelerar a V1.

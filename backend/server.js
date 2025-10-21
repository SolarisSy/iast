import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// LangChain Imports
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import OpenAI from 'openai';

// --- CONFIGURAÇÃO INICIAL ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;
const openai = new OpenAI();

// Paths
const VECTOR_STORE_PATH = path.join(__dirname, 'vector_store');
const CORPUS_PATH = path.join(__dirname, '..', 'src', 'corpus');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como Postman) ou de qualquer origem em desenvolvimento
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/,
      /\.easypanel\.host$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Configuração do multer para upload de arquivos de áudio
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limite para áudio
    },
    fileFilter: (req, file, cb) => {
        // Aceitar apenas arquivos de áudio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de áudio são permitidos'), false);
        }
    }
});

// Cache para o Vector Store
let vectorStoreCache = null;

// --- FUNÇÕES DA APLICAÇÃO ---

async function createAndSaveVectorStore() {
    console.log('Verificando e limpando o diretório do vector store antigo...');
    await fs.rm(VECTOR_STORE_PATH, { recursive: true, force: true }).catch(() => console.log('Nenhum diretório antigo encontrado.'));
    
    console.log('Iniciando criação do vector store a partir de:', CORPUS_PATH);
    const loader = new DirectoryLoader(CORPUS_PATH, {
        '.txt': (path) => new TextLoader(path),
        '.pdf': (path) => new PDFLoader(path),
    });

    const docs = await loader.load();
    if (docs.length === 0) {
        console.log('Nenhum documento encontrado.');
        return;
    }
    console.log(`Carregados ${docs.length} documento(s).`);

    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const chunks = await textSplitter.splitDocuments(docs);
    console.log(`Documentos divididos em ${chunks.length} chunks.`);

    const sanitizedChunks = chunks.filter(chunk => chunk.pageContent && chunk.pageContent.trim() !== '');
    console.log(`Sanitizado para ${sanitizedChunks.length} chunks válidos.`);

    const texts = sanitizedChunks.map(chunk => chunk.pageContent);
    
    // ETAPA CRÍTICA DE SANITIZAÇÃO:
    // O PDFLoader pode gerar metadados com estruturas ou valores inconsistentes (ex: objetos Date, referências circulares)
    // que causam erros internos na função `HNSWLib.fromTexts`. Para garantir a robustez, descartamos os metadados
    // originais e criamos um novo conjunto, simples e garantidamente seguro, contendo apenas informações essenciais.
    const metadatas = sanitizedChunks.map((chunk, index) => ({
        source: chunk.metadata.source || 'PDF',
        loc: JSON.stringify(chunk.metadata.loc), // A localização pode ser um objeto, então a convertemos para string.
        chunk_index: index,
    }));
    
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await HNSWLib.fromTexts(texts, metadatas, embeddings);
    
    await vectorStore.save(VECTOR_STORE_PATH);
    console.log(`Vector store salvo em: ${VECTOR_STORE_PATH}`);
    vectorStoreCache = vectorStore; // Atualiza o cache
}

async function getVectorStore() {
    if (vectorStoreCache) {
        return vectorStoreCache;
    }

    try {
        await fs.access(VECTOR_STORE_PATH);
        console.log('Carregando vector store do disco...');
        const embeddings = new OpenAIEmbeddings();
        vectorStoreCache = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
        console.log('Vector store carregado e cacheado.');
        return vectorStoreCache;
    } catch (e) {
        return null;
    }
}

// --- ROTAS DA API ---

app.post('/api/ingest', async (req, res) => {
    try {
        await createAndSaveVectorStore();
        res.json({ success: true, message: `Ingestão concluída. Vector Store salvo em ${VECTOR_STORE_PATH}.` });
    } catch (error) {
        console.error('Erro na ingestão:', error);
        res.status(500).json({ success: false, error: 'Falha no processo de ingestão.' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        console.log('\n\n--- NOVA REQUISIÇÃO DE CHAT RECEBIDA ---');
        const { message, history } = req.body;
        console.log('[RECEBIDO] Mensagem:', message);
        console.log('[RECEBIDO] Histórico:', JSON.stringify(history, null, 2));

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Correção definitiva do bug "Mentor: undefined" e do mapeamento de histórico
        const conversationHistory = (history || [])
            .map(turn => {
                const role = turn.sender === 'user' ? 'Usuário' : 'Mentor';
                const content = turn.text || '';
                return `${role}: ${content}`;
            })
            .join('\n');
        console.log('[PROCESSADO] Histórico Formatado:', conversationHistory);

        // --- AGENTE 1: O ROTEADOR DE INTENÇÃO (COM PROMPT MELHORADO) ---
        const intentAnalysisPrompt = `
            Analise o histórico da conversa e a última mensagem do usuário para classificar a intenção da **última mensagem** em UMA das seguintes categorias:
            - "saudacao": Cumprimentos, agradecimentos, despedidas ou respostas sociais curtas e afirmativas. Exemplos: "Olá", "Obrigado", "Tudo bem", "acho ok", "entendi", "pode ser".
            - "conversa_fora_do_nicho": Perguntas sobre a IA (quem é você?), ou sobre qualquer tópico que não seja direito administrativo.
            - "pergunta_tecnica": Uma pergunta clara buscando conhecimento sobre processos administrativos, leis, etc. Exemplos: "qual o prazo para a defesa?", "como funciona a citação do acusado?".
            - "conversa_do_nicho": Uma afirmação ou pergunta de acompanhamento que claramente continua uma discussão técnica anterior sobre o nicho. Exemplo: (após uma resposta sobre prazos) "e se o prazo não for cumprido?".

            **Histórico:**
            ${conversationHistory}

            **Última Mensagem do Usuário:** "${message}"
            
            **Categoria:**
        `;
        console.log('[AGENTE ROTEADOR] Enviando prompt para análise de intenção...');
        const intentCompletion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', messages: [{ role: 'user', content: intentAnalysisPrompt }], temperature: 0, max_tokens: 20,
        });
        const intent = intentCompletion.choices[0].message.content.trim().toLowerCase().replace(/"/g, '');
        console.log(`[AGENTE ROTEADOR] Intenção detectada: ${intent}`);

        // --- AGENTE 2: O MENTOR ESPECIALISTA (RESPOSTA CONDICIONAL) ---

        // Caminho para respostas conversacionais (sem RAG)
        if (intent === 'saudacao' || intent === 'conversa_fora_do_nicho') {
            console.log('[AGENTE MENTOR] Ativado em modo conversacional (sem RAG).');
            const conversationalPrompt = `
                Assuma a personalidade de um mentor especialista em direito administrativo.
                O usuário disse: "${message}".
                Com base na intenção detectada ("${intent}"), responda de forma breve, humana e natural.
                - Se for 'saudacao', cumprimente de volta ou responda cordialmente.
                - Se for 'conversa_fora_do_nicho', explique elegantemente que seu foco é o material de estudo e redirecione a conversa.
            `;
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'Você é um mentor especialista.' }, { role: 'user', content: conversationalPrompt }], temperature: 0.5, max_tokens: 100,
            });
            const reply = completion.choices[0].message.content;
            console.log('[AGENTE MENTOR] Resposta final (conversacional):', reply);
            return res.json({ reply });
        }

        // Caminho para perguntas de conhecimento (com RAG)
        if (intent === 'pergunta_tecnica' || intent === 'conversa_do_nicho') {
            console.log('[AGENTE MENTOR] Ativado em modo de conhecimento (RAG).');
            
            const DOCUMENT_SUMMARY = `
                1. Portaria instauradora de processo administrativo disciplinar e sindicância contraditória
                2. Requerimento de substituição de membro
                3. Portaria de substituição de membro
                4. Requerimento de prorrogação de prazo à autoridade instauradora
                5. Portaria de prorrogação de prazo para conclusão dos trabalhos da comissão processante
                6. Portaria de recondução da comissão processante
                7. Portaria instauradora conjunta de processo administrativo disciplinar e sindicância contraditória
                8. Ata de instalação e deliberações da comissão processante
                9. Portaria de designação do secretário
                10. Termo de compromisso do secretário não integrante da comissão
                11. Portaria de designação do secretário ad hoc
                12. Termo de compromisso do secretário ad hoc
                13. Comunicação da instalação à autoridade instauradora
                14. Comunicação da instalação ao órgão de recursos humanos/gestão de pessoas e solicitação de cópia dos assentamentos funcionais do acusado
                15. Comunicação da instalação ao chefe imediato do acusado
                16. Ata de reunião deliberativa
                17. Intimação do acusado/procurador acerca da ata deliberativa
                18. Ata deliberativa sujeita ao ad referendum dos membros da comissão processante
                19. Ata deliberativa de ratificação
                20. Notificação prévia
                21. Termo de vista e cópia dos autos
                22. Carta precatória requerendo a prática de ato (genérica)
                23. Intimação do acusado/procurador para acompanhar os atos instrutórios
                24. Intimação do acusado/procurador para acompanhar oitiva de testemunha
                25. Intimação de testemunha
                26. Comunicação ao chefe da repartição onde serve a testemunha
                27. Solicitação de comparecimento de autoridade para depor como testemunha
                28. Termo de oitiva de testemunha
                29. Termo de não comparecimento de testemunha
                30. Comunicação de não comparecimento de testemunha servidor público ao chefe imediato
                31. Certidão de comparecimento de testemunha
                32. Termo de oitiva de testemunha a distância (videoconferência)
                33. Carta precatória para oitiva de testemunha e anexo com formulação de perguntas
                34. Intimação do acusado/procurador informando oitiva de testemunha por carta precatória
                35. Solicitação de comparecimento de informante
                36. Termo de oitiva de informante
                37. Termo de oitiva com contradita à testemunha
                38. Termo de acareação
                39. Ofício solicitando documentos
                40. Requerimento da comissão processante à autoridade fiscal
                41. Requerimento da comissão processante ao responsável da instituição financeira
                42. Requerimento da comissão processante solicitando à Advocacia-Geral da União o afastamento do sigilo bancário
                43. Requerimento de designação de perito à autoridade instauradora
                44. Portaria de designação de perito
                45. Termo de compromisso de perito
                46. Intimação do acusado/procurador para apresentar quesitos
                47. Intimação do acusado/procurador para ciência das conclusões da perícia
                48. Portaria de designação de assistente técnico
                49. Termo de diligência
                50. Intimação do acusado/procurador para acompanhar diligência
                51. Comunicação ao chefe da repartição na qual será realizada a diligência
                52. Intimação do acusado/procurador informando acerca da realização da diligência
                53. Intimação do acusado/procurador para dizer se ainda resta alguma prova a ser produzida
                54. Despacho de saneamento
                55. Intimação do acusado para interrogatório
                56. Intimação do procurador acerca do interrogatório
                57. Comunicação ao chefe imediato do acusado acerca do interrogatório
                58. Termo de interrogatório
                59. Certidão de comparecimento ao interrogatório
                60. Termo de não comparecimento ao interrogatório
                61. Ata de encerramento de instrução (absolvição sumária)
                62. Ata de encerramento de instrução (indiciação)
                63. Termo de indiciação
                64. Mandado de citação
                65. Citação por carta precatória
                66. Portaria de designação do secretário ad hoc para promover a citação
                67. Termo de diligências para localização do indiciado
                68. Ata de deliberação decidindo pela citação por edital
                69. Citação por edital
                70. Termo de recusa de recebimento de citação
                71. Diligências - citação por hora certa
                72. Mandado de citação por hora certa
                73. Comunicação de citação por hora certa
                74. Mandado de citação dirigido ao procurador do indiciado
                75. Termo de revelia
                76. Solicitação de designação de defensor dativo
                77. Portaria de designação de defensor dativo
                78. Relatório final
                79. Ofício de remessa dos autos à autoridade instauradora
                80. Julgamento pelo arquivamento dos autos do processo
                81. Julgamento pela aplicação de penalidade
                82. Portaria de aplicação de penalidade
                83. Julgamento pela impossibilidade de aplicar penalidade
                84. Julgamento pela declaração de nulidade total ou parcial do processo e necessidade de refazimento dos trabalhos da comissão processante
                85. Conversão do julgamento em diligência
                86. Requerimento da comissão processante de instauração de incidente de sanidade mental
                87. Solicitação da autoridade instauradora de perícia médica ao órgão de serviço de saúde
                88. Intimação ao acusado/procurador informando a instauração de incidente de sanidade mental
                89. Requerimento da comissão processante de afastamento preventivo do acusado
                90. Portaria de afastamento preventivo
                91. Intimação do acusado informando o afastamento preventivo
                92. Comunicação ao chefe imediato do acusado acerca do afastamento preventivo
                93. Portaria instauradora de sindicância investigativa
                94. Termo de opção - acumulação ilegal de cargos
                95. Portaria instauradora - acumulação ilegal de cargos
                96. Portaria instauradora - abandono de cargo
                97. Portaria instauradora - inassiduidade habitual
            `;

            const store = await getVectorStore();
            if (!store) return res.status(500).json({ error: 'Vector store não encontrado.' });

            // Otimização da Query
            const queryTransformPrompt = `
                Você é um especialista em reescrever perguntas de usuários para serem usadas em uma busca de vetor semântica.
                Com base no histórico da conversa e na pergunta do usuário, sua única tarefa é gerar uma string de busca concisa e otimizada.

                **REGRAS:**
                - **NÃO responda à pergunta.**
                - **NÃO explique o que você está fazendo.**
                - **APENAS GERE A STRING DE BUSCA OTIMIZADA.**
                - Se a pergunta do usuário for vaga (ex: "sobre o que posso perguntar?"), gere uma busca por tópicos gerais (ex: "quais são os principais capítulos ou seções do documento?").

                **Histórico da Conversa:**
                ---
                ${conversationHistory}
                ---

                **Pergunta do Usuário:** "${message}"

                **String de Busca Otimizada (apenas a string):**
            `;
            console.log('[RAG - OTIMIZADOR] Enviando prompt para otimização da pergunta...');
            const qtCompletion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: queryTransformPrompt }], temperature: 0, max_tokens: 100 });
            const transformedQuery = qtCompletion.choices[0].message.content.trim().replace(/"/g, '');
            console.log(`[RAG - OTIMIZADOR] Pergunta original: "${message}" -> Pergunta Otimizada: "${transformedQuery}"`);

            // --- LÓGICA DE GATILHO DO SUMÁRIO ---
            const summaryKeywords = ['sumário', 'tópicos', 'conteúdo', 'capítulos', 'seções', 'início', 'geral', 'o que você sabe', 'base de dados'];
            const isSummaryRequest = summaryKeywords.some(keyword => transformedQuery.toLowerCase().includes(keyword));

            if (isSummaryRequest) {
                console.log('[AGENTE MENTOR] Requisição de sumário detectada. Preparando resposta estruturada.');
                
                const introPrompt = `
                    Você é um mentor especialista em direito administrativo. O usuário fez uma pergunta geral sobre o seu conhecimento.
                    Sua tarefa é escrever uma introdução curta e convidativa, dizendo que você preparou um sumário dos tópicos que domina para ele dar uma olhada.
                    **NÃO inclua o sumário na sua resposta, apenas a introdução.**
                    Exemplo: "Claro. Meu conhecimento abrange diversos modelos de atos e procedimentos. Preparei um sumário dos principais tópicos para você explorar. Dê uma olhada:"
                `;
                
                console.log('[AGENTE MENTOR] Gerando texto introdutório para o sumário...');
                const introCompletion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini', messages: [{ role: 'user', content: introPrompt }], temperature: 0.2, max_tokens: 100,
                });
                const introText = introCompletion.choices[0].message.content;

                const structuredResponse = {
                    reply: introText,
                    document: {
                        title: 'Sumário: Modelos de Atos e Documentos de PAD',
                        content: DOCUMENT_SUMMARY.trim()
                    }
                };

                console.log('[AGENTE MENTOR] Resposta final (Estruturada com Sumário):', JSON.stringify(structuredResponse, null, 2));
                return res.json(structuredResponse);
            }

            // --- FLUXO RAG PADRÃO (SE NÃO FOR PEDIDO DE SUMÁRIO) ---
            console.log('[AGENTE MENTOR] Pergunta específica detectada. Iniciando fluxo RAG padrão.');
            const retriever = store.asRetriever(6);
            const relevantDocs = await retriever.invoke(transformedQuery);
            const context = relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n');
            console.log(`[RAG - BUSCA] ${relevantDocs.length} documentos relevantes encontrados.`);
            console.log('[RAG - BUSCA] Contexto bruto recuperado (completo):\n', context);

            // Síntese da Resposta Final com Prompt à Prova de Confusão
            const finalResponsePrompt = `
              Você é um mentor especialista em direito administrativo. Sua única fonte de conhecimento é um livro sobre o assunto, do qual trechos relevantes foram extraídos para você.

              **Sua Tarefa:**
              1.  Analise a **PERGUNTA ATUAL DO USUÁRIO** no contexto do **HISTÓRICO DA CONVERSA**.
              2.  Use **APENAS** os **TRECHOS DO LIVRO (Contexto)** abaixo para formular sua resposta.
              3.  Responda como um mentor, sintetizando a informação do livro de forma clara e professoral.
              4.  **NUNCA diga "com base na informação que você forneceu" ou "nos trechos que você me deu".** Deixe claro que o conhecimento vem do **seu material de estudo**. Diga coisas como: "De acordo com o material que tenho...", "O livro aborda...", "Analisando os trechos que tenho disponíveis...".

              **HISTÓRICO DA CONVERSA:**
              ---
              ${conversationHistory}
              ---

              **TRECHOS DO LIVRO (Contexto):**
              ---
              ${context}
              ---
              
              **PERGUNTA ATUAL DO USUÁRIO:**
              ${message}

              **Resposta do Mentor:**
            `;
            console.log('[AGENTE MENTOR] Enviando prompt final para síntese...');
            const finalCompletion = await openai.chat.completions.create({
                model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'Você é um mentor especialista.' }, { role: 'user', content: finalResponsePrompt }], temperature: 0.2, max_tokens: 1000,
            });
            const reply = finalCompletion.choices[0].message.content;
            console.log('[AGENTE MENTOR] Resposta final (RAG):', reply);
            return res.json({ reply });
        }

        // Fallback se a intenção não for reconhecida
        console.log(`Intenção não reconhecida: '${intent}'. Gerando resposta padrão.`);
        return res.json({ reply: "Não tenho certeza de como processar essa solicitação. Poderia reformular?" });

    } catch (error) {
        console.error('❌ ERRO NO CHAT API:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('Erro completo:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// --- ENDPOINTS DE ÁUDIO ---

// Endpoint para Speech-to-Text (converter áudio em texto)
app.post('/api/audio/transcribe', upload.single('audio'), async (req, res) => {
    try {
        console.log('\n--- NOVA REQUISIÇÃO DE TRANSCRIÇÃO DE ÁUDIO ---');
        
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo de áudio foi enviado' });
        }

        console.log('[AUDIO] Arquivo recebido:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Converter o buffer para um arquivo temporário para a API da OpenAI
        const audioFile = new File([req.file.buffer], req.file.originalname, {
            type: req.file.mimetype
        });

        console.log('[AUDIO] Enviando para OpenAI Whisper...');
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'pt', // Português (código ISO-639-1)
            response_format: 'text',
            prompt: 'Conversa sobre direito administrativo, processos administrativos disciplinares, PAD, sindicância.' // Contexto para melhor transcrição
        });

        console.log('[AUDIO] Transcrição concluída:', transcription);
        
        res.json({ 
            success: true, 
            transcription: transcription.trim(),
            duration: req.file.size // Aproximação baseada no tamanho do arquivo
        });

    } catch (error) {
        console.error('Erro na transcrição de áudio:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao processar o áudio. Tente novamente.' 
        });
    }
});

// Endpoint para Text-to-Speech (converter texto em áudio)
app.post('/api/audio/synthesize', async (req, res) => {
    try {
        console.log('\n--- NOVA REQUISIÇÃO DE SÍNTESE DE ÁUDIO ---');
        
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Texto é obrigatório para síntese de áudio' });
        }

        console.log('[TTS] Texto para síntese:', text.substring(0, 100) + '...');

        // Usar a API de TTS da OpenAI
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'onyx', // Voz masculina natural e profunda
            input: text,
            response_format: 'mp3'
        });

        console.log('[TTS] Síntese de áudio concluída');

        // Converter o buffer para base64 para envio
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        
        res.json({
            success: true,
            audioData: base64Audio,
            mimeType: 'audio/mpeg',
            text: text
        });

    } catch (error) {
        console.error('Erro na síntese de áudio:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao gerar áudio. Tente novamente.' 
        });
    }
});

// Endpoint combinado para conversa por áudio (áudio -> texto -> resposta -> áudio)
app.post('/api/audio/chat', upload.single('audio'), async (req, res) => {
    try {
        console.log('\n--- NOVA CONVERSA POR ÁUDIO ---');
        
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo de áudio foi enviado' });
        }

        const { history } = req.body;
        let conversationHistory = [];

        // Processar histórico se fornecido
        if (history && Array.isArray(history)) {
            conversationHistory = history.map(turn => {
                const role = turn.sender === 'user' ? 'Usuário' : 'Mentor';
                const content = turn.text || '';
                return `${role}: ${content}`;
            });
        }

        console.log('[AUDIO CHAT] Histórico processado:', conversationHistory.join('\n'));

        // Passo 1: Transcrever áudio para texto
        console.log('[AUDIO CHAT] Passo 1: Transcrevendo áudio...');
        const audioFile = new File([req.file.buffer], req.file.originalname, {
            type: req.file.mimetype
        });

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'pt', // Português (código ISO-639-1)
            response_format: 'text',
            prompt: 'Conversa sobre direito administrativo, processos administrativos disciplinares, PAD, sindicância.' // Contexto para melhor transcrição
        });

        console.log('[AUDIO CHAT] Transcrição:', transcription);

        // Passo 2: Processar a mensagem transcrita usando a lógica de chat existente
        console.log('[AUDIO CHAT] Passo 2: Processando mensagem...');
        
        // Simular a requisição para o endpoint de chat interno
        const chatResponse = await processChatMessage(transcription.trim(), conversationHistory);
        
        console.log('[AUDIO CHAT] Resposta do chat:', chatResponse.reply);

        // Passo 3: Converter resposta em áudio
        console.log('[AUDIO CHAT] Passo 3: Sintetizando resposta em áudio...');
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'onyx', // Voz masculina natural e profunda
            input: chatResponse.reply,
            response_format: 'mp3'
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const base64Audio = buffer.toString('base64');

        console.log('[AUDIO CHAT] Conversa por áudio concluída');

        res.json({
            success: true,
            transcription: transcription.trim(),
            reply: chatResponse.reply,
            audioResponse: base64Audio,
            mimeType: 'audio/mpeg',
            document: chatResponse.document
        });

    } catch (error) {
        console.error('Erro na conversa por áudio:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao processar conversa por áudio. Tente novamente.' 
        });
    }
});

// Função auxiliar para processar mensagem de chat (reutilizar lógica existente)
async function processChatMessage(message, conversationHistory) {
    // Aqui você pode reutilizar a lógica do endpoint /api/chat
    // Por simplicidade, vou implementar uma versão simplificada
    
    try {
        const store = await getVectorStore();
        const retriever = store.asRetriever(6);
        const relevantDocs = await retriever.invoke(message);
        const context = relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n');

        const prompt = `
            Você é um mentor especialista em direito administrativo. Use apenas o contexto fornecido para responder.
            
            **Contexto:**
            ${context}
            
            **Pergunta:** ${message}
            
            **Resposta:**
        `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Você é um mentor especialista.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1000
        });

        return {
            reply: completion.choices[0].message.content,
            document: relevantDocs.length > 0 ? {
                title: 'Documento relevante',
                content: context.substring(0, 500) + '...'
            } : undefined
        };

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return {
            reply: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
            document: undefined
        };
    }
}

// --- HEALTH CHECK ENDPOINT ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'iast-backend',
        version: '1.0.0'
    });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    // Tenta carregar o vector store na inicialização para acelerar a primeira requisição
    getVectorStore().catch(err => console.log('Nenhum vector store preexistente encontrado.'));
});

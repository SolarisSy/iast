
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import path from 'path';
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from '@langchain/openai';
import { promises as fs } from 'fs';

export const runtime = 'nodejs'; // Forçar o uso do ambiente Node.js tradicional

const openai = new OpenAI();
const VECTOR_STORE_PATH = path.join(process.cwd(), 'vector_store');

// Cache para manter o vector store carregado em memória após o primeiro acesso
let vectorStore: HNSWLib | null = null;

async function getVectorStore() {
  // Se o vector store já estiver em cache, retorne-o
  if (vectorStore) {
    return vectorStore;
  }

  // Se não, carregue-o do disco
  console.log('Carregando vector store do disco...');
  const embeddings = new OpenAIEmbeddings();
  const loadedVectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
  
  // Armazene em cache para as próximas requisições
  vectorStore = loadedVectorStore;
  console.log('Vector store carregado e cacheado.');
  
  return vectorStore;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verificar se o diretório do vector store existe
    try {
      await fs.access(VECTOR_STORE_PATH);
    } catch (e) {
      console.error("Vector store not found. Please run the ingestion process first.");
      return NextResponse.json(
        { error: 'Vector store não encontrado. Execute o processo de ingestão primeiro.' },
        { status: 500 }
      );
    }

    // Carregar o vector store (do cache ou do disco)
    const store = await getVectorStore();

    // Buscar por documentos similares
    const retriever = store.asRetriever(6);
    const relevantDocs = await retriever.invoke(message);

    // Formatar o contexto para o prompt
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n');

    // Construir o prompt com o contexto (RAG)
    const prompt = `
      Você é um assistente de IA especialista no conteúdo de um documento sobre processos administrativos. Sua personalidade é a de um colega de trabalho prestativo, claro e objetivo.
      Sua tarefa principal é responder à pergunta do usuário usando **estritamente** o "Contexto Fornecido".

      **Instruções de Resposta:**

      1.  **Se a resposta estiver no contexto:** Responda de forma direta e concisa, focando na informação relevante. Evite frases como "Com base no contexto...". Aja como se você soubesse a informação.

      2.  **Se a resposta NÃO estiver no contexto:**
          *   Comece sua resposta com a frase: "Não encontrei uma resposta direta para isso no material."
          *   Em seguida, analise o contexto (que é o mais próximo que o sistema encontrou da pergunta) e diga: "No entanto, encontrei informações sobre tópicos relacionados que podem ser úteis. Por exemplo:"
          *   Sugira 2 ou 3 perguntas bem específicas que podem ser respondidas pelo contexto, formatadas como uma lista numerada.

      **Contexto Fornecido:**
      ---
      ${context}
      ---

      **Pergunta do Usuário:**
      ${message}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Usando um modelo mais novo e eficiente
      messages: [
        { role: 'system', content: 'Você é um assistente especialista no livro.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2, // Respostas mais determinísticas e focadas no contexto
      max_tokens: 500,
    });
    
    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

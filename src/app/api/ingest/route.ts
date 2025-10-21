
import { NextResponse } from 'next/server';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = 'nodejs'; // Forçar o uso do ambiente Node.js tradicional

const VECTOR_STORE_PATH = path.join(process.cwd(), 'vector_store');
const CORPUS_PATH = path.join(process.cwd(), 'src', 'corpus');

async function createAndSaveVectorStore() {
  console.log('Verificando e limpando o diretório do vector store antigo, se existir...');
  try {
    await fs.rm(VECTOR_STORE_PATH, { recursive: true, force: true });
    console.log('Diretório do vector store antigo removido.');
  } catch (e) {
    console.log('Nenhum diretório de vector store antigo encontrado.');
  }

  console.log('Iniciando a criação do vector store persistente a partir dos documentos...');
  
  const loader = new DirectoryLoader(CORPUS_PATH, {
    '.txt': (filePath: string) => new TextLoader(filePath),
    '.pdf': (filePath: string) => new PDFLoader(filePath),
  });

  const docs = await loader.load();
  
  if (docs.length === 0) {
    console.log('Nenhum documento encontrado no diretório corpus.');
    return;
  }
  console.log(`Carregados ${docs.length} documento(s).`);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(docs);
  console.log(`Documentos divididos em ${chunks.length} chunks.`);

  // Etapa de Sanitização: remove quaisquer chunks que tenham conteúdo de página vazio ou inválido.
  // Isso previne erros durante a criação dos embeddings se o PDF tiver páginas em branco ou malformadas.
  const sanitizedChunks = chunks.filter(
    (chunk) => chunk.pageContent && chunk.pageContent.trim() !== ''
  );
  console.log(`Sanitizado para ${sanitizedChunks.length} chunks válidos.`);

  // --- LOGS DE DIAGNÓSTICO AVANÇADO ---
  console.log('--- INICIANDO DIAGNÓSTICO DETALHADO DOS CHUNKS ---');
  let invalidChunkFound = false;
  for (let i = 0; i < sanitizedChunks.length; i++) {
    const chunk = sanitizedChunks[i];
    if (typeof chunk.pageContent !== 'string') {
      console.error(`!!! ERRO DE DIAGNÓSTICO: Chunk inválido encontrado no índice ${i} !!!`);
      console.error('   - Tipo do pageContent:', typeof chunk.pageContent);
      console.error('   - Metadados:', JSON.stringify(chunk.metadata, null, 2));
      console.error('   - Conteúdo (limitado):', String(chunk.pageContent).substring(0, 100));
      invalidChunkFound = true;
    }
  }

  if (invalidChunkFound) {
    const errorMessage = 'Chunks inválidos detectados. O tipo de pageContent não é string. Abortando a ingestão.';
    console.error(`--- DIAGNÓSTICO CONCLUÍDO: ${errorMessage} ---`);
    throw new Error(errorMessage);
  } else {
    console.log('--- DIAGNÓSTICO CONCLUÍDO: Todos os chunks são válidos. ---');
  }
  // --- FIM DOS LOGS DE DIAGNÓSTICO ---


  const embeddings = new OpenAIEmbeddings();
  
  console.log('Criando embeddings e o HNSWLib vector store...');

  // Solução Definitiva: Construção manual da store com metadados sanitizados.
  // O PDFLoader pode gerar metadados malformados. Ao substituí-los por metadados
  // simples e limpos, garantimos que a HNSWLib não encontrará dados inválidos.

  console.log('Etapa 1: Separando textos e criando metadados sanitizados...');
  const texts = sanitizedChunks.map(chunk => chunk.pageContent);
  // Descartamos os metadados originais e criamos novos, garantidamente seguros.
  const metadatas = sanitizedChunks.map((chunk, index) => ({
    source: chunk.metadata.source || 'PDF',
    loc: JSON.stringify(chunk.metadata.loc), // A localização pode ser um objeto, então a convertemos para string.
    chunk_index: index,
  }));
  console.log('Textos separados e metadados sanitizados criados.');


  console.log('Etapa 2: Criando a HNSWLib store a partir de textos e metadados...');
  const vectorStore = await HNSWLib.fromTexts(texts, metadatas, embeddings);
  console.log('Store criada com sucesso a partir dos textos.');
  
  await vectorStore.save(VECTOR_STORE_PATH);
  console.log(`Vector store salvo permanentemente em: ${VECTOR_STORE_PATH}`);
}

export async function POST() {
  try {
    await createAndSaveVectorStore();
    
    return NextResponse.json({
      success: true,
      message: `Ingestão concluída. O Vector Store foi salvo em ${VECTOR_STORE_PATH}.`,
    });
  } catch (error) {
    console.error('Erro durante a ingestão:', error);
    return NextResponse.json(
      { success: false, error: 'Falha no processo de ingestão.' },
      { status: 500 }
    );
  }
}

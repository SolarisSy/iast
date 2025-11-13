'use client';

import { useState, useEffect } from 'react';

interface VectorStoreStatus {
  exists: boolean;
  path: string;
  createdAt?: string;
  modifiedAt?: string;
  documentsIndexed: number;
  totalChunks: number;
  cached: boolean;
}

interface CorpusStatus {
  path: string;
  filesCount: number;
  files: string[];
}

interface StatusData {
  success: boolean;
  vectorStore: VectorStoreStatus;
  corpus: CorpusStatus;
  needsReindex: boolean;
}

interface TrainingStatusProps {
  refreshTrigger: number;
}

export function TrainingStatus({ refreshTrigger }: TrainingStatusProps) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/vector-store/status`);
      const result = await response.json();

      if (result.success) {
        setStatus(result);
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [refreshTrigger]);

  const handleReindex = async () => {
    if (!confirm('Deseja reprocessar todos os documentos?\n\nIsso pode levar alguns minutos.')) {
      return;
    }

    try {
      setReindexing(true);
      const response = await fetch(`${API_URL}/api/ingest`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        alert('Reindexação concluída com sucesso!');
        loadStatus();
      } else {
        alert('Erro ao reindexar: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor: ' + (error as Error).message);
    } finally {
      setReindexing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-medium text-white mb-4">📊 Status do Treinamento</h2>
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Carregando status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-medium text-white mb-4">📊 Status do Treinamento</h2>
        <div className="text-center py-8">
          <p className="text-red-400">Erro ao carregar status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-white">📊 Status do Treinamento</h2>
        <button
          onClick={loadStatus}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Atualizar status"
        >
          🔄
        </button>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-3xl mb-2">
            {status.vectorStore.exists ? '✅' : '❌'}
          </div>
          <p className="text-sm text-white/60 mb-1">Vector Store</p>
          <p className="text-xl font-semibold text-white">
            {status.vectorStore.exists ? 'Ativo' : 'Inativo'}
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-3xl mb-2">
            {status.vectorStore.cached ? '⚡' : '💾'}
          </div>
          <p className="text-sm text-white/60 mb-1">Cache</p>
          <p className="text-xl font-semibold text-white">
            {status.vectorStore.cached ? 'Em Memória' : 'Em Disco'}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="space-y-4 mb-6">
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-400">Documentos Indexados</span>
            <span className="text-2xl font-bold text-blue-400">
              {status.vectorStore.documentsIndexed}
            </span>
          </div>
          <div className="text-xs text-white/40">
            {status.corpus.filesCount} arquivo{status.corpus.filesCount !== 1 ? 's' : ''} em corpus/
          </div>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-400">Chunks Processados</span>
            <span className="text-2xl font-bold text-green-400">
              {status.vectorStore.totalChunks.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-white/40">
            Pedaços de texto indexados para busca
          </div>
        </div>
      </div>

      {/* Alerta de Reindexação */}
      {status.needsReindex && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-yellow-400 font-medium mb-1">
                Reindexação Necessária
              </p>
              <p className="text-sm text-white/60 mb-3">
                Há {status.corpus.filesCount - status.vectorStore.documentsIndexed} documento(s) 
                não indexado(s). A IA pode não ter acesso aos dados mais recentes.
              </p>
              <button
                onClick={handleReindex}
                disabled={reindexing}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {reindexing ? '⏳ Reindexando...' : '🔄 Reindexar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-white/60">Última Atualização</span>
          <span className="text-white font-mono text-xs">
            {formatDate(status.vectorStore.modifiedAt)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/10">
          <span className="text-white/60">Criado Em</span>
          <span className="text-white font-mono text-xs">
            {formatDate(status.vectorStore.createdAt)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-white/60">Caminho</span>
          <span className="text-white/40 font-mono text-xs">
            {status.vectorStore.path}
          </span>
        </div>
      </div>

      {/* Botão de Reindexação Manual */}
      {!status.needsReindex && status.vectorStore.exists && (
        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="w-full mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm font-medium transition-colors border border-white/10"
        >
          {reindexing ? '⏳ Reindexando...' : '🔄 Reprocessar Todos os Documentos'}
        </button>
      )}
    </div>
  );
}


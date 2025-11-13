'use client';

import { useState, useEffect } from 'react';

interface Document {
  filename: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: string;
  modifiedAt: string;
}

interface DocumentListProps {
  onDeleteSuccess: (message: string) => void;
  onDeleteError: (message: string) => void;
  refreshTrigger: number;
}

export function DocumentList({ onDeleteSuccess, onDeleteError, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/documents`);
      const result = await response.json();

      if (result.success) {
        setDocuments(result.documents || []);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (filename: string) => {
    if (!confirm(`Tem certeza que deseja remover "${filename}"?\n\nIsso também reindexará a IA.`)) {
      return;
    }

    try {
      setDeleting(filename);
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(filename)}?reindex=true`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        onDeleteSuccess(`Documento "${filename}" removido e IA reindexada com sucesso!`);
        loadDocuments(); // Recarrega lista
      } else {
        onDeleteError(result.error || 'Erro ao remover documento');
      }
    } catch (error) {
      onDeleteError('Erro ao conectar com o servidor: ' + (error as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-medium text-white mb-4">📚 Documentos Treinados</h2>
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-white">📚 Documentos Treinados</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
          </span>
          <button
            onClick={loadDocuments}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Recarregar lista"
          >
            🔄
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-white/60 mb-2">Nenhum documento treinado ainda</p>
          <p className="text-sm text-white/40">
            Faça upload de PDFs acima para treinar a IA
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate mb-1">
                      {doc.filename}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                      <span>📦 {doc.sizeFormatted}</span>
                      <span>📅 {formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.filename)}
                  disabled={deleting === doc.filename}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {deleting === doc.filename ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Removendo...
                    </span>
                  ) : (
                    '🗑️ Remover'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


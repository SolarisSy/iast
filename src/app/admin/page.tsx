'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DocumentUpload } from '@/components/admin/DocumentUpload';
import { DocumentList } from '@/components/admin/DocumentList';
import { TrainingStatus } from '@/components/admin/TrainingStatus';
import { ToastContainer } from '@/components/admin/Toast';
import PromptManager from '@/components/admin/PromptManager';
import WhatsAppManager from '@/components/admin/WhatsAppManager';
import WhatsAppChat from '@/components/admin/WhatsAppChat';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function AdminPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'documents' | 'prompts' | 'whatsapp' | 'chat'>('documents');

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleUploadSuccess = (message: string) => {
    addToast(message, 'success');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh nos outros componentes
  };

  const handleUploadError = (message: string) => {
    addToast(message, 'error');
  };

  const handleDeleteSuccess = (message: string) => {
    addToast(message, 'success');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh nos outros componentes
  };

  const handleDeleteError = (message: string) => {
    addToast(message, 'error');
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  ⚙️ Painel de Administração
                </h1>
                <p className="text-white/60">
                  Gerencie documentos e treine a IA com novos PDFs
                </p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                ← Voltar ao Chat
              </Link>
            </div>
            
            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-blue-400 font-medium mb-1">
                    Como funciona o treinamento
                  </p>
                  <p className="text-sm text-white/60">
                    1. Faça upload de PDFs → 2. Sistema processa e indexa automaticamente → 
                    3. IA passa a responder com base nos novos documentos → 4. Acompanhe o status em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📄 Documentos & Treinamento
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              🎭 Personalidade & Prompts
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📱 WhatsApp Manager
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              💬 WhatsApp Chat
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload & List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Section */}
                <DocumentUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />

                {/* Documents List */}
                <DocumentList
                  onDeleteSuccess={handleDeleteSuccess}
                  onDeleteError={handleDeleteError}
                  refreshTrigger={refreshTrigger}
                />
              </div>

              {/* Right Column - Status */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <TrainingStatus refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div>
              <PromptManager />
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div>
              <WhatsAppManager />
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <WhatsAppChat />
            </div>
          )}

          {/* Footer Info - Ocultar nas abas do WhatsApp */}
          {activeTab !== 'whatsapp' && activeTab !== 'chat' && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white/60 text-sm">
                  💡 Dica: Os documentos são processados automaticamente ao fazer upload
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


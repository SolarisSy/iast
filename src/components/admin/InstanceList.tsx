'use client';

import { memo } from 'react';

interface Instance {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
  profileStatus?: string | null;
  number?: string | null;
  token: string;
  disconnectionReasonCode?: number | null;
  disconnectionObject?: string | null;
}

interface InstanceListProps {
  instances: Instance[];
  loading: boolean;
  onConnect: (instanceName: string) => void;
  onDisconnect: (instanceName: string) => void;
  onDelete: (instanceName: string) => void;
  onReconnect: (instanceName: string) => void;
}

function InstanceListComponent({ 
  instances, 
  loading, 
  onConnect, 
  onDisconnect, 
  onDelete,
  onReconnect 
}: InstanceListProps) {
  
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    const statusLower = status.toLowerCase();
    if (statusLower === 'open' || statusLower === 'connected') {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (statusLower === 'connecting') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (statusLower === 'close' || statusLower === 'closed') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status: string) => {
    if (!status) return '❓';
    const statusLower = status.toLowerCase();
    if (statusLower === 'open' || statusLower === 'connected') {
      return '✅';
    }
    if (statusLower === 'connecting') {
      return '⏳';
    }
    if (statusLower === 'close' || statusLower === 'closed') {
      return '❌';
    }
    return '❓';
  };

  const isConnected = (status: string) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === 'open' || statusLower === 'connected';
  };

  if (loading && instances.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Carregando instâncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Instâncias Conectadas</h3>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
          {instances.length} {instances.length === 1 ? 'instância' : 'instâncias'}
        </span>
      </div>

      {instances.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <p className="text-white/60 mb-2">Nenhuma instância criada ainda</p>
          <p className="text-white/40 text-sm">
            Clique em "Nova Instância" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {instances.map((instance, index) => {
            const instanceName = instance.name;
            const status = instance.connectionStatus;
            
            return (
            <div
              key={instanceName || index}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Header da Instância */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{instanceName}</h4>
                    {instance.profileName && (
                      <span className="text-white/60 text-sm">
                        ({instance.profileName})
                      </span>
                    )}
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    <span>{getStatusIcon(status)}</span>
                    <span>
                      {status === 'connecting' && 'Conectando...'}
                      {status === 'open' && 'Conectado'}
                      {status === 'connected' && 'Conectado'}
                      {status === 'close' && 'Desconectado'}
                      {status === 'closed' && 'Desconectado'}
                      {!status && 'Aguardando'}
                      {status && !['connecting', 'open', 'connected', 'close', 'closed'].includes(status) && status}
                    </span>
                  </div>
                </div>

                {instance.profilePicUrl && (
                  <img
                    src={instance.profilePicUrl}
                    alt={instance.profileName || 'Profile'}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                )}
              </div>

              {/* Informações Adicionais */}
              {instance.profileStatus && (
                <div className="mb-3 px-3 py-2 bg-white/5 rounded text-sm text-white/60">
                  💬 {instance.profileStatus}
                </div>
              )}

              {/* Aviso: Problemas de Timeout/Keep-Alive */}
              {status === 'connecting' && (
                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-yellow-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Problema de Conexão Detectado
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="bg-black/20 rounded p-2">
                      <p className="font-semibold text-white/90 mb-1">🔍 O que está acontecendo:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/60 ml-2">
                        <li>A conexão está demorando muito (timeout)</li>
                        <li>WhatsApp pode estar bloqueando temporariamente</li>
                        <li>Possível problema de rede ou firewall</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2">
                      <p className="font-semibold text-orange-400 mb-1">🛑 O que NÃO fazer:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/70 ml-2">
                        <li><strong>NÃO</strong> escaneie o QR Code várias vezes</li>
                        <li><strong>NÃO</strong> tente reconectar imediatamente</li>
                        <li><strong>NÃO</strong> use o mesmo número em outro lugar</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                      <p className="font-semibold text-blue-400 mb-1">✅ Solução recomendada:</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-white/70 ml-2">
                        <li>Deletar esta instância</li>
                        <li><strong>Aguardar 5-10 minutos</strong></li>
                        <li>Criar nova instância</li>
                        <li>Escanear QR Code <strong>UMA VEZ APENAS</strong></li>
                        <li>Aguardar até 2 minutos pela conexão</li>
                      </ol>
                    </div>
                    
                    <p className="text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                      ⏰ IMPORTANTE: Aguarde 5-10 minutos antes de tentar novamente!
                    </p>
                  </div>
                </div>
              )}

              {/* Erro de Desconexão - Detalhado */}
              {status === 'close' && instance.disconnectionReasonCode === 401 && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Conflito de Conexão (Erro 401)
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="bg-black/20 rounded p-2">
                      <p className="font-semibold text-white/90 mb-1">📋 Possíveis causas:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/60 ml-2">
                        <li>QR Code escaneado múltiplas vezes</li>
                        <li>Mesmo número em outro lugar</li>
                        <li>Sessão antiga não limpa</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                      <p className="font-semibold text-green-400 mb-1">✅ Como resolver:</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-white/70 ml-2">
                        <li>Clique em "Limpar e Reconectar"</li>
                        <li>Aguarde ~15 segundos</li>
                        <li>Escaneie o QR UMA VEZ</li>
                      </ol>
                    </div>
                    
                    <p className="text-yellow-400 font-medium">
                      ⚡ Se persistir, aguarde 5min antes de tentar
                    </p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                {/* Botões de ação principal */}
                {status === 'close' && instance.disconnectionReasonCode === 401 ? (
                  // Erro 401: Mostrar botão especial de limpar e reconectar
                  <button
                    onClick={() => {
                      if (confirm(`Isso vai deletar a instância "${instanceName}" e criar uma nova com QR Code. Continuar?`)) {
                        onReconnect(instanceName);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🔄</span> Limpar e Reconectar
                  </button>
                ) : !isConnected(status) ? (
                  // Desconectado/Conectando: Botão de conectar
                  <button
                    onClick={() => onConnect(instanceName)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🔗</span> Conectar
                  </button>
                ) : (
                  // Conectado: Botões de reconectar e desconectar
                  <>
                    <button
                      onClick={() => onConnect(instanceName)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>🔄</span> Reconectar
                    </button>
                    <button
                      onClick={() => onDisconnect(instanceName)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>🔌</span> Desconectar
                    </button>
                  </>
                )}
                
                {/* Botão de deletar - SEMPRE VISÍVEL */}
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja deletar a instância "${instanceName}"?`)) {
                      onDelete(instanceName);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Deletar instância"
                >
                  🗑️
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-white/40 text-xs mb-2">Status:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span>✅</span>
            <span className="text-green-400">Conectado</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏳</span>
            <span className="text-yellow-400">Conectando</span>
          </div>
          <div className="flex items-center gap-1">
            <span>❌</span>
            <span className="text-red-400">Desconectado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Usar memo para evitar re-renderizações desnecessárias
export const InstanceList = memo(InstanceListComponent);

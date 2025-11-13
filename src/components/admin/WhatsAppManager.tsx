'use client';

import { useState, useEffect } from 'react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { InstanceList } from './InstanceList';

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

export default function WhatsAppManager() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceNumber, setNewInstanceNumber] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://list-2-evolution-api.zqprdy.easypanel.host';
  const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';

  // Buscar instâncias existentes
  const fetchInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao buscar instâncias:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText || 'Erro ao buscar instâncias'}`);
      }

      const data = await response.json();
      setInstances(data);
    } catch (err) {
      console.error('❌ Erro ao carregar instâncias:', err);
      setError(`Erro ao carregar instâncias: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova instância
  const createInstance = async () => {
    if (!newInstanceName.trim()) {
      setError('Digite um nome para a instância');
      return;
    }

    // Verificar se já existe instância com o mesmo número
    if (newInstanceNumber.trim()) {
      const existingWithNumber = instances.find(inst => 
        inst.number === newInstanceNumber.trim() || 
        (inst.ownerJid && inst.ownerJid.includes(newInstanceNumber.trim().replace(/\D/g, '')))
      );
      
      if (existingWithNumber) {
        setError(`Já existe uma instância conectada com este número: ${existingWithNumber.name}`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      // Preparar dados da instância
      const instanceData: any = {
        instanceName: newInstanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      };

      // Adicionar número se fornecido
      if (newInstanceNumber.trim()) {
        instanceData.number = newInstanceNumber.trim();
        console.log('📱 Criando instância com número:', newInstanceNumber.trim());
      }

      const response = await fetch(`${API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify(instanceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao criar instância:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Instância criada:', newInstanceName);
      
      setSelectedInstance(newInstanceName);
      await getQRCode(newInstanceName);
      
      setNewInstanceName('');
      setNewInstanceNumber('');
      setShowCreateModal(false);
      await fetchInstances();
    } catch (err) {
      console.error('❌ Erro ao criar instância:', err);
      setError(`Erro ao criar instância: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Obter QR Code para conexão
  const getQRCode = async (instanceName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao obter QR Code:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.base64) {
        setQrCode(data.base64);
        setSelectedInstance(instanceName);
      } else if (data.code) {
        setQrCode(data.code);
        setSelectedInstance(instanceName);
      } else {
        setError('QR Code não disponível. A instância pode já estar conectada.');
      }
    } catch (err) {
      console.error('❌ Erro ao obter QR Code:', err);
      setError(`Erro ao obter QR Code: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Verificar e limpar instâncias duplicadas
  const checkAndCleanDuplicates = async (ownerJid: string) => {
    try {
      const response = await fetch(`${API_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (response.ok) {
        const allInstances = await response.json();
        const duplicates = allInstances.filter((inst: any) => inst.ownerJid === ownerJid);
        
        if (duplicates.length > 1) {
          console.log('⚠️ Encontradas', duplicates.length, 'instâncias duplicadas para o mesmo número');
          return duplicates;
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar duplicatas:', err);
    }
    return [];
  };

  // Desconectar instância
  const disconnectInstance = async (instanceName: string) => {
    if (!confirm(`Deseja realmente desconectar a instância "${instanceName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar instância');
      }

      await fetchInstances();
    } catch (err) {
      setError('Erro ao desconectar instância.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Deletar instância
  const deleteInstance = async (instanceName: string) => {
    if (!confirm(`Deseja realmente DELETAR a instância "${instanceName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar instância');
      }

      if (selectedInstance === instanceName) {
        setSelectedInstance(null);
        setQrCode(null);
      }

      await fetchInstances();
    } catch (err) {
      setError('Erro ao deletar instância.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Limpar e reconectar instância (logout + deletar + criar nova)
  const reconnectInstance = async (instanceName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando limpeza completa da instância:', instanceName);
      
      // PASSO 1: Tentar fazer logout/disconnect primeiro
      try {
        console.log('🔌 Tentando desconectar sessão do WhatsApp...');
        const logoutResponse = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
        });
        
        if (logoutResponse.ok) {
          console.log('✅ Logout realizado com sucesso');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar 3s
        } else {
          console.log('⚠️ Logout falhou ou não necessário, continuando...');
        }
      } catch (logoutErr) {
        console.log('⚠️ Erro no logout (continuando):', logoutErr);
      }

      // PASSO 2: Deletar instância
      console.log('🗑️ Deletando instância...');
      const deleteResponse = await fetch(`${API_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      if (!deleteResponse.ok) {
        throw new Error('Erro ao deletar instância antiga');
      }

      console.log('✅ Instância deletada');

      // PASSO 3: Aguardar 5 segundos para garantir limpeza completa
      console.log('⏳ Aguardando 5 segundos para limpeza completa...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // PASSO 4: Verificar se já existe uma instância com esse nome
      try {
        const checkResponse = await fetch(`${API_URL}/instance/fetchInstances`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
        });
        
        if (checkResponse.ok) {
          const instances = await checkResponse.json();
          const existingInstance = instances.find((inst: any) => inst.name === instanceName);
          
          if (existingInstance) {
            console.log('⚠️ Instância ainda existe! Aguardando mais 3 segundos...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } catch (checkErr) {
        console.log('⚠️ Erro ao verificar instâncias:', checkErr);
      }

      // PASSO 5: Criar nova instância
      console.log('➕ Criando nova instância...');
      const createResponse = await fetch(`${API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('❌ Erro ao criar nova instância:', createResponse.status, errorText);
        throw new Error(`Erro ao criar nova instância: ${createResponse.status} - ${errorText}`);
      }

      const createData = await createResponse.json();
      console.log('✅ Nova instância criada:', createData);

      // PASSO 6: Aguardar 2 segundos antes de obter QR Code
      await new Promise(resolve => setTimeout(resolve, 2000));

      // PASSO 7: Obter QR Code
      console.log('📱 Obtendo QR Code...');
      setSelectedInstance(instanceName);
      await getQRCode(instanceName);

      // PASSO 8: Atualizar lista
      await fetchInstances();

      console.log('✅ Reconexão concluída com sucesso!');
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao reconectar instância:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erro ao reconectar: ${errorMessage}. Tente novamente em alguns minutos.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar instâncias inicialmente
    fetchInstances();
    
    // Polling a cada 10 segundos para atualizar status
    const interval = setInterval(() => {
      fetchInstances();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Fechar QR Code automaticamente quando conectar
  useEffect(() => {
    if (selectedInstance && qrCode) {
      const instance = instances.find(i => i.name === selectedInstance);
      if (instance && instance.connectionStatus === 'open') {
        setQrCode(null);
        setSelectedInstance(null);
      }
    }
  }, [instances, selectedInstance, qrCode]);

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📱</span> Gerenciador WhatsApp
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Gerencie suas instâncias do WhatsApp via Evolution API
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>➕</span> Nova Instância
          </button>
        </div>

        {/* Status da API */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <div className="flex-1">
              <p className="text-blue-400 font-medium">API Evolution Conectada</p>
              <p className="text-sm text-white/60 break-all">{API_URL}</p>
            </div>
            <button
              onClick={fetchInstances}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Aviso sobre Conflitos */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-yellow-400 font-medium mb-1">Importante</p>
              <p className="text-sm text-white/60">
                Se aparecer "Conflito Detectado", use o botão <strong>"Limpar e Reconectar"</strong> para resolver. 
                Isso acontece quando o mesmo número tenta se conectar em múltiplas instâncias.
              </p>
            </div>
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-400 font-medium">Erro</p>
                <p className="text-sm text-white/60">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid com Lista e QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Instâncias */}
        <InstanceList
          instances={instances}
          loading={loading}
          onConnect={getQRCode}
          onDisconnect={disconnectInstance}
          onDelete={deleteInstance}
          onReconnect={reconnectInstance}
        />

        {/* QR Code Display */}
        {qrCode && selectedInstance && (
          <QRCodeDisplay
            qrCode={qrCode}
            instanceName={selectedInstance}
            onClose={() => {
              setQrCode(null);
              setSelectedInstance(null);
            }}
            onRefresh={() => getQRCode(selectedInstance)}
          />
        )}
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Nova Instância WhatsApp
            </h3>
            
            <div className="space-y-4">
              {/* Nome da Instância */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nome da Instância *
                </label>
                <input
                  type="text"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  placeholder="ex: meu-whatsapp"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createInstance()}
                />
                <p className="text-white/40 text-xs mt-1">
                  Use apenas letras minúsculas, números e hífens
                </p>
              </div>

              {/* Número do WhatsApp (Opcional) */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                  Número do WhatsApp
                  <span className="text-xs text-white/40 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={newInstanceNumber}
                  onChange={(e) => setNewInstanceNumber(e.target.value)}
                  placeholder="ex: 5511999999999"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createInstance()}
                />
                <p className="text-white/40 text-xs mt-1">
                  Inclua o código do país (ex: 55 para Brasil). Ajuda a identificar e evitar conflitos.
                </p>
              </div>

              {/* Aviso Informativo */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-medium mb-1">💡 Dica</p>
                <p className="text-white/60 text-xs">
                  Informar o número ajuda a:
                  <br />• Identificar a instância facilmente
                  <br />• Evitar conexões duplicadas
                  <br />• Melhor organização das instâncias
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewInstanceName('');
                    setNewInstanceNumber('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createInstance}
                  disabled={loading || !newInstanceName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


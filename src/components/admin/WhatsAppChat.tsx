'use client';

import { useState, useEffect } from 'react';
import { Instance, Chat, Message } from '@/types/whatsapp';
import { ChatList } from './ChatList';
import { MessageView } from './MessageView';
import { WhatsAppDebug } from './WhatsAppDebug';

export default function WhatsAppChat() {
  const [showDebug, setShowDebug] = useState(false);
  const [showTestMessage, setShowTestMessage] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testText, setTestText] = useState('Olá! Esta é uma mensagem de teste.');
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://list-2-evolution-api.zqprdy.easypanel.host';
  const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';

  // Tentar endpoints alternativos
  const tryAlternativeEndpoints = async (instanceName: string) => {
    const alternativeEndpoints = [
      { url: `/chat/find/${instanceName}`, method: 'GET', body: null },
      { url: `/chat/fetchChats/${instanceName}`, method: 'GET', body: null },
      { url: `/message/findChats/${instanceName}`, method: 'POST', body: { where: {} } },
      { url: `/chat/findMessages/${instanceName}`, method: 'POST', body: { where: {} } },
      { url: `/instance/fetchChats/${instanceName}`, method: 'GET', body: null },
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`🔄 Tentando: ${endpoint.method} ${API_URL}${endpoint.url}`);
        
        const options: RequestInit = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
          },
        };

        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body);
        }

        const response = await fetch(`${API_URL}${endpoint.url}`, options);
        
        console.log(`   └─ Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ SUCESSO com endpoint:', endpoint.url);
          console.log('✅ Dados:', data);
          console.groupEnd();
          return data;
        }
      } catch (err) {
        console.log(`   └─ Falhou:`, err);
      }
    }

    console.groupEnd();
    throw new Error('Nenhum endpoint alternativo funcionou. Verifique a documentação da API.');
  };

  // Buscar instâncias disponíveis
  const fetchInstances = async () => {
    try {
      console.group('🔌 FETCH INSTANCES - Início');
      console.log('🌐 API_URL:', API_URL);
      
      const url = `${API_URL}/instance/fetchInstances`;
      console.log('🎯 URL:', url);
      console.log('⏳ Buscando instâncias...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
      });

      console.log('📥 Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO:', errorText);
        console.groupEnd();
        throw new Error(`Erro ao buscar instâncias: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Instâncias recebidas:', data.length);
      console.log('✅ Dados:', data);
      
      // Filtrar apenas instâncias conectadas
      const connectedInstances = data.filter((inst: Instance) => inst.connectionStatus === 'open');
      console.log('🟢 Instâncias conectadas:', connectedInstances.length);
      
      if (connectedInstances.length > 0) {
        console.log('📋 Lista de instâncias conectadas:');
        connectedInstances.forEach((inst: Instance, index: number) => {
          console.log(`   ${index + 1}. ${inst.name} (${inst.profileName || 'Sem nome'})`);
        });
      } else {
        console.warn('⚠️ Nenhuma instância conectada encontrada');
      }
      
      console.groupEnd();
      setInstances(connectedInstances);
      
      // Selecionar primeira instância automaticamente
      if (connectedInstances.length > 0 && !selectedInstance) {
        console.log('🎯 Selecionando instância automaticamente:', connectedInstances[0].name);
        setSelectedInstance(connectedInstances[0].name);
      }
    } catch (err) {
      console.error('❌ ERRO FATAL ao buscar instâncias:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'N/A');
      console.groupEnd();
      setError('Erro ao carregar instâncias conectadas');
    }
  };

  // Buscar chats da instância selecionada
  const fetchChats = async (instanceName: string) => {
    if (!instanceName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.group('🔍 FETCH CHATS - Início');
      console.log('📊 Instância:', instanceName);
      console.log('🌐 API_URL:', API_URL);
      console.log('🔑 API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : '❌ NÃO DEFINIDA');
      
      const url = `${API_URL}/chat/findChats/${instanceName}`;
      console.log('🎯 URL completa:', url);
      
      const headers = {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      };
      console.log('📤 Headers:', headers);
      
      const body = { where: {} };
      console.log('📦 Body:', JSON.stringify(body));
      
      console.log('⏳ Enviando requisição POST...');
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      console.log('📥 Resposta recebida');
      console.log('   └─ Status:', response.status);
      console.log('   └─ Status Text:', response.statusText);
      console.log('   └─ OK:', response.ok);
      console.log('   └─ Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO - Corpo da resposta:', errorText);
        console.error('❌ ERRO - Status completo:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
        });
        console.groupEnd();
        
        // Tentar endpoint alternativo
        console.group('🔄 Tentando endpoint alternativo...');
        return await tryAlternativeEndpoints(instanceName);
      }

      const responseData = await response.json();
      console.log('✅ Dados recebidos (tipo):', typeof responseData);
      console.log('✅ Dados recebidos (array?):', Array.isArray(responseData));
      console.log('✅ Dados recebidos (conteúdo):', responseData);
      
      // A resposta pode ser um array direto ou pode ter os dados dentro de uma propriedade
      const chatsData = Array.isArray(responseData) ? responseData : (responseData.data || responseData.chats || []);
      console.log('📱 Chats encontrados (quantidade):', chatsData.length);
      console.log('📱 Chats encontrados (amostra):', chatsData.slice(0, 2));
      
      console.groupEnd();
      
      if (!Array.isArray(chatsData) || chatsData.length === 0) {
        console.warn('⚠️ Nenhum chat encontrado ou formato inesperado');
        console.log('💡 Isso pode significar que não há conversas nesta instância ainda');
        setChats([]);
        setLoading(false);
        return;
      }
      
      // Processar e ordenar chats
      console.log('🔄 Processando chats...');
      const processedChats: Chat[] = chatsData.map((chat: any, index: number) => {
        // Log completo do chat bruto para debug
        if (index < 3) {
          console.log(`📦 Chat bruto ${index + 1}:`, JSON.stringify(chat, null, 2));
        }
        
        // CORREÇÃO: O remoteJid está dentro de lastMessage.key!
        const chatId = chat.id 
          || chat.remoteJid 
          || chat.lastMessage?.key?.remoteJid  // ← ADICIONADO!
          || chat.jid 
          || chat.participant 
          || chat.contactId 
          || 'unknown';
        
        // Extrair nome do pushName ou do próprio ID
        const pushName = chat.pushName 
          || chat.name 
          || chat.notifyName 
          || chat.lastMessage?.pushName  // ← ADICIONADO!
          || chatId?.split('@')[0] 
          || 'Sem nome';
        
        const processed = {
          id: chatId,
          name: pushName,
          isGroup: chatId?.includes('@g.us') || false,
          unreadCount: chat.unreadCount || 0,
          lastMessage: chat.lastMessage ? {
            text: chat.lastMessage.message?.conversation 
              || chat.lastMessage.message?.extendedTextMessage?.text 
              || chat.lastMessage.conversation  // fallback antigo
              || 'Mídia',
            timestamp: chat.lastMessage.messageTimestamp || Date.now(),
            fromMe: chat.lastMessage.key?.fromMe || false,
          } : undefined,
          profilePicUrl: chat.profilePicUrl,
        };
        
        if (index < 3) {
          console.log(`   └─ Chat ${index + 1} processado:`, processed.name, `(${processed.id})`);
        }
        
        return processed;
      });

      // Ordenar por última mensagem
      processedChats.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA;
      });

      console.log('✅ Total de chats processados:', processedChats.length);
      setChats(processedChats);
    } catch (err) {
      console.error('❌ ERRO FATAL ao buscar chats:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'N/A');
      console.groupEnd();
      setError(`Erro ao carregar conversas: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Buscar mensagens de um chat específico
  const fetchMessages = async (instanceName: string, chatId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.group('💬 FETCH MESSAGES - Início');
      console.log('📊 Instância:', instanceName);
      console.log('💬 Chat ID:', chatId);
      
      const url = `${API_URL}/chat/findMessages/${instanceName}`;
      console.log('🎯 URL:', url);
      
      const bodyData = {
        where: {
          key: {
            remoteJid: chatId,
          },
        },
        limit: 100,
      };
      console.log('📦 Body:', JSON.stringify(bodyData, null, 2));
      
      console.log('⏳ Enviando requisição...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify(bodyData),
      });

      console.log('📥 Resposta:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO:', errorText);
        console.groupEnd();
        throw new Error(`Erro ao buscar mensagens: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Resposta de mensagens (tipo):', typeof responseData);
      console.log('✅ Resposta de mensagens (é array?):', Array.isArray(responseData));
      console.log('✅ Resposta de mensagens (conteúdo completo):', responseData);
      
      // LOGS DETALHADOS PARA DEBUG
      if (responseData.messages) {
        console.log('🔍 ESTRUTURA DE MESSAGES:');
        console.log('   └─ Tipo:', typeof responseData.messages);
        console.log('   └─ É array?:', Array.isArray(responseData.messages));
        if (typeof responseData.messages === 'object' && !Array.isArray(responseData.messages)) {
          console.log('   └─ Keys:', Object.keys(responseData.messages));
          console.log('   └─ É paginação?:', 'records' in responseData.messages);
        }
      }
      
      // CORREÇÃO: A resposta pode vir em múltiplos formatos
      let data = [];
      if (Array.isArray(responseData)) {
        data = responseData;
        console.log('✅ Formato: Array direto');
      } else if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;
        console.log('✅ Formato: responseData.data (array)');
      } else if (responseData.messages) {
        if (Array.isArray(responseData.messages)) {
          data = responseData.messages;
          console.log('✅ Formato: responseData.messages (array)');
        } else if (typeof responseData.messages === 'object') {
          // CORREÇÃO: API retorna objeto de paginação!
          if (responseData.messages.records && Array.isArray(responseData.messages.records)) {
            // Formato de paginação: { total, pages, currentPage, records: [...] }
            data = responseData.messages.records;
            console.log('✅ Formato: Paginação (records)');
            console.log('📊 Total de mensagens:', responseData.messages.total);
            console.log('📊 Páginas:', responseData.messages.pages);
            console.log('📊 Página atual:', responseData.messages.currentPage);
          } else {
            // Objeto comum, converter valores
            const messagesObj = responseData.messages;
            data = Object.keys(messagesObj).map(key => messagesObj[key]);
            console.log('✅ Formato: Objeto comum convertido');
          }
        }
      }
      
      console.log('✅ Mensagens recebidas (quantidade):', data.length);
      console.log('✅ Mensagens recebidas (amostra):', data.slice(0, 2));
      
      // Garantir que é array antes de ordenar
      if (!Array.isArray(data)) {
        console.warn('⚠️ Data não é array após processamento:', typeof data);
        data = [];
      }
      
      // Ordenar mensagens por timestamp
      console.log('🔄 Ordenando mensagens...');
      const sortedMessages = data.sort((a: any, b: any) => {
        return (a.messageTimestamp || 0) - (b.messageTimestamp || 0);
      });
      
      console.log('✅ Mensagens ordenadas:', sortedMessages.length);
      console.groupEnd();
      setMessages(sortedMessages);
    } catch (err) {
      console.error('❌ ERRO FATAL ao buscar mensagens:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'N/A');
      console.groupEnd();
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem de teste (para criar conversas)
  const sendTestMessage = async () => {
    if (!selectedInstance || !testNumber.trim() || !testText.trim()) {
      setError('Preencha o número e o texto da mensagem');
      return;
    }

    // Validar formato do número
    const cleanNumber = testNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setError('Número muito curto! Inclua código do país + DDD + número (ex: 5511999999999)');
      return;
    }
    if (!cleanNumber.startsWith('55') && cleanNumber.length < 12) {
      setError('⚠️ Atenção: Número pode estar sem código do país! Use formato: 5511999999999');
      return;
    }

    try {
      console.group('📤 SEND TEST MESSAGE - Início');
      console.log('📊 Instância:', selectedInstance);
      console.log('📱 Número original:', testNumber);
      console.log('📱 Número limpo:', cleanNumber);
      console.log('📝 Texto:', testText);
      
      const endpoint = `${API_URL}/message/sendText/${selectedInstance}`;
      const body = {
        number: cleanNumber,
        text: testText,
      };

      console.log('🎯 Endpoint:', endpoint);
      console.log('📦 Body:', JSON.stringify(body, null, 2));
      console.log('⏳ Enviando...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify(body),
      });

      console.log('📥 Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO:', errorText);
        console.groupEnd();
        
        // Tentar parsear o erro para mensagem mais amigável
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.response?.message?.[0]?.exists === false) {
            throw new Error(`❌ Número ${cleanNumber} não existe no WhatsApp ou está incorreto!`);
          }
        } catch (parseErr) {
          // Se não conseguir parsear, usar mensagem genérica
        }
        
        throw new Error(`Erro ao enviar mensagem: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Resposta:', responseData);
      console.log('✅ Mensagem de teste enviada com sucesso!');
      console.groupEnd();
      
      setShowTestMessage(false);
      setTestNumber('');
      setError(null);
      alert('✅ Mensagem enviada! Aguarde alguns segundos e clique em "🔄 Atualizar"');
      
      // Recarregar chats após 3 segundos
      setTimeout(() => {
        if (selectedInstance) {
          fetchChats(selectedInstance);
        }
      }, 3000);
    } catch (err) {
      console.error('❌ ERRO FATAL ao enviar mensagem de teste:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'N/A');
      console.groupEnd();
      setError(`Erro ao enviar mensagem: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Enviar mensagem
  const sendMessage = async (text: string, media?: { url?: string; base64?: string; fileName?: string; caption?: string }) => {
    if (!selectedInstance || !selectedChat) return;

    try {
      console.group('📤 SEND MESSAGE - Início');
      console.log('📊 Instância:', selectedInstance);
      console.log('💬 Chat:', selectedChat.name);
      console.log('💬 Chat ID completo:', selectedChat.id);
      console.log('📝 Texto:', text);
      console.log('📎 Mídia:', media ? 'Sim' : 'Não');
      
      // Extrair número do remoteJid (formato: 554121701470@s.whatsapp.net)
      const chatNumber = selectedChat.id?.split('@')[0] || selectedChat.id;
      console.log('📱 Número extraído:', chatNumber);
      
      let endpoint = '';
      let body: any = {
        number: chatNumber,
      };

      if (media) {
        // Enviar mídia
        endpoint = `${API_URL}/message/sendMedia/${selectedInstance}`;
        body = {
          ...body,
          mediaMessage: {
            mediatype: 'image', // ou 'video', 'audio', 'document'
            ...media,
            caption: media.caption || text,
          },
        };
      } else {
        // Enviar texto
        endpoint = `${API_URL}/message/sendText/${selectedInstance}`;
        body.text = text;
      }

      console.log('🎯 Endpoint:', endpoint);
      console.log('📦 Body:', JSON.stringify(body, null, 2));
      console.log('⏳ Enviando...');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify(body),
      });

      console.log('📥 Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO:', errorText);
        console.groupEnd();
        
        // Tentar parsear o erro para mensagem mais amigável
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.response?.message?.[0]?.exists === false) {
            const failedNumber = errorData.response.message[0].number;
            throw new Error(`❌ Erro: Número ${failedNumber} não existe no WhatsApp! Verifique se o número está correto.`);
          }
        } catch (parseErr) {
          // Se não conseguir parsear, usar mensagem genérica
        }
        
        throw new Error(`Erro ao enviar mensagem (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Resposta:', responseData);
      console.log('✅ Mensagem enviada com sucesso!');
      console.groupEnd();
      
      // Recarregar mensagens após envio
      console.log('🔄 Recarregando mensagens...');
      await fetchMessages(selectedInstance, selectedChat.id);
    } catch (err) {
      console.error('❌ ERRO FATAL ao enviar mensagem:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'N/A');
      console.groupEnd();
      setError('Erro ao enviar mensagem');
    }
  };

  // Carregar instâncias ao montar
  useEffect(() => {
    fetchInstances();
    
    // Polling de instâncias a cada 30 segundos
    const interval = setInterval(() => {
      fetchInstances();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Carregar chats quando selecionar instância
  useEffect(() => {
    if (selectedInstance) {
      fetchChats(selectedInstance);
    }
  }, [selectedInstance]);

  // Polling de mensagens quando selecionar chat
  useEffect(() => {
    if (selectedInstance && selectedChat) {
      fetchMessages(selectedInstance, selectedChat.id);
      
      // Polling de mensagens a cada 5 segundos
      const interval = setInterval(() => {
        fetchMessages(selectedInstance, selectedChat.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedInstance, selectedChat]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (selectedInstance) {
      fetchMessages(selectedInstance, chat.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com seletor de instância */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>💬</span> WhatsApp Chat
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Gerencie conversas de múltiplos números
            </p>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            {showDebug ? '🔧 Ocultar Debug' : '🔧 Debug API'}
          </button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-4">
            <WhatsAppDebug />
          </div>
        )}

        {/* Seletor de Instância */}
        {instances.length > 0 ? (
          <div className="flex items-center gap-4">
            <label className="text-white/80 font-medium">Número:</label>
            <select
              value={selectedInstance || ''}
              onChange={(e) => setSelectedInstance(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {instances.map((inst) => (
                <option key={inst.name} value={inst.name} className="bg-[#1a1a1a]">
                  {inst.profileName || inst.name} {inst.number ? `(${inst.number})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedInstance && fetchChats(selectedInstance)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              🔄 Atualizar
            </button>
            <button
              onClick={() => setShowTestMessage(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              📤 Enviar Teste
            </button>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 font-medium">⚠️ Nenhuma instância conectada</p>
            <p className="text-white/60 text-sm mt-1">
              Conecte uma instância no painel WhatsApp Manager primeiro
            </p>
          </div>
        )}

        {/* Mensagens de erro */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Grid de Chat (tipo WhatsApp Web) */}
      {selectedInstance && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Sidebar - Lista de Chats */}
          <div className="lg:col-span-1">
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={handleChatSelect}
              loading={loading}
            />
          </div>

          {/* Área Principal - Mensagens */}
          <div className="lg:col-span-2">
            <MessageView
              chat={selectedChat}
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
              instanceName={selectedInstance}
            />
          </div>
        </div>
      )}

      {/* Modal - Enviar Mensagem de Teste */}
      {showTestMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">📤 Enviar Mensagem de Teste</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 font-medium text-sm mb-1">💡 Por que enviar mensagem de teste?</p>
                <p className="text-white/70 text-xs">
                  A instância não tem conversas ainda. Envie uma mensagem para criar a primeira conversa e testar o sistema!
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Número do Destinatário *
                </label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="ex: 5511999999999"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                />
                <p className="text-white/40 text-xs mt-1">
                  Inclua código do país + DDD + número (ex: 5511999999999)
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 font-medium text-sm mb-1">⚠️ Importante</p>
                <ul className="text-white/70 text-xs space-y-1 list-disc list-inside">
                  <li>A mensagem será enviada do WhatsApp "{selectedInstance}"</li>
                  <li>O número deve ser válido e existir no WhatsApp</li>
                  <li>Após enviar, aguarde 3-5 segundos</li>
                  <li>A conversa aparecerá automaticamente na lista</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowTestMessage(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendTestMessage}
                  disabled={!testNumber.trim() || !testText.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📤 Enviar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


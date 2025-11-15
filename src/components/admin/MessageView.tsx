'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '@/types/whatsapp';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageViewProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  instanceName: string;
}

export function MessageView({ chat, messages, onSendMessage, loading, instanceName }: MessageViewProps) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp * 1000), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp?: number) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp * 1000), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getMessageText = (message: Message): string => {
    if (message.message?.conversation) {
      return message.message.conversation;
    }
    if (message.message?.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage) {
      return message.message.imageMessage.caption || '📷 Imagem';
    }
    if (message.message?.videoMessage) {
      return message.message.videoMessage.caption || '🎥 Vídeo';
    }
    if (message.message?.audioMessage) {
      return '🎵 Áudio';
    }
    if (message.message?.documentMessage) {
      return `📄 ${message.message.documentMessage.fileName || 'Documento'}`;
    }
    return '💬 Mensagem';
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(messageText);
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-white/60 mb-2">Selecione uma conversa</p>
          <p className="text-white/40 text-sm">
            Escolha uma conversa na lista para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 h-full flex flex-col overflow-hidden max-h-full">
      {/* Header do Chat */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        {chat.profilePicUrl ? (
          <img
            src={chat.profilePicUrl}
            alt={chat.name}
            className="w-12 h-12 rounded-full border-2 border-white/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            {chat.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-white font-bold flex items-center gap-2">
            {chat.name}
            {chat.isGroup && <span className="text-sm">👥 Grupo</span>}
          </h3>
          <p className="text-xs text-white/60">{chat.id ? chat.id.split('@')[0] : 'N/A'}</p>
        </div>
        <div className="text-white/40 text-sm">
          {messages.length} {messages.length === 1 ? 'mensagem' : 'mensagens'}
        </div>
      </div>

      {/* Área de Mensagens */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 custom-scrollbar bg-[#0a0a0a]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          minHeight: 0,
          maxHeight: '100%'
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-white/60">Carregando mensagens...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-white/60 mb-2">Nenhuma mensagem ainda</p>
              <p className="text-white/40 text-sm">
                Envie a primeira mensagem para começar
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // PROTEÇÃO: Verificar se a mensagem tem estrutura válida
              if (!message || typeof message !== 'object') {
                console.warn('⚠️ Mensagem inválida no índice', index, ':', message);
                return null;
              }
              
              if (!message.key) {
                console.warn('⚠️ Mensagem sem key no índice', index, ':', message);
                return null;
              }
              
              const isFromMe = message.key?.fromMe || false;
              const messageText = getMessageText(message);
              const time = formatMessageTime(message.messageTimestamp);
              
              // Mostrar data se for diferente da mensagem anterior
              const showDate = index === 0 || 
                formatMessageDate(messages[index - 1]?.messageTimestamp) !== formatMessageDate(message.messageTimestamp);

              return (
                <div key={message.key.id || index}>
                  {/* Separador de Data */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <p className="text-xs text-white/60">
                          {formatMessageDate(message.messageTimestamp)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mensagem */}
                  <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isFromMe
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {/* Nome do remetente (apenas em grupos e não for de mim) */}
                      {chat.isGroup && !isFromMe && (
                        <p className="text-xs font-semibold text-purple-300 mb-1">
                          {message.pushName || 'Desconhecido'}
                        </p>
                      )}
                      
                      {/* Texto da mensagem */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {messageText}
                      </p>
                      
                      {/* Hora e status */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">{time}</span>
                        {isFromMe && (
                          <span className="text-xs">
                            {message.status === 'READ' ? '✓✓' :
                             message.status === 'RECEIVED' ? '✓✓' :
                             message.status === 'SENT' ? '✓' :
                             '🕐'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
            title="Anexar mídia (em breve)"
            disabled
          >
            📎
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            disabled={sending}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? '⏳' : '📤'} Enviar
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Pressione Enter para enviar • Shift + Enter para nova linha
        </p>
      </div>

      {/* Scrollbar custom styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}


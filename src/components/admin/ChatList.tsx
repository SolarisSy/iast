'use client';

import { Chat } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  loading: boolean;
}

export function ChatList({ chats, selectedChat, onSelectChat, loading }: ChatListProps) {
  
  const formatTimestamp = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading && chats.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-white/60">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-white/60 mb-2">Nenhuma conversa ainda</p>
          <p className="text-white/40 text-sm">
            As conversas aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 h-full flex flex-col overflow-hidden max-h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">Conversas</h3>
        <p className="text-white/60 text-sm">{chats.length} {chats.length === 1 ? 'conversa' : 'conversas'}</p>
      </div>

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ minHeight: 0, maxHeight: '100%' }}>
        {chats.map((chat, index) => (
          <button
            key={chat.id || `chat-${index}`}
            onClick={() => onSelectChat(chat)}
            className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
              selectedChat?.id === chat.id ? 'bg-white/10' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {chat.profilePicUrl ? (
                  <img
                    src={chat.profilePicUrl}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(chat.name || 'UN')}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold truncate flex items-center gap-2">
                    {chat.name}
                    {chat.isGroup && <span className="text-xs">👥</span>}
                  </h4>
                  {chat.lastMessage && (
                    <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                      {formatTimestamp(chat.lastMessage.timestamp)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60 truncate">
                    {chat.lastMessage ? (
                      <>
                        {chat.lastMessage.fromMe && (
                          <span className="text-blue-400 mr-1">Você: </span>
                        )}
                        {chat.lastMessage.text}
                      </>
                    ) : (
                      <span className="italic">Sem mensagens</span>
                    )}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
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


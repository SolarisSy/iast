'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Message, MessageProps } from '@/components/chat/Message';
import { AudioControls } from '@/components/audio/AudioControls';
import { v4 as uuidv4 } from 'uuid';

export const Chat = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioResponseUrl, setAudioResponseUrl] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAudioMessage = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    // Parar e limpar qualquer áudio que esteja tocando
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setAudioResponseUrl(undefined);
    
    try {
      // Criar FormData para enviar o arquivo de áudio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('history', JSON.stringify(messages));

      const response = await fetch('http://localhost:4000/api/audio/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      console.log('Resposta recebida do backend:', data);
      
      // Adicionar mensagem do usuário (transcrição)
      const userMessage: MessageProps = {
        text: data.transcription,
        sender: 'user',
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Adicionar resposta do bot
      const botMessage: MessageProps = {
        text: data.reply,
        sender: 'bot',
        document: data.document,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // Criar URL para reprodução do áudio de resposta
      if (data.audioResponse) {
        console.log('Áudio recebido, criando URL...');
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioResponse), c => c.charCodeAt(0))
        ], { type: data.mimeType || 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('URL do áudio criada:', audioUrl);
        setAudioResponseUrl(audioUrl);
      }

    } catch (error) {
      console.error('Failed to process audio message:', error);
      const errorBotMessage: MessageProps = {
        text: 'Ocorreu um erro ao processar sua mensagem de áudio. Tente novamente.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    // Parar qualquer áudio que esteja tocando
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setAudioResponseUrl(undefined);

    const userMessage: MessageProps = {
      text: input,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const botMessage: MessageProps = {
        text: data.reply,
        sender: 'bot',
        document: data.document,
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Failed to fetch chat response:', error);
      const errorBotMessage: MessageProps = {
        text: 'Ocorreu um erro ao buscar a resposta. Tente novamente.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <h2 className="text-lg font-medium text-white/90 tracking-tight">Assistente Jurídico</h2>
        <p className="text-sm text-white/40 mt-1">Especialista em Direito Administrativo</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Comece uma conversa fazendo uma pergunta sobre processos administrativos disciplinares ou explore os tópicos disponíveis.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <Message key={uuidv4()} {...msg} />
          ))
        )}
        {(isLoading || isProcessingAudio) && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                {isProcessingAudio && (
                  <span className="text-white/60 text-xs ml-2">Processando áudio...</span>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-8 py-6 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
        {/* Controles de áudio */}
        <div className="mb-4">
          <AudioControls 
            onAudioMessage={handleAudioMessage}
            audioResponseUrl={audioResponseUrl}
            currentAudioRef={currentAudioRef}
            onError={(error) => {
              console.error('Audio error:', error);
              const errorBotMessage: MessageProps = {
                text: error,
                sender: 'bot',
              };
              setMessages(prevMessages => [...prevMessages, errorBotMessage]);
            }}
          />
        </div>

        {/* Input de texto */}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta..."
            disabled={isLoading || isProcessingAudio}
            className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl px-6 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50 border border-white/5"
          />
          <button
            type="submit"
            disabled={isLoading || isProcessingAudio || input.trim() === ''}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-all duration-200 text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

'use client';

import { useState } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';

interface AudioControlsProps {
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onAudioMessage: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  audioResponseUrl?: string;
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
}

export const AudioControls = ({ onRecordingStart, onRecordingStop, onAudioMessage, onError, audioResponseUrl, currentAudioRef }: AudioControlsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingStart = () => {
    console.log('🔴 AudioControls: Gravação INICIADA');
    onRecordingStart?.();
  };

  const handleRecordingStop = () => {
    console.log('⏹️ AudioControls: Gravação PARADA');
    onRecordingStop?.();
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      onAudioMessage(audioBlob);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      onError?.('Erro ao processar a gravação de áudio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controles de gravação */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-white/60 text-sm font-medium">Conversa por áudio</span>
          </div>
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span>Processando...</span>
            </div>
          )}
        </div>
        
        {/* Dica para melhor transcrição */}
        <div className="flex items-start gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-300/80 leading-relaxed">
            <strong>Dica:</strong> Fale frases completas com clareza e pause por 2-3 segundos antes de parar a gravação para melhor transcrição.
          </p>
        </div>
      </div>

      {/* Componente de gravação */}
      <AudioRecorder 
        onRecordingStart={handleRecordingStart}
        onRecordingStop={handleRecordingStop}
        onRecordingComplete={handleRecordingComplete}
        onError={onError}
      />

      {/* Player de áudio de resposta */}
      {audioResponseUrl && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-white/60 text-sm font-medium">Resposta em áudio</span>
          </div>
          <AudioPlayer 
            audioUrl={audioResponseUrl}
            currentAudioRef={currentAudioRef}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
};

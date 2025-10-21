'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  onPlaybackComplete?: () => void;
  onError?: (error: string) => void;
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
}

export const AudioPlayer = ({ audioUrl, onPlaybackComplete, onError, currentAudioRef }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Usar a ref compartilhada se fornecida, caso contrário usar a local
  const audioRef = currentAudioRef || localAudioRef;

  useEffect(() => {
    if (audioUrl) {
      // Parar qualquer áudio anterior
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setIsLoading(true);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setIsLoading(false);
        // Auto-play quando o áudio estiver carregado
        audio.play()
          .then(() => {
            setIsPlaying(true);
            console.log('Áudio iniciado automaticamente');
          })
          .catch(err => {
            console.error('Erro ao iniciar áudio automaticamente:', err);
            // Navegadores podem bloquear auto-play, mas o usuário pode clicar no botão
          });
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onPlaybackComplete?.();
      });

      audio.addEventListener('error', (e) => {
        console.error('Erro no player de áudio:', e);
        setIsLoading(false);
        setIsPlaying(false);
        onError?.('Erro ao reproduzir o áudio');
      });

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('error', () => {});
      };
    }
  }, [audioUrl, onPlaybackComplete, onError]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60"></div>
        <span className="text-white/60 text-sm">Carregando áudio...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg">
      <button
        onClick={togglePlayback}
        disabled={!audioRef.current}
        className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 disabled:opacity-50"
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 bg-white/10 rounded-full h-1">
            <div 
              className="bg-white/60 h-1 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

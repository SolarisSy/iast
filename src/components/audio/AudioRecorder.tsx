'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

export const AudioRecorder = ({ onRecordingComplete, onError }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verificar permissão de microfone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const startRecording = async () => {
    try {
      // Solicitar áudio com melhor qualidade
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Alta qualidade
          channelCount: 1 // Mono é suficiente para voz
        } 
      });
      
      // Verificar se o navegador suporta audio/wav, senão usar webm
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128 kbps para boa qualidade
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        onRecordingComplete(audioBlob);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer para mostrar tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      onError?.('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-sm">
          Permissão de microfone negada. Ative o acesso ao microfone para usar a gravação de áudio.
        </p>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
        <p className="ml-2 text-white/60 text-sm">Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <span className="text-sm font-medium">Gravar</span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
            <span className="text-sm font-medium">Parar</span>
          </button>
        </div>
      )}
    </div>
  );
};

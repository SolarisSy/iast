'use client';

import { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
}

const videos: Video[] = [
  {
    id: 'vd1',
    title: 'Princípios do Direito Administrativo',
    videoUrl: '/video/vd1.mp4',
  },
  {
    id: 'vd2',
    title: 'As normas que regulam a atividade administrativa',
    videoUrl: '/video/vd2.mp4',
  },
];

export const VideoLibrary = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedVideo(null);
  };

  // Adicionar listener para tecla ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPlayerOpen) {
        handleClosePlayer();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPlayerOpen]);

  return (
    <>
      <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white/90 tracking-tight">Aulas do Mentor</h2>
              <p className="text-xs text-white/40 mt-0.5">{videos.length} vídeos disponíveis</p>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className="w-full group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/20 transition-all duration-300 text-left shadow-lg hover:shadow-blue-500/10"
            >
              {/* Video Thumbnail Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Pulsating Ring */}
                  <div className="absolute w-16 h-16 rounded-full bg-white/10 animate-ping opacity-75"></div>
                  
                  {/* Main Play Button */}
                  <div className="relative w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border-2 border-white/40 group-hover:border-white/70 group-hover:bg-black/70 transition-all duration-300 group-hover:scale-110 shadow-xl">
                    <svg className="w-7 h-7 text-white ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Duration Badge (Optional - can be hardcoded or dynamic) */}
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
                  <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Vídeo
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Video Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-relaxed mb-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Aula completa</span>
                </div>
              </div>
            </button>
          ))}

          {/* Special Card - Request Exclusive Class */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 shadow-lg p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)] animate-pulse"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-emerald-400/90 mb-2 leading-relaxed">
                  Solicitar uma aula exclusiva do nosso mentor Anderson Silva I.A
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Solicite conteúdo personalizado sobre temas específicos
                </p>
              </div>

              {/* Badge */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Em breve</span>
                </div>
              </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Clique em um vídeo para assistir</span>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {isPlayerOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-6xl bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <div>
                <h3 className="text-lg font-semibold text-white/90">{selectedVideo.title}</h3>
                <p className="text-sm text-white/40 mt-1">Aulas do Mentor</p>
              </div>
              <button
                onClick={handleClosePlayer}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full"
                src={selectedVideo.videoUrl}
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-gradient-to-t from-white/[0.02] to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Use ESC para fechar</span>
                </div>
                <button
                  onClick={handleClosePlayer}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


'use client';

export const VideoLibrary = () => {
  return (
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
              <p className="text-xs text-white/40 mt-0.5">Conteúdo em breve</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
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
                  Solicitar consultoria técnica exclusiva com Allan Fraga
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Solicite análise personalizada sobre equipamentos e aplicações
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
      </div>
  );
};


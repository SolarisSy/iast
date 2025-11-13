import { Chat } from "@/components/chat/Chat";
import Avatar from "@/components/avatar/Avatar";
import { VideoLibrary } from "@/components/video/VideoLibrary";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Admin Link */}
        <div className="flex justify-end mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-sm"
          >
            <span>⚙️</span>
            <span>Painel Admin</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-light text-white/90 tracking-tight mb-3">
            Consultoria Técnica-Comercial Especializada
          </h1>
          <p className="text-sm text-white/40">
            Ensaios Não Destrutivos • Metrologia • Inspeção de Materiais • Metalografia
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Avatar Section */}
          <div className="lg:col-span-2 flex flex-col items-center gap-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl">
              <Avatar />
            </div>
            <div className="text-center">
              <h2 className="text-sm md:text-base font-medium text-white/80 mb-1">Allan Fraga</h2>
              <p className="text-xs text-white/40">Consultor Técnico-Comercial</p>
              <p className="text-xs text-white/30 mt-1">END • Metrologia • Metalografia</p>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-7">
            <Chat />
          </div>

          {/* Video Library Section */}
          <div className="lg:col-span-3">
            <div className="sticky top-4 h-[calc(100vh-8rem)]">
              <VideoLibrary />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

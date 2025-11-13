'use client';

import { useEffect, useState, memo } from 'react';

interface QRCodeDisplayProps {
  qrCode: string;
  instanceName: string;
  onClose: () => void;
  onRefresh: () => void;
}

function QRCodeDisplayComponent({ qrCode, instanceName, onClose, onRefresh }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');

  const getSizeClass = () => {
    switch (qrSize) {
      case 'small': return 'max-w-[200px]';
      case 'medium': return 'max-w-[280px]';
      case 'large': return 'max-w-[350px]';
      default: return 'max-w-[280px]';
    }
  };

  // Contador regressivo
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, onRefresh]);

  // Verificar se é base64 ou código de texto
  const isBase64 = qrCode.startsWith('data:image') || qrCode.startsWith('iVBOR') || qrCode.length > 500;
  const qrImageSrc = isBase64 
    ? qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`
    : null;

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">QR Code de Conexão</h3>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          title="Fechar"
        >
          ✕
        </button>
      </div>

      {/* Informações da Instância */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
        <p className="text-purple-400 font-medium">Instância: {instanceName}</p>
        <p className="text-sm text-white/60 mt-1">
          Escaneie o QR Code com o WhatsApp no seu celular
        </p>
      </div>

      {/* Controle de Tamanho do QR Code */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="text-white/60 text-xs">Tamanho:</span>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setQrSize('small')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              qrSize === 'small' 
                ? 'bg-purple-600 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Pequeno
          </button>
          <button
            onClick={() => setQrSize('medium')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              qrSize === 'medium' 
                ? 'bg-purple-600 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Médio
          </button>
          <button
            onClick={() => setQrSize('large')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              qrSize === 'large' 
                ? 'bg-purple-600 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Grande
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-xl p-6 mb-4 flex items-center justify-center">
        {qrImageSrc ? (
          <img
            src={qrImageSrc}
            alt="QR Code"
            className={`w-full ${getSizeClass()} h-auto mx-auto transition-all duration-300`}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className={`text-center text-black p-4 break-all font-mono text-xs ${getSizeClass()}`}>
            {qrCode}
          </div>
        )}
      </div>

      {/* Aviso Importante */}
      <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
        <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          MUITO IMPORTANTE - LEIA ANTES!
        </p>
        <div className="space-y-2 text-xs">
          <div className="bg-black/30 rounded p-2">
            <p className="font-semibold text-white mb-1">🚫 NÃO FAÇA ISSO:</p>
            <ul className="list-disc list-inside space-y-1 text-white/80 ml-2">
              <li><strong>NÃO escaneie o QR Code múltiplas vezes</strong></li>
              <li><strong>NÃO fique na tela "Conectando..." no celular</strong></li>
              <li>NÃO clique em "Atualizar" sem necessidade</li>
              <li>NÃO tente reconectar se já escaneou</li>
            </ul>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/40 rounded p-2">
            <p className="font-semibold text-green-300 mb-1">✅ PASSO A PASSO CORRETO:</p>
            <ol className="list-decimal list-inside space-y-1 text-white/90 ml-2">
              <li><strong>Escaneie o QR Code UMA VEZ</strong></li>
              <li><strong>FECHE o WhatsApp no celular imediatamente</strong></li>
              <li>Ou volte para tela inicial do celular</li>
              <li>Aguarde até 2 minutos</li>
              <li>Verifique aqui se conectou ✅</li>
            </ol>
          </div>

          <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded p-2">
            <p className="font-bold text-blue-300 mb-1">💡 DICA IMPORTANTE:</p>
            <p className="text-white/90">
              Após escanear, <strong className="text-blue-300">FECHE o WhatsApp</strong> no celular! 
              Se ficar na tela "Conectando...", pode dar timeout e erro.
            </p>
          </div>

          <p className="text-yellow-300 font-bold text-center bg-yellow-500/10 border border-yellow-500/30 rounded py-2 px-3">
            ⏰ Escanear múltiplas vezes OU ficar na tela "Conectando..." causa TIMEOUT!
          </p>
        </div>
      </div>

      {/* Contador e Controles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">
            Auto-refresh em: <span className="text-white font-bold">{timeLeft}s</span>
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-white/80 text-sm">Auto-refresh</span>
          </label>
        </div>

        <button
          onClick={() => {
            onRefresh();
            setTimeLeft(60);
          }}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🔄</span> Atualizar QR Code
        </button>
      </div>

      {/* Instruções */}
      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 font-medium text-sm mb-2">📱 Como conectar:</p>
        <ol className="text-white/60 text-xs space-y-1 list-decimal list-inside">
          <li>Abra o WhatsApp no celular</li>
          <li>Toque em Menu (⋮) ou Configurações</li>
          <li>Toque em "Aparelhos conectados"</li>
          <li>Toque em "Conectar um aparelho"</li>
          <li>Aponte para este QR Code</li>
        </ol>
      </div>
    </div>
  );
}

// Usar memo para evitar re-renderizações desnecessárias
export const QRCodeDisplay = memo(QRCodeDisplayComponent);

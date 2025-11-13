'use client';

import { useState } from 'react';

export function WhatsAppDebug() {
  const [instanceName, setInstanceName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'https://list-2-evolution-api.zqprdy.easypanel.host';
  const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';

  const testConnection = async () => {
    if (!instanceName.trim()) {
      setError('Digite o nome da instância');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Testar conexão básica
      console.log('🔍 Testando conexão com:', `${API_URL}/chat/findChats/${instanceName}`);
      
      const response = await fetch(`${API_URL}/chat/findChats/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
        },
        body: JSON.stringify({
          where: {}
        }),
      });

      const text = await response.text();
      console.log('📤 Resposta (texto):', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      });

      if (!response.ok) {
        setError(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4">🔧 Diagnóstico de API</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Nome da Instância:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="ex: atendimento"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Testando...' : '🔍 Testar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium">❌ {error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${result.ok ? '✅' : '❌'}`}>
                {result.ok ? '✅' : '❌'}
              </span>
              <span className="text-white font-bold">
                Status: {result.status} {result.statusText}
              </span>
            </div>

            <div>
              <p className="text-white/60 text-sm font-medium mb-2">Resposta:</p>
              <pre className="bg-black/50 rounded p-3 text-xs text-white/80 overflow-auto max-h-64">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>

            <div>
              <p className="text-white/60 text-sm font-medium mb-2">Headers:</p>
              <pre className="bg-black/50 rounded p-3 text-xs text-white/80 overflow-auto max-h-32">
                {JSON.stringify(result.headers, null, 2)}
              </pre>
            </div>

            {result.ok && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 font-medium text-sm">
                  ✅ Conexão funcionando! Endpoint correto.
                </p>
              </div>
            )}

            {!result.ok && result.status === 404 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 font-medium text-sm mb-2">
                  ⚠️ Possíveis causas do erro 404:
                </p>
                <ul className="text-white/70 text-sm space-y-1 ml-4 list-disc">
                  <li>Instância não existe ou nome incorreto</li>
                  <li>Instância está desconectada</li>
                  <li>URL da API está incorreta</li>
                  <li>Endpoint foi alterado na versão da API</li>
                </ul>
              </div>
            )}

            {!result.ok && result.status === 401 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 font-medium text-sm mb-2">
                  🔐 Erro de autenticação:
                </p>
                <ul className="text-white/70 text-sm space-y-1 ml-4 list-disc">
                  <li>API Key está incorreta ou expirada</li>
                  <li>Verificar variável NEXT_PUBLIC_EVOLUTION_API_KEY</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 font-medium text-sm mb-2">💡 Configuração Atual:</p>
          <div className="space-y-1 text-xs">
            <p className="text-white/70">
              <span className="text-white/40">API URL:</span> {API_URL}
            </p>
            <p className="text-white/70">
              <span className="text-white/40">API KEY:</span> {API_KEY ? `${API_KEY.substring(0, 10)}...` : '❌ Não configurada'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

